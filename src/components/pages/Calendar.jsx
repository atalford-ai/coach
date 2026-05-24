import React, { useState } from 'react';
import { collection, addDoc, deleteDoc, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useToast } from '../shared/Toast';
import { HintBadge } from '../shared/Walkthrough';
import SeasonPlanner from './SeasonPlanner';
import { isConnected as gIsConnected, syncToCalendar } from '../../lib/google';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getWeekDates(offset = 0) {
  const now = new Date();
  const day = now.getDay();
  const mon = new Date(now);
  mon.setDate(now.getDate() - ((day + 6) % 7) + offset * 7);
  return DAYS.map((_, i) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return d;
  });
}

function fmtDate(d) {
  return d.toISOString().split('T')[0];
}

export default function Calendar({ theme, user, workouts, savedTemplates, athletes, groups }) {
  const toast = useToast();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAssign, setShowAssign] = useState(false);
  const [assigningWorkout, setAssigningWorkout] = useState(null); // workout to assign to athletes
  const [calView, setCalView] = useState('weekly'); // 'weekly' | 'season'

  const weekDates = getWeekDates(weekOffset);
  const today = fmtDate(new Date());

  const getWorkoutsForDate = (date) => {
    const ds = fmtDate(date);
    return (workouts || []).filter(w => w.date === ds);
  };

  const handleAssign = async (template) => {
    if (!selectedDate) return;
    await addDoc(collection(db, 'coaches', user.uid, 'workouts'), {
      name: template.name,
      tab: template.tab || '',
      spec: template.spec || '',
      exercises: template.exercises || [],
      date: fmtDate(selectedDate),
      templateId: template.id || null,
      createdAt: serverTimestamp(),
    });
    toast.success(`"${template.name}" scheduled for ${selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`);
    setShowAssign(false);
  };

  const handleToggleComplete = async (workoutId, currentlyDone) => {
    await updateDoc(doc(db, 'coaches', user.uid, 'workouts', workoutId), {
      completed: !currentlyDone,
    });
    toast.success(!currentlyDone ? 'Workout marked complete' : 'Marked incomplete');
  };

  const handleRemove = async (workoutId, name) => {
    const ref = doc(db, 'coaches', user.uid, 'workouts', workoutId);
    await deleteDoc(ref);
    toast.undo(`"${name}" removed`, async () => {
      // Re-add on undo — simplified, doesn't restore exact doc
      toast.info('Undo not available after deletion');
    });
  };

  const handleAssignToAthletes = async (workout, athleteIds) => {
    const coachName = user.displayName || user.email || 'Coach';
    let count = 0;
    for (const aid of athleteIds) {
      const athlete = (athletes || []).find(a => a.id === aid);
      if (!athlete) continue;
      await addDoc(collection(db, 'assignments'), {
        coachId: user.uid,
        coachName,
        athleteId: athlete.linkedUserId || null,
        athleteRosterId: athlete.id,
        athleteName: athlete.name,
        workout: {
          name: workout.name,
          tab: workout.tab || '',
          spec: workout.spec || '',
          exercises: workout.exercises || [],
        },
        date: workout.date,
        status: 'assigned',
        createdAt: serverTimestamp(),
      });
      count++;
    }
    toast.success(`Assigned to ${count} athlete${count !== 1 ? 's' : ''}`);
    setAssigningWorkout(null);
  };

  const handleGCalSync = async () => {
    if (!gIsConnected()) { toast.error('Connect Google Workspace in Settings first'); return; }
    const weekWorkouts = weekDates.flatMap(d => getWorkoutsForDate(d));
    if (!weekWorkouts.length) { toast.info('No workouts this week to sync'); return; }
    try {
      const coachName = user.displayName || user.email || 'Coach';
      const results = await syncToCalendar(weekWorkouts, coachName);
      const ok = results.filter(r => r.status === 'ok').length;
      toast.success(`${ok} workout${ok !== 1 ? 's' : ''} synced to Google Calendar`);
    } catch (err) {
      toast.error('Sync failed — reconnect in Settings');
    }
  };

  const sectionLbl = {
    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10,
    letterSpacing: '0.16em', textTransform: 'uppercase', color: theme.g500,
    marginBottom: 10,
  };

  return (
    <div style={{ padding: '0 0 80px', maxWidth: 560, margin: '0 auto' }}>

      {/* Header */}
      <div style={{
        padding: '44px 20px 14px', borderBottom: `1px solid ${theme.g700}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 1, color: theme.white, lineHeight: 1 }}>PRACTICE CALENDAR</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: '0.16em', color: theme.g500, marginTop: 3 }}>
            WEEK OF {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={handleGCalSync} style={{
            padding: '8px 14px', background: 'transparent',
            border: `1px solid ${gIsConnected() ? '#4285f4' : theme.g700}`,
            color: gIsConnected() ? '#4285f4' : theme.g500,
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
          }}>GCAL</button>
          {[['weekly', 'WEEKLY'], ['season', 'SEASON']].map(([id, label]) => (
            <button key={id} onClick={() => setCalView(id)} style={{
              padding: '8px 14px', background: calView === id ? theme.accent : 'transparent',
              border: `1px solid ${calView === id ? theme.accent : theme.g700}`,
              color: calView === id ? '#000' : theme.g300,
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
            }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>

        {calView === 'season' && (
          <div style={{ marginTop: 14 }}>
            <SeasonPlanner theme={theme} user={user} />
          </div>
        )}

        {calView === 'weekly' && <>
        {/* Week navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, marginBottom: 14 }}>
          <button onClick={() => setWeekOffset(o => o - 1)} style={{
            background: theme.g900, border: `1px solid ${theme.g700}`, color: theme.g300,
            padding: '8px 14px', cursor: 'pointer', fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
          }}>\u2190 PREV</button>
          <button onClick={() => setWeekOffset(0)} style={{
            background: 'transparent', border: 'none', color: theme.accent,
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700,
            letterSpacing: '0.12em', cursor: 'pointer', textTransform: 'uppercase',
          }}>THIS WEEK</button>
          <button onClick={() => setWeekOffset(o => o + 1)} style={{
            background: theme.g900, border: `1px solid ${theme.g700}`, color: theme.g300,
            padding: '8px 14px', cursor: 'pointer', fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
          }}>NEXT \u2192</button>
        </div>

        {/* Week grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 20 }}>
          {weekDates.map((date, i) => {
            const ds = fmtDate(date);
            const isToday = ds === today;
            const isSelected = selectedDate && fmtDate(selectedDate) === ds;
            const dayWorkouts = getWorkoutsForDate(date);
            return (
              <div key={i} onClick={() => setSelectedDate(date)} style={{
                background: isSelected ? theme.accentBg : theme.g900,
                border: `1px solid ${isToday ? theme.accent : isSelected ? theme.accentD : theme.g700}`,
                padding: '8px 4px', textAlign: 'center', cursor: 'pointer',
                minHeight: 70,
                transition: 'all 0.15s',
              }}>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9,
                  letterSpacing: '0.14em', color: isToday ? theme.accent : theme.g500,
                  marginBottom: 4,
                }}>{DAYS[i]}</div>
                <div style={{
                  fontFamily: "'Bebas Neue', sans-serif", fontSize: 22,
                  color: isToday ? theme.accent : theme.white, lineHeight: 1,
                }}>{date.getDate()}</div>
                {dayWorkouts.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 3, marginTop: 6 }}>
                    {dayWorkouts.slice(0, 3).map((_, j) => (
                      <div key={j} style={{ width: 6, height: 6, background: theme.accent }} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected day detail */}
        {selectedDate && (
          <>
            <div style={sectionLbl}>
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            {getWorkoutsForDate(selectedDate).length > 0 ? (
              getWorkoutsForDate(selectedDate).map((w, i) => (
                <div key={w.id || i} style={{
                  background: theme.g900, border: `1px solid ${theme.g700}`,
                  padding: '14px 14px', marginBottom: 6,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{ width: 4, alignSelf: 'stretch', background: theme.accent, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: theme.white, letterSpacing: 0.5, lineHeight: 1.1 }}>{w.name}</div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: theme.g500, marginTop: 3 }}>
                      {w.tab?.toUpperCase()} {w.spec ? `\u00B7 ${w.spec}` : ''} \u00B7 {w.exercises?.length || 0} exercises
                    </div>
                    {w.exercises?.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                        {w.exercises.map((ex, j) => (
                          <span key={j} style={{
                            padding: '3px 8px', background: theme.g800, border: `1px solid ${theme.g700}`,
                            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: theme.g300,
                          }}>{ex.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <button onClick={(e) => { e.stopPropagation(); setAssigningWorkout(w); }} style={{
                      padding: '3px 8px', cursor: 'pointer',
                      background: 'transparent',
                      border: `1px solid ${theme.accentD}`,
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9,
                      color: theme.accent,
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                    }}>
                      ASSIGN
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleToggleComplete(w.id, w.completed); }} style={{
                      padding: '3px 8px', cursor: 'pointer',
                      background: w.completed ? `${theme.accent}15` : `${theme.g700}`,
                      border: `1px solid ${w.completed ? theme.accentD : theme.g600}`,
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9,
                      color: w.completed ? theme.accent : theme.g500,
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                    }}>
                      {w.completed ? '\u2713 DONE' : 'MARK DONE'}
                    </button>
                    <button onClick={() => handleRemove(w.id, w.name)} style={{
                      background: 'none', border: `1px solid ${theme.g700}`, color: theme.g500,
                      padding: '3px 7px', cursor: 'pointer', fontSize: 11,
                    }}>\u2715</button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{
                background: theme.g900, border: `1px dashed ${theme.g700}`,
                padding: '20px 16px', textAlign: 'center',
              }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: theme.g500, marginBottom: 8 }}>No workouts scheduled</div>
              </div>
            )}

            {/* Add workout button */}
            <button onClick={() => setShowAssign(true)} style={{
              width: '100%', padding: '12px', marginTop: 6,
              background: 'transparent', border: `1px dashed ${theme.accentD}`,
              color: theme.accent, fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
            }}>
              + SCHEDULE WORKOUT
            </button>
          </>
        )}

        {/* No date selected */}
        {!selectedDate && (
          <div style={{ padding: '32px 0', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: theme.g600, marginBottom: 6 }}>TAP A DAY</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: theme.g500 }}>
              Select a day to view or schedule workouts.
            </div>
          </div>
        )}
        </>}
      </div>

      {/* ── Assign to Athletes Sheet ── */}
      {assigningWorkout && (
        <AssignToAthletesSheet
          theme={theme}
          workout={assigningWorkout}
          athletes={athletes || []}
          groups={groups || []}
          onAssign={(athleteIds) => handleAssignToAthletes(assigningWorkout, athleteIds)}
          onClose={() => setAssigningWorkout(null)}
        />
      )}

      {/* ── Assign Workout Sheet ── */}
      {showAssign && (
        <div onClick={() => setShowAssign(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
          overflowY: 'auto', zIndex: 200,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            maxWidth: 480, margin: '0 auto', background: theme.g900,
            borderTop: `3px solid ${theme.accent}`, padding: '24px 20px 60px', minHeight: '50vh',
          }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: theme.white, letterSpacing: 0.5, marginBottom: 4 }}>
              SCHEDULE WORKOUT
            </div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: theme.g500, marginBottom: 20 }}>
              for {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>

            {(savedTemplates || []).length > 0 ? (
              (savedTemplates || []).map((t, i) => (
                <div key={t.id || i} onClick={() => handleAssign(t)} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: theme.g800, border: `1px solid ${theme.g700}`,
                  padding: '14px 14px', marginBottom: 6, cursor: 'pointer',
                }}>
                  <div style={{ width: 4, alignSelf: 'stretch', background: theme.accent, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: theme.white, letterSpacing: 0.5 }}>{t.name}</div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: theme.g500, marginTop: 2 }}>
                      {t.tab?.toUpperCase()} {t.spec ? `\u00B7 ${t.spec}` : ''} \u00B7 {t.exercises?.length || 0} exercises
                    </div>
                  </div>
                  <div style={{ color: theme.accent, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.1em' }}>ADD</div>
                </div>
              ))
            ) : (
              <div style={{
                padding: '32px 16px', textAlign: 'center',
                border: `1px dashed ${theme.g700}`,
              }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: theme.g600, marginBottom: 6 }}>NO SAVED WORKOUTS</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: theme.g500 }}>
                  Build a workout in Track Matrix and save it as a template first.
                </div>
              </div>
            )}

            <button onClick={() => setShowAssign(false)} style={{
              width: '100%', padding: '12px', marginTop: 12,
              background: 'transparent', border: `1px solid ${theme.g700}`,
              color: theme.g300, fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
            }}>CANCEL</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Assign to Athletes Sheet ──────────────────────────────────────────────────
function AssignToAthletesSheet({ theme, workout, athletes, groups, onAssign, onClose }) {
  const [selected, setSelected] = useState([]);
  const [filterGroup, setFilterGroup] = useState('');
  const [sending, setSending] = useState(false);

  const filtered = filterGroup
    ? athletes.filter(a => a.groupId === filterGroup)
    : athletes;

  const toggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAll = () => {
    const ids = filtered.map(a => a.id);
    const allSelected = ids.every(id => selected.includes(id));
    if (allSelected) {
      setSelected(prev => prev.filter(id => !ids.includes(id)));
    } else {
      setSelected(prev => [...new Set([...prev, ...ids])]);
    }
  };

  const selectGroup = (groupId) => {
    const ids = athletes.filter(a => a.groupId === groupId).map(a => a.id);
    const allSelected = ids.every(id => selected.includes(id));
    if (allSelected) {
      setSelected(prev => prev.filter(id => !ids.includes(id)));
    } else {
      setSelected(prev => [...new Set([...prev, ...ids])]);
    }
  };

  const handleSend = async () => {
    if (!selected.length) return;
    setSending(true);
    await onAssign(selected);
    setSending(false);
  };

  const getGroup = (id) => groups.find(g => g.id === id);

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
      overflowY: 'auto', zIndex: 200,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        maxWidth: 480, margin: '0 auto', background: theme.g900,
        borderTop: `3px solid ${theme.accent}`, padding: '24px 20px 60px', minHeight: '50vh',
      }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: theme.white, letterSpacing: 0.5, marginBottom: 4 }}>
          ASSIGN WORKOUT
        </div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: theme.g500, marginBottom: 4 }}>
          {workout.name}
        </div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: theme.g500, marginBottom: 16 }}>
          {workout.date} · {workout.exercises?.length || 0} exercises
        </div>

        {/* Group quick-select chips */}
        {groups.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            <button onClick={() => setFilterGroup('')} style={{
              padding: '6px 12px', background: !filterGroup ? theme.g700 : 'transparent',
              border: `1px solid ${theme.g700}`, color: !filterGroup ? theme.white : theme.g500,
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700,
              letterSpacing: '0.1em', cursor: 'pointer', textTransform: 'uppercase',
            }}>ALL</button>
            {groups.map(g => {
              const groupAthletes = athletes.filter(a => a.groupId === g.id);
              const allSelected = groupAthletes.length > 0 && groupAthletes.every(a => selected.includes(a.id));
              return (
                <button key={g.id} onClick={() => selectGroup(g.id)} style={{
                  padding: '6px 12px',
                  background: allSelected ? `${g.color || theme.accent}30` : 'transparent',
                  border: `1px solid ${allSelected ? g.color || theme.accent : theme.g700}`,
                  color: allSelected ? g.color || theme.accent : theme.g500,
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.1em', cursor: 'pointer', textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <div style={{ width: 8, height: 8, background: g.color || theme.accent }} />
                  {g.name} ({groupAthletes.length})
                </button>
              );
            })}
          </div>
        )}

        {/* Select all toggle */}
        {filtered.length > 0 && (
          <button onClick={selectAll} style={{
            padding: '6px 12px', marginBottom: 10,
            background: 'transparent', border: `1px solid ${theme.g700}`,
            color: theme.g300, fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', cursor: 'pointer',
          }}>
            {filtered.every(a => selected.includes(a.id)) ? 'DESELECT ALL' : 'SELECT ALL'}
          </button>
        )}

        {/* Athlete list */}
        {filtered.length > 0 ? (
          <div style={{ background: theme.g800, border: `1px solid ${theme.g700}`, marginBottom: 16 }}>
            {filtered.map((a, i) => {
              const on = selected.includes(a.id);
              const grp = getGroup(a.groupId);
              return (
                <div key={a.id} onClick={() => toggle(a.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', cursor: 'pointer',
                  background: on ? `${theme.accent}08` : 'transparent',
                  borderBottom: i < filtered.length - 1 ? `1px solid ${theme.g700}` : 'none',
                }}>
                  <div style={{
                    width: 22, height: 22, flexShrink: 0,
                    border: `2px solid ${on ? theme.accent : theme.g600}`,
                    background: on ? theme.accent : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, color: '#000', fontWeight: 700,
                  }}>
                    {on ? '\u2713' : ''}
                  </div>
                  {grp && <div style={{ width: 8, height: 8, background: grp.color || theme.accent, flexShrink: 0 }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: theme.white, fontWeight: 600 }}>{a.name}</div>
                    {a.email && <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: theme.g500 }}>{a.email}</div>}
                  </div>
                  {!a.linkedUserId && (
                    <div style={{
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9,
                      color: theme.g500, letterSpacing: '0.1em',
                    }}>NOT LINKED</div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            padding: '32px 16px', textAlign: 'center',
            border: `1px dashed ${theme.g700}`, marginBottom: 16,
          }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: theme.g600, marginBottom: 6 }}>NO ATHLETES</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: theme.g500 }}>
              Add athletes to your roster first.
            </div>
          </div>
        )}

        {/* Assign button */}
        <button onClick={handleSend} disabled={!selected.length || sending} style={{
          width: '100%', padding: '14px 0',
          background: selected.length ? theme.accent : theme.g800,
          border: 'none', color: selected.length ? '#000' : theme.g600,
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 2,
          cursor: selected.length ? 'pointer' : 'default',
          opacity: sending ? 0.7 : 1,
        }}>
          {sending ? 'ASSIGNING...' : `ASSIGN TO ${selected.length} ATHLETE${selected.length !== 1 ? 'S' : ''}`}
        </button>

        <button onClick={onClose} style={{
          width: '100%', padding: '12px', marginTop: 8,
          background: 'transparent', border: `1px solid ${theme.g700}`,
          color: theme.g300, fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
        }}>CANCEL</button>
      </div>
    </div>
  );
}
