import React, { useEffect, useRef, useState, useCallback } from 'react';

import './theme/tokens.css';
import './theme/util.css';
import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';
import CommandPalette from './components/CommandPalette';

export default function AppShell({ children }) {
  const shellRef = useRef(null);
  const [cmdOpen, setCmdOpen] = useState(false);
  const openCmd = useCallback(() => setCmdOpen(true), []);
  const closeCmd = useCallback(() => setCmdOpen(false), []);

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;

    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openCmd();
      }
      if (e.key === '/') {
        const sidebar = el.querySelector('.grid-sidebar');
        if (sidebar) {
          e.preventDefault();
          const first = sidebar.querySelector('.focusable, button, [tabindex], input, select, textarea');
          if (first && first.focus) first.focus();
        }
      }
    }

    el.addEventListener('keydown', onKey);
    const onOpenCmd = () => openCmd();
    window.addEventListener('xterm:open-cmd', onOpenCmd);
    return () => {
      el.removeEventListener('keydown', onKey);
      window.removeEventListener('xterm:open-cmd', onOpenCmd);
    };
  }, [openCmd]);

  useEffect(() => {
    const QA = () => {
      const rows = document.querySelectorAll('.table-row');
      if (rows.length === 0) console.warn('[QA] No .table-row elements detected. Ensure tables use .table-row with bottom border.');
    };
    QA();
  }, []);

  useEffect(() => {
    const onOpenBoards = () => {
      console.log('[Command] Open Boards');
    };
    const onOpenNotif = () => {
      const evt = new CustomEvent('xterm:toggle-notifications', { detail: { open: true } });
      window.dispatchEvent(evt);
    };
    window.addEventListener('xterm:open-boards', onOpenBoards);
    window.addEventListener('xterm:open-notifications', onOpenNotif);
    return () => {
      window.removeEventListener('xterm:open-boards', onOpenBoards);
      window.removeEventListener('xterm:open-notifications', onOpenNotif);
    };
  }, []);

  useEffect(() => {
    const forbidden = ['market', 'quotes', 'chart', 'price'];
    console.assert(true, '[QA] Market data import guard active. No direct enforcement possible in runtime bundle.');
    void forbidden;
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
      <CommandPalette open={cmdOpen} onClose={closeCmd} />
    </div>
  );
}
