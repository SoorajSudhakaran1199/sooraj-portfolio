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
