import React, { useState, useEffect } from 'react';
import { HintBadge } from '../shared/Walkthrough';
import { useToast } from '../shared/Toast';

export default function Home({ theme, user, athletes, times, workouts, groups, attendance, workoutLogs, onTabChange }) {
  const toast = useToast();
  const recentTimes = [...times].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 6);

  // Attendance stats
  const attendanceRecords = attendance || [];
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendanceRecords.find(r => r.date === today);
  const last7Attendance = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    const rec = attendanceRecords.find(r => r.date === ds);
    last7Attendance.push({ date: ds, day: d.toLocaleDateString('en-US', { weekday: 'short' }), record: rec });
  }

  // Workout log stats
  const logs = workoutLogs || [];
  const recentLogs = [...logs].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 3);
  const thisWeekLogs = logs.filter(l => {
    const d = new Date(l.date);
    const now = new Date();
    const weekAgo = new Date(); weekAgo.setDate(now.getDate() - 7);
    return d >= weekAgo;
  });

  // Today's scheduled workout
  const todayWorkouts = (workouts || []).filter(w => w.date === today);

  // PR alerts — times that are the best for that athlete+event combo
  const prAlerts = [];
  const bestMap = {};
  [...times].sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)).forEach(t => {
    const key = `${t.athleteId}-${t.event}`;
    if (!bestMap[key] || t.time < bestMap[key]) {
      bestMap[key] = t.time;
    }
  });
  recentTimes.forEach(t => {
    const key = `${t.athleteId}-${t.event}`;
    if (bestMap[key] === t.time) prAlerts.push(t);
  });

  // Group athlete count
  const groupList = groups || [];

  const sectionLbl = {
    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10,
    letterSpacing: '0.16em', textTransform: 'uppercase', color: theme.g500,
    marginBottom: 10,
  };

  const statCard = {
    flex: 1, background: theme.g900, border: `1px solid ${theme.g700}`,
    padding: '14px 12px', minWidth: 0,
  };

  return (
    <div style={{ padding: '0 0 80px', maxWidth: 560, margin: '0 auto' }}>

      {/* Header */}
      <div style={{
        padding: '44px 20px 18px',
        background: `linear-gradient(180deg, ${theme.accentBg} 0%, transparent 100%)`,
        borderBottom: `1px solid ${theme.g700}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, letterSpacing: 1, color: theme.accent, lineHeight: 1 }}>FIRSTSTEP</div>
            <HintBadge hintId="home-welcome" text="This is your dashboard. See today's plan, team stats, and recent activity all in one place." />
          </div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: theme.g500, marginTop: 3 }}>COACH DASHBOARD</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user?.photoURL && <img src={user.photoURL} alt="" style={{ width: 28, height: 28, borderRadius: '50%', border: `1px solid ${theme.g700}` }} />}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: theme.white, fontWeight: 600 }}>{user?.displayName || 'Coach'}</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: theme.g500, letterSpacing: '0.06em' }}>{user?.email}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>

        {/* ── Stats Row ── */}
        <div style={{ display: 'flex', gap: 2, marginTop: 14, marginBottom: 16 }}>
          {[
            { label: 'Athletes', value: athletes.length, color: theme.accent },
            { label: 'Times', value: times.length, color: theme.g300 },
            { label: 'Workouts', value: logs.length, color: theme.accent },
            { label: 'This Week', value: thisWeekLogs.length, color: theme.g300 },
          ].map(s => (
            <div key={s.label} style={statCard}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: theme.g500, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Today's Plan ── */}
        <div style={sectionLbl}>
          TODAY'S PLAN
          <span style={{ color: theme.g700, marginLeft: 6 }}>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>
        {todayWorkouts.length > 0 ? (
          todayWorkouts.map((w, i) => (
            <div key={w.id || i} onClick={() => onTabChange('calendar')} style={{
              display: 'flex', alignItems: 'stretch', background: theme.g900,
              border: `1px solid ${theme.accentD}`, marginBottom: 6, cursor: 'pointer',
            }}>
              <div style={{ width: 4, background: theme.accent, flexShrink: 0 }} />
              <div style={{ padding: '12px 14px', flex: 1 }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: theme.white, letterSpacing: 0.5, lineHeight: 1.1 }}>{w.name}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: theme.g500, marginTop: 3 }}>
                  {w.tab?.toUpperCase()} {w.spec ? `\u00B7 ${w.spec}` : ''} \u00B7 {w.exercises?.length || 0} exercises
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', color: theme.accent, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.1em' }}>
                VIEW \u203A
              </div>
            </div>
          ))
        ) : (
          <div style={{
            background: theme.g900, border: `1px dashed ${theme.g700}`,
            padding: '20px 16px', textAlign: 'center', marginBottom: 6,
          }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: theme.g600, marginBottom: 4 }}>NO WORKOUT SCHEDULED</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: theme.g500, marginBottom: 10 }}>
              Build a workout and add it to the calendar.
            </div>
            <button onClick={() => onTabChange('matrix')} style={{
              padding: '8px 16px', background: 'transparent', border: `1px solid ${theme.g700}`,
              color: theme.g300, fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
            }}>
              BUILD WORKOUT
            </button>
          </div>
        )}

        {/* ── Quick Actions ── */}
        <div style={{ ...sectionLbl, marginTop: 16 }}>QUICK ACTIONS</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 16 }}>
          {[
            { label: 'ROSTER', sub: 'Manage athletes', tab: 'roster', icon: '\uD83D\uDC65' },
            { label: 'TIMER', sub: 'Time a rep', tab: 'timer', icon: '\u23F1\uFE0F' },
            { label: 'WORKOUTS', sub: 'Build & schedule', tab: 'matrix', icon: '\u26A1' },
            { label: 'IMPORT', sub: 'Meet results', tab: 'import', icon: '\uD83D\uDCE5' },
          ].map(a => (
            <div key={a.tab} onClick={() => onTabChange(a.tab)} style={{
              background: theme.g900, border: `1px solid ${theme.g700}`,
              padding: '14px 12px', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', gap: 2,
            }}>
              <div style={{ fontSize: 18, marginBottom: 2 }}>{a.icon}</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: theme.white, letterSpacing: 0.5, lineHeight: 1 }}>{a.label}</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: theme.g500, letterSpacing: '0.08em' }}>{a.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Team Pulse: Groups ── */}
        {groupList.length > 0 && (
          <>
            <div style={sectionLbl}>TEAM GROUPS</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              {groupList.map(g => {
                const count = athletes.filter(a => a.groupId === g.id).length;
                return (
                  <div key={g.id} onClick={() => onTabChange('roster')} style={{
                    background: theme.g900, border: `1px solid ${theme.g700}`,
                    padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <div style={{ width: 8, height: 8, background: g.color || theme.accent, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, color: theme.white }}>{g.name}</div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: theme.g500 }}>{count} athlete{count !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── PR Alerts ── */}
        {prAlerts.length > 0 && (
          <>
            <div style={sectionLbl}>PR ALERTS</div>
            {prAlerts.slice(0, 3).map((t, i) => (
              <div key={t.id || i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', background: `${theme.accent}08`,
                border: `1px solid ${theme.accentD}`, marginBottom: 4,
              }}>
                <div style={{
                  width: 24, height: 24, background: theme.accent, color: '#000',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700,
                  flexShrink: 0,
                }}>PR</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: theme.white, fontWeight: 700 }}>{t.athleteName}</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: theme.g500 }}>{t.event}</div>
                </div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: theme.accent, letterSpacing: 1 }}>{t.time}</div>
              </div>
            ))}
          </>
        )}

        {/* ── Attendance Snapshot ── */}
        <div style={{ ...sectionLbl, marginTop: 16 }}>ATTENDANCE THIS WEEK</div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
          {[...last7Attendance].reverse().map(d => (
            <div key={d.date} onClick={() => onTabChange('attendance')} style={{
              flex: 1, background: theme.g900, border: `1px solid ${theme.g700}`,
              padding: '10px 4px', textAlign: 'center', cursor: 'pointer',
            }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: theme.g500, letterSpacing: '0.08em', marginBottom: 4 }}>
                {d.day}
              </div>
              {d.record ? (
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: theme.accent, lineHeight: 1 }}>
                  {(d.record.present || []).length}
                </div>
              ) : (
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: theme.g600, lineHeight: 1 }}>{'\u2014'}</div>
              )}
            </div>
          ))}
        </div>

        {/* ── Recent Workouts ── */}
        {recentLogs.length > 0 && (
          <>
            <div style={sectionLbl}>RECENT WORKOUTS</div>
            {recentLogs.map((log, i) => (
              <div key={log.id || i} onClick={() => onTabChange('log')} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', background: theme.g900, border: `1px solid ${theme.g700}`,
                marginBottom: 4, cursor: 'pointer',
              }}>
                <div style={{
                  width: 32, height: 32, background: theme.accent + '15', border: `1px solid ${theme.accentD}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, color: theme.accent,
                  flexShrink: 0,
                }}>{'\u26A1'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: theme.white, fontWeight: 600 }}>{log.name || 'Workout'}</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: theme.g500 }}>
                    {(log.exercises || []).length} exercises{log.totalSets != null ? ` \u00B7 ${log.totalSets} sets` : ''}{log.duration ? ` \u00B7 ${Math.round(log.duration / 60)}min` : ''}
                  </div>
                </div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: theme.g500 }}>
                  {log.date ? new Date(log.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                </div>
              </div>
            ))}
            <div style={{ marginBottom: 16 }} />
          </>
        )}

        {/* ── Recent Times ── */}
        <div style={sectionLbl}>RECENT TIMES</div>
        {recentTimes.length > 0 ? (
          <div style={{ background: theme.g900, border: `1px solid ${theme.g700}` }}>
            {/* Table header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 0.8fr',
              padding: '8px 12px', borderBottom: `1px solid ${theme.g700}`,
            }}>
              {['ATHLETE', 'EVENT', 'TIME', 'SRC'].map(h => (
                <div key={h} style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9,
                  letterSpacing: '0.14em', color: theme.g500, textTransform: 'uppercase',
                }}>{h}</div>
              ))}
            </div>
            {recentTimes.map((t, i) => (
              <div key={t.id || i} style={{
                display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 0.8fr',
                padding: '9px 12px', borderBottom: i < recentTimes.length - 1 ? `1px solid ${theme.g700}` : 'none',
                alignItems: 'center',
              }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: theme.white, fontWeight: 600 }}>{t.athleteName}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: theme.g300 }}>{t.event}</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: theme.accent, letterSpacing: 1 }}>{t.time}</div>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: theme.g500,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>{t.source === 'timer' ? 'TMR' : t.source === 'meet_import' ? 'IMP' : 'MAN'}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            background: theme.g900, border: `1px dashed ${theme.g700}`,
            padding: '24px 16px', textAlign: 'center',
          }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: theme.g600, marginBottom: 4 }}>NO TIMES YET</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: theme.g500 }}>
              Use the timer or import meet results to see data here.
            </div>
          </div>
        )}

        {/* ── Footer Links ── */}
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: `1px solid ${theme.g700}`, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => window.open(`http://${window.location.hostname}:5175`, '_blank')} style={{
            padding: '8px 14px', background: 'transparent', border: `1px solid ${theme.g700}`,
            color: theme.g300, fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
          }}>
            Athlete App \u2197
          </button>
          <button onClick={() => window.open(`http://${window.location.hostname}:5176`, '_blank')} style={{
            padding: '8px 14px', background: 'transparent', border: `1px solid ${theme.g700}`,
            color: theme.g300, fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
          }}>
            Profile \u2197
          </button>
        </div>
      </div>
    </div>
  );
}
