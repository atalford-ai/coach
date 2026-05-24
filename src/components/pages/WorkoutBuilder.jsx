import React, { useState } from 'react';
import { EXERCISE_DB, SPECIALIZATIONS, SPEC_KEYS } from '../../data/exercises';

// ── Constants ────────────────────────────────────────────
const TABS = [
  { id: 'run',          label: 'Run',          icon: '🏃' },
  { id: 'weights',      label: 'Weights',      icon: '🏋️' },
  { id: 'calisthenics', label: 'Calisthenics', icon: '💪' },
];

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ── Centralized Action Handler ───────────────────────────
// All mutations go through here. Future AI integration plugs in here.
function performAction(action, tabState, ctx) {
  const { slots } = tabState;
  const { exercises = [] } = ctx;

  switch (action) {
    case 'RANDOMIZE_ALL': {
      if (exercises.length < 5) return tabState;
      const shuffled = [...exercises].sort(() => Math.random() - 0.5).slice(0, 5);
      return { ...tabState, slots: shuffled.map(e => ({ ...e })) };
    }

    case 'SHUFFLE_VARIABLES': {
      return {
        ...tabState,
        slots: slots.map(s => {
          if (!s) return null;
          const hasWeight = s.weight != null;
          return {
            ...s,
            sets: randInt(2, 6),
            reps: randInt(3, 15),
            rest: pick([30, 45, 60, 75, 90, 120, 150, 180]),
            ...(hasWeight ? { weight: Math.round(s.weight * (0.75 + Math.random() * 0.5)) } : {}),
          };
        }),
      };
    }

    case 'LIGHTWORK': {
      return {
        ...tabState,
        slots: slots.map(s => {
          if (!s) return null;
          return {
            ...s,
            sets: Math.max(2, s.sets - 1),
            reps: Math.max(3, s.reps - 2),
            rest: s.rest + 30,
            ...(s.weight != null ? { weight: Math.max(0, Math.round(s.weight * 0.85)) } : {}),
          };
        }),
      };
    }

    case 'GO_HARD': {
      return {
        ...tabState,
        slots: slots.map(s => {
          if (!s) return null;
          return {
            ...s,
            sets: s.sets + 1,
            reps: s.reps + 2,
            rest: Math.max(30, s.rest - 15),
            ...(s.weight != null ? { weight: Math.round(s.weight * 1.1) } : {}),
          };
        }),
      };
    }

    case 'ADD_EXERCISE': {
      const { exercise, targetSlot } = ctx;
      const newSlots = [...slots];
      if (targetSlot != null) {
        newSlots[targetSlot] = { ...exercise };
      } else {
        const emptyIdx = newSlots.findIndex(s => s === null);
        if (emptyIdx !== -1) newSlots[emptyIdx] = { ...exercise };
      }
      return { ...tabState, slots: newSlots };
    }

    case 'REMOVE_EXERCISE': {
      const newSlots = [...slots];
      newSlots[ctx.index] = null;
      return { ...tabState, slots: newSlots };
    }

    case 'UPDATE_VARIABLE': {
      const { index, field, value } = ctx;
      const newSlots = [...slots];
      newSlots[index] = { ...newSlots[index], [field]: value };
      return { ...tabState, slots: newSlots };
    }

    case 'CLEAR_ALL': {
      return { ...tabState, slots: [null, null, null, null, null] };
    }

    default:
      return tabState;
  }
}

// ── PDF Export ────────────────────────────────────────────
function exportPDF(tab, tabState, specLabel) {
  const { slots } = tabState;
  const filled = slots.filter(Boolean);
  if (!filled.length) return;

  const rows = filled.map((s, i) => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #333;color:#ccc">${i + 1}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #333;color:#fff;font-weight:700">${s.name}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #333;color:#00d966;text-align:center">${s.sets}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #333;color:#00d966;text-align:center">${s.reps}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #333;color:#aaa;text-align:center">${s.rest}s</td>
      <td style="padding:10px 14px;border-bottom:1px solid #333;color:#aaa;text-align:center">${s.weight != null ? s.weight + ' lbs' : '—'}</td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html><html><head><title>Track Matrix — ${specLabel}</title>
    <style>body{margin:0;padding:40px;background:#111;color:#eee;font-family:Arial,Helvetica,sans-serif}
    h1{font-size:28px;margin:0 0 4px;letter-spacing:2px}h2{font-size:14px;color:#888;margin:0 0 24px;letter-spacing:3px;text-transform:uppercase}
    table{width:100%;border-collapse:collapse}th{text-align:left;padding:8px 14px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#666;border-bottom:2px solid #333}
    @media print{body{background:#fff;color:#111}th{color:#666;border-bottom:2px solid #ccc}td{color:#111!important;border-bottom:1px solid #ddd!important}}</style>
    </head><body><h1>TRACK MATRIX</h1><h2>${tab.toUpperCase()} — ${specLabel}</h2>
    <table><thead><tr><th>#</th><th>Exercise</th><th style="text-align:center">Sets</th><th style="text-align:center">Reps</th><th style="text-align:center">Rest</th><th style="text-align:center">Weight</th></tr></thead>
    <tbody>${rows}</tbody></table>
    <div style="margin-top:32px;font-size:11px;color:#555;letter-spacing:1px">FIRSTSTEP · Generated ${new Date().toLocaleDateString()}</div>
    </body></html>`;

  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  setTimeout(() => w.print(), 300);
}

// ── Slot Card ────────────────────────────────────────────
function SlotCard({ slot, index, theme, isReplaceTarget, onReplace, onRemove, onUpdate }) {
  if (!slot) {
    return (
      <div style={{
        background: '#18181b', border: '1px dashed #3f3f46',
        padding: '32px 20px', textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, color: '#27272a', lineHeight: 1 }}>{index + 1}</div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: '#52525b', letterSpacing: '0.15em', textTransform: 'uppercase' }}>EMPTY SLOT</div>
      </div>
    );
  }

  const numInput = (field, val, min = 0) => (
    <input
      type="number" min={min} value={val}
      onChange={e => onUpdate(index, field, parseInt(e.target.value) || 0)}
      style={{
        width: 50, padding: '6px 4px', textAlign: 'center',
        background: '#27272a', border: '1px solid #3f3f46', color: '#fafafa',
        fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, outline: 'none',
      }}
    />
  );

  return (
    <div style={{
      background: isReplaceTarget ? '#1a2620' : '#18181b',
      border: `1px solid ${isReplaceTarget ? theme.accent : '#3f3f46'}`,
      padding: '16px 18px', position: 'relative',
      transition: 'border-color 0.15s',
    }}>
      {/* Slot number + name */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: '#71717a', letterSpacing: '0.15em', marginBottom: 2 }}>SLOT {index + 1}</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: '#fafafa', letterSpacing: 1, lineHeight: 1.1 }}>{slot.name}</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => onReplace(index)} title="Replace" style={{ background: 'none', border: `1px solid ${isReplaceTarget ? theme.accent : '#3f3f46'}`, color: isReplaceTarget ? theme.accent : '#71717a', padding: '4px 8px', cursor: 'pointer', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: '0.1em' }}>
            {isReplaceTarget ? 'PICK ↓' : 'SWAP'}
          </button>
          <button onClick={() => onRemove(index)} title="Remove" style={{ background: 'none', border: '1px solid #3f3f46', color: '#71717a', padding: '4px 8px', cursor: 'pointer', fontSize: 12, lineHeight: 1 }}>✕</button>
        </div>
      </div>

      {/* Variables */}
      <div style={{ display: 'grid', gridTemplateColumns: slot.weight != null ? '1fr 1fr 1fr 1fr' : '1fr 1fr 1fr', gap: 8 }}>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: '#71717a', letterSpacing: '0.2em', marginBottom: 4 }}>SETS</div>
          {numInput('sets', slot.sets, 1)}
        </div>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: '#71717a', letterSpacing: '0.2em', marginBottom: 4 }}>REPS</div>
          {numInput('reps', slot.reps, 1)}
        </div>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: '#71717a', letterSpacing: '0.2em', marginBottom: 4 }}>REST</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {numInput('rest', slot.rest, 0)}
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: '#52525b' }}>s</span>
          </div>
        </div>
        {slot.weight != null && (
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: '#71717a', letterSpacing: '0.2em', marginBottom: 4 }}>LBS</div>
            {numInput('weight', slot.weight, 0)}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────
export default function WorkoutBuilder({ theme }) {
  const [activeTab, setActiveTab] = useState('run');
  const [replaceTarget, setReplaceTarget] = useState(null);

  // State per tab — switching tabs preserves data
  const [tabState, setTabState] = useState({
    run:          { spec: '', slots: [null, null, null, null, null] },
    weights:      { spec: '', slots: [null, null, null, null, null] },
    calisthenics: { spec: '', slots: [null, null, null, null, null] },
  });

  const current = tabState[activeTab];
  const specKeys = SPEC_KEYS[activeTab];
  const specLabels = SPECIALIZATIONS[activeTab];
  const exercises = current.spec ? (EXERCISE_DB[activeTab][current.spec] || []) : [];
  const filledCount = current.slots.filter(Boolean).length;
  const isFull = filledCount >= 5;
  const usedNames = new Set(current.slots.filter(Boolean).map(s => s.name));
  const specLabel = current.spec ? specLabels[specKeys.indexOf(current.spec)] : '';

  const dispatch = (action, ctx = {}) => {
    const result = performAction(action, current, { ...ctx, exercises });
    setTabState(prev => ({ ...prev, [activeTab]: result }));
  };

  const setSpec = (spec) => {
    setTabState(prev => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], spec, slots: [null, null, null, null, null] },
    }));
    setReplaceTarget(null);
  };

  const handleExerciseSelect = (exercise) => {
    if (replaceTarget != null) {
      dispatch('ADD_EXERCISE', { exercise, targetSlot: replaceTarget });
      setReplaceTarget(null);
    } else if (!isFull) {
      dispatch('ADD_EXERCISE', { exercise });
    }
  };

  const handleReplace = (index) => {
    setReplaceTarget(replaceTarget === index ? null : index);
  };

  // Styles
  const chipStyle = (active) => ({
    padding: '8px 16px', cursor: 'pointer',
    background: active ? '#27272a' : '#09090b',
    border: `1px solid ${active ? '#52525b' : '#27272a'}`,
    color: active ? '#fafafa' : '#a1a1aa',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
    transition: 'all 0.15s', whiteSpace: 'nowrap',
  });

  return (
    <div style={{ padding: '0 0 80px', maxWidth: 560, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ padding: '52px 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: 2, color: '#fafafa', lineHeight: 1 }}>TRACK MATRIX</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: '0.2em', color: '#52525b', marginTop: 4 }}>WORKOUT BUILDER</div>
        </div>
        <button
          onClick={() => filledCount > 0 && exportPDF(activeTab, current, specLabel)}
          style={{
            padding: '8px 14px', cursor: filledCount > 0 ? 'pointer' : 'not-allowed',
            background: filledCount > 0 ? '#27272a' : '#18181b',
            border: `1px solid ${filledCount > 0 ? '#52525b' : '#27272a'}`,
            color: filledCount > 0 ? '#fafafa' : '#3f3f46',
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700,
            letterSpacing: '0.14em', textTransform: 'uppercase',
          }}
        >
          PDF ↗
        </button>
      </div>

      <div style={{ padding: '0 20px' }}>

        {/* ── Category Tabs ── */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
          {TABS.map(t => {
            const active = activeTab === t.id;
            return (
              <button key={t.id} onClick={() => { setActiveTab(t.id); setReplaceTarget(null); }} style={{
                flex: 1, padding: '12px 0',
                background: active ? '#27272a' : '#09090b',
                border: active ? '1px solid #52525b' : '1px solid #27272a',
                borderBottom: active ? `2px solid ${theme.accent}` : '2px solid transparent',
                color: active ? '#fafafa' : '#71717a', cursor: 'pointer',
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                transition: 'all 0.15s',
              }}>
                <span style={{ marginRight: 6 }}>{t.icon}</span>{t.label}
              </button>
            );
          })}
        </div>

        {/* ── Specialization Dropdown ── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: '#52525b', letterSpacing: '0.18em', marginBottom: 6 }}>SELECT SPECIALIZATION</div>
          <select
            value={current.spec}
            onChange={e => setSpec(e.target.value)}
            style={{
              width: '100%', padding: '11px 14px',
              background: '#18181b', border: '1px solid #3f3f46', color: '#fafafa',
              fontFamily: "'Barlow', sans-serif", fontSize: 14, outline: 'none', cursor: 'pointer',
            }}
          >
            <option value="">— Pick a specialization —</option>
            {specKeys.map((key, i) => (
              <option key={key} value={key}>{specLabels[i]}</option>
            ))}
          </select>
        </div>

        {/* ── Exercise Dropdown ── */}
        {current.spec && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: '#52525b', letterSpacing: '0.18em' }}>
                {isFull && replaceTarget == null ? 'TAP SWAP ON A SLOT, THEN SELECT' : 'ADD EXERCISE'}
              </div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: theme.accent, letterSpacing: '0.12em' }}>
                {filledCount}/5
              </div>
            </div>
            <select
              value=""
              onChange={e => {
                const ex = exercises.find(x => x.name === e.target.value);
                if (ex) handleExerciseSelect(ex);
              }}
              disabled={isFull && replaceTarget == null}
              style={{
                width: '100%', padding: '11px 14px',
                background: (isFull && replaceTarget == null) ? '#0f0f10' : '#18181b',
                border: `1px solid ${replaceTarget != null ? theme.accent : '#3f3f46'}`,
                color: (isFull && replaceTarget == null) ? '#3f3f46' : '#fafafa',
                fontFamily: "'Barlow', sans-serif", fontSize: 14, outline: 'none',
                cursor: (isFull && replaceTarget == null) ? 'not-allowed' : 'pointer',
              }}
            >
              <option value="">— {replaceTarget != null ? `Replace Slot ${replaceTarget + 1}` : 'Select exercise'} —</option>
              {exercises.map(ex => (
                <option key={ex.name} value={ex.name} disabled={usedNames.has(ex.name)}>
                  {ex.name}{usedNames.has(ex.name) ? ' ✓' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ── 5-Slot Matrix ── */}
        <div style={{ display: 'grid', gap: 6, marginBottom: 20 }}>
          {current.slots.map((slot, i) => (
            <SlotCard
              key={i} slot={slot} index={i} theme={theme}
              isReplaceTarget={replaceTarget === i}
              onReplace={handleReplace}
              onRemove={(idx) => { dispatch('REMOVE_EXERCISE', { index: idx }); setReplaceTarget(null); }}
              onUpdate={(idx, field, val) => dispatch('UPDATE_VARIABLE', { index: idx, field, value: val })}
            />
          ))}
        </div>

        {/* ── AI Chip Control Bar ── */}
        {current.spec && (
          <div style={{
            display: 'flex', gap: 6, flexWrap: 'wrap',
            padding: '14px 0', borderTop: '1px solid #27272a', borderBottom: '1px solid #27272a',
            marginBottom: 16,
          }}>
            <button onClick={() => { dispatch('RANDOMIZE_ALL'); setReplaceTarget(null); }} style={chipStyle(false)}>🎲 Randomize All</button>
            <button onClick={() => dispatch('SHUFFLE_VARIABLES')} disabled={filledCount === 0} style={chipStyle(filledCount > 0)}>🔀 Shuffle Vars</button>
            <button onClick={() => dispatch('LIGHTWORK')} disabled={filledCount === 0} style={chipStyle(filledCount > 0)}>💤 Lightwork</button>
            <button onClick={() => dispatch('GO_HARD')} disabled={filledCount === 0} style={chipStyle(filledCount > 0)}>🔥 Go Hard</button>
            <button onClick={() => { dispatch('CLEAR_ALL'); setReplaceTarget(null); }} disabled={filledCount === 0} style={{ ...chipStyle(false), color: filledCount > 0 ? '#ef4444' : '#3f3f46', borderColor: filledCount > 0 ? '#7f1d1d' : '#27272a' }}>✕ Clear</button>
          </div>
        )}

        {/* ── No specialization selected ── */}
        {!current.spec && (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: '#27272a', lineHeight: 1, marginBottom: 8 }}>SELECT A SPECIALIZATION</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: '#3f3f46', letterSpacing: '0.08em' }}>
              Choose a focus above to load exercises.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
