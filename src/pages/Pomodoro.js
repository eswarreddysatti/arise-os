import React, { useState, useEffect, useRef } from 'react';
import { BigNumber, ActionBtn, Card, SectionLabel, NeuInput, IconBtn } from '../components/SharedUI';
import { I } from '../components/Icons';
import { focusAPI } from '../lib/supabase';

const SOUNDS = [
  { id: 'bell', name: 'Soft Bell', url: 'https://cdn.pixabay.com/audio/2022/03/15/audio_8e906c6418.mp3' },
  { id: 'classic', name: 'Classic Alarm', url: 'https://cdn.pixabay.com/audio/2021/08/09/audio_d086708f1b.mp3' },
  { id: 'digital', name: 'Digital Beep', url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_5146c820b6.mp3' },
  { id: 'nature', name: 'Nature Chime', url: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0c6ff1646.mp3' },
  { id: 'click', name: 'Minimal Click', url: 'https://cdn.pixabay.com/audio/2022/10/25/audio_3f7697b0a3.mp3' },
];

export const PomodoroPage = ({ t, sh, onToast, userId, onSessionEnd }) => {
  const [workMins, setWorkMins] = useState(25);
  const [breakMins, setBreakMins] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [active, setActive] = useState(false);
  const [mode, setMode] = useState("work");
  const [alarmActive, setAlarmActive] = useState(false);
  const [selectedSound, setSelectedSound] = useState(SOUNDS[0]);
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [startTime, setStartTime] = useState(null);

  const audioRef = useRef(null);

  // Persistence: Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('arise_pomo_state');
    if (saved) {
      const { work, brk, left, act, md, snd, vol, start } = JSON.parse(saved);
      setWorkMins(work || 25);
      setBreakMins(brk || 5);
      setTimeLeft(left || 25 * 60);
      setActive(act || false);
      setMode(md || "work");
      if (snd) setSelectedSound(SOUNDS.find(s => s.id === snd) || SOUNDS[0]);
      setVolume(vol || 0.5);
      if (start) setStartTime(new Date(start));
    }
  }, []);

  // Persistence: Save to localStorage
  useEffect(() => {
    const state = {
      work: workMins,
      brk: breakMins,
      left: timeLeft,
      act: active,
      md: mode,
      snd: selectedSound.id,
      vol: volume,
      start: startTime
    };
    localStorage.setItem('arise_pomo_state', JSON.stringify(state));
  }, [workMins, breakMins, timeLeft, active, mode, selectedSound, volume, startTime]);

  useEffect(() => {
    let timer;
    if (active && timeLeft > 0) {
      if (!startTime) setStartTime(new Date());
      timer = setInterval(() => {
        setTimeLeft(l => l - 1);
      }, 1000);
    } else if (active && timeLeft === 0) {
      handleComplete();
    }
    return () => clearInterval(timer);
  }, [active, timeLeft]);

  const handleComplete = async () => {
    setActive(false);
    setAlarmActive(true);
    playAlarm();
    onToast(mode === "work" ? "Session complete! Time to break." : "Break over! Back to focus.");
    
    // Save to database
    if (userId) {
      const duration = mode === "work" ? workMins : breakMins;
      const { data, error } = await focusAPI.start(userId, {
        session_type: mode,
        duration: duration,
        start_time: startTime ? startTime.toISOString() : new Date().toISOString(),
        end_time: new Date().toISOString(),
        completed: true
      });
      if (data && onSessionEnd) onSessionEnd(data);
    }
    setStartTime(null);

    if (Notification.permission === "granted") {
      new Notification("ARISE", { body: mode === "work" ? "Focus session complete!" : "Break over!" });
    }
  };

  const playAlarm = () => {
    if (audioRef.current) {
      audioRef.current.src = selectedSound.url;
      audioRef.current.volume = muted ? 0 : volume;
      audioRef.current.loop = true;
      audioRef.current.play().catch(e => console.log("Audio play blocked", e));
    }
  };

  const stopAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setAlarmActive(false);
    const nextMode = mode === "work" ? "break" : "work";
    setMode(nextMode);
    setTimeLeft((nextMode === "work" ? workMins : breakMins) * 60);
  };

  const toggle = () => {
    if (alarmActive) stopAlarm();
    else setActive(!active);
  };

  const reset = () => {
    setActive(false);
    setAlarmActive(false);
    setStartTime(null);
    if (audioRef.current) audioRef.current.pause();
    setTimeLeft((mode === "work" ? workMins : breakMins) * 60);
  };

  const changeTime = (type, val) => {
    const v = Math.max(1, Math.min(type === 'work' ? 90 : 30, val));
    if (type === 'work') {
      setWorkMins(v);
      if (!active && mode === "work") setTimeLeft(v * 60);
    } else {
      setBreakMins(v);
      if (!active && mode === "break") setTimeLeft(v * 60);
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className="page" style={{ padding: "80px 24px 120px", textAlign: "center" }}>
      <audio ref={audioRef} />
      
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.25em", color: t.grey, textTransform: "uppercase" }}>Focus System</p>
        <BigNumber t={t}>CONTROL</BigNumber>
      </div>

      <Card t={t} sh={sh} style={{ padding: "50px 20px", borderRadius: "50%", width: 300, height: 300, margin: "0 auto 40px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: active ? `4px solid ${t.orange}` : `4px solid ${t.bgDeep}`, transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)", transform: active ? "scale(1.02)" : "scale(1)", position: "relative" }}>
        {alarmActive && (
          <div style={{ position: "absolute", inset: -10, borderRadius: "50%", border: `4px solid ${t.orange}`, animation: "pulse 1.5s infinite" }} />
        )}
        <p style={{ fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.3em", color: mode === "work" ? t.orange : t.accent, marginBottom: 12 }}>{mode}</p>
        <span style={{ fontSize: 88, fontWeight: 900, fontFamily: "'Bebas Neue'", lineHeight: 1, letterSpacing: "0.05em" }}>{formatTime(timeLeft)}</span>
      </Card>

      {alarmActive ? (
        <ActionBtn onClick={stopAlarm} t={t} sh={sh} danger style={{ width: "100%", height: 70, fontSize: 16 }}>STOP ALARM</ActionBtn>
      ) : (
        <div style={{ display: "flex", gap: 20, justifyContent: "center", marginBottom: 40 }}>
          <ActionBtn onClick={toggle} t={t} sh={sh} style={{ width: 140, height: 140, borderRadius: "50%", boxShadow: active ? sh.inset : sh.btn }}>
            <I n={active ? "pause" : "play"} s={48} c={active ? t.orange : t.bg} />
          </ActionBtn>
          <ActionBtn secondary onClick={reset} t={t} sh={sh} style={{ width: 60, height: 60, borderRadius: "50%", marginTop: 40 }}>
            <I n="refresh" s={24} c={t.grey} />
          </ActionBtn>
        </div>
      )}

      {/* Advanced Controls */}
      {!active && !alarmActive && (
        <Card t={t} sh={sh} style={{ textAlign: "left", padding: 24, animation: "fadeUp 0.4s ease-out" }}>
          <SectionLabel t={t}>Precision Tuning</SectionLabel>
          
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: t.grey }}>WORK DURATION</span>
              <span style={{ fontSize: 14, fontWeight: 900, color: t.black }}>{workMins}m</span>
            </div>
            <input type="range" min="1" max="90" value={workMins} onChange={e => changeTime('work', parseInt(e.target.value))} style={{ width: "100%", height: 6, background: t.bgDeep, borderRadius: 3, appearance: "none", cursor: "pointer" }} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: t.grey }}>BREAK DURATION</span>
              <span style={{ fontSize: 14, fontWeight: 900, color: t.black }}>{breakMins}m</span>
            </div>
            <input type="range" min="1" max="30" value={breakMins} onChange={e => changeTime('break', parseInt(e.target.value))} style={{ width: "100%", height: 6, background: t.bgDeep, borderRadius: 3, appearance: "none", cursor: "pointer" }} />
          </div>

          <SectionLabel t={t}>Soundscape</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
            {SOUNDS.map(s => (
              <button key={s.id} onClick={() => { setSelectedSound(s); onToast(`Selected: ${s.name}`); }} style={{ flex: "1 1 auto", padding: "10px 14px", border: "none", borderRadius: 12, background: selectedSound.id === s.id ? t.accentSoft : t.bgDeep, color: selectedSound.id === s.id ? t.black : t.grey, fontSize: 11, fontWeight: 800, cursor: "pointer", transition: "all 0.2s" }}>
                {s.name}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <IconBtn icon={muted ? "mute" : "volume"} onClick={() => setMuted(!muted)} t={t} sh={sh} size={44} active={!muted} />
            <input type="range" min="0" max="1" step="0.1" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} style={{ flex: 1, height: 6, background: t.bgDeep, borderRadius: 3, appearance: "none", cursor: "pointer" }} />
          </div>
        </Card>
      )}
    </div>
  );
};
