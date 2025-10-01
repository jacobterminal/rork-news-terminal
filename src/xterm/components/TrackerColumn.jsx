import React, { useMemo } from 'react';
import TrackerPostRow from './TrackerPostRow';
import '../theme/tokens.css';
import '../theme/util.css';

export default function TrackerColumn({ tracker, posts }) {
  const sorted = useMemo(() => {
    const arr = [...(posts || [])];
    arr.sort((a, b) => {
      const aScore = (a.metrics?.like || 0) + (a.metrics?.rt || 0);
      const bScore = (b.metrics?.like || 0) + (b.metrics?.rt || 0);
      return bScore - aScore;
    });
    return arr;
  }, [posts]);

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ borderBottom: '1px solid var(--xt-border)', padding: '8px 12px' }}>
        <div style={{ color: 'var(--xt-warn)', fontWeight: 700, textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.5px', marginBottom: 4 }}>
          {tracker.title}
        </div>
        <div className="label" style={{ fontSize: 10 }}>
          {tracker.query}
        </div>
      </div>

      <div className="list-scroll" style={{ flex: 1 }}>
        {sorted.map(post => (
          <TrackerPostRow key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
