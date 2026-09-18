-- Per-user Akahu access, replacing the single AKAHU_USER_TOKEN from the
-- server environment.
--
-- That env token was the Tier 0 "Personal App" shape: one token, one person,
-- read from process.env on every sync. It cannot carry a second user, and
-- Akahu's Tier 2 accreditation requires each consumer to grant and revoke
-- their own access through the hosted OAuth flow. So the token becomes a row.
--
-- A row holding a live bank credential needs a stricter rule than the rest of
-- the schema. Every other table here is owner-readable, because the owner is
-- allowed to see their own transactions. Nobody is allowed to see this one:
-- the ciphertext never has a reason to reach a browser, and the browser holds
-- the key to nothing. So RLS is enabled and NO policy is created. Postgres
-- denies by default, which makes the table unreachable with the publishable
-- key under any session. The server reaches it with the secret key, which
-- bypasses RLS, and only from lib/akahu/token.ts.

create table public.akahu_tokens (
  user_id           uuid primary key references auth.users (id) on delete cascade,
  -- AES-256-GCM over the Akahu user access token. Never the token itself:
  -- a database backup, a log of a row, or a leaked read is then ciphertext
  -- and nothing more. The key lives in AKAHU_TOKEN_KEY, server env only.
  ciphertext        text not null,
  iv                text not null,
  auth_tag          text not null,
  -- Which key encrypted this row, so the key can be rotated without guessing.
  key_version       smallint not null default 1,
  -- Akahu's own id for the grant, needed to revoke it.
  akahu_user_id     text,
  scopes            text not null default 'ENDURING_CONSENT',
  connected_at      timestamptz not null default now(),
  last_used_at      timestamptz,
  -- Set when Akahu answers 401 or the TOKEN DELETE webhook arrives. The row
  -- is kept, not deleted, so the UI can tell the user their bank feed stopped
  -- and send them back through the flow.
  revoked_at        timestamptz
);

alter table public.akahu_tokens enable row level security;

-- Deliberately no policy. See the comment above.

comment on table public.akahu_tokens is
  'Encrypted per-user Akahu access tokens. RLS on with no policy: unreachable '
  'with the publishable key. Server-only, via the Supabase secret key.';

-- The OAuth `state` parameter, held server-side for the length of one connect
-- flow. Akahu Tier 2 requires state to be used correctly against CSRF on the
-- callback; storing the issued value means the callback can prove the state it
-- was handed is one this server issued to this user, not merely one that
-- round-tripped through the browser.
create table public.akahu_oauth_state (
  state       text primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  -- Single use: the callback consumes the row.
  used_at     timestamptz
);

alter table public.akahu_oauth_state enable row level security;
-- Also no policy: issued and consumed server-side only.

create index akahu_oauth_state_created_idx on public.akahu_oauth_state (created_at);

-- --------------------------------------------------------------------------
-- Connection status needs one more value now that revocation is real.
-- bank_connections.status is free text, so this is a check rather than a type
-- change, and it names the set the app actually writes.
-- --------------------------------------------------------------------------
alter table public.bank_connections
  add constraint bank_connections_status_check
  check (status in ('active', 'needs_reauth', 'consent_expiring', 'error', 'revoked', 'inactive'));

-- --------------------------------------------------------------------------
-- Retention. The Privacy Act 2020 allows Akahu-sourced data to be held only
-- as long as the product reasonably needs it, so "reasonably needed" is
-- written down here rather than left to whoever remembers.
--
-- The product shows a year of spending, so transactions older than 24 months
-- (a year of history plus a year of comparison) are past their purpose. The
-- routine is a function rather than a one-off delete so it can be scheduled
-- with pg_cron and run on demand from the account-deletion path.
-- --------------------------------------------------------------------------
create or replace function public.purge_expired_bank_data()
returns table (deleted_transactions bigint)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  removed bigint;
begin
  delete from public.transactions
  where posted_at < now() - interval '24 months';
  get diagnostics removed = row_count;
  return query select removed;
end;
$$;

comment on function public.purge_expired_bank_data is
  'Retention routine for Akahu-sourced data (Privacy Act 2020). Drops '
  'transactions past the 24-month window the product needs.';

-- Deleting everything one user''s bank feed produced: used when they revoke
-- access or delete their account. Their manual figures are not bank data and
-- are left alone; this drops only what came from Akahu.
create or replace function public.purge_user_bank_data(target uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  delete from public.transactions      where user_id = target;
  delete from public.sync_state        where user_id = target;
  delete from public.bank_accounts     where user_id = target;
  delete from public.bank_connections  where user_id = target;
end;
$$;
