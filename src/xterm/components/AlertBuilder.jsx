import React, { useState, useCallback } from 'react';
import '../theme/util.css';
import { notify } from '../lib/notify';

export default function AlertBuilder() {
  const [query, setQuery] = useState('');
  const [minLikes, setMinLikes] = useState('100');
  const [channel, setChannel] = useState('inbox');

  const onSave = useCallback(() => {
    if (!query.trim()) return;
    const likesNum = Number(minLikes) || 0;
    const showToast = channel === 'toast';
    notify({
      title: 'Alert saved',
      body: `IF [${query}] AND [min likes: ${likesNum}] → THEN [${channel}]`,
      showToast,
    });
    setQuery('');
    setMinLikes('100');
    setChannel('inbox');
  }, [query, minLikes, channel]);

  return (
    <div className="panel" style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="label" style={{ textTransform: 'uppercase', color: 'var(--xt-warn)', fontWeight: 700, fontSize: 11, letterSpacing: '0.5px', borderTop: '1px solid var(--xt-border)', paddingTop: 8, marginTop: 4 }}>Alert Builder</div>
      <label className="label" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span className="label" style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--xt-text-dim)' }}>IF Query</span>
        <input className="focusable" value={query} onChange={e => setQuery(e.target.value)} placeholder="$NVDA OR H200" style={{ background: 'var(--xt-bg)', border: '1px solid var(--xt-border)', color: 'var(--xt-text)', padding: '6px 8px', fontFamily: 'monospace', fontSize: 12 }} />
      </label>
      <label className="label" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span className="label" style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--xt-text-dim)' }}>AND Min Likes</span>
        <input className="focusable" type="number" value={minLikes} onChange={e => setMinLikes(e.target.value)} placeholder="100" style={{ background: 'var(--xt-bg)', border: '1px solid var(--xt-border)', color: 'var(--xt-text)', padding: '6px 8px', fontFamily: 'monospace', fontSize: 12 }} />
      </label>
      <label className="label" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span className="label" style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--xt-text-dim)' }}>THEN Channel</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="pill focusable"
            onClick={() => setChannel('toast')}
            style={{
              flex: 1,
              background: channel === 'toast' ? 'var(--xt-border)' : 'transparent',
              border: '1px solid var(--xt-border)',
              color: 'var(--xt-text)',
              padding: '6px 8px',
              cursor: 'pointer',
              fontSize: 11,
              textTransform: 'uppercase',
            }}
          >
            Toast
          </button>
          <button
            className="pill focusable"
            onClick={() => setChannel('inbox')}
            style={{
              flex: 1,
              background: channel === 'inbox' ? 'var(--xt-border)' : 'transparent',
              border: '1px solid var(--xt-border)',
              color: 'var(--xt-text)',
              padding: '6px 8px',
              cursor: 'pointer',
              fontSize: 11,
              textTransform: 'uppercase',
            }}
          >
            Inbox
          </button>
        </div>
      </label>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
        <button
          className="pill focusable"
          style={{
            background: 'transparent',
            border: '1px solid var(--xt-border)',
            color: 'var(--xt-text)',
            padding: '6px 12px',
            cursor: 'pointer',
            fontSize: 11,
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
          onClick={onSave}
        >
          Save Alert
        </button>
      </div>
    </div>
  );
}
