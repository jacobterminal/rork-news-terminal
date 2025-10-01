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
      <div className="row-compact" style={{ borderBottom: '1px solid var(--xt-border-subtle)' }}>
        <span className="label">Saved Trackers</span>
      </div>
      <div className="list-scroll" style={{ maxHeight: 260 }}>
        {rows.map(t => (
          <div key={t.id} className="table-row" style={{ gridTemplateColumns: '1fr auto', columnGap: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span className="value" style={{ fontWeight: 600 }}>{t.title}</span>
              <span className="label" style={{ color: 'var(--xt-text-dim)' }}>{t.query}</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="pill focusable" style={{ background: 'transparent', cursor: 'pointer' }} onClick={() => onPinToggle(t)}>{t.pinned ? 'Unpin' : 'Pin'}</button>
              <button className="pill focusable" style={{ background: 'transparent', cursor: 'pointer' }} onClick={() => onOpen(t)}>Open</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
