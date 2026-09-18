-- A re-sync re-sends Akahu's own category for every row it returns. If the
-- user has corrected a category, that correction must survive the next sync.
-- Enforcing it in a trigger rather than in the API means no future caller can
-- forget: any path that updates the row obeys the same rule.
create or replace function public.keep_locked_category()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if old.kind_locked then
    new.kind := old.kind;
    new.kind_locked := true;
  end if;
  return new;
end;
$$;

create trigger transactions_keep_locked_category
  before update on public.transactions
  for each row
  execute function public.keep_locked_category();
