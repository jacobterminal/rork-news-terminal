import React, { useEffect, useRef } from 'react';

import './theme/tokens.css';
import './theme/util.css';
import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';

export default function AppShell({ children }) {
  const shellRef = useRef(null);

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;

    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const target = el.querySelector('[data-focus-target="omnibox"]');
        if (target) target.focus();
      }
      if (e.key === '/') {
        const target = el.querySelector('[data-focus-target="search"]');
        if (target) {
          e.preventDefault();
          target.focus();
        }
      }
    }

    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div ref={shellRef} className="grid-root" data-testid="xterm-shell">
      <div className="grid-topbar">
        <Topbar />
      </div>
      <div className="grid-sidebar">
        <Sidebar />
      </div>
      <div className="grid-content">
        {children ?? (
          <div style={{ padding: 12 }}>
            <div className="panel" style={{ height: '100%', minHeight: 240 }} />
          </div>
        )}
      </div>
    </div>
  );
}
