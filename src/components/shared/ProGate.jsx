import React from 'react';
import { THEME } from '../../theme';

// Wraps premium features — shows upgrade prompt if not subscribed
export default function ProGate({ children, user, feature, theme }) {
  const t = theme || THEME;

  // For now, allow all access (paywall enforcement comes when Creem is live)
  // To enforce: check user's subscription status from Firestore
  const hasAccess = true; // Will be: subStatus === 'active' || subStatus === 'trial'

  if (hasAccess) return children;

  return (
    <div style={{
      padding: '48px 24px', textAlign: 'center',
      background: t.g900, border: `1px solid ${t.g700}`,
      margin: '16px',
    }}>
      <div style={{
        width: 48, height: 48, margin: '0 auto 16px',
        background: t.accent + '15', border: `1px solid ${t.accentD}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: t.accent,
      }}>PRO</div>
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif", fontSize: 24,
        color: t.white, letterSpacing: 1, marginBottom: 8,
      }}>COACH PRO FEATURE</div>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12,
        color: t.g500, lineHeight: 1.5, maxWidth: 280, margin: '0 auto 20px',
      }}>
        {feature || 'This feature'} requires a Coach Pro subscription. Upgrade for $9.99/month to unlock everything.
      </div>
      <button onClick={() => {
        // Navigate to settings tab - parent handles this
        window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'settings' }));
      }} style={{
        padding: '12px 24px', background: t.accent, border: 'none', color: '#000',
        fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700,
        letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
      }}>UPGRADE TO PRO</button>
    </div>
  );
}
