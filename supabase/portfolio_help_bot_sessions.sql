create table if not exists public.portfolio_help_bot_sessions (
  session_id text primary key,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  ended_at timestamptz,
  page_path text,
  role_id text,
  visitor_name text,
  visitor_position text,
  visitor_organization text,
  student_university text,
  message_count integer not null default 0,
  transcript_json jsonb not null default '[]'::jsonb,
  constraint portfolio_help_bot_sessions_message_count_check
    check (message_count >= 0 and message_count <= 120),
  constraint portfolio_help_bot_sessions_transcript_array_check
    check (jsonb_typeof(transcript_json) = 'array')
);

create index if not exists portfolio_help_bot_sessions_updated_at_idx
  on public.portfolio_help_bot_sessions (updated_at desc);

create index if not exists portfolio_help_bot_sessions_role_updated_idx
  on public.portfolio_help_bot_sessions (role_id, updated_at desc);

alter table public.portfolio_help_bot_sessions enable row level security;

drop policy if exists "Public can insert chatbot sessions" on public.portfolio_help_bot_sessions;
create policy "Public can insert chatbot sessions"
on public.portfolio_help_bot_sessions
for insert
with check (
  length(trim(coalesce(session_id, ''))) > 0
  and message_count between 0 and 120
  and jsonb_typeof(transcript_json) = 'array'
);

drop policy if exists "Public can update chatbot sessions" on public.portfolio_help_bot_sessions;
create policy "Public can update chatbot sessions"
on public.portfolio_help_bot_sessions
for update
using (true)
with check (
  length(trim(coalesce(session_id, ''))) > 0
  and message_count between 0 and 120
  and jsonb_typeof(transcript_json) = 'array'
);

drop policy if exists "Admin can read chatbot sessions" on public.portfolio_help_bot_sessions;
create policy "Admin can read chatbot sessions"
on public.portfolio_help_bot_sessions
for select
to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'soorajsudhakaran4@gmail.com');

drop policy if exists "Admin can delete chatbot sessions" on public.portfolio_help_bot_sessions;
create policy "Admin can delete chatbot sessions"
on public.portfolio_help_bot_sessions
for delete
to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'soorajsudhakaran4@gmail.com');
