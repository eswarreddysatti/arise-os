import React from 'react';
import { Card, BigNumber } from '../components/SharedUI';
import { I } from '../components/Icons';

export const WellnessPage = ({ t, sh }) => {
  const stats = [
    { label: "Sleep", val: "7h 20m", icon: "sleep", color: "#5C6BC0" },
    { label: "Steps", val: "8,420", icon: "steps", color: "#66BB6A" },
    { label: "Water", val: "1.2L", icon: "water", color: "#42A5F5" },
    { label: "Mood", val: "Good", icon: "mood", color: "#FFCA28" },
  ];
  return (
    <div className="page" style={{ padding: "70px 20px 100px" }}>
      <div style={{ marginBottom: 20 }}><p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: t.grey, textTransform: "uppercase" }}>Vitality</p><BigNumber t={t}>WELLNESS</BigNumber></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {stats.map(s => (
          <Card key={s.label} t={t} sh={sh} style={{ padding: "20px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: t.bg, display: "flex", alignItems: "center", justifyContent: "center" }}><I n={s.icon} s={18} c={s.color} /></div>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }} />
            </div>
            <p style={{ fontSize: 11, fontWeight: 800, color: t.grey, textTransform: "uppercase", marginBottom: 4 }}>{s.label}</p>
            <p style={{ fontSize: 20, fontWeight: 900 }}>{s.val}</p>
          </Card>
        ))}
      </div>
      <Card t={t} sh={sh} style={{ marginTop: 20, padding: "20px" }}>
        <p style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>Weekly Activity</p>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: 100, gap: 8 }}>
          {[40, 70, 55, 90, 65, 80, 45].map((h, i) => (
            <div key={i} style={{ flex: 1, height: `${h}%`, background: h > 75 ? t.accent : t.lightGrey, borderRadius: 4, position: "relative" }} />
          ))}
        </div>
      </Card>
    </div>
  );
};
