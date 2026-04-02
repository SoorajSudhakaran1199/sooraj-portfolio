begin;

-- Fresh rebuild for help-bot session storage only.
-- This keeps one row per chat session and uses an RPC upsert for public writes.

drop function if exists public.portfolio_save_help_bot_session(
  text,
  timestamptz,
  timestamptz,
  timestamptz,
  text,
  text,
  text,
  text,
  text,
  text,
  integer,
  jsonb
);

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
grant select, delete on public.portfolio_help_bot_sessions to authenticated;

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

create or replace function public.portfolio_save_help_bot_session(
  p_session_id text,
  p_created_at timestamptz,
  p_updated_at timestamptz,
  p_ended_at timestamptz,
  p_page_path text,
  p_role_id text,
  p_visitor_name text,
  p_visitor_position text,
  p_visitor_organization text,
  p_student_university text,
  p_message_count integer,
  p_transcript_json jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if length(trim(coalesce(p_session_id, ''))) < 8 then
    raise exception 'Invalid help-bot session id';
  end if;

  if length(trim(coalesce(p_page_path, ''))) < 1 or length(coalesce(p_page_path, '')) > 240 then
    raise exception 'Invalid help-bot page path';
  end if;

  if p_message_count < 0 or p_message_count > 120 then
    raise exception 'Invalid help-bot message count';
  end if;

  if jsonb_typeof(coalesce(p_transcript_json, '[]'::jsonb)) <> 'array' then
    raise exception 'Invalid help-bot transcript payload';
  end if;

  if jsonb_array_length(coalesce(p_transcript_json, '[]'::jsonb)) <> p_message_count then
    raise exception 'Help-bot transcript count mismatch';
  end if;

  insert into public.portfolio_help_bot_sessions (
    session_id,
    created_at,
    updated_at,
    ended_at,
    page_path,
    role_id,
    visitor_name,
    visitor_position,
    visitor_organization,
    student_university,
    message_count,
    transcript_json
  )
  values (
    p_session_id,
    coalesce(p_created_at, timezone('utc', now())),
    coalesce(p_updated_at, timezone('utc', now())),
    p_ended_at,
    p_page_path,
    p_role_id,
    p_visitor_name,
    p_visitor_position,
    p_visitor_organization,
    p_student_university,
    p_message_count,
    coalesce(p_transcript_json, '[]'::jsonb)
  )
  on conflict (session_id) do update
  set
    updated_at = excluded.updated_at,
    ended_at = excluded.ended_at,
    page_path = excluded.page_path,
    role_id = excluded.role_id,
    visitor_name = excluded.visitor_name,
    visitor_position = excluded.visitor_position,
    visitor_organization = excluded.visitor_organization,
    student_university = excluded.student_university,
    message_count = excluded.message_count,
    transcript_json = excluded.transcript_json;
end;
$$;

revoke all on function public.portfolio_save_help_bot_session(
  text,
  timestamptz,
  timestamptz,
  timestamptz,
  text,
  text,
  text,
  text,
  text,
  text,
  integer,
  jsonb
) from public;

grant execute on function public.portfolio_save_help_bot_session(
  text,
  timestamptz,
  timestamptz,
  timestamptz,
  text,
  text,
  text,
  text,
  text,
  text,
  integer,
  jsonb
) to anon, authenticated;

commit;
