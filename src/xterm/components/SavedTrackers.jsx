import React, { useMemo } from 'react';
import '../theme/util.css';
import { xShim } from '../shim/xShim';
import { notify } from '../lib/notify';

export default function SavedTrackers({ trackers }) {
  const rows = trackers || [];

  const onOpen = (t) => notify({ title: 'Open tracker', body: `${t.title}\n${t.query}` });
  const onPinToggle = (t) => notify({ title: t.pinned ? 'Unpinned' : 'Pinned', body: t.title });

  return (
    <div className="panel" style={{ padding: 8 }}>
      <div className="label" style={{ textTransform: 'uppercase', color: 'var(--xt-warn)', fontWeight: 700, fontSize: 11, letterSpacing: '0.5px', borderTop: '1px solid var(--xt-border)', paddingTop: 8, marginBottom: 8 }}>Saved Trackers</div>
      <div className="list-scroll" style={{ maxHeight: 260 }}>
        {rows.map(t => (
          <div key={t.id} className="table-row" style={{ gridTemplateColumns: '1fr auto', columnGap: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span className="value" style={{ fontWeight: 600, fontSize: 12 }}>{t.title}</span>
              <span className="label" style={{ color: 'var(--xt-text-dim)', fontSize: 10, fontFamily: 'monospace' }}>{t.query}</span>
            </div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <button
                className="pill focusable"
                style={{
                  background: t.pinned ? 'var(--xt-border)' : 'transparent',
                  border: '1px solid var(--xt-border)',
                  cursor: 'pointer',
                  fontSize: 10,
                  textTransform: 'uppercase',
                  padding: '2px 6px',
                }}
                onClick={() => onPinToggle(t)}
              >
                {t.pinned ? 'Pinned' : 'Pin'}
              </button>
              <button
                className="pill focusable"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--xt-border)',
                  cursor: 'pointer',
                  fontSize: 10,
                  textTransform: 'uppercase',
                  padding: '2px 6px',
                }}
                onClick={() => onOpen(t)}
              >
                Open
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
