import React, { useState } from "react";
import { authAPI } from "../lib/supabase";
import { I } from "../components/Icons";
import { BigNumber, NeuInput, ActionBtn, SectionLabel } from "../components/SharedUI";

export const AuthScreen = ({ t, sh, onToast }) => {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      if (mode === "login") {
        const { error: e } = await authAPI.signInWithPassword({ email, password });
        if (e) throw e;
      } else {
        if (!name.trim()) { setError("Please enter your name."); setLoading(false); return; }
        const { error: e } = await authAPI.signUp({ email, password, options: { data: { full_name: name, career_goal: "", location: "" } } });
        if (e) throw e;
        onToast("Check your email to confirm your account!");
      }
    } catch (e) {
      setError(e.message || "Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px", animation: "fadeUp 0.6s ease-out" }}>
      <div style={{ marginBottom: 56, textAlign: "center" }}>
        <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.25em", color: t.grey, textTransform: "uppercase", marginBottom: 8 }}>V2.0 PRO</p>
        <BigNumber t={t} style={{ fontSize: 96, lineHeight: 0.8 }}>ARISE</BigNumber>
        <p style={{ fontSize: 14, color: t.grey, fontWeight: 600, marginTop: 16, letterSpacing: "0.08em", textTransform: "uppercase" }}>Personal Life Operating System</p>
      </div>

      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ display: "flex", background: t.card, borderRadius: 20, boxShadow: sh.inset, padding: 6, marginBottom: 32 }}>
          {["login", "signup"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); }} style={{ flex: 1, padding: "12px", border: "none", cursor: "pointer", borderRadius: 16, fontSize: 12, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", background: mode === m ? t.accent : "transparent", color: mode === m ? t.bg : t.grey, boxShadow: mode === m ? sh.btn : "none", transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }}>
              {m === "login" ? "Log In" : "Register"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {mode === "signup" && (
            <div>
              <SectionLabel t={t}>Identity</SectionLabel>
              <NeuInput t={t} sh={sh} placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} style={{ padding: 16, fontSize: 15 }} />
            </div>
          )}
          
          <div>
            <SectionLabel t={t}>Authentication</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <NeuInput t={t} sh={sh} type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} style={{ padding: 16, fontSize: 15 }} />
              <div style={{ position: "relative" }}>
                <NeuInput t={t} sh={sh} type={showPass ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} style={{ padding: 16, paddingRight: 52, fontSize: 15 }} />
                <button onClick={() => setShowPass(s => !s)} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
                  <I n={showPass ? "eyeOff" : "eye"} s={18} c={t.grey} />
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div style={{ padding: "12px", borderRadius: 12, background: `${t.orange}10`, border: `1px solid ${t.orange}30`, animation: "shake 0.4s" }}>
              <p style={{ fontSize: 12, color: t.orange, fontWeight: 700, textAlign: "center", lineHeight: 1.4 }}>{error}</p>
            </div>
          )}

          <ActionBtn onClick={submit} t={t} sh={sh} disabled={loading} style={{ width: "100%", marginTop: 12, padding: "20px", borderRadius: 20 }}>
            {loading ? <div className="spin" style={{ width: 22, height: 22, border: `3px solid ${t.bg}40`, borderTopColor: t.bg, borderRadius: "50%" }} /> : (mode === "login" ? "ACCESS ARCHIVE" : "INITIALIZE OS")}
          </ActionBtn>
        </div>

        <div style={{ marginTop: 40, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: t.grey, fontWeight: 600, letterSpacing: "0.05em", lineHeight: 1.6 }}>
            {mode === "login" ? "Encrypted connection secured by Supabase." : "By initializing, you agree to our terms of intelligence."}
          </p>
        </div>
      </div>
    </div>
  );
};
