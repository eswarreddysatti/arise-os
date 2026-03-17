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

// Auth
export const authAPI = supabase.auth;

// Profile
export const profileAPI = {
  get: async (uid) => IS_MOCK ? mockData({ full_name: 'Eswar Reddy', career_goal: 'Cybersecurity Expert', location: 'India', dark_mode: true }) : supabase.from('profiles').select('*').eq('id', uid).single(),
  update: async (uid, data) => IS_MOCK ? mockData(data) : supabase.from('profiles').update(data).eq('id', uid).select().single(),
};

// Tasks
export const tasksAPI = {
  getAll: async (uid) => IS_MOCK ? mockData([]) : supabase.from('tasks').select('*, subtasks(*)').eq('user_id', uid).order('created_at', { ascending: false }),
  add: async (uid, task) => IS_MOCK ? mockData({ id: Date.now().toString(), ...task }) : supabase.from('tasks').insert([{ ...task, user_id: uid }]).select().single(),
  update: async (id, data) => IS_MOCK ? mockData({ id, ...data }) : supabase.from('tasks').update(data).eq('id', id).select().single(),
  delete: async (id) => IS_MOCK ? mockData(null) : supabase.from('tasks').delete().eq('id', id),
  // Subtasks
  addSubtask: async (uid, taskId, title) => IS_MOCK ? mockData({ id: Date.now().toString(), task_id: taskId, title, done: false }) : supabase.from('subtasks').insert([{ user_id: uid, task_id: taskId, title, done: false }]).select().single(),
  updateSubtask: async (id, data) => IS_MOCK ? mockData({ id, ...data }) : supabase.from('subtasks').update(data).eq('id', id).select().single(),
};

// Habits
export const habitsAPI = {
  getAll: async (uid) => IS_MOCK ? mockData([]) : supabase.from('habits').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
  add: async (uid, habit) => IS_MOCK ? mockData({ id: Date.now().toString(), ...habit }) : supabase.from('habits').insert([{ ...habit, user_id: uid }]).select().single(),
  update: async (id, data) => IS_MOCK ? mockData({ id, ...data }) : supabase.from('habits').update(data).eq('id', id).select().single(),
  delete: async (id) => IS_MOCK ? mockData(null) : supabase.from('habits').delete().eq('id', id),
};

// Reminders
export const remindersAPI = {
  getAll: async (uid) => IS_MOCK ? mockData([]) : supabase.from('reminders').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
  add: async (uid, rem) => IS_MOCK ? mockData({ id: Date.now().toString(), ...rem }) : supabase.from('reminders').insert([{ ...rem, user_id: uid }]).select().single(),
  update: async (id, data) => IS_MOCK ? mockData({ id, ...data }) : supabase.from('reminders').update(data).eq('id', id).select().single(),
  delete: async (id) => IS_MOCK ? mockData(null) : supabase.from('reminders').delete().eq('id', id),
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
