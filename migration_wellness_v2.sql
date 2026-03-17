-- MIGRATE WELLNESS TABLE TO v2.0
-- Run this if you already had Arise v1.0 installed

ALTER TABLE wellness_logs ADD COLUMN IF NOT EXISTS water_intake_ml integer default 0;
ALTER TABLE wellness_logs ADD COLUMN IF NOT EXISTS water_bottle_snapshot_ml integer default 500;
ALTER TABLE wellness_logs ADD COLUMN IF NOT EXISTS water_goal_snapshot_litres numeric(4,2) default 2.5;
ALTER TABLE wellness_logs ADD COLUMN IF NOT EXISTS steps_goal_snapshot integer default 8000;
ALTER TABLE wellness_logs ADD COLUMN IF NOT EXISTS sleep_start timestamptz;
ALTER TABLE wellness_logs ADD COLUMN IF NOT EXISTS sleep_wake timestamptz;
ALTER TABLE wellness_logs ADD COLUMN IF NOT EXISTS mood_note text default '';

-- NEW v2.0 TABLES
CREATE TABLE IF NOT EXISTS habit_logs (
  id uuid primary key default uuid_generate_v4(),
  habit_id uuid references habits(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  log_date date default current_date,
  completed boolean default true,
  unique(habit_id, log_date)
);

CREATE TABLE IF NOT EXISTS focus_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  session_type text default 'work' check (session_type in ('work', 'break')),
  duration integer not null,
  start_time timestamptz default now(),
  end_time timestamptz,
  completed boolean default false,
  linked_task_id uuid references tasks(id) on delete set null,
  created_at timestamptz default now()
);

-- ENABLE RLS & POLICIES FOR NEW TABLES
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_habit_logs" ON habit_logs;
CREATE POLICY "own_habit_logs" ON habit_logs FOR ALL USING (auth.uid() = user_id);

ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_focus_sessions" ON focus_sessions;
CREATE POLICY "own_focus_sessions" ON focus_sessions FOR ALL USING (auth.uid() = user_id);

-- Remove old columns if they exist (OPTIONAL, safe to skip)
-- ALTER TABLE wellness_logs DROP COLUMN IF EXISTS water;
-- ALTER TABLE wellness_logs DROP COLUMN IF EXISTS bottles;
-- ALTER TABLE wellness_logs DROP COLUMN IF EXISTS sleep;

-- UPDATE PROFILES TABLE
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS career_goal text default 'Cybersecurity Role — 14+ LPA';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS career_deadline date default '2026-12-31';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS career_progress integer default 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text default '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS logo_url text default '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS water_bottle_size integer default 500;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS water_goal_litres numeric(4,2) default 2.5;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS steps_goal integer default 8000;

-- ENSURE CONSTRAINTS
ALTER TABLE wellness_logs DROP CONSTRAINT IF EXISTS wellness_logs_mood_check;
ALTER TABLE wellness_logs ADD CONSTRAINT wellness_logs_mood_check CHECK (mood BETWEEN 1 AND 5);

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_career_progress_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_career_progress_check CHECK (career_progress BETWEEN 0 AND 100);

-- ENSURE UNIQUE CONSTRAINT FOR UPSERT
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wellness_logs_user_id_log_date_key') THEN
    ALTER TABLE wellness_logs ADD CONSTRAINT wellness_logs_user_id_log_date_key UNIQUE (user_id, log_date);
  END IF;
END $$;
