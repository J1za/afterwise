-- afterwise: single-query dashboard stats RPC
-- returns aggregated counts for the current user in one round trip

create or replace function public.dashboard_stats()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  with mine as (
    select d.id, d.status, d.created_at, da.category, da.cognitive_biases
    from public.decisions d
    left join public.decision_analyses da on da.decision_id = d.id
    where d.user_id = (select auth.uid())
  ),
  totals as (
    select
      count(*)::int as total,
      count(*) filter (where status = 'processing')::int as processing,
      count(*) filter (where status = 'done')::int as done,
      count(*) filter (where status = 'error')::int as errored
    from mine
  ),
  by_category as (
    select coalesce(jsonb_agg(jsonb_build_object('category', category, 'count', cnt) order by cnt desc), '[]'::jsonb) as data
    from (
      select category, count(*)::int as cnt
      from mine
      where category is not null
      group by category
    ) c
  ),
  by_bias as (
    select coalesce(jsonb_agg(jsonb_build_object('bias', bias, 'count', cnt) order by cnt desc), '[]'::jsonb) as data
    from (
      select bias_entry ->> 'name' as bias, count(*)::int as cnt
      from mine, jsonb_array_elements(coalesce(cognitive_biases, '[]'::jsonb)) as bias_entry
      where cognitive_biases is not null
      group by bias_entry ->> 'name'
    ) b
  ),
  by_month as (
    select coalesce(jsonb_agg(jsonb_build_object('month', month, 'count', cnt) order by month asc), '[]'::jsonb) as data
    from (
      select to_char(date_trunc('month', created_at), 'YYYY-MM') as month, count(*)::int as cnt
      from mine
      group by date_trunc('month', created_at)
    ) m
  )
  select jsonb_build_object(
    'totals', to_jsonb(totals.*),
    'byCategory', by_category.data,
    'byBias', by_bias.data,
    'byMonth', by_month.data
  )
  from totals, by_category, by_bias, by_month;
$$;

grant execute on function public.dashboard_stats() to authenticated;
