/* eslint-disable @rork/linters/general-no-raw-text */
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import '../theme/util.css';

export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const actions = useMemo(() => [
    { id: 'open-boards', label: 'Open Boards', run: () => window.dispatchEvent(new CustomEvent('xterm:open-boards')) },
    { id: 'focus-sidebar', label: 'Focus Sidebar', run: () => {
        const sidebar = document.querySelector('.grid-sidebar');
        if (!sidebar) return;
        const first = sidebar.querySelector('.focusable, button, [tabindex], input, select, textarea');
        if (first && first.focus) first.focus();
      }
    },
    { id: 'open-notifications', label: 'Open Notifications', run: () => window.dispatchEvent(new CustomEvent('xterm:open-notifications')) },
  ], []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter(a => a.label.toLowerCase().includes(q));
  }, [actions, query]);

  const runCurrent = useCallback(() => {
    const a = filtered[index];
    if (!a) return;
    try { a.run(); } catch (e) { console.error('[CommandPalette] action error', e); }
    if (onClose) onClose();
  }, [filtered, index, onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose && onClose(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); setIndex(i => Math.min(i + 1, Math.max(0, filtered.length - 1))); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setIndex(i => Math.max(0, i - 1)); }
      if (e.key === 'Enter') { e.preventDefault(); runCurrent(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, filtered.length, runCurrent, onClose]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
      setIndex(0);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div data-testid="command-palette" role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 80, zIndex: 50 }}>
      <div className="panel-elev" style={{ width: 560, maxWidth: '90vw' }}>
        <div className="row-compact" style={{ borderBottom: '1px solid var(--xt-border-subtle)' }}>
          <input ref={inputRef} className="focusable" placeholder="Type a command..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--xt-text)', outline: 'none' }} />
          <button className="pill focusable" onClick={onClose} style={{ background: 'transparent', cursor: 'pointer' }}>Esc</button>
        </div>
        <div ref={listRef} className="list-scroll" style={{ maxHeight: 280 }}>
          {filtered.length === 0 ? (
            <div className="table-row"><span className="label">No results</span></div>
          ) : (
            filtered.map((a, i) => (
              <div key={a.id} className="table-row focusable" tabIndex={0} onClick={runCurrent} style={{ background: i === index ? 'rgba(255,255,255,0.04)' : 'transparent', cursor: 'pointer', gridTemplateColumns: '1fr' }}>
                <span className="value">{a.label}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
