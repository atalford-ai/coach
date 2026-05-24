import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useToast } from '../shared/Toast';

const PHASE_TYPES = [
  { id: 'offseason', label: 'Off-Season', color: '#6b7280' },
  { id: 'base', label: 'Base Building', color: '#38bdf8' },
  { id: 'build', label: 'Build', color: '#f59e0b' },
  { id: 'peak', label: 'Peak / Competition', color: '#ef4444' },
  { id: 'taper', label: 'Taper', color: '#a78bfa' },
  { id: 'recovery', label: 'Recovery', color: '#10b981' },
];

function getMonthWeeks(year, month) {
  const weeks = [];
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  let current = new Date(first);
  current.setDate(current.getDate() - current.getDay() + 1); // Start on Monday
  while (current <= last || weeks.length < 4) {
    weeks.push(new Date(current));
    current.setDate(current.getDate() + 7);
    if (weeks.length >= 6) break;
  }
  return weeks;
}

export default function SeasonPlanner({ theme, user }) {
  const toast = useToast();
  const [seasons, setSeasons] = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  // Live seasons
  useEffect(() => {
    if (!user?.uid || user.uid === 'demo-coach') return;
    const unsub = onSnapshot(collection(db, 'coaches', user.uid, 'seasons'), snap => {
      setSeasons(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user?.uid]);

  const activeSeason = seasons.find(s => s.active) || seasons[0];

  const sectionLbl = {
    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10,
    letterSpacing: '0.16em', textTransform: 'uppercase', color: theme.g500,
    marginBottom: 8,
  };

  return (
    <div>
      {/* Season header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={sectionLbl}>SEASON PLAN</div>
        <button onClick={() => setShowCreate(true)} style={{
          padding: '5px 12px', background: 'transparent', border: `1px solid ${theme.g700}`,
          color: theme.g300, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10,
          fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
        }}>+ SEASON</button>
      </div>

      {activeSeason ? (
        <SeasonView season={activeSeason} theme={theme} user={user} toast={toast} />
      ) : (
        <div style={{
          padding: '40px 16px', textAlign: 'center',
          background: theme.g900, border: `1px dashed ${theme.g700}`,
        }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: theme.g600, marginBottom: 8 }}>NO SEASON PLAN</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: theme.g500, maxWidth: 280, margin: '0 auto 16px', lineHeight: 1.5 }}>
            Create a season plan to map out training phases, track periodization, and stay on schedule.
          </div>
          <button onClick={() => setShowCreate(true)} style={{
            padding: '10px 20px', background: theme.accent, border: 'none', color: '#000',
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
          }}>CREATE SEASON</button>
        </div>
      )}

      {showCreate && (
        <CreateSeasonSheet theme={theme} user={user} toast={toast} onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}

function SeasonView({ season, theme, user, toast }) {
  const [showAddPhase, setShowAddPhase] = useState(false);
  const phases = season.phases || [];

  // Sort phases by start date
  const sorted = [...phases].sort((a, b) => (a.start || '').localeCompare(b.start || ''));

  // Calculate timeline
  const today = new Date().toISOString().split('T')[0];
  const currentPhase = sorted.find(p => p.start <= today && p.end >= today);

  const addPhase = async (phase) => {
    const newPhases = [...phases, phase];
    await updateDoc(doc(db, 'coaches', user.uid, 'seasons', season.id), {
      phases: newPhases,
    });
    toast.success(`${phase.label} phase added`);
    setShowAddPhase(false);
  };

  const removePhase = async (index) => {
    const newPhases = phases.filter((_, i) => i !== index);
    await updateDoc(doc(db, 'coaches', user.uid, 'seasons', season.id), {
      phases: newPhases,
    });
    toast.success('Phase removed');
  };

  const sectionLbl = {
    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10,
    letterSpacing: '0.16em', textTransform: 'uppercase', color: theme.g500,
    marginBottom: 8,
  };

  return (
    <div>
      {/* Season info */}
      <div style={{
        background: theme.g900, border: `1px solid ${theme.g700}`,
        padding: '14px', marginBottom: 12,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: theme.white, letterSpacing: 0.5 }}>
            {season.name}
          </div>
          {currentPhase && (
            <div style={{
              padding: '3px 10px',
              background: (PHASE_TYPES.find(p => p.id === currentPhase.type)?.color || theme.accent) + '20',
              border: `1px solid ${PHASE_TYPES.find(p => p.id === currentPhase.type)?.color || theme.accent}50`,
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700,
              color: PHASE_TYPES.find(p => p.id === currentPhase.type)?.color || theme.accent,
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>{currentPhase.label}</div>
          )}
        </div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: theme.g500, marginTop: 4 }}>
          {season.startDate && season.endDate
            ? `${new Date(season.startDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${new Date(season.endDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
            : 'No dates set'
          }
          {' \u00B7 '}{sorted.length} phase{sorted.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Phase timeline */}
      {sorted.length > 0 && (
        <>
          <div style={sectionLbl}>TRAINING PHASES</div>
          <div style={{ marginBottom: 12 }}>
            {sorted.map((phase, i) => {
              const type = PHASE_TYPES.find(p => p.id === phase.type) || PHASE_TYPES[0];
              const isCurrent = currentPhase && phase.start === currentPhase.start && phase.end === currentPhase.end;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'stretch', marginBottom: 4,
                  background: isCurrent ? type.color + '10' : theme.g900,
                  border: `1px solid ${isCurrent ? type.color + '50' : theme.g700}`,
                }}>
                  <div style={{ width: 4, background: type.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: theme.white, fontWeight: 700 }}>
                        {phase.label}
                      </div>
                      {isCurrent && (
                        <span style={{
                          fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: type.color,
                          fontWeight: 700, letterSpacing: '0.1em',
                        }}>CURRENT</span>
                      )}
                    </div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: theme.g500, marginTop: 2 }}>
                      {new Date(phase.start + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {' — '}
                      {new Date(phase.end + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {phase.notes ? ` \u00B7 ${phase.notes}` : ''}
                    </div>
                  </div>
                  <button onClick={() => removePhase(i)} style={{
                    background: 'none', border: 'none', color: theme.g600, padding: '0 10px',
                    cursor: 'pointer', fontSize: 14,
                  }}>{'\u2715'}</button>
                </div>
              );
            })}
          </div>
        </>
      )}

      <button onClick={() => setShowAddPhase(true)} style={{
        width: '100%', padding: '10px', background: 'transparent',
        border: `1px dashed ${theme.accentD}`, color: theme.accent,
        fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700,
        letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
      }}>+ ADD PHASE</button>

      {showAddPhase && (
        <AddPhaseSheet theme={theme} onAdd={addPhase} onClose={() => setShowAddPhase(false)} />
      )}
    </div>
  );
}

function AddPhaseSheet({ theme, onAdd, onClose }) {
  const [type, setType] = useState('base');
  const [label, setLabel] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [notes, setNotes] = useState('');

  const selectedType = PHASE_TYPES.find(p => p.id === type);

  const handleAdd = () => {
    if (!start || !end) return;
    onAdd({
      type,
      label: label || selectedType?.label || type,
      start,
      end,
      notes: notes.trim() || null,
    });
  };

  const inp = {
    width: '100%', padding: '10px 12px', boxSizing: 'border-box',
    background: theme.g800, border: `1px solid ${theme.g700}`,
    color: theme.white, fontSize: 13, outline: 'none', fontFamily: "'Barlow', sans-serif",
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
      overflowY: 'auto', zIndex: 200,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        maxWidth: 400, margin: '80px auto 0', background: theme.g900,
        borderTop: `3px solid ${theme.accent}`, padding: '24px 20px 32px',
      }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: theme.white, letterSpacing: 0.5, marginBottom: 16 }}>
          ADD PHASE
        </div>

        {/* Phase type */}
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: '0.12em', color: theme.g500, marginBottom: 8 }}>TYPE</div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
          {PHASE_TYPES.map(p => (
            <button key={p.id} onClick={() => { setType(p.id); if (!label) setLabel(p.label); }} style={{
              padding: '6px 12px',
              background: type === p.id ? p.color + '20' : 'transparent',
              border: `1px solid ${type === p.id ? p.color : theme.g700}`,
              color: type === p.id ? p.color : theme.g500,
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
            }}>{p.label}</button>
          ))}
        </div>

        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: '0.12em', color: theme.g500, marginBottom: 6 }}>LABEL</div>
        <input style={{ ...inp, marginBottom: 12 }} value={label} onChange={e => setLabel(e.target.value)} placeholder={selectedType?.label} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: '0.12em', color: theme.g500, marginBottom: 6 }}>START</div>
            <input type="date" style={inp} value={start} onChange={e => setStart(e.target.value)} />
          </div>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: '0.12em', color: theme.g500, marginBottom: 6 }}>END</div>
            <input type="date" style={inp} value={end} onChange={e => setEnd(e.target.value)} />
          </div>
        </div>

        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: '0.12em', color: theme.g500, marginBottom: 6 }}>NOTES (OPTIONAL)</div>
        <input style={{ ...inp, marginBottom: 16 }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Focus, goals, notes..." />

        <button onClick={handleAdd} disabled={!start || !end} style={{
          width: '100%', padding: '12px', background: theme.accent, border: 'none', color: '#000',
          fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
          opacity: (!start || !end) ? 0.5 : 1,
        }}>ADD PHASE</button>
        <button onClick={onClose} style={{
          width: '100%', padding: '10px', marginTop: 8,
          background: 'transparent', border: `1px solid ${theme.g700}`,
          color: theme.g300, fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
        }}>CANCEL</button>
      </div>
    </div>
  );
}

function CreateSeasonSheet({ theme, user, toast, onClose }) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await addDoc(collection(db, 'coaches', user.uid, 'seasons'), {
      name: name.trim(),
      startDate,
      endDate,
      active: true,
      phases: [],
      createdAt: serverTimestamp(),
    });
    toast.success(`Season "${name.trim()}" created`);
    setSaving(false);
    onClose();
  };

  const inp = {
    width: '100%', padding: '10px 12px', boxSizing: 'border-box',
    background: theme.g800, border: `1px solid ${theme.g700}`,
    color: theme.white, fontSize: 13, outline: 'none', fontFamily: "'Barlow', sans-serif",
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
      overflowY: 'auto', zIndex: 200,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        maxWidth: 400, margin: '80px auto 0', background: theme.g900,
        borderTop: `3px solid ${theme.accent}`, padding: '24px 20px 32px',
      }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: theme.white, letterSpacing: 0.5, marginBottom: 16 }}>CREATE SEASON</div>

        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: '0.12em', color: theme.g500, marginBottom: 6 }}>SEASON NAME</div>
        <input autoFocus style={{ ...inp, marginBottom: 12 }} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Spring 2026 Outdoor" />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: '0.12em', color: theme.g500, marginBottom: 6 }}>START</div>
            <input type="date" style={inp} value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: '0.12em', color: theme.g500, marginBottom: 6 }}>END</div>
            <input type="date" style={inp} value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>

        <button onClick={save} disabled={saving || !name.trim()} style={{
          width: '100%', padding: '12px', background: theme.accent, border: 'none', color: '#000',
          fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
          opacity: saving || !name.trim() ? 0.5 : 1,
        }}>{saving ? 'CREATING...' : 'CREATE SEASON'}</button>
        <button onClick={onClose} style={{
          width: '100%', padding: '10px', marginTop: 8,
          background: 'transparent', border: `1px solid ${theme.g700}`,
          color: theme.g300, fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
        }}>CANCEL</button>
      </div>
    </div>
  );
}
