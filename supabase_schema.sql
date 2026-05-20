-- Run this SQL in your Supabase SQL Editor to create the tables

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles & Settings
create table public.profiles (
  id uuid references auth.users(id) primary key,
  name text,
  age integer,
  height numeric,
  gender text,
  theme text default 'dark',
  units jsonb default '{"weight": "kg", "distance": "km"}'::jsonb,
  goals jsonb default '{"calories": 2400, "protein": 160, "carbs": 250, "fats": 70, "water": 3.0, "steps": 10000}'::jsonb,
  notifications jsonb default '{"workout": true, "meals": true, "water": true, "steps": true}'::jsonb,
  active_plan_id text,
  created_at timestamp with time zone default now()
);

-- 2. Custom Workout Plans
create table public.custom_plans (
  id text primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  short_name text not null,
  schedule jsonb,
  days jsonb,
  created_at timestamp with time zone default now()
);

-- 3. Workout History
create table public.workout_history (
  id text primary key,
  user_id uuid references auth.users(id) not null,
  plan_name text,
  date date not null,
  duration integer,
  exercises integer,
  total_volume numeric,
  created_at timestamp with time zone default now()
);

-- 4. Personal Records
create table public.personal_records (
  user_id uuid references auth.users(id) not null,
  exercise_id text not null,
  weight numeric not null,
  updated_at timestamp with time zone default now(),
  primary key (user_id, exercise_id)
);

-- 5. Meals (Nutrition)
create table public.meals (
  id text primary key,
  user_id uuid references auth.users(id) not null,
  date date not null,
  name text not null,
  calories numeric,
  protein numeric,
  carbs numeric,
  fats numeric,
  qty numeric default 1,
  created_at timestamp with time zone default now()
);

-- 6. Favorite Foods
create table public.favorite_foods (
  id text primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  calories numeric,
  protein numeric,
  carbs numeric,
  fats numeric,
  created_at timestamp with time zone default now()
);

-- 7. Daily Metrics (Water, Bodyweight, Steps)
create table public.daily_metrics (
  user_id uuid references auth.users(id) not null,
  date date not null,
  water numeric default 0,
  bodyweight numeric,
  steps integer default 0,
  primary key (user_id, date)
);

-- 8. Activities
create table public.activities (
  id text primary key,
  user_id uuid references auth.users(id) not null,
  type text not null,
  label text,
  date date not null,
  distance numeric,
  duration integer,
  pace text,
  calories numeric,
  created_at timestamp with time zone default now()
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.custom_plans enable row level security;
alter table public.workout_history enable row level security;
alter table public.personal_records enable row level security;
alter table public.meals enable row level security;
alter table public.favorite_foods enable row level security;
alter table public.daily_metrics enable row level security;
alter table public.activities enable row level security;

-- Create policies so users can only access their own data
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users can manage own custom plans" on public.custom_plans for all using (auth.uid() = user_id);
create policy "Users can manage own workout history" on public.workout_history for all using (auth.uid() = user_id);
create policy "Users can manage own PRs" on public.personal_records for all using (auth.uid() = user_id);
create policy "Users can manage own meals" on public.meals for all using (auth.uid() = user_id);
create policy "Users can manage own favorite foods" on public.favorite_foods for all using (auth.uid() = user_id);
create policy "Users can manage own daily metrics" on public.daily_metrics for all using (auth.uid() = user_id);
create policy "Users can manage own activities" on public.activities for all using (auth.uid() = user_id);
