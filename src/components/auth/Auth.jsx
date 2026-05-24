import React, { useState } from 'react';
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendPasswordResetEmail, signInWithPopup, updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';

const C = {
  bg: '#060a07', card: '#0b100d', border: '#1a2620', border2: '#243529',
  accent: '#00d966', white: '#eef5f1', g300: '#7aaa8a', g500: '#3d5a47',
  g800: '#111815', error: '#e05555',
};

const input = {
  width: '100%', padding: '12px 14px', boxSizing: 'border-box',
  background: C.g800, border: `1px solid ${C.border2}`,
  color: C.white, fontSize: 14, outline: 'none', fontFamily: "'Barlow', sans-serif",
};
const btnPrimary = {
  width: '100%', padding: '14px', background: C.accent, border: 'none', color: '#000',
  fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700,
  letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer',
};
const btnOutline = {
  width: '100%', padding: '13px', background: 'transparent', border: `1px solid ${C.border2}`,
  color: C.g300, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13,
  fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
};
const lbl = {
  display: 'block', fontFamily: "'Barlow Condensed', sans-serif",
  fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
  color: C.g500, marginBottom: 6,
};

function Logo() {
  return (
    <div style={{ marginBottom: 40, textAlign: 'center' }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, letterSpacing: '0.06em', color: C.white, lineHeight: 1 }}>
        FIRST<span style={{ color: C.accent }}>STEP</span>
      </div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: '0.25em', color: C.g500, marginTop: 4 }}>
        COACH PORTAL
      </div>
    </div>
  );
}

function GoogleBtn({ label = 'Continue with Google' }) {
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    try { await signInWithPopup(auth, googleProvider); }
    catch { setLoading(false); }
  };
  return (
    <button onClick={handle} disabled={loading} style={{ ...btnOutline, marginBottom: 12, opacity: loading ? 0.6 : 1 }}>
      <svg width="16" height="16" viewBox="0 0 18 18">
        <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
        <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.826.957 4.039l3.007-2.332z"/>
        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
      </svg>
      {loading ? 'Signing in...' : label}
    </button>
  );
}

function Divider({ text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
      <div style={{ flex: 1, height: 1, background: C.border }} />
      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: '0.2em', color: C.g500, textTransform: 'uppercase' }}>{text}</span>
      <div style={{ flex: 1, height: 1, background: C.border }} />
    </div>
  );
}

function ErrMsg({ msg }) {
  if (!msg) return null;
  return <div style={{ padding: '10px 14px', marginBottom: 14, background: 'rgba(224,85,85,0.1)', border: `1px solid ${C.error}`, fontFamily: "'Barlow', sans-serif", fontSize: 13, color: C.error }}>{msg}</div>;
}

function Login({ onSwitch, onDemo }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!email || !password) { setError('Enter your email and password.'); return; }
    setLoading(true); setError('');
    try { await signInWithEmailAndPassword(auth, email, password); }
    catch (e) {
      setError(e.code === 'auth/invalid-credential' ? 'Incorrect email or password.' : 'Something went wrong.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100dvh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
      <Logo />
      <div style={{ width: '100%', maxWidth: 360, background: C.card, border: `1px solid ${C.border}`, padding: '28px 24px' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: '0.04em', color: C.white, marginBottom: 20 }}>Coach Sign In</div>
        <GoogleBtn />
        <Divider text="or sign in with email" />
        <ErrMsg msg={error} />
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Email</label>
          <input style={input} type="email" placeholder="coach@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handle()} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>Password</label>
          <input style={input} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handle()} />
        </div>
        <button onClick={() => onSwitch('forgot')} style={{ background: 'none', border: 'none', color: C.g500, cursor: 'pointer', fontFamily: "'Barlow', sans-serif", fontSize: 12, display: 'block', marginTop: -8, marginBottom: 16, padding: 0 }}>
          Forgot password?
        </button>
        <button onClick={handle} disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </div>
      <div style={{ marginTop: 16, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: C.g500 }}>
        New coach?{' '}
        <button onClick={() => onSwitch('signup')} style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: 13, textDecoration: 'underline', padding: 0 }}>Create account</button>
      </div>
      {onDemo && (
        <button onClick={onDemo} style={{
          marginTop: 20, padding: '12px 28px',
          background: 'transparent', border: `1px solid ${C.border2}`,
          color: C.g300, fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 14, fontWeight: 700, letterSpacing: '0.14em',
          textTransform: 'uppercase', cursor: 'pointer',
        }}>
          DEMO MODE
        </button>
      )}
    </div>
  );
}

function Signup({ onSwitch }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!name || !email || !password) { setError('All fields are required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    try {
      const r = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(r.user, { displayName: name });
    } catch (e) {
      setError(e.code === 'auth/email-already-in-use' ? 'An account with this email already exists.' : 'Something went wrong.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100dvh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
      <Logo />
      <div style={{ width: '100%', maxWidth: 360, background: C.card, border: `1px solid ${C.border}`, padding: '28px 24px' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: '0.04em', color: C.white, marginBottom: 20 }}>Create Coach Account</div>
        <GoogleBtn label="Sign up with Google" />
        <Divider text="or sign up with email" />
        <ErrMsg msg={error} />
        {[['Name', 'text', 'Your name', name, setName], ['Email', 'email', 'coach@email.com', email, setEmail], ['Password', 'password', 'Min 6 characters', password, setPassword]].map(([lbl2, type, ph, val, set]) => (
          <div key={lbl2} style={{ marginBottom: 14 }}>
            <label style={lbl}>{lbl2}</label>
            <input style={input} type={type} placeholder={ph} value={val} onChange={e => set(e.target.value)} />
          </div>
        ))}
        <button onClick={handle} disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </div>
      <div style={{ marginTop: 16, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: C.g500 }}>
        Already have an account?{' '}
        <button onClick={() => onSwitch('login')} style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: 13, textDecoration: 'underline', padding: 0 }}>Sign in</button>
      </div>
    </div>
  );
}

function ForgotPassword({ onSwitch }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const handle = async () => {
    if (!email) return;
    await sendPasswordResetEmail(auth, email);
    setSent(true);
  };
  return (
    <div style={{ minHeight: '100dvh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
      <Logo />
      <div style={{ width: '100%', maxWidth: 360, background: C.card, border: `1px solid ${C.border}`, padding: '28px 24px' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: '0.04em', color: C.white, marginBottom: 20 }}>Reset Password</div>
        {sent
          ? <div style={{ padding: 14, background: 'rgba(0,217,102,0.1)', border: `1px solid ${C.accent}`, color: C.accent, fontFamily: "'Barlow', sans-serif", fontSize: 14 }}>✓ Reset link sent. Check your inbox.</div>
          : <>
              <label style={lbl}>Email</label>
              <input style={{ ...input, marginBottom: 16 }} type="email" placeholder="coach@email.com" value={email} onChange={e => setEmail(e.target.value)} />
              <button onClick={handle} style={btnPrimary}>Send Reset Link</button>
            </>
        }
        <button onClick={() => onSwitch('login')} style={{ ...btnOutline, marginTop: 12 }}>Back to Sign In</button>
      </div>
    </div>
  );
}

export default function Auth({ onDemo }) {
  const [screen, setScreen] = useState('login');
  if (screen === 'signup') return <Signup onSwitch={setScreen} />;
  if (screen === 'forgot') return <ForgotPassword onSwitch={setScreen} />;
  return <Login onSwitch={setScreen} onDemo={onDemo} />;
}
