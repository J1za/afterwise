-- afterwise: fix infinite recursion in decisions_insert_own policy
-- the previous version did `select count(*) from decisions ...` inside the
-- INSERT policy, which re-triggers RLS on `decisions` and recurses.
-- move the count into a SECURITY DEFINER helper that bypasses RLS.

create or replace function public.user_decision_count(uid uuid)
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::int from public.decisions where user_id = uid;
$$;

revoke all on function public.user_decision_count(uuid) from public;
grant execute on function public.user_decision_count(uuid) to authenticated;

drop policy if exists "decisions_insert_own" on public.decisions;

create policy "decisions_insert_own"
  on public.decisions for insert
  with check (
    (select auth.uid()) = user_id
    and (
      (select coalesce(auth.jwt() ->> 'is_anonymous', 'false'))::boolean = false
      or public.user_decision_count((select auth.uid())) = 0
    )
  );
