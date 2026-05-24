import React from 'react';

export default function Nav({ tabs, active, onChange, theme }) {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      display: 'flex',
      background: theme.g900,
      borderTop: `1px solid ${theme.g700}`,
      paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 100,
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
    }}>
      {tabs.map(t => {
        const isActive = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            flex: '1 0 auto', minWidth: 52,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 2, padding: '8px 4px 6px',
            color: isActive ? theme.accent : theme.g500,
            position: 'relative', transition: 'color 0.15s',
            background: 'none', border: 'none', cursor: 'pointer',
          }}>
            {isActive && (
              <div style={{
                position: 'absolute', top: 0, left: '20%', right: '20%',
                height: 2, background: theme.accent,
              }} />
            )}
            <span style={{ fontSize: 15, lineHeight: 1 }}>{t.icon}</span>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 9, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              {t.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
