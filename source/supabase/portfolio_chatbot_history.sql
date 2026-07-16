create table if not exists public.portfolio_chatbot_history (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  role text not null check (role in ('user', 'assistant')),
  message text not null,
  language text not null default 'en' check (language in ('en', 'de')),
  intent_id text,
  topic text,
  page_url text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists portfolio_chatbot_history_session_idx
  on public.portfolio_chatbot_history (session_id, created_at);

create index if not exists portfolio_chatbot_history_created_idx
  on public.portfolio_chatbot_history (created_at desc);

alter table public.portfolio_chatbot_history enable row level security;

grant usage on schema public to anon, authenticated;
grant insert on public.portfolio_chatbot_history to anon;
grant select, delete on public.portfolio_chatbot_history to authenticated;

drop policy if exists "Public can insert chatbot history" on public.portfolio_chatbot_history;
create policy "Public can insert chatbot history"
  on public.portfolio_chatbot_history
  for insert
  to anon
  with check (
    role in ('user', 'assistant')
    and length(trim(message)) between 1 and 4000
    and length(trim(session_id)) between 8 and 140
  );

drop policy if exists "Admin can read chatbot history" on public.portfolio_chatbot_history;
create policy "Admin can read chatbot history"
  on public.portfolio_chatbot_history
  for select
  to authenticated
  using (
    lower(coalesce(auth.jwt() ->> 'email', '')) in (
      'soorajsudhakaran1199@gmail.com',
      'soorajsudhakaran4@gmail.com'
    )
  );

drop policy if exists "Admin can delete chatbot history" on public.portfolio_chatbot_history;
create policy "Admin can delete chatbot history"
  on public.portfolio_chatbot_history
  for delete
  to authenticated
  using (
    lower(coalesce(auth.jwt() ->> 'email', '')) in (
      'soorajsudhakaran1199@gmail.com',
      'soorajsudhakaran4@gmail.com'
    )
  );

create or replace function public.get_portfolio_chatbot_history(max_rows integer default 1000)
returns table (
  id uuid,
  session_id text,
  role text,
  message text,
  language text,
  intent_id text,
  topic text,
  page_url text,
  user_agent text,
  metadata jsonb,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    history.id,
    history.session_id,
    history.role,
    history.message,
    history.language,
    history.intent_id,
    history.topic,
    history.page_url,
    history.user_agent,
    history.metadata,
    history.created_at
  from public.portfolio_chatbot_history as history
  where lower(coalesce(auth.jwt() ->> 'email', '')) in (
    'soorajsudhakaran1199@gmail.com',
    'soorajsudhakaran4@gmail.com'
  )
  order by history.created_at desc
  limit least(greatest(coalesce(max_rows, 1000), 1), 5000);
$$;

grant execute on function public.get_portfolio_chatbot_history(integer) to authenticated;

create or replace function public.delete_portfolio_chatbot_session(target_session_id text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) not in (
    'soorajsudhakaran1199@gmail.com',
    'soorajsudhakaran4@gmail.com'
  ) then
    raise exception 'Not authorized to delete chatbot history';
  end if;

  delete from public.portfolio_chatbot_history
  where session_id = target_session_id;

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

grant execute on function public.delete_portfolio_chatbot_session(text) to authenticated;
