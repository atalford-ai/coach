import React, { useState, useCallback, useReducer, useRef, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { MATRIX_DATA } from '../../data/track_matrix_data';
import { useToast } from '../shared/Toast';

// ─── Lighter Theme ───────────────────────────────────────────────────────────
const Z = {
  bg:      '#111318',
  card:    '#1a1d24',
  card2:   '#22262e',
  border:  '#2e3340',
  border2: '#3d4455',
  muted:   '#6b7280',
  subtle:  '#9ca3af',
  text:    '#f9fafb',
  textSub: '#d1d5db',
};

const CHIPS = {
  randomize: { label: 'Randomize All',  color: '#6366f1', action: 'RANDOMIZE_ALL'     },
  shuffle:   { label: 'Shuffle Vars',   color: '#f97316', action: 'SHUFFLE_VARIABLES'  },
  light:     { label: 'Lightwork',      color: '#10b981', action: 'LIGHTWORK', toggle: true },
  hard:      { label: 'Go Hard',        color: '#f43f5e', action: 'GO_HARD',   toggle: true },
};

const MAX_SLOTS = 9;

// ─── Flatten all categories ──────────────────────────────────────────────────
const ALL_CATEGORIES = [];
for (const [tabKey, tabData] of Object.entries(MATRIX_DATA)) {
  for (const [specKey, specData] of Object.entries(tabData.specs)) {
    ALL_CATEGORIES.push({
      id: `${tabKey}__${specKey}`,
      tabKey,
      label: specData.label,
      color: tabData.color,
      parentLabel: tabData.label,
      exercises: specData.exercises,
    });
  }
}

const PARENT_GROUPS = Object.entries(MATRIX_DATA).map(([key, data]) => ({
  key,
  label: data.label,
  color: data.color,
  categories: Object.entries(data.specs).map(([specKey, specData]) => ({
    id: `${key}__${specKey}`,
    label: specData.label,
  })),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pickRandom(arr, n) { return [...arr].sort(() => Math.random() - 0.5).slice(0, n); }

function applyIntensity(ex, mode) {
  if (!ex || !mode) return ex;
  if (mode === 'light') return { ...ex, sets: Math.max(ex.sets - 1, 1), rest: ex.rest + 30 };
  if (mode === 'hard') return { ...ex, sets: ex.sets + 1, rest: Math.max(ex.rest - 20, 30), reps: ex.repsUnit === 'reps' ? Math.max(ex.reps - 1, 1) : ex.reps };
  return ex;
}

function shuffleVars(ex) {
  if (!ex) return ex;
  return {
    ...ex,
    sets: Math.max(ex.sets + randInt(-1, 1), 1),
    rest: Math.max(ex.rest + (randInt(0, 2) - 1) * 30, 20),
    reps: Math.max(ex.reps + (ex.repsUnit === 'reps' ? randInt(-1, 1) : 0), 1),
  };
}

function fmtRest(s) {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60), r = s % 60;
  return r ? `${m}m ${r}s` : `${m}m`;
}

function fmtReps(ex) {
  if (!ex) return '';
  if (ex.repsUnit === 'reps') return `${ex.reps} reps`;
  if (ex.repsUnit === 's') return `${ex.reps}s`;
  return `${ex.reps} ${ex.repsUnit}`;
}

function fmtTimer(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ─── State ────────────────────────────────────────────────────────────────────

const initialState = {
  parentKey: '',
  categoryId: '',
  slots: [],
  intensity: null,
};

function reducer(state, { type, payload = {} }) {
  switch (type) {
    case 'SET_PARENT':
      return { ...state, parentKey: payload.key, categoryId: '' };

    case 'SET_CATEGORY':
      return { ...state, categoryId: payload.id };

    case 'TOGGLE_EXERCISE': {
      const ex = payload.exercise;
      const has = state.slots.find(s => s.id === ex.id);
      if (has) return { ...state, slots: state.slots.filter(s => s.id !== ex.id) };
      if (state.slots.length >= MAX_SLOTS) return state;
      return { ...state, slots: [...state.slots, ex] };
    }

    case 'REMOVE_SLOT':
      return { ...state, slots: state.slots.filter((_, i) => i !== payload.index) };

    case 'CLEAR_ALL':
      return { ...state, slots: [] };

    case 'RANDOMIZE_ALL': {
      const cat = ALL_CATEGORIES.find(c => c.id === state.categoryId);
      if (!cat) return state;
      const count = Math.min(randInt(4, MAX_SLOTS), cat.exercises.length);
      return { ...state, slots: pickRandom(cat.exercises, count) };
    }

    case 'SHUFFLE_VARIABLES':
      return { ...state, slots: state.slots.map(ex => shuffleVars(ex)) };

    case 'LIGHTWORK':
      return { ...state, intensity: state.intensity === 'light' ? null : 'light' };

    case 'GO_HARD':
      return { ...state, intensity: state.intensity === 'hard' ? null : 'hard' };

    default:
      return state;
  }
}

// ─── Shared Styles ───────────────────────────────────────────────────────────

const chevronSvg = `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%239ca3af' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`;

const selectStyle = {
  width: '100%', padding: '14px 16px', boxSizing: 'border-box',
  background: Z.card2, border: `1px solid ${Z.border2}`,
  color: Z.text, fontSize: 15, outline: 'none',
  fontFamily: "'Barlow', sans-serif",
  appearance: 'none',
  backgroundImage: chevronSvg,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 14px center',
  paddingRight: 40,
};

// ─── Exercise Bottom Sheet (matches native select feel) ─────────────────────

function ExerciseSheet({ exercises, slots, catColor, onToggle, onClose }) {
  const full = slots.length >= MAX_SLOTS;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.7)',
        animation: 'fadeIn 0.2s ease',
      }} />

      {/* Sheet */}
      <div style={{
        position: 'relative',
        background: Z.card,
        borderTop: `2px solid ${catColor}`,
        maxHeight: '70dvh',
        display: 'flex', flexDirection: 'column',
        animation: 'slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
      }}>
        {/* Handle + header */}
        <div style={{ padding: '12px 20px 14px', borderBottom: `1px solid ${Z.border}` }}>
          <div style={{
            width: 36, height: 4, background: Z.border2, borderRadius: 2,
            margin: '0 auto 12px',
          }} />
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: Z.text,
            }}>
              Select Exercises
              <span style={{ color: Z.muted, fontWeight: 400, marginLeft: 8 }}>
                {slots.length}/{MAX_SLOTS}
              </span>
            </div>
            <button onClick={onClose} style={{
              background: catColor, border: 'none', color: '#000',
              padding: '8px 20px', cursor: 'pointer',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>DONE</button>
          </div>
        </div>

        {/* Scrollable exercise list */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {exercises.map((ex, idx) => {
            const selected = !!slots.find(s => s.id === ex.id);
            const isDisabled = full && !selected;
            return (
              <button
                key={ex.id}
                onClick={() => { if (!isDisabled) onToggle(ex); }}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 20px',
                  background: selected ? catColor + '15' : 'transparent',
                  border: 'none',
                  borderBottom: `1px solid ${Z.border}`,
                  color: isDisabled ? Z.border2 : Z.text,
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: 15,
                  textAlign: 'left',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.4 : 1,
                }}
              >
                <div style={{
                  width: 22, height: 22, flexShrink: 0, borderRadius: 4,
                  border: `2px solid ${selected ? catColor : Z.border2}`,
                  background: selected ? catColor : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}>
                  {selected && (
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1.5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span>{ex.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Workout Player (fullscreen) ─────────────────────────────────────────────

function WorkoutPlayer({ exercises, intensity, onFinish, onSaveTemplate, categoryLabel, parentKey, user }) {
  const toast = useToast();
  const startTime = useRef(Date.now());
  const [exIdx, setExIdx] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [resting, setResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [done, setDone] = useState(false);
  const [completedSets, setCompletedSets] = useState({}); // { exId: setsCompleted }
  const timerRef = useRef(null);

  const ex = exercises[exIdx];
  const display = applyIntensity(ex, intensity);
  const cat = ALL_CATEGORIES.find(c => c.exercises.some(e => e.id === ex?.id));
  const totalExercises = exercises.length;
  const progress = ((exIdx + (currentSet - 1) / display?.sets) / totalExercises) * 100;

  // Rest countdown
  useEffect(() => {
    if (!resting) return;
    timerRef.current = setInterval(() => {
      setRestTime(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setResting(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [resting]);

  const completeSet = () => {
    const key = ex.id;
    const newCount = (completedSets[key] || 0) + 1;
    setCompletedSets(prev => ({ ...prev, [key]: newCount }));

    if (currentSet < display.sets) {
      // More sets — start rest timer
      setCurrentSet(currentSet + 1);
      setRestTime(display.rest);
      setResting(true);
    } else {
      // Exercise done — move to next
      if (exIdx < totalExercises - 1) {
        setExIdx(exIdx + 1);
        setCurrentSet(1);
        setRestTime(display.rest);
        setResting(true);
      } else {
        setDone(true);
      }
    }
  };

  const skipRest = () => {
    clearInterval(timerRef.current);
    setResting(false);
    setRestTime(0);
  };

  const skipExercise = () => {
    if (exIdx < totalExercises - 1) {
      setExIdx(exIdx + 1);
      setCurrentSet(1);
      setResting(false);
      setRestTime(0);
    } else {
      setDone(true);
    }
  };

  const labelSm = {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
  };

  // Auto-save workout completion to Firestore
  const savedRef = useRef(false);
  useEffect(() => {
    if (!done || savedRef.current) return;
    savedRef.current = true;
    const totalSets = Object.values(completedSets).reduce((a, b) => a + b, 0);
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    if (user?.uid) {
      addDoc(collection(db, 'coaches', user.uid, 'workoutLogs'), {
        name: categoryLabel ? `${categoryLabel} Workout` : 'Workout',
        spec: categoryLabel || '',
        exercises: exercises.map(ex => ({ id: ex.id, name: ex.name })),
        completedSets,
        totalSets,
        totalExercises: exercises.length,
        intensity: intensity || 'standard',
        duration,
        date: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp(),
      }).then(() => {
        toast.success('Workout saved to log');
      });
    }
  }, [done]);

  // ─── Done screen ───
  if (done) {
    const totalSets = Object.values(completedSets).reduce((a, b) => a + b, 0);
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 400,
        background: Z.bg,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, color: '#00d966',
          letterSpacing: 2, marginBottom: 8,
        }}>DONE</div>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14,
          color: Z.subtle, letterSpacing: '0.1em', textTransform: 'uppercase',
          marginBottom: 32,
        }}>
          {totalExercises} exercises · {totalSets} sets completed
        </div>

        {/* Exercise summary */}
        <div style={{ width: '100%', maxWidth: 360, marginBottom: 32 }}>
          {exercises.map((ex, i) => {
            const d = applyIntensity(ex, intensity);
            const sets = completedSets[ex.id] || 0;
            const exCat = ALL_CATEGORIES.find(c => c.exercises.some(e => e.id === ex.id));
            return (
              <div key={ex.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 0',
                borderBottom: i < exercises.length - 1 ? `1px solid ${Z.border}` : 'none',
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 12,
                  background: sets > 0 ? '#00d966' : Z.border2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {sets > 0 ? (
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1.5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <span style={{ fontSize: 10, color: Z.muted }}>—</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 600, color: Z.text }}>{d.name}</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: Z.muted }}>
                    {sets}/{d.sets} sets
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={() => {
          if (onSaveTemplate) {
            onSaveTemplate({
              name: categoryLabel ? `${categoryLabel} - ${new Date().toLocaleDateString()}` : `Workout ${new Date().toLocaleDateString()}`,
              tab: parentKey || 'mixed',
              spec: categoryLabel || '',
              exercises,
            });
            toast.success('Workout saved as template');
          }
        }} style={{
          width: '100%', maxWidth: 360, padding: '14px',
          background: Z.card2, border: `1px solid ${Z.border2}`, color: Z.textSub,
          fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
          marginBottom: 8,
        }}>SAVE AS TEMPLATE</button>

        <button onClick={onFinish} style={{
          width: '100%', maxWidth: 360, padding: '14px',
          background: '#00d966', border: 'none', color: '#000',
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 2,
          cursor: 'pointer',
        }}>FINISH</button>
      </div>
    );
  }

  // ─── Active workout screen ───
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 400,
      background: Z.bg,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Progress bar */}
      <div style={{ height: 3, background: Z.border }}>
        <div style={{
          height: '100%', background: '#00d966',
          width: `${Math.min(progress, 100)}%`,
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 20px',
        borderBottom: `1px solid ${Z.border}`,
      }}>
        <button onClick={onFinish} style={{
          background: 'none', border: 'none', color: Z.subtle,
          fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12,
          letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
        }}>END WORKOUT</button>
        <div style={{ ...labelSm, color: Z.muted }}>
          {exIdx + 1} / {totalExercises}
        </div>
      </div>

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>

        {resting ? (
          /* ── Rest Screen ── */
          <>
            <div style={{ ...labelSm, color: Z.muted, marginBottom: 8 }}>REST</div>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(80px, 22vw, 120px)',
              color: '#00d966', letterSpacing: 2, lineHeight: 1,
              textShadow: '0 0 60px rgba(0,217,102,0.3)',
            }}>
              {fmtTimer(restTime)}
            </div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13,
              color: Z.subtle, marginTop: 12, letterSpacing: '0.08em',
            }}>
              Next: Set {currentSet} of {display.sets}
            </div>
            <button onClick={skipRest} style={{
              marginTop: 32, padding: '14px 40px',
              background: Z.card2, border: `1px solid ${Z.border2}`,
              color: Z.textSub,
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
            }}>SKIP REST</button>
          </>
        ) : (
          /* ── Exercise Screen ── */
          <>
            {cat && (
              <div style={{
                ...labelSm, color: cat.color, marginBottom: 6,
              }}>{cat.label}</div>
            )}
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(32px, 9vw, 44px)',
              color: Z.text, letterSpacing: 1, lineHeight: 1.1,
              textAlign: 'center', marginBottom: 20,
            }}>
              {display.name}
            </div>

            {/* Stats */}
            <div style={{
              display: 'flex', gap: 8, marginBottom: 24,
            }}>
              {[
                { label: 'SET', val: `${currentSet}/${display.sets}` },
                { label: 'WORK', val: fmtReps(display) },
                { label: 'REST', val: fmtRest(display.rest) },
                display.weight && { label: 'LOAD', val: display.weight },
              ].filter(Boolean).map(s => (
                <div key={s.label} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  background: Z.card, border: `1px solid ${Z.border}`,
                  padding: '8px 14px', minWidth: 56,
                }}>
                  <span style={{ ...labelSm, fontSize: 9, color: Z.muted, marginBottom: 2 }}>{s.label}</span>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 700, color: Z.text }}>{s.val}</span>
                </div>
              ))}
            </div>

            {/* Coaching cue */}
            <div style={{
              background: Z.card, border: `1px solid ${Z.border}`,
              padding: '14px 18px', maxWidth: 340, textAlign: 'center',
              marginBottom: 32,
            }}>
              <div style={{ ...labelSm, color: Z.muted, marginBottom: 4 }}>COACHING CUE</div>
              <div style={{
                fontFamily: "'Barlow', sans-serif", fontSize: 14, color: Z.textSub,
                lineHeight: 1.5,
              }}>{display.cue}</div>
            </div>

            {/* Complete set button */}
            <button onClick={completeSet} style={{
              width: '100%', maxWidth: 340, padding: '18px',
              background: '#00d966', border: 'none', color: '#000',
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 2,
              cursor: 'pointer',
            }}>
              {currentSet < display.sets ? 'COMPLETE SET' : exIdx < totalExercises - 1 ? 'NEXT EXERCISE' : 'FINISH WORKOUT'}
            </button>

            <button onClick={skipExercise} style={{
              marginTop: 12,
              background: 'none', border: 'none', color: Z.muted,
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: 'pointer', textDecoration: 'underline',
            }}>SKIP EXERCISE</button>
          </>
        )}
      </div>

      {/* Bottom exercise list (mini) */}
      <div style={{
        display: 'flex', gap: 4, padding: '12px 20px',
        borderTop: `1px solid ${Z.border}`,
        overflowX: 'auto',
      }}>
        {exercises.map((e, i) => {
          const isDone = (completedSets[e.id] || 0) >= applyIntensity(e, intensity).sets;
          const isCurrent = i === exIdx;
          return (
            <div key={e.id} onClick={() => { if (!resting) { setExIdx(i); setCurrentSet(1); } }} style={{
              width: 28, height: 28, flexShrink: 0,
              background: isDone ? '#00d966' : isCurrent ? Z.card2 : Z.card,
              border: `1px solid ${isCurrent ? '#00d966' : isDone ? '#00d966' : Z.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700,
              color: isDone ? '#000' : isCurrent ? Z.text : Z.muted,
              cursor: resting ? 'default' : 'pointer',
              borderRadius: 4,
            }}>
              {isDone ? '\u2713' : i + 1}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TrackMatrix({ onSaveTemplate, user }) {
  const toast = useToast();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showSave, setShowSave] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [showExSheet, setShowExSheet] = useState(false);
  const [workoutActive, setWorkoutActive] = useState(false);

  const { parentKey, categoryId, slots, intensity } = state;
  const activeCat = ALL_CATEGORIES.find(c => c.id === categoryId) || null;
  const exercises = activeCat?.exercises ?? [];
  const categoryLabel = activeCat?.label ?? null;
  const parentGroup = PARENT_GROUPS.find(g => g.key === parentKey) || null;

  const performAction = useCallback((type, payload = {}) => dispatch({ type, payload }), []);

  const labelSm = {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
  };

  // Exercise count from current category
  const selectedFromCat = exercises.filter(ex => slots.find(s => s.id === ex.id)).length;

  const exercisePlaceholder = !categoryId
    ? '— Choose a category first —'
    : selectedFromCat > 0
      ? `${slots.length} exercise${slots.length !== 1 ? 's' : ''} selected`
      : '— Tap to select exercises —';

  // ─── Workout Player ───
  if (workoutActive) {
    return (
      <WorkoutPlayer
        exercises={slots.map(ex => applyIntensity(ex, intensity) ? ex : ex)}
        intensity={intensity}
        onFinish={() => setWorkoutActive(false)}
        onSaveTemplate={onSaveTemplate}
        categoryLabel={categoryLabel}
        parentKey={parentKey}
        user={user}
      />
    );
  }

  return (
    <div style={{ background: Z.bg, minHeight: '100dvh', paddingBottom: 90 }}>

      {/* ── Header ── */}
      <div style={{
        padding: '52px 20px 18px',
        borderBottom: `1px solid ${Z.border}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ ...labelSm, color: Z.muted, marginBottom: 4 }}>FIRSTSTEP · COACH</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, letterSpacing: 1, color: Z.text, lineHeight: 1 }}>
              TRACK MATRIX
            </div>
          </div>
          <button onClick={() => { if (slots.length > 0) setShowSave(true); }} style={{
            background: slots.length > 0 ? Z.card2 : Z.bg,
            border: `1px solid ${slots.length > 0 ? Z.border2 : Z.border}`,
            color: slots.length > 0 ? Z.textSub : Z.border2,
            padding: '9px 16px', cursor: slots.length > 0 ? 'pointer' : 'not-allowed',
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: '0.14em',
          }}>SAVE</button>
        </div>

        <div style={{
          fontFamily: "'Barlow', sans-serif", fontSize: 12, color: Z.subtle,
          lineHeight: 1.5, marginTop: 10, maxWidth: 480,
        }}>
          Choose a type, category, then pick your exercises.
          Selected exercises appear below — up to {MAX_SLOTS} total.
        </div>
      </div>

      <div style={{ padding: '0 20px', maxWidth: 700, margin: '0 auto' }}>

        {/* ── Dropdown 1: Type ── */}
        <div style={{ ...labelSm, color: Z.subtle, marginTop: 20, marginBottom: 8 }}>
          TYPE
        </div>
        <select
          value={parentKey}
          onChange={e => performAction('SET_PARENT', { key: e.target.value })}
          style={{
            ...selectStyle,
            borderColor: parentGroup ? parentGroup.color + '66' : Z.border2,
            marginBottom: 12,
          }}
        >
          <option value="">— Select type —</option>
          {PARENT_GROUPS.map(g => (
            <option key={g.key} value={g.key}>{g.label}</option>
          ))}
        </select>

        {/* ── Dropdown 2: Category ── */}
        <div style={{ ...labelSm, color: Z.subtle, marginBottom: 8 }}>
          CATEGORY
        </div>
        <select
          value={categoryId}
          onChange={e => performAction('SET_CATEGORY', { id: e.target.value })}
          disabled={!parentKey}
          style={{
            ...selectStyle,
            borderColor: activeCat ? activeCat.color + '66' : Z.border2,
            marginBottom: 12,
            opacity: parentKey ? 1 : 0.5,
            cursor: parentKey ? 'pointer' : 'not-allowed',
          }}
        >
          <option value="">{parentKey ? '— Select category —' : '— Choose a type first —'}</option>
          {parentGroup && parentGroup.categories.map(c => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>

        {/* ── Dropdown 3: Exercises (button that opens bottom sheet) ── */}
        <div style={{ ...labelSm, color: Z.subtle, marginBottom: 8 }}>
          EXERCISES
        </div>
        <button
          onClick={() => { if (categoryId) setShowExSheet(true); }}
          disabled={!categoryId}
          style={{
            ...selectStyle,
            textAlign: 'left',
            cursor: !categoryId ? 'not-allowed' : 'pointer',
            opacity: !categoryId ? 0.5 : 1,
            borderColor: slots.length > 0 ? (activeCat?.color || Z.border2) + '66' : Z.border2,
            color: slots.length > 0 ? Z.text : Z.subtle,
            marginBottom: 0,
          }}
        >
          {exercisePlaceholder}
        </button>

        {/* Bottom sheet */}
        {showExSheet && (
          <ExerciseSheet
            exercises={exercises}
            slots={slots}
            catColor={activeCat?.color || Z.border2}
            onToggle={ex => performAction('TOGGLE_EXERCISE', { exercise: ex })}
            onClose={() => setShowExSheet(false)}
          />
        )}

        {/* ── Selected exercise pills ── */}
        {slots.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
            {slots.map((ex) => {
              const cat = ALL_CATEGORIES.find(c => c.exercises.some(e => e.id === ex.id));
              return (
                <div key={ex.id} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 10px 7px 14px',
                  background: (cat?.color || Z.border2) + '22',
                  border: `1px solid ${(cat?.color || Z.border2) + '55'}`,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 13, fontWeight: 600, color: Z.text,
                  letterSpacing: '0.02em',
                }}>
                  {ex.name}
                  <button onClick={() => performAction('TOGGLE_EXERCISE', { exercise: ex })} style={{
                    background: 'none', border: 'none', color: Z.subtle,
                    cursor: 'pointer', fontSize: 14, padding: '0 2px', lineHeight: 1,
                  }}>{'\u2715'}</button>
                </div>
              );
            })}
            <button onClick={() => performAction('CLEAR_ALL')} style={{
              padding: '7px 14px',
              background: 'transparent',
              border: `1px dashed ${Z.border2}`,
              color: Z.muted,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: 'pointer',
            }}>CLEAR ALL</button>
          </div>
        )}

        {/* ── AI Chip bar ── */}
        {slots.length > 0 && (
          <div style={{
            display: 'flex', gap: 6, flexWrap: 'wrap',
            padding: '14px 16px',
            background: Z.card, border: `1px solid ${Z.border}`,
            marginTop: 20, marginBottom: 16, alignItems: 'center',
          }}>
            <div style={{ ...labelSm, color: Z.muted, width: '100%', marginBottom: 4 }}>AI CHIPS</div>
            {Object.entries(CHIPS).map(([key, chip]) => {
              if (key === 'randomize' && !activeCat) return null;
              const isActive = chip.toggle && intensity === (key === 'light' ? 'light' : 'hard');
              const isOtherActive = chip.toggle && !isActive && (
                (key === 'light' && intensity === 'hard') || (key === 'hard' && intensity === 'light')
              );
              return (
                <button key={key} onClick={() => performAction(chip.action)} disabled={isOtherActive} style={{
                  padding: '8px 16px',
                  background: isActive ? chip.color : Z.card2,
                  border: `1px solid ${isActive ? chip.color : Z.border2}`,
                  color: isActive ? '#000' : isOtherActive ? Z.border : Z.textSub,
                  cursor: isOtherActive ? 'not-allowed' : 'pointer',
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: isActive ? 700 : 400,
                  letterSpacing: '0.1em', transition: 'all 0.15s', opacity: isOtherActive ? 0.35 : 1,
                }}>
                  {chip.label}{chip.toggle && isActive && ' \u2713'}
                </button>
              );
            })}
            {intensity && (
              <div style={{ ...labelSm, color: intensity === 'light' ? '#10b981' : '#f43f5e', marginLeft: 4 }}>
                {intensity === 'light' ? '-1 set \u00B7 +30s rest' : '+1 set \u00B7 -20s rest \u00B7 -1 rep'}
              </div>
            )}
          </div>
        )}

        {/* ── Workout Slots Grid ── */}
        {slots.length > 0 && (
          <>
            <div style={{ ...labelSm, color: Z.subtle, marginBottom: 10 }}>
              YOUR WORKOUT — {slots.length} EXERCISE{slots.length !== 1 ? 'S' : ''}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
              {slots.map((ex, i) => {
                const display = applyIntensity(ex, intensity);
                const cat = ALL_CATEGORIES.find(c => c.exercises.some(e => e.id === ex.id));
                return (
                  <div key={ex.id} style={{
                    background: Z.card, border: `1px solid ${Z.border}`, borderTop: `2px solid ${cat?.color || Z.border2}`,
                    padding: '12px 14px', position: 'relative',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div style={{ ...labelSm, color: Z.muted }}>{i + 1}</div>
                      {cat && <div style={{ ...labelSm, fontSize: 8, color: cat.color }}>{cat.label}</div>}
                    </div>
                    <div style={{
                      fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: '0.04em',
                      color: Z.text, lineHeight: 1.1, marginBottom: 8,
                    }}>{display.name}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                      {[
                        { label: 'SETS', val: display.sets },
                        { label: 'WORK', val: fmtReps(display) },
                        { label: 'REST', val: fmtRest(display.rest) },
                        display.weight && { label: 'LOAD', val: display.weight },
                      ].filter(Boolean).map(s => (
                        <div key={s.label} style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center',
                          background: Z.bg, border: `1px solid ${Z.border}`, padding: '4px 8px', minWidth: 42,
                        }}>
                          <span style={{ ...labelSm, fontSize: 8, color: Z.muted }}>{s.label}</span>
                          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, color: Z.text }}>{s.val}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 11, color: Z.subtle, lineHeight: 1.4 }}>
                      {display.cue}
                    </div>
                    <button onClick={() => performAction('REMOVE_SLOT', { index: i })} style={{
                      position: 'absolute', top: 10, right: 10,
                      background: 'none', border: `1px solid ${Z.border}`, color: Z.muted,
                      padding: '2px 7px', cursor: 'pointer', fontSize: 11,
                    }}>{'\u2715'}</button>
                  </div>
                );
              })}
            </div>

            {/* ── Start Workout Button ── */}
            <button onClick={() => setWorkoutActive(true)} style={{
              width: '100%', padding: '16px', marginTop: 16,
              background: '#00d966', border: 'none', color: '#000',
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 2,
              cursor: 'pointer',
            }}>
              START WORKOUT
            </button>
          </>
        )}

        {/* Empty state */}
        {slots.length === 0 && (
          <div style={{
            padding: '48px 16px', textAlign: 'center',
            background: Z.card, border: `1px dashed ${Z.border}`,
            marginTop: 20,
          }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: Z.border2, marginBottom: 8 }}>
              BUILD YOUR WORKOUT
            </div>
            <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: Z.muted, maxWidth: 280, margin: '0 auto', lineHeight: 1.5 }}>
              {!parentKey
                ? 'Select a type above to get started.'
                : !categoryId
                  ? 'Now pick a category.'
                  : 'Open the exercises dropdown and select what you want.'}
            </div>
          </div>
        )}
      </div>

      {/* ── Save Template Modal ── */}
      {showSave && (
        <div onClick={() => setShowSave(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: 24,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: Z.card, border: `1px solid ${Z.border2}`,
            padding: '24px 20px', width: '100%', maxWidth: 380,
          }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: Z.text, letterSpacing: 0.5, marginBottom: 14 }}>
              SAVE WORKOUT TEMPLATE
            </div>
            <div style={{ ...labelSm, color: Z.muted, marginBottom: 6 }}>TEMPLATE NAME</div>
            <input autoFocus value={templateName} onChange={e => setTemplateName(e.target.value)}
              placeholder="e.g. Monday Sprint Day"
              style={{
                width: '100%', padding: '12px 14px', boxSizing: 'border-box',
                background: Z.bg, border: `1px solid ${Z.border2}`,
                color: Z.text, fontSize: 14, outline: 'none',
                fontFamily: "'Barlow', sans-serif", marginBottom: 14,
              }}
            />
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: Z.muted, marginBottom: 14 }}>
              {slots.length} exercises
            </div>
            <button onClick={() => {
              if (!templateName.trim()) return;
              if (onSaveTemplate) onSaveTemplate({ name: templateName.trim(), tab: parentKey || 'mixed', spec: categoryLabel || '', exercises: slots });
              toast.success(`"${templateName.trim()}" saved as template`);
              setShowSave(false);
              setTemplateName('');
            }} disabled={!templateName.trim()} style={{
              width: '100%', padding: '12px', background: !templateName.trim() ? Z.border : '#00d966',
              border: 'none', color: !templateName.trim() ? Z.muted : '#000',
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              cursor: templateName.trim() ? 'pointer' : 'not-allowed',
            }}>SAVE TEMPLATE</button>
            <button onClick={() => setShowSave(false)} style={{
              width: '100%', padding: '10px', marginTop: 6, background: 'transparent',
              border: `1px solid ${Z.border}`, color: Z.textSub,
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, letterSpacing: '0.1em',
              textTransform: 'uppercase', cursor: 'pointer',
            }}>CANCEL</button>
          </div>
        </div>
      )}
    </div>
  );
}
