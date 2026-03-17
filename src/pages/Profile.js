import React, { useState } from 'react';
import { authAPI, profileAPI } from '../lib/supabase';
import { I } from '../components/Icons';
import { Card, SectionLabel, BigNumber, NeuInput, ActionBtn } from '../components/SharedUI';

export const ProfilePage = ({ t, sh, darkMode, toggleDark, profile, setProfile, userId, tasks, habits, notes, onToast }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "", career_goal: "", location: "" });

  const startEdit = () => { setForm({ full_name: profile?.full_name || "", career_goal: profile?.career_goal || "", location: profile?.location || "" }); setEditing(true); };
  const save = async () => {
    const { data } = await profileAPI.update(userId, form);
    if (data) setProfile(data);
    setEditing(false);
    onToast("Profile updated ✓");
  };

  const signOut = async () => { await authAPI.signOut(); };
  const totalStreak = Math.max(...habits.map(h => h.streak), 0);

  return (
    <div className="page" style={{ padding: "70px 20px 100px" }}>
      <div style={{ marginBottom: 20 }}><p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: t.grey, textTransform: "uppercase" }}>You</p><BigNumber t={t}>PROFILE</BigNumber></div>
      <Card t={t} sh={sh} style={{ marginBottom: 16, textAlign: "center", padding: "32px 20px" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: t.accent, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: sh.raised }}>
          <BigNumber t={t} style={{ fontSize: 32, color: t.bg }}>{(profile?.full_name || "U").charAt(0).toUpperCase()}</BigNumber>
        </div>
        {editing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}>
            <NeuInput t={t} sh={sh} placeholder="Full name..." value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
            <NeuInput t={t} sh={sh} placeholder="Career goal..." value={form.career_goal} onChange={e => setForm({ ...form, career_goal: e.target.value })} />
            <NeuInput t={t} sh={sh} placeholder="Location..." value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            <div style={{ display: "flex", gap: 10 }}>
              <ActionBtn onClick={save} t={t} sh={sh} style={{ flex: 1 }}>Save</ActionBtn>
              <ActionBtn secondary onClick={() => setEditing(false)} t={t} sh={sh}><I n="x" s={16} c={t.grey} /></ActionBtn>
            </div>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>{profile?.full_name || "Your Name"}</p>
            <p style={{ fontSize: 13, color: t.grey }}>{profile?.career_goal || "Set your career goal"}</p>
            <p style={{ fontSize: 11, color: t.grey, marginTop: 4 }}>{profile?.location || "Your location"}</p>
            <ActionBtn secondary onClick={startEdit} t={t} sh={sh} style={{ marginTop: 16, width: "100%" }}><I n="edit" s={16} c={t.grey} /> Edit Profile</ActionBtn>
          </>
        )}
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {[{ label: "Experience", val: tasks.filter(t2 => t2.done).length }, { label: "Max Streak", val: totalStreak }].map((s, i) => (
          <Card key={i} t={t} sh={sh} style={{ textAlign: "center", padding: "16px 12px" }}>
            <BigNumber t={t} style={{ fontSize: 40 }}>{s.val}</BigNumber>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: t.grey, marginTop: 4 }}>{s.label}</p>
          </Card>
        ))}
      </div>
      <Card t={t} sh={sh} style={{ marginBottom: 16 }}>
        <SectionLabel t={t}>Settings</SectionLabel>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${t.lightGrey}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <I n={darkMode ? "sun" : "moon"} s={18} c={t.black} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>{darkMode ? "Light Mode" : "Dark Mode"}</span>
          </div>
          <button onClick={toggleDark} style={{ width: 48, height: 26, borderRadius: 13, border: "none", cursor: "pointer", background: t.bg, boxShadow: sh.inset, position: "relative", transition: "background 0.3s" }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: t.accent, position: "absolute", top: 3, left: darkMode ? 25 : 3, transition: "left 0.3s", boxShadow: sh.btn }} />
          </button>
        </div>
        <div style={{ padding: "16px 0" }}>
          <ActionBtn onClick={signOut} t={t} sh={sh} secondary style={{ width: "100%" }}>
            <I n="logout" s={16} c={t.orange} /> <span style={{ color: t.orange }}>Sign Out</span>
          </ActionBtn>
        </div>
      </Card>
    </div>
  );
};
