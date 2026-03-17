import React, { useState } from 'react';
import { remindersAPI } from '../lib/supabase';
import { I } from '../components/Icons';
import { Card, CheckBtn, IconBtn, NeuInput, BigNumber, ActionBtn } from '../components/SharedUI';

export const RemindersPage = ({ t, sh, reminders, setReminders, userId, onToast }) => {
  const [adding, setAdding] = useState(false);
  const [newRem, setNewRem] = useState("");

  const toggle = async (rem) => {
    const done = !rem.done;
    await remindersAPI.update(rem.id, { done });
    setReminders(reminders.map(r => r.id === rem.id ? { ...r, done } : r));
  };

  const add = async () => {
    if (!newRem.trim()) return;
    const { data } = await remindersAPI.add(userId, { title: newRem, done: false });
    if (data) setReminders([data, ...reminders]);
    setAdding(false); setNewRem("");
    onToast("Reminder set");
  };

  const del = async (id) => {
    await remindersAPI.delete(id);
    setReminders(reminders.filter(r => r.id !== id));
    onToast("Reminder deleted");
  };

  return (
    <div className="page" style={{ padding: "70px 20px 100px" }}>
      <div style={{ marginBottom: 20 }}><p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: t.grey, textTransform: "uppercase" }}>Nudges</p><BigNumber t={t}>REMINDERS</BigNumber></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
        {reminders.map(r => (
          <Card key={r.id} t={t} sh={sh} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", opacity: r.done ? 0.6 : 1 }}>
            <CheckBtn checked={r.done} onToggle={() => toggle(r)} t={t} sh={sh} size={30} />
            <p style={{ flex: 1, fontSize: 14, fontWeight: 700, textDecoration: r.done ? "line-through" : "none" }}>{r.title}</p>
            <IconBtn icon="trash" onClick={() => del(r.id)} t={t} sh={sh} size={30} />
          </Card>
        ))}
      </div>
      {adding ? (
        <Card t={t} sh={sh} style={{ display: "flex", gap: 10 }}>
          <NeuInput t={t} sh={sh} placeholder="Don't forget to..." value={newRem} onChange={e => setNewRem(e.target.value)} autoFocus />
          <IconBtn icon="check" onClick={add} t={t} sh={sh} active />
        </Card>
      ) : (
        <ActionBtn onClick={() => setAdding(true)} t={t} sh={sh} style={{ width: "100%" }}><I n="plus" s={18} c={t.bg} sw={2.5} /> New Reminder</ActionBtn>
      )}
    </div>
  );
};
