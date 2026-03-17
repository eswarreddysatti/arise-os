import React, { useState } from 'react';
import { goalsAPI } from '../lib/supabase';
import { BigNumber, Card, ActionBtn, NeuInput } from '../components/SharedUI';
import { I } from '../components/Icons';

export const GoalsPage = ({ t, sh, goals, setGoals, userId, onToast }) => {
  const [adding, setAdding] = useState(false);
  const [newGoal, setNewGoal] = useState("");

  const add = async () => {
    if (!newGoal.trim()) return;
    const { data } = await goalsAPI.add(userId, { title: newGoal, progress: 0 });
    if (data) setGoals([data, ...goals]);
    setAdding(false); setNewGoal("");
    onToast("Goal established");
  };

  const updateProg = async (g, delta) => {
    const progress = Math.min(100, Math.max(0, g.progress + delta));
    await goalsAPI.update(g.id, { progress });
    setGoals(goals.map(x => x.id === g.id ? { ...x, progress } : x));
  };

  return (
    <div className="page" style={{ padding: "70px 20px 100px" }}>
      <div style={{ marginBottom: 20 }}><p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: t.grey, textTransform: "uppercase" }}>Ambition</p><BigNumber t={t}>GOALS</BigNumber></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {goals.map(g => (
          <Card key={g.id} t={t} sh={sh} style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <p style={{ fontSize: 16, fontWeight: 900 }}>{g.title}</p>
              <span style={{ fontSize: 14, fontWeight: 900, color: t.orange }}>{g.progress}%</span>
            </div>
            <div style={{ height: 8, background: t.bg, borderRadius: 4, boxShadow: sh.inset, marginBottom: 16 }}>
              <div style={{ height: "100%", width: `${g.progress}%`, background: t.accent, borderRadius: 4, transition: "width 0.4s" }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => updateProg(g, -10)} style={{ flex: 1, padding: "8px", border: "none", borderRadius: 8, background: t.bg, boxShadow: sh.card, color: t.grey }}>-10%</button>
              <button onClick={() => updateProg(g, 10)} style={{ flex: 1, padding: "8px", border: "none", borderRadius: 8, background: t.bg, boxShadow: sh.card, color: t.grey }}>+10%</button>
            </div>
          </Card>
        ))}
        {adding ? (
          <Card t={t} sh={sh} style={{ display: "flex", gap: 10 }}>
            <NeuInput t={t} sh={sh} placeholder="Learn Spanish..." value={newGoal} onChange={e => setNewGoal(e.target.value)} />
            <ActionBtn onClick={add} t={t} sh={sh}>Add</ActionBtn>
          </Card>
        ) : (
          <ActionBtn onClick={() => setAdding(true)} t={t} sh={sh} style={{ width: "100%" }}>Create New Goal</ActionBtn>
        )}
      </div>
    </div>
  );
};
