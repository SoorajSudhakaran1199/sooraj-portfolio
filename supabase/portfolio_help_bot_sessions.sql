begin;

-- Fresh rebuild for help-bot event storage only.
-- This deletes only help-bot data and recreates a simpler insert-only log.

drop table if exists public.portfolio_help_bot_sessions cascade;

create table public.portfolio_help_bot_sessions (
  id bigint generated always as identity primary key,
  session_id text not null,
  event_index integer not null,
  event_type text not null default 'message',
  created_at timestamptz not null default timezone('utc', now()),
  ended_at timestamptz,
  page_path text not null default '/',
  role_id text,
  visitor_name text,
  visitor_position text,
  visitor_organization text,
  student_university text,
  sender text,
  message_text text,
  message_count integer not null default 0,
  constraint portfolio_help_bot_sessions_session_event_unique
    unique (session_id, event_index),
  constraint portfolio_help_bot_sessions_session_id_check
    check (length(trim(coalesce(session_id, ''))) >= 8),
  constraint portfolio_help_bot_sessions_event_index_check
    check (event_index >= 1 and event_index <= 200),
  constraint portfolio_help_bot_sessions_event_type_check
    check (event_type in ('message', 'session_end')),
  constraint portfolio_help_bot_sessions_sender_check
    check (
      (event_type = 'message' and sender in ('user', 'bot'))
      or (event_type = 'session_end' and sender is null)
    ),
  constraint portfolio_help_bot_sessions_message_text_check
    check (
      (event_type = 'message' and length(trim(coalesce(message_text, ''))) >= 1 and length(message_text) <= 2400)
      or (event_type = 'session_end' and message_text is null)
    ),
  constraint portfolio_help_bot_sessions_page_path_check
    check (length(trim(coalesce(page_path, ''))) >= 1 and length(page_path) <= 240),
  constraint portfolio_help_bot_sessions_message_count_check
    check (message_count >= 0 and message_count <= 120),
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
  'Insert-only private event log for portfolio help-bot conversations.';

create index portfolio_help_bot_sessions_created_at_idx
  on public.portfolio_help_bot_sessions (created_at desc);

create index portfolio_help_bot_sessions_session_created_idx
  on public.portfolio_help_bot_sessions (session_id, created_at asc);

create index portfolio_help_bot_sessions_role_created_idx
  on public.portfolio_help_bot_sessions (role_id, created_at desc);

alter table public.portfolio_help_bot_sessions enable row level security;

grant usage on schema public to anon, authenticated;
grant insert on public.portfolio_help_bot_sessions to anon, authenticated;
grant select, delete on public.portfolio_help_bot_sessions to authenticated;

create policy "Public can insert chatbot events"
on public.portfolio_help_bot_sessions
for insert
to anon, authenticated
with check (
  length(trim(coalesce(session_id, ''))) >= 8
  and event_index between 1 and 200
  and event_type in ('message', 'session_end')
  and message_count between 0 and 120
  and length(trim(coalesce(page_path, ''))) >= 1
  and length(page_path) <= 240
  and (role_id is null or length(role_id) <= 60)
  and (visitor_name is null or length(visitor_name) <= 120)
  and (visitor_position is null or length(visitor_position) <= 160)
  and (visitor_organization is null or length(visitor_organization) <= 160)
  and (student_university is null or length(student_university) <= 160)
  and (
    (event_type = 'message' and sender in ('user', 'bot') and length(trim(coalesce(message_text, ''))) >= 1 and length(message_text) <= 2400)
    or (event_type = 'session_end' and sender is null and message_text is null)
  )
);

create policy "Admin can read chatbot events"
on public.portfolio_help_bot_sessions
for select
to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'soorajsudhakaran4@gmail.com');

create policy "Admin can delete chatbot events"
on public.portfolio_help_bot_sessions
for delete
to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'soorajsudhakaran4@gmail.com');

commit;
