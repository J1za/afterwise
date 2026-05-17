-- afterwise: limit anonymous users to 1 decision insert
-- (replaces the original decisions_insert_own policy with a version that adds the limit)

drop policy if exists "decisions_insert_own" on public.decisions;

create policy "decisions_insert_own"
  on public.decisions for insert
  with check (
    (select auth.uid()) = user_id
    and (
      (select coalesce(auth.jwt() ->> 'is_anonymous', 'false'))::boolean = false
      or (
        select count(*) from public.decisions where user_id = (select auth.uid())
      ) = 0
    )
  );
