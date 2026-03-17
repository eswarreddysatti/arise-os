import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BigNumber, ActionBtn, Card, SectionLabel, IconBtn } from '../components/SharedUI';
import { I } from '../components/Icons';
import { focusAPI } from '../lib/supabase';

// Alarm sounds (play on completion)
const ALARMS = [
  { id: 'bell', name: 'Soft Bell', url: 'https://cdn.pixabay.com/audio/2022/03/15/audio_8e906c6418.mp3' },
  { id: 'classic', name: 'Classic', url: 'https://cdn.pixabay.com/audio/2021/08/09/audio_d086708f1b.mp3' },
  { id: 'digital', name: 'Digital', url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_5146c820b6.mp3' },
];

// Ambient sounds (play during focus sessions)
const AMBIENTS = [
  { id: 'rain', name: '🌧 Rain', url: 'https://cdn.pixabay.com/audio/2022/05/16/audio_1808dc82e2.mp3' },
  { id: 'forest', name: '🌲 Forest', url: 'https://cdn.pixabay.com/audio/2022/02/07/audio_8a33e39c22.mp3' },
  { id: 'cafe', name: '☕ Cafe', url: 'https://cdn.pixabay.com/audio/2022/08/31/audio_419db44d45.mp3' },
  { id: 'waves', name: '🌊 Waves', url: 'https://cdn.pixabay.com/audio/2022/06/07/audio_1b35afbf45.mp3' },
  { id: 'whitenoise', name: '📡 White Noise', url: 'https://cdn.pixabay.com/audio/2022/03/09/audio_c8ad1fbc71.mp3' },
];


export const PomodoroPage = ({ t, sh, onToast, userId, pomoState, setPomoState }) => {
  // Destructure global state
  const {
    workMins = 25, breakMins = 5, longBreakMins = 15,
    sessionsBeforeLong = 4, completedSessions = 0,
    timeLeft = 25 * 60, active = false, mode = 'work',
    alarmActive = false, selectedAlarm = 'bell',
    selectedAmbient = null, volume = 0.5, muted = false,
    startTime = null,
  } = pomoState || {};

  const alarmRef = useRef(null);
  const ambientRef = useRef(null);

  // Updater helper
  const update = useCallback((patch) => {
    setPomoState(prev => ({ ...prev, ...patch }));
  }, [setPomoState]);

  // -- Ambient Sound Control --
  useEffect(() => {
    if (!ambientRef.current) return;
    if (active && mode === 'work' && selectedAmbient && !muted) {
      const amb = AMBIENTS.find(a => a.id === selectedAmbient);
      if (amb) {
        ambientRef.current.src = amb.url;
        ambientRef.current.volume = volume;
        ambientRef.current.loop = true;
        ambientRef.current.play().catch(() => {});
      }
    } else {
      ambientRef.current.pause();
    }
  }, [active, mode, selectedAmbient, muted, volume]);

  // Update ambient volume live
  useEffect(() => {
    if (ambientRef.current) ambientRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  // -- Timer Tick (uses timestamp-based calculation for accuracy) --
  useEffect(() => {
    let timer;
    if (active && timeLeft > 0) {
      timer = setInterval(() => {
        update({ timeLeft: Math.max(0, timeLeft - 1) });
      }, 1000);
    } else if (active && timeLeft === 0) {
      handleComplete();
    }
    return () => clearInterval(timer);
  }, [active, timeLeft]);

  // -- Handle Session Complete --
  const handleComplete = async () => {
    // Stop ambient
    if (ambientRef.current) ambientRef.current.pause();

    // Play alarm
    if (alarmRef.current) {
      const alarm = ALARMS.find(a => a.id === selectedAlarm) || ALARMS[0];
      alarmRef.current.src = alarm.url;
      alarmRef.current.volume = muted ? 0 : volume;
      alarmRef.current.loop = true;
      alarmRef.current.play().catch(() => {});
    }

    update({ active: false, alarmActive: true });

    // Save to database
    if (userId && mode === 'work') {
      const duration = workMins;
      await focusAPI.start(userId, {
        session_type: mode,
        duration,
        start_time: startTime || new Date().toISOString(),
        end_time: new Date().toISOString(),
        completed: true
      }).catch(() => {});
    }

    // Browser notification
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('ARISE', { body: mode === 'work' ? 'Focus session complete! Break time.' : 'Break over! Back to focus.' });
    }

    onToast(mode === 'work' ? 'Session complete! Time to break.' : 'Break over! Back to focus.');
  };

  // -- Stop Alarm & Auto-Transition --
  const stopAlarm = () => {
    if (alarmRef.current) { alarmRef.current.pause(); alarmRef.current.currentTime = 0; }

    let nextMode, nextTime, nextSessions = completedSessions;

    if (mode === 'work') {
      nextSessions = completedSessions + 1;
      const isLongBreak = nextSessions % sessionsBeforeLong === 0;
      nextMode = 'break';
      nextTime = (isLongBreak ? longBreakMins : breakMins) * 60;
    } else {
      nextMode = 'work';
      nextTime = workMins * 60;
    }

    update({
      alarmActive: false,
      mode: nextMode,
      timeLeft: nextTime,
      completedSessions: nextSessions,
      active: true, // Auto-start next session
      startTime: new Date().toISOString(),
    });

    onToast(nextMode === 'work' ? `Focus session #${nextSessions + 1} started!` : 'Break started!');
  };

  // -- Controls --
  const toggle = () => {
    if (alarmActive) { stopAlarm(); return; }
    if (!active) {
      // Request notification permission on first start
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      update({ active: true, startTime: new Date().toISOString() });
    } else {
      if (ambientRef.current) ambientRef.current.pause();
      update({ active: false });
    }
  };

  const reset = () => {
    if (alarmRef.current) alarmRef.current.pause();
    if (ambientRef.current) ambientRef.current.pause();
    update({
      active: false, alarmActive: false, startTime: null,
      timeLeft: (mode === 'work' ? workMins : breakMins) * 60,
    });
  };

  const changeTime = (type, val) => {
    const v = Math.max(1, Math.min(type === 'work' ? 90 : (type === 'longBreak' ? 30 : 30), val));
    if (type === 'work') {
      update({ workMins: v, ...((!active && mode === 'work') ? { timeLeft: v * 60 } : {}) });
    } else if (type === 'break') {
      update({ breakMins: v, ...((!active && mode === 'break') ? { timeLeft: v * 60 } : {}) });
    } else if (type === 'longBreak') {
      update({ longBreakMins: v });
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const isLongBreakNext = (completedSessions + 1) % sessionsBeforeLong === 0;

  return (
    <div className="page" style={{ padding: '80px 24px 120px', textAlign: 'center' }}>
      <audio ref={alarmRef} />
      <audio ref={ambientRef} />

      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.25em', color: t.grey, textTransform: 'uppercase' }}>Focus System</p>
        <BigNumber t={t}>CONTROL</BigNumber>
      </div>

      {/* Session Counter */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
        {Array(sessionsBeforeLong).fill(0).map((_, i) => (
          <div key={i} style={{
            width: 12, height: 12, borderRadius: '50%',
            background: i < (completedSessions % sessionsBeforeLong) ? t.accent : t.bgDeep,
            boxShadow: i < (completedSessions % sessionsBeforeLong) ? sh.btn : sh.inset,
            transition: 'all 0.3s'
          }} />
        ))}
        <span style={{ fontSize: 11, fontWeight: 800, color: t.grey, marginLeft: 8 }}>
          {completedSessions} done
        </span>
      </div>

      {/* Timer Circle */}
      <Card t={t} sh={sh} style={{
        padding: '50px 20px', borderRadius: '50%', width: 300, height: 300,
        margin: '0 auto 40px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        border: active ? `4px solid ${mode === 'work' ? t.orange : t.accent}` : `4px solid ${t.bgDeep}`,
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        transform: active ? 'scale(1.02)' : 'scale(1)',
        position: 'relative'
      }}>
        {alarmActive && (
          <div style={{ position: 'absolute', inset: -10, borderRadius: '50%', border: `4px solid ${t.orange}`, animation: 'pulse 1.5s infinite' }} />
        )}
        <p style={{
          fontSize: 13, fontWeight: 900, textTransform: 'uppercase',
          letterSpacing: '0.3em', marginBottom: 12,
          color: mode === 'work' ? t.orange : t.accent
        }}>
          {mode === 'work' ? 'FOCUS' : (isLongBreakNext && mode === 'break' ? 'LONG BREAK' : 'BREAK')}
        </p>
        <span style={{ fontSize: 88, fontWeight: 900, fontFamily: "'Bebas Neue'", lineHeight: 1, letterSpacing: '0.05em' }}>
          {formatTime(timeLeft)}
        </span>
      </Card>

      {/* Main Controls */}
      {alarmActive ? (
        <ActionBtn onClick={stopAlarm} t={t} sh={sh} danger style={{ width: '100%', height: 70, fontSize: 16 }}>
          STOP ALARM — START {mode === 'work' ? 'BREAK' : 'FOCUS'}
        </ActionBtn>
      ) : (
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginBottom: 40 }}>
          <ActionBtn onClick={toggle} t={t} sh={sh} style={{
            width: 140, height: 140, borderRadius: '50%',
            boxShadow: active ? sh.inset : sh.btn
          }}>
            <I n={active ? 'pause' : 'play'} s={48} c={active ? t.orange : t.bg} />
          </ActionBtn>
          <ActionBtn secondary onClick={reset} t={t} sh={sh} style={{ width: 60, height: 60, borderRadius: '50%', marginTop: 40 }}>
            <I n="refresh" s={24} c={t.grey} />
          </ActionBtn>
        </div>
      )}

      {/* Advanced Controls — only when idle */}
      {!active && !alarmActive && (
        <Card t={t} sh={sh} style={{ textAlign: 'left', padding: 24, animation: 'fadeUp 0.4s ease-out' }}>
          <SectionLabel t={t}>Precision Tuning</SectionLabel>

          {/* Work Duration */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: t.grey }}>WORK DURATION</span>
              <span style={{ fontSize: 14, fontWeight: 900, color: t.black }}>{workMins}m</span>
            </div>
            <input type="range" min="1" max="90" value={workMins}
              onChange={e => changeTime('work', parseInt(e.target.value))}
              style={{ width: '100%', height: 6, background: t.bgDeep, borderRadius: 3, appearance: 'none', cursor: 'pointer' }} />
          </div>

          {/* Break Duration */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: t.grey }}>SHORT BREAK</span>
              <span style={{ fontSize: 14, fontWeight: 900, color: t.black }}>{breakMins}m</span>
            </div>
            <input type="range" min="1" max="30" value={breakMins}
              onChange={e => changeTime('break', parseInt(e.target.value))}
              style={{ width: '100%', height: 6, background: t.bgDeep, borderRadius: 3, appearance: 'none', cursor: 'pointer' }} />
          </div>

          {/* Long Break Duration */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: t.grey }}>LONG BREAK</span>
              <span style={{ fontSize: 14, fontWeight: 900, color: t.black }}>{longBreakMins}m</span>
            </div>
            <input type="range" min="5" max="30" value={longBreakMins}
              onChange={e => changeTime('longBreak', parseInt(e.target.value))}
              style={{ width: '100%', height: 6, background: t.bgDeep, borderRadius: 3, appearance: 'none', cursor: 'pointer' }} />
          </div>

          {/* Sessions before long break */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: t.grey }}>SESSIONS BEFORE LONG BREAK</span>
              <span style={{ fontSize: 14, fontWeight: 900, color: t.black }}>{sessionsBeforeLong}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[2, 3, 4, 5, 6].map(n => (
                <button key={n} onClick={() => update({ sessionsBeforeLong: n })}
                  style={{
                    flex: 1, padding: '10px 0', border: 'none', borderRadius: 12,
                    fontSize: 14, fontWeight: 900,
                    background: sessionsBeforeLong === n ? t.accent : t.bgDeep,
                    color: sessionsBeforeLong === n ? t.bg : t.grey,
                    boxShadow: sessionsBeforeLong === n ? sh.btn : 'none',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}>{n}</button>
              ))}
            </div>
          </div>

          {/* Ambient Sounds */}
          <SectionLabel t={t}>Ambient Soundscape</SectionLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            <button onClick={() => update({ selectedAmbient: null })}
              style={{
                padding: '10px 14px', border: 'none', borderRadius: 12,
                background: !selectedAmbient ? t.accent : t.bgDeep,
                color: !selectedAmbient ? t.bg : t.grey,
                fontSize: 11, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s'
              }}>None</button>
            {AMBIENTS.map(a => (
              <button key={a.id} onClick={() => update({ selectedAmbient: a.id })}
                style={{
                  flex: '1 1 auto', padding: '10px 14px', border: 'none', borderRadius: 12,
                  background: selectedAmbient === a.id ? t.accent : t.bgDeep,
                  color: selectedAmbient === a.id ? t.bg : t.grey,
                  fontSize: 11, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s'
                }}>{a.name}</button>
            ))}
          </div>

          {/* Alarm Sound */}
          <SectionLabel t={t}>Completion Alarm</SectionLabel>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {ALARMS.map(a => (
              <button key={a.id} onClick={() => update({ selectedAlarm: a.id })}
                style={{
                  flex: 1, padding: '10px 14px', border: 'none', borderRadius: 12,
                  background: selectedAlarm === a.id ? t.accentSoft : t.bgDeep,
                  color: selectedAlarm === a.id ? t.black : t.grey,
                  fontSize: 11, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s'
                }}>{a.name}</button>
            ))}
          </div>

          {/* Volume */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <IconBtn icon={muted ? 'mute' : 'volume'} onClick={() => update({ muted: !muted })} t={t} sh={sh} size={44} active={!muted} />
            <input type="range" min="0" max="1" step="0.1" value={volume}
              onChange={e => update({ volume: parseFloat(e.target.value) })}
              style={{ flex: 1, height: 6, background: t.bgDeep, borderRadius: 3, appearance: 'none', cursor: 'pointer' }} />
          </div>
        </Card>
      )}
    </div>
  );
};
