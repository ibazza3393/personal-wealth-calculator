-- Per-user Akahu access tokens, from the OAuth2 flow.
--
-- This table has row-level security enabled and DELIBERATELY NO POLICIES.
-- Every other table grants `authenticated` access to its own rows, which is
-- right for ledger data the browser has to render. It is wrong here: these
-- tokens read someone's bank accounts, and a policy would let the browser
-- fetch its own token straight out of PostgREST with the publishable key.
create table public.akahu_tokens (
  user_id       uuid primary key references auth.users (id) on delete cascade,
  -- Encrypted before it reaches this column; see lib/crypto.ts.
  access_token  text not null,
  scope         text,
  akahu_user_id text,
  connected_at  timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.akahu_tokens enable row level security;

-- No policies on purpose. Adding one would hand the token to the browser.

-- The grants go too, so the protection does not rest on a single mistake:
-- if a permissive policy is ever added by accident, the missing grant still
-- stops the browser reading a bank token.
revoke all on table public.akahu_tokens from anon, authenticated;

comment on table public.akahu_tokens is
  'Akahu OAuth access tokens. RLS on with no policies: service-role only, never readable by the browser.';
