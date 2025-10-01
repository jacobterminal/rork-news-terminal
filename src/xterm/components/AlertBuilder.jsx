import React, { useState, useCallback } from 'react';
import '../theme/util.css';
import { notify } from '../lib/notify';

export default function AlertBuilder() {
  const [query, setQuery] = useState('');
  const [minLikes, setMinLikes] = useState('100');
  const [channel, setChannel] = useState('inbox');

  const onSave = useCallback(() => {
    const likesNum = Number(minLikes) || 0;
    notify({
      title: 'Alert saved',
      body: `Query: ${query}\nMin likes: ${likesNum}\nChannel: ${channel}`,
    });
    setQuery('');
    setMinLikes('100');
    setChannel('inbox');
  }, [query, minLikes, channel]);

  return (
    <div className="panel" style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="label">New Alert</div>
      <label className="label" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span className="label">Query</span>
        <input className="focusable" value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g., $NVDA OR H200" style={{ background: 'transparent', border: '1px solid var(--xt-border)', color: 'var(--xt-text)', padding: '6px 8px', borderRadius: '2px' }} />
      </label>
      <label className="label" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span className="label">Min likes</span>
        <input className="focusable" value={minLikes} onChange={e => setMinLikes(e.target.value)} placeholder="100" style={{ background: 'transparent', border: '1px solid var(--xt-border)', color: 'var(--xt-text)', padding: '6px 8px', borderRadius: '2px' }} />
      </label>
      <label className="label" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span className="label">Channel</span>
        <select className="focusable" value={channel} onChange={e => setChannel(e.target.value)} style={{ background: 'transparent', border: '1px solid var(--xt-border)', color: 'var(--xt-text)', padding: '6px 8px', borderRadius: '2px' }}>
          <option value="toast">toast</option>
          <option value="inbox">inbox</option>
        </select>
      </label>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="pill focusable" style={{ background: 'transparent', cursor: 'pointer' }} onClick={onSave}>Save Alert</button>
      </div>
    </div>
  );
}
