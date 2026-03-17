import React from 'react';
import { I } from './Icons';
import { IconBtn } from './SharedUI';

const TABS = [
  { id: "home", icon: "home", label: "Home" },
  { id: "tasks", icon: "tasks", label: "Tasks" },
  { id: "cal", icon: "cal", label: "Cal" },
  { id: "habits", icon: "habit", label: "Habits" },
  { id: "more", icon: "more", label: "More" },
];

export const BottomNav = ({ active, setActive, t, sh }) => (
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

export const TopBar = ({ title, darkMode, toggleDark, onBell, t, sh }) => (
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
