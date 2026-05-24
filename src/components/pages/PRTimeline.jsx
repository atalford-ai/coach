import React, { useState } from 'react';
import { HintBadge } from '../shared/Walkthrough';

function parseTime(str) {
  if (!str) return null;
  // Handle "mm:ss.cc" or "ss.cc" or just number
  const parts = str.replace(/[^0-9:.]/g, '');
  if (parts.includes(':')) {
    const [m, rest] = parts.split(':');
    return parseFloat(m) * 60 + parseFloat(rest || 0);
  }
  return parseFloat(parts) || null;
}

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function PRTimeline({ theme, athletes, times }) {
  const [selectedAthlete, setSelectedAthlete] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');

  // Get unique events from times
  const athleteTimes = selectedAthlete
    ? times.filter(t => t.athleteId === selectedAthlete)
    : times;

  const uniqueEvents = [...new Set(athleteTimes.map(t => t.event).filter(Boolean))].sort();

  // Filter and sort
  const filteredTimes = athleteTimes
    .filter(t => !selectedEvent || t.event === selectedEvent)
    .filter(t => t.time && t.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Group by event for chart
  const eventGroups = {};
  filteredTimes.forEach(t => {
    if (!eventGroups[t.event]) eventGroups[t.event] = [];
    eventGroups[t.event].push(t);
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

  return (
    <div style={{ padding: '0 0 80px', maxWidth: 560, margin: '0 auto' }}>

      {/* Header */}
      <div style={{
        padding: '44px 20px 14px', borderBottom: `1px solid ${theme.g700}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 1, color: theme.white, lineHeight: 1 }}>PR TIMELINE</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: '0.16em', color: theme.g500, marginTop: 3 }}>PERFORMANCE PROGRESSION</div>
        </div>
        <HintBadge hintId="pr-timeline" text="Track how athlete PRs improve over time. Select an athlete and event to see the trend." />
      </div>

      <div style={{ padding: '0 16px' }}>

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

        {/* Charts per event */}
        {Object.entries(eventGroups).map(([event, entries]) => {
          const parsed = entries.map(e => ({ ...e, seconds: parseTime(e.time) })).filter(e => e.seconds != null);
          if (parsed.length === 0) return null;

          const minVal = Math.min(...parsed.map(p => p.seconds));
          const maxVal = Math.max(...parsed.map(p => p.seconds));
          const range = maxVal - minVal || 1;
          const chartHeight = 120;

          // Track running best
          let runningBest = Infinity;
          const points = parsed.map((p, i) => {
            const isPR = p.seconds <= runningBest;
            if (isPR) runningBest = p.seconds;
            const x = parsed.length === 1 ? 50 : (i / (parsed.length - 1)) * 100;
            const y = chartHeight - ((p.seconds - minVal) / range) * (chartHeight - 20) - 10;
            return { ...p, x, y, isPR };
          });

          // Best time
          const best = parsed.reduce((a, b) => a.seconds < b.seconds ? a : b);

          return (
            <div key={event} style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: theme.white, letterSpacing: 0.5 }}>{event}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: theme.g500 }}>{parsed.length} entries</div>
              </div>

              {/* Chart */}
              <div style={{
                background: theme.g900, border: `1px solid ${theme.g700}`,
                padding: '16px 12px 8px', position: 'relative', height: chartHeight + 32,
              }}>
                {/* Best line */}
                <div style={{
                  position: 'absolute', left: 12, right: 12,
                  top: 16 + (chartHeight - ((best.seconds - minVal) / range) * (chartHeight - 20) - 10),
                  height: 1, borderTop: `1px dashed ${theme.accentD}`,
                  zIndex: 1,
                }}>
                  <span style={{
                    position: 'absolute', right: 0, top: -14,
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9,
                    color: theme.accent, letterSpacing: '0.08em',
                  }}>PR {best.time}</span>
                </div>

                {/* SVG line */}
                <svg width="100%" height={chartHeight} style={{ position: 'absolute', left: 12, top: 16, right: 12, width: 'calc(100% - 24px)' }}>
                  {points.length > 1 && (
                    <polyline
                      fill="none"
                      stroke={theme.g500}
                      strokeWidth="1.5"
                      points={points.map(p => `${p.x}%,${p.y}`).join(' ')}
                    />
                  )}
                  {points.map((p, i) => (
                    <circle
                      key={i}
                      cx={`${p.x}%`} cy={p.y}
                      r={p.isPR ? 5 : 3}
                      fill={p.isPR ? theme.accent : theme.g500}
                      stroke={p.isPR ? theme.accent : 'none'}
                      strokeWidth="1"
                    />
                  ))}
                </svg>

                {/* Date labels */}
                <div style={{
                  position: 'absolute', bottom: 4, left: 12, right: 12,
                  display: 'flex', justifyContent: 'space-between',
                }}>
                  {parsed.length > 0 && (
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: theme.g500 }}>
                      {formatDate(parsed[0].date)}
                    </span>
                  )}
                  {parsed.length > 1 && (
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: theme.g500 }}>
                      {formatDate(parsed[parsed.length - 1].date)}
                    </span>
                  )}
                </div>
              </div>

              {/* Best PR card */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: `${theme.accent}08`, border: `1px solid ${theme.accentD}`,
                padding: '10px 14px', marginTop: 4,
              }}>
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: theme.g500, letterSpacing: '0.12em' }}>PERSONAL BEST</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: theme.g300, marginTop: 2 }}>
                    {best.athleteName} \u00B7 {formatDate(best.date)} {best.meet ? `\u00B7 ${best.meet}` : ''}
                  </div>
                </div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: theme.accent, letterSpacing: 1 }}>{best.time}</div>
              </div>

              {/* Time history table */}
              <div style={{ background: theme.g900, border: `1px solid ${theme.g700}`, marginTop: 4 }}>
                {parsed.map((p, i) => (
                  <div key={i} style={{
                    display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 0.5fr',
                    padding: '7px 12px', alignItems: 'center',
                    borderBottom: i < parsed.length - 1 ? `1px solid ${theme.g700}` : 'none',
                  }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: theme.g500 }}>{formatDate(p.date)}</div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: theme.g300 }}>{p.athleteName}</div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: p.isPR ? theme.accent : theme.white, letterSpacing: 0.5 }}>{p.time}</div>
                    <div style={{ textAlign: 'right' }}>
                      {p.isPR && (
                        <span style={{
                          padding: '2px 6px', background: `${theme.accent}15`, border: `1px solid ${theme.accentD}`,
                          fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: theme.accent, fontWeight: 700,
                        }}>PR</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {Object.keys(eventGroups).length === 0 && (
          <div style={{
            padding: '48px 16px', textAlign: 'center',
            background: theme.g900, border: `1px dashed ${theme.g700}`,
          }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: theme.g600, marginBottom: 6 }}>NO DATA YET</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: theme.g500, maxWidth: 260, margin: '0 auto' }}>
              {athletes.length === 0
                ? 'Add athletes to your roster and record times to see PR trends.'
                : 'Record times using the timer or import meet results to track PR progression.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
