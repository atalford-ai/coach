import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, deleteDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useToast } from '../shared/Toast';

export default function AthleteDetail({ athlete, theme, user, groups, times, workouts, attendance, onBack }) {
  const toast = useToast();
  const [tab, setTab] = useState('overview');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [groupId, setGroupId] = useState(athlete.groupId || '');
  const [notes, setNotes] = useState(athlete.notes || '');
  const [savedNotes, setSavedNotes] = useState(false);

  const grp = groups.find(g => g.id === groupId);

  // Athlete-specific data
  const athleteTimes = (times || []).filter(t => t.athleteId === athlete.id)
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

  const athleteAttendance = (attendance || []).filter(a => (a.present || []).includes(athlete.id));

  // PRs by event
  const prsByEvent = {};
  athleteTimes.forEach(t => {
    if (!prsByEvent[t.event] || t.time < prsByEvent[t.event].time) {
      prsByEvent[t.event] = t;
    }
  });

  // Workout completions
  const athleteWorkoutLogs = (workouts || [])
    .filter(w => w.completed)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 10);

  // Stats
  const totalTimes = athleteTimes.length;
  const totalPRs = Object.keys(prsByEvent).length;
  const attendanceCount = athleteAttendance.length;
  const last30 = athleteAttendance.filter(a => {
    const d = new Date(a.date);
    const ago = new Date(); ago.setDate(ago.getDate() - 30);
    return d >= ago;
  }).length;

  const remove = async () => {
    await deleteDoc(doc(db, 'coaches', user.uid, 'athletes', athlete.id));
    toast.success(`${athlete.name} removed from roster`);
    onBack();
  };

  const updateGroup = async (newGroupId) => {
    setGroupId(newGroupId);
    await updateDoc(doc(db, 'coaches', user.uid, 'athletes', athlete.id), { groupId: newGroupId || null });
    const g = groups.find(g => g.id === newGroupId);
    toast.success(g ? `Moved to ${g.name}` : 'Removed from group');
  };

  const saveNotes = async () => {
    await updateDoc(doc(db, 'coaches', user.uid, 'athletes', athlete.id), { notes });
    setSavedNotes(true);
    toast.success('Notes saved');
    setTimeout(() => setSavedNotes(false), 2000);
  };

  const sectionLbl = {
    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10,
    letterSpacing: '0.16em', textTransform: 'uppercase', color: theme.g500,
    marginBottom: 8,
  };
  const inp = {
    width: '100%', padding: '10px 12px', boxSizing: 'border-box',
    background: theme.g800, border: `1px solid ${theme.g700}`,
    color: theme.white, fontSize: 13, outline: 'none', fontFamily: "'Barlow', sans-serif",
  };
  const tabBtn = (id, label) => ({
    flex: 1, padding: '10px 4px', background: 'none', border: 'none',
    borderBottom: `2px solid ${tab === id ? theme.accent : 'transparent'}`,
    color: tab === id ? theme.white : theme.g500, cursor: 'pointer',
    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: tab === id ? 700 : 400,
    letterSpacing: '0.12em', textTransform: 'uppercase',
  });

  return (
    <div style={{ padding: '0 0 80px', maxWidth: 560, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ padding: '44px 20px 14px', borderBottom: `1px solid ${theme.g700}` }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', color: theme.accent,
          fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11,
          letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', padding: 0, marginBottom: 10,
        }}>{'\u2190'} ROSTER</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, background: theme.g800, border: `1px solid ${theme.g700}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: theme.accent,
          }}>
            {athlete.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 1, color: theme.white, lineHeight: 1 }}>
              {athlete.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              {grp && (
                <span style={{
                  padding: '2px 8px', background: `${grp.color}20`, border: `1px solid ${grp.color}50`,
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: grp.color, fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>{grp.name}</span>
              )}
              {athlete.email && (
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: theme.g500 }}>{athlete.email}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'flex', gap: 2, padding: '12px 16px' }}>
        {[
          { label: 'Times', val: totalTimes, color: theme.accent },
          { label: 'PRs', val: totalPRs, color: '#f59e0b' },
          { label: 'Sessions', val: attendanceCount, color: theme.g300 },
          { label: 'Last 30d', val: last30, color: theme.accent },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, background: theme.g900, border: `1px solid ${theme.g700}`, padding: '10px 8px',
          }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: s.color, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: theme.g500, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', padding: '0 16px', borderBottom: `1px solid ${theme.g700}` }}>
        {[['overview', 'Overview'], ['times', 'Times'], ['notes', 'Notes']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={tabBtn(id, label)}>{label}</button>
        ))}
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {/* ── Overview Tab ── */}
        {tab === 'overview' && (
          <>
            {/* Events */}
            {athlete.events?.length > 0 && (
              <>
                <div style={sectionLbl}>EVENTS</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 20 }}>
                  {athlete.events.map(ev => (
                    <span key={ev} style={{
                      padding: '5px 10px', background: theme.g800, border: `1px solid ${theme.accentD}`,
                      color: theme.white, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11,
                      fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                    }}>{ev}</span>
                  ))}
                </div>
              </>
            )}

            {/* Personal Records */}
            {totalPRs > 0 && (
              <>
                <div style={sectionLbl}>PERSONAL RECORDS</div>
                <div style={{ background: theme.g900, border: `1px solid ${theme.g700}`, marginBottom: 20 }}>
                  {Object.entries(prsByEvent).map(([event, pr], i) => (
                    <div key={event} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 12px',
                      borderBottom: i < Object.keys(prsByEvent).length - 1 ? `1px solid ${theme.g700}` : 'none',
                    }}>
                      <div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: theme.white, fontWeight: 600 }}>{event}</div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: theme.g500 }}>{pr.date || 'Unknown date'}</div>
                      </div>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: theme.accent, letterSpacing: 1 }}>{pr.time}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Group */}
            <div style={sectionLbl}>GROUP</div>
            <select style={{ ...inp, marginBottom: 20 }} value={groupId} onChange={e => updateGroup(e.target.value)}>
              <option value="">No group</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>

            {/* Recent attendance */}
            {athleteAttendance.length > 0 && (
              <>
                <div style={sectionLbl}>RECENT ATTENDANCE</div>
                <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 20 }}>
                  {athleteAttendance.slice(0, 20).map(a => (
                    <div key={a.id} title={a.date} style={{
                      width: 20, height: 20, background: theme.accent + '30', border: `1px solid ${theme.accent}50`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 8, color: theme.accent,
                    }}>{'\u2713'}</div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ── Times Tab ── */}
        {tab === 'times' && (
          <>
            {athleteTimes.length > 0 ? (
              <div style={{ background: theme.g900, border: `1px solid ${theme.g700}` }}>
                {/* Header */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr',
                  padding: '8px 12px', borderBottom: `1px solid ${theme.g700}`,
                }}>
                  {['EVENT', 'TIME', 'DATE'].map(h => (
                    <div key={h} style={{
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9,
                      letterSpacing: '0.14em', color: theme.g500,
                    }}>{h}</div>
                  ))}
                </div>
                {athleteTimes.slice(0, 30).map((t, i) => {
                  const isPR = prsByEvent[t.event]?.time === t.time;
                  return (
                    <div key={t.id} style={{
                      display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr',
                      padding: '10px 12px', alignItems: 'center',
                      borderBottom: i < Math.min(athleteTimes.length, 30) - 1 ? `1px solid ${theme.g700}` : 'none',
                      background: isPR ? theme.accent + '08' : 'transparent',
                    }}>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: theme.white }}>{t.event}</div>
                      <div style={{
                        fontFamily: "'Bebas Neue', sans-serif", fontSize: 18,
                        color: isPR ? theme.accent : theme.white, letterSpacing: 0.5,
                      }}>
                        {t.time} {isPR && <span style={{ fontSize: 9, color: theme.accent }}>PR</span>}
                      </div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: theme.g500 }}>
                        {t.date || '—'}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '40px 16px', textAlign: 'center', background: theme.g900, border: `1px dashed ${theme.g700}` }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: theme.g600, marginBottom: 6 }}>NO TIMES RECORDED</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: theme.g500 }}>Use the Timer or Meet Import to add times for this athlete.</div>
              </div>
            )}
          </>
        )}

        {/* ── Notes Tab ── */}
        {tab === 'notes' && (
          <>
            <div style={sectionLbl}>COACH NOTES</div>
            <textarea
              style={{ ...inp, height: 120, resize: 'vertical', marginBottom: 10 }}
              placeholder="Training notes, injury updates, season goals..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
            <button onClick={saveNotes} style={{
              padding: '10px 20px', background: theme.accent, border: 'none', color: '#000',
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', marginBottom: 24,
            }}>
              {savedNotes ? '\u2713 SAVED' : 'SAVE NOTES'}
            </button>

            {/* Delete zone */}
            <div style={{ borderTop: `1px solid ${theme.g700}`, paddingTop: 20, marginTop: 8 }}>
              {!confirmDelete ? (
                <button onClick={() => setConfirmDelete(true)} style={{
                  padding: '10px 16px', background: 'transparent', border: '1px solid #c0392b',
                  color: '#c0392b', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11,
                  fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                }}>Remove from Roster</button>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={remove} style={{
                    padding: '10px 16px', background: '#c0392b', border: 'none', color: '#fff',
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                  }}>Confirm Remove</button>
                  <button onClick={() => setConfirmDelete(false)} style={{
                    padding: '10px 16px', background: 'transparent', border: `1px solid ${theme.g700}`,
                    color: theme.g300, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11,
                    letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                  }}>Cancel</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
