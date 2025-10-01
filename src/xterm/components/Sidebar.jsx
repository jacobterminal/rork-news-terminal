import React from 'react';
import '../theme/util.css';

export default function Sidebar() {
  return (
    <div className="sidebar list-scroll" role="complementary" aria-label="Navigation" data-testid="xterm-sidebar" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 12, padding: 12 }}>
      <section className="panel" style={{ padding: 8 }}>
        <div className="row-compact" style={{ justifyContent: 'space-between' }}>
          <span className="label">Saved Trackers</span>
          <span className="pill focusable" tabIndex={0} role="button" aria-label="New Tracker">New</span>
        </div>
        <div className="label" style={{ padding: '8px 8px 12px', borderTop: '1px solid var(--xt-border-subtle)', marginTop: 8 }}>
          Empty
        </div>
      </section>

      <section className="panel" style={{ padding: 8 }}>
        <div className="row-compact" style={{ justifyContent: 'space-between' }}>
          <span className="label">Alerts</span>
          <span className="pill focusable" tabIndex={0} role="button" aria-label="New Alert">New</span>
        </div>
        <div className="label" style={{ padding: '8px 8px 12px', borderTop: '1px solid var(--xt-border-subtle)', marginTop: 8 }}>
          Empty
        </div>
      </section>
    </div>
  );
}
