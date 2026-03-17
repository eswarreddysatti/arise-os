import React from 'react';
import { Card, BigNumber, NeuTextarea, ActionBtn } from '../components/SharedUI';

export const JournalPage = ({ t, sh }) => {
  return (
    <div className="page" style={{ padding: "70px 20px 100px" }}>
      <div style={{ marginBottom: 20 }}><p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: t.grey, textTransform: "uppercase" }}>Reflection</p><BigNumber t={t}>JOURNAL</BigNumber></div>
      <Card t={t} sh={sh} style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: t.grey, marginBottom: 14, lineHeight: 1.5 }}>What's on your mind today? Write it down to clear the headspace.</p>
        <NeuTextarea t={t} sh={sh} placeholder="Speak your truth..." style={{ height: 200, marginBottom: 16 }} />
        <ActionBtn t={t} sh={sh} style={{ width: "100%" }}>Save Entry</ActionBtn>
      </Card>
      <p style={{ fontSize: 12, fontWeight: 800, color: t.grey, textTransform: "uppercase", marginBottom: 12 }}>Past Entries</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {["Morning clarity and goals", "Weekly review and progress", "Late night reflections"].map((e, i) => (
          <Card key={i} t={t} sh={sh} style={{ padding: "16px" }}>
            <p style={{ fontSize: 14, fontWeight: 700 }}>{e}</p>
            <p style={{ fontSize: 11, color: t.grey, marginTop: 4 }}>March {15 - i}, 2024</p>
          </Card>
        ))}
      </div>
    </div>
  );
};
