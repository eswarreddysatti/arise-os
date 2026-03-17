import React, { useState, useEffect, useCallback } from 'react';
import { Card, SectionLabel, BigNumber, ActionBtn, IconBtn, Segment, NeuInput, NeuTextarea } from '../components/SharedUI';
import { I } from '../components/Icons';
import { wellnessAPI, profileAPI } from '../lib/supabase';

const BOTTLE_PRESETS = [350, 500, 750, 1000];

export const WellnessPage = ({ t, sh, wellness = {}, setWellness, profile, setProfile, userId, onToast }) => {
  const [showSetup, setShowSetup] = useState(false);
  const [customBottle, setCustomBottle] = useState(false);
  const [setupForm, setSetupForm] = useState({ 
    water_bottle_size: profile?.water_bottle_size || 500, 
    water_goal_litres: profile?.water_goal_litres || 2.5,
    steps_goal: profile?.steps_goal || 8000
  });
  const [showCelebration, setShowCelebration] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (profile && (!profile.water_bottle_size || !profile.water_goal_litres)) {
      setShowSetup(true);
    }
  }, [profile]);

  const updateWellness = useCallback(async (updates) => {
    if (!userId) return;
    try {
      const cleanUpdates = {};
      Object.keys(updates).forEach(k => {
        if (typeof updates[k] === 'number' && isNaN(updates[k])) cleanUpdates[k] = 0;
        else cleanUpdates[k] = updates[k];
      });

      const { data, error } = await wellnessAPI.update(userId, today, cleanUpdates);
      if (error) throw error;
      if (data) setWellness(data);
    } catch (err) {
      console.error("Critical Wellness Sync Error:", err);
      onToast(err.message || "Wellness Sync Failed");
    }
  }, [userId, today, setWellness, onToast]);

  // Step Detection Logic
  const [isTracking, setIsTracking] = useState(false);
  const [stepCount, setStepCount] = useState(wellness.steps || 0);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  useEffect(() => {
    if (wellness.steps !== undefined) setStepCount(wellness.steps);
  }, [wellness.steps]);

  useEffect(() => {
    let lastAccel = 0;
    const threshold = 12;
    
    const handleMotion = (e) => {
      const { x, y, z } = e.accelerationIncludingGravity || { x: 0, y: 0, z: 0 };
      const total = Math.sqrt(x*x + y*y + z*z);
      if (total > threshold && lastAccel <= threshold) {
        setStepCount(s => {
          const newSteps = s + 1;
          if (newSteps % 50 === 0) updateWellness({ steps: newSteps });
          return newSteps;
        });
      }
      lastAccel = total;
    };

    if (isTracking) {
      window.addEventListener('devicemotion', handleMotion);
      if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission();
      }
    }
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [isTracking, updateWellness]);

  const startAutoTracking = () => {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      setShowPermissionDialog(true);
    } else {
      setIsTracking(true);
      onToast("Auto-tracking active");
    }
  };

  const confirmMotionPermission = async () => {
    try {
      const perm = await DeviceMotionEvent.requestPermission();
      if (perm === 'granted') {
        setIsTracking(true);
        onToast("Auto-tracking active");
      } else {
        onToast("Motion permission denied");
      }
    } catch (e) {
      onToast("Motion sensor not available");
    }
    setShowPermissionDialog(false);
  };

  const saveSetup = async () => {
    if (!userId) { onToast("Auth Session Missing"); return; }
    try {
      const cleanSetup = {
        water_bottle_size: parseInt(setupForm.water_bottle_size) || 500,
        water_goal_litres: parseFloat(setupForm.water_goal_litres) || 2.5,
        steps_goal: parseInt(setupForm.steps_goal) || 8000
      };

      const { data, error } = await profileAPI.update(userId, cleanSetup);
      if (error) throw error;
      if (data) {
        setProfile(data);
        setShowSetup(false);
        onToast("System calibrated");
      } else {
        throw new Error("No data returned from profile update");
      }
    } catch (err) {
      console.error("Critical Setup Error:", err);
      onToast(`Setup Failed: ${err.message || 'Unknown Error'}`);
    }
  };

  // Water Progress Calculation
  const waterGoalMl = (profile?.water_goal_litres || 2.5) * 1000;
  const currentWaterMl = wellness.water_intake_ml || 0;
  const waterProgress = Math.min(100, Math.round((currentWaterMl / waterGoalMl) * 100));

  // Celebration trigger
  useEffect(() => {
    if (waterProgress >= 100 && currentWaterMl > 0) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [waterProgress, currentWaterMl]);

  // Sleep Calculation
  const getSleepDuration = () => {
    if (!wellness.sleep_start || !wellness.sleep_wake) return "0h 0m";
    const start = new Date(wellness.sleep_start);
    const wake = new Date(wellness.sleep_wake);
    
    if (isNaN(start.getTime()) || isNaN(wake.getTime())) return "0h 0m";
    
    const s = new Date(2000, 0, 1, start.getHours(), start.getMinutes());
    const w = new Date(2000, 0, 1, wake.getHours(), wake.getMinutes());
    
    let diffMs = w - s;
    if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000;
    
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

      {/* Goal Celebration Overlay */}
      {showCelebration && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999, pointerEvents: "none",
          animation: "fadeUp 0.5s ease-out"
        }}>
          <div style={{
            padding: "32px 48px", borderRadius: 32,
            background: t.accent, boxShadow: sh.raised,
            textAlign: "center"
          }}>
            <p style={{ fontSize: 48, marginBottom: 8 }}>🎉</p>
            <p style={{ fontSize: 18, fontWeight: 900, color: t.bg, letterSpacing: "0.1em" }}>GOAL REACHED!</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: `${t.bg}cc`, marginTop: 4 }}>Hydration complete</p>
          </div>
        </div>
      )}

      {/* Motion Permission Dialog */}
      {showPermissionDialog && (
        <Card t={t} sh={sh} style={{ marginBottom: 20, padding: 24, border: `2px solid ${t.accent}40`, animation: "fadeUp 0.3s ease-out" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 28, marginBottom: 12 }}>🏃‍♂️</p>
            <p style={{ fontSize: 14, fontWeight: 800, color: t.black, marginBottom: 8 }}>Enable Step Tracking?</p>
            <p style={{ fontSize: 12, color: t.grey, lineHeight: 1.5, marginBottom: 16 }}>
              ARISE needs motion sensor access to count your steps automatically. Your data stays private and on-device.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <ActionBtn onClick={confirmMotionPermission} t={t} sh={sh} style={{ flex: 1 }}>ALLOW</ActionBtn>
              <ActionBtn secondary onClick={() => setShowPermissionDialog(false)} t={t} sh={sh} style={{ flex: 1 }}>NOT NOW</ActionBtn>
            </div>
          </div>
        </Card>
      )}

      {showSetup && (
        <Card t={t} sh={sh} style={{ marginBottom: 24, padding: 24, background: t.bgDeep, border: `2px solid ${t.accent}40` }}>
          <SectionLabel t={t}>Calibration Required</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 800, color: t.grey, marginBottom: 8 }}>BOTTLE SIZE (ML)</p>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                {BOTTLE_PRESETS.map(ml => (
                  <button key={ml} onClick={() => { setSetupForm({...setupForm, water_bottle_size: ml}); setCustomBottle(false); }}
                    style={{
                      flex: 1, padding: "10px 0", border: "none", borderRadius: 12,
                      fontSize: 12, fontWeight: 800,
                      background: setupForm.water_bottle_size === ml && !customBottle ? t.accent : t.card,
                      color: setupForm.water_bottle_size === ml && !customBottle ? t.bg : t.grey,
                      boxShadow: setupForm.water_bottle_size === ml && !customBottle ? sh.btn : sh.card,
                      cursor: "pointer", transition: "all 0.2s"
                    }}>{ml}ml</button>
                ))}
                <button onClick={() => setCustomBottle(true)}
                  style={{
                    flex: 1, padding: "10px 0", border: "none", borderRadius: 12,
                    fontSize: 11, fontWeight: 800,
                    background: customBottle ? t.accent : t.card,
                    color: customBottle ? t.bg : t.grey,
                    boxShadow: customBottle ? sh.btn : sh.card,
                    cursor: "pointer", transition: "all 0.2s"
                  }}>Custom</button>
              </div>
              {customBottle && (
                <NeuInput type="number" t={t} sh={sh} placeholder="Enter custom ml (100-2000)" min="100" max="2000"
                  value={setupForm.water_bottle_size}
                  onChange={e => setSetupForm({...setupForm, water_bottle_size: Math.min(2000, Math.max(100, parseInt(e.target.value) || 500))})} />
              )}
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 800, color: t.grey, marginBottom: 8 }}>DAILY GOAL (LITRES)</p>
              <NeuInput type="number" step="0.1" t={t} sh={sh} value={setupForm.water_goal_litres} onChange={e => setSetupForm({...setupForm, water_goal_litres: parseFloat(e.target.value)})} />
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 800, color: t.grey, marginBottom: 8 }}>STEPS GOAL</p>
              <NeuInput type="number" t={t} sh={sh} value={setupForm.steps_goal} onChange={e => setSetupForm({...setupForm, steps_goal: parseInt(e.target.value)})} />
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
            <p style={{ fontSize: 24, fontWeight: 900, color: waterProgress >= 100 ? t.accent : t.orange }}>{waterProgress}%</p>
            <p style={{ fontSize: 10, color: t.grey, fontWeight: 700 }}>Intake ml: {currentWaterMl}</p>
          </div>
        </div>
        <div style={{ height: 12, background: t.bgDeep, borderRadius: 6, boxShadow: sh.inset, marginBottom: 24, overflow: "hidden" }}>
          <div style={{ 
            width: `${waterProgress}%`, height: "100%", 
            background: waterProgress >= 100 ? t.accent : t.orange, 
            transition: "width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)" 
          }} />
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
        <button onClick={() => setShowSetup(true)} style={{
          marginTop: 10, width: "100%", padding: "8px", border: "none", borderRadius: 10,
          background: "transparent", color: t.grey, fontSize: 11, fontWeight: 700,
          cursor: "pointer", textAlign: "center"
        }}>
          ⚙ Change bottle size ({profile?.water_bottle_size || 500}ml)
        </button>
      </Card>

      {/* 2. Step Tracking */}
      <Card t={t} sh={sh} style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Segment label="Steps Tracked" value={stepCount} unit={`/ ${profile?.steps_goal || 8000}`} t={t} />
          <IconBtn 
            icon={isTracking ? "pause" : "play"} 
            onClick={() => {
              if (isTracking) {
                setIsTracking(false);
                onToast("Auto-tracking paused");
              } else {
                startAutoTracking();
              }
            }} 
            t={t} sh={sh} 
            active={isTracking}
          />
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <ActionBtn secondary onClick={() => {
            const newSteps = (stepCount || 0) + 500;
            setStepCount(newSteps);
            updateWellness({ steps: newSteps, steps_goal_snapshot: profile?.steps_goal || 8000 });
            onToast("+500 steps logged");
          }} t={t} sh={sh} style={{ flex: 1, padding: "12px" }}>
            +500 STEPS
          </ActionBtn>
          <ActionBtn secondary onClick={() => {
            const newSteps = (stepCount || 0) + 1000;
            setStepCount(newSteps);
            updateWellness({ steps: newSteps, steps_goal_snapshot: profile?.steps_goal || 8000 });
            onToast("+1000 steps logged");
          }} t={t} sh={sh} style={{ flex: 1, padding: "12px" }}>
            +1000 STEPS
          </ActionBtn>
        </div>
        <NeuInput 
          type="number" 
          placeholder="Or enter exact steps..." 
          t={t} sh={sh} 
          onBlur={e => {
            const val = parseInt(e.target.value);
            if (val && val > 0) {
              setStepCount(val);
              updateWellness({ steps: val, steps_goal_snapshot: profile?.steps_goal || 8000 });
            }
          }} 
        />
        {isTracking && (
          <p style={{ fontSize: 11, color: t.accent, fontWeight: 700, marginTop: 8, textAlign: "center", animation: "pulse 2s infinite" }}>
            📡 Auto-tracking active...
          </p>
        )}
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
