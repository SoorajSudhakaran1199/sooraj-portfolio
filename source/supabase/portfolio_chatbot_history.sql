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

create table if not exists public.portfolio_chatbot_leads (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  name text not null,
  email text not null,
  company_or_university text not null,
  role_or_title text,
  note text,
  page_url text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists portfolio_chatbot_leads_session_uidx
  on public.portfolio_chatbot_leads (session_id);

create index if not exists portfolio_chatbot_leads_created_idx
  on public.portfolio_chatbot_leads (created_at desc);

create or replace function public.is_portfolio_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  allowed_emails text[] := array[
    'soorajsudhakaran1199@gmail.com',
    'soorajsudhakaran4@gmail.com'
  ];
  jwt_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  user_email text := '';
begin
  if jwt_email = any(allowed_emails) then
    return true;
  end if;

  if auth.uid() is not null then
    select lower(users.email)
      into user_email
      from auth.users as users
      where users.id = auth.uid()
      limit 1;

    if user_email = any(allowed_emails) then
      return true;
    end if;
  end if;

  return false;
end;
$$;

grant execute on function public.is_portfolio_admin() to authenticated;

alter table public.portfolio_chatbot_history enable row level security;
alter table public.portfolio_chatbot_leads enable row level security;

grant usage on schema public to anon, authenticated;
grant insert on public.portfolio_chatbot_history to anon;
grant select, delete on public.portfolio_chatbot_history to authenticated;
grant select, delete on public.portfolio_chatbot_leads to authenticated;

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
  using (public.is_portfolio_admin());

drop policy if exists "Admin can delete chatbot history" on public.portfolio_chatbot_history;
create policy "Admin can delete chatbot history"
  on public.portfolio_chatbot_history
  for delete
  to authenticated
  using (public.is_portfolio_admin());

drop policy if exists "Admin can read chatbot leads" on public.portfolio_chatbot_leads;
create policy "Admin can read chatbot leads"
  on public.portfolio_chatbot_leads
  for select
  to authenticated
  using (public.is_portfolio_admin());

drop policy if exists "Admin can delete chatbot leads" on public.portfolio_chatbot_leads;
create policy "Admin can delete chatbot leads"
  on public.portfolio_chatbot_leads
  for delete
  to authenticated
  using (public.is_portfolio_admin());

drop function if exists public.submit_portfolio_chatbot_lead(text, text, text, text, text, text, text, text, jsonb);

create or replace function public.submit_portfolio_chatbot_lead(
  lead_session_id text,
  lead_name text,
  lead_email text,
  lead_company_or_university text,
  lead_role_or_title text default null,
  lead_note text default null,
  lead_page_url text default null,
  lead_user_agent text default null,
  lead_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_id uuid;
  cleaned_session_id text := left(trim(coalesce(lead_session_id, '')), 140);
  cleaned_name text := left(trim(coalesce(lead_name, '')), 120);
  cleaned_email text := lower(left(trim(coalesce(lead_email, '')), 180));
  cleaned_company text := left(trim(coalesce(lead_company_or_university, '')), 180);
  cleaned_role text := nullif(left(trim(coalesce(lead_role_or_title, '')), 160), '');
  cleaned_note text := nullif(left(trim(coalesce(lead_note, '')), 1000), '');
begin
  if length(cleaned_session_id) < 8 then
    raise exception 'Chat session id is missing.';
  end if;

  if length(cleaned_name) < 2 then
    raise exception 'Visitor name is too short.';
  end if;

  if cleaned_email !~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$' then
    raise exception 'Visitor email is not valid.';
  end if;

  if length(cleaned_company) < 2 then
    raise exception 'Company or university is too short.';
  end if;

  insert into public.portfolio_chatbot_leads (
    session_id,
    name,
    email,
    company_or_university,
    role_or_title,
    note,
    page_url,
    user_agent,
    metadata,
    updated_at
  )
  values (
    cleaned_session_id,
    cleaned_name,
    cleaned_email,
    cleaned_company,
    cleaned_role,
    cleaned_note,
    nullif(left(trim(coalesce(lead_page_url, '')), 700), ''),
    nullif(left(trim(coalesce(lead_user_agent, '')), 700), ''),
    coalesce(lead_metadata, '{}'::jsonb),
    now()
  )
  on conflict (session_id) do update
  set
    name = excluded.name,
    email = excluded.email,
    company_or_university = excluded.company_or_university,
    role_or_title = excluded.role_or_title,
    note = excluded.note,
    page_url = excluded.page_url,
    user_agent = excluded.user_agent,
    metadata = excluded.metadata,
    updated_at = now()
  returning id into saved_id;

  return saved_id;
end;
$$;

grant execute on function public.submit_portfolio_chatbot_lead(text, text, text, text, text, text, text, text, jsonb) to anon, authenticated;

drop function if exists public.get_portfolio_chatbot_history(integer);

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
  lead jsonb,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_portfolio_admin() then
    raise exception 'Not authorized to read chatbot history for this admin account.';
  end if;

  return query
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
    case
      when lead.id is null then null
      else jsonb_build_object(
        'id', lead.id,
        'session_id', lead.session_id,
        'name', lead.name,
        'email', lead.email,
        'company_or_university', lead.company_or_university,
        'role_or_title', lead.role_or_title,
        'note', lead.note,
        'page_url', lead.page_url,
        'user_agent', lead.user_agent,
        'metadata', lead.metadata,
        'created_at', lead.created_at,
        'updated_at', lead.updated_at
      )
    end as lead,
    history.created_at
  from public.portfolio_chatbot_history as history
  left join public.portfolio_chatbot_leads as lead
    on lead.session_id = history.session_id
  order by history.created_at desc
  limit least(greatest(coalesce(max_rows, 1000), 1), 5000);
end;
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
  if not public.is_portfolio_admin() then
    raise exception 'Not authorized to delete chatbot history';
  end if;

  delete from public.portfolio_chatbot_leads
  where session_id = target_session_id;

  delete from public.portfolio_chatbot_history
  where session_id = target_session_id;

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

grant execute on function public.delete_portfolio_chatbot_session(text) to authenticated;
