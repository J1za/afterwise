-- afterwise: store the locale the user used when creating a decision
-- so LLM analysis (and retries) respond in the same language.

alter table public.decisions
  add column if not exists language text not null default 'uk';
