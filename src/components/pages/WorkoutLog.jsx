import React, { useState } from 'react';
import { useToast } from '../shared/Toast';

export default function WorkoutLog({ theme, workoutLogs, workouts }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'completed' | 'skipped'

  // Merge scheduled workouts (from calendar) and workout logs (from player)
  const allEntries = [];

  // Add workout logs from player
  (workoutLogs || []).forEach(log => {
    allEntries.push({ ...log, type: 'log' });
  });

  // Add scheduled workouts that are completed
  (workouts || []).filter(w => w.completed).forEach(w => {
    // Don't duplicate if a log already exists for same date+name
    const dup = allEntries.find(e => e.date === w.date && e.name === w.name);
    if (!dup) allEntries.push({ ...w, type: 'scheduled' });
  });

  allEntries.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const filtered = filter === 'all'
    ? allEntries
    : filter === 'completed'
      ? allEntries.filter(e => e.type === 'log' || e.completed)
      : allEntries.filter(e => e.type === 'scheduled' && !e.completed);

  const sectionLbl = {
    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10,
    letterSpacing: '0.16em', textTransform: 'uppercase', color: theme.g500,
    marginBottom: 8,
  };

  // Group by date
  const byDate = {};
  filtered.forEach(e => {
    const d = e.date || 'Unknown';
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(e);
  });

  return (
    <div style={{ padding: '0 0 80px', maxWidth: 560, margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        padding: '44px 20px 14px', borderBottom: `1px solid ${theme.g700}`,
      }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 1, color: theme.white, lineHeight: 1 }}>WORKOUT LOG</div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: '0.16em', color: theme.g500, marginTop: 3 }}>
          {allEntries.length} WORKOUT{allEntries.length !== 1 ? 'S' : ''} RECORDED
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 6, marginTop: 14, marginBottom: 16 }}>
          {[['all', 'All'], ['completed', 'Completed'], ['skipped', 'Incomplete']].map(([id, label]) => (
            <button key={id} onClick={() => setFilter(id)} style={{
              padding: '7px 14px', background: filter === id ? theme.accent : 'transparent',
              border: `1px solid ${filter === id ? theme.accent : theme.g700}`,
              color: filter === id ? '#000' : theme.g300,
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
            }}>{label}</button>
          ))}
        </div>

        {/* Entries grouped by date */}
        {Object.keys(byDate).length > 0 ? (
          Object.entries(byDate).map(([date, entries]) => (
            <div key={date} style={{ marginBottom: 16 }}>
              <div style={sectionLbl}>
                {date !== 'Unknown'
                  ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
                  : 'Unknown Date'}
              </div>
              {entries.map((entry, i) => (
                <div key={entry.id || i} style={{
                  background: theme.g900, border: `1px solid ${theme.g700}`,
                  borderLeft: `3px solid ${entry.type === 'log' ? theme.accent : theme.g500}`,
                  padding: '14px 16px', marginBottom: 4,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{
                        fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, color: theme.white, fontWeight: 700,
                      }}>{entry.name || 'Unnamed Workout'}</div>
                      <div style={{
                        fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: theme.g500, marginTop: 2,
                      }}>
                        {entry.spec && `${entry.spec} · `}
                        {(entry.exercises || []).length} exercise{(entry.exercises || []).length !== 1 ? 's' : ''}
                        {entry.totalSets != null && ` · ${entry.totalSets} sets`}
                        {entry.duration && ` · ${Math.round(entry.duration / 60)}min`}
                      </div>
                    </div>
                    <div style={{
                      padding: '3px 8px',
                      background: entry.type === 'log' ? theme.accent + '20' : entry.completed ? theme.accent + '20' : theme.g700,
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700,
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      color: entry.type === 'log' || entry.completed ? theme.accent : theme.g500,
                    }}>
                      {entry.type === 'log' ? 'DONE' : entry.completed ? 'DONE' : 'SCHEDULED'}
                    </div>
                  </div>

                  {/* Exercise list preview */}
                  {(entry.exercises || []).length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                      {entry.exercises.slice(0, 5).map((ex, j) => (
                        <span key={j} style={{
                          padding: '3px 8px', background: theme.g800, border: `1px solid ${theme.g700}`,
                          fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: theme.g300,
                        }}>{ex.name}</span>
                      ))}
                      {entry.exercises.length > 5 && (
                        <span style={{
                          padding: '3px 8px', fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: 10, color: theme.g500,
                        }}>+{entry.exercises.length - 5} more</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))
        ) : (
          <div style={{
            padding: '48px 16px', textAlign: 'center',
            background: theme.g900, border: `1px dashed ${theme.g700}`,
          }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: theme.g600, marginBottom: 8 }}>NO WORKOUTS YET</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: theme.g500, maxWidth: 280, margin: '0 auto', lineHeight: 1.5 }}>
              Complete a workout from the Track Matrix or schedule one in the Calendar to start building your log.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
