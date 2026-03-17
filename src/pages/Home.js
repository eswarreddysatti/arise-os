import React from 'react';
import { MONTHS, WDAYS, QUOTES } from '../utils/constants';
import { Card, SectionLabel, BigNumber } from '../components/SharedUI';

export const HomePage = ({ t, sh, tasks, habits, reminders, goals, profile, setPage }) => {
  const now = new Date();
  const doneTasks = tasks.filter(x => x.done).length;
  const doneHabits = habits.filter(x => x.done_today).length;
  const totalPct = tasks.length + habits.length ? Math.round(((doneTasks + doneHabits) / (tasks.length + habits.length)) * 100) : 0;
  const circ = 2 * Math.PI * 44;
  const quote = QUOTES[now.getDate() % QUOTES.length];
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
    </div>
  );
};
