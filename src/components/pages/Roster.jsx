import React, { useState } from 'react';
import { collection, addDoc, deleteDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { EVENT_CATEGORIES } from '../../data/events';
import { useToast } from '../shared/Toast';
import { HintBadge } from '../shared/Walkthrough';
import AthleteDetail from './AthleteDetail';
import Invites from './Invites';
import { isConnected as gIsConnected, exportRoster, downloadCSV } from '../../lib/google';

const GROUP_COLORS = ['#00d966', '#38bdf8', '#f97316', '#a78bfa', '#f43f5e', '#fbbf24', '#10b981', '#ec4899'];

export default function Roster({ theme, user, athletes, groups, times, workouts, attendance, invites }) {
  const toast = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [showGroupAdd, setShowGroupAdd] = useState(false);
  const [showInvites, setShowInvites] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filterGroup, setFilterGroup] = useState('');

  const groupList = groups || [];
  const filtered = filterGroup
    ? athletes.filter(a => a.groupId === filterGroup)
    : athletes;

  const getGroup = (id) => groupList.find(g => g.id === id);

  const sectionLbl = {
    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10,
    letterSpacing: '0.16em', textTransform: 'uppercase', color: theme.g500,
    marginBottom: 8,
  };

  if (selected) {
    return <AthleteDetail athlete={selected} theme={theme} user={user} groups={groupList} times={times} workouts={workouts} attendance={attendance} onBack={() => setSelected(null)} />;
  }

  return (
    <div style={{ padding: '0 0 80px', maxWidth: 560, margin: '0 auto' }}>

      {/* Header */}
      <div style={{
        padding: '44px 20px 14px', borderBottom: `1px solid ${theme.g700}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 1, color: theme.white, lineHeight: 1 }}>ROSTER</div>
            <HintBadge hintId="roster-intro" text="Add athletes and organize them into groups. Tap an athlete to see details or assign a group." />
          </div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: '0.16em', color: theme.g500, marginTop: 3 }}>
            {athletes.length} ATHLETE{athletes.length !== 1 ? 'S' : ''} {groupList.length > 0 ? `\u00B7 ${groupList.length} GROUP${groupList.length !== 1 ? 'S' : ''}` : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button onClick={() => {
            const headers = ['Name', 'Email', 'Events', 'Group', 'Connected'];
            const rows = athletes.map(a => {
              const grp = (groups || []).find(g => g.id === a.groupId);
              return [a.name || '', a.email || '', (a.events || []).join(', '), grp?.name || '', a.linkedUserId ? 'Yes' : 'No'];
            });
            if (gIsConnected()) {
              exportRoster(athletes, groups || []).then(r => toast.success('Exported to Google Sheets')).catch(() => {
                downloadCSV('roster.csv', headers, rows);
                toast.success('Downloaded as CSV');
              });
            } else {
              downloadCSV('roster.csv', headers, rows);
              toast.success('Downloaded as CSV');
            }
          }} style={{
            padding: '8px 14px', background: 'transparent', border: `1px solid ${theme.g700}`,
            color: theme.g300, fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
          }}>EXPORT</button>
          <button onClick={() => setShowInvites(true)} style={{
            padding: '8px 14px', background: 'transparent', border: `1px solid ${theme.accentD}`,
            color: theme.accent, fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
          }}>{'\uD83D\uDD17'} INVITE</button>
          <button onClick={() => setShowGroupAdd(true)} style={{
            padding: '8px 14px', background: 'transparent', border: `1px solid ${theme.g700}`,
            color: theme.g300, fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
          }}>+ GROUP</button>
          <button onClick={() => setShowAdd(true)} style={{
            padding: '8px 14px', background: theme.accent, border: 'none',
            color: '#000', fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
          }}>+ ATHLETE</button>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>

        {/* Group filter chips */}
        {groupList.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14, marginBottom: 14 }}>
            <button onClick={() => setFilterGroup('')} style={{
              padding: '6px 12px', background: !filterGroup ? theme.g700 : 'transparent',
              border: `1px solid ${theme.g700}`, color: !filterGroup ? theme.white : theme.g500,
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700,
              letterSpacing: '0.1em', cursor: 'pointer', textTransform: 'uppercase',
            }}>ALL</button>
            {groupList.map(g => (
              <button key={g.id} onClick={() => setFilterGroup(filterGroup === g.id ? '' : g.id)} style={{
                padding: '6px 12px',
                background: filterGroup === g.id ? `${g.color || theme.accent}20` : 'transparent',
                border: `1px solid ${filterGroup === g.id ? g.color || theme.accent : theme.g700}`,
                color: filterGroup === g.id ? g.color || theme.accent : theme.g500,
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700,
                letterSpacing: '0.1em', cursor: 'pointer', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <div style={{ width: 8, height: 8, background: g.color || theme.accent }} />
                {g.name}
              </button>
            ))}
          </div>
        )}

        {/* Athlete table */}
        {filtered.length > 0 ? (
          <div style={{ background: theme.g900, border: `1px solid ${theme.g700}`, marginTop: groupList.length === 0 ? 14 : 0 }}>
            {/* Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '0.3fr 2fr 2fr 0.5fr',
              padding: '8px 12px', borderBottom: `1px solid ${theme.g700}`,
            }}>
              {['', 'NAME', 'EVENTS', ''].map((h, i) => (
                <div key={i} style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9,
                  letterSpacing: '0.14em', color: theme.g500,
                }}>{h}</div>
              ))}
            </div>
            {filtered.map((a, i) => {
              const grp = getGroup(a.groupId);
              return (
                <div key={a.id} onClick={() => setSelected(a)} style={{
                  display: 'grid', gridTemplateColumns: '0.3fr 2fr 2fr 0.5fr',
                  padding: '10px 12px', alignItems: 'center', cursor: 'pointer',
                  borderBottom: i < filtered.length - 1 ? `1px solid ${theme.g700}` : 'none',
                }}>
                  <div>
                    {grp && <div style={{ width: 8, height: 8, background: grp.color || theme.accent }} />}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: theme.white, fontWeight: 600 }}>{a.name}</div>
                    {a.email && <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: theme.g500 }}>{a.email}</div>}
                  </div>
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: theme.g300,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {a.events?.join(' \u00B7 ') || 'No events'}
                  </div>
                  <div style={{ textAlign: 'right', color: theme.g500, fontSize: 14 }}>\u203A</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            padding: '40px 16px', textAlign: 'center', marginTop: 14,
            background: theme.g900, border: `1px dashed ${theme.g700}`,
          }}>
            <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.4 }}>\uD83D\uDC65</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: theme.g600, marginBottom: 6 }}>
              {filterGroup ? 'NO ATHLETES IN THIS GROUP' : 'NO ATHLETES YET'}
            </div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: theme.g500, marginBottom: 16 }}>
              {filterGroup ? 'Assign athletes to this group from their detail view.' : 'Add your first athlete to start building your team.'}
            </div>
            {!filterGroup && (
              <button onClick={() => setShowAdd(true)} style={{
                padding: '10px 20px', background: theme.accent, border: 'none', color: '#000',
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
              }}>ADD FIRST ATHLETE</button>
            )}
          </div>
        )}
      </div>

      {/* Add Athlete Sheet */}
      {showAdd && (
        <AddAthleteSheet theme={theme} user={user} groups={groupList} onClose={() => setShowAdd(false)} toast={toast} />
      )}

      {/* Add Group Sheet */}
      {showGroupAdd && (
        <AddGroupSheet theme={theme} user={user} onClose={() => setShowGroupAdd(false)} toast={toast} />
      )}

      {/* Invite Athletes Sheet */}
      {showInvites && (
        <Invites theme={theme} user={user} invites={invites} athletes={athletes} onClose={() => setShowInvites(false)} />
      )}
    </div>
  );
}

function AddAthleteSheet({ theme, user, groups, onClose, toast }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [events, setEvents] = useState([]);
  const [groupId, setGroupId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const lbl = { display: 'block', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: theme.g500, marginBottom: 6 };
  const inp = { width: '100%', padding: '12px 14px', boxSizing: 'border-box', background: theme.g800, border: `1px solid ${theme.g700}`, color: theme.white, fontSize: 14, outline: 'none' };
  const toggleEvent = (ev) => setEvents(prev => prev.includes(ev) ? prev.filter(e => e !== ev) : [...prev, ev]);

  const save = async () => {
    if (!name.trim()) { setError('Name is required.'); return; }
    setSaving(true);
    await addDoc(collection(db, 'coaches', user.uid, 'athletes'), {
      name: name.trim(), email: email.trim(), events, groupId: groupId || null, createdAt: serverTimestamp(),
    });
    toast.success(`${name.trim()} added to roster`);
    onClose();
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', overflowY: 'auto', zIndex: 200 }}>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: 480, margin: '0 auto', background: theme.g900, borderTop: `3px solid ${theme.accent}`, padding: '24px 20px 60px', minHeight: '60vh' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: theme.white, letterSpacing: 0.5, marginBottom: 18 }}>ADD ATHLETE</div>
        {error && <div style={{ padding: '10px 14px', marginBottom: 14, background: 'rgba(224,85,85,0.1)', border: '1px solid #e05555', color: '#e05555', fontFamily: "'Barlow', sans-serif", fontSize: 13 }}>{error}</div>}
        <label style={lbl}>Name *</label>
        <input autoFocus style={inp} placeholder="Athlete name" value={name} onChange={e => { setName(e.target.value); setError(''); }} />
        <div style={{ height: 14 }} />
        <label style={lbl}>Email (optional)</label>
        <input style={inp} type="email" placeholder="athlete@email.com" value={email} onChange={e => setEmail(e.target.value)} />
        <div style={{ height: 14 }} />

        {/* Group selection */}
        {groups.length > 0 && (
          <>
            <label style={lbl}>Group</label>
            <select style={{ ...inp, fontFamily: "'Barlow', sans-serif" }} value={groupId} onChange={e => setGroupId(e.target.value)}>
              <option value="">No group</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <div style={{ height: 14 }} />
          </>
        )}

        <label style={{ ...lbl, marginBottom: 10 }}>Events</label>
        {Object.entries(EVENT_CATEGORIES).map(([key, cat]) => (
          <div key={key} style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: theme.g500, marginBottom: 6 }}>{cat.label}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {cat.events.map(ev => {
                const sel = events.includes(ev);
                return (
                  <button key={ev} onClick={() => toggleEvent(ev)} style={{ padding: '6px 10px', background: sel ? theme.accent : theme.g800, border: `1px solid ${sel ? theme.accent : theme.g700}`, color: sel ? '#000' : theme.g300, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }}>
                    {ev}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <button onClick={save} disabled={saving} style={{ width: '100%', padding: '14px 0', background: theme.accent, color: '#000', border: 'none', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', marginTop: 8, opacity: saving ? 0.7 : 1 }}>
          {saving ? 'SAVING...' : 'ADD TO ROSTER'}
        </button>
        <button onClick={onClose} style={{ width: '100%', padding: '12px 0', background: 'transparent', border: `1px solid ${theme.g700}`, color: theme.g300, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', marginTop: 8 }}>
          CANCEL
        </button>
      </div>
    </div>
  );
}

function AddGroupSheet({ theme, user, onClose, toast }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(GROUP_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await addDoc(collection(db, 'coaches', user.uid, 'groups'), {
      name: name.trim(), color, createdAt: serverTimestamp(),
    });
    toast.success(`Group "${name.trim()}" created`);
    onClose();
  };

  const lbl = { display: 'block', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: theme.g500, marginBottom: 6 };
  const inp = { width: '100%', padding: '12px 14px', boxSizing: 'border-box', background: theme.g800, border: `1px solid ${theme.g700}`, color: theme.white, fontSize: 14, outline: 'none' };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', overflowY: 'auto', zIndex: 200 }}>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: 400, margin: '80px auto 0', background: theme.g900, borderTop: `3px solid ${theme.accent}`, padding: '24px 20px 32px' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: theme.white, letterSpacing: 0.5, marginBottom: 18 }}>CREATE GROUP</div>
        <label style={lbl}>Group Name</label>
        <input autoFocus style={inp} placeholder="e.g. Sprinters" value={name} onChange={e => setName(e.target.value)} />
        <div style={{ height: 14 }} />
        <label style={lbl}>Color</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {GROUP_COLORS.map(c => (
            <div key={c} onClick={() => setColor(c)} style={{
              width: 28, height: 28, background: c, cursor: 'pointer',
              border: color === c ? '2px solid #fff' : '2px solid transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {color === c && <span style={{ color: '#000', fontSize: 14, fontWeight: 700 }}>\u2713</span>}
            </div>
          ))}
        </div>
        <button onClick={save} disabled={saving || !name.trim()} style={{
          width: '100%', padding: '14px', background: theme.accent, border: 'none', color: '#000',
          fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700,
          letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer',
          opacity: saving || !name.trim() ? 0.6 : 1,
        }}>
          {saving ? 'CREATING...' : 'CREATE GROUP'}
        </button>
        <button onClick={onClose} style={{ width: '100%', padding: '12px', marginTop: 8, background: 'transparent', border: `1px solid ${theme.g700}`, color: theme.g300, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>CANCEL</button>
      </div>
    </div>
  );
}

