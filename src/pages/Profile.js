import React, { useState, useRef } from 'react';
import { authAPI, profileAPI, supabase } from '../lib/supabase';
import { I } from '../components/Icons';
import { Card, SectionLabel, BigNumber, NeuInput, ActionBtn } from '../components/SharedUI';

// Client-side image compress & resize to 512x512
const processImage = (file) => new Promise((resolve) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 512;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      // Center crop
      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2;
      const sy = (img.height - min) / 2;
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

export const ProfilePage = ({ t, sh, darkMode, toggleDark, profile, setProfile, userId, tasks, habits, notes, onToast }) => {
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({ 
    full_name: "", 
    career_goal: "", 
    location: "", 
    avatar_url: "", 
    logo_url: "" 
  });

  const startEdit = () => { 
    setForm({ 
      full_name: profile?.full_name || "", 
      career_goal: profile?.career_goal || "", 
      location: profile?.location || "",
      avatar_url: profile?.avatar_url || "",
      logo_url: profile?.logo_url || ""
    }); 
    setEditing(true); 
  };

  const save = async () => {
    const { data, error } = await profileAPI.update(userId, form);
    if (data) {
      setProfile(data);
      setEditing(false);
      onToast("Identity Updated ✓");
    } else {
      onToast("Initialization Failed");
    }
  };

  // Avatar Upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const blob = await processImage(file);
      const path = `${userId}/avatar.jpg`;
      
      // Upload to Supabase Storage
      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(path, blob, { upsert: true, contentType: 'image/jpeg' });
      
      if (uploadErr) throw uploadErr;
      
      // Get public URL
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      const avatarUrl = urlData?.publicUrl + `?t=${Date.now()}`; // Cache bust
      
      // Update profile
      const { data, error: profileErr } = await profileAPI.update(userId, { avatar_url: avatarUrl });
      if (profileErr) throw profileErr;
      if (data) setProfile(data);
      
      onToast("Avatar uploaded ✓");
    } catch (err) {
      console.error("Avatar Upload Error:", err);
      onToast("Upload failed: " + (err.message || "Unknown error"));
    }
    setUploading(false);
  };

  // Enhanced Sign Out
  const signOut = async () => {
    await authAPI.signOut();
    localStorage.clear();
    onToast("Signed out successfully");
  };

  const maxStreak = habits.length ? Math.max(...habits.map(h => h.streak || 0)) : 0;
  const xp = tasks.filter(t2 => t2.done).length * 10;

  return (
    <div className="page" style={{ padding: "80px 24px 120px", animation: "fadeUp 0.5s ease-out" }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        capture="environment"
        onChange={handleAvatarUpload}
        style={{ display: "none" }}
      />

      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.25em", color: t.grey, textTransform: "uppercase" }}>Master Identity</p>
        <BigNumber t={t}>PROFILE</BigNumber>
      </div>

      <Card t={t} sh={sh} style={{ marginBottom: 24, padding: "32px 24px" }}>
        {/* Avatar with Upload */}
        <div
          style={{ position: "relative", width: 100, height: 100, margin: "0 auto 24px", cursor: "pointer" }}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <div style={{ 
            width: 100, height: 100, borderRadius: 32,
            background: t.card, display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: sh.raised, overflow: "hidden",
            backgroundSize: "cover", backgroundPosition: "center",
            backgroundImage: profile?.avatar_url ? `url(${profile.avatar_url})` : "none",
            transition: "transform 0.3s",
          }}>
            {!profile?.avatar_url && (
              <BigNumber t={t} style={{ fontSize: 44, color: t.orange }}>
                {(profile?.full_name || "U").charAt(0).toUpperCase()}
              </BigNumber>
            )}
          </div>
          {/* Camera overlay */}
          <div style={{
            position: "absolute", bottom: -4, right: -4,
            width: 32, height: 32, borderRadius: 10,
            background: t.accent, boxShadow: sh.btn,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {uploading ? (
              <div className="spin" style={{ width: 14, height: 14, border: `2px solid ${t.bg}40`, borderTopColor: t.bg, borderRadius: "50%" }} />
            ) : (
              <I n="camera" s={14} c={t.bg} />
            )}
          </div>
          {profile?.logo_url && (
            <div style={{ 
              position: "absolute", top: -5, right: -5,
              width: 28, height: 28, borderRadius: 8,
              background: t.white, padding: 3, boxShadow: sh.card,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <img src={profile.logo_url} alt="Logo" style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 4 }} />
            </div>
          )}
        </div>

        {editing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, textAlign: "left" }}>
            <SectionLabel t={t}>Edit Personal Data</SectionLabel>
            <NeuInput t={t} sh={sh} placeholder="Full Name..." value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
            <NeuInput t={t} sh={sh} placeholder="Career Trajectory..." value={form.career_goal} onChange={e => setForm({ ...form, career_goal: e.target.value })} />
            <NeuInput t={t} sh={sh} placeholder="Primary Location..." value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            <NeuInput t={t} sh={sh} placeholder="Global Logo URL (HTTPS)..." value={form.logo_url} onChange={e => setForm({ ...form, logo_url: e.target.value })} />
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <ActionBtn onClick={save} t={t} sh={sh} style={{ flex: 1 }}>SAVE CHANGES</ActionBtn>
              <ActionBtn secondary onClick={() => setEditing(false)} t={t} sh={sh} style={{ width: 60 }}>
                <I n="x" s={20} c={t.grey} />
              </ActionBtn>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 26, fontWeight: 900, marginBottom: 6, color: t.black }}>{profile?.full_name || "Anonymous User"}</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: t.orange, textTransform: "uppercase", letterSpacing: "0.05em" }}>{profile?.career_goal || "UNSET SECTOR"}</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 8, color: t.grey }}>
              <I n="pin" s={12} c={t.grey} />
              <span style={{ fontSize: 12, fontWeight: 600 }}>{profile?.location || "Unknown Dimension"}</span>
            </div>
            <ActionBtn secondary onClick={startEdit} t={t} sh={sh} style={{ marginTop: 24, width: "100%", padding: "14px" }}>
              <I n="edit" s={16} c={t.grey} /> EDIT IDENTITY
            </ActionBtn>
          </div>
        )}
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <Card t={t} sh={sh} style={{ textAlign: "center", padding: "20px" }}>
          <p style={{ fontSize: 10, fontWeight: 900, color: t.grey, textTransform: "uppercase", marginBottom: 4 }}>TOTAL XP</p>
          <BigNumber t={t} style={{ fontSize: 44 }}>{xp}</BigNumber>
        </Card>
        <Card t={t} sh={sh} style={{ textAlign: "center", padding: "20px" }}>
          <p style={{ fontSize: 10, fontWeight: 900, color: t.grey, textTransform: "uppercase", marginBottom: 4 }}>STREAK</p>
          <BigNumber t={t} style={{ fontSize: 44 }}>{maxStreak}</BigNumber>
        </Card>
      </div>

      {/* Privacy Section */}
      <SectionLabel t={t}>Data Privacy</SectionLabel>
      <Card t={t} sh={sh} style={{ marginBottom: 24, padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: t.bg, boxShadow: sh.card, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <I n="shield" s={18} c={t.accent} />
          </div>
          <p style={{ fontSize: 14, fontWeight: 800, color: t.black }}>Your data is 100% private</p>
        </div>
        <p style={{ fontSize: 12, color: t.grey, lineHeight: 1.6 }}>
          ARISE uses Row Level Security (RLS) to ensure no one else can see your data. Each account is completely isolated and encrypted.
        </p>
      </Card>

      <SectionLabel t={t}>System Configuration</SectionLabel>
      <Card t={t} sh={sh} style={{ marginBottom: 24, padding: "8px 0" }}>
        <button 
          onClick={toggleDark} 
          style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", border: "none", background: "transparent", cursor: "pointer" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: t.bg, boxShadow: sh.card, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <I n={darkMode ? "sun" : "moon"} s={18} c={t.black} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 800, color: t.black }}>UI PROTOCOL: {darkMode ? "DARK" : "LIGHT"}</span>
          </div>
          <div style={{ width: 44, height: 24, borderRadius: 12, background: t.bgDeep, boxShadow: sh.inset, position: "relative" }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: t.orange, position: "absolute", top: 3, left: darkMode ? 23 : 3, transition: "all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)", boxShadow: sh.btn }} />
          </div>
        </button>

        <div style={{ height: 1, background: t.bgDeep, margin: "4px 20px" }} />

        {/* Sign Out with Confirmation */}
        {showSignOutConfirm ? (
          <div style={{ padding: "16px 20px" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: t.black, marginBottom: 12, textAlign: "center" }}>Sign out of your account?</p>
            <div style={{ display: "flex", gap: 12 }}>
              <ActionBtn onClick={signOut} t={t} sh={sh} danger style={{ flex: 1, padding: "12px" }}>CONFIRM</ActionBtn>
              <ActionBtn secondary onClick={() => setShowSignOutConfirm(false)} t={t} sh={sh} style={{ flex: 1, padding: "12px" }}>CANCEL</ActionBtn>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setShowSignOutConfirm(true)} 
            style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", border: "none", background: "transparent", cursor: "pointer" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: t.bg, boxShadow: sh.card, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <I n="logout" s={18} c={t.orange} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 800, color: t.orange }}>TERMINATE SESSION</span>
            </div>
            <I n="chevron-right" s={16} c={t.grey} />
          </button>
        )}
      </Card>

      <p style={{ textAlign: "center", fontSize: 11, color: t.grey, fontWeight: 800, letterSpacing: "0.2em" }}>ARISE OS V3.0 PRO</p>
    </div>
  );
};
