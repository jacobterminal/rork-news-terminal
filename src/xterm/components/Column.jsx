import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import '../theme/util.css';
import PostRow from './PostRow';

export default function Column({ tracker, posts }) {
  const rootRef = useRef(null);
  const [idx, setIdx] = useState(0);
  const [toggleKey, setToggleKey] = useState(0);
  const [saveKey, setSaveKey] = useState(0);

  const sorted = useMemo(() => {
    return [...(posts || [])]
      .map(p => ({ ...p, __score: (p?.metrics?.like || 0) + (p?.metrics?.rt || 0) }))
      .sort((a, b) => (b.__score || 0) - (a.__score || 0));
  }, [posts]);

  useEffect(() => { setIdx(0); }, [tracker?.id]);

  const onKeyDown = useCallback((e) => {
    if (!sorted.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i + 1, sorted.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i => Math.max(0, i - 1)); }
    if (e.key === 'Enter') { e.preventDefault(); setToggleKey(k => k + 1); }
    if (e.key.toLowerCase() === 's') { e.preventDefault(); setSaveKey(k => k + 1); }
  }, [sorted.length]);

  return (
    <div ref={rootRef} className="panel focusable" tabIndex={0} onKeyDown={onKeyDown} style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <div className="row-compact" style={{ borderBottom: '1px solid var(--xt-border-subtle)' }}>
        <span className="value" style={{ fontWeight: 600 }}>{tracker.title}</span>
        <span className="label" style={{ color: 'var(--xt-text-dim)' }}>{tracker.query}</span>
      </div>
      <div className="list-scroll" style={{ maxHeight: 'calc(100vh - 64px)' }}>
        {sorted.map((p, i) => (
          <PostRow key={p.id} post={p} selected={i === idx} forceToggleKey={i === idx ? toggleKey : undefined} forceSaveKey={i === idx ? saveKey : undefined} />
        ))}
      </div>
    </div>
  );
}
