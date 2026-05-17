-- afterwise: initial schema
-- enum + decisions + decision_analyses + indexes
-- snake_case columns (TS layer maps to camelCase)

create type public.decision_status as enum ('processing', 'done', 'error');

create table public.decisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  situation text not null check (char_length(situation) between 10 and 4000),
  decision text not null check (char_length(decision) between 5 and 2000),
  reasoning text check (reasoning is null or char_length(reasoning) <= 4000),
  status public.decision_status not null default 'processing',
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index decisions_user_id_created_at_idx
  on public.decisions (user_id, created_at desc);

create index decisions_user_id_status_idx
  on public.decisions (user_id, status);

create table public.decision_analyses (
  decision_id uuid primary key references public.decisions (id) on delete cascade,
  category text not null,
  cognitive_biases jsonb not null default '[]'::jsonb,
  missed_alternatives jsonb not null default '[]'::jsonb,
  summary text not null,
  model_id text not null,
  created_at timestamptz not null default now()
);

create index decision_analyses_category_idx
  on public.decision_analyses (category);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger decisions_set_updated_at
before update on public.decisions
for each row
execute function public.set_updated_at();
