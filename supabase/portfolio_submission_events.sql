create extension if not exists pgcrypto;

create table if not exists public.portfolio_submission_events (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('feedback', 'contact', 'cv')),
  country text,
  rating_value integer check (rating_value between 1 and 5),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists portfolio_submission_events_created_at_idx
  on public.portfolio_submission_events (created_at desc);

create index if not exists portfolio_submission_events_type_idx
  on public.portfolio_submission_events (type);

alter table public.portfolio_submission_events enable row level security;

drop policy if exists "Public can read portfolio submission events" on public.portfolio_submission_events;
create policy "Public can read portfolio submission events"
on public.portfolio_submission_events
for select
using (true);

drop policy if exists "Public can insert portfolio submission events" on public.portfolio_submission_events;
create policy "Public can insert portfolio submission events"
on public.portfolio_submission_events
for insert
with check (
  type in ('feedback', 'contact', 'cv')
  and (rating_value is null or rating_value between 1 and 5)
);

drop policy if exists "Admin can delete portfolio submission events" on public.portfolio_submission_events;
create policy "Admin can delete portfolio submission events"
on public.portfolio_submission_events
for delete
to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'soorajsudhakaran4@gmail.com');

create table if not exists public.portfolio_site_state (
  id text primary key,
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.portfolio_site_state (id, updated_at)
values ('public_site_update', timezone('utc', now()))
on conflict (id) do nothing;

alter table public.portfolio_site_state enable row level security;

drop policy if exists "Public can read portfolio site state" on public.portfolio_site_state;
create policy "Public can read portfolio site state"
on public.portfolio_site_state
for select
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
