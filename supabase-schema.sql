-- Run this in Supabase SQL editor.
-- Multi-user schema using Supabase Auth + Row Level Security.
-- Safe to run on a fresh project. Also updates the previous prototype table if it exists.

create table if not exists public.travel_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.travel_profiles
add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.travel_profiles
add column if not exists data jsonb not null default '{}'::jsonb;

alter table public.travel_profiles
add column if not exists updated_at timestamptz not null default now();

create unique index if not exists travel_profiles_user_id_key
on public.travel_profiles(user_id);

alter table public.travel_profiles enable row level security;

drop policy if exists "dev anon read travel profiles" on public.travel_profiles;
drop policy if exists "dev anon upsert travel profiles" on public.travel_profiles;
drop policy if exists "dev anon update travel profiles" on public.travel_profiles;

drop policy if exists "Users can read own travel profile" on public.travel_profiles;
create policy "Users can read own travel profile"
on public.travel_profiles for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create own travel profile" on public.travel_profiles;
create policy "Users can create own travel profile"
on public.travel_profiles for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own travel profile" on public.travel_profiles;
create policy "Users can update own travel profile"
on public.travel_profiles for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own travel profile" on public.travel_profiles;
create policy "Users can delete own travel profile"
on public.travel_profiles for delete
to authenticated
using (auth.uid() = user_id);
