import React, { useState } from "react";
import { authAPI } from "../lib/supabase";
import { I } from "../components/Icons";
import { BigNumber, NeuInput, ActionBtn } from "../components/SharedUI";

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
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ marginBottom: 48, textAlign: "center" }}>
        <BigNumber t={t} style={{ fontSize: 80 }}>ARISE</BigNumber>
        <p style={{ fontSize: 14, color: t.grey, fontWeight: 500, marginTop: 8, letterSpacing: "0.06em" }}>Personal Life OS</p>
      </div>

      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ display: "flex", background: t.card, borderRadius: 50, boxShadow: sh.inset, padding: 4, marginBottom: 28 }}>
          {["login", "signup"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); }} style={{ flex: 1, padding: "10px", border: "none", cursor: "pointer", borderRadius: 50, fontSize: 13, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", background: mode === m ? t.accent : "transparent", color: mode === m ? t.bg : t.grey, boxShadow: mode === m ? sh.btn : "none", transition: "all 0.25s" }}>
              {m === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {mode === "signup" && (
            <NeuInput t={t} sh={sh} placeholder="Full name..." value={name} onChange={e => setName(e.target.value)} />
          )}
          <NeuInput t={t} sh={sh} type="email" placeholder="Email address..." value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} />
          <div style={{ position: "relative" }}>
            <NeuInput t={t} sh={sh} type={showPass ? "text" : "password"} placeholder="Password..." value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} style={{ paddingRight: 48 }} />
            <button onClick={() => setShowPass(s => !s)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
              <I n={showPass ? "eyeOff" : "eye"} s={16} c={t.grey} />
            </button>
          </div>

          {error && <p style={{ fontSize: 12, color: t.orange, fontWeight: 600, textAlign: "center" }}>{error}</p>}

          <ActionBtn onClick={submit} t={t} sh={sh} disabled={loading} style={{ width: "100%", marginTop: 8, fontSize: 16, padding: "16px" }}>
            {loading ? <div className="spin" style={{ width: 20, height: 20, border: `2px solid ${t.bg}40`, borderTopColor: t.bg, borderRadius: "50%" }} /> : (mode === "login" ? "Log In" : "Create Account")}
          </ActionBtn>
        </div>

        {mode === "signup" && (
          <p style={{ fontSize: 11, color: t.grey, textAlign: "center", marginTop: 16, lineHeight: 1.6 }}>
            By signing up you agree to store your data securely on Supabase.
          </p>
        )}
      </div>
    </div>
  );
};
