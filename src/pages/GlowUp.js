import React, { useState, useEffect } from 'react';
import { Card, SectionLabel, BigNumber, Pill, CheckBtn } from '../components/SharedUI';

const WEDDING_DATE = new Date('2026-05-05T00:00:00').getTime();

const SECTIONS = {
  tasks: [
    { id: 'hair', title: 'Hair (Structure & Styling)', items: [
      { id: 'h1', text: 'Decide hairstyle (Quiff recommended)' },
      { id: 'h2', text: 'Book haircut (Mar 22-24)' },
      { id: 'h3', text: 'Buy matte clay (Gatsby/Beardo)' },
      { id: 'h4', text: 'Buy hairspray' },
      { id: 'h5', text: 'Practice styling daily (10 min)' },
      { id: 'h6', text: 'Haircut (Apr 9-10 & Apr 25-27)' },
      { id: 'h7', text: 'Final Haircut (May 5-7)' },
    ]},
    { id: 'skin', title: 'Skin (Glow + Acne + Tone)', items: [
      { id: 's1', text: 'Buy Cleanser, Vit C, Niacinamide' },
      { id: 's2', text: 'Buy Alpha Arbutin, Moisturizer, SPF 50' },
      { id: 's3', text: 'Strict AM & PM routine' },
      { id: 's4', text: 'Change pillowcase every 2 days' },
      { id: 's5', text: 'No junk / sugar / dairy' },
      { id: 's6', text: 'HydraFacial (Optional)' },
    ]},
    { id: 'body', title: 'Body (Fat Loss + Posture)', items: [
      { id: 'b1', text: 'Daily workout (45 min)' },
      { id: 'b2', text: 'Steps: 8k-10k/day' },
      { id: 'b3', text: 'Fix posture daily' },
      { id: 'b4', text: 'High protein diet' },
    ]},
    { id: 'face', title: 'Face (Nose Illusion + Beard)', items: [
      { id: 'f1', text: 'Learn nose contouring (practice daily)' },
      { id: 'f2', text: 'Beard shaping (Apr 10 & May 8)' },
      { id: 'f3', text: 'Cold compress for eyes (daily)' },
    ]},
    { id: 'life', title: 'Lifestyle (Make or Break)', items: [
      { id: 'l1', text: 'Water: 3-4L daily' },
      { id: 'l2', text: 'Sleep: 7 hours' },
      { id: 'l3', text: 'No alcohol' },
      { id: 'l4', text: 'Phone hygiene + no face touching' },
    ]}
  ],
  diet: [
    { time: '07:30 AM', title: 'Post-Shift (Recovery)', desc: '2 boiled eggs, 1 banana, 5 almonds, 2 walnuts, 500ml water' },
    { time: '03:30 PM', title: 'Pre-Workout Fuel', desc: '1 banana OR 2 dates, Black coffee (optional)' },
    { time: '05:00 PM', title: 'Post-Workout (Muscle)', desc: 'Option A: 4 egg omelette + 2 chapati\nOption B: Paneer (100g) + 2 chapati.\nAdd: Onion+cucumber salad.' },
    { time: '07:00 PM', title: 'Main Meal (Dinner)', desc: 'Non-veg: 150g chicken, 2 chapati/rice, dal, veg curry.\nVeg: 1 bowl dal, 50-100g paneer, 2 chapati, veg curry.' },
    { time: '09:30 PM', title: 'Pre-Shift (Energy)', desc: '2 boiled eggs OR roasted chana, green tea/water' },
    { time: '01:00 AM', title: 'Mid-Shift (Anti-Crash)', desc: 'Apple OR banana OR handful peanuts' }
  ],
  timetable: [
    { block: 'MORNING (7:30 AM)', desc: '7:30 Skincare AM, 7:40 Light meal, 8:00 Cold shower, 8:15 Wind down, 8:30 Sleep' },
    { block: 'AFTERNOON (3:30 PM)', desc: '15:30 Wake up, 15:40 Water+fruit, 16:00 Workout, 16:45 Shower, 17:00 Skincare light' },
    { block: 'EVENING (6:00 PM)', desc: '18:00 Main meal, 19:00 Walk+posture, 20:00 Grooming practice (hair, beard, contour), 21:00 Relax' },
    { block: 'NIGHT SHIFT (10 PM)', desc: '21:30 Skincare PM, 22:00 Start shift. Drink water, no junk, no face touching.' },
  ]
};

const GLOWUP_STORAGE_KEY = 'arise_glowup_v1';

export const GlowUpPage = ({ t, sh }) => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [checkedItems, setCheckedItems] = useState({});
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(GLOWUP_STORAGE_KEY);
    if (saved) {
      try {
        setCheckedItems(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const now = new Date().getTime();
    const diff = WEDDING_DATE - now;
    setDaysLeft(Math.max(0, Math.ceil(diff / (1000 * 3600 * 24))));
  }, []);

  const toggleItem = (id) => {
    const next = { ...checkedItems, [id]: !checkedItems[id] };
    setCheckedItems(next);
    localStorage.setItem(GLOWUP_STORAGE_KEY, JSON.stringify(next));
  };

  const totalChecks = Object.values(checkedItems).filter(Boolean).length;
  const maxChecks = SECTIONS.tasks.reduce((acc, section) => acc + section.items.length, 0);
  const progressPercent = Math.round((totalChecks / maxChecks) * 100) || 0;

  return (
    <div className="page" style={{ padding: "80px 24px 120px" }}>
      {/* Header Countdown */}
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.25em", color: t.grey, textTransform: "uppercase" }}>Operation</p>
        <BigNumber t={t}>GLOW-UP</BigNumber>
        
        <div style={{ position: "relative", width: 140, height: 140, margin: "20px auto 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", transform: "rotate(-90deg)" }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke={t.bgDeep} strokeWidth="8" />
            <circle cx="50" cy="50" r="45" fill="none" stroke={t.accent} strokeWidth="8" strokeDasharray="282.7" strokeDashoffset={282.7 - (282.7 * progressPercent) / 100} style={{ transition: "stroke-dashoffset 1s ease-in-out" }} strokeLinecap="round" />
          </svg>
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: 42, fontFamily: "'Bebas Neue'", color: t.black, lineHeight: 1 }}>{daysLeft}</span>
            <p style={{ fontSize: 10, fontWeight: 800, color: t.orange, textTransform: "uppercase", letterSpacing: "0.1em" }}>Days Left</p>
          </div>
        </div>
      </div>

      <Card t={t} sh={sh} style={{ padding: 12, marginBottom: 24, display: "flex", gap: 8, overflowX: "auto", flexWrap: "nowrap" }}>
        {['tasks', 'diet', 'timetable', 'rules'].map(tab => (
          <Pill key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)} t={t} sh={sh} style={{ flex: 1, textAlign: "center", textTransform: "uppercase", padding: "10px 14px", fontSize: 11 }}>{tab}</Pill>
        ))}
      </Card>

      {activeTab === 'tasks' && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {SECTIONS.tasks.map(section => (
            <Card key={section.id} t={t} sh={sh} style={{ padding: 20 }}>
              <SectionLabel t={t}>{section.title}</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
                {section.items.map(item => (
                  <div key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: 12 }} onClick={() => toggleItem(item.id)}>
                    <CheckBtn checked={!!checkedItems[item.id]} onToggle={() => toggleItem(item.id)} t={t} sh={sh} size={24} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: !!checkedItems[item.id] ? t.grey : t.black, textDecoration: !!checkedItems[item.id] ? "line-through" : "none", flex: 1, transition: "all 0.2s", marginTop: 2 }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'diet' && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card t={t} sh={sh} style={{ background: t.bgDeep, boxShadow: sh.inset, textAlign: "center", marginBottom: 8, padding: 16 }}>
            <span style={{ fontSize: 24, display: "block", marginBottom: 4 }}>💧</span>
            <p style={{ fontSize: 13, fontWeight: 800, color: t.black }}>3-4L WATER DAILY</p>
            <p style={{ fontSize: 11, color: t.grey, marginTop: 4 }}>Non-negotiable.</p>
          </Card>
          {SECTIONS.diet.map((meal, i) => (
            <Card key={i} t={t} sh={sh} style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: t.grey }}>{meal.time}</p>
                <span style={{ fontSize: 12, fontWeight: 800, color: t.orange }}>{meal.title}</span>
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: t.black, whiteSpace: "pre-line", lineHeight: 1.5 }}>{meal.desc}</p>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'timetable' && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {SECTIONS.timetable.map((block, i) => (
            <Card key={i} t={t} sh={sh} style={{ padding: 20 }}>
              <SectionLabel t={t}>{block.block}</SectionLabel>
              <p style={{ fontSize: 14, fontWeight: 600, color: t.black, marginTop: 8, lineHeight: 1.6 }}>{block.desc}</p>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'rules' && (
        <Card t={t} sh={sh} style={{ padding: 20 }}>
          <SectionLabel t={t}>Strict Rules</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 12 }}>
            {[
              "❌ No skipping routine",
              "❌ No experimenting new products after April 5",
              "❌ No junk food / sweets / fried",
              "❌ No lazy posture",
              "✅ Consistency > perfection",
              "✅ Look clean, sharp, intentional"
            ].map((rule, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 16 }}>{rule.slice(0, 1)}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: rule.startsWith('✅') ? t.black : t.grey, lineHeight: 1.4 }}>{rule.slice(2)}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 28, padding: 16, background: t.bgDeep, borderRadius: 16, boxShadow: sh.inset }}>
            <p style={{ fontSize: 12, fontWeight: 800, textAlign: "center", color: t.orange, letterSpacing: "0.1em" }}>REAL TALK</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: t.black, textAlign: "center", marginTop: 8, lineHeight: 1.5 }}>
              80% consistent = Sharper, clearer, leaner.<br/>
              100% consistent = Completely different person.
            </p>
          </div>
        </Card>
      )}

    </div>
  );
};
