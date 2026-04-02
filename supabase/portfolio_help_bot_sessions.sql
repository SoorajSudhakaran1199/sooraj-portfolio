begin;

-- Fresh rebuild for help-bot session storage only.
-- This deletes only help-bot data and recreates a one-row-per-chat session table.

drop table if exists public.portfolio_help_bot_sessions cascade;

create table public.portfolio_help_bot_sessions (
  session_id text primary key,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  ended_at timestamptz,
  page_path text not null default '/',
  role_id text,
  visitor_name text,
  visitor_position text,
  visitor_organization text,
  student_university text,
  message_count integer not null default 0,
  transcript_json jsonb not null default '[]'::jsonb,
  constraint portfolio_help_bot_sessions_session_id_check
    check (length(trim(coalesce(session_id, ''))) >= 8),
  constraint portfolio_help_bot_sessions_page_path_check
    check (length(trim(coalesce(page_path, ''))) >= 1 and length(page_path) <= 240),
  constraint portfolio_help_bot_sessions_message_count_check
    check (message_count >= 0 and message_count <= 120),
  constraint portfolio_help_bot_sessions_transcript_array_check
    check (jsonb_typeof(transcript_json) = 'array'),
  constraint portfolio_help_bot_sessions_transcript_size_check
    check (jsonb_array_length(transcript_json) <= 120),
  constraint portfolio_help_bot_sessions_transcript_count_match_check
    check (jsonb_array_length(transcript_json) = message_count),
  constraint portfolio_help_bot_sessions_role_id_length_check
    check (role_id is null or length(role_id) <= 60),
  constraint portfolio_help_bot_sessions_visitor_name_length_check
    check (visitor_name is null or length(visitor_name) <= 120),
  constraint portfolio_help_bot_sessions_visitor_position_length_check
    check (visitor_position is null or length(visitor_position) <= 160),
  constraint portfolio_help_bot_sessions_visitor_organization_length_check
    check (visitor_organization is null or length(visitor_organization) <= 160),
  constraint portfolio_help_bot_sessions_student_university_length_check
    check (student_university is null or length(student_university) <= 160)
);

comment on table public.portfolio_help_bot_sessions is
  'Private one-row-per-session storage for portfolio help-bot conversations.';

comment on column public.portfolio_help_bot_sessions.transcript_json is
  'Ordered compact transcript containing all saved bot and user messages for a chat session.';

create index portfolio_help_bot_sessions_updated_at_idx
  on public.portfolio_help_bot_sessions (updated_at desc);

create index portfolio_help_bot_sessions_role_updated_idx
  on public.portfolio_help_bot_sessions (role_id, updated_at desc);

create index portfolio_help_bot_sessions_page_updated_idx
  on public.portfolio_help_bot_sessions (page_path, updated_at desc);

alter table public.portfolio_help_bot_sessions enable row level security;

grant usage on schema public to anon, authenticated;
grant insert, update on public.portfolio_help_bot_sessions to anon, authenticated;
grant select, delete on public.portfolio_help_bot_sessions to authenticated;

create policy "Public can insert chatbot sessions"
on public.portfolio_help_bot_sessions
for insert
to anon, authenticated
with check (
  length(trim(coalesce(session_id, ''))) >= 8
  and length(trim(coalesce(page_path, ''))) >= 1
  and length(page_path) <= 240
  and message_count between 0 and 120
  and jsonb_typeof(transcript_json) = 'array'
  and jsonb_array_length(transcript_json) = message_count
  and jsonb_array_length(transcript_json) <= 120
  and (role_id is null or length(role_id) <= 60)
  and (visitor_name is null or length(visitor_name) <= 120)
  and (visitor_position is null or length(visitor_position) <= 160)
  and (visitor_organization is null or length(visitor_organization) <= 160)
  and (student_university is null or length(student_university) <= 160)
);

create policy "Public can update chatbot sessions"
on public.portfolio_help_bot_sessions
for update
to anon, authenticated
using (true)
with check (
  length(trim(coalesce(session_id, ''))) >= 8
  and length(trim(coalesce(page_path, ''))) >= 1
  and length(page_path) <= 240
  and message_count between 0 and 120
  and jsonb_typeof(transcript_json) = 'array'
  and jsonb_array_length(transcript_json) = message_count
  and jsonb_array_length(transcript_json) <= 120
  and (role_id is null or length(role_id) <= 60)
  and (visitor_name is null or length(visitor_name) <= 120)
  and (visitor_position is null or length(visitor_position) <= 160)
  and (visitor_organization is null or length(visitor_organization) <= 160)
  and (student_university is null or length(student_university) <= 160)
);

create policy "Admin can read chatbot sessions"
on public.portfolio_help_bot_sessions
for select
to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'soorajsudhakaran4@gmail.com');

create policy "Admin can delete chatbot sessions"
on public.portfolio_help_bot_sessions
for delete
to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'soorajsudhakaran4@gmail.com');

commit;
