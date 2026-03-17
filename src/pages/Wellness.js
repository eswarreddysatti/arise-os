import React, { useState, useEffect } from 'react';
import { Card, SectionLabel, BigNumber, ActionBtn, IconBtn, Segment, NeuInput, NeuTextarea } from '../components/SharedUI';
import { I } from '../components/Icons';
import { wellnessAPI, profileAPI } from '../lib/supabase';

export const WellnessPage = ({ t, sh, wellness, setWellness, profile, setProfile, userId, onToast }) => {
  const [loading, setLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [setupForm, setSetupForm] = useState({ 
    water_bottle_size: profile?.water_bottle_size || 500, 
    water_goal_litres: profile?.water_goal_litres || 2.5,
    steps_goal: profile?.steps_goal || 8000
  });

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (profile && (!profile.water_bottle_size || !profile.water_goal_litres)) {
      setShowSetup(true);
    }
  }, [profile]);

  // Step Detection Logic
  const [isTracking, setIsTracking] = useState(false);
  const [stepCount, setStepCount] = useState(wellness.steps || 0);

  useEffect(() => {
    if (wellness.steps !== undefined) setStepCount(wellness.steps);
  }, [wellness.steps]);

  useEffect(() => {
    let lastAccel = 0;
    const threshold = 12; // Adjust for sensitivity
    
    const handleMotion = (e) => {
      const { x, y, z } = e.accelerationIncludingGravity || { x: 0, y: 0, z: 0 };
      const total = Math.sqrt(x*x + y*y + z*z);
      if (total > threshold && lastAccel <= threshold) {
        setStepCount(s => {
          const newSteps = s + 1;
          if (newSteps % 50 === 0) updateWellness({ steps: newSteps }); // Sync every 50 steps
          return newSteps;
        });
      }
      lastAccel = total;
    };

    if (isTracking) {
      window.addEventListener('devicemotion', handleMotion);
      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission();
      }
    }
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [isTracking]);

  const updateWellness = async (updates) => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await wellnessAPI.update(userId, today, updates);
    if (!error && data) {
      setWellness(data);
      if (updates.steps) setStepCount(updates.steps);
    } else {
      onToast("Sync error");
    }
    setLoading(false);
  };

  const saveSetup = async () => {
    if (!userId) return;
    const { data } = await profileAPI.update(userId, setupForm);
    if (data) {
      setProfile(data);
      setShowSetup(false);
      onToast("System calibrated");
    }
  };

  // Water Progress Calculation
  const waterGoalMl = (profile?.water_goal_litres || 2.5) * 1000;
  const currentWaterMl = wellness.water_intake_ml || 0;
  const waterProgress = Math.min(100, Math.round((currentWaterMl / waterGoalMl) * 100));

  // Sleep Calculation
  const getSleepDuration = () => {
    if (!wellness.sleep_start || !wellness.sleep_wake) return "0h 0m";
    const start = new Date(wellness.sleep_start);
    const wake = new Date(wellness.sleep_wake);
    
    // Create new dates with fixed current day to compare times only
    const s = new Date(2000, 0, 1, start.getHours(), start.getMinutes());
    const w = new Date(2000, 0, 1, wake.getHours(), wake.getMinutes());
    
    let diffMs = w - s;
    if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000; // overnight
    
    const diffH = diffMs / (1000 * 60 * 60);
    const h = Math.floor(diffH);
    const m = Math.round((diffH - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="page" style={{ padding: "80px 24px 120px" }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.25em", color: t.grey, textTransform: "uppercase" }}>Vitality System</p>
        <BigNumber t={t}>WELLNESS</BigNumber>
      </div>

      {showSetup && (
        <Card t={t} sh={sh} style={{ marginBottom: 24, padding: 24, background: t.bgDeep, border: `2px solid ${t.accent}40` }}>
          <SectionLabel t={t}>Calibration Required</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 800, color: t.grey, marginBottom: 8 }}>BOTTLE SIZE (ML)</p>
              <NeuInput type="number" t={t} sh={sh} value={setupForm.water_bottle_size} onChange={e => setSetupForm({...setupForm, water_bottle_size: parseInt(e.target.value)})} />
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 800, color: t.grey, marginBottom: 8 }}>DAILY GOAL (LITRES)</p>
              <NeuInput type="number" step="0.1" t={t} sh={sh} value={setupForm.water_goal_litres} onChange={e => setSetupForm({...setupForm, water_goal_litres: parseFloat(e.target.value)})} />
            </div>
            <ActionBtn onClick={saveSetup} t={t} sh={sh}>INITIALIZE SETUP</ActionBtn>
          </div>
        </Card>
      )}

      {/* 1. Water Tracking */}
      <Card t={t} sh={sh} style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <Segment label="Water Intake" value={(currentWaterMl / 1000).toFixed(1)} unit={`/ ${profile?.water_goal_litres || 2.5}L`} t={t} />
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 24, fontWeight: 900, color: t.accent }}>{waterProgress}%</p>
            <p style={{ fontSize: 10, color: t.grey, fontWeight: 700 }}>Intake ml: {currentWaterMl}</p>
          </div>
        </div>
        <div style={{ height: 12, background: t.bgDeep, borderRadius: 6, boxShadow: sh.inset, marginBottom: 24, overflow: "hidden" }}>
          <div style={{ width: `${waterProgress}%`, height: "100%", background: t.accent, transition: "width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)" }} />
        </div>
        <ActionBtn 
          onClick={() => updateWellness({ 
            water_intake_ml: (wellness.water_intake_ml || 0) + (profile?.water_bottle_size || 500),
            water_bottle_snapshot_ml: profile?.water_bottle_size || 500,
            water_goal_snapshot_litres: profile?.water_goal_litres || 2.5
          })} 
          t={t} sh={sh} style={{ width: "100%", gap: 12 }}
        >
          <I n="plus" s={18} c={t.bg} /> ADD {profile?.water_bottle_size || 500}ML BOTTLE
        </ActionBtn>
      </Card>

      {/* 2. Step Tracking */}
      <Card t={t} sh={sh} style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Segment label="Steps Tracked" value={stepCount} unit={`/ ${profile?.steps_goal || 8000}`} t={t} />
          <IconBtn 
            icon={isTracking ? "pause" : "play"} 
            onClick={() => {
              setIsTracking(!isTracking);
              onToast(isTracking ? "Auto-tracking paused" : "Auto-tracking active");
            }} 
            t={t} sh={sh} 
            active={isTracking}
          />
        </div>
        <NeuInput 
          type="number" 
          placeholder="Log steps manually..." 
          t={t} sh={sh} 
          onBlur={e => updateWellness({ steps: parseInt(e.target.value) || 0, steps_goal_snapshot: profile?.steps_goal || 8000 })} 
        />
      </Card>

      {/* 3. Sleep Tracking */}
      <Card t={t} sh={sh} style={{ padding: 24, marginBottom: 20 }}>
        <SectionLabel t={t}>Sleep Protocol</SectionLabel>
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: t.grey, marginBottom: 6 }}>START</p>
            <input 
              type="time" 
              style={{ width: "100%", padding: 12, borderRadius: 12, border: "none", background: t.bg, boxShadow: sh.inset, color: t.black }}
              onChange={e => {
                const [h, m] = e.target.value.split(':');
                const d = new Date(); d.setHours(h, m, 0);
                updateWellness({ sleep_start: d.toISOString() });
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: t.grey, marginBottom: 6 }}>WAKE</p>
            <input 
              type="time" 
              style={{ width: "100%", padding: 12, borderRadius: 12, border: "none", background: t.bg, boxShadow: sh.inset, color: t.black }}
              onChange={e => {
                const [h, m] = e.target.value.split(':');
                const d = new Date(); d.setHours(h, m, 0);
                updateWellness({ sleep_wake: d.toISOString() });
              }}
            />
          </div>
        </div>
        <div style={{ background: t.bgDeep, padding: 12, borderRadius: 12, textAlign: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: t.grey }}>DURATION: </span>
          <span style={{ fontSize: 14, fontWeight: 900, color: t.black }}>{getSleepDuration()}</span>
        </div>
      </Card>

      {/* 4. Mood Tracking */}
      <Card t={t} sh={sh} style={{ padding: 24 }}>
        <SectionLabel t={t}>Neural Mood State</SectionLabel>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
          {[
            { val: 1, e: "😞" }, { val: 2, e: "😐" }, { val: 3, e: "😊" }, { val: 4, e: "😄" }, { val: 5, e: "🔥" }
          ].map(m => (
            <button key={m.val} onClick={() => updateWellness({ mood: m.val })} style={{ border: "none", background: wellness.mood === m.val ? t.accent : "transparent", width: 44, height: 44, borderRadius: 14, fontSize: 20, cursor: "pointer", boxShadow: wellness.mood === m.val ? sh.btn : "none", transition: "all 0.3s" }}>{m.e}</button>
          ))}
        </div>
        <NeuTextarea 
          placeholder="System status notes..." 
          t={t} sh={sh} 
          value={wellness.mood_note} 
          onChange={e => setWellness({...wellness, mood_note: e.target.value})}
          onBlur={e => updateWellness({ mood_note: e.target.value })}
          style={{ height: 80 }}
        />
      </Card>
    </div>
  );
};
