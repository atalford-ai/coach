import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ALL_EVENTS } from '../../data/events';
import { useToast } from '../shared/Toast';

// Try to parse pasted/CSV text into rows
function parseText(raw) {
  const lines = raw.trim().split('\n').filter(l => l.trim() && !l.startsWith('#'));
  return lines.map(line => {
    const parts = line.includes('\t')
      ? line.split('\t').map(p => p.trim())
      : line.split(',').map(p => p.trim());

    // Skip obvious header rows
    if (parts[0]?.toLowerCase().includes('name') || parts[0]?.toLowerCase().includes('athlete')) return null;

    // Drop leading place number: "1. Jordan" or "1, Jordan"
    if (/^\d+\.?$/.test(parts[0])) parts.shift();

    if (parts.length < 2) return null;
    return { name: parts[0] || '', event: parts[1] || '', time: parts[2] || '', meet: parts[3] || '', date: parts[4] || '' };
  }).filter(Boolean);
}

export default function MeetImport({ theme, user, athletes }) {
  const toast = useToast();
  const [mode,      setMode]      = useState('paste');  // 'paste' | 'image'
  const [raw,       setRaw]       = useState('');
  const [imageUrl,  setImageUrl]  = useState(null);
  const [rows,      setRows]      = useState([]);       // parsed/manual rows
  const [meetName,  setMeetName]  = useState('');
  const [meetDate,  setMeetDate]  = useState('');
  const [saving,    setSaving]    = useState(false);
  const [savedCount,setSavedCount]= useState(0);

  const lbl = { display: 'block', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: theme.g500, marginBottom: 6 };
  const inp = { width: '100%', padding: '10px 12px', boxSizing: 'border-box', background: theme.g800, border: `1px solid ${theme.g700}`, color: theme.white, fontSize: 13, outline: 'none', fontFamily: "'Barlow', sans-serif" };
  const sectionLbl = { fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: theme.g500, borderBottom: `1px solid ${theme.g700}`, paddingBottom: 8, marginBottom: 14 };

  const parse = () => {
    const parsed = parseText(raw);
    setRows(parsed.map(r => ({
      ...r,
      athleteId: matchAthlete(r.name, athletes),
    })));
  };

  const addRow = () => {
    setRows(prev => [...prev, { name: '', event: '100m', time: '', meet: '', date: '', athleteId: '' }]);
  };

  const updateRow = (i, field, val) => {
    setRows(prev => prev.map((r, idx) => idx !== i ? r : {
      ...r,
      [field]: val,
      ...(field === 'name' ? { athleteId: matchAthlete(val, athletes) } : {}),
    }));
  };

  const removeRow = (i) => setRows(prev => prev.filter((_, idx) => idx !== i));

  const saveAll = async () => {
    const valid = rows.filter(r => r.time && (r.athleteId || r.name));
    if (!valid.length) return;
    setSaving(true);
    for (const r of valid) {
      const athlete = athletes.find(a => a.id === r.athleteId);
      await addDoc(collection(db, 'coaches', user.uid, 'times'), {
        athleteId:   r.athleteId || null,
        athleteName: athlete?.name || r.name,
        event:       r.event,
        time:        r.time,
        meet:        meetName || r.meet,
        date:        meetDate || r.date,
        source:      'meet_import',
        createdAt:   serverTimestamp(),
      });
    }
    setSaving(false);
    setSavedCount(valid.length);
    toast.success(`${valid.length} result${valid.length !== 1 ? 's' : ''} imported`);
    setRows([]);
    setRaw('');
    setImageUrl(null);
  };

  return (
    <div style={{ padding: '0 0 80px', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ padding: '52px 20px 16px', borderBottom: `1px solid ${theme.g700}` }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: 1, color: theme.white }}>MEET IMPORT</div>
        <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: theme.g500, lineHeight: 1.5, marginTop: 6, maxWidth: 400 }}>
          Paste meet results or add rows manually. The app will match names to your roster automatically. Review, edit, and save all at once.
        </div>
      </div>

      <div style={{ padding: '20px 20px 0' }}>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[['paste', 'Paste / CSV'], ['image', 'Image']].map(([id, label]) => (
            <button key={id} onClick={() => { setMode(id); setRows([]); }} style={{ padding: '9px 18px', background: mode === id ? theme.accent : 'transparent', border: `1px solid ${mode === id ? theme.accent : theme.g700}`, color: mode === id ? '#000' : theme.g300, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Meet info */}
        <div style={sectionLbl}>Meet Info</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
          <div>
            <label style={lbl}>Meet Name</label>
            <input style={inp} placeholder="State Championships" value={meetName} onChange={e => setMeetName(e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Date</label>
            <input style={inp} type="date" value={meetDate} onChange={e => setMeetDate(e.target.value)} />
          </div>
        </div>

        {/* Paste mode */}
        {mode === 'paste' && (
          <>
            <div style={sectionLbl}>Paste Results</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: theme.g500, marginBottom: 8 }}>
              Format: Name, Event, Time [, Meet, Date] — one athlete per line
            </div>
            <textarea
              style={{ ...inp, height: 140, resize: 'vertical', marginBottom: 10 }}
              placeholder={'Jordan Miles, 100m, 10.54\nAlex Chen, 200m, 21.89\nSam Taylor, Long Jump, 22\'6"'}
              value={raw}
              onChange={e => setRaw(e.target.value)}
            />
            <button onClick={parse} style={{ padding: '10px 20px', background: theme.accent, border: 'none', color: '#000', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', marginBottom: 20 }}>
              PARSE →
            </button>
          </>
        )}

        {/* Image mode */}
        {mode === 'image' && (
          <>
            <div style={sectionLbl}>Upload Result Sheet</div>
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '32px', background: theme.g900, border: `2px dashed ${theme.g700}`,
              cursor: 'pointer', marginBottom: 16,
            }}>
              <span style={{ fontSize: 32, marginBottom: 8 }}>📄</span>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: theme.g500, textAlign: 'center' }}>
                {imageUrl ? 'Tap to change image' : 'Tap to upload result sheet image'}
              </span>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                const f = e.target.files[0];
                if (f) { const url = URL.createObjectURL(f); setImageUrl(url); }
              }} />
            </label>
            {imageUrl && (
              <img src={imageUrl} alt="Result sheet" style={{ width: '100%', marginBottom: 16, border: `1px solid ${theme.g700}` }} />
            )}
          </>
        )}

        {/* Results table */}
        {rows.length > 0 && (
          <>
            <div style={{ ...sectionLbl, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 'none', paddingBottom: 0, marginBottom: 8 }}>
              <span style={sectionLbl}>Results ({rows.length})</span>
            </div>
            {rows.map((row, i) => <ResultRow key={i} row={row} i={i} athletes={athletes} theme={theme} inp={inp} lbl={lbl} onChange={updateRow} onRemove={removeRow} />)}
          </>
        )}

        {/* Add row button (always shown in image mode, or after parsing) */}
        {(mode === 'image' || rows.length > 0) && (
          <button onClick={addRow} style={{ width: '100%', padding: '11px', background: 'transparent', border: `1px dashed ${theme.g700}`, color: theme.g500, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', marginBottom: 16 }}>
            + ADD ROW
          </button>
        )}

        {/* Save */}
        {rows.length > 0 && (
          <button onClick={saveAll} disabled={saving} style={{ width: '100%', padding: '14px', background: theme.accent, border: 'none', color: '#000', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'SAVING...' : `SAVE ${rows.filter(r => r.time).length} RESULTS`}
          </button>
        )}

        {savedCount > 0 && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: `${theme.accent}15`, border: `1px solid ${theme.accentD}`, color: theme.accent, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, letterSpacing: '0.06em' }}>
            ✓ {savedCount} result{savedCount !== 1 ? 's' : ''} saved
          </div>
        )}
      </div>
    </div>
  );
}

function ResultRow({ row, i, athletes, theme, inp, lbl, onChange, onRemove }) {
  const matched = athletes.find(a => a.id === row.athleteId);
  return (
    <div style={{ background: theme.g900, border: `1px solid ${matched ? theme.accentD : theme.g700}`, padding: '12px 14px', marginBottom: 6, position: 'relative' }}>
      <button onClick={() => onRemove(i)} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', color: theme.g500, cursor: 'pointer', fontSize: 14 }}>✕</button>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <div>
          <label style={lbl}>Athlete Name</label>
          <input style={inp} value={row.name} onChange={e => onChange(i, 'name', e.target.value)} placeholder="Name" />
          {matched && <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: theme.accent, marginTop: 3 }}>✓ {matched.name}</div>}
          {!matched && row.name && <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: theme.g500, marginTop: 3 }}>Not on roster — will save as entered</div>}
        </div>
        <div>
          <label style={lbl}>Roster Match</label>
          <select style={inp} value={row.athleteId} onChange={e => onChange(i, 'athleteId', e.target.value)}>
            <option value="">— Manual —</option>
            {athletes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <label style={lbl}>Event</label>
          <select style={inp} value={row.event} onChange={e => onChange(i, 'event', e.target.value)}>
            {ALL_EVENTS.map(ev => <option key={ev} value={ev}>{ev}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Time / Mark</label>
          <input style={inp} value={row.time} onChange={e => onChange(i, 'time', e.target.value)} placeholder="e.g. 10.54" />
        </div>
      </div>
    </div>
  );
}

function matchAthlete(name, athletes) {
  if (!name) return '';
  const n = name.toLowerCase().trim();
  const match = athletes.find(a => a.name.toLowerCase().trim() === n);
  return match?.id || '';
}
