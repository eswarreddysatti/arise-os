import React from 'react';
import { I } from './Icons';

const formatTime = (s) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

export const FloatingTimer = ({ pomoState, setPomoState, onNavigate, t, sh }) => {
  if (!pomoState?.active && !pomoState?.alarmActive) return null;

  const { timeLeft = 0, mode = 'work', active } = pomoState;

  return (
    <div
      onClick={onNavigate}
      style={{
        position: 'fixed',
        top: 68,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 90,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 20px',
        borderRadius: 50,
        background: mode === 'work' ? t.accent : t.card,
        color: mode === 'work' ? t.bg : t.black,
        boxShadow: sh.raised,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        animation: 'fadeUp 0.3s ease-out',
      }}
    >
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: mode === 'work' ? t.bg : t.accent,
        animation: active ? 'pulse 2s infinite' : 'none',
      }} />
      <span style={{ fontFamily: "'Bebas Neue'", fontSize: 20, letterSpacing: '0.08em' }}>
        {formatTime(timeLeft)}
      </span>
      <span style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.8 }}>
        {mode === 'work' ? 'FOCUS' : 'BREAK'}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setPomoState(prev => ({ ...prev, active: !prev.active }));
        }}
        style={{
          border: 'none', background: 'transparent', cursor: 'pointer',
          display: 'flex', alignItems: 'center', padding: 4,
        }}
      >
        <I n={active ? 'pause' : 'play'} s={14} c={mode === 'work' ? t.bg : t.black} />
      </button>
    </div>
  );
};
