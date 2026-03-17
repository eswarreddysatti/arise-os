import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// If URL/Key are missing, we default to Mock mode automatically
const IS_MOCK = !SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL === 'your-url';

export const supabase = IS_MOCK ? {
  auth: {
    getSession: async () => ({ data: { session: { user: { id: 'mock-user-123' } } }, error: null }),
    onAuthStateChange: (cb) => {
      setTimeout(() => cb('SIGNED_IN', { user: { id: 'mock-user-123' } }), 100);
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signUp: async () => ({ data: { user: { id: 'mock-user-123' } }, error: null }),
    signInWithPassword: async () => ({ data: { user: { id: 'mock-user-123' } }, error: null }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: { id: 'mock-user-123' } }, error: null })
  }
} : createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const mockData = (data) => Promise.resolve({ data, error: null });

// Mock state for local testing persistence
let localMockWellness = {
  water_intake_ml: 0, 
  water_bottle_snapshot_ml: 500,
  water_goal_snapshot_litres: 2.5,
  steps: 0, 
  steps_goal_snapshot: 8000,
  mood: 3,
  mood_note: '',
  sleep_start: null,
  sleep_wake: null
};

const mockUpdateWellness = (updates) => {
  localMockWellness = { ...localMockWellness, ...updates };
  return Promise.resolve({ data: localMockWellness, error: null });
};

// Auth
export const authAPI = supabase.auth;

// Profile
export const profileAPI = {
  get: async (uid) => IS_MOCK ? mockData({ full_name: 'Eswar Reddy', career_goal: 'Cybersecurity Expert', location: 'India', dark_mode: true, avatar_url: '', logo_url: '' }) : supabase.from('profiles').select('*').eq('id', uid).single(),
  update: async (uid, data) => IS_MOCK ? mockData(data) : supabase.from('profiles').update(data).eq('id', uid).select().single(),
};

// Tasks
export const tasksAPI = {
  getAll: async (uid) => IS_MOCK ? mockData([]) : supabase.from('tasks').select('*, subtasks(*)').eq('user_id', uid).order('created_at', { ascending: false }),
  add: async (uid, task) => IS_MOCK ? mockData({ id: Date.now().toString(), ...task }) : supabase.from('tasks').insert([{ ...task, user_id: uid }]).select().single(),
  update: async (id, data) => IS_MOCK ? mockData({ id, ...data }) : supabase.from('tasks').update(data).eq('id', id).select().single(),
  delete: async (id) => IS_MOCK ? mockData(null) : supabase.from('tasks').delete().eq('id', id),
  // Subtasks
  addSubtask: async (uid, taskId, title, extras = {}) => IS_MOCK ? mockData({ id: Date.now().toString(), task_id: taskId, title, done: false, ...extras }) : supabase.from('subtasks').insert([{ user_id: uid, task_id: taskId, title, done: false, ...extras }]).select().single(),
  updateSubtask: async (id, data) => IS_MOCK ? mockData({ id, ...data }) : supabase.from('subtasks').update(data).eq('id', id).select().single(),
  deleteSubtask: async (id) => IS_MOCK ? mockData(null) : supabase.from('subtasks').delete().eq('id', id),
};

// Habits
export const habitsAPI = {
  getAll: async (uid) => IS_MOCK ? mockData([]) : supabase.from('habits').select('*, habit_logs(*)').eq('user_id', uid).order('created_at', { ascending: false }),
  add: async (uid, habit) => IS_MOCK ? mockData({ id: Date.now().toString(), ...habit }) : supabase.from('habits').insert([{ ...habit, user_id: uid }]).select().single(),
  update: async (id, data) => IS_MOCK ? mockData({ id, ...data }) : supabase.from('habits').update(data).eq('id', id).select().single(),
  delete: async (id) => IS_MOCK ? mockData(null) : supabase.from('habits').delete().eq('id', id),
  // Logs
  log: async (uid, habitId, log_date, completed = true) => IS_MOCK ? mockData({ id: 'mock-log', habit_id: habitId, log_date, completed }) : supabase.from('habit_logs').upsert({ user_id: uid, habit_id: habitId, log_date, completed }).select().single(),
};

// Focus Sessions
export const focusAPI = {
  getAll: async (uid) => IS_MOCK ? mockData([]) : supabase.from('focus_sessions').select('*').eq('user_id', uid).order('start_time', { ascending: false }),
  start: async (uid, session) => IS_MOCK ? mockData({ id: Date.now().toString(), ...session }) : supabase.from('focus_sessions').insert([{ ...session, user_id: uid }]).select().single(),
  update: async (id, data) => IS_MOCK ? mockData({ id, ...data }) : supabase.from('focus_sessions').update(data).eq('id', id).select().single(),
};

// Wellness
export const wellnessAPI = {
  getToday: async (uid, date) => {
    if (IS_MOCK) return mockData(localMockWellness);
    const { data, error } = await supabase.from('wellness_logs').select('*').eq('user_id', uid).eq('log_date', date).maybeSingle();
    return { data: data || {}, error: (error && error.code !== 'PGRST116') ? error : null };
  },
  update: async (uid, date, data) => IS_MOCK ? mockUpdateWellness(data) : supabase.from('wellness_logs').upsert({ user_id: uid, log_date: date, ...data }, { onConflict: 'user_id,log_date' }).select().single(),
};

// Notes
export const notesAPI = {
  getAll: async (uid) => IS_MOCK ? mockData([]) : supabase.from('notes').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
  add: async (uid, note) => IS_MOCK ? mockData({ id: Date.now().toString(), ...note }) : supabase.from('notes').insert([{ ...note, user_id: uid }]).select().single(),
  update: async (id, data) => IS_MOCK ? mockData({ id, ...data }) : supabase.from('notes').update(data).eq('id', id).select().single(),
  delete: async (id) => IS_MOCK ? mockData(null) : supabase.from('notes').delete().eq('id', id),
};

// Goals
export const goalsAPI = {
  getAll: async (uid) => IS_MOCK ? mockData([]) : supabase.from('goals').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
  add: async (uid, goal) => IS_MOCK ? mockData({ id: Date.now().toString(), ...goal }) : supabase.from('goals').insert([{ ...goal, user_id: uid }]).select().single(),
  update: async (id, data) => IS_MOCK ? mockData({ id, ...data }) : supabase.from('goals').update(data).eq('id', id).select().single(),
  delete: async (id) => IS_MOCK ? mockData(null) : supabase.from('goals').delete().eq('id', id),
};

// Calendar (Events)
export const calendarAPI = {
  getAll: async (uid) => IS_MOCK ? mockData([]) : supabase.from('calendar_events').select('*').eq('user_id', uid).order('event_date', { ascending: true }),
  add: async (uid, event) => IS_MOCK ? mockData({ id: Date.now().toString(), ...event }) : supabase.from('calendar_events').insert([{ ...event, user_id: uid }]).select().single(),
  delete: async (id) => IS_MOCK ? mockData(null) : supabase.from('calendar_events').delete().eq('id', id),
};

// Reminders
export const remindersAPI = {
  getAll: async (uid) => IS_MOCK ? mockData([]) : supabase.from('reminders').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
  add: async (uid, reminder) => IS_MOCK ? mockData({ id: Date.now().toString(), ...reminder }) : supabase.from('reminders').insert([{ ...reminder, user_id: uid }]).select().single(),
  update: async (id, data) => IS_MOCK ? mockData({ id, ...data }) : supabase.from('reminders').update(data).eq('id', id).select().single(),
  delete: async (id) => IS_MOCK ? mockData(null) : supabase.from('reminders').delete().eq('id', id),
};
// Subscriptions helper
export const subscribe = (table, callback) => {
  if (IS_MOCK) return { unsubscribe: () => {} };
  return supabase
    .channel(`${table}-changes`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => callback(payload))
    .subscribe();
};
