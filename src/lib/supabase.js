import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
});

export const authAPI = {
  signUp: (email, password, fullName) =>
    supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } }),
  signIn: (email, password) =>
    supabase.auth.signInWithPassword({ email, password }),
  signOut: () => supabase.auth.signOut(),
  getUser: () => supabase.auth.getUser(),
  onAuthChange: (cb) => supabase.auth.onAuthStateChange(cb),
};

export const profileAPI = {
  get: (userId) => supabase.from('profiles').select('*').eq('id', userId).single(),
  update: (userId, data) => supabase.from('profiles').update(data).eq('id', userId).select('*').single(),
};

export const tasksAPI = {
  getAll: (userId) => supabase.from('tasks').select('*, subtasks(*)').eq('user_id', userId).order('created_at', { ascending: false }),
  add: (userId, task) => supabase.from('tasks').insert({ ...task, user_id: userId }).select('*').single(),
  update: (id, data) => supabase.from('tasks').update(data).eq('id', id).select('*').single(),
  delete: (id) => supabase.from('tasks').delete().eq('id', id),
  addSubtask: (userId, taskId, title) => supabase.from('subtasks').insert({ user_id: userId, task_id: taskId, title }).select('*').single(),
  toggleSubtask: (id, done) => supabase.from('subtasks').update({ done }).eq('id', id),
  deleteSubtask: (id) => supabase.from('subtasks').delete().eq('id', id),
};

export const habitsAPI = {
  getAll: (userId) => supabase.from('habits').select('*').eq('user_id', userId).order('created_at'),
  add: (userId, habit) => supabase.from('habits').insert({ ...habit, user_id: userId }).select('*').single(),
  update: (id, data) => supabase.from('habits').update(data).eq('id', id).select('*').single(),
  delete: (id) => supabase.from('habits').delete().eq('id', id),
};

export const remindersAPI = {
  getAll: (userId) => supabase.from('reminders').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
  add: (userId, r) => supabase.from('reminders').insert({ ...r, user_id: userId }).select('*').single(),
  update: (id, data) => supabase.from('reminders').update(data).eq('id', id),
  delete: (id) => supabase.from('reminders').delete().eq('id', id),
};

export const notesAPI = {
  getAll: (userId) => supabase.from('notes').select('*').eq('user_id', userId).order('pinned', { ascending: false }).order('created_at', { ascending: false }),
  add: (userId, note) => supabase.from('notes').insert({ ...note, user_id: userId }).select('*').single(),
  update: (id, data) => supabase.from('notes').update(data).eq('id', id).select('*').single(),
  delete: (id) => supabase.from('notes').delete().eq('id', id),
};

export const goalsAPI = {
  getAll: (userId) => supabase.from('goals').select('*').eq('user_id', userId).order('created_at'),
  add: (userId, goal) => supabase.from('goals').insert({ ...goal, user_id: userId }).select('*').single(),
  update: (id, data) => supabase.from('goals').update(data).eq('id', id).select('*').single(),
  delete: (id) => supabase.from('goals').delete().eq('id', id),
};

export const financeAPI = {
  getEntries: (userId) => supabase.from('finance_entries').select('*').eq('user_id', userId).order('entry_date', { ascending: false }),
  addEntry: (userId, entry) => supabase.from('finance_entries').insert({ ...entry, user_id: userId }).select('*').single(),
  deleteEntry: (id) => supabase.from('finance_entries').delete().eq('id', id),
  getSavingsGoal: (userId) => supabase.from('savings_goals').select('*').eq('user_id', userId).single(),
  upsertSavingsGoal: (userId, data) => supabase.from('savings_goals').upsert({ ...data, user_id: userId }, { onConflict: 'user_id' }).select('*').single(),
};

export const wellnessAPI = {
  getToday: (userId) => {
    const today = new Date().toISOString().split('T')[0];
    return supabase.from('wellness_logs').select('*').eq('user_id', userId).eq('log_date', today).single();
  },
  upsertToday: (userId, data) => {
    const today = new Date().toISOString().split('T')[0];
    return supabase.from('wellness_logs').upsert({ ...data, user_id: userId, log_date: today }, { onConflict: 'user_id,log_date' }).select('*').single();
  },
};

export const journalAPI = {
  getAll: (userId) => supabase.from('journal_entries').select('*').eq('user_id', userId).order('entry_date', { ascending: false }),
  add: (userId, entry) => supabase.from('journal_entries').insert({ ...entry, user_id: userId }).select('*').single(),
  update: (id, data) => supabase.from('journal_entries').update(data).eq('id', id).select('*').single(),
  delete: (id) => supabase.from('journal_entries').delete().eq('id', id),
};

export const calendarAPI = {
  getAll: (userId) => supabase.from('calendar_events').select('*').eq('user_id', userId).order('event_date'),
  add: (userId, event) => supabase.from('calendar_events').insert({ ...event, user_id: userId }).select('*').single(),
  delete: (id) => supabase.from('calendar_events').delete().eq('id', id),
};

export const pomodoroAPI = {
  getHistory: (userId, limit = 10) => supabase.from('pomodoro_sessions').select('*').eq('user_id', userId).order('completed_at', { ascending: false }).limit(limit),
  logSession: (userId, workMinutes) => supabase.from('pomodoro_sessions').insert({ user_id: userId, work_minutes: workMinutes }).select('*').single(),
};
