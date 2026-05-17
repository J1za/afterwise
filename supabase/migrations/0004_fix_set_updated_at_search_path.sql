-- afterwise: harden set_updated_at trigger function with explicit empty search_path
-- addresses lint 0011_function_search_path_mutable

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
