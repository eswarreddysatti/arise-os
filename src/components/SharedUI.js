import React from 'react';
import { I } from './Icons';

export const Card = React.memo(({ children, style = {}, t, sh, ...props }) => (
  <div style={{ background: t.card, borderRadius: 24, boxShadow: sh.card, padding: 20, ...style }} {...props}>{children}</div>
));

export const Pill = React.memo(({ children, active, onClick, t, sh, style = {} }) => (
  <button onClick={onClick} style={{ padding: "8px 18px", border: "none", cursor: "pointer", whiteSpace: "nowrap", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", background: active ? t.accent : t.card, color: active ? t.bg : t.grey, borderRadius: 50, boxShadow: active ? sh.btn : sh.card, transition: "all 0.2s ease", ...style }}>{children}</button>
));

export const CheckBtn = React.memo(({ checked, onToggle, t, sh, size = 30 }) => (
  <button onClick={onToggle} style={{ width: size, height: size, borderRadius: size * 0.3, border: "none", cursor: "pointer", background: checked ? t.accent : t.bg, boxShadow: checked ? sh.btn : sh.inset, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.25s ease" }}>
    {checked && <I n="check" s={size * 0.5} c={t.bg} sw={3} />}
  </button>
));

export const IconBtn = React.memo(({ icon, onClick, t, sh, size = 38, active = false }) => (
  <button onClick={onClick} style={{ width: size, height: size, borderRadius: size * 0.3, border: "none", cursor: "pointer", background: active ? t.accent : t.card, boxShadow: active ? sh.btn : sh.card, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease" }}>
    <I n={icon} s={size * 0.45} c={active ? t.bg : t.grey} />
  </button>
));

export const NeuInput = ({ style = {}, t, sh, ...props }) => (
  <input style={{ width: "100%", padding: "12px 16px", borderRadius: 14, background: t.bg, boxShadow: sh.inset, fontSize: 14, fontWeight: 500, color: t.black, ...style }} {...props} />
);

export const NeuTextarea = ({ style = {}, t, sh, ...props }) => (
  <textarea style={{ width: "100%", padding: "12px 16px", borderRadius: 14, background: t.bg, boxShadow: sh.inset, fontSize: 14, fontWeight: 500, color: t.black, resize: "none", lineHeight: 1.6, ...style }} {...props} />
);

export const SectionLabel = ({ children, t }) => (
  <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: t.grey, marginBottom: 12 }}>{children}</p>
);

export const BigNumber = ({ children, t, style = {} }) => (
  <span style={{ fontFamily: "'Bebas Neue'", fontSize: 72, lineHeight: 1, color: t.black, letterSpacing: "0.02em", ...style }}>{children}</span>
);

export const ActionBtn = ({ children, onClick, t, sh, secondary = false, style = {}, disabled = false, danger = false }) => (
  <button 
    onClick={onClick} 
    disabled={disabled} 
    style={{ 
      padding: "16px 24px", 
      border: "none", 
      cursor: disabled ? "not-allowed" : "pointer", 
      borderRadius: 18, 
      background: danger ? t.orange : (secondary ? t.bg : t.accent), 
      color: (danger || !secondary) ? t.bg : t.grey, 
      boxShadow: secondary ? sh.card : sh.btn, 
      fontSize: 13, 
      fontWeight: 800, 
      letterSpacing: "0.1em", 
      textTransform: "uppercase",
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      gap: 8, 
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)", 
      opacity: disabled ? 0.6 : 1, 
      ...style 
    }}
  >
    {children}
  </button>
);

export const Segment = ({ label, value, unit, t }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    <SectionLabel t={t}>{label}</ SectionLabel>
    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
      <BigNumber t={t}>{value}</BigNumber>
      {unit && <span style={{ fontSize: 14, fontWeight: 700, color: t.grey, textTransform: "uppercase" }}>{unit}</span>}
    </div>
  </div>
);

export const Toast = ({ msg, t, sh }) => msg ? (
  <div style={{ position: "fixed", bottom: 120, left: "50%", transform: "translateX(-50%)", background: t.accent, color: t.bg, padding: "14px 28px", borderRadius: 50, fontSize: 13, fontWeight: 800, boxShadow: sh.raised, zIndex: 999, whiteSpace: "nowrap", animation: "fadeUp 0.3s ease-out" }}>{msg}</div>
) : null;

export const Loader = ({ t }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", background: t.bg }}>
    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 48, letterSpacing: "0.12em", color: t.black, marginBottom: 24 }}>ARISE</div>
    <div className="spin" style={{ width: 28, height: 28, border: `3px solid ${t.lightGrey}`, borderTopColor: t.accent, borderRadius: "50%" }} />
  </div>
);
