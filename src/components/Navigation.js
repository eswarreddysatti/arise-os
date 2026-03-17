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
  <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: t.card, boxShadow: `0 -10px 30px ${t.sdark}`, padding: "12px 18px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 100, borderRadius: "32px 32px 0 0", borderTop: `1px solid ${t.slight}` }}>
    {TABS.map(tab => {
      const isActive = active === tab.id;
      return (
        <button 
          key={tab.id} 
          onClick={() => setActive(tab.id)} 
          style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "center",
            gap: 6, 
            padding: "10px", 
            border: "none", 
            cursor: "pointer", 
            background: isActive ? t.accent : "transparent", 
            borderRadius: 20, 
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", 
            color: isActive ? t.bg : t.grey,
            minWidth: 64,
            boxShadow: isActive ? sh.btn : "none"
          }}
        >
          <I n={tab.icon} s={22} c={isActive ? t.bg : t.grey} sw={isActive ? 2.2 : 1.8} />
          <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", opacity: isActive ? 1 : 0.7 }}>{tab.label}</span>
        </button>
      );
    })}
  </div>
);

export const TopBar = ({ title, darkMode, toggleDark, onBell, t, sh, logo }) => (
  <div style={{ position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, zIndex: 50, background: t.bg, padding: "20px 24px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${t.slight}` }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {logo && <img src={logo} alt="Logo" style={{ height: 28, width: "auto", borderRadius: 6, boxShadow: sh.card }} />}
      <span style={{ fontFamily: "'Bebas Neue'", fontSize: 26, letterSpacing: "0.15em", color: t.black }}>{title || "ARISE"}</span>
    </div>
    <div style={{ display: "flex", gap: 10 }}>
      <IconBtn icon={darkMode ? "sun" : "moon"} onClick={toggleDark} t={t} sh={sh} size={40} />
      <div style={{ position: "relative" }}>
        <IconBtn icon="bell" onClick={onBell} t={t} sh={sh} size={40} />
        <div style={{ position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: "50%", background: t.orange, boxShadow: `0 0 10px ${t.orange}80` }} />
      </div>
    </div>
  </div>
);
