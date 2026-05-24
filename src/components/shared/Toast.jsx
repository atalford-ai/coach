import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, opts = {}) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      type: opts.type || 'success',    // success | error | info | undo
      duration: opts.duration || 3500,
      onUndo: opts.onUndo || null,
    };
    setToasts(prev => [...prev, toast]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((msg, opts) => addToast(msg, opts), [addToast]);
  toast.success = (msg, opts) => addToast(msg, { ...opts, type: 'success' });
  toast.error = (msg, opts) => addToast(msg, { ...opts, type: 'error' });
  toast.info = (msg, opts) => addToast(msg, { ...opts, type: 'info' });
  toast.undo = (msg, onUndo) => addToast(msg, { type: 'undo', duration: 5000, onUndo });

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  return (
    <div style={{
      position: 'fixed', bottom: 70, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, display: 'flex', flexDirection: 'column-reverse', gap: 8,
      pointerEvents: 'none', width: '90%', maxWidth: 400,
    }}>
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

const COLORS = {
  success: { bg: '#00d96618', border: '#00d96650', text: '#00d966', icon: '\u2713' },
  error:   { bg: '#e0555518', border: '#e0555550', text: '#e05555', icon: '!' },
  info:    { bg: '#38bdf818', border: '#38bdf850', text: '#38bdf8', icon: 'i' },
  undo:    { bg: '#f9731618', border: '#f9731650', text: '#f97316', icon: '\u21A9' },
};

function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(toast.id), 250);
    }, toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const c = COLORS[toast.type] || COLORS.success;

  const handleUndo = () => {
    if (toast.onUndo) toast.onUndo();
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 250);
  };

  return (
    <div style={{
      background: '#111815',
      border: `1px solid ${c.border}`,
      padding: '12px 16px',
      display: 'flex', alignItems: 'center', gap: 10,
      pointerEvents: 'auto',
      transform: visible && !exiting ? 'translateY(0)' : 'translateY(20px)',
      opacity: visible && !exiting ? 1 : 0,
      transition: 'all 0.25s ease',
    }}>
      <div style={{
        width: 22, height: 22, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: c.bg, border: `1px solid ${c.border}`,
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: 11, fontWeight: 700, color: c.text,
      }}>
        {c.icon}
      </div>
      <div style={{
        flex: 1,
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: 13, fontWeight: 600, letterSpacing: '0.04em',
        color: '#eef5f1',
      }}>
        {toast.message}
      </div>
      {toast.onUndo && (
        <button onClick={handleUndo} style={{
          background: 'none', border: `1px solid ${c.border}`,
          color: c.text, padding: '4px 10px', cursor: 'pointer',
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
        }}>
          UNDO
        </button>
      )}
      <button onClick={() => { setExiting(true); setTimeout(() => onRemove(toast.id), 250); }} style={{
        background: 'none', border: 'none', color: '#3d5a47',
        cursor: 'pointer', fontSize: 14, padding: '0 2px',
      }}>
        \u2715
      </button>
    </div>
  );
}
