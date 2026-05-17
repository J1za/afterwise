-- afterwise: RLS policies + realtime publication
-- every row scoped to auth.uid()

alter table public.decisions enable row level security;
alter table public.decision_analyses enable row level security;

create policy "decisions_select_own"
  on public.decisions for select
  using ((select auth.uid()) = user_id);

create policy "decisions_insert_own"
  on public.decisions for insert
  with check ((select auth.uid()) = user_id);

create policy "decisions_update_own"
  on public.decisions for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "decisions_delete_own"
  on public.decisions for delete
  using ((select auth.uid()) = user_id);

create policy "decision_analyses_select_own"
  on public.decision_analyses for select
  using (
    exists (
      select 1
      from public.decisions d
      where d.id = decision_analyses.decision_id
        and d.user_id = (select auth.uid())
    )
  );

create policy "decision_analyses_insert_own"
  on public.decision_analyses for insert
  with check (
    exists (
      select 1
      from public.decisions d
      where d.id = decision_analyses.decision_id
        and d.user_id = (select auth.uid())
    )
  );

create policy "decision_analyses_update_own"
  on public.decision_analyses for update
  using (
    exists (
      select 1
      from public.decisions d
      where d.id = decision_analyses.decision_id
        and d.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.decisions d
      where d.id = decision_analyses.decision_id
        and d.user_id = (select auth.uid())
    )
  );

alter publication supabase_realtime add table public.decisions;
alter publication supabase_realtime add table public.decision_analyses;
