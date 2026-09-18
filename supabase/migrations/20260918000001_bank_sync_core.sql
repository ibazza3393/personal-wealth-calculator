-- Bank data synced from Akahu. Every table is keyed to auth.users and is
-- readable only by its owner: this database holds real transaction history,
-- so row-level security is part of the schema, not a later pass.

create table public.bank_connections (
  id                 text primary key,
  user_id            uuid not null references auth.users (id) on delete cascade,
  provider           text not null default 'akahu',
  country            text not null default 'NZ',
  institution_name   text not null,
  status             text not null default 'active',
  last_synced_at     timestamptz,
  consent_expires_at timestamptz,
  created_at         timestamptz not null default now()
);

create table public.bank_accounts (
  id                text primary key,
  user_id           uuid not null references auth.users (id) on delete cascade,
  connection_id     text not null references public.bank_connections (id) on delete cascade,
  country           text not null default 'NZ',
  type              text not null,
  name              text not null,
  institution       text not null,
  currency          text not null default 'NZD',
  -- Money is stored in minor units. Floating point has no business holding a
  -- balance: 0.1 + 0.2 is not 0.3, and these figures are summed constantly.
  current_cents     bigint not null default 0,
  available_cents   bigint,
  updated_at        timestamptz not null default now()
);

create table public.transactions (
  id            text primary key,
  user_id       uuid not null references auth.users (id) on delete cascade,
  account_id    text not null references public.bank_accounts (id) on delete cascade,
  posted_at     timestamptz not null,
  -- Signed: negative is money leaving. Keeping the sign rather than a separate
  -- direction column means a sum is just a sum.
  amount_cents  bigint not null,
  currency      text not null default 'NZD',
  description   text not null,
  merchant      text,
  -- What Akahu called it, kept verbatim so a mapping change can be replayed
  -- without re-fetching.
  source_group  text,
  source_name   text,
  -- Our bucket, from EXPENSE_GROUPS. Null until categorised.
  kind          text,
  -- Set when the user overrides the mapping; never overwritten by a sync.
  kind_locked   boolean not null default false,
  created_at    timestamptz not null default now()
);

-- Sync is incremental, so each account remembers how far it has been read.
create table public.sync_state (
  user_id        uuid not null references auth.users (id) on delete cascade,
  account_id     text not null references public.bank_accounts (id) on delete cascade,
  last_synced_at timestamptz,
  cursor         text,
  primary key (user_id, account_id)
);

-- The two queries this app actually runs: a date-ordered ledger per account,
-- and a month of spending across all accounts.
create index transactions_user_posted_idx on public.transactions (user_id, posted_at desc);
create index transactions_account_posted_idx on public.transactions (account_id, posted_at desc);
create index bank_accounts_user_idx on public.bank_accounts (user_id);
create index bank_connections_user_idx on public.bank_connections (user_id);

alter table public.bank_connections enable row level security;
alter table public.bank_accounts   enable row level security;
alter table public.transactions    enable row level security;
alter table public.sync_state      enable row level security;

-- One policy per table, all the same shape: you touch your rows and nobody
-- else's. auth.uid() is wrapped in a select so the planner evaluates it once
-- per statement rather than once per row.
create policy bank_connections_owner on public.bank_connections
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy bank_accounts_owner on public.bank_accounts
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy transactions_owner on public.transactions
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy sync_state_owner on public.sync_state
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
