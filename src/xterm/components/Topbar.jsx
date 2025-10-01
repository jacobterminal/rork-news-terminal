import React from 'react';
import '../theme/util.css';

export default function Topbar() {
  return (
    <div className="topbar row-compact" role="banner" data-testid="xterm-topbar">
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
        <span className="pill focusable" tabIndex={0} role="button" aria-label="Notifications">
          <span className="label">Bell</span>
        </span>
      </div>
    </div>
  );
}
