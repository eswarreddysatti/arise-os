import React, { useState } from 'react';
import { habitsAPI } from '../lib/supabase';
import { I } from '../components/Icons';
import { Card, Pill, CheckBtn, IconBtn, NeuInput, BigNumber, ActionBtn } from '../components/SharedUI';

export const HabitsPage = ({ t, sh, habits, setHabits, userId, onToast }) => {
  const [adding, setAdding] = useState(false);
  const [newHabit, setNewHabit] = useState("");

  const toggle = async (habit) => {
    const done_today = !habit.done_today;
    const streak = done_today ? (habit.streak || 0) + 1 : Math.max(0, (habit.streak || 0) - 1);
    await habitsAPI.update(habit.id, { done_today, streak });
    setHabits(habits.map(h => h.id === habit.id ? { ...h, done_today, streak } : h));
  };

  const add = async () => {
    if (!newHabit.trim()) return;
    const { data } = await habitsAPI.add(userId, { title: newHabit, streak: 0, done_today: false });
    if (data) setHabits([data, ...habits]);
    setNewHabit(""); setAdding(false);
    onToast("Habit added");
  };

  const del = async (id) => {
    await habitsAPI.delete(id);
    setHabits(habits.filter(h => h.id !== id));
    onToast("Habit removed");
  };

  return (
    <div className="page" style={{ padding: "70px 20px 100px" }}>
      <div style={{ marginBottom: 20 }}><p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: t.grey, textTransform: "uppercase" }}>Consistency</p><BigNumber t={t}>HABITS</BigNumber></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        {habits.map(h => (
          <Card key={h.id} t={t} sh={sh} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px" }}>
            <CheckBtn checked={h.done_today} onToggle={() => toggle(h)} t={t} sh={sh} size={36} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 15, fontWeight: 800 }}>{h.title}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <I n="fire" s={14} c={t.orange} />
                <span style={{ fontSize: 13, fontWeight: 700, color: t.grey }}>{h.streak} day streak</span>
              </div>
            </div>
            <IconBtn icon="trash" onClick={() => del(h.id)} t={t} sh={sh} size={32} />
          </Card>
        ))}
      </div>
      {adding ? (
        <Card t={t} sh={sh} style={{ display: "flex", gap: 10 }}>
          <NeuInput t={t} sh={sh} placeholder="Drink water..." value={newHabit} onChange={e => setNewHabit(e.target.value)} autoFocus />
          <IconBtn icon="check" onClick={add} t={t} sh={sh} active />
          <IconBtn icon="x" onClick={() => setAdding(false)} t={t} sh={sh} />
        </Card>
      ) : (
        <ActionBtn onClick={() => setAdding(true)} t={t} sh={sh} style={{ width: "100%" }}><I n="plus" s={18} c={t.bg} sw={2.5} /> New Habit</ActionBtn>
      )}
    </div>
  );
};


