-- ============================================================
-- Sketchline — Supabase schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Profiles (extends Supabase's built-in auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  created_at timestamptz default now()
);

-- Auto-create a profile row whenever someone signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Track progress (per skill track, per user)
create table if not exists track_progress (
  user_id uuid references auth.users on delete cascade,
  track_id text not null,          -- 'layout-grid', 'color-theory', 'typography', etc.
  pct int default 0 check (pct between 0 and 100),
  updated_at timestamptz default now(),
  primary key (user_id, track_id)
);

-- Sketches — stores STROKE DATA, not pixels (tiny, replays perfectly at any size)
create table if not exists sketches (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  brief_id text,          -- e.g. 'hiking-app-hero' — links "same brief" attempts together
  week_number int,        -- 1, 4, 8 for the evolution tracker; null for free sketches
  title text,             -- optional label, e.g. lesson title from the Learn page
  strokes jsonb not null, -- the stroke array your canvas engine already produces
  created_at timestamptz default now()
);
create index if not exists sketches_user_brief_idx on sketches (user_id, brief_id);

-- Eye Training attempt log
create table if not exists eye_training_attempts (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete cascade,
  category text,          -- 'layout' | 'typography' | 'color' | 'composition' | 'iconography' | 'ui' | 'motion'
  principle text,         -- e.g. 'hierarchy (modular scale)'
  correct boolean,
  created_at timestamptz default now()
);

-- Badges
create table if not exists badges (
  user_id uuid references auth.users on delete cascade,
  badge_id text not null,        -- 'first-sketch', 'seven-day-streak', 'grid-master', 'color-eye'
  earned_at timestamptz default now(),
  primary key (user_id, badge_id)
);

-- ============================================================
-- Row Level Security — every user can only touch their own rows
-- ============================================================
alter table profiles enable row level security;
alter table track_progress enable row level security;
alter table sketches enable row level security;
alter table eye_training_attempts enable row level security;
alter table badges enable row level security;

create policy "profiles: user reads/updates own row" on profiles
  for all using (auth.uid() = id);

create policy "track_progress: user manages own rows" on track_progress
  for all using (auth.uid() = user_id);

create policy "sketches: user manages own rows" on sketches
  for all using (auth.uid() = user_id);

create policy "eye_training: user manages own rows" on eye_training_attempts
  for all using (auth.uid() = user_id);

create policy "badges: user manages own rows" on badges
  for all using (auth.uid() = user_id);
