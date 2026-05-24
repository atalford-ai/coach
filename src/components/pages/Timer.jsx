import React, { useState, useRef, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ALL_EVENTS } from '../../data/events';
import { useToast } from '../shared/Toast';
import { HintBadge } from '../shared/Walkthrough';

const fmt = (ms) => {
  const m  = Math.floor(ms / 60000);
  const s  = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  return `${m > 0 ? m + ':' : ''}${String(s).padStart(m > 0 ? 2 : 1, '0')}.${String(cs).padStart(2, '0')}`;
};

export default function Timer({ theme, user, athletes }) {
  const toast = useToast();
  const [athleteId, setAthleteId] = useState('');
  const [event,     setEvent]     = useState('100m');
  const [running,   setRunning]   = useState(false);
  const [elapsed,   setElapsed]   = useState(0);
  const [laps,      setLaps]      = useState([]);
  const [saved,     setSaved]     = useState(false);
  const [saving,    setSaving]    = useState(false);

  const intervalRef = useRef(null);
  const startRef    = useRef(0);
  const baseRef     = useRef(0);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const start = () => {
    startRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setElapsed(baseRef.current + Date.now() - startRef.current);
    }, 10);
    setRunning(true);
    setSaved(false);
  };

  const lap = () => {
    setLaps(prev => [...prev, baseRef.current + Date.now() - startRef.current]);
  };

  const stop = () => {
    clearInterval(intervalRef.current);
    const final = baseRef.current + Date.now() - startRef.current;
    baseRef.current = final;
    setElapsed(final);
    setLaps(prev => [...prev, final]);
    setRunning(false);
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    setElapsed(0); setLaps([]); baseRef.current = 0;
    setRunning(false); setSaved(false);
  };

  const save = async () => {
    if (!athleteId || laps.length === 0) return;
    const athlete = athletes.find(a => a.id === athleteId);
    const best = Math.min(...laps);
    setSaving(true);
    await addDoc(collection(db, 'coaches', user.uid, 'times'), {
      athleteId,
      athleteName: athlete?.name || 'Unknown',
      event,
      time: fmt(best),
      allLaps: laps.map(fmt),
      date: new Date().toISOString().split('T')[0],
      source: 'timer',
      createdAt: serverTimestamp(),
    });
    setSaving(false);
    setSaved(true);
    toast.success(`${fmt(best)} saved for ${athlete?.name || 'athlete'}`);
    reset();
  };

  const sectionLbl = { fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: theme.g500, borderBottom: `1px solid ${theme.g700}`, paddingBottom: 8, marginBottom: 14 };
  const sel = { width: '100%', padding: '12px 14px', background: theme.g800, border: `1px solid ${theme.g700}`, color: theme.white, fontSize: 14, outline: 'none', marginBottom: 14, fontFamily: "'Barlow', sans-serif" };
  const lbl = { display: 'block', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: theme.g500, marginBottom: 6 };

  return (
    <div style={{ padding: '0 0 80px', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ padding: '52px 20px 16px', borderBottom: `1px solid ${theme.g700}` }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: 1, color: theme.white }}>TIMER</div>
        <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: theme.g500, lineHeight: 1.5, marginTop: 6, maxWidth: 400 }}>
          Select an athlete and event, then hit Start. Tap Lap for split times. When you stop, you can save the best time to that athlete's record.
        </div>
      </div>

      <div style={{ padding: '20px 20px 0' }}>

        {/* Athlete + Event selectors */}
        <div style={sectionLbl}>Session Setup</div>
        <label style={lbl}>Athlete</label>
        <select style={sel} value={athleteId} onChange={e => setAthleteId(e.target.value)} disabled={running}>
          <option value="">— Select athlete —</option>
          {athletes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>

        <label style={lbl}>Event</label>
        <select style={sel} value={event} onChange={e => setEvent(e.target.value)} disabled={running}>
          {ALL_EVENTS.map(ev => <option key={ev} value={ev}>{ev}</option>)}
        </select>

        {/* Stopwatch display */}
        <div style={sectionLbl}>Stopwatch</div>
        <div style={{
          background: theme.g900, border: `1px solid ${running ? theme.accent : theme.g700}`,
          padding: '32px 20px', textAlign: 'center', marginBottom: 16,
          transition: 'border-color 0.2s',
        }}>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(64px, 18vw, 96px)',
            letterSpacing: 2, color: running ? theme.accent : theme.white,
            lineHeight: 1, transition: 'color 0.2s',
            textShadow: running ? `0 0 40px ${theme.accent}44` : 'none',
          }}>
            {fmt(elapsed)}
          </div>
          {laps.length > 0 && (
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: theme.g500, marginTop: 8 }}>
              Best: <span style={{ color: theme.accent }}>{fmt(Math.min(...laps))}</span>
              {laps.length > 1 && ` · ${laps.length} reps`}
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          {!running ? (
            <button onClick={start} style={{ gridColumn: '1 / -1', padding: '18px', background: theme.accent, border: 'none', color: '#000', fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 1, cursor: 'pointer' }}>
              {elapsed === 0 ? 'START' : 'RESUME'}
            </button>
          ) : (
            <>
              <button onClick={lap} style={{ padding: '16px', background: theme.g800, border: `1px solid ${theme.g700}`, color: theme.white, fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 1, cursor: 'pointer' }}>LAP</button>
              <button onClick={stop} style={{ padding: '16px', background: theme.g700, border: 'none', color: theme.white, fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 1, cursor: 'pointer' }}>STOP</button>
            </>
          )}
        </div>

        {!running && elapsed > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
            <button onClick={reset} style={{ padding: '12px', background: 'transparent', border: `1px solid ${theme.g700}`, color: theme.g300, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>RESET</button>
            <button onClick={save} disabled={saving || !athleteId} style={{ padding: '12px', background: athleteId ? theme.accent : theme.g700, border: 'none', color: athleteId ? '#000' : theme.g500, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: athleteId ? 'pointer' : 'not-allowed', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'SAVING...' : 'SAVE TIME'}
            </button>
          </div>
        )}

        {saved && (
          <div style={{ padding: '12px 16px', background: `${theme.accent}15`, border: `1px solid ${theme.accentD}`, color: theme.accent, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, letterSpacing: '0.06em', marginBottom: 16 }}>
            ✓ Time saved to {athletes.find(a => a.id === athleteId)?.name || 'athlete'}
          </div>
        )}

        {/* Lap log */}
        {laps.length > 0 && (
          <>
            <div style={sectionLbl}>Reps ({laps.length})</div>
            {[...laps].reverse().map((lap, i) => {
              const idx = laps.length - i;
              const isBest = lap === Math.min(...laps);
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${theme.g700}` }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: theme.g500, letterSpacing: '0.08em' }}>
                    REP {idx} {isBest && <span style={{ color: theme.accent }}>★ BEST</span>}
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: isBest ? theme.accent : theme.white, letterSpacing: 1 }}>
                    {fmt(lap)}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
