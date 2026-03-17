import React, { useState } from "react";
import { authAPI, supabase } from "../lib/supabase";
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

  const signInOAuth = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider });
      if (error) throw error;
    } catch (e) {
      setError(e.message || `${provider} login failed.`);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px", animation: "fadeUp 0.6s ease-out" }}>
      <div style={{ marginBottom: 56, textAlign: "center" }}>
        <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.25em", color: t.grey, textTransform: "uppercase", marginBottom: 8 }}>V3.0 PRO</p>
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

          {/* OAuth Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "8px 0" }}>
            <div style={{ flex: 1, height: 1, background: t.bgDeep }} />
            <span style={{ fontSize: 10, fontWeight: 900, color: t.grey, letterSpacing: "0.2em" }}>OR</span>
            <div style={{ flex: 1, height: 1, background: t.bgDeep }} />
          </div>

          {/* OAuth Buttons */}
          <button onClick={() => signInOAuth('google')} style={{
            width: "100%", padding: "14px 20px", borderRadius: 16, border: "1px solid #DADCE0",
            background: "#FFFFFF", cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 12, fontSize: 14, fontWeight: 600, color: "#3C4043",
            boxShadow: sh.card, transition: "all 0.2s"
          }}>
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Continue with Google
          </button>

          <button onClick={() => signInOAuth('apple')} style={{
            width: "100%", padding: "14px 20px", borderRadius: 16, border: "none",
            background: "#000000", cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 12, fontSize: 14, fontWeight: 600, color: "#FFFFFF",
            boxShadow: sh.card, transition: "all 0.2s"
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-1.55 4.41-3.74 4.25z"/></svg>
            Continue with Apple
          </button>

          <button onClick={() => signInOAuth('github')} style={{
            width: "100%", padding: "14px 20px", borderRadius: 16, border: "none",
            background: "#24292e", cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 12, fontSize: 14, fontWeight: 600, color: "#FFFFFF",
            boxShadow: sh.card, transition: "all 0.2s"
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            Continue with GitHub
          </button>
        </div>

        {/* Bottom Messaging */}
        <div style={{ marginTop: 40, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: t.grey, fontWeight: 700, marginBottom: 8 }}>
            {mode === "login" ? "New to ARISE?" : "Already have an account?"}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              style={{ background: "none", border: "none", color: t.accent, fontWeight: 900, cursor: "pointer", marginLeft: 6, fontSize: 13 }}
            >
              {mode === "login" ? "Create your account" : "Sign in"}
            </button>
          </p>
          <div style={{ marginTop: 16, padding: "12px 16px", background: t.bgDeep, borderRadius: 12 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: t.grey, lineHeight: 1.6, letterSpacing: "0.03em" }}>
              🔒 Your tasks, habits, and notes are 100% private
              <br />🛡 Each account is completely isolated
              <br />🔄 Sign out anytime to switch accounts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
