import React, { useState } from 'react';
import { notesAPI } from '../lib/supabase';
import { I } from '../components/Icons';
import { Card, IconBtn, NeuInput, NeuTextarea, BigNumber, ActionBtn } from '../components/SharedUI';

export const NotesPage = ({ t, sh, notes, setNotes, userId, onToast }) => {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", body: "" });

  const add = async () => {
    if (!form.title.trim()) return;
    const { data } = await notesAPI.add(userId, form);
    if (data) setNotes([data, ...notes]);
    setAdding(false); setForm({ title: "", body: "" });
    onToast("Note saved");
  };

  const del = async (id) => {
    await notesAPI.delete(id);
    setNotes(notes.filter(n => n.id !== id));
    onToast("Note deleted");
  };

  return (
    <div className="page" style={{ padding: "70px 20px 100px" }}>
      <div style={{ marginBottom: 20 }}><p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: t.grey, textTransform: "uppercase" }}>Thoughts</p><BigNumber t={t}>NOTES</BigNumber></div>
      {adding ? (
        <Card t={t} sh={sh} style={{ marginBottom: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <NeuInput t={t} sh={sh} placeholder="Note title..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <NeuTextarea t={t} sh={sh} placeholder="Start writing..." value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} style={{ height: 120 }} />
          <div style={{ display: "flex", gap: 10 }}>
            <ActionBtn onClick={add} t={t} sh={sh} style={{ flex: 1 }}>Save Note</ActionBtn>
            <ActionBtn secondary onClick={() => setAdding(false)} t={t} sh={sh}><I n="x" s={16} c={t.grey} /></ActionBtn>
          </div>
        </Card>
      ) : (
        <ActionBtn onClick={() => setAdding(true)} t={t} sh={sh} style={{ marginBottom: 20, width: "100%" }}><I n="plus" s={18} c={t.bg} sw={2.5} /> Create Note</ActionBtn>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {notes.map(n => (
          <Card key={n.id} t={t} sh={sh} style={{ padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <p style={{ fontSize: 13, fontWeight: 800, lineHeight: 1.4 }}>{n.title}</p>
              <button onClick={() => del(n.id)} style={{ padding: 4, border: "none", background: "none", cursor: "pointer", opacity: 0.5 }}><I n="trash" s={14} c={t.black} /></button>
            </div>
            <p style={{ fontSize: 11, color: t.grey, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{n.body}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};
