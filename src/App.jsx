import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { THEME } from './theme';
import { ToastProvider } from './components/shared/Toast';
import { useWalkthrough, WalkthroughOverlay } from './components/shared/Walkthrough';
import Auth from './components/auth/Auth';
import Nav from './components/shared/Nav';
import Home from './components/pages/Home';
import Roster from './components/pages/Roster';
import Timer from './components/pages/Timer';
import MeetImport from './components/pages/MeetImport';
import TrackMatrix from './components/pages/TrackMatrix';
import Calendar from './components/pages/Calendar';
import Analytics from './components/pages/Analytics';
import Attendance from './components/pages/Attendance';
import WorkoutLog from './components/pages/WorkoutLog';
import Settings from './components/pages/Settings';
import DrillLibrary from './components/pages/DrillLibrary';

const TABS = [
  { id: 'home',       label: 'Home',       icon: '\uD83C\uDFE0' },
  { id: 'roster',     label: 'Roster',     icon: '\uD83D\uDC65' },
  { id: 'drills',     label: 'Drills',     icon: '\uD83C\uDFC8' },
  { id: 'matrix',     label: 'Workouts',   icon: '\u26A1' },
  { id: 'calendar',   label: 'Calendar',   icon: '\uD83D\uDCC5' },
  { id: 'attendance', label: 'Attend',     icon: '\u2713' },
  { id: 'timer',      label: 'Timer',      icon: '\u23F1\uFE0F' },
  { id: 'log',        label: 'Log',        icon: '\uD83D\uDCCB' },
  { id: 'analytics',  label: 'Analytics',  icon: '\uD83D\uDCC8' },
  { id: 'import',     label: 'Import',     icon: '\uD83D\uDCE5' },
  { id: 'settings',   label: 'Settings',   icon: '\u2699\uFE0F' },
];

function CoachApp({ user }) {
  const [tab, setTab] = useState('home');
  const [athletes, setAthletes] = useState([]);
  const [times, setTimes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [invites, setInvites] = useState([]);

  const { showWalkthrough, dismissWalkthrough } = useWalkthrough();

  // Listen for navigate-tab events (from ProGate upgrade button)
  useEffect(() => {
    const handler = (e) => setTab(e.detail);
    window.addEventListener('navigate-tab', handler);
    return () => window.removeEventListener('navigate-tab', handler);
  }, []);

  // Live roster
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'coaches', user.uid, 'athletes'), snap => {
      setAthletes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user.uid]);

  // Live times
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'coaches', user.uid, 'times'), snap => {
      setTimes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user.uid]);

  // Live groups
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'coaches', user.uid, 'groups'), snap => {
      setGroups(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user.uid]);

  // Live scheduled workouts
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'coaches', user.uid, 'workouts'), snap => {
      setWorkouts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user.uid]);

  // Live saved templates
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'coaches', user.uid, 'templates'), snap => {
      setSavedTemplates(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user.uid]);

  // Live attendance
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'coaches', user.uid, 'attendance'), snap => {
      setAttendance(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user.uid]);

  // Live workout logs
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'coaches', user.uid, 'workoutLogs'), snap => {
      setWorkoutLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user.uid]);

  // Live invites
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'coaches', user.uid, 'invites'), snap => {
      setInvites(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user.uid]);

  // Save template handler
  const handleSaveTemplate = async (template) => {
    await addDoc(collection(db, 'coaches', user.uid, 'templates'), {
      ...template,
      createdAt: serverTimestamp(),
    });
  };

  return (
    <div style={{ minHeight: '100dvh', background: THEME.bg, color: THEME.white, fontFamily: "'Barlow', sans-serif" }}>
      {showWalkthrough && <WalkthroughOverlay onDismiss={dismissWalkthrough} />}

      <div style={{ display: tab === 'home' ? '' : 'none' }}>
        <Home theme={THEME} user={user} athletes={athletes} times={times} workouts={workouts} groups={groups} attendance={attendance} workoutLogs={workoutLogs} onTabChange={setTab} />
      </div>
      <div style={{ display: tab === 'roster' ? '' : 'none' }}>
        <Roster theme={THEME} user={user} athletes={athletes} groups={groups} times={times} workouts={workouts} attendance={attendance} invites={invites} />
      </div>
      <div style={{ display: tab === 'drills' ? '' : 'none' }}>
        <DrillLibrary />
      </div>
      <div style={{ display: tab === 'matrix' ? '' : 'none' }}>
        <TrackMatrix onSaveTemplate={handleSaveTemplate} user={user} />
      </div>
      <div style={{ display: tab === 'calendar' ? '' : 'none' }}>
        <Calendar theme={THEME} user={user} workouts={workouts} savedTemplates={savedTemplates} athletes={athletes} groups={groups} />
      </div>
      <div style={{ display: tab === 'attendance' ? '' : 'none' }}>
        <Attendance theme={THEME} user={user} athletes={athletes} groups={groups} attendance={attendance} />
      </div>
      <div style={{ display: tab === 'timer' ? '' : 'none' }}>
        <Timer theme={THEME} user={user} athletes={athletes} />
      </div>
      <div style={{ display: tab === 'log' ? '' : 'none' }}>
        <WorkoutLog theme={THEME} workoutLogs={workoutLogs} workouts={workouts} />
      </div>
      <div style={{ display: tab === 'analytics' ? '' : 'none' }}>
        <Analytics theme={THEME} athletes={athletes} times={times} workoutLogs={workoutLogs} attendance={attendance} groups={groups} />
      </div>
      <div style={{ display: tab === 'import' ? '' : 'none' }}>
        <MeetImport theme={THEME} user={user} athletes={athletes} />
      </div>
      <div style={{ display: tab === 'settings' ? '' : 'none' }}>
        <Settings theme={THEME} user={user} />
      </div>

      <Nav tabs={TABS} active={tab} onChange={setTab} theme={THEME} />
    </div>
  );
}

const DEMO_USER = {
  uid: 'demo-coach',
  email: 'demo@firststep.app',
  displayName: 'Demo Coach',
  photoURL: null,
};

export default function App() {
  const [user, setUser] = useState(undefined);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u ?? null));
    return unsub;
  }, []);

  if (demo) {
    return (
      <ToastProvider>
        <CoachApp user={DEMO_USER} />
      </ToastProvider>
    );
  }

  if (user === undefined) {
    return (
      <div style={{ minHeight: '100dvh', background: '#060a07', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: '0.06em', color: '#1a2620' }}>FIRSTSTEP</div>
      </div>
    );
  }

  if (!user) return <Auth onDemo={() => setDemo(true)} />;

  return (
    <ToastProvider>
      <CoachApp user={user} />
    </ToastProvider>
  );
}
