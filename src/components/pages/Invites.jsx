import React, { useState } from 'react';
import { collection, addDoc, deleteDoc, updateDoc, doc, setDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useToast } from '../shared/Toast';
import { generateCode } from '../../utils/generateCode';

const APP_URL = 'http://localhost:5175';

export default function Invites({ theme, user, invites, athletes, onClose }) {
  const toast = useToast();
  const [creating, setCreating] = useState(false);
  const [email, setEmail] = useState('');

  const pending = (invites || []).filter(i => i.status === 'pending');
  const accepted = (invites || []).filter(i => i.status === 'accepted');
  const connected = athletes.filter(a => a.linkedUserId);

  const createInvite = async () => {
    setCreating(true);
    const code = generateCode();
    const coachName = user.displayName || user.email || 'Coach';

    // Store in coach's subcollection
    await addDoc(collection(db, 'coaches', user.uid, 'invites'), {
      code,
      email: email.trim() || null,
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    // Store in top-level invites collection (for athlete lookup)
    await setDoc(doc(db, 'invites', code), {
      coachId: user.uid,
      coachName,
      coachEmail: user.email || null,
      email: email.trim() || null,
      status: 'active',
      createdAt: serverTimestamp(),
    });

    const link = `${APP_URL}/join/${code}`;
    try { await navigator.clipboard.writeText(link); } catch {}
    toast.success(`Link copied! ${code}`);
    setEmail('');
    setCreating(false);
  };

  const revokeInvite = async (inv) => {
    await deleteDoc(doc(db, 'coaches', user.uid, 'invites', inv.id));
    // Also remove from top-level
    if (inv.code) {
      await deleteDoc(doc(db, 'invites', inv.code)).catch(() => {});
    }
    toast.success('Invite revoked');
  };

  const sectionLbl = {
    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10,
    letterSpacing: '0.16em', textTransform: 'uppercase', color: theme.g500,
    marginBottom: 8,
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
      overflowY: 'auto', zIndex: 200,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        maxWidth: 480, margin: '0 auto', background: theme.g900,
        borderTop: `3px solid ${theme.accent}`, padding: '24px 20px 60px', minHeight: '60vh',
      }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: theme.white, letterSpacing: 0.5, marginBottom: 4 }}>
          INVITE ATHLETES
        </div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: theme.g500, marginBottom: 20, lineHeight: 1.5 }}>
          Generate invite codes so athletes can connect their app to your team. They'll see assigned workouts, log completions, and track their progress.
        </div>

        {/* Generate new invite */}
        <div style={sectionLbl}>NEW INVITE</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email (optional)"
            style={{
              flex: 1, padding: '10px 12px', background: theme.g800,
              border: `1px solid ${theme.g700}`, color: theme.white,
              fontSize: 13, outline: 'none', fontFamily: "'Barlow', sans-serif",
            }}
          />
          <button onClick={createInvite} disabled={creating} style={{
            padding: '10px 16px', background: theme.accent, border: 'none', color: '#000',
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
            opacity: creating ? 0.7 : 1, whiteSpace: 'nowrap',
          }}>
            {creating ? '...' : 'GENERATE'}
          </button>
        </div>

        {/* Pending invites */}
        {pending.length > 0 && (
          <>
            <div style={sectionLbl}>PENDING ({pending.length})</div>
            <div style={{ background: theme.g800, border: `1px solid ${theme.g700}`, marginBottom: 16 }}>
              {pending.map((inv, i) => (
                <div key={inv.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderBottom: i < pending.length - 1 ? `1px solid ${theme.g700}` : 'none',
                }}>
                  <div>
                    <div style={{
                      fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: theme.accent,
                      letterSpacing: 3,
                    }}>{inv.code}</div>
                    {inv.email && (
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: theme.g500, marginTop: 2 }}>
                        {inv.email}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => {
                      const link = `${APP_URL}/join/${inv.code}`;
                      navigator.clipboard.writeText(link);
                      toast.success('Link copied!');
                    }} style={{
                      padding: '5px 10px', background: 'transparent', border: `1px solid ${theme.g700}`,
                      color: theme.g300, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10,
                      fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer',
                    }}>COPY LINK</button>
                    <button onClick={() => revokeInvite(inv)} style={{
                      padding: '5px 10px', background: 'transparent', border: `1px solid #c0392b`,
                      color: '#c0392b', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10,
                      fontWeight: 700, cursor: 'pointer',
                    }}>{'\u2715'}</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Connected athletes */}
        {connected.length > 0 && (
          <>
            <div style={sectionLbl}>CONNECTED ({connected.length})</div>
            <div style={{ background: theme.g800, border: `1px solid ${theme.g700}`, marginBottom: 16 }}>
              {connected.map((a, i) => (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px',
                  borderBottom: i < connected.length - 1 ? `1px solid ${theme.g700}` : 'none',
                }}>
                  <div style={{
                    width: 28, height: 28, background: theme.accent + '20', border: `1px solid ${theme.accentD}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, color: theme.accent,
                  }}>{'\u2713'}</div>
                  <div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: theme.white, fontWeight: 600 }}>{a.name}</div>
                    {a.email && <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: theme.g500 }}>{a.email}</div>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* How it works */}
        <div style={sectionLbl}>HOW IT WORKS</div>
        <div style={{ background: theme.g800, border: `1px solid ${theme.g700}`, padding: '14px' }}>
          {[
            { step: '1', text: 'Generate an invite link above' },
            { step: '2', text: 'Text, email, or share the link with your athlete' },
            { step: '3', text: 'Athlete clicks the link or enters the code in their app' },
            { step: '4', text: 'They connect to your team and can see assigned workouts' },
          ].map(s => (
            <div key={s.step} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: s.step === '4' ? 0 : 10 }}>
              <div style={{
                width: 20, height: 20, background: theme.accent, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, color: '#000',
              }}>{s.step}</div>
              <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: theme.g300, lineHeight: 1.4, paddingTop: 2 }}>
                {s.text}
              </div>
            </div>
          ))}
        </div>

        <button onClick={onClose} style={{
          width: '100%', padding: '12px', marginTop: 16,
          background: 'transparent', border: `1px solid ${theme.g700}`,
          color: theme.g300, fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
        }}>CLOSE</button>
      </div>
    </div>
  );
}
