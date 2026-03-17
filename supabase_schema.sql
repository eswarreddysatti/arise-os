-- ============================================================
-- ARISE v2.0 — Production-Ready Supabase Schema
-- ============================================================
create extension if not exists "uuid-ossp";

-- TASKS & SUBTASKS
create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null, 
  notes text default '', 
  category text default 'Personal',
  priority text default 'medium' check (priority in ('low', 'medium', 'high')), 
  due_date date, 
  done boolean default false,
  overdue boolean default false, 
  created_at timestamptz default now(), 
  updated_at timestamptz default now()
);

create table if not exists subtasks (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references tasks(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text default '',
  due_date timestamptz,
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  assignee text default '', -- Changed to text for flexible naming
  done boolean default false,
  created_at timestamptz default now()
);

-- HABITS SYSTEM
create table if not exists habits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null, 
  goal text default '', 
  category text default 'Health',
  streak integer default 0, 
  done_today boolean default false,
  week_data integer[] default '{0,0,0,0,0,0,0}', 
  last_done_date date,
  created_at timestamptz default now(), 
  updated_at timestamptz default now()
);

create table if not exists habit_logs (
  id uuid primary key default uuid_generate_v4(),
  habit_id uuid references habits(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  log_date date default current_date,
  completed boolean default true,
  unique(habit_id, log_date)
);

-- FOCUS & POMODORO SYSTEM
create table if not exists focus_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  session_type text default 'work' check (session_type in ('work', 'break')),
  duration integer not null, -- in minutes
  start_time timestamptz default now(),
  end_time timestamptz,
  completed boolean default false,
  linked_task_id uuid references tasks(id) on delete set null,
  created_at timestamptz default now()
);

-- WELLNESS SYSTEM
create table if not exists wellness_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  log_date date default current_date, 
  water_intake_ml integer default 0,
  water_bottle_snapshot_ml integer default 500,
  water_goal_snapshot_litres numeric(4,2) default 2.5,
  steps integer default 0, 
  steps_goal_snapshot integer default 8000,
  sleep_start timestamptz,
  sleep_wake timestamptz,
  mood integer default 3 check (mood between 1 and 5),
  mood_note text default '',
  created_at timestamptz default now(), 
  updated_at timestamptz default now(),
  unique(user_id, log_date)
);

-- NOTES & JOURNAL
create table if not exists notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text default '', 
  body text default '', 
  color text default '',
  category text default 'General', 
  pinned boolean default false,
  created_at timestamptz default now(), 
  updated_at timestamptz default now()
);

create table if not exists journal_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text default '', 
  body text not null, 
  mood integer default 3 check (mood between 1 and 5),
  entry_date date default current_date,
  created_at timestamptz default now(), 
  updated_at timestamptz default now()
);

-- GOALS & FINANCE
create table if not exists goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null, 
  notes text default '', 
  deadline date, 
  progress integer default 0 check (progress between 0 and 100),
  created_at timestamptz default now(), 
  updated_at timestamptz default now()
);

create table if not exists finance_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('income','expense')),
  title text not null, 
  amount numeric(12,2) not null,
  category text default 'Other', 
  entry_date date default current_date, 
  created_at timestamptz default now()
);

-- PROFILES & APP BRANDING
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text default '', 
  avatar_url text default '',
  logo_url text default '', 
  location text default '', 
  dark_mode boolean default false,
  water_bottle_size integer default 500,
  water_goal_litres numeric(4,2) default 2.5,
  steps_goal integer default 8000,
  migration_target text default '',
  created_at timestamptz default now(), 
  updated_at timestamptz default now()
);

-- CALENDAR
create table if not exists calendar_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null, 
  event_date date not null, 
  event_time time,
  type text default 'personal', 
  created_at timestamptz default now()
);

-- REMINDERS
create table if not exists reminders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  done boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PERFORMANCE INDEXES
drop index if exists idx_tasks_user_date;
create index idx_tasks_user_date on tasks(user_id, due_date);

drop index if exists idx_subtasks_task;
create index idx_subtasks_task on subtasks(task_id);

drop index if exists idx_habits_user;
create index idx_habits_user on habits(user_id);

drop index if exists idx_habit_logs_date;
create index idx_habit_logs_date on habit_logs(user_id, log_date);

drop index if exists idx_focus_sessions_user;
create index idx_focus_sessions_user on focus_sessions(user_id, start_time);

drop index if exists idx_wellness_logs_date;
create index idx_wellness_logs_date on wellness_logs(user_id, log_date);

drop index if exists idx_notes_user;
create index idx_notes_user on notes(user_id);

drop index if exists idx_journal_user_date;
create index idx_journal_user_date on journal_entries(user_id, entry_date);

drop index if exists idx_calendar_user_date;
create index idx_calendar_user_date on calendar_events(user_id, event_date);

drop index if exists idx_reminders_user;
create index idx_reminders_user on reminders(user_id);

-- ROW LEVEL SECURITY (RLS)
alter table tasks             enable row level security;
alter table subtasks          enable row level security;
alter table habits            enable row level security;
alter table habit_logs        enable row level security;
alter table focus_sessions    enable row level security;
alter table notes             enable row level security;
alter table goals             enable row level security;
alter table finance_entries   enable row level security;
alter table wellness_logs     enable row level security;
alter table journal_entries   enable row level security;
alter table profiles          enable row level security;
alter table calendar_events   enable row level security;
alter table reminders         enable row level security;

-- POLICIES
drop policy if exists "own_tasks" on tasks;
create policy "own_tasks"            on tasks             for all using (auth.uid()=user_id);

drop policy if exists "own_subtasks" on subtasks;
create policy "own_subtasks"         on subtasks          for all using (auth.uid()=user_id);

drop policy if exists "own_habits" on habits;
create policy "own_habits"           on habits            for all using (auth.uid()=user_id);

drop policy if exists "own_habit_logs" on habit_logs;
create policy "own_habit_logs"       on habit_logs        for all using (auth.uid()=user_id);

drop policy if exists "own_focus_sessions" on focus_sessions;
create policy "own_focus_sessions"   on focus_sessions    for all using (auth.uid()=user_id);

drop policy if exists "own_notes" on notes;
create policy "own_notes"            on notes             for all using (auth.uid()=user_id);

drop policy if exists "own_goals" on goals;
create policy "own_goals"            on goals             for all using (auth.uid()=user_id);

drop policy if exists "own_finance_entries" on finance_entries;
create policy "own_finance_entries"  on finance_entries   for all using (auth.uid()=user_id);

drop policy if exists "own_wellness_logs" on wellness_logs;
create policy "own_wellness_logs"    on wellness_logs     for all using (auth.uid()=user_id);

drop policy if exists "own_journal_entries" on journal_entries;
create policy "own_journal_entries"  on journal_entries   for all using (auth.uid()=user_id);

drop policy if exists "own_calendar_events" on calendar_events;
create policy "own_calendar_events"  on calendar_events   for all using (auth.uid()=user_id);

drop policy if exists "own_reminders" on reminders;
create policy "own_reminders"        on reminders         for all using (auth.uid()=user_id);

drop policy if exists "own_profile" on profiles;
create policy "own_profile"          on profiles          for all using (auth.uid()=id);

-- TRIGGER: Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''));
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- TRIGGER: Auto-update updated_at
create or replace function update_updated_at() returns trigger language plpgsql as $$
begin new.updated_at=now(); return new; end;
$$;
create trigger t_tasks before update on tasks for each row execute procedure update_updated_at();
create trigger t_habits before update on habits for each row execute procedure update_updated_at();
create trigger t_notes before update on notes for each row execute procedure update_updated_at();
create trigger t_goals before update on goals for each row execute procedure update_updated_at();
create trigger t_wellness before update on wellness_logs for each row execute procedure update_updated_at();
create trigger t_journal before update on journal_entries for each row execute procedure update_updated_at();
create trigger t_reminders before update on reminders for each row execute procedure update_updated_at();
create trigger t_profiles before update on profiles for each row execute procedure update_updated_at();
