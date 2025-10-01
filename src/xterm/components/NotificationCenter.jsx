import React, { useEffect, useState, useCallback } from 'react';
import '../theme/util.css';
import { getNotifications, onNotify } from '../lib/notify';

export default function NotificationCenter({ open, onClose }) {
  const [items, setItems] = useState(() => getNotifications());

  useEffect(() => {
    const off = onNotify(() => setItems(getNotifications()))
    return () => off();
  }, []);

  const timefmt = useCallback((ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  if (!open) return null;

  return (
    <div className="panel-elev" style={{ position: 'absolute', right: 12, top: 56, width: 360, maxHeight: '70vh', display: 'flex', flexDirection: 'column', zIndex: 1000 }}>
      <div className="row-compact" style={{ borderBottom: '1px solid var(--xt-border)', background: 'var(--xt-panel)' }}>
        <span className="label" style={{ textTransform: 'uppercase', fontWeight: 700, fontSize: 11, letterSpacing: '0.5px', color: 'var(--xt-warn)' }}>Notifications</span>
        <span className="pill" style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 6px' }}>{items.length}</span>
      </div>
      <div className="list-scroll" style={{ padding: 8, background: 'var(--xt-bg)' }}>
        {items.length === 0 ? (
          <div className="label" style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--xt-text-dim)', fontSize: 11 }}>No notifications</div>
        ) : (
          items.map(n => (
            <div key={n.id} className="table-row" style={{ gridTemplateColumns: '52px 1fr', columnGap: 8, padding: '8px 6px' }}>
              <div className="label" style={{ color: 'var(--xt-text-dim)', fontSize: 10, fontFamily: 'monospace' }}>{timefmt(n.ts)}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div className="value" style={{ fontWeight: 600, fontSize: 12 }}>{n.title}</div>
                {n.body ? <div className="label" style={{ whiteSpace: 'pre-wrap', fontSize: 11, color: 'var(--xt-text-dim)' }}>{n.body}</div> : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
