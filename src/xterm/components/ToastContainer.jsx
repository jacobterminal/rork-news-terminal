import React, { useEffect, useState, useCallback } from 'react';
import '../theme/util.css';
import { onToast } from '../lib/notify';

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const off = onToast((item) => {
      setToasts(prev => [...prev, item]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== item.id));
      }, 4000);
    });
    return () => off();
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360 }}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="panel-elev"
          style={{
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            border: '1px solid var(--xt-border)',
            background: 'var(--xt-panel)',
            animation: 'slideInRight 0.2s ease-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="value" style={{ fontWeight: 700, fontSize: 12, color: 'var(--xt-text)' }}>{toast.title}</div>
            <button
              onClick={() => dismiss(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--xt-text-dim)',
                cursor: 'pointer',
                padding: 0,
                fontSize: 16,
                lineHeight: 1,
              }}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
          {toast.body && (
            <div className="label" style={{ fontSize: 11, color: 'var(--xt-text-dim)', whiteSpace: 'pre-wrap' }}>
              {toast.body}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
