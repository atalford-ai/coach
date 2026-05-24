import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'fs-coach-walkthrough-done';
const HINTS_KEY = 'fs-coach-hints-seen';

const STEPS = [
  {
    title: 'Welcome to FirstStep Coach',
    text: 'Your command center for managing athletes, building workouts, and tracking performance.',
    icon: '\uD83C\uDFC6',
  },
  {
    title: 'Build Your Roster',
    text: 'Start by adding your athletes. You can organize them into groups like Sprinters, Distance, and Field.',
    icon: '\uD83D\uDC65',
  },
  {
    title: 'Create Workouts',
    text: 'Use the Track Matrix to build workout plans. Save them as templates and schedule them on the calendar.',
    icon: '\u26A1',
  },
  {
    title: 'Time & Track',
    text: 'Use the built-in timer for practice reps, or import meet results in bulk. PRs are tracked automatically.',
    icon: '\u23F1\uFE0F',
  },
  {
    title: 'You\'re All Set',
    text: 'Look for hint badges throughout the app for quick tips. Let\'s get to work.',
    icon: '\uD83D\uDE80',
  },
];

export function useWalkthrough() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const t = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  return { showWalkthrough: show, dismissWalkthrough: dismiss };
}

export function WalkthroughOverlay({ onDismiss }) {
  const [step, setStep] = useState(0);
  const [fade, setFade] = useState(true);

  const goNext = () => {
    if (step >= STEPS.length - 1) {
      onDismiss();
      return;
    }
    setFade(false);
    setTimeout(() => {
      setStep(s => s + 1);
      setFade(true);
    }, 200);
  };

  const goPrev = () => {
    if (step <= 0) return;
    setFade(false);
    setTimeout(() => {
      setStep(s => s - 1);
      setFade(true);
    }, 200);
  };

  const s = STEPS[step];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.92)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        maxWidth: 380, width: '100%', textAlign: 'center',
        opacity: fade ? 1 : 0,
        transform: fade ? 'translateY(0)' : 'translateY(10px)',
        transition: 'all 0.2s ease',
      }}>
        <div style={{ fontSize: 56, marginBottom: 20, lineHeight: 1 }}>{s.icon}</div>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 32, letterSpacing: 1, color: '#eef5f1',
          marginBottom: 12, lineHeight: 1.1,
        }}>
          {s.title}
        </div>
        <div style={{
          fontFamily: "'Barlow', sans-serif",
          fontSize: 15, lineHeight: 1.6, color: '#7aaa8a',
          marginBottom: 32, maxWidth: 320, margin: '0 auto 32px',
        }}>
          {s.text}
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 24 : 8, height: 8,
              background: i === step ? '#00d966' : '#1a2620',
              transition: 'all 0.2s',
            }} />
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          {step > 0 && (
            <button onClick={goPrev} style={{
              padding: '12px 24px', background: 'transparent',
              border: '1px solid #243529', color: '#7aaa8a',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 13, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', cursor: 'pointer',
            }}>
              BACK
            </button>
          )}
          <button onClick={goNext} style={{
            padding: '12px 32px', background: '#00d966',
            border: 'none', color: '#000',
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 13, fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', cursor: 'pointer',
          }}>
            {step >= STEPS.length - 1 ? 'GET STARTED' : 'NEXT'}
          </button>
        </div>

        <button onClick={onDismiss} style={{
          background: 'none', border: 'none', color: '#3d5a47',
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 11, letterSpacing: '0.12em', cursor: 'pointer',
          marginTop: 20, textTransform: 'uppercase',
        }}>
          SKIP TOUR
        </button>
      </div>
    </div>
  );
}

// Per-screen hint tooltips
export function useHint(hintId) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = JSON.parse(localStorage.getItem(HINTS_KEY) || '{}');
    if (!seen[hintId]) setVisible(true);
  }, [hintId]);

  const dismiss = () => {
    setVisible(false);
    const seen = JSON.parse(localStorage.getItem(HINTS_KEY) || '{}');
    seen[hintId] = true;
    localStorage.setItem(HINTS_KEY, JSON.stringify(seen));
  };

  return { hintVisible: visible, dismissHint: dismiss };
}

export function HintBadge({ hintId, text, position = 'below' }) {
  const { hintVisible, dismissHint } = useHint(hintId);
  const [expanded, setExpanded] = useState(false);

  if (!hintVisible) return null;

  const posStyles = position === 'above'
    ? { bottom: '100%', marginBottom: 8 }
    : { top: '100%', marginTop: 8 };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: 20, height: 20, borderRadius: '50%',
          background: '#00d96625', border: '1px solid #00d96660',
          color: '#00d966', fontSize: 11, fontWeight: 700,
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', animation: 'pulse-hint 2s infinite',
        }}
      >
        ?
      </button>
      {expanded && (
        <div style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          ...posStyles,
          background: '#111815', border: '1px solid #00d96640',
          padding: '10px 14px', width: 220, zIndex: 100,
        }}>
          <div style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: 12, lineHeight: 1.5, color: '#7aaa8a',
            marginBottom: 8,
          }}>
            {text}
          </div>
          <button onClick={(e) => { e.stopPropagation(); dismissHint(); }} style={{
            background: 'none', border: 'none', color: '#00d966',
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 10, letterSpacing: '0.12em', cursor: 'pointer',
            padding: 0, textTransform: 'uppercase',
          }}>
            GOT IT
          </button>
        </div>
      )}
    </div>
  );
}
