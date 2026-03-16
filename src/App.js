import { useState, useEffect, useRef, useCallback } from "react";
import {
  supabase, authAPI, profileAPI,
  tasksAPI, habitsAPI, remindersAPI, notesAPI, goalsAPI,
  financeAPI, wellnessAPI, journalAPI, calendarAPI, pomodoroAPI
} from "./lib/supabase";

// ─── THEME ───────────────────────────────────────────────────────────────────
const makeTheme = (dark) => ({
  bg: dark ? "#141414" : "#E8E6E1", bgDeep: dark ? "#0e0e0e" : "#DEDAD4",
  card: dark ? "#1E1E1E" : "#ECEAE5", cardHigh: dark ? "#252525" : "#F2F0EB",
  white: dark ? "#1E1E1E" : "#FFFFFF", black: dark ? "#F0EEE9" : "#141414",
  grey: dark ? "#666" : "#888", lightGrey: dark ? "#3a3a3a" : "#C8C5BF",
  accent: dark ? "#E0DDD7" : "#1A1A1A", accentSoft: dark ? "#2a2a2a" : "#D0CEC9",
  orange: "#E8500A", sdark: dark ? "rgba(0,0,0,0.5)" : "rgba(180,176,168,0.8)",
  slight: dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.9)", dark,
});

const getShadow = (t) => ({
  card: `8px 8px 24px ${t.sdark}, -4px -4px 14px ${t.slight}`,
  inset: `inset 5px 5px 14px ${t.sdark}, inset -3px -3px 10px ${t.slight}`,
  btn: `6px 6px 18px ${t.sdark}, -3px -3px 10px ${t.slight}`,
  raised: `12px 12px 32px ${t.sdark}, -6px -6px 18px ${t.slight}`,
});

const GS = (t) => `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600;700;800;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
  body{background:${t.bg};font-family:'Barlow',sans-serif;color:${t.black};min-height:100vh;overscroll-behavior:none;transition:background 0.4s;}
  ::-webkit-scrollbar{width:0;height:0;}
  input,textarea,select{font-family:'Barlow',sans-serif;outline:none;border:none;background:transparent;color:${t.black};}
  button{font-family:'Barlow',sans-serif;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
  .page{animation:fadeUp 0.35s ease forwards;}
  .spin{animation:spin 1s linear infinite;}
`;

// ─── ICONS ───────────────────────────────────────────────────────────────────
const I = ({ n, s = 20, c, sw = 1.5 }) => {
  const col = c || "currentColor";
  const p = { width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: col, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round" };
  const icons = {
    home: <svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9,22 9,12 15,12 15,22" /></svg>,
    tasks: <svg {...p}><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M9 12l2 2 4-4" /></svg>,
    cal: <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    habit: <svg {...p}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
    more: <svg {...p}><circle cx="5" cy="12" r="1" fill={col} /><circle cx="12" cy="12" r="1" fill={col} /><circle cx="19" cy="12" r="1" fill={col} /></svg>,
    notes: <svg {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>,
    timer: <svg {...p}><circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" /></svg>,
    finance: <svg {...p}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>,
    wellness: <svg {...p}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>,
    journal: <svg {...p}><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>,
    profile: <svg {...p}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    bell: <svg {...p}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>,
    plus: <svg {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    check: <svg {...p}><polyline points="20,6 9,17 4,12" /></svg>,
    trash: <svg {...p}><polyline points="3,6 5,6 21,6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>,
    edit: <svg {...p}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
    chL: <svg {...p}><polyline points="15,18 9,12 15,6" /></svg>,
    chR: <svg {...p}><polyline points="9,18 15,12 9,6" /></svg>,
    x: <svg {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    fire: <svg {...p}><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 3z" /></svg>,
    moon: <svg {...p}><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>,
    sun: <svg {...p}><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>,
    search: <svg {...p}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
    goal: <svg {...p}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>,
    water: <svg {...p}><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" /></svg>,
    sleep: <svg {...p}><path d="M17 18a5 5 0 00-10 0" /><line x1="12" y1="2" x2="12" y2="9" /><line x1="4.22" y1="10.22" x2="5.64" y2="11.64" /><line x1="1" y1="18" x2="3" y2="18" /><line x1="21" y1="18" x2="23" y2="18" /><line x1="18.36" y1="11.64" x2="19.78" y2="10.22" /><line x1="23" y1="22" x2="1" y2="22" /><polyline points="8,6 12,2 16,6" /></svg>,
    mood: <svg {...p}><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>,
    steps: <svg {...p}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
    star: <svg {...p}><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>,
    save: <svg {...p}><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17,21 17,13 7,13 7,21" /><polyline points="7,3 7,8 15,8" /></svg>,
    pause: <svg {...p}><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>,
    play: <svg {...p}><polygon points="5,3 19,12 5,21" /></svg>,
    refresh: <svg {...p}><polyline points="1,4 1,10 7,10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" /></svg>,
    income: <svg {...p}><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5,12 12,5 19,12" /></svg>,
    expense: <svg {...p}><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19,12 12,19 5,12" /></svg>,
    pin: <svg {...p}><line x1="12" y1="17" x2="12" y2="22" /><path d="M5 17h14v-1.76a2 2 0 00-1.11-1.79l-1.78-.9A2 2 0 0115 10.76V6h1a2 2 0 000-4H8a2 2 0 000 4h1v4.76a2 2 0 01-1.11 1.79l-1.78.9A2 2 0 005 15.24V17z" /></svg>,
    logout: <svg {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    eye: <svg {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
    eyeOff: <svg {...p}><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>,
  };
  return <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icons[n] || null}</span>;
};

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const Card = ({ children, style = {}, t, sh, ...props }) => (
  <div style={{ background: t.card, borderRadius: 24, boxShadow: sh.card, padding: 20, ...style }} {...props}>{children}</div>
);
const Pill = ({ children, active, onClick, t, sh, style = {} }) => (
  <button onClick={onClick} style={{ padding: "8px 18px", border: "none", cursor: "pointer", whiteSpace: "nowrap", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", background: active ? t.accent : t.card, color: active ? t.bg : t.grey, borderRadius: 50, boxShadow: active ? sh.btn : sh.card, transition: "all 0.2s ease", ...style }}>{children}</button>
);
const CheckBtn = ({ checked, onToggle, t, sh, size = 30 }) => (
  <button onClick={onToggle} style={{ width: size, height: size, borderRadius: size * 0.3, border: "none", cursor: "pointer", background: checked ? t.accent : t.bg, boxShadow: checked ? sh.btn : sh.inset, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.25s ease" }}>
    {checked && <I n="check" s={size * 0.5} c={t.bg} sw={3} />}
  </button>
);
const IconBtn = ({ icon, onClick, t, sh, size = 38, active = false }) => (
  <button onClick={onClick} style={{ width: size, height: size, borderRadius: size * 0.3, border: "none", cursor: "pointer", background: active ? t.accent : t.card, boxShadow: active ? sh.btn : sh.card, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease" }}>
    <I n={icon} s={size * 0.45} c={active ? t.bg : t.grey} />
  </button>
);
const NeuInput = ({ style = {}, t, sh, ...props }) => (
  <input style={{ width: "100%", padding: "12px 16px", borderRadius: 14, background: t.bg, boxShadow: sh.inset, fontSize: 14, fontWeight: 500, color: t.black, ...style }} {...props} />
);
const NeuTextarea = ({ style = {}, t, sh, ...props }) => (
  <textarea style={{ width: "100%", padding: "12px 16px", borderRadius: 14, background: t.bg, boxShadow: sh.inset, fontSize: 14, fontWeight: 500, color: t.black, resize: "none", lineHeight: 1.6, ...style }} {...props} />
);
const SectionLabel = ({ children, t }) => (
  <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: t.grey, marginBottom: 12 }}>{children}</p>
);
const BigNumber = ({ children, t, style = {} }) => (
  <span style={{ fontFamily: "'Bebas Neue'", fontSize: 72, lineHeight: 1, color: t.black, letterSpacing: "0.02em", ...style }}>{children}</span>
);
const ActionBtn = ({ children, onClick, t, sh, secondary = false, style = {}, disabled = false }) => (
  <button onClick={onClick} disabled={disabled} style={{ padding: "14px 20px", border: "none", cursor: disabled ? "not-allowed" : "pointer", borderRadius: 16, background: secondary ? t.bg : t.accent, color: secondary ? t.grey : t.bg, boxShadow: secondary ? sh.card : sh.btn, fontSize: 14, fontWeight: 700, letterSpacing: "0.06em", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s ease", opacity: disabled ? 0.6 : 1, ...style }}>{children}</button>
);
const Toast = ({ msg, t, sh }) => msg ? (
  <div style={{ position: "fixed", bottom: 110, left: "50%", transform: "translateX(-50%)", background: t.accent, color: t.bg, padding: "12px 24px", borderRadius: 50, fontSize: 13, fontWeight: 700, boxShadow: sh.raised, zIndex: 999, whiteSpace: "nowrap" }}>{msg}</div>
) : null;
const Loader = ({ t }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", background: t.bg }}>
    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 48, letterSpacing: "0.12em", color: t.black, marginBottom: 24 }}>ARISE</div>
    <div className="spin" style={{ width: 28, height: 28, border: `3px solid ${t.lightGrey}`, borderTopColor: t.accent, borderRadius: "50%" }} />
  </div>
);

// ─── NAV ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "home", icon: "home", label: "Home" },
  { id: "tasks", icon: "tasks", label: "Tasks" },
  { id: "cal", icon: "cal", label: "Cal" },
  { id: "habits", icon: "habit", label: "Habits" },
  { id: "more", icon: "more", label: "More" },
];
const BottomNav = ({ active, setActive, t, sh }) => (
  <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: t.card, boxShadow: `0 -6px 28px ${t.sdark}`, padding: "10px 16px 28px", display: "flex", justifyContent: "space-around", alignItems: "center", zIndex: 100, borderRadius: "28px 28px 0 0", transition: "background 0.4s" }}>
    {TABS.map(tab => {
      const isActive = active === tab.id;
      return (
        <button key={tab.id} onClick={() => setActive(tab.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 12px", border: "none", cursor: "pointer", background: isActive ? t.accent : "transparent", borderRadius: 50, transition: "all 0.25s", color: isActive ? t.bg : t.grey }}>
          <I n={tab.icon} s={20} c={isActive ? t.bg : t.grey} sw={isActive ? 2 : 1.5} />
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>{tab.label}</span>
        </button>
      );
    })}
  </div>
);
const TopBar = ({ title, darkMode, toggleDark, onBell, t, sh }) => (
  <div style={{ position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, zIndex: 50, background: t.bg, padding: "16px 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "background 0.4s" }}>
    <span style={{ fontFamily: "'Bebas Neue'", fontSize: 22, letterSpacing: "0.12em", color: t.black }}>{title || "ARISE"}</span>
    <div style={{ display: "flex", gap: 8 }}>
      <IconBtn icon={darkMode ? "sun" : "moon"} onClick={toggleDark} t={t} sh={sh} size={36} />
      <div style={{ position: "relative" }}>
        <IconBtn icon="bell" onClick={onBell} t={t} sh={sh} size={36} />
        <div style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: "50%", background: t.orange }} />
      </div>
    </div>
  </div>
);

// ─── AUTH SCREEN ─────────────────────────────────────────────────────────────
const AuthScreen = ({ t, sh, onToast }) => {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      if (mode === "login") {
        const { error: e } = await authAPI.signIn(email, password);
        if (e) throw e;
      } else {
        if (!name.trim()) { setError("Please enter your name."); setLoading(false); return; }
        const { error: e } = await authAPI.signUp(email, password, name);
        if (e) throw e;
        onToast("Check your email to confirm your account!");
      }
    } catch (e) {
      setError(e.message || "Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ marginBottom: 48, textAlign: "center" }}>
        <BigNumber t={t} style={{ fontSize: 80 }}>ARISE</BigNumber>
        <p style={{ fontSize: 14, color: t.grey, fontWeight: 500, marginTop: 8, letterSpacing: "0.06em" }}>Personal Life OS</p>
      </div>

      <div style={{ width: "100%", maxWidth: 380 }}>
        {/* Mode Toggle */}
        <div style={{ display: "flex", background: t.card, borderRadius: 50, boxShadow: sh.inset, padding: 4, marginBottom: 28 }}>
          {["login", "signup"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); }} style={{ flex: 1, padding: "10px", border: "none", cursor: "pointer", borderRadius: 50, fontSize: 13, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", background: mode === m ? t.accent : "transparent", color: mode === m ? t.bg : t.grey, boxShadow: mode === m ? sh.btn : "none", transition: "all 0.25s" }}>
              {m === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {mode === "signup" && (
            <NeuInput t={t} sh={sh} placeholder="Full name..." value={name} onChange={e => setName(e.target.value)} />
          )}
          <NeuInput t={t} sh={sh} type="email" placeholder="Email address..." value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} />
          <div style={{ position: "relative" }}>
            <NeuInput t={t} sh={sh} type={showPass ? "text" : "password"} placeholder="Password..." value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} style={{ paddingRight: 48 }} />
            <button onClick={() => setShowPass(s => !s)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
              <I n={showPass ? "eyeOff" : "eye"} s={16} c={t.grey} />
            </button>
          </div>

          {error && <p style={{ fontSize: 12, color: t.orange, fontWeight: 600, textAlign: "center" }}>{error}</p>}

          <ActionBtn onClick={submit} t={t} sh={sh} disabled={loading} style={{ width: "100%", marginTop: 8, fontSize: 16, padding: "16px" }}>
            {loading ? <div className="spin" style={{ width: 20, height: 20, border: `2px solid ${t.bg}40`, borderTopColor: t.bg, borderRadius: "50%" }} /> : (mode === "login" ? "Log In" : "Create Account")}
          </ActionBtn>
        </div>

        {mode === "signup" && (
          <p style={{ fontSize: 11, color: t.grey, textAlign: "center", marginTop: 16, lineHeight: 1.6 }}>
            By signing up you agree to store your data securely on Supabase.
          </p>
        )}
      </div>
    </div>
  );
};

// ─── MONTHS / MISC ───────────────────────────────────────────────────────────
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const WSHORT = ["M", "T", "W", "T", "F", "S", "S"];
const MOODS = ["😤", "😔", "😐", "🙂", "😄"];
const MOOD_LABELS = ["Awful", "Bad", "Okay", "Good", "Great"];

// ─── HOME ─────────────────────────────────────────────────────────────────────
const HomePage = ({ t, sh, tasks, habits, reminders, goals, profile, setPage }) => {
  const now = new Date();
  const doneTasks = tasks.filter(x => x.done).length;
  const doneHabits = habits.filter(x => x.done_today).length;
  const totalPct = tasks.length + habits.length ? Math.round(((doneTasks + doneHabits) / (tasks.length + habits.length)) * 100) : 0;
  const circ = 2 * Math.PI * 44;
  const quotes = ["Discipline is doing it even when you don't feel like it.", "Systems over motivation. Always.", "The work you do today is the life you build tomorrow.", "Less but better.", "Rise before you're ready."];
  const quote = quotes[now.getDate() % quotes.length];
  const name = profile?.full_name?.split(" ")[0] || "there";

  return (
    <div className="page" style={{ padding: "70px 20px 100px" }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: t.grey, textTransform: "uppercase", marginBottom: 2 }}>{MONTHS[now.getMonth()]} {now.getFullYear()}</p>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
          <BigNumber t={t} style={{ fontSize: 96 }}>{now.getDate()}</BigNumber>
          <div style={{ paddingBottom: 10 }}>
            <p style={{ fontSize: 24, fontWeight: 900, textTransform: "uppercase" }}>{WDAYS[(now.getDay() + 6) % 7]}</p>
            <p style={{ fontSize: 13, color: t.grey, marginTop: 2 }}>Good to see you, {name}.</p>
          </div>
        </div>
      </div>

      <Card t={t} sh={sh} style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ position: "relative", width: 100, height: 100, flexShrink: 0 }}>
          <svg width={100} height={100} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke={t.bg} strokeWidth="9" />
            <circle cx="50" cy="50" r="44" fill="none" stroke={t.accent} strokeWidth="9" strokeDasharray={circ} strokeDashoffset={circ * (1 - totalPct / 100)} strokeLinecap="round" transform="rotate(-90 50 50)" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 22, fontWeight: 900 }}>{totalPct}</span>
            <span style={{ fontSize: 9, color: t.grey, fontWeight: 700, letterSpacing: "0.1em" }}>PCT</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: t.grey, marginBottom: 6 }}>Today's Progress</p>
          <p style={{ fontSize: 13, fontStyle: "italic", color: t.grey, lineHeight: 1.5 }}>"{quote}"</p>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
        {[{ label: "Tasks", val: `${doneTasks}/${tasks.length}` }, { label: "Habits", val: `${doneHabits}/${habits.length}` }, { label: "Alerts", val: reminders.filter(r => !r.done).length }].map((s, i) => (
          <Card key={i} t={t} sh={sh} style={{ padding: "16px 12px", textAlign: "center" }}>
            <BigNumber t={t} style={{ fontSize: 36 }}>{s.val}</BigNumber>
            <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: t.grey, marginTop: 4 }}>{s.label}</p>
          </Card>
        ))}
      </div>

      <Card t={t} sh={sh} style={{ marginBottom: 16 }}>
        <SectionLabel t={t}>Quick Add</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[{ label: "+ Task", page: "tasks" }, { label: "+ Habit", page: "habits" }, { label: "+ Note", page: "notes" }, { label: "+ Reminder", page: "reminders" }].map(q => (
            <button key={q.label} onClick={() => setPage(q.page)} style={{ padding: "10px", border: "none", cursor: "pointer", background: t.bg, borderRadius: 12, boxShadow: sh.card, fontSize: 12, fontWeight: 800, letterSpacing: "0.06em", color: t.grey }}>
              {q.label}
            </button>
          ))}
        </div>
      </Card>

      <Card t={t} sh={sh} style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <SectionLabel t={t}>Pending Tasks</SectionLabel>
          <span onClick={() => setPage("tasks")} style={{ fontSize: 11, color: t.grey, fontWeight: 700, cursor: "pointer" }}>See all →</span>
        </div>
        {tasks.filter(x => !x.done).slice(0, 4).map((task, i, arr) => (
          <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < arr.length - 1 ? `1px solid ${t.lightGrey}` : "none" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: task.overdue ? t.orange : t.accent, flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: task.overdue ? t.orange : t.black }}>{task.title}</span>
            <span style={{ fontSize: 10, color: t.grey, fontWeight: 700, textTransform: "uppercase" }}>{task.priority}</span>
          </div>
        ))}
        {tasks.filter(x => !x.done).length === 0 && <p style={{ fontSize: 13, color: t.grey, textAlign: "center", padding: "12px 0" }}>All done! 🎉</p>}
      </Card>

      {goals.slice(0, 2).map(g => (
        <Card key={g.id} t={t} sh={sh} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{g.title}</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: t.grey }}>{g.progress}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: t.bg, boxShadow: sh.inset }}>
            <div style={{ height: "100%", width: `${g.progress}%`, borderRadius: 99, background: t.accent, transition: "width 0.6s ease" }} />
          </div>
        </Card>
      ))}
    </div>
  );
};

// ─── TASKS ────────────────────────────────────────────────────────────────────
const TasksPage = ({ t, sh, tasks, setTasks, userId, onToast }) => {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [expandedSub, setExpandedSub] = useState(null);
  const [form, setForm] = useState({ title: "", category: "Personal", priority: "medium", due_date: "", notes: "", subtasks: [] });
  const [newSub, setNewSub] = useState("");
  const cats = ["All", "Work", "Personal", "Health", "Other"];
  const prioColor = { low: t.grey, medium: t.black, high: t.orange };

  const filtered = tasks.filter(t2 => filter === "All" || t2.category === filter).filter(t2 => !search || t2.title.toLowerCase().includes(search.toLowerCase()));

  const toggle = async (task) => {
    const done = !task.done;
    await tasksAPI.update(task.id, { done });
    setTasks(tasks.map(x => x.id === task.id ? { ...x, done } : x));
  };

  const del = async (id) => {
    await tasksAPI.delete(id);
    setTasks(tasks.filter(x => x.id !== id));
    onToast("Task deleted");
  };

  const toggleSub = async (taskId, sub) => {
    const done = !sub.done;
    await tasksAPI.updateSubtask(sub.id, { done });
    setTasks(tasks.map(t2 => t2.id === taskId ? { ...t2, subtasks: (t2.subtasks || []).map(s => s.id === sub.id ? { ...s, done } : s) } : t2));
  };

  const saveSubDetails = async (taskId, subId, data) => {
    await tasksAPI.updateSubtask(subId, data);
    setTasks(tasks.map(t2 => t2.id === taskId ? { ...t2, subtasks: (t2.subtasks || []).map(s => s.id === subId ? { ...s, ...data } : s) } : t2));
  };

  const addTask = async () => {
    if (!form.title.trim()) return;
    const now = new Date();
    const due = form.due_date ? new Date(form.due_date) : null;
    const overdue = due && due < now;
    const { data, error } = await tasksAPI.add(userId, { title: form.title, notes: form.notes, category: form.category, priority: form.priority, due_date: form.due_date || null, done: false, overdue });
    if (error) { onToast("Error adding task"); return; }
    // add subtasks
    const subs = [];
    for (const s of form.subtasks) {
      const { data: sd } = await tasksAPI.addSubtask(userId, data.id, s.title);
      if (sd) subs.push(sd);
    }
    setTasks([{ ...data, subtasks: subs }, ...tasks]);
    setForm({ title: "", category: "Personal", priority: "medium", due_date: "", notes: "", subtasks: [] });
    setAdding(false);
    onToast("Task added ✓");
  };

  const addSubLocal = () => {
    if (!newSub.trim()) return;
    setForm({ ...form, subtasks: [...form.subtasks, { id: Date.now(), title: newSub, done: false, description: '', due_date: null, priority: 'medium' }] });
    setNewSub("");
  };

  return (
    <div className="page" style={{ padding: "70px 20px 100px" }}>
      <div style={{ marginBottom: 20 }}><p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: t.grey, textTransform: "uppercase" }}>Scheduler</p><BigNumber t={t}>TASKS</BigNumber></div>
      <div style={{ position: "relative", marginBottom: 16 }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}><I n="search" s={15} c={t.grey} /></span>
        <NeuInput t={t} sh={sh} placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40 }} />
      </div>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 20, paddingBottom: 4 }}>
        {cats.map(c => <Pill key={c} active={filter === c} onClick={() => setFilter(c)} t={t} sh={sh}>{c}</Pill>)}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {filtered.map(task => (
          <Card key={task.id} t={t} sh={sh} style={{ padding: "16px 18px", opacity: task.done ? 0.55 : 1, border: task.overdue && !task.done ? `1px solid ${t.orange}40` : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <CheckBtn checked={task.done} onToggle={() => toggle(task)} t={t} sh={sh} />
              <div style={{ flex: 1 }} onClick={() => setExpanded(expanded === task.id ? null : task.id)}>
                <p style={{ fontSize: 14, fontWeight: 700, textDecoration: task.done ? "line-through" : "none", color: task.overdue && !task.done ? t.orange : t.black }}>{task.title}</p>
                <p style={{ fontSize: 11, color: t.grey, marginTop: 2 }}>{task.category}{task.due_date && ` · ${task.due_date}`}{task.overdue && !task.done ? " · OVERDUE" : ""}</p>
              </div>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: prioColor[task.priority] || t.grey }} />
              <IconBtn icon="trash" onClick={() => del(task.id)} t={t} sh={sh} size={30} />
            </div>
            {expanded === task.id && (
              <div style={{ marginTop: 12, paddingLeft: 12 }}>
                {(task.subtasks || []).map(s => {
                  const isSubExp = expandedSub === s.id;
                  return (
                    <div key={s.id} style={{ marginBottom: 8, padding: isSubExp ? "12px 14px" : "4px 0", borderRadius: 12, background: isSubExp ? t.bg : "transparent", boxShadow: isSubExp ? sh.inset : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <CheckBtn checked={s.done} onToggle={() => toggleSub(task.id, s)} t={t} sh={sh} size={22} />
                        <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setExpandedSub(isSubExp ? null : s.id)}>
                          <span style={{ fontSize: 13, color: t.black, fontWeight: 600, textDecoration: s.done ? "line-through" : "none" }}>{s.title}</span>
                          {!isSubExp && (
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                              <div style={{ width: 6, height: 6, borderRadius: "50%", background: prioColor[s.priority || 'medium'] }} />
                              {s.due_date && <span style={{ fontSize: 10, color: t.grey }}>{new Date(s.due_date).toLocaleDateString()}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                      {isSubExp && (
                        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                          <NeuTextarea t={t} sh={sh} placeholder="Description..." value={s.description || ''} onChange={e => saveSubDetails(task.id, s.id, { description: e.target.value })} style={{ fontSize: 12 }} />
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: 10, color: t.grey, marginBottom: 4, fontWeight: 700 }}>DUE DATE</p>
                              <NeuInput type="date" t={t} sh={sh} value={s.due_date ? new Date(s.due_date).toISOString().split('T')[0] : ''} onChange={e => saveSubDetails(task.id, s.id, { due_date: e.target.value })} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: 10, color: t.grey, marginBottom: 4, fontWeight: 700 }}>PRIORITY</p>
                              <div style={{ display: "flex", gap: 4 }}>
                                {["low", "medium", "high"].map(p => (
                                  <button key={p} onClick={() => saveSubDetails(task.id, s.id, { priority: p })} style={{ flex: 1, padding: "6px 0", border: "none", borderRadius: 8, fontSize: 9, fontWeight: 800, textTransform: "uppercase", background: s.priority === p ? prioColor[p] : t.card, color: s.priority === p ? "white" : t.grey, boxShadow: sh.card }}>{p[0]}</button>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div>
                            <p style={{ fontSize: 10, color: t.grey, marginBottom: 4, fontWeight: 700 }}>ASSIGNEE</p>
                            <NeuInput t={t} sh={sh} placeholder="Assignee ID..." value={s.assignee_id || ''} onChange={e => saveSubDetails(task.id, s.id, { assignee_id: e.target.value })} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {expanded === task.id && task.notes && (
              <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 12, background: t.bg, boxShadow: sh.inset }}>
                <p style={{ fontSize: 12, color: t.grey, lineHeight: 1.5 }}>{task.notes}</p>
              </div>
            )}
          </Card>
        ))}
        {filtered.length === 0 && <p style={{ textAlign: "center", color: t.grey, padding: "32px 0", fontSize: 14 }}>No tasks found.</p>}
      </div>
      {adding ? (
        <Card t={t} sh={sh} style={{ marginBottom: 16 }}>
          <NeuInput t={t} sh={sh} autoFocus placeholder="Task title..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ marginBottom: 12 }} />
          <NeuTextarea t={t} sh={sh} placeholder="Notes (optional)..." rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ marginBottom: 12 }} />
          <NeuInput t={t} sh={sh} type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} style={{ marginBottom: 12 }} />
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            {cats.slice(1).map(c => <Pill key={c} active={form.category === c} onClick={() => setForm({ ...form, category: c })} t={t} sh={sh}>{c}</Pill>)}
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            {["low", "medium", "high"].map(p => (
              <button key={p} onClick={() => setForm({ ...form, priority: p })} style={{ padding: "6px 14px", border: "none", cursor: "pointer", borderRadius: 50, fontSize: 11, fontWeight: 800, textTransform: "uppercase", background: form.priority === p ? prioColor[p] : t.bg, color: form.priority === p ? "white" : t.grey, boxShadow: form.priority === p ? sh.btn : sh.card }}>{p}</button>
            ))}
          </div>
          <SectionLabel t={t}>Subtasks</SectionLabel>
          {form.subtasks.map(s => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.grey }} />
              <span style={{ fontSize: 13, color: t.grey }}>{s.title}</span>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 8, marginBottom: 14 }}>
            <NeuInput t={t} sh={sh} placeholder="Add subtask..." value={newSub} onChange={e => setNewSub(e.target.value)} onKeyDown={e => e.key === "Enter" && addSubLocal()} style={{ flex: 1 }} />
            <IconBtn icon="plus" onClick={addSubLocal} t={t} sh={sh} size={44} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <ActionBtn onClick={addTask} t={t} sh={sh} style={{ flex: 1 }}><I n="plus" s={16} c={t.bg} sw={2.5} /> Add Task</ActionBtn>
            <ActionBtn secondary onClick={() => setAdding(false)} t={t} sh={sh}><I n="x" s={16} c={t.grey} /></ActionBtn>
          </div>
        </Card>
      ) : (
        <ActionBtn onClick={() => setAdding(true)} t={t} sh={sh} style={{ width: "100%" }}><I n="plus" s={18} c={t.bg} sw={2.5} /> New Task</ActionBtn>
      )}
    </div>
  );
};

// ─── CALENDAR ─────────────────────────────────────────────────────────────────
const CalendarPage = ({ t, sh, tasks, events, setEvents, userId, onToast }) => {
  const now = new Date();
  const [yr, setYr] = useState(now.getFullYear());
  const [mo, setMo] = useState(now.getMonth());
  const [sel, setSel] = useState(now.getDate());
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", event_time: "", type: "personal" });
  const daysInMonth = new Date(yr, mo + 1, 0).getDate();
  const firstDay = (new Date(yr, mo, 1).getDay() + 6) % 7;
  const isNow = yr === now.getFullYear() && mo === now.getMonth();
  const selStr = `${yr}-${String(mo + 1).padStart(2, "0")}-${String(sel).padStart(2, "0")}`;
  const dayEvents = events.filter(e => e.event_date === selStr);
  const dayTasks = tasks.filter(t2 => t2.due_date === selStr);
  const typeColors = { work: t.black, personal: t.grey, health: t.orange };

  const prev = () => { if (mo === 0) { setMo(11); setYr(y => y - 1); } else setMo(m => m - 1); };
  const next = () => { if (mo === 11) { setMo(0); setYr(y => y + 1); } else setMo(m => m + 1); };

  const addEvent = async () => {
    if (!form.title.trim()) return;
    const { data, error } = await calendarAPI.add(userId, { title: form.title, event_date: selStr, event_time: form.event_time || null, type: form.type });
    if (error) { onToast("Error adding event"); return; }
    setEvents([...events, data]);
    setForm({ title: "", event_time: "", type: "personal" });
    setAdding(false);
    onToast("Event added ✓");
  };

  const delEvent = async (id) => {
    await calendarAPI.delete(id);
    setEvents(events.filter(e => e.id !== id));
    onToast("Event deleted");
  };

  return (
    <div className="page" style={{ padding: "70px 20px 100px" }}>
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: t.grey, textTransform: "uppercase" }}>Planner</p>
        <BigNumber t={t}>CALENDAR</BigNumber>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
        <div>
          <BigNumber t={t} style={{ fontSize: 56 }}>{sel}</BigNumber>
          <p style={{ fontSize: 16, fontWeight: 800, textTransform: "uppercase", marginTop: 4 }}>{MONTHS[mo]} {yr}</p>
          <p style={{ fontSize: 12, color: t.grey }}>{WDAYS[(new Date(yr, mo, sel).getDay() + 6) % 7]}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <IconBtn icon="chL" onClick={prev} t={t} sh={sh} size={36} />
          <IconBtn icon="chR" onClick={next} t={t} sh={sh} size={36} />
        </div>
      </div>
      <Card t={t} sh={sh} style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 10 }}>
          {WSHORT.map((d, i) => <div key={i} style={{ textAlign: "center", fontSize: 10, fontWeight: 800, color: t.grey }}>{d}</div>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "4px 0" }}>
          {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
          {Array(daysInMonth).fill(null).map((_, i) => {
            const day = i + 1;
            const isToday = isNow && day === now.getDate();
            const isSel = day === sel;
            const ds = `${yr}-${String(mo + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const hasEvent = events.some(e => e.event_date === ds);
            return (
              <div key={day} onClick={() => setSel(day)} style={{ display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: isToday ? t.orange : isSel ? t.accent : "transparent", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                  <span style={{ fontSize: 13, fontWeight: isToday || isSel ? 900 : 500, color: isToday || isSel ? t.bg : t.black }}>{day}</span>
                  {hasEvent && !isToday && !isSel && <div style={{ width: 4, height: 4, borderRadius: "50%", background: t.accent, marginTop: 1 }} />}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      <Card t={t} sh={sh} style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <SectionLabel t={t}>{MONTHS[mo]} {sel}</SectionLabel>
          <IconBtn icon="plus" onClick={() => setAdding(!adding)} t={t} sh={sh} size={30} active={adding} />
        </div>
        {adding && (
          <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <NeuInput t={t} sh={sh} autoFocus placeholder="Event title..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <NeuInput t={t} sh={sh} type="time" value={form.event_time} onChange={e => setForm({ ...form, event_time: e.target.value })} />
            <div style={{ display: "flex", gap: 8 }}>
              {["work", "personal", "health"].map(tp => <Pill key={tp} active={form.type === tp} onClick={() => setForm({ ...form, type: tp })} t={t} sh={sh}>{tp}</Pill>)}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <ActionBtn onClick={addEvent} t={t} sh={sh} style={{ flex: 1 }}>Add Event</ActionBtn>
              <ActionBtn secondary onClick={() => setAdding(false)} t={t} sh={sh}><I n="x" s={16} c={t.grey} /></ActionBtn>
            </div>
          </div>
        )}
        {[...dayEvents, ...dayTasks.map(x => ({ ...x, isTask: true }))].length === 0 && !adding && (
          <p style={{ fontSize: 13, color: t.grey, textAlign: "center", padding: "12px 0" }}>Free day — nothing scheduled.</p>
        )}
        {dayEvents.map((e) => (
          <div key={e.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${t.lightGrey}` }}>
            <div style={{ width: 4, height: 36, borderRadius: 2, background: typeColors[e.type] || t.accent }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 700 }}>{e.title}</p>
              <p style={{ fontSize: 11, color: t.grey }}>{e.event_time} · {e.type}</p>
            </div>
            <IconBtn icon="trash" onClick={() => delEvent(e.id)} t={t} sh={sh} size={28} />
          </div>
        ))}
        {dayTasks.map((tk) => (
          <div key={tk.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0" }}>
            <div style={{ width: 4, height: 36, borderRadius: 2, background: t.orange }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 700 }}>{tk.title}</p>
              <p style={{ fontSize: 11, color: t.grey }}>Task · {tk.category}</p>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: tk.done ? t.grey : t.orange }} />
          </div>
        ))}
      </Card>
    </div>
  );
};

// ─── HABITS ───────────────────────────────────────────────────────────────────
const HabitsPage = ({ t, sh, habits, setHabits, userId, onToast }) => {
  const [adding, setAdding] = useState(false);
  const [catFilter, setCatFilter] = useState("All");
  const [form, setForm] = useState({ name: "", goal: "", category: "Health" });
  const habitCats = ["All", "Health", "Work", "Personal", "Fitness"];
  const donePct = habits.length ? Math.round((habits.filter(h => h.done_today).length / habits.length) * 100) : 0;

  const toggle = async (h) => {
    const done = !h.done_today;
    const today = (new Date().getDay() + 6) % 7;
    const week = [...(h.week_data || [0, 0, 0, 0, 0, 0, 0])];
    week[today] = done ? 1 : 0;
    const streak = done ? h.streak + 1 : Math.max(0, h.streak - 1);
    const { error } = await habitsAPI.update(h.id, { done_today: done, streak, week_data: week, last_done_date: done ? new Date().toISOString().split('T')[0] : h.last_done_date });
    if (error) { onToast("Error updating habit"); return; }
    setHabits(habits.map(x => x.id === h.id ? { ...x, done_today: done, streak, week_data: week } : x));
  };

  const del = async (id) => {
    await habitsAPI.delete(id);
    setHabits(habits.filter(h => h.id !== id));
    onToast("Habit deleted");
  };

  const addHabit = async () => {
    if (!form.name.trim()) return;
    const { data, error } = await habitsAPI.add(userId, { ...form, streak: 0, done_today: false, week_data: [0, 0, 0, 0, 0, 0, 0] });
    if (error) { onToast("Error adding habit"); return; }
    setHabits([...habits, data]);
    setForm({ name: "", goal: "", category: "Health" });
    setAdding(false);
    onToast("Habit added ✓");
  };

  const filtered = catFilter === "All" ? habits : habits.filter(h => h.category === catFilter);

  return (
    <div className="page" style={{ padding: "70px 20px 100px" }}>
      <div style={{ marginBottom: 20 }}><p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: t.grey, textTransform: "uppercase" }}>Daily</p><BigNumber t={t}>HABITS</BigNumber></div>
      <Card t={t} sh={sh} style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
          <svg width={90} height={90} viewBox="0 0 90 90">
            <circle cx="45" cy="45" r="38" fill="none" stroke={t.bg} strokeWidth="8" />
            <circle cx="45" cy="45" r="38" fill="none" stroke={t.accent} strokeWidth="8" strokeDasharray={2 * Math.PI * 38} strokeDashoffset={2 * Math.PI * 38 * (1 - donePct / 100)} strokeLinecap="round" transform="rotate(-90 45 45)" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 20, fontWeight: 900 }}>{donePct}%</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 26, fontWeight: 900 }}>{habits.filter(h => h.done_today).length}<span style={{ fontSize: 14, color: t.grey }}> / {habits.length}</span></p>
          <p style={{ fontSize: 12, color: t.grey, marginTop: 2 }}>habits done today</p>
        </div>
      </Card>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 20, paddingBottom: 4 }}>
        {habitCats.map(c => <Pill key={c} active={catFilter === c} onClick={() => setCatFilter(c)} t={t} sh={sh}>{c}</Pill>)}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {filtered.map(h => (
          <Card key={h.id} t={t} sh={sh} style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <CheckBtn checked={h.done_today} onToggle={() => toggle(h)} t={t} sh={sh} size={34} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 800 }}>{h.name}</p>
                {h.goal && <p style={{ fontSize: 12, color: t.grey }}>{h.goal}</p>}
                <p style={{ fontSize: 10, color: t.grey, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{h.category}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <I n="fire" s={16} c={h.streak > 0 ? t.orange : t.lightGrey} />
                <span style={{ fontSize: 16, fontWeight: 900, color: h.streak > 0 ? t.black : t.lightGrey }}>{h.streak}</span>
              </div>
              <IconBtn icon="trash" onClick={() => del(h.id)} t={t} sh={sh} size={28} />
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              {WSHORT.map((d, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: "100%", height: 6, borderRadius: 99, background: (h.week_data || [])[i] ? t.accent : t.bg, boxShadow: (h.week_data || [])[i] ? "none" : sh.inset, transition: "background 0.3s" }} />
                  <span style={{ fontSize: 9, color: t.grey, fontWeight: 700 }}>{d}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p style={{ textAlign: "center", color: t.grey, padding: "32px 0", fontSize: 14 }}>No habits yet.</p>}
      </div>
      {adding ? (
        <Card t={t} sh={sh} style={{ marginBottom: 16 }}>
          <NeuInput t={t} sh={sh} autoFocus placeholder="Habit name..." value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ marginBottom: 10 }} />
          <NeuInput t={t} sh={sh} placeholder="Goal (e.g. 30 mins daily)..." value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })} style={{ marginBottom: 12 }} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {habitCats.slice(1).map(c => <Pill key={c} active={form.category === c} onClick={() => setForm({ ...form, category: c })} t={t} sh={sh}>{c}</Pill>)}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <ActionBtn onClick={addHabit} t={t} sh={sh} style={{ flex: 1 }}><I n="plus" s={16} c={t.bg} sw={2.5} /> Add</ActionBtn>
            <ActionBtn secondary onClick={() => setAdding(false)} t={t} sh={sh}><I n="x" s={16} c={t.grey} /></ActionBtn>
          </div>
        </Card>
      ) : (
        <ActionBtn onClick={() => setAdding(true)} t={t} sh={sh} style={{ width: "100%" }}><I n="plus" s={18} c={t.bg} sw={2.5} /> New Habit</ActionBtn>
      )}
    </div>
  );
};

// ─── NOTES ────────────────────────────────────────────────────────────────────
const NotesPage = ({ t, sh, notes, setNotes, userId, onToast }) => {
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [draft, setDraft] = useState({ title: "", body: "", color: "", category: "General", pinned: false });
  const noteCats = ["All", "General", "Work", "Ideas", "Personal"];
  const noteColors = t.dark ? ["#2a2a2a", "#2a2600", "#0a1f0a", "#001633", "#2a0010"] : ["#FFFFFF", "#FFF8E7", "#E8F5E9", "#E3F2FD", "#FCE4EC"];

  const openNew = () => { setDraft({ title: "", body: "", color: noteColors[0], category: "General", pinned: false }); setEditing("new"); };
  const openEdit = (n) => { setDraft({ ...n }); setEditing(n.id); };

  const save = async () => {
    if (!draft.title.trim() && !draft.body.trim()) { setEditing(null); return; }
    if (editing === "new") {
      const { data, error } = await notesAPI.add(userId, draft);
      if (!error) setNotes([data, ...notes]);
      onToast("Note saved ✓");
    } else {
      const { data, error } = await notesAPI.update(editing, draft);
      if (!error) setNotes(notes.map(n => n.id === editing ? data : n));
      onToast("Note updated ✓");
    }
    setEditing(null);
  };

  const del = async (id) => {
    await notesAPI.delete(id);
    setNotes(notes.filter(n => n.id !== id));
    onToast("Note deleted");
  };

  const pin = async (id) => {
    const note = notes.find(n => n.id === id);
    const pinned = !note.pinned;
    await notesAPI.update(id, { pinned });
    setNotes(notes.map(n => n.id === id ? { ...n, pinned } : n).sort((a, b) => b.pinned - a.pinned));
  };

  const filtered = notes.filter(n => catFilter === "All" || n.category === catFilter).filter(n => !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.body.toLowerCase().includes(search.toLowerCase())).sort((a, b) => b.pinned - a.pinned);

  if (editing) return (
    <div className="page" style={{ padding: "70px 20px 100px" }}>
      <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <BigNumber t={t} style={{ fontSize: 48 }}>EDIT</BigNumber>
        <div style={{ display: "flex", gap: 8 }}>
          <ActionBtn onClick={save} t={t} sh={sh}><I n="save" s={16} c={t.bg} /> Save</ActionBtn>
          <ActionBtn secondary onClick={() => setEditing(null)} t={t} sh={sh}><I n="x" s={16} c={t.grey} /></ActionBtn>
        </div>
      </div>
      <div style={{ background: draft.color || noteColors[0], borderRadius: 24, boxShadow: sh.raised, padding: 24, marginBottom: 16, minHeight: 300 }}>
        <input autoFocus value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} placeholder="Title..." style={{ width: "100%", fontSize: 22, fontWeight: 900, color: t.black, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${t.lightGrey}`, background: "transparent" }} />
        <textarea value={draft.body} onChange={e => setDraft({ ...draft, body: e.target.value })} placeholder="Write your note..." rows={10} style={{ width: "100%", fontSize: 14, color: t.black, resize: "none", lineHeight: 1.7, background: "transparent" }} />
      </div>
      <Card t={t} sh={sh} style={{ marginBottom: 16 }}>
        <SectionLabel t={t}>Color</SectionLabel>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {noteColors.map(c => <div key={c} onClick={() => setDraft({ ...draft, color: c })} style={{ width: 32, height: 32, borderRadius: "50%", background: c, cursor: "pointer", border: draft.color === c ? `3px solid ${t.accent}` : `2px solid ${t.lightGrey}`, boxShadow: sh.btn, transform: draft.color === c ? "scale(1.2)" : "scale(1)", transition: "all 0.2s" }} />)}
        </div>
      </Card>
      <Card t={t} sh={sh}>
        <SectionLabel t={t}>Category</SectionLabel>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {noteCats.slice(1).map(c => <Pill key={c} active={draft.category === c} onClick={() => setDraft({ ...draft, category: c })} t={t} sh={sh}>{c}</Pill>)}
        </div>
      </Card>
    </div>
  );

  return (
    <div className="page" style={{ padding: "70px 20px 100px" }}>
      <div style={{ marginBottom: 20 }}><p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: t.grey, textTransform: "uppercase" }}>Quick</p><BigNumber t={t}>NOTES</BigNumber></div>
      <div style={{ position: "relative", marginBottom: 16 }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}><I n="search" s={15} c={t.grey} /></span>
        <NeuInput t={t} sh={sh} placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40 }} />
      </div>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 20, paddingBottom: 4 }}>
        {noteCats.map(c => <Pill key={c} active={catFilter === c} onClick={() => setCatFilter(c)} t={t} sh={sh}>{c}</Pill>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {filtered.map(n => (
          <div key={n.id} onClick={() => openEdit(n)} style={{ background: n.color || noteColors[0], borderRadius: 20, boxShadow: sh.card, padding: 16, cursor: "pointer", minHeight: 130, position: "relative" }}>
            {n.pinned && <div style={{ position: "absolute", top: 10, right: 10 }}><I n="pin" s={12} c={t.grey} /></div>}
            <p style={{ fontSize: 13, fontWeight: 900, color: t.black, marginBottom: 6, paddingRight: 16 }}>{n.title || "Untitled"}</p>
            <p style={{ fontSize: 12, color: t.grey, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 5, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{n.body}</p>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }} onClick={e => e.stopPropagation()}>
              <button onClick={() => pin(n.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}><I n="star" s={13} c={n.pinned ? t.orange : t.lightGrey} /></button>
              <button onClick={() => del(n.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}><I n="trash" s={13} c={t.lightGrey} /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px 0", color: t.grey }}><p style={{ fontSize: 14 }}>No notes yet.</p></div>}
      </div>
      <ActionBtn onClick={openNew} t={t} sh={sh} style={{ width: "100%" }}><I n="plus" s={18} c={t.bg} sw={2.5} /> New Note</ActionBtn>
    </div>
  );
};

// ─── POMODORO ─────────────────────────────────────────────────────────────────
const PomodoroPage = ({ t, sh, userId, onToast }) => {
  const [workMin, setWorkMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [secs, setSecs] = useState(25 * 60);
  const [sessions, setSessions] = useState(0);
  const [history, setHistory] = useState([]);
  const [sound, setSound] = useState("none");
  const intervalRef = useRef(null);
  const total = isBreak ? breakMin * 60 : workMin * 60;
  const progress = 1 - secs / total;
  const r = 80; const circ = 2 * Math.PI * r;
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss2 = String(secs % 60).padStart(2, "0");

  useEffect(() => {
    pomodoroAPI.getHistory(userId).then(({ data }) => { if (data) setHistory(data); });
  }, [userId]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecs(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current); setIsRunning(false);
            if (!isBreak) {
              setSessions(n => n + 1);
              pomodoroAPI.logSession(userId, workMin).then(({ data }) => {
                if (data) setHistory(h => [data, ...h.slice(0, 9)]);
              });
              onToast("Session complete! Take a break 🎉");
              setIsBreak(true); setSecs(breakMin * 60);
            } else {
              setIsBreak(false); setSecs(workMin * 60);
              onToast("Break done! Back to work 💪");
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, isBreak, workMin, breakMin]);

  const reset = () => { clearInterval(intervalRef.current); setIsRunning(false); setIsBreak(false); setSecs(workMin * 60); };

  return (
    <div className="page" style={{ padding: "70px 20px 100px" }}>
      <div style={{ marginBottom: 20 }}><p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: t.grey, textTransform: "uppercase" }}>Focus</p><BigNumber t={t}>POMODORO</BigNumber></div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
        <div style={{ position: "relative", width: 220, height: 220, marginBottom: 20 }}>
          <svg width={220} height={220} viewBox="0 0 220 220">
            <circle cx="110" cy="110" r={r} fill="none" stroke={t.bg} strokeWidth="12" />
            <circle cx="110" cy="110" r={r} fill="none" stroke={isBreak ? t.grey : t.accent} strokeWidth="12" strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)} strokeLinecap="round" transform="rotate(-90 110 110)" style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.5s ease" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <span style={{ fontFamily: "'Bebas Neue'", fontSize: 52, color: t.black, lineHeight: 1 }}>{mm}:{ss2}</span>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: isBreak ? t.grey : t.black }}>{isBreak ? "BREAK" : "FOCUS"}</span>
            <span style={{ fontSize: 11, color: t.grey }}>Session {sessions + 1}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <ActionBtn onClick={() => setIsRunning(r => !r)} t={t} sh={sh} style={{ padding: "14px 36px", fontSize: 16 }}><I n={isRunning ? "pause" : "play"} s={20} c={t.bg} /> {isRunning ? "Pause" : "Start"}</ActionBtn>
          <IconBtn icon="refresh" onClick={reset} t={t} sh={sh} size={50} />
        </div>
      </div>
      <Card t={t} sh={sh} style={{ marginBottom: 16 }}>
        <SectionLabel t={t}>Duration Settings</SectionLabel>
        <div style={{ display: "flex", gap: 16 }}>
          {[{ label: "Work (min)", val: workMin, set: setWorkMin, min: 5, max: 60, step: 5, extra: () => !isRunning && setSecs(workMin * 60) }, { label: "Break (min)", val: breakMin, set: setBreakMin, min: 1, max: 30, step: 1, extra: () => { } }].map(({ label, val, set, min: mn, max: mx, step, extra }) => (
            <div key={label} style={{ flex: 1 }}>
              <p style={{ fontSize: 11, color: t.grey, marginBottom: 8, fontWeight: 600 }}>{label}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button onClick={() => { if (!isRunning && val > mn) { set(v => v - step); extra(); } }} style={{ width: 32, height: 32, borderRadius: 10, border: "none", cursor: "pointer", background: t.bg, boxShadow: sh.card, fontSize: 18, color: t.black, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                <span style={{ fontSize: 24, fontWeight: 900, minWidth: 36, textAlign: "center" }}>{val}</span>
                <button onClick={() => { if (!isRunning && val < mx) { set(v => v + step); extra(); } }} style={{ width: 32, height: 32, borderRadius: 10, border: "none", cursor: "pointer", background: t.bg, boxShadow: sh.card, fontSize: 18, color: t.black, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card t={t} sh={sh} style={{ marginBottom: 16 }}>
        <SectionLabel t={t}>Ambient Sound</SectionLabel>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["none", "rain", "forest", "cafe", "waves"].map(s => <Pill key={s} active={sound === s} onClick={() => setSound(s)} t={t} sh={sh}>{s}</Pill>)}
        </div>
        {sound !== "none" && <p style={{ fontSize: 11, color: t.grey, marginTop: 10 }}>🎵 {sound} — connect Spotify or YouTube Music for ambient sounds</p>}
      </Card>
      {history.length > 0 && (
        <Card t={t} sh={sh}>
          <SectionLabel t={t}>Session History</SectionLabel>
          {history.map(h => (
            <div key={h.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${t.lightGrey}` }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>✓ {h.work_minutes} min session</span>
              <span style={{ fontSize: 11, color: t.grey }}>{new Date(h.completed_at).toLocaleTimeString()}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};

// ─── FINANCE ──────────────────────────────────────────────────────────────────
const FinancePage = ({ t, sh, userId, onToast }) => {
  const [entries, setEntries] = useState([]);
  const [savingsGoal, setSavingsGoal] = useState({ target: 620000, saved: 0, label: "Migration Savings" });
  const [adding, setAdding] = useState(false);
  const [editSaved, setEditSaved] = useState(false);
  const [newSaved, setNewSaved] = useState("");
  const [form, setForm] = useState({ type: "expense", title: "", amount: "", category: "Food" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ data: e }, { data: sg }] = await Promise.all([financeAPI.getEntries(userId), financeAPI.getSavingsGoal(userId)]);
      if (e) setEntries(e);
      if (sg) setSavingsGoal(sg);
      setLoading(false);
    };
    load();
  }, [userId]);

  const income = entries.filter(e => e.type === "income").reduce((a, b) => a + parseFloat(b.amount), 0);
  const expense = entries.filter(e => e.type === "expense").reduce((a, b) => a + parseFloat(b.amount), 0);
  const balance = income - expense;
  const savePct = Math.min(Math.round((savingsGoal.saved / savingsGoal.target) * 100), 100);
  const cats = { income: ["Salary", "Side Income", "Freelance", "Other"], expense: ["Food", "Health", "Education", "Transport", "Entertainment", "Other"] };

  const add = async () => {
    if (!form.title.trim() || !form.amount) return;
    const { data, error } = await financeAPI.addEntry(userId, { ...form, amount: parseFloat(form.amount), entry_date: new Date().toISOString().split("T")[0] });
    if (error) { onToast("Error adding entry"); return; }
    setEntries([data, ...entries]);
    setForm({ type: "expense", title: "", amount: "", category: "Food" });
    setAdding(false);
    onToast("Entry added ✓");
  };

  const del = async (id) => {
    await financeAPI.deleteEntry(id);
    setEntries(entries.filter(e => e.id !== id));
    onToast("Entry deleted");
  };

  const updateSaved = async () => {
    const val = parseFloat(newSaved);
    if (isNaN(val)) return;
    const { data } = await financeAPI.upsertSavingsGoal(userId, { ...savingsGoal, saved: val });
    if (data) setSavingsGoal(data);
    setEditSaved(false);
    onToast("Savings updated ✓");
  };

  if (loading) return <div style={{ padding: "70px 20px", textAlign: "center", color: t.grey }}>Loading...</div>;

  return (
    <div className="page" style={{ padding: "70px 20px 100px" }}>
      <div style={{ marginBottom: 20 }}><p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: t.grey, textTransform: "uppercase" }}>Money</p><BigNumber t={t}>FINANCE</BigNumber></div>
      <Card t={t} sh={sh} style={{ marginBottom: 16, background: t.accent }}>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: t.bg, opacity: 0.6, marginBottom: 4 }}>Net Balance</p>
        <BigNumber t={t} style={{ fontSize: 52, color: t.bg }}>₹{balance.toLocaleString("en-IN")}</BigNumber>
        <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
          <div><p style={{ fontSize: 10, color: t.bg, opacity: 0.6, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Income</p><p style={{ fontSize: 16, fontWeight: 800, color: t.bg }}>₹{income.toLocaleString("en-IN")}</p></div>
          <div><p style={{ fontSize: 10, color: t.bg, opacity: 0.6, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Spent</p><p style={{ fontSize: 16, fontWeight: 800, color: t.bg }}>₹{expense.toLocaleString("en-IN")}</p></div>
        </div>
      </Card>
      <Card t={t} sh={sh} style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <SectionLabel t={t}>{savingsGoal.label || "Savings Goal"}</SectionLabel>
            <p style={{ fontSize: 22, fontWeight: 900 }}>₹{parseFloat(savingsGoal.saved).toLocaleString("en-IN")}</p>
            <p style={{ fontSize: 12, color: t.grey }}>of ₹{parseFloat(savingsGoal.target).toLocaleString("en-IN")}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <BigNumber t={t} style={{ fontSize: 36 }}>{savePct}</BigNumber>
            <p style={{ fontSize: 11, color: t.grey }}>%</p>
          </div>
        </div>
        <div style={{ height: 8, borderRadius: 99, background: t.bg, boxShadow: sh.inset, marginBottom: 14 }}>
          <div style={{ height: "100%", width: `${savePct}%`, borderRadius: 99, background: t.accent, transition: "width 0.6s ease" }} />
        </div>
        {editSaved ? (
          <div style={{ display: "flex", gap: 10 }}>
            <NeuInput t={t} sh={sh} type="number" autoFocus placeholder="Current saved amount..." value={newSaved} onChange={e => setNewSaved(e.target.value)} style={{ flex: 1 }} />
            <ActionBtn onClick={updateSaved} t={t} sh={sh}>Save</ActionBtn>
            <ActionBtn secondary onClick={() => setEditSaved(false)} t={t} sh={sh}><I n="x" s={16} c={t.grey} /></ActionBtn>
          </div>
        ) : (
          <ActionBtn secondary onClick={() => { setEditSaved(true); setNewSaved(savingsGoal.saved); }} t={t} sh={sh} style={{ width: "100%" }}>Update Saved Amount</ActionBtn>
        )}
      </Card>
      <Card t={t} sh={sh} style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <SectionLabel t={t}>Transactions</SectionLabel>
          <IconBtn icon="plus" onClick={() => setAdding(!adding)} t={t} sh={sh} size={30} active={adding} />
        </div>
        {adding && (
          <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <Pill active={form.type === "income"} onClick={() => setForm({ ...form, type: "income", category: "Salary" })} t={t} sh={sh}>Income</Pill>
              <Pill active={form.type === "expense"} onClick={() => setForm({ ...form, type: "expense", category: "Food" })} t={t} sh={sh}>Expense</Pill>
            </div>
            <NeuInput t={t} sh={sh} placeholder="Title..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <NeuInput t={t} sh={sh} type="number" placeholder="Amount (₹)..." value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(cats[form.type] || []).map(c => <Pill key={c} active={form.category === c} onClick={() => setForm({ ...form, category: c })} t={t} sh={sh}>{c}</Pill>)}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <ActionBtn onClick={add} t={t} sh={sh} style={{ flex: 1 }}>Add</ActionBtn>
              <ActionBtn secondary onClick={() => setAdding(false)} t={t} sh={sh}><I n="x" s={16} c={t.grey} /></ActionBtn>
            </div>
          </div>
        )}
        {entries.slice(0, 10).map((e, i) => (
          <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < entries.length - 1 ? `1px solid ${t.lightGrey}` : "none" }}>
            <div style={{ width: 34, height: 34, borderRadius: 12, background: t.bg, boxShadow: sh.inset, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <I n={e.type === "income" ? "income" : "expense"} s={16} c={e.type === "income" ? t.black : t.orange} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700 }}>{e.title}</p>
              <p style={{ fontSize: 11, color: t.grey }}>{e.category} · {e.entry_date}</p>
            </div>
            <p style={{ fontSize: 14, fontWeight: 800, color: e.type === "income" ? t.black : t.orange }}>{e.type === "income" ? "+" : "-"}₹{parseFloat(e.amount).toLocaleString("en-IN")}</p>
            <IconBtn icon="trash" onClick={() => del(e.id)} t={t} sh={sh} size={28} />
          </div>
        ))}
        {entries.length === 0 && !adding && <p style={{ fontSize: 13, color: t.grey, textAlign: "center", padding: "16px 0" }}>No transactions yet.</p>}
      </Card>
    </div>
  );
};

// ─── WELLNESS ─────────────────────────────────────────────────────────────────
const WellnessPage = ({ t, sh, userId, onToast }) => {
  const [data, setData] = useState({ water: 0, sleep: 7, steps: 0, mood: 2 });
  const [moodLog, setMoodLog] = useState([]);
  const waterGoal = 8, sleepGoal = 8, stepsGoal = 8000;

  useEffect(() => {
    wellnessAPI.getToday(userId).then(({ data: d }) => { if (d) setData({ water: d.water, sleep: d.sleep, steps: d.steps, mood: d.mood }); });
  }, [userId]);

  const save = async (updates) => {
    const next = { ...data, ...updates };
    setData(next);
    await wellnessAPI.upsertToday(userId, next);
  };

  const logMood = (m) => {
    save({ mood: m });
    setMoodLog(l => [{ mood: m, time: new Date().toLocaleTimeString() }, ...l.slice(0, 6)]);
    onToast(`Mood logged: ${MOOD_LABELS[m]}`);
  };

  const Ring = ({ val, max, label, icon }) => {
    const pct = Math.min(val / max, 1);
    const r2 = 32, c2 = 2 * Math.PI * r2;
    return (
      <Card t={t} sh={sh} style={{ textAlign: "center", padding: "16px 12px" }}>
        <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 10px" }}>
          <svg width={80} height={80} viewBox="0 0 80 80">
            <circle cx="40" cy="40" r={r2} fill="none" stroke={t.bg} strokeWidth="7" />
            <circle cx="40" cy="40" r={r2} fill="none" stroke={t.accent} strokeWidth="7" strokeDasharray={c2} strokeDashoffset={c2 * (1 - pct)} strokeLinecap="round" transform="rotate(-90 40 40)" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><I n={icon} s={20} c={t.black} /></div>
        </div>
        <p style={{ fontSize: 18, fontWeight: 900 }}>{val}<span style={{ fontSize: 11, color: t.grey }}>/{max}</span></p>
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: t.grey }}>{label}</p>
      </Card>
    );
  };

  return (
    <div className="page" style={{ padding: "70px 20px 100px" }}>
      <div style={{ marginBottom: 20 }}><p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: t.grey, textTransform: "uppercase" }}>Daily</p><BigNumber t={t}>WELLNESS</BigNumber></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <Ring val={data.water} max={waterGoal} label="Glasses" icon="water" />
        <Ring val={data.sleep} max={sleepGoal} label="Hrs Sleep" icon="sleep" />
      </div>
      <Card t={t} sh={sh} style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><I n="steps" s={18} c={t.black} /><span style={{ fontSize: 13, fontWeight: 700 }}>Steps</span></div>
          <div><span style={{ fontSize: 22, fontWeight: 900 }}>{data.steps.toLocaleString()}</span><span style={{ fontSize: 11, color: t.grey }}>/{stepsGoal.toLocaleString()}</span></div>
        </div>
        <div style={{ height: 8, borderRadius: 99, background: t.bg, boxShadow: sh.inset, marginBottom: 14 }}>
          <div style={{ height: "100%", width: `${Math.min(data.steps / stepsGoal * 100, 100)}%`, borderRadius: 99, background: t.accent, transition: "width 0.6s ease" }} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <ActionBtn onClick={() => save({ steps: Math.max(0, data.steps - 500) })} secondary t={t} sh={sh} style={{ flex: 1 }}>−500</ActionBtn>
          <ActionBtn onClick={() => save({ steps: data.steps + 500 })} t={t} sh={sh} style={{ flex: 1 }}>+500</ActionBtn>
        </div>
      </Card>
      <Card t={t} sh={sh} style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><I n="water" s={18} c={t.black} /><span style={{ fontSize: 13, fontWeight: 700 }}>Water</span></div>
          <span style={{ fontSize: 22, fontWeight: 900 }}>{data.water} glasses</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {Array(waterGoal).fill(0).map((_, i) => (
            <div key={i} onClick={() => save({ water: i + 1 })} style={{ flex: 1, height: 40, borderRadius: 8, cursor: "pointer", background: i < data.water ? t.accent : t.bg, boxShadow: i < data.water ? sh.btn : sh.inset, transition: "all 0.2s" }} />
          ))}
        </div>
      </Card>
      <Card t={t} sh={sh} style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><I n="sleep" s={18} c={t.black} /><span style={{ fontSize: 13, fontWeight: 700 }}>Sleep</span></div>
          <span style={{ fontSize: 22, fontWeight: 900 }}>{data.sleep}h</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <ActionBtn onClick={() => save({ sleep: Math.max(0, parseFloat((data.sleep - 0.5).toFixed(1))) })} secondary t={t} sh={sh} style={{ flex: 1 }}>−30m</ActionBtn>
          <ActionBtn onClick={() => save({ sleep: Math.min(12, parseFloat((data.sleep + 0.5).toFixed(1))) })} t={t} sh={sh} style={{ flex: 1 }}>+30m</ActionBtn>
        </div>
      </Card>
      <Card t={t} sh={sh}>
        <SectionLabel t={t}>Mood Tracker</SectionLabel>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          {MOODS.map((m, i) => (
            <button key={i} onClick={() => logMood(i)} style={{ fontSize: 28, background: "none", border: "none", cursor: "pointer", transform: data.mood === i ? "scale(1.4)" : "scale(1)", transition: "transform 0.2s", filter: data.mood === i ? "none" : "grayscale(0.5) opacity(0.5)" }}>{m}</button>
          ))}
        </div>
        <p style={{ fontSize: 12, color: t.grey, textAlign: "center", marginBottom: 14 }}>Feeling: <strong>{MOOD_LABELS[data.mood]}</strong></p>
        {moodLog.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${t.lightGrey}` }}>
            <span style={{ fontSize: 20 }}>{MOODS[m.mood]}</span>
            <span style={{ fontSize: 11, color: t.grey }}>{m.time}</span>
          </div>
        ))}
      </Card>
    </div>
  );
};

// ─── JOURNAL ──────────────────────────────────────────────────────────────────
const JournalPage = ({ t, sh, userId, onToast }) => {
  const [entries, setEntries] = useState([]);
  const [writing, setWriting] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", mood: 2 });
  const [viewing, setViewing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    journalAPI.getAll(userId).then(({ data }) => { if (data) setEntries(data); setLoading(false); });
  }, [userId]);

  const save = async () => {
    if (!form.body.trim()) return;
    const { data, error } = await journalAPI.add(userId, { ...form, entry_date: new Date().toISOString().split("T")[0] });
    if (error) { onToast("Error saving entry"); return; }
    setEntries([data, ...entries]);
    setForm({ title: "", body: "", mood: 2 });
    setWriting(false);
    onToast("Entry saved ✓");
  };

  const del = async (id) => {
    await journalAPI.delete(id);
    setEntries(entries.filter(e => e.id !== id));
    setViewing(null);
    onToast("Entry deleted");
  };

  if (viewing) {
    const e = entries.find(x => x.id === viewing);
    return (
      <div className="page" style={{ padding: "70px 20px 100px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <BigNumber t={t} style={{ fontSize: 48 }}>{e.entry_date?.split("-")[2]}</BigNumber>
          <div style={{ display: "flex", gap: 8 }}>
            <ActionBtn secondary onClick={() => del(e.id)} t={t} sh={sh}><I n="trash" s={16} c={t.orange} /></ActionBtn>
            <ActionBtn secondary onClick={() => setViewing(null)} t={t} sh={sh}><I n="x" s={16} c={t.grey} /></ActionBtn>
          </div>
        </div>
        <p style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>{e.title || "Untitled"}</p>
        <p style={{ fontSize: 12, color: t.grey, marginBottom: 20 }}>{e.entry_date} · {MOODS[e.mood]}</p>
        <Card t={t} sh={sh}><p style={{ fontSize: 14, lineHeight: 1.8, color: t.black }}>{e.body}</p></Card>
      </div>
    );
  }

  if (writing) return (
    <div className="page" style={{ padding: "70px 20px 100px" }}>
      <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <BigNumber t={t} style={{ fontSize: 48 }}>WRITE</BigNumber>
        <div style={{ display: "flex", gap: 8 }}>
          <ActionBtn onClick={save} t={t} sh={sh}><I n="save" s={16} c={t.bg} /> Save</ActionBtn>
          <ActionBtn secondary onClick={() => setWriting(false)} t={t} sh={sh}><I n="x" s={16} c={t.grey} /></ActionBtn>
        </div>
      </div>
      <NeuInput t={t} sh={sh} placeholder="Title (optional)..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ marginBottom: 12 }} />
      <NeuTextarea t={t} sh={sh} autoFocus placeholder="What's on your mind today?..." rows={12} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} style={{ marginBottom: 14 }} />
      <Card t={t} sh={sh}>
        <SectionLabel t={t}>Mood</SectionLabel>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          {MOODS.map((m, i) => <button key={i} onClick={() => setForm({ ...form, mood: i })} style={{ fontSize: 28, background: "none", border: "none", cursor: "pointer", transform: form.mood === i ? "scale(1.4)" : "scale(1)", transition: "transform 0.2s", filter: form.mood === i ? "none" : "grayscale(0.5) opacity(0.5)" }}>{m}</button>)}
        </div>
      </Card>
    </div>
  );

  return (
    <div className="page" style={{ padding: "70px 20px 100px" }}>
      <div style={{ marginBottom: 20 }}><p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: t.grey, textTransform: "uppercase" }}>Reflections</p><BigNumber t={t}>JOURNAL</BigNumber></div>
      {loading && <p style={{ textAlign: "center", color: t.grey, padding: "32px 0" }}>Loading...</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
        {entries.map(e => (
          <Card key={e.id} t={t} sh={sh} style={{ cursor: "pointer" }} onClick={() => setViewing(e.id)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, color: t.grey, marginBottom: 4, fontWeight: 700 }}>{e.entry_date}</p>
                <p style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>{e.title || "Untitled entry"}</p>
                <p style={{ fontSize: 13, color: t.grey, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{e.body}</p>
              </div>
              <span style={{ fontSize: 28, marginLeft: 12 }}>{MOODS[e.mood]}</span>
            </div>
          </Card>
        ))}
        {entries.length === 0 && !loading && <p style={{ textAlign: "center", color: t.grey, padding: "32px 0" }}>No entries yet. Start writing.</p>}
      </div>
      <ActionBtn onClick={() => setWriting(true)} t={t} sh={sh} style={{ width: "100%" }}><I n="plus" s={18} c={t.bg} sw={2.5} /> New Entry</ActionBtn>
    </div>
  );
};

// ─── GOALS ────────────────────────────────────────────────────────────────────
const GoalsPage = ({ t, sh, goals, setGoals, userId, onToast }) => {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", deadline: "", progress: 0, notes: "" });

  const add = async () => {
    if (!form.title.trim()) return;
    const { data, error } = await goalsAPI.add(userId, form);
    if (error) { onToast("Error adding goal"); return; }
    setGoals([...goals, data]);
    setForm({ title: "", deadline: "", progress: 0, notes: "" });
    setAdding(false);
    onToast("Goal added ✓");
  };

  const update = async (id, progress) => {
    await goalsAPI.update(id, { progress });
    setGoals(goals.map(g => g.id === id ? { ...g, progress } : g));
  };

  const del = async (id) => {
    await goalsAPI.delete(id);
    setGoals(goals.filter(g => g.id !== id));
    onToast("Goal deleted");
  };

  return (
    <div className="page" style={{ padding: "70px 20px 100px" }}>
      <div style={{ marginBottom: 20 }}><p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: t.grey, textTransform: "uppercase" }}>Targets</p><BigNumber t={t}>GOALS</BigNumber></div>
      <Card t={t} sh={sh} style={{ marginBottom: 16, background: t.accent }}>
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: t.bg, opacity: 0.6, marginBottom: 6 }}>Primary Mission</p>
        <p style={{ fontSize: 18, fontWeight: 900, color: t.bg, marginBottom: 4 }}>Cybersecurity Role — 14+ LPA</p>
        <p style={{ fontSize: 12, color: t.bg, opacity: 0.7, marginBottom: 14 }}>Deadline: Dec 31, 2026</p>
        <div style={{ height: 6, borderRadius: 99, background: `${t.bg}30` }}>
          <div style={{ height: "100%", width: "35%", borderRadius: 99, background: t.bg }} />
        </div>
      </Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
        {goals.map(g => (
          <Card key={g.id} t={t} sh={sh}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 800, marginBottom: 2 }}>{g.title}</p>
                {g.deadline && <p style={{ fontSize: 11, color: t.grey }}>Due: {g.deadline}</p>}
                {g.notes && <p style={{ fontSize: 12, color: t.grey, marginTop: 4 }}>{g.notes}</p>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BigNumber t={t} style={{ fontSize: 32 }}>{g.progress}</BigNumber>
                <span style={{ fontSize: 14, color: t.grey }}>%</span>
                <IconBtn icon="trash" onClick={() => del(g.id)} t={t} sh={sh} size={28} />
              </div>
            </div>
            <div style={{ height: 6, borderRadius: 99, background: t.bg, boxShadow: sh.inset, marginBottom: 10 }}>
              <div style={{ height: "100%", width: `${g.progress}%`, borderRadius: 99, background: t.accent, transition: "width 0.4s ease" }} />
            </div>
            <input type="range" min={0} max={100} value={g.progress} onChange={e => update(g.id, parseInt(e.target.value))} style={{ width: "100%", accentColor: t.dark ? "#E0DDD7" : "#1A1A1A" }} />
          </Card>
        ))}
        {goals.length === 0 && <p style={{ textAlign: "center", color: t.grey, padding: "32px 0", fontSize: 14 }}>No goals yet.</p>}
      </div>
      {adding ? (
        <Card t={t} sh={sh} style={{ marginBottom: 16 }}>
          <NeuInput t={t} sh={sh} autoFocus placeholder="Goal title..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ marginBottom: 10 }} />
          <NeuTextarea t={t} sh={sh} placeholder="Notes..." rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ marginBottom: 10 }} />
          <NeuInput t={t} sh={sh} type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} style={{ marginBottom: 10 }} />
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 11, color: t.grey, marginBottom: 6 }}>Initial progress: {form.progress}%</p>
            <input type="range" min={0} max={100} value={form.progress} onChange={e => setForm({ ...form, progress: parseInt(e.target.value) })} style={{ width: "100%", accentColor: t.dark ? "#E0DDD7" : "#1A1A1A" }} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <ActionBtn onClick={add} t={t} sh={sh} style={{ flex: 1 }}>Add Goal</ActionBtn>
            <ActionBtn secondary onClick={() => setAdding(false)} t={t} sh={sh}><I n="x" s={16} c={t.grey} /></ActionBtn>
          </div>
        </Card>
      ) : (
        <ActionBtn onClick={() => setAdding(true)} t={t} sh={sh} style={{ width: "100%" }}><I n="plus" s={18} c={t.bg} sw={2.5} /> New Goal</ActionBtn>
      )}
    </div>
  );
};

// ─── REMINDERS ────────────────────────────────────────────────────────────────
const RemindersPage = ({ t, sh, reminders, setReminders, userId, onToast }) => {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", reminder_time: "", reminder_date: "" });

  const add = async () => {
    if (!form.title.trim()) return;
    const { data, error } = await remindersAPI.add(userId, { ...form, reminder_time: form.reminder_time || null, reminder_date: form.reminder_date || null, done: false });
    if (error) { onToast("Error adding reminder"); return; }
    setReminders([data, ...reminders]);
    setForm({ title: "", reminder_time: "", reminder_date: "" });
    setAdding(false);
    onToast("Reminder set ✓");
  };

  const toggle = async (r) => {
    const done = !r.done;
    await remindersAPI.update(r.id, { done });
    setReminders(reminders.map(x => x.id === r.id ? { ...x, done } : x));
  };

  const del = async (id) => {
    await remindersAPI.delete(id);
    setReminders(reminders.filter(r => r.id !== id));
    onToast("Reminder deleted");
  };

  return (
    <div className="page" style={{ padding: "70px 20px 100px" }}>
      <div style={{ marginBottom: 20 }}><p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: t.grey, textTransform: "uppercase" }}>Alerts</p><BigNumber t={t}>REMINDERS</BigNumber></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {reminders.map(r => (
          <Card key={r.id} t={t} sh={sh} style={{ display: "flex", alignItems: "center", gap: 12, opacity: r.done ? 0.5 : 1 }}>
            <CheckBtn checked={r.done} onToggle={() => toggle(r)} t={t} sh={sh} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 700, textDecoration: r.done ? "line-through" : "none" }}>{r.title}</p>
              {(r.reminder_time || r.reminder_date) && <p style={{ fontSize: 11, color: t.grey, marginTop: 2 }}>{r.reminder_time} {r.reminder_date && `· ${r.reminder_date}`}</p>}
            </div>
            <IconBtn icon="trash" onClick={() => del(r.id)} t={t} sh={sh} size={30} />
          </Card>
        ))}
        {reminders.length === 0 && <p style={{ textAlign: "center", color: t.grey, padding: "32px 0" }}>No reminders set.</p>}
      </div>
      {adding ? (
        <Card t={t} sh={sh} style={{ marginBottom: 16 }}>
          <NeuInput t={t} sh={sh} autoFocus placeholder="Reminder..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <NeuInput t={t} sh={sh} type="time" value={form.reminder_time} onChange={e => setForm({ ...form, reminder_time: e.target.value })} style={{ flex: 1 }} />
            <NeuInput t={t} sh={sh} type="date" value={form.reminder_date} onChange={e => setForm({ ...form, reminder_date: e.target.value })} style={{ flex: 1 }} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <ActionBtn onClick={add} t={t} sh={sh} style={{ flex: 1 }}>Add</ActionBtn>
            <ActionBtn secondary onClick={() => setAdding(false)} t={t} sh={sh}><I n="x" s={16} c={t.grey} /></ActionBtn>
          </div>
        </Card>
      ) : (
        <ActionBtn onClick={() => setAdding(true)} t={t} sh={sh} style={{ width: "100%" }}><I n="plus" s={18} c={t.bg} sw={2.5} /> New Reminder</ActionBtn>
      )}
    </div>
  );
};

// ─── PROFILE ──────────────────────────────────────────────────────────────────
const ProfilePage = ({ t, sh, darkMode, toggleDark, profile, setProfile, userId, tasks, habits, notes, onToast }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "", career_goal: "", location: "" });

  const startEdit = () => { setForm({ full_name: profile?.full_name || "", career_goal: profile?.career_goal || "", location: profile?.location || "" }); setEditing(true); };
  const save = async () => {
    const { data } = await profileAPI.update(userId, form);
    if (data) setProfile(data);
    setEditing(false);
    onToast("Profile updated ✓");
  };

  const signOut = async () => { await authAPI.signOut(); };
  const totalStreak = Math.max(...habits.map(h => h.streak), 0);

  return (
    <div className="page" style={{ padding: "70px 20px 100px" }}>
      <div style={{ marginBottom: 20 }}><p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: t.grey, textTransform: "uppercase" }}>You</p><BigNumber t={t}>PROFILE</BigNumber></div>
      <Card t={t} sh={sh} style={{ marginBottom: 16, textAlign: "center", padding: "32px 20px" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: t.accent, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: sh.raised }}>
          <BigNumber t={t} style={{ fontSize: 32, color: t.bg }}>{(profile?.full_name || "U").charAt(0).toUpperCase()}</BigNumber>
        </div>
        {editing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}>
            <NeuInput t={t} sh={sh} placeholder="Full name..." value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
            <NeuInput t={t} sh={sh} placeholder="Career goal..." value={form.career_goal} onChange={e => setForm({ ...form, career_goal: e.target.value })} />
            <NeuInput t={t} sh={sh} placeholder="Location..." value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            <div style={{ display: "flex", gap: 10 }}>
              <ActionBtn onClick={save} t={t} sh={sh} style={{ flex: 1 }}>Save</ActionBtn>
              <ActionBtn secondary onClick={() => setEditing(false)} t={t} sh={sh}><I n="x" s={16} c={t.grey} /></ActionBtn>
            </div>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>{profile?.full_name || "Your Name"}</p>
            <p style={{ fontSize: 13, color: t.grey }}>{profile?.career_goal || "Set your career goal"}</p>
            <p style={{ fontSize: 11, color: t.grey, marginTop: 4 }}>{profile?.location || "Your location"}</p>
            <ActionBtn secondary onClick={startEdit} t={t} sh={sh} style={{ marginTop: 16, width: "100%" }}><I n="edit" s={16} c={t.grey} /> Edit Profile</ActionBtn>
          </>
        )}
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {[{ label: "Best Streak", val: `${totalStreak}d` }, { label: "Tasks Done", val: tasks.filter(x => x.done).length }, { label: "Habits Active", val: habits.length }, { label: "Notes", val: notes.length }].map((s, i) => (
          <Card key={i} t={t} sh={sh} style={{ textAlign: "center", padding: "16px 12px" }}>
            <BigNumber t={t} style={{ fontSize: 40 }}>{s.val}</BigNumber>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: t.grey, marginTop: 4 }}>{s.label}</p>
          </Card>
        ))}
      </div>
      <Card t={t} sh={sh} style={{ marginBottom: 16 }}>
        <SectionLabel t={t}>Settings</SectionLabel>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${t.lightGrey}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <I n={darkMode ? "sun" : "moon"} s={18} c={t.black} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>{darkMode ? "Light Mode" : "Dark Mode"}</span>
          </div>
          <button onClick={toggleDark} style={{ width: 48, height: 26, borderRadius: 13, border: "none", cursor: "pointer", background: t.bg, boxShadow: sh.inset, position: "relative", transition: "background 0.3s" }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: t.accent, position: "absolute", top: 3, left: darkMode ? 25 : 3, transition: "left 0.3s", boxShadow: sh.btn }} />
          </button>
        </div>
        <div style={{ padding: "16px 0" }}>
          <ActionBtn onClick={signOut} t={t} sh={sh} secondary style={{ width: "100%" }}>
            <I n="logout" s={16} c={t.orange} /> <span style={{ color: t.orange }}>Sign Out</span>
          </ActionBtn>
        </div>
      </Card>
    </div>
  );
};

// ─── MORE MENU ────────────────────────────────────────────────────────────────
const MorePage = ({ setPage, t, sh }) => {
  const extras = [
    { id: "notes", icon: "notes", label: "Notes", desc: "Quick capture" },
    { id: "pomodoro", icon: "timer", label: "Pomodoro", desc: "Focus timer" },
    { id: "finance", icon: "finance", label: "Finance", desc: "Money tracker" },
    { id: "wellness", icon: "wellness", label: "Wellness", desc: "Health dashboard" },
    { id: "journal", icon: "journal", label: "Journal", desc: "Daily reflections" },
    { id: "goals", icon: "goal", label: "Goals", desc: "Track targets" },
    { id: "reminders", icon: "bell", label: "Reminders", desc: "Alerts & nudges" },
    { id: "profile", icon: "profile", label: "Profile", desc: "You & settings" },
  ];
  return (
    <div className="page" style={{ padding: "70px 20px 100px" }}>
      <div style={{ marginBottom: 24 }}><p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: t.grey, textTransform: "uppercase" }}>Everything</p><BigNumber t={t}>MORE</BigNumber></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {extras.map(e => (
          <Card key={e.id} t={t} sh={sh} style={{ cursor: "pointer", padding: "20px 16px" }} onClick={() => setPage(e.id)}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: t.bg, boxShadow: sh.inset, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}><I n={e.icon} s={20} c={t.black} /></div>
            <p style={{ fontSize: 15, fontWeight: 800, marginBottom: 2 }}>{e.label}</p>
            <p style={{ fontSize: 11, color: t.grey }}>{e.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
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

  // Load all data when session exists
  useEffect(() => {
    if (!session?.user?.id) return;
    const uid = session.user.id;
    const load = async () => {
      const [
        { data: t2 }, { data: h }, { data: r }, { data: n }, { data: g }, { data: e }, { data: p }
      ] = await Promise.all([
        tasksAPI.getAll(uid), habitsAPI.getAll(uid), remindersAPI.getAll(uid),
        notesAPI.getAll(uid), goalsAPI.getAll(uid), calendarAPI.getAll(uid), profileAPI.get(uid),
      ]);
      if (t2) setTasks(t2);
      if (h) setHabits(h);
      if (r) setReminders(r);
      if (n) setNotes(n);
      if (g) setGoals(g);
      if (e) setEvents(e);
      if (p) { setProfile(p); setDarkMode(p.dark_mode || false); }
    };
    load();
  }, [session]);

  // Persist dark mode
  useEffect(() => {
    if (!session?.user?.id || !profile) return;
    profileAPI.update(session.user.id, { dark_mode: darkMode });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [darkMode]);

  const toggleDark = () => setDarkMode(d => !d);
  const mainPages = ["home", "tasks", "cal", "habits", "more"];
  const activeTab = mainPages.includes(page) ? page : "more";
  const uid = session?.user?.id;

  if (authLoading) return <><style>{GS(t)}</style><Loader t={t} /></>;
  if (!session) return <><style>{GS(t)}</style><AuthScreen t={t} sh={sh} onToast={showToast} /></>;

  const shared = { t, sh, userId: uid, onToast: showToast };
  const pages = {
    home: <HomePage      {...shared} tasks={tasks} habits={habits} reminders={reminders} goals={goals} profile={profile} setPage={setPage} />,
    tasks: <TasksPage     {...shared} tasks={tasks} setTasks={setTasks} />,
    cal: <CalendarPage  {...shared} tasks={tasks} events={events} setEvents={setEvents} />,
    habits: <HabitsPage    {...shared} habits={habits} setHabits={setHabits} />,
    more: <MorePage t={t} sh={sh} setPage={setPage} />,
    notes: <NotesPage     {...shared} notes={notes} setNotes={setNotes} />,
    pomodoro: <PomodoroPage  {...shared} />,
    finance: <FinancePage   {...shared} />,
    wellness: <WellnessPage  {...shared} />,
    journal: <JournalPage   {...shared} />,
    goals: <GoalsPage     {...shared} goals={goals} setGoals={setGoals} />,
    reminders: <RemindersPage {...shared} reminders={reminders} setReminders={setReminders} />,
    profile: <ProfilePage   {...shared} darkMode={darkMode} toggleDark={toggleDark} profile={profile} setProfile={setProfile} tasks={tasks} habits={habits} notes={notes} />,
  };

  return (
    <>
      <style>{GS(t)}</style>
      <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: t.bg, position: "relative", transition: "background 0.4s" }}>
        <TopBar title={!mainPages.includes(page) ? page.toUpperCase() : "ARISE"} darkMode={darkMode} toggleDark={toggleDark} onBell={() => setPage("reminders")} t={t} sh={sh} />
        <div key={page}>{pages[page] || pages.home}</div>
        <BottomNav active={activeTab} setActive={setPage} t={t} sh={sh} />
        <Toast msg={toast} t={t} sh={sh} />
      </div>
    </>
  );
}


