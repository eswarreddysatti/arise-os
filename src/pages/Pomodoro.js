import React, { useState, useEffect } from 'react';
import { BigNumber, ActionBtn, Card } from '../components/SharedUI';
import { I } from '../components/Icons';

export const PomodoroPage = ({ t, sh, onToast }) => {
  const [mins, setMins] = useState(25);
  const [secs, setSecs] = useState(0);
  const [active, setActive] = useState(false);
  const [mode, setMode] = useState("work");

  useEffect(() => {
    let timer;
    if (active) {
      timer = setInterval(() => {
        if (secs > 0) setSecs(s => s - 1);
        else if (mins > 0) { setMins(m => m - 1); setSecs(59); }
        else {
          setActive(false);
          const next = mode === "work" ? "break" : "work";
          setMode(next);
          setMins(next === "work" ? 25 : 5);
          onToast(next === "work" ? "Back to work!" : "Take a break!");
          new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg").play().catch(() => {});
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [active, mins, secs, mode, onToast]);

  const toggle = () => setActive(!active);
  const reset = () => { setActive(false); setMins(mode === "work" ? 25 : 5); setSecs(0); };

  return (
    <div className="page" style={{ padding: "70px 20px 100px", textAlign: "center" }}>
      <div style={{ marginBottom: 40 }}><p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: t.grey, textTransform: "uppercase" }}>Focus</p><BigNumber t={t}>POMODORO</BigNumber></div>
      <Card t={t} sh={sh} style={{ padding: "60px 20px", borderRadius: "50%", width: 280, height: 280, margin: "0 auto 40px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: `2px solid ${active ? t.accent : t.bg}` }}>
        <p style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", color: mode === "work" ? t.orange : t.grey, marginBottom: 8 }}>{mode}</p>
        <span style={{ fontSize: 80, fontWeight: 900, fontFamily: "'Bebas Neue'", lineHeight: 1 }}>{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
      </Card>
      <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
        <ActionBtn onClick={toggle} t={t} sh={sh} style={{ width: 140, height: 60, borderRadius: 30 }}>{active ? <I n="pause" s={24} /> : <I n="play" s={24} />}</ActionBtn>
        <ActionBtn secondary onClick={reset} t={t} sh={sh} style={{ width: 60, height: 60, borderRadius: 30 }}><I n="refresh" s={20} /></ActionBtn>
      </div>
    </div>
  );
};
