import React from 'react';
import { Card, BigNumber } from '../components/SharedUI';
import { I } from '../components/Icons';

export const FinancePage = ({ t, sh }) => {
  return (
    <div className="page" style={{ padding: "70px 20px 100px" }}>
      <div style={{ marginBottom: 20 }}><p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: t.grey, textTransform: "uppercase" }}>Wealth</p><BigNumber t={t}>FINANCE</BigNumber></div>
      <Card t={t} sh={sh} style={{ marginBottom: 20, textAlign: "center", padding: "30px 20px" }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: t.grey, textTransform: "uppercase", marginBottom: 8 }}>Net Balance</p>
        <BigNumber t={t} style={{ fontSize: 56 }}>$12,450</BigNumber>
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <div style={{ flex: 1, padding: 12, background: t.bg, borderRadius: 16, boxShadow: sh.inset }}>
            <p style={{ fontSize: 9, fontWeight: 800, color: t.grey, marginBottom: 4 }}>INCOME</p>
            <p style={{ fontSize: 16, fontWeight: 900, color: "#2E7D32" }}>+$4,200</p>
          </div>
          <div style={{ flex: 1, padding: 12, background: t.bg, borderRadius: 16, boxShadow: sh.inset }}>
            <p style={{ fontSize: 9, fontWeight: 800, color: t.grey, marginBottom: 4 }}>EXPENSES</p>
            <p style={{ fontSize: 16, fontWeight: 900, color: t.orange }}>-$1,850</p>
          </div>
        </div>
      </Card>
      <p style={{ fontSize: 12, fontWeight: 800, color: t.grey, textTransform: "uppercase", marginBottom: 12, letterSpacing: "0.1em" }}>Recent Transactions</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[{ t: "Groceries", a: "-$120", d: "Today", i: "expense" }, { t: "Salary", a: "+$4,200", d: "Yesterday", i: "income" }, { t: "Rent", a: "-$1,500", d: "Mar 1", i: "expense" }].map((tr, i) => (
          <Card key={i} t={t} sh={sh} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: t.bg, display: "flex", alignItems: "center", justifyContent: "center" }}><I n={tr.i} s={16} c={tr.i === "income" ? "#2E7D32" : t.orange} /></div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 700 }}>{tr.t}</p>
              <p style={{ fontSize: 11, color: t.grey }}>{tr.d}</p>
            </div>
            <p style={{ fontSize: 14, fontWeight: 900, color: tr.i === "income" ? "#2E7D32" : t.black }}>{tr.a}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};
