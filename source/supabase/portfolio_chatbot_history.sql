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
  using ((auth.jwt() ->> 'email') = 'soorajsudhakaran1199@gmail.com');

drop policy if exists "Admin can delete chatbot history" on public.portfolio_chatbot_history;
create policy "Admin can delete chatbot history"
  on public.portfolio_chatbot_history
  for delete
  to authenticated
  using ((auth.jwt() ->> 'email') = 'soorajsudhakaran1199@gmail.com');
