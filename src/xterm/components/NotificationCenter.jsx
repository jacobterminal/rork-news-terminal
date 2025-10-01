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
    <div className="panel-elev" style={{ position: 'absolute', right: 12, top: 56, width: 360, maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
      <div className="row-compact" style={{ borderBottom: '1px solid var(--xt-border-subtle)' }}>
        <span className="label">Notifications</span>
        <span style={{ marginLeft: 'auto' }} className="label">{items.length}</span>
      </div>
      <div className="list-scroll" style={{ padding: 8 }}>
        {items.length === 0 ? (
          <div className="label" style={{ padding: '12px 8px' }}>No notifications</div>
        ) : (
          items.map(n => (
            <div key={n.id} className="table-row" style={{ gridTemplateColumns: '64px 1fr', columnGap: 8 }}>
              <div className="label" style={{ color: 'var(--xt-text-dim)' }}>{timefmt(n.ts)}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div className="value" style={{ fontWeight: 600 }}>{n.title}</div>
                {n.body ? <div className="label" style={{ whiteSpace: 'pre-wrap' }}>{n.body}</div> : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
