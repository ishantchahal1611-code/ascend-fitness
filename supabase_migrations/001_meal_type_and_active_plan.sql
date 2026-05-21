-- Run in Supabase SQL Editor if you already created tables from supabase_schema.sql

alter table public.meals
  add column if not exists meal_type text default 'Snack',
  add column if not exists food_id text;

alter table public.profiles
  add column if not exists active_plan_id text default 'ppl';
