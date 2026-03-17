import React, { useState } from 'react';
import { calendarAPI } from '../lib/supabase';
import { I } from '../components/Icons';
import { Card, Pill, IconBtn, NeuInput, BigNumber, SectionLabel, ActionBtn } from '../components/SharedUI';
import { MONTHS, WDAYS, WSHORT } from '../utils/constants';

export const CalendarPage = ({ t, sh, tasks, events, setEvents, userId, onToast }) => {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", event_date: new Date().toISOString().split('T')[0], type: "event" });
  const [selDate, setSelDate] = useState(new Date().toISOString().split('T')[0]);

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const startDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const shiftedStart = (startDay + 6) % 7;

  const add = async () => {
    if (!form.title.trim()) return;
    const { data } = await calendarAPI.add(userId, form);
    if (data) setEvents([data, ...events]);
    setAdding(false); setForm({ title: "", event_date: selDate, type: "event" });
    onToast("Event added");
  };

  const dayEvents = events.filter(e => e.event_date === selDate);
  const dayTasks = tasks.filter(t2 => t2.due_date === selDate);

  return (
    <div className="page" style={{ padding: "70px 20px 100px" }}>
      <div style={{ marginBottom: 20 }}><p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: t.grey, textTransform: "uppercase" }}>Timeline</p><BigNumber t={t}>CALENDAR</BigNumber></div>
      <Card t={t} sh={sh} style={{ padding: "16px", marginBottom: 16 }}>
        <p style={{ fontSize: 16, fontWeight: 900, textAlign: "center", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.06em" }}>{MONTHS[now.getMonth()]} {now.getFullYear()}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, textAlign: "center", marginBottom: 10 }}>
          {WSHORT.map(w => <span key={w} style={{ fontSize: 10, fontWeight: 900, color: t.grey }}>{w}</span>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {Array(shiftedStart).fill(0).map((_, i) => <div key={`e-${i}`} />)}
          {Array(daysInMonth).fill(0).map((_, i) => {
            const d = i + 1;
            const ds = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isSel = selDate === ds;
            const hasEvent = events.some(e => e.event_date === ds) || tasks.some(t2 => t2.due_date === ds);
            return (
              <button key={d} onClick={() => setSelDate(ds)} style={{ height: 40, border: "none", borderRadius: 10, background: isSel ? t.accent : "transparent", color: isSel ? t.bg : t.black, fontSize: 13, fontWeight: 800, cursor: "pointer", position: "relative", transition: "all 0.2s" }}>
                {d}
                {hasEvent && !isSel && <div style={{ position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: t.orange }} />}
              </button>
            );
          })}
        </div>
      </Card>

      <Card t={t} sh={sh} style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <SectionLabel t={t}>{selDate === new Date().toISOString().split('T')[0] ? "Today" : selDate}</SectionLabel>
          <IconBtn icon="plus" onClick={() => setAdding(true)} t={t} sh={sh} size={30} />
        </div>
        {adding && (
          <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <NeuInput t={t} sh={sh} placeholder="Meeting with team..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <div style={{ display: "flex", gap: 10 }}>
              <ActionBtn onClick={add} t={t} sh={sh} style={{ flex: 1 }}>Add</ActionBtn>
              <ActionBtn secondary onClick={() => setAdding(false)} t={t} sh={sh}>Cancel</ActionBtn>
            </div>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {dayEvents.length === 0 && dayTasks.length === 0 && <p style={{ fontSize: 13, color: t.grey, fontStyle: "italic", textAlign: "center", padding: "10px 0" }}>No plans for this day.</p>}
          {dayEvents.map(e => (
            <div key={e.id} style={{ padding: "12px 14px", background: t.bg, borderRadius: 12, borderLeft: `4px solid ${t.accent}` }}>
              <p style={{ fontSize: 14, fontWeight: 700 }}>{e.title}</p>
              <p style={{ fontSize: 10, color: t.grey, textTransform: "uppercase", marginTop: 2 }}>Event</p>
            </div>
          ))}
          {dayTasks.map(t2 => (
            <div key={t2.id} style={{ padding: "12px 14px", background: t.bg, borderRadius: 12, borderLeft: `4px solid ${t.orange}` }}>
              <p style={{ fontSize: 14, fontWeight: 700 }}>{t2.title}</p>
              <p style={{ fontSize: 10, color: t.grey, textTransform: "uppercase", marginTop: 2 }}>Task Due</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
