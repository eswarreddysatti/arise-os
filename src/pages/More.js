import React from 'react';
import { I } from '../components/Icons';
import { Card, BigNumber } from '../components/SharedUI';

export const MorePage = ({ setPage, t, sh }) => {
  const extras = [
    { id: "glowup", icon: "glow", label: "Glow-Up", desc: "Wedding transformation" },
    { id: "notes", icon: "notes", label: "Notes", desc: "Quick capture" },
    { id: "pomodoro", icon: "timer", label: "Pomodoro", desc: "Focus timer" },
    { id: "finance", icon: "finance", label: "Finance", desc: "Money tracker" },
    { id: "wellness", icon: "wellness", label: "Wellness", desc: "Health dashboard" },
    { id: "journal", icon: "journal", label: "Daily reflections" },
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
