import React, { useState, useCallback } from 'react';
import '../theme/util.css';
import NotificationCenter from './NotificationCenter';

export default function Topbar() {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen(v => !v), []);

  return (
    <div className="topbar row-compact" role="banner" data-testid="xterm-topbar" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="label" style={{ letterSpacing: 1.2 }} aria-label="RORK X Terminal">RORK • X TERMINAL</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="pill focusable" tabIndex={0} title="Command Menu" aria-label="Command Menu" data-focus-target="omnibox">
          <span className="label">CMD</span>
          <span className="label" aria-hidden="true">/</span>
          <span className="label">CTRL</span>
          <span className="label" aria-hidden="true">+</span>
          <span className="value">K</span>
        </span>
        <button className="pill focusable" tabIndex={0} aria-label="Notifications" onClick={toggle} style={{ background: 'transparent', cursor: 'pointer' }}>
          <span className="label">Bell</span>
        </button>
      </div>
      <NotificationCenter open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
