import React, { useMemo, useState, useCallback, useEffect } from 'react';
import '../theme/util.css';
import { summarizeTweet, opinionTag } from '../lib/ai';
import { notify } from '../lib/notify';

export default function TrackerPostRow({ post, selected = false, forceExpandKey, forceSaveKey }) {
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
    const sentences = (summary || '').split(/[.!?]+/).filter(Boolean);
    if (sentences.length > 2) {
      console.warn('[QA] Summary exceeds 2 sentences', { id: post?.id, sentences: sentences.length });
    }
  }, [summary, post?.id]);

  useEffect(() => {
    if (forceExpandKey !== undefined) {
      setExpanded(v => !v);
    }
  }, [forceExpandKey]);

  useEffect(() => {
    if (forceSaveKey !== undefined) {
      onSave();
    }
  }, [forceSaveKey, onSave]);

  const likes = post?.metrics?.like ?? 0;
  const rts = post?.metrics?.rt ?? 0;
  const links = post?.links?.length ?? 0;
  const media = post?.media?.length ?? 0;

  const opinColor = opin.label === 'bullish' ? 'var(--xt-up)' : opin.label === 'bearish' ? 'var(--xt-down)' : 'var(--xt-text-dim)';
  const opinIcon = opin.label === 'bullish' ? '🟩' : opin.label === 'bearish' ? '🟥' : '⚪';

  const time = new Date(post.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className="table-row focusable" tabIndex={0} style={{ gridTemplateColumns: '50px 1fr', columnGap: 8, padding: '6px 8px', borderBottom: '1px solid var(--xt-border-subtle)', background: selected ? 'rgba(255,255,255,0.04)' : 'transparent' }}>
      <div className="label" style={{ color: 'var(--xt-text-dim)', fontFamily: 'monospace', fontSize: 10 }}>{time}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="value" style={{ fontWeight: 600, fontSize: 11 }}>{post.author}</span>
          <span className="label" style={{ fontSize: 10 }}>{post.handle}</span>
        </div>
        <div className="label" style={{ color: 'var(--xt-text)', fontSize: 11, lineHeight: 1.4 }}>{summary}</div>
        {expanded ? (
          <div className="value" style={{ whiteSpace: 'pre-wrap', fontSize: 11, marginTop: 4, padding: 6, background: 'var(--xt-panel-elev)', borderRadius: 'var(--xt-radius-xs)', border: '1px solid var(--xt-border-subtle)' }}>{post.text}</div>
        ) : null}
        <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="pill" style={{ borderColor: opinColor, color: opinColor, fontSize: 10, padding: '1px 6px' }}>{opinIcon} {opin.label.toUpperCase()} {Math.round(opin.conf * 100)}%</span>
          {links > 0 && <span className="pill" style={{ fontSize: 10, padding: '1px 6px' }}><span className="label">links</span><span className="value" style={{ fontFamily: 'monospace' }}>{links}</span></span>}
          {media > 0 && <span className="pill" style={{ fontSize: 10, padding: '1px 6px' }}><span className="label">media</span><span className="value" style={{ fontFamily: 'monospace' }}>{media}</span></span>}
          <span className="pill" style={{ fontSize: 10, padding: '1px 6px' }}><span className="label">❤</span><span className="value" style={{ fontFamily: 'monospace' }}>{likes}</span></span>
          <span className="pill" style={{ fontSize: 10, padding: '1px 6px' }}><span className="label">🔁</span><span className="value" style={{ fontFamily: 'monospace' }}>{rts}</span></span>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
          <button className="pill focusable" onClick={onToggle} style={{ background: 'transparent', cursor: 'pointer', fontSize: 10, padding: '2px 8px', border: '1px solid var(--xt-border)' }}>{expanded ? 'Collapse' : 'Expand'}</button>
          <button className="pill focusable" onClick={onSave} style={{ background: 'transparent', cursor: 'pointer', fontSize: 10, padding: '2px 8px', border: '1px solid var(--xt-border)' }}>Save</button>
        </div>
      </div>
    </div>
  );
}
