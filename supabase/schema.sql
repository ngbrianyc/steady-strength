-- Resistance Training App schema, matching src/types/models.ts.
-- Run this in the Supabase SQL editor (or via `supabase db push`) once you've
-- provisioned a project and want to move off local-only persistence.

create extension if not exists "pgcrypto";

create table if not exists profile (
  id uuid primary key default gen_random_uuid(),
  age int not null check (age > 0 and age < 120),
  sex text not null check (sex in ('female', 'male')),
  activity_level text not null check (activity_level in ('rarely_active', 'some_walking', 'regularly_active')),
  equipment text[] not null default '{}',
  readiness_flags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists benchmark_result (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profile(id) on delete cascade,
  test_key text not null check (test_key in ('sit_to_stand', 'timed_carry', 'single_leg_balance', 'push_up', 'sit_and_reach')),
  raw_value numeric not null,
  percentile int not null check (percentile between 0 and 100),
  taken_at timestamptz not null default now()
);

create table if not exists exercise (
  id text primary key,
  name text not null,
  pattern text not null check (pattern in ('hinge', 'squat_or_press', 'push', 'pull', 'carry_or_core', 'balance')),
  equipment_required text[] not null default '{}',
  is_seated boolean not null default false,
  is_supported boolean not null default false,
  video_url text,
  cues text[] not null default '{}',
  common_mistake text not null default '',
  substitute_ids text[] not null default '{}',
  contraindicated_flags text[] not null default '{}',
  jargon_gloss jsonb not null default '{}'::jsonb
);

create table if not exists norm (
  id text primary key,
  test_key text not null,
  sex text not null check (sex in ('female', 'male')),
  age_min int not null,
  age_max int not null,
  unit text not null,
  higher_is_better boolean not null default true,
  percentile_bands jsonb not null
);

create table if not exists program (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profile(id) on delete cascade,
  generated_at timestamptz not null default now(),
  active boolean not null default true
);

create table if not exists program_exercise (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references program(id) on delete cascade,
  exercise_id text not null references exercise(id),
  day_index int not null check (day_index in (0, 1)),
  target_sets int not null,
  target_rep_min int not null,
  target_rep_max int not null,
  target_load numeric,
  load_increment numeric
);

create table if not exists session_log (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profile(id) on delete cascade,
  program_exercise_id uuid not null references program_exercise(id) on delete cascade,
  performed_at timestamptz not null default now(),
  sets jsonb not null default '[]'::jsonb
);

create index if not exists idx_benchmark_result_profile on benchmark_result(profile_id);
create index if not exists idx_program_exercise_program on program_exercise(program_id);
create index if not exists idx_session_log_profile on session_log(profile_id);
create index if not exists idx_session_log_program_exercise on session_log(program_exercise_id);

-- MVP note: this schema has no auth-based row-level security applied yet.
-- The app currently runs single-profile-per-device with local persistence
-- (see src/store/useAppStore.ts). Before pointing the app at Supabase for
-- real multi-device sync, add RLS policies scoped to auth.uid() and a
-- profile.user_id column.
