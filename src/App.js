import React, { useState, useEffect, useCallback } from "react";
import {
  supabase, profileAPI,
  tasksAPI, habitsAPI, remindersAPI, notesAPI, goalsAPI,
  calendarAPI, focusAPI, wellnessAPI, subscribe
} from "./lib/supabase";

// Theme & Global Styles
import { makeTheme, getShadow, GS } from "./components/Theme";

// Navigation & Components
import { TopBar, BottomNav } from "./components/Navigation";
import { Toast, Loader } from "./components/SharedUI";

// Pages
import { AuthScreen } from "./pages/Auth";
import { HomePage } from "./pages/Home";
import { TasksPage } from "./pages/Tasks";
import { CalendarPage } from "./pages/Calendar";
import { HabitsPage } from "./pages/Habits";
import { NotesPage } from "./pages/Notes";
import { MorePage } from "./pages/More";
import { RemindersPage } from "./pages/Reminders";
import { ProfilePage } from "./pages/Profile";
import { PomodoroPage } from "./pages/Pomodoro";
import { FinancePage } from "./pages/Finance";
import { WellnessPage } from "./pages/Wellness";
import { JournalPage } from "./pages/Journal";
import { GoalsPage } from "./pages/Goals";

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [page, setPage] = useState("home");
  const [toast, setToast] = useState("");
  const [profile, setProfile] = useState(null);

  // Data state
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [notes, setNotes] = useState([]);
  const [goals, setGoals] = useState([]);
  const [events, setEvents] = useState([]);
  const [focusSessions, setFocusSessions] = useState([]);
  const [wellness, setWellness] = useState({ water: 0, steps: 0, mood: 3, sleep: 0 });

  const t = makeTheme(darkMode);
  const sh = getShadow(t);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }, []);

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Supabase Session Error:", error);
        setToast("Error connecting to Supabase: " + error.message);
      }
      setSession(session);
      setAuthLoading(false);
    }).catch(err => {
      console.error("Supabase Catch Error:", err);
      setToast("Fatal Supabase Error: " + err.message);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });
    return () => subscription?.unsubscribe();
  }, []);

  // Real-time Subscriptions
  useEffect(() => {
    if (!session?.user?.id) return;
    const focusSub = subscribe('focus_sessions', (payload) => {
      if (payload.new && payload.new.user_id === session.user.id) {
        if (payload.eventType === 'INSERT') setFocusSessions(prev => [payload.new, ...prev]);
        else if (payload.eventType === 'UPDATE') setFocusSessions(prev => prev.map(s => s.id === payload.new.id ? payload.new : s));
      }
    });
    const wellnessSub = subscribe('wellness_logs', (payload) => {
      const today = new Date().toISOString().split('T')[0];
      if (payload.new && payload.new.user_id === session.user.id && payload.new.log_date === today) {
        setWellness(payload.new);
      }
    });
    const tasksSub = subscribe('tasks', (payload) => {
      if (payload.new && payload.new.user_id === session.user.id) {
        if (payload.eventType === 'INSERT') setTasks(prev => [payload.new, ...prev]);
        else if (payload.eventType === 'UPDATE') setTasks(prev => prev.map(t2 => t2.id === payload.new.id ? payload.new : t2));
        else if (payload.eventType === 'DELETE') setTasks(prev => prev.filter(t2 => t2.id === payload.old.id));
      }
    });

    return () => {
      focusSub.unsubscribe();
      wellnessSub.unsubscribe();
      tasksSub.unsubscribe();
    };
  }, [session]);

  // Load all data when session exists
  useEffect(() => {
    if (!session?.user?.id) return;
    const uid = session.user.id;
    const today = new Date().toISOString().split('T')[0];
    
    const load = async () => {
      try {
        const [
          { data: t2 }, { data: h }, { data: r }, { data: n }, { data: g }, { data: e }, { data: p }, { data: f }, { data: w }
        ] = await Promise.all([
          tasksAPI.getAll(uid), habitsAPI.getAll(uid), remindersAPI.getAll(uid),
          notesAPI.getAll(uid), goalsAPI.getAll(uid), calendarAPI.getAll(uid), profileAPI.get(uid),
          focusAPI.getAll(uid), wellnessAPI.getToday(uid, today)
        ]);
        if (t2) setTasks(t2);
        if (h) setHabits(h);
        if (r) setReminders(r);
        if (n) setNotes(n);
        if (g) setGoals(g);
        if (e) setEvents(e);
        if (f) setFocusSessions(f);
        if (w) setWellness(w);
        if (p) { setProfile(p); setDarkMode(p.dark_mode || false); }
      } catch (err) {
        console.error("Load Error:", err);
      }
    };
    load();
  }, [session]);

  // Persist dark mode
  useEffect(() => {
    if (!session?.user?.id || !profile) return;
    profileAPI.update(session.user.id, { dark_mode: darkMode });
  }, [darkMode, session?.user?.id, profile]);

  const toggleDark = () => setDarkMode(d => !d);
  const mainPages = ["home", "tasks", "cal", "habits", "more"];
  const activeTab = mainPages.includes(page) ? page : "more";
  const uid = session?.user?.id;

  if (authLoading) return <><style>{GS(t)}</style><Loader t={t} /></>;
  if (!session) return <><style>{GS(t)}</style><AuthScreen t={t} sh={sh} onToast={showToast} /></>;

  const shared = { t, sh, userId: uid, onToast: showToast };
  const pageComponents = {
    home: <HomePage {...shared} tasks={tasks} habits={habits} focusSessions={focusSessions} wellness={wellness} profile={profile} setPage={setPage} />,
    tasks: <TasksPage {...shared} tasks={tasks} setTasks={setTasks} />,
    cal: <CalendarPage {...shared} tasks={tasks} events={events} setEvents={setEvents} />,
    habits: <HabitsPage {...shared} habits={habits} setHabits={setHabits} />,
    more: <MorePage t={t} sh={sh} setPage={setPage} />,
    notes: <NotesPage {...shared} notes={notes} setNotes={setNotes} />,
    pomodoro: <PomodoroPage {...shared} onSessionEnd={(s) => setFocusSessions([s, ...focusSessions])} />,
    finance: <FinancePage {...shared} />,
    wellness: <WellnessPage {...shared} wellness={wellness} setWellness={setWellness} />,
    journal: <JournalPage {...shared} />,
    goals: <GoalsPage {...shared} goals={goals} setGoals={setGoals} />,
    reminders: <RemindersPage {...shared} reminders={reminders} setReminders={setReminders} />,
    profile: <ProfilePage {...shared} darkMode={darkMode} toggleDark={toggleDark} profile={profile} setProfile={setProfile} tasks={tasks} habits={habits} notes={notes} />,
  };

  return (
    <>
      <style>{GS(t)}</style>
      <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: t.bg, position: "relative", transition: "background 0.4s" }}>
        <TopBar title={!mainPages.includes(page) ? page.toUpperCase() : "ARISE"} darkMode={darkMode} toggleDark={toggleDark} onBell={() => setPage("reminders")} t={t} sh={sh} logo={profile?.logo_url} />
        <div key={page} style={{ animation: "fadeUp 0.4s ease-out" }}>{pageComponents[page] || pageComponents.home}</div>
        <BottomNav active={activeTab} setActive={setPage} t={t} sh={sh} />
        <Toast msg={toast} t={t} sh={sh} />
      </div>
    </>
  );
}
