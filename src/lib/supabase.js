// --- TEMPORARY MOCKED SUPABASE CLIENT FOR UI TESTING ---
// This bypasses the need for a .env file and allows the app to load locally.

export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: { user: { id: 'mock-user-123' } } }, error: null }),
    onAuthStateChange: (cb) => {
      // immediately fire authenticated event
      setTimeout(() => cb('SIGNED_IN', { user: { id: 'mock-user-123' } }), 100);
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signUp: async () => ({ data: { user: { id: 'mock-user-123' } }, error: null }),
    signInWithPassword: async () => ({ data: { user: { id: 'mock-user-123' } }, error: null }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: { id: 'mock-user-123' } }, error: null })
  }
};

export const authAPI = supabase.auth;

const mockData = (data) => Promise.resolve({ data, error: null });

export const profileAPI = {
  get: () => mockData({ full_name: 'Test User', career_goal: 'Test Goal', location: 'Localhost', dark_mode: false }),
  update: (_, data) => mockData(data),
};

export const tasksAPI = {
  getAll: () => mockData([]),
  add: (_, task) => mockData({ id: Date.now().toString(), ...task }),
  update: (id, data) => mockData({ id, ...data }),
  delete: () => mockData(null),
  addSubtask: (_, taskId, title) => mockData({ id: Date.now().toString(), task_id: taskId, title, done: false }),
  toggleSubtask: () => mockData(null),
  deleteSubtask: () => mockData(null),
};

export const habitsAPI = {
  getAll: () => mockData([]),
  add: (_, habit) => mockData({ id: Date.now().toString(), ...habit }),
  update: (id, data) => mockData({ id, ...data }),
  delete: () => mockData(null),
};

export const remindersAPI = {
  getAll: () => mockData([]),
  add: (_, r) => mockData({ id: Date.now().toString(), ...r }),
  update: () => mockData(null),
  delete: () => mockData(null),
};

export const notesAPI = {
  getAll: () => mockData([]),
  add: (_, note) => mockData({ id: Date.now().toString(), ...note }),
  update: (id, data) => mockData({ id, ...data }),
  delete: () => mockData(null),
};

export const goalsAPI = {
  getAll: () => mockData([]),
  add: (_, goal) => mockData({ id: Date.now().toString(), ...goal }),
  update: (id, data) => mockData({ id, ...data }),
  delete: () => mockData(null),
};

export const financeAPI = {
  getEntries: () => mockData([]),
  addEntry: (_, entry) => mockData({ id: Date.now().toString(), ...entry }),
  deleteEntry: () => mockData(null),
  getSavingsGoal: () => mockData({ target: 10000, saved: 500 }),
  upsertSavingsGoal: (_, data) => mockData(data),
};

export const wellnessAPI = {
  getToday: () => mockData({ water: 0, sleep: 0, steps: 0, mood: 2 }),
  upsertToday: (_, data) => mockData(data),
};

export const journalAPI = {
  getAll: () => mockData([]),
  add: (_, entry) => mockData({ id: Date.now().toString(), ...entry }),
  update: (id, data) => mockData({ id, ...data }),
  delete: () => mockData(null),
};

export const calendarAPI = {
  getAll: () => mockData([]),
  add: (_, event) => mockData({ id: Date.now().toString(), ...event }),
  delete: () => mockData(null),
};

export const pomodoroAPI = {
  getHistory: () => mockData([]),
  logSession: (_, workMinutes) => mockData({ id: Date.now().toString(), work_minutes: workMinutes }),
};

