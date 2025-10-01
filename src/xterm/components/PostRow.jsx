import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import '../theme/util.css';
import { summarizeTweet, opinionTag } from '../lib/ai';
import { notify } from '../lib/notify';

export default function PostRow({ post }) {
  const [expanded, setExpanded] = useState(false);
  const summary = useMemo(() => summarizeTweet(post?.text || ''), [post?.text]);
  const opin = useMemo(() => opinionTag(post?.text || ''), [post?.text]);

  const onToggle = useCallback(() => setExpanded(v => !v), []);
  const onSave = useCallback(() => {
    notify({
      title: 'Saved post',
      body: `${post.author} ${post.handle}: ${summary}`,
    });
  }, [post, summary]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Enter') { e.preventDefault(); onToggle(); }
      if (e.key.toLowerCase() === 's') { e.preventDefault(); onSave(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onToggle, onSave]);

  const likes = post?.metrics?.like ?? 0;
  const rts = post?.metrics?.rt ?? 0;
  const links = post?.links?.length ?? 0;
  const media = post?.media?.length ?? 0;

  const opinColor = opin.label === 'bullish' ? 'var(--xt-up)' : opin.label === 'bearish' ? 'var(--xt-down)' : 'var(--xt-text-dim)';

  return (
    <div className="table-row focusable" tabIndex={0} style={{ gridTemplateColumns: '80px 1fr auto', columnGap: 8 }}>
      <div className="label" style={{ color: 'var(--xt-text-dim)' }}>{new Date(post.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="value" style={{ fontWeight: 600 }}>{post.author}</span>
          <span className="label">{post.handle}</span>
        </div>
        <div className="label" style={{ color: 'var(--xt-text-dim)' }}>{summary}</div>
        {expanded ? (
          <div className="value" style={{ whiteSpace: 'pre-wrap' }}>{post.text}</div>
        ) : null}
        <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
          <span className="pill" style={{ borderColor: opinColor, color: opinColor }}>Opinion: {opin.label} {Math.round(opin.conf * 100)}%</span>
          <span className="pill"><span className="label">links</span><span className="value">{links}</span></span>
          <span className="pill"><span className="label">media</span><span className="value">{media}</span></span>
          <span className="pill"><span className="label">❤</span><span className="value">{likes}</span></span>
          <span className="pill"><span className="label">🔁</span><span className="value">{rts}</span></span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="pill focusable" onClick={onToggle} style={{ background: 'transparent', cursor: 'pointer' }}>{expanded ? 'Collapse' : 'Expand'}</button>
        <button className="pill focusable" onClick={onSave} style={{ background: 'transparent', cursor: 'pointer' }}>Save</button>
      </div>
    </div>
  );
}
