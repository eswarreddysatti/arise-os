import React from 'react';
import { MONTHS, WDAYS } from '../utils/constants';
import { Card, SectionLabel, BigNumber, ActionBtn, Segment } from '../components/SharedUI';

export const HomePage = ({ t, sh, tasks, habits, focusSessions = [], wellness = {}, profile, setPage }) => {
  const now = new Date();
  const name = profile?.full_name?.split(" ")[0] || "Chief";
  
  // Logic for Focus Analytics
  const todayFocus = focusSessions.filter(s => new Date(s.start_time).toDateString() === now.toDateString());
  const focusTime = todayFocus.reduce((acc, s) => acc + (s.duration || 0), 0);
  const activeSession = todayFocus.find(s => !s.completed);

  // Today's Tasks
  const todayTasks = tasks.filter(t => !t.done).slice(0, 3);
  
  // Habits Streak info
  const doneHabits = habits.filter(h => h.done_today).length;
  const avgStreak = habits.length ? Math.round(habits.reduce((acc, h) => acc + (h.streak || 0), 0) / habits.length) : 0;

  // Wellness Calculations
  const getSleepHours = () => {
    if (!wellness.sleep_start || !wellness.sleep_wake) return 0;
    const start = new Date(wellness.sleep_start);
    const wake = new Date(wellness.sleep_wake);
    let diff = (wake - start) / 1000 / 60 / 60;
    if (diff < 0) diff += 24;
    return diff.toFixed(1);
  };

  const wellnessStats = [
    { label: "Water", val: ((wellness.water_intake_ml || 0) / 1000).toFixed(1), unit: "L" },
    { label: "Steps", val: (wellness.steps || 0) >= 1000 ? ((wellness.steps || 0) / 1000).toFixed(1) : (wellness.steps || 0), unit: (wellness.steps || 0) >= 1000 ? "K" : "S" },
    { label: "Sleep", val: getSleepHours(), unit: "H" }
  ];

  return (
    <div className="page" style={{ padding: "80px 24px 120px" }}>
      {/* 1. Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.2em", color: t.grey, textTransform: "uppercase", marginBottom: 4 }}>{MONTHS[now.getMonth()]} {now.getFullYear()}</p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <BigNumber t={t} style={{ fontSize: 100 }}>{now.getDate()}</BigNumber>
          <div style={{ paddingBottom: 12 }}>
            <p style={{ fontSize: 28, fontWeight: 900, textTransform: "uppercase", lineHeight: 1 }}>{WDAYS[(now.getDay() + 6) % 7]}</p>
            <p style={{ fontSize: 14, color: t.grey, fontWeight: 600, marginTop: 4 }}>Arise, {name}.</p>
          </div>
        </div>
      </div>

      {/* 2. Focus Status Segment */}
      <Card t={t} sh={sh} style={{ marginBottom: 20, borderLeft: activeSession ? `6px solid ${t.orange}` : "none" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Segment label="Focus Mode" value={activeSession ? "ACTIVE" : "IDLE"} t={t} />
          <ActionBtn onClick={() => setPage('pomodoro')} t={t} sh={sh} style={{ padding: "12px 20px", fontSize: 11 }}>
            {activeSession ? "RESUME" : "START FOCUS"}
          </ActionBtn>
        </div>
      </Card>

      {/* 3. Today's Tasks */}
      <SectionLabel t={t}>Priority Tasks</SectionLabel>
      <Card t={t} sh={sh} style={{ marginBottom: 24, padding: "12px 20px" }}>
        {todayTasks.length > 0 ? todayTasks.map(task => (
          <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${t.bgDeep}` }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: task.priority === 'high' ? t.orange : t.grey }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: t.black }}>{task.title}</span>
          </div>
        )) : <p style={{ fontSize: 13, color: t.grey, padding: "10px 0" }}>All clear for now.</p>}
        <p onClick={() => setPage('tasks')} style={{ fontSize: 11, fontWeight: 900, color: t.orange, cursor: "pointer", marginTop: 12, textAlign: "right", letterSpacing: "0.05em" }}>VIEW ALL →</p>
      </Card>

      {/* 4 & 5. Habits & Focus Analytics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <Card t={t} sh={sh} style={{ padding: 20 }}>
          <Segment label="Habit Streak" value={avgStreak} unit="Days" t={t} />
          <p style={{ fontSize: 11, fontWeight: 700, color: t.grey, marginTop: 8 }}>{doneHabits} completed today</p>
        </Card>
        <Card t={t} sh={sh} style={{ padding: 20 }}>
          <Segment label="Focus Time" value={focusTime} unit="Mins" t={t} />
          <p style={{ fontSize: 11, fontWeight: 700, color: t.grey, marginTop: 8 }}>{todayFocus.length} sessions logged</p>
        </Card>
      </div>

      {/* 6. Wellness Segment */}
      <SectionLabel t={t}>Wellness Status</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        {wellnessStats.map(w => (
          <Card key={w.label} t={t} sh={sh} style={{ padding: "16px 12px", textAlign: "center" }} onClick={() => setPage('wellness')}>
            <p style={{ fontSize: 9, fontWeight: 900, color: t.grey, marginBottom: 4, textTransform: "uppercase" }}>{w.label}</p>
            <BigNumber t={t} style={{ fontSize: 32 }}>{w.val}</BigNumber>
            <span style={{ fontSize: 10, fontWeight: 900, color: t.grey }}>{w.unit}</span>
          </Card>
        ))}
      </div>

      {/* 7. Quick Actions Segment */}
      <SectionLabel t={t}>Rapid Capture</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        <ActionBtn onClick={() => setPage('tasks')} t={t} sh={sh} secondary style={{ padding: "14px", fontSize: 11 }}>+ New Task</ActionBtn>
        <ActionBtn onClick={() => setPage('notes')} t={t} sh={sh} secondary style={{ padding: "14px", fontSize: 11 }}>+ Quick Note</ActionBtn>
        <ActionBtn onClick={() => setPage('wellness')} t={t} sh={sh} secondary style={{ padding: "14px", fontSize: 11 }}>+ Log Water</ActionBtn>
        <ActionBtn onClick={() => setPage('journal')} t={t} sh={sh} secondary style={{ padding: "14px", fontSize: 11 }}>+ Journal</ActionBtn>
      </div>

      {/* 8. Dynamic Insights */}
      <Card t={t} sh={sh} style={{ background: t.bgDeep, boxShadow: "none", border: `1px dashed ${t.lightGrey}` }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: t.grey, lineHeight: 1.6, textAlign: "center" }}>
          You're most productive between 9 AM and 11 AM. Your focus streak is currently 4 days strong.
        </p>
      </Card>
    </div>
  );
};
