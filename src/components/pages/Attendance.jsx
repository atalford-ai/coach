import React, { useState } from 'react';
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useToast } from '../shared/Toast';

export default function Attendance({ theme, user, athletes, groups, attendance }) {
  const toast = useToast();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [present, setPresent] = useState([]);
  const [saving, setSaving] = useState(false);
  const [filterGroup, setFilterGroup] = useState('');
  const [viewMode, setViewMode] = useState('check'); // 'check' | 'history'

  const groupList = groups || [];
  const records = attendance || [];

  // Check if attendance already exists for this date
  const existingRecord = records.find(r => r.date === date);

  // Initialize present list from existing record
  useState(() => {
    if (existingRecord) {
      setPresent(existingRecord.present || []);
    }
  });

  const filtered = filterGroup
    ? athletes.filter(a => a.groupId === filterGroup)
    : athletes;

  const toggleAthlete = (id) => {
    setPresent(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAll = () => setPresent(filtered.map(a => a.id));
  const selectNone = () => setPresent([]);

  const save = async () => {
    setSaving(true);
    // If record already exists for date, delete it first
    if (existingRecord) {
      await deleteDoc(doc(db, 'coaches', user.uid, 'attendance', existingRecord.id));
    }
    await addDoc(collection(db, 'coaches', user.uid, 'attendance'), {
      date,
      present,
      total: athletes.length,
      createdAt: serverTimestamp(),
    });
    toast.success(`Attendance saved — ${present.length}/${athletes.length} present`);
    setSaving(false);
  };

  const getGroup = (id) => groupList.find(g => g.id === id);

  // History stats
  const last7 = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    const rec = records.find(r => r.date === ds);
    last7.push({ date: ds, day: d.toLocaleDateString('en-US', { weekday: 'short' }), record: rec });
  }

  const sectionLbl = {
    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10,
    letterSpacing: '0.16em', textTransform: 'uppercase', color: theme.g500,
    marginBottom: 8,
  };

  return (
    <div style={{ padding: '0 0 80px', maxWidth: 560, margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        padding: '44px 20px 14px', borderBottom: `1px solid ${theme.g700}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 1, color: theme.white, lineHeight: 1 }}>ATTENDANCE</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: '0.16em', color: theme.g500, marginTop: 3 }}>
            TRACK WHO SHOWED UP
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[['check', 'CHECK IN'], ['history', 'HISTORY']].map(([id, label]) => (
            <button key={id} onClick={() => setViewMode(id)} style={{
              padding: '8px 14px', background: viewMode === id ? theme.accent : 'transparent',
              border: `1px solid ${viewMode === id ? theme.accent : theme.g700}`,
              color: viewMode === id ? '#000' : theme.g300,
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
            }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>

        {viewMode === 'check' && (
          <>
            {/* Date picker */}
            <div style={{ marginTop: 14, marginBottom: 14 }}>
              <div style={sectionLbl}>DATE</div>
              <input
                type="date"
                value={date}
                onChange={e => {
                  setDate(e.target.value);
                  const rec = records.find(r => r.date === e.target.value);
                  setPresent(rec ? rec.present || [] : []);
                }}
                style={{
                  width: '100%', padding: '12px 14px', boxSizing: 'border-box',
                  background: theme.g800, border: `1px solid ${theme.g700}`,
                  color: theme.white, fontSize: 14, outline: 'none',
                  fontFamily: "'Barlow', sans-serif",
                }}
              />
            </div>

            {existingRecord && (
              <div style={{
                padding: '8px 12px', marginBottom: 12,
                background: theme.accent + '15', border: `1px solid ${theme.accentD}`,
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: theme.accent,
                letterSpacing: '0.06em',
              }}>
                {'\u2713'} Attendance already recorded for this date — editing
              </div>
            )}

            {/* Quick actions */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <button onClick={selectAll} style={{
                padding: '7px 14px', background: 'transparent', border: `1px solid ${theme.g700}`,
                color: theme.g300, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10,
                fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
              }}>SELECT ALL</button>
              <button onClick={selectNone} style={{
                padding: '7px 14px', background: 'transparent', border: `1px solid ${theme.g700}`,
                color: theme.g300, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10,
                fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
              }}>CLEAR</button>
              <div style={{ flex: 1 }} />
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: theme.accent,
                alignSelf: 'center',
              }}>
                {present.length}/{athletes.length}
              </div>
            </div>

            {/* Group filter */}
            {groupList.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                <button onClick={() => setFilterGroup('')} style={{
                  padding: '5px 10px', background: !filterGroup ? theme.g700 : 'transparent',
                  border: `1px solid ${theme.g700}`, color: !filterGroup ? theme.white : theme.g500,
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.1em', cursor: 'pointer', textTransform: 'uppercase',
                }}>ALL</button>
                {groupList.map(g => (
                  <button key={g.id} onClick={() => setFilterGroup(filterGroup === g.id ? '' : g.id)} style={{
                    padding: '5px 10px',
                    background: filterGroup === g.id ? `${g.color}20` : 'transparent',
                    border: `1px solid ${filterGroup === g.id ? g.color : theme.g700}`,
                    color: filterGroup === g.id ? g.color : theme.g500,
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700,
                    letterSpacing: '0.1em', cursor: 'pointer', textTransform: 'uppercase',
                  }}>{g.name}</button>
                ))}
              </div>
            )}

            {/* Athlete checklist */}
            <div style={{ background: theme.g900, border: `1px solid ${theme.g700}` }}>
              {filtered.map((a, i) => {
                const checked = present.includes(a.id);
                const grp = getGroup(a.groupId);
                return (
                  <button key={a.id} onClick={() => toggleAthlete(a.id)} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', background: checked ? theme.accent + '10' : 'transparent',
                    border: 'none', borderBottom: i < filtered.length - 1 ? `1px solid ${theme.g700}` : 'none',
                    cursor: 'pointer', textAlign: 'left',
                  }}>
                    <div style={{
                      width: 22, height: 22, flexShrink: 0, borderRadius: 4,
                      border: `2px solid ${checked ? theme.accent : theme.g600}`,
                      background: checked ? theme.accent : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}>
                      {checked && (
                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                          <path d="M1 5L4.5 8.5L11 1.5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    {grp && <div style={{ width: 8, height: 8, background: grp.color, flexShrink: 0 }} />}
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: theme.white, fontWeight: 600 }}>
                      {a.name}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Save button */}
            <button onClick={save} disabled={saving} style={{
              width: '100%', padding: '14px', marginTop: 14,
              background: theme.accent, border: 'none', color: '#000',
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 2,
              cursor: 'pointer', opacity: saving ? 0.7 : 1,
            }}>
              {saving ? 'SAVING...' : 'SAVE ATTENDANCE'}
            </button>
          </>
        )}

        {viewMode === 'history' && (
          <>
            {/* Last 7 days */}
            <div style={{ ...sectionLbl, marginTop: 14 }}>LAST 7 DAYS</div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
              {last7.reverse().map(d => (
                <div key={d.date} style={{
                  flex: 1, background: theme.g900, border: `1px solid ${theme.g700}`,
                  padding: '10px 4px', textAlign: 'center',
                }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: theme.g500, letterSpacing: '0.08em', marginBottom: 4 }}>
                    {d.day}
                  </div>
                  {d.record ? (
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: theme.accent, lineHeight: 1 }}>
                      {(d.record.present || []).length}
                    </div>
                  ) : (
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: theme.g600, lineHeight: 1 }}>—</div>
                  )}
                </div>
              ))}
            </div>

            {/* Full history */}
            <div style={sectionLbl}>ALL RECORDS</div>
            {records.length > 0 ? (
              <div style={{ background: theme.g900, border: `1px solid ${theme.g700}` }}>
                {[...records].sort((a, b) => (b.date || '').localeCompare(a.date || '')).map((r, i) => (
                  <div key={r.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 14px',
                    borderBottom: i < records.length - 1 ? `1px solid ${theme.g700}` : 'none',
                  }}>
                    <div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: theme.white, fontWeight: 600 }}>
                        {new Date(r.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        fontFamily: "'Bebas Neue', sans-serif", fontSize: 20,
                        color: (r.present || []).length > 0 ? theme.accent : theme.g500,
                      }}>
                        {(r.present || []).length}/{r.total || athletes.length}
                      </div>
                      <div style={{
                        width: 40, height: 4, background: theme.g700, borderRadius: 2, overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${((r.present || []).length / (r.total || athletes.length || 1)) * 100}%`,
                          height: '100%', background: theme.accent,
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '40px 16px', textAlign: 'center', background: theme.g900, border: `1px dashed ${theme.g700}` }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: theme.g600, marginBottom: 6 }}>NO RECORDS YET</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: theme.g500 }}>Start checking in athletes to build attendance history.</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
