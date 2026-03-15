-- ============================================================
-- ARISE — Full Supabase Schema
-- Paste this entire file into Supabase SQL Editor and click Run
-- ============================================================
create extension if not exists "uuid-ossp";

create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null, notes text default '', category text default 'Personal',
  priority text default 'medium', due_date date, done boolean default false,
  overdue boolean default false, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists subtasks (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references tasks(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null, done boolean default false, created_at timestamptz default now()
);
create table if not exists habits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null, goal text default '', category text default 'Health',
  streak integer default 0, done_today boolean default false,
  week_data integer[] default '{0,0,0,0,0,0,0}', last_done_date date,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists reminders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null, reminder_time time, reminder_date date,
  repeat text default 'none', done boolean default false, created_at timestamptz default now()
);
create table if not exists notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text default '', body text default '', color text default '',
  category text default 'General', pinned boolean default false,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null, notes text default '', deadline date, progress integer default 0,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists finance_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('income','expense')),
  title text not null, amount numeric(12,2) not null,
  category text default 'Other', entry_date date default current_date, created_at timestamptz default now()
);
create table if not exists savings_goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  label text default 'Migration Savings', target numeric(12,2) default 620000,
  saved numeric(12,2) default 0, updated_at timestamptz default now()
);
create table if not exists wellness_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  log_date date default current_date, water integer default 0,
  sleep numeric(4,1) default 0, steps integer default 0, mood integer default 2,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  unique(user_id, log_date)
);
create table if not exists journal_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text default '', body text not null, mood integer default 2,
  entry_date date default current_date,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists pomodoro_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  work_minutes integer not null, completed_at timestamptz default now()
);
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text default '', career_goal text default 'Cybersecurity Role — 14+ LPA',
  career_deadline date default '2026-12-31', career_progress integer default 0,
  location text default 'Hyderabad, India', dark_mode boolean default false,
  migration_target text default 'Australia',
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists calendar_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null, event_date date not null, event_time time,
  type text default 'personal', created_at timestamptz default now()
);

-- Row Level Security
alter table tasks             enable row level security;
alter table subtasks          enable row level security;
alter table habits            enable row level security;
alter table reminders         enable row level security;
alter table notes             enable row level security;
alter table goals             enable row level security;
alter table finance_entries   enable row level security;
alter table savings_goals     enable row level security;
alter table wellness_logs     enable row level security;
alter table journal_entries   enable row level security;
alter table pomodoro_sessions enable row level security;
alter table profiles          enable row level security;
alter table calendar_events   enable row level security;

create policy "tasks_own"             on tasks             for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "subtasks_own"          on subtasks          for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "habits_own"            on habits            for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "reminders_own"         on reminders         for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "notes_own"             on notes             for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "goals_own"             on goals             for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "finance_entries_own"   on finance_entries   for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "savings_goals_own"     on savings_goals     for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "wellness_logs_own"     on wellness_logs     for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "journal_entries_own"   on journal_entries   for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "pomodoro_sessions_own" on pomodoro_sessions for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "calendar_events_own"   on calendar_events   for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "profiles_own"          on profiles          for all using (auth.uid()=id)      with check (auth.uid()=id);

-- Auto-create profile on signup
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

-- Auto-update updated_at
create or replace function update_updated_at() returns trigger language plpgsql as $$
begin new.updated_at=now(); return new; end;
$$;
create trigger t1 before update on tasks           for each row execute procedure update_updated_at();
create trigger t2 before update on habits          for each row execute procedure update_updated_at();
create trigger t3 before update on notes           for each row execute procedure update_updated_at();
create trigger t4 before update on goals           for each row execute procedure update_updated_at();
create trigger t5 before update on wellness_logs   for each row execute procedure update_updated_at();
create trigger t6 before update on journal_entries for each row execute procedure update_updated_at();
create trigger t7 before update on profiles        for each row execute procedure update_updated_at();
create trigger t8 before update on savings_goals   for each row execute procedure update_updated_at();
