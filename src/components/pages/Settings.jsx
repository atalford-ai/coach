import React, { useState, useEffect } from 'react';
import { signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { useToast } from '../shared/Toast';
import { createCheckout, isCreemConfigured } from '../../lib/creem';
import { connect as gConnect, disconnect as gDisconnect, isConnected as gIsConnected, getStoredClientId, setClientId as gSetClientId } from '../../lib/google';

export default function Settings({ theme, user }) {
  const toast = useToast();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [teamName, setTeamName] = useState('');
  const [school, setSchool] = useState('');
  const [season, setSeason] = useState('');
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [subStatus, setSubStatus] = useState('trial'); // 'trial' | 'active' | 'canceled'
  const [checkingOut, setCheckingOut] = useState(false);
  const [gConnected, setGConnected] = useState(() => localStorage.getItem('fs-google-connected') === 'true');
  const [gClientId, setGClientId] = useState(() => getStoredClientId());
  const [gConnecting, setGConnecting] = useState(false);

  // Load coach settings from Firestore
  useEffect(() => {
    if (!user?.uid || user.uid === 'demo-coach') { setLoaded(true); return; }
    const load = async () => {
      const snap = await getDoc(doc(db, 'coaches', user.uid, 'settings', 'profile'));
      if (snap.exists()) {
        const d = snap.data();
        setTeamName(d.teamName || '');
        setSchool(d.school || '');
        setSeason(d.season || '');
        if (d.subscriptionStatus) setSubStatus(d.subscriptionStatus);
      }
      setLoaded(true);
    };
    load();
  }, [user?.uid]);

  // Check for Creem success redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('creem_success') === '1' && user?.uid && user.uid !== 'demo-coach') {
      const subId = params.get('subscription_id');
      // Save subscription info
      setDoc(doc(db, 'coaches', user.uid, 'settings', 'profile'), {
        teamName, school, season,
        subscriptionStatus: 'active',
        subscriptionId: subId || '',
        subscribedAt: new Date().toISOString(),
      }).then(() => {
        setSubStatus('active');
        toast.success('Subscription activated! Welcome to Coach Pro.');
      });
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [user?.uid]);

  const saveProfile = async () => {
    setSaving(true);
    if (user.uid !== 'demo-coach') {
      if (displayName !== user.displayName) {
        await updateProfile(auth.currentUser, { displayName });
      }
      await setDoc(doc(db, 'coaches', user.uid, 'settings', 'profile'), {
        teamName, school, season,
        subscriptionStatus: subStatus,
      }, { merge: true });
    }
    toast.success('Settings saved');
    setSaving(false);
  };

  const handleUpgrade = async () => {
    if (!isCreemConfigured()) {
      toast.info('Subscription setup in progress — check back soon!');
      return;
    }
    setCheckingOut(true);
    try {
      const checkout = await createCheckout({
        email: user?.email || '',
        userId: user?.uid || '',
      });
      if (checkout.checkout_url) {
        window.location.href = checkout.checkout_url;
      }
    } catch (err) {
      toast.error(err.message || 'Checkout failed');
      setCheckingOut(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const lbl = {
    display: 'block', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11,
    letterSpacing: '0.12em', textTransform: 'uppercase', color: theme.g500, marginBottom: 6,
  };
  const inp = {
    width: '100%', padding: '12px 14px', boxSizing: 'border-box',
    background: theme.g800, border: `1px solid ${theme.g700}`,
    color: theme.white, fontSize: 14, outline: 'none', fontFamily: "'Barlow', sans-serif",
  };
  const sectionLbl = {
    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10,
    letterSpacing: '0.16em', textTransform: 'uppercase', color: theme.g500,
    borderBottom: `1px solid ${theme.g700}`, paddingBottom: 8, marginBottom: 14,
  };

  return (
    <div style={{ padding: '0 0 80px', maxWidth: 560, margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        padding: '44px 20px 14px', borderBottom: `1px solid ${theme.g700}`,
      }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 1, color: theme.white, lineHeight: 1 }}>SETTINGS</div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: '0.16em', color: theme.g500, marginTop: 3 }}>
          ACCOUNT & TEAM
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>

        {/* ── Coach Profile ── */}
        <div style={{ ...sectionLbl, marginTop: 16 }}>COACH PROFILE</div>

        <label style={lbl}>Display Name</label>
        <input style={{ ...inp, marginBottom: 12 }} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" />

        <label style={lbl}>Email</label>
        <div style={{ ...inp, marginBottom: 12, opacity: 0.6 }}>{user?.email || '\u2014'}</div>

        {/* ── Team Info ── */}
        <div style={{ ...sectionLbl, marginTop: 8 }}>TEAM INFO</div>

        <label style={lbl}>Team Name</label>
        <input style={{ ...inp, marginBottom: 12 }} value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="e.g. Central High Track" />

        <label style={lbl}>School / Organization</label>
        <input style={{ ...inp, marginBottom: 12 }} value={school} onChange={e => setSchool(e.target.value)} placeholder="e.g. Central High School" />

        <label style={lbl}>Current Season</label>
        <input style={{ ...inp, marginBottom: 20 }} value={season} onChange={e => setSeason(e.target.value)} placeholder="e.g. Spring 2026 Outdoor" />

        <button onClick={saveProfile} disabled={saving} style={{
          width: '100%', padding: '14px', background: theme.accent, border: 'none', color: '#000',
          fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700,
          letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer',
          opacity: saving ? 0.7 : 1, marginBottom: 12,
        }}>
          {saving ? 'SAVING...' : 'SAVE SETTINGS'}
        </button>

        {/* ── Subscription ── */}
        <div style={{ ...sectionLbl, marginTop: 16 }}>SUBSCRIPTION</div>
        <div style={{
          background: theme.g900, border: `1px solid ${subStatus === 'active' ? theme.accentD : theme.g700}`,
          padding: '16px', marginBottom: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: theme.white, fontWeight: 700 }}>
              FirstStep Coach Pro
            </div>
            <div style={{
              padding: '3px 10px',
              background: subStatus === 'active' ? theme.accent + '20' : theme.g700 + '40',
              border: `1px solid ${subStatus === 'active' ? theme.accentD : theme.g600}`,
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9,
              color: subStatus === 'active' ? theme.accent : theme.g400,
              fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              {subStatus === 'active' ? 'ACTIVE' : subStatus === 'canceled' ? 'CANCELED' : 'FREE TRIAL'}
            </div>
          </div>

          {subStatus === 'active' ? (
            <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: theme.g300, lineHeight: 1.5, marginBottom: 12 }}>
              You have full access to all Coach Pro features. Thank you for subscribing!
            </div>
          ) : (
            <>
              <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: theme.g500, lineHeight: 1.5, marginBottom: 12 }}>
                Unlimited athletes, workout builder, attendance tracking, performance analytics, and more.
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 12 }}>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: theme.accent }}>$9.99</span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: theme.g500 }}>/month</span>
              </div>
              <button onClick={handleUpgrade} disabled={checkingOut} style={{
                width: '100%', padding: '12px', background: theme.accent, border: 'none', color: '#000',
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
                opacity: checkingOut ? 0.7 : 1,
              }}>
                {checkingOut ? 'REDIRECTING...' : 'UPGRADE NOW'}
              </button>
            </>
          )}
        </div>

        {/* ── Google Workspace ── */}
        <div style={{ ...sectionLbl, marginTop: 8 }}>GOOGLE WORKSPACE</div>
        <div style={{
          background: theme.g900, border: `1px solid ${gConnected ? theme.accentD : theme.g700}`,
          padding: '16px', marginBottom: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: theme.white, fontWeight: 700 }}>
              Google Calendar & Sheets
            </div>
            <div style={{
              padding: '3px 10px',
              background: gConnected ? theme.accent + '20' : theme.g700 + '40',
              border: `1px solid ${gConnected ? theme.accentD : theme.g600}`,
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9,
              color: gConnected ? theme.accent : theme.g400,
              fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              {gConnected ? 'CONNECTED' : 'NOT CONNECTED'}
            </div>
          </div>

          <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: theme.g500, lineHeight: 1.5, marginBottom: 12 }}>
            {gConnected
              ? 'Your practice schedule can sync to Google Calendar and roster/times can export to Google Sheets.'
              : 'Connect to sync your calendar and export data to Google Sheets.'}
          </div>

          <label style={lbl}>Google Client ID</label>
          <input
            style={{ ...inp, marginBottom: 8, fontSize: 11 }}
            value={gClientId}
            onChange={e => { setGClientId(e.target.value); gSetClientId(e.target.value); }}
            placeholder="From Google Cloud Console"
          />
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: theme.g600, marginBottom: 12, lineHeight: 1.4 }}>
            Google Cloud Console {'\u2192'} APIs & Services {'\u2192'} Credentials {'\u2192'} OAuth 2.0 Client ID
          </div>

          {!gConnected ? (
            <button
              onClick={async () => {
                if (!gClientId) { toast.error('Enter your Google Client ID first'); return; }
                setGConnecting(true);
                try {
                  await gConnect();
                  setGConnected(true);
                  toast.success('Google Workspace connected!');
                } catch (err) {
                  toast.error('Connection failed — check your Client ID');
                } finally {
                  setGConnecting(false);
                }
              }}
              disabled={gConnecting || !gClientId}
              style={{
                width: '100%', padding: '12px', background: gClientId ? '#4285f4' : theme.g800,
                border: 'none', color: gClientId ? '#fff' : theme.g600,
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase', cursor: gClientId ? 'pointer' : 'default',
                opacity: gConnecting ? 0.7 : 1,
              }}
            >
              {gConnecting ? 'CONNECTING...' : 'CONNECT GOOGLE WORKSPACE'}
            </button>
          ) : (
            <button
              onClick={() => { gDisconnect(); setGConnected(false); toast.success('Disconnected'); }}
              style={{
                width: '100%', padding: '12px', background: 'transparent',
                border: `1px solid ${theme.g700}`, color: theme.g500,
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              DISCONNECT
            </button>
          )}
        </div>

        {/* ── About ── */}
        <div style={{ ...sectionLbl, marginTop: 8 }}>ABOUT</div>
        <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: theme.g500, lineHeight: 1.6, marginBottom: 20 }}>
          FirstStep Coach v1.0 {'\u2014'} Built for track & field coaches who want to spend less time on spreadsheets and more time coaching.
        </div>

        {/* ── Sign Out ── */}
        <button onClick={handleSignOut} style={{
          width: '100%', padding: '12px', background: 'transparent',
          border: `1px solid #c0392b`, color: '#c0392b',
          fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
        }}>SIGN OUT</button>
      </div>
    </div>
  );
}
