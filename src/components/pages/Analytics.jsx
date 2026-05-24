import React, { useState } from 'react';

function parseTime(str) {
  if (!str) return null;
  const parts = str.replace(/[^0-9:.]/g, '');
  if (parts.includes(':')) {
    const [m, rest] = parts.split(':');
    return parseFloat(m) * 60 + parseFloat(rest || 0);
  }
  return parseFloat(parts) || null;
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Analytics({ theme, athletes, times, workoutLogs, attendance, groups }) {
  const [view, setView] = useState('overview'); // 'overview' | 'prs' | 'volume' | 'attendance'
  const [selectedAthlete, setSelectedAthlete] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');

  const logs = workoutLogs || [];
  const records = attendance || [];

  // ── Overview Stats ──
  const now = new Date();
  const weekAgo = new Date(); weekAgo.setDate(now.getDate() - 7);
  const monthAgo = new Date(); monthAgo.setDate(now.getDate() - 30);

  const thisWeekLogs = logs.filter(l => new Date(l.date) >= weekAgo);
  const thisMonthLogs = logs.filter(l => new Date(l.date) >= monthAgo);
  const thisWeekAttendance = records.filter(r => new Date(r.date) >= weekAgo);
  const avgAttendance = thisWeekAttendance.length > 0
    ? Math.round(thisWeekAttendance.reduce((s, r) => s + (r.present || []).length, 0) / thisWeekAttendance.length)
    : 0;

  // Total PRs across all athletes
  const prMap = {};
  [...times].sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)).forEach(t => {
    const key = `${t.athleteId}-${t.event}`;
    const sec = parseTime(t.time);
    if (sec != null && (!prMap[key] || sec < prMap[key].seconds)) {
      prMap[key] = { ...t, seconds: sec };
    }
  });
  const totalPRs = Object.keys(prMap).length;

  // Recent PRs (last 30 days)
  const recentPRs = Object.values(prMap)
    .filter(p => p.date && new Date(p.date) >= monthAgo)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // ── PR Timeline Data ──
  const athleteTimes = selectedAthlete
    ? times.filter(t => t.athleteId === selectedAthlete)
    : times;
  const uniqueEvents = [...new Set(athleteTimes.map(t => t.event).filter(Boolean))].sort();
  const filteredTimes = athleteTimes
    .filter(t => !selectedEvent || t.event === selectedEvent)
    .filter(t => t.time && t.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const eventGroups = {};
  filteredTimes.forEach(t => {
    if (!eventGroups[t.event]) eventGroups[t.event] = [];
    eventGroups[t.event].push(t);
  });

  // ── Volume Data (last 4 weeks) ──
  const weeklyVolume = [];
  for (let w = 3; w >= 0; w--) {
    const start = new Date(); start.setDate(now.getDate() - (w + 1) * 7);
    const end = new Date(); end.setDate(now.getDate() - w * 7);
    const weekLogs = logs.filter(l => {
      const d = new Date(l.date);
      return d >= start && d < end;
    });
    const totalSets = weekLogs.reduce((s, l) => s + (l.totalSets || 0), 0);
    const totalMin = weekLogs.reduce((s, l) => s + (l.duration ? Math.round(l.duration / 60) : 0), 0);
    weeklyVolume.push({
      label: `W${4 - w}`,
      workouts: weekLogs.length,
      sets: totalSets,
      minutes: totalMin,
      startDate: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  }
  const maxSets = Math.max(...weeklyVolume.map(w => w.sets), 1);

  // ── Attendance Rate (last 14 days) ──
  const attendanceDays = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(now.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    const rec = records.find(r => r.date === ds);
    attendanceDays.push({
      date: ds,
      day: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      dateLabel: d.getDate(),
      present: rec ? (rec.present || []).length : 0,
      total: rec ? (rec.total || athletes.length) : athletes.length,
      hasRecord: !!rec,
    });
  }

  // Group performance
  const groupStats = (groups || []).map(g => {
    const members = athletes.filter(a => a.groupId === g.id);
    const memberIds = members.map(m => m.id);
    const groupTimes = times.filter(t => memberIds.includes(t.athleteId));
    const groupPRs = {};
    groupTimes.forEach(t => {
      const key = `${t.athleteId}-${t.event}`;
      const sec = parseTime(t.time);
      if (sec != null && (!groupPRs[key] || sec < groupPRs[key])) groupPRs[key] = sec;
    });
    return { ...g, members: members.length, times: groupTimes.length, prs: Object.keys(groupPRs).length };
  });

  const sectionLbl = {
    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10,
    letterSpacing: '0.16em', textTransform: 'uppercase', color: theme.g500,
    marginBottom: 10,
  };

  const sel = {
    width: '100%', padding: '10px 12px', background: theme.g800,
    border: `1px solid ${theme.g700}`, color: theme.white,
    fontSize: 13, outline: 'none', fontFamily: "'Barlow', sans-serif",
  };

  const tabBtn = (id, label) => (
    <button key={id} onClick={() => setView(id)} style={{
      padding: '8px 14px', background: view === id ? theme.accent : 'transparent',
      border: `1px solid ${view === id ? theme.accent : theme.g700}`,
      color: view === id ? '#000' : theme.g300,
      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700,
      letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
    }}>{label}</button>
  );

  return (
    <div style={{ padding: '0 0 80px', maxWidth: 560, margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        padding: '44px 20px 14px', borderBottom: `1px solid ${theme.g700}`,
      }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 1, color: theme.white, lineHeight: 1 }}>ANALYTICS</div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: '0.16em', color: theme.g500, marginTop: 3 }}>
          TEAM PERFORMANCE & INSIGHTS
        </div>
      </div>

      {/* View tabs */}
      <div style={{ display: 'flex', gap: 6, padding: '14px 16px 0', flexWrap: 'wrap' }}>
        {tabBtn('overview', 'Overview')}
        {tabBtn('prs', 'PR Timeline')}
        {tabBtn('volume', 'Volume')}
        {tabBtn('attendance', 'Attendance')}
      </div>

      <div style={{ padding: '0 16px' }}>

        {/* ═══════ OVERVIEW ═══════ */}
        {view === 'overview' && (
          <>
            {/* Key metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, marginTop: 14, marginBottom: 16 }}>
              {[
                { label: 'Athletes', val: athletes.length, color: theme.accent },
                { label: 'Total PRs', val: totalPRs, color: '#f59e0b' },
                { label: 'Avg Attend', val: avgAttendance, color: theme.g300 },
                { label: 'Week Workouts', val: thisWeekLogs.length, color: theme.accent },
                { label: 'Month Workouts', val: thisMonthLogs.length, color: theme.g300 },
                { label: 'Total Times', val: times.length, color: theme.accent },
              ].map(s => (
                <div key={s.label} style={{
                  background: theme.g900, border: `1px solid ${theme.g700}`, padding: '12px 8px',
                }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: s.color, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: theme.g500, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Recent PRs */}
            {recentPRs.length > 0 && (
              <>
                <div style={sectionLbl}>RECENT PRs (LAST 30 DAYS)</div>
                <div style={{ background: theme.g900, border: `1px solid ${theme.g700}`, marginBottom: 16 }}>
                  {recentPRs.slice(0, 5).map((pr, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px',
                      borderBottom: i < Math.min(recentPRs.length, 5) - 1 ? `1px solid ${theme.g700}` : 'none',
                    }}>
                      <div style={{
                        width: 24, height: 24, background: theme.accent, color: '#000',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, flexShrink: 0,
                      }}>PR</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: theme.white, fontWeight: 600 }}>{pr.athleteName}</div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: theme.g500 }}>{pr.event} {'\u00B7'} {formatDate(pr.date)}</div>
                      </div>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: theme.accent, letterSpacing: 1 }}>{pr.time}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Group breakdown */}
            {groupStats.length > 0 && (
              <>
                <div style={sectionLbl}>GROUP BREAKDOWN</div>
                <div style={{ background: theme.g900, border: `1px solid ${theme.g700}`, marginBottom: 16 }}>
                  {groupStats.map((g, i) => (
                    <div key={g.id} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                      borderBottom: i < groupStats.length - 1 ? `1px solid ${theme.g700}` : 'none',
                    }}>
                      <div style={{ width: 10, height: 10, background: g.color, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: theme.white, fontWeight: 600 }}>{g.name}</div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: theme.g500 }}>
                          {g.members} athletes {'\u00B7'} {g.times} times {'\u00B7'} {g.prs} PRs
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Insights */}
            <div style={sectionLbl}>INSIGHTS</div>
            <div style={{ background: theme.g900, border: `1px solid ${theme.g700}`, padding: '14px', marginBottom: 16 }}>
              {[
                athletes.length > 0 && recentPRs.length > 0 && `${recentPRs.length} new PR${recentPRs.length !== 1 ? 's' : ''} in the last 30 days`,
                thisWeekLogs.length > 0 && `${thisWeekLogs.length} workout${thisWeekLogs.length !== 1 ? 's' : ''} completed this week`,
                avgAttendance > 0 && `Average ${avgAttendance} athlete${avgAttendance !== 1 ? 's' : ''} per practice this week`,
                athletes.length > 0 && athletes.filter(a => !a.events || a.events.length === 0).length > 0
                  && `${athletes.filter(a => !a.events || a.events.length === 0).length} athlete${athletes.filter(a => !a.events || a.events.length === 0).length !== 1 ? 's' : ''} have no events assigned`,
              ].filter(Boolean).map((insight, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 8, alignItems: 'flex-start',
                  marginBottom: i < 3 ? 8 : 0,
                }}>
                  <div style={{ color: theme.accent, fontSize: 10, marginTop: 2 }}>{'\u25B8'}</div>
                  <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: theme.g300, lineHeight: 1.4 }}>{insight}</div>
                </div>
              ))}
              {athletes.length === 0 && (
                <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: theme.g500 }}>
                  Add athletes and record times to see insights here.
                </div>
              )}
            </div>
          </>
        )}

        {/* ═══════ PR TIMELINE ═══════ */}
        {view === 'prs' && (
          <>
            {/* Filters */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14, marginBottom: 20 }}>
              <div>
                <div style={sectionLbl}>ATHLETE</div>
                <select style={sel} value={selectedAthlete} onChange={e => { setSelectedAthlete(e.target.value); setSelectedEvent(''); }}>
                  <option value="">All Athletes</option>
                  {athletes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <div style={sectionLbl}>EVENT</div>
                <select style={sel} value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}>
                  <option value="">All Events</option>
                  {uniqueEvents.map(ev => <option key={ev} value={ev}>{ev}</option>)}
                </select>
              </div>
            </div>

            {Object.entries(eventGroups).map(([event, entries]) => {
              const parsed = entries.map(e => ({ ...e, seconds: parseTime(e.time) })).filter(e => e.seconds != null);
              if (parsed.length === 0) return null;
              const minVal = Math.min(...parsed.map(p => p.seconds));
              const maxVal = Math.max(...parsed.map(p => p.seconds));
              const range = maxVal - minVal || 1;
              const chartHeight = 120;
              let runningBest = Infinity;
              const points = parsed.map((p, i) => {
                const isPR = p.seconds <= runningBest;
                if (isPR) runningBest = p.seconds;
                const x = parsed.length === 1 ? 50 : (i / (parsed.length - 1)) * 100;
                const y = chartHeight - ((p.seconds - minVal) / range) * (chartHeight - 20) - 10;
                return { ...p, x, y, isPR };
              });
              const best = parsed.reduce((a, b) => a.seconds < b.seconds ? a : b);

              return (
                <div key={event} style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: theme.white, letterSpacing: 0.5 }}>{event}</div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: theme.g500 }}>{parsed.length} entries</div>
                  </div>
                  <div style={{
                    background: theme.g900, border: `1px solid ${theme.g700}`,
                    padding: '16px 12px 8px', position: 'relative', height: chartHeight + 32,
                  }}>
                    <div style={{
                      position: 'absolute', left: 12, right: 12,
                      top: 16 + (chartHeight - ((best.seconds - minVal) / range) * (chartHeight - 20) - 10),
                      height: 1, borderTop: `1px dashed ${theme.accentD}`, zIndex: 1,
                    }}>
                      <span style={{
                        position: 'absolute', right: 0, top: -14,
                        fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: theme.accent, letterSpacing: '0.08em',
                      }}>PR {best.time}</span>
                    </div>
                    <svg width="100%" height={chartHeight} style={{ position: 'absolute', left: 12, top: 16, right: 12, width: 'calc(100% - 24px)' }}>
                      {points.length > 1 && (
                        <polyline fill="none" stroke={theme.g500} strokeWidth="1.5"
                          points={points.map(p => `${p.x}%,${p.y}`).join(' ')} />
                      )}
                      {points.map((p, i) => (
                        <circle key={i} cx={`${p.x}%`} cy={p.y} r={p.isPR ? 5 : 3}
                          fill={p.isPR ? theme.accent : theme.g500} />
                      ))}
                    </svg>
                    <div style={{
                      position: 'absolute', bottom: 4, left: 12, right: 12,
                      display: 'flex', justifyContent: 'space-between',
                    }}>
                      {parsed.length > 0 && <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: theme.g500 }}>{formatDate(parsed[0].date)}</span>}
                      {parsed.length > 1 && <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: theme.g500 }}>{formatDate(parsed[parsed.length - 1].date)}</span>}
                    </div>
                  </div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: `${theme.accent}08`, border: `1px solid ${theme.accentD}`,
                    padding: '10px 14px', marginTop: 4,
                  }}>
                    <div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: theme.g500, letterSpacing: '0.12em' }}>PERSONAL BEST</div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: theme.g300, marginTop: 2 }}>
                        {best.athleteName} {'\u00B7'} {formatDate(best.date)}
                      </div>
                    </div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: theme.accent, letterSpacing: 1 }}>{best.time}</div>
                  </div>
                </div>
              );
            })}

            {Object.keys(eventGroups).length === 0 && (
              <div style={{ padding: '48px 16px', textAlign: 'center', background: theme.g900, border: `1px dashed ${theme.g700}` }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: theme.g600, marginBottom: 6 }}>NO DATA YET</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: theme.g500, maxWidth: 260, margin: '0 auto' }}>
                  Record times using the timer or import meet results to track PR progression.
                </div>
              </div>
            )}
          </>
        )}

        {/* ═══════ VOLUME ═══════ */}
        {view === 'volume' && (
          <>
            <div style={{ ...sectionLbl, marginTop: 14 }}>WEEKLY TRAINING VOLUME</div>

            {/* Bar chart */}
            <div style={{
              background: theme.g900, border: `1px solid ${theme.g700}`,
              padding: '16px 12px', marginBottom: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, marginBottom: 8 }}>
                {weeklyVolume.map((w, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{
                      fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, color: theme.accent,
                      marginBottom: 4,
                    }}>{w.sets || ''}</div>
                    <div style={{
                      width: '100%', background: theme.accent + '30',
                      border: `1px solid ${theme.accentD}`,
                      height: `${Math.max((w.sets / maxSets) * 80, w.sets > 0 ? 8 : 0)}%`,
                      transition: 'height 0.3s',
                    }} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {weeklyVolume.map((w, i) => (
                  <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: theme.g500 }}>{w.label}</div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 8, color: theme.g600 }}>{w.startDate}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly breakdown */}
            <div style={sectionLbl}>BREAKDOWN</div>
            <div style={{ background: theme.g900, border: `1px solid ${theme.g700}`, marginBottom: 16 }}>
              {weeklyVolume.map((w, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '0.5fr 1fr 1fr 1fr',
                  padding: '10px 12px', alignItems: 'center',
                  borderBottom: i < weeklyVolume.length - 1 ? `1px solid ${theme.g700}` : 'none',
                }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: theme.white, fontWeight: 700 }}>{w.label}</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: theme.g300 }}>{w.workouts} sessions</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: theme.g300 }}>{w.sets} sets</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: theme.g300 }}>{w.minutes}min</div>
                </div>
              ))}
            </div>

            {/* Recent workout logs */}
            <div style={sectionLbl}>RECENT SESSIONS</div>
            {logs.length > 0 ? (
              <div style={{ background: theme.g900, border: `1px solid ${theme.g700}` }}>
                {[...logs].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 8).map((log, i) => (
                  <div key={log.id || i} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px',
                    borderBottom: i < Math.min(logs.length, 8) - 1 ? `1px solid ${theme.g700}` : 'none',
                  }}>
                    <div style={{
                      width: 28, height: 28, background: theme.accent + '15', border: `1px solid ${theme.accentD}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, color: theme.accent, flexShrink: 0,
                    }}>{'\u26A1'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: theme.white, fontWeight: 600 }}>{log.name || 'Workout'}</div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: theme.g500 }}>
                        {(log.exercises || []).length} ex {'\u00B7'} {log.totalSets || 0} sets{log.duration ? ` \u00B7 ${Math.round(log.duration / 60)}min` : ''}
                      </div>
                    </div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: theme.g500 }}>{formatDate(log.date)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '40px 16px', textAlign: 'center', background: theme.g900, border: `1px dashed ${theme.g700}` }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: theme.g600, marginBottom: 6 }}>NO WORKOUTS LOGGED</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: theme.g500 }}>Complete workouts from the Track Matrix to see volume data.</div>
              </div>
            )}
          </>
        )}

        {/* ═══════ ATTENDANCE ═══════ */}
        {view === 'attendance' && (
          <>
            <div style={{ ...sectionLbl, marginTop: 14 }}>LAST 14 DAYS</div>

            {/* Attendance heatmap */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3,
              background: theme.g900, border: `1px solid ${theme.g700}`, padding: '12px',
              marginBottom: 16,
            }}>
              {attendanceDays.map((d, i) => {
                const rate = d.total > 0 ? d.present / d.total : 0;
                return (
                  <div key={i} style={{
                    padding: '8px 4px', textAlign: 'center',
                    background: d.hasRecord
                      ? `rgba(0, 217, 102, ${Math.max(rate * 0.4, 0.05)})`
                      : theme.g800,
                    border: `1px solid ${d.hasRecord ? theme.accentD : theme.g700}`,
                  }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 8, color: theme.g500, marginBottom: 2 }}>{d.day}</div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: d.hasRecord ? theme.accent : theme.g600, lineHeight: 1 }}>
                      {d.hasRecord ? d.present : '\u2014'}
                    </div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 8, color: theme.g600, marginTop: 1 }}>{d.dateLabel}</div>
                  </div>
                );
              })}
            </div>

            {/* Attendance stats */}
            <div style={sectionLbl}>STATS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, marginBottom: 16 }}>
              {(() => {
                const withRecords = records.filter(r => r.present && r.present.length > 0);
                const totalPresent = withRecords.reduce((s, r) => s + r.present.length, 0);
                const avgRate = withRecords.length > 0
                  ? Math.round((totalPresent / withRecords.reduce((s, r) => s + (r.total || athletes.length), 0)) * 100)
                  : 0;
                const bestDay = withRecords.length > 0
                  ? withRecords.reduce((best, r) => (r.present.length > (best.present?.length || 0) ? r : best), withRecords[0])
                  : null;
                return [
                  { label: 'Sessions', val: records.length, color: theme.accent },
                  { label: 'Avg Rate', val: `${avgRate}%`, color: theme.g300 },
                  { label: 'Best Day', val: bestDay ? bestDay.present.length : '\u2014', color: theme.accent },
                ];
              })().map(s => (
                <div key={s.label} style={{ background: theme.g900, border: `1px solid ${theme.g700}`, padding: '12px 8px' }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: s.color, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: theme.g500, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Per-athlete attendance */}
            {athletes.length > 0 && records.length > 0 && (
              <>
                <div style={sectionLbl}>ATHLETE ATTENDANCE</div>
                <div style={{ background: theme.g900, border: `1px solid ${theme.g700}` }}>
                  {athletes.map((a, i) => {
                    const present = records.filter(r => (r.present || []).includes(a.id)).length;
                    const rate = records.length > 0 ? Math.round((present / records.length) * 100) : 0;
                    return (
                      <div key={a.id} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 12px',
                        borderBottom: i < athletes.length - 1 ? `1px solid ${theme.g700}` : 'none',
                      }}>
                        <div style={{ flex: 1, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: theme.white }}>{a.name}</div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: rate >= 80 ? theme.accent : rate >= 50 ? theme.g300 : '#c0392b' }}>
                          {rate}%
                        </div>
                        <div style={{ width: 50, height: 4, background: theme.g700, overflow: 'hidden' }}>
                          <div style={{ width: `${rate}%`, height: '100%', background: rate >= 80 ? theme.accent : rate >= 50 ? theme.g300 : '#c0392b' }} />
                        </div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: theme.g500, width: 30, textAlign: 'right' }}>
                          {present}/{records.length}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
