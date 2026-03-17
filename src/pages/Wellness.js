import React, { useState } from 'react';
import { Card, SectionLabel, BigNumber, ActionBtn, IconBtn, Segment } from '../components/SharedUI';
import { I } from '../components/Icons';
import { wellnessAPI } from '../lib/supabase';

export const WellnessPage = ({ t, sh, wellness, setWellness, userId, onToast }) => {
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const updateWellness = async (updates) => {
    if (!userId) return;
    setLoading(true);
    const newData = { ...wellness, ...updates };
    const { data, error } = await wellnessAPI.update(userId, today, updates);
    if (!error && data) {
      setWellness(data);
      onToast("Wellness updated");
    } else {
      onToast("Error updating wellness");
    }
    setLoading(false);
  };

  const stats = [
    { label: "Steps", val: wellness.steps || 0, unit: "K", icon: "steps", color: "#66BB6A", key: "steps", step: 0.5 },
    { label: "Water", val: wellness.water || 0, unit: "L", icon: "water", color: "#42A5F5", key: "water", step: 0.25 },
    { label: "Sleep", val: wellness.sleep || 0, unit: "H", icon: "sleep", color: "#5C6BC0", key: "sleep", step: 0.5 },
  ];

  const moods = [
    { label: "Awful", val: 1, icon: "mood-1" },
    { label: "Poor", val: 2, icon: "mood-2" },
    { label: "Neutral", val: 3, icon: "mood-3" },
    { label: "Good", val: 4, icon: "mood-4" },
    { label: "Great", val: 5, icon: "mood-5" },
  ];

  return (
    <div className="page" style={{ padding: "80px 24px 120px" }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.25em", color: t.grey, textTransform: "uppercase" }}>Vitality System</p>
        <BigNumber t={t}>WELLNESS</BigNumber>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {stats.map(s => (
          <Card key={s.label} t={t} sh={sh} style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: t.bg, boxShadow: sh.inset, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <I n={s.icon} s={22} c={s.color} />
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 800, color: t.grey, textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span style={{ fontSize: 28, fontWeight: 900, color: t.black }}>{s.val}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: t.grey }}>{s.unit}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <IconBtn icon="minus" onClick={() => updateWellness({ [s.key]: Math.max(0, s.val - s.step) })} t={t} sh={sh} size={40} />
                <IconBtn icon="plus" onClick={() => updateWellness({ [s.key]: s.val + s.step })} t={t} sh={sh} size={40} />
              </div>
            </div>
          </Card>
        ))}

        <SectionLabel t={t}>Current Mood</SectionLabel>
        <Card t={t} sh={sh} style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {moods.map(m => {
              const active = wellness.mood === m.val;
              return (
                <button 
                  key={m.val} 
                  onClick={() => updateWellness({ mood: m.val })}
                  style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "center", 
                    gap: 8, 
                    border: "none", 
                    background: "transparent", 
                    cursor: "pointer",
                    transition: "all 0.3s"
                  }}
                >
                  <div style={{ 
                    width: 50, 
                    height: 50, 
                    borderRadius: "50%", 
                    background: active ? t.accent : t.bg, 
                    boxShadow: active ? sh.btn : sh.card,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: active ? "scale(1.1)" : "scale(1)"
                  }}>
                    <I n={m.icon} s={24} c={active ? t.bg : t.grey} />
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 800, color: active ? t.black : t.grey, textTransform: "uppercase" }}>{m.label}</span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card t={t} sh={sh} style={{ padding: "24px", marginTop: 12 }}>
          <SectionLabel t={t}>Daily Insight</SectionLabel>
          <p style={{ fontSize: 14, color: t.grey, lineHeight: 1.6, fontWeight: 500 }}>
            {wellness.water < 2 ? "You're slightly behind on your water goal. Have a glass now!" : "Excellent hydration today!"} 
            {wellness.sleep < 7 ? " Aim for an earlier bedtime tonight to recharge." : " Your sleep cycle is looking healthy."}
          </p>
        </Card>
      </div>
    </div>
  );
};
