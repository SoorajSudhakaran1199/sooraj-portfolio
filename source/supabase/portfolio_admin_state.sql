create table if not exists public.portfolio_site_state (
  id text primary key,
  updated_at timestamptz not null default timezone('utc', now()),
  settings jsonb not null default '{}'::jsonb
);

alter table public.portfolio_site_state
  add column if not exists updated_at timestamptz not null default timezone('utc', now()),
  add column if not exists settings jsonb not null default '{}'::jsonb;

insert into public.portfolio_site_state (id, updated_at, settings)
values (
  'redesign_admin_state',
  timezone('utc', now()),
  '{
    "version": 1,
    "defaults": {
      "theme": "dark",
      "language": "en"
    },
    "sectionVisibility": {
      "about": true,
      "stats": true,
      "projects": true,
      "skills": true,
      "experience": true,
      "education": true,
      "recommendations": true,
      "contact": true,
      "chatbot": true
    },
    "personalOverrides": {},
    "additions": {
      "projects": [],
      "experiences": [],
      "education": [],
      "certificates": []
    },
    "websiteUpdatedAt": "",
    "emailNotifications": {
      "enabled": true,
      "to": "soorajsudhakaran1199@gmail.com",
      "provider": "supabase-edge-function"
    }
  }'::jsonb
)
on conflict (id) do nothing;

insert into public.portfolio_site_state (id, updated_at, settings)
values ('public_site_update', timezone('utc', now()), '{}'::jsonb)
on conflict (id) do nothing;

alter table public.portfolio_site_state enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.portfolio_site_state to anon;
grant select, insert, update on public.portfolio_site_state to authenticated;

drop policy if exists "Public can read portfolio site state" on public.portfolio_site_state;
create policy "Public can read portfolio site state"
on public.portfolio_site_state
for select
to anon, authenticated
using (true);

drop policy if exists "Admin can insert portfolio site state" on public.portfolio_site_state;
create policy "Admin can insert portfolio site state"
on public.portfolio_site_state
for insert
to authenticated
with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'soorajsudhakaran4@gmail.com');

drop policy if exists "Admin can update portfolio site state" on public.portfolio_site_state;
create policy "Admin can update portfolio site state"
on public.portfolio_site_state
for update
to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'soorajsudhakaran4@gmail.com')
with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'soorajsudhakaran4@gmail.com');
