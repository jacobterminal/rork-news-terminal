import React, { useMemo } from 'react';
import '../theme/util.css';
import PostRow from './PostRow';

export default function Column({ tracker, posts }) {
  const sorted = useMemo(() => {
    return [...(posts || [])]
      .map(p => ({ ...p, __score: (p?.metrics?.like || 0) + (p?.metrics?.rt || 0) }))
      .sort((a, b) => (b.__score || 0) - (a.__score || 0));
  }, [posts]);

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <div className="row-compact" style={{ borderBottom: '1px solid var(--xt-border-subtle)' }}>
        <span className="value" style={{ fontWeight: 600 }}>{tracker.title}</span>
        <span className="label" style={{ color: 'var(--xt-text-dim)' }}>{tracker.query}</span>
      </div>
      <div className="list-scroll" style={{ maxHeight: 'calc(100vh - 64px)' }}>
        {sorted.map(p => (
          <PostRow key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}
