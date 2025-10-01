import React, { useMemo, useState, useCallback, useEffect } from 'react';
import '../theme/util.css';
import { summarizeTweet, opinionTag } from '../lib/ai';
import { notify } from '../lib/notify';

export default function PostRow({ post, selected = false, forceToggleKey, forceSaveKey, onExpand, onSave: onSaveProp }) {
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
    if (forceToggleKey !== undefined) {
      setExpanded(v => !v);
      if (onExpand) onExpand(post);
    }
  }, [forceToggleKey]);

  useEffect(() => {
    if (forceSaveKey !== undefined) {
      onSave();
      if (onSaveProp) onSaveProp(post);
    }
  }, [forceSaveKey]);

  const likes = post?.metrics?.like ?? 0;
  const rts = post?.metrics?.rt ?? 0;
  const links = post?.links?.length ?? 0;
  const media = post?.media?.length ?? 0;

  const opinColor = opin.label === 'bullish' ? 'var(--xt-up)' : opin.label === 'bearish' ? 'var(--xt-down)' : 'var(--xt-text-dim)';

  return (
    <div className="table-row focusable" tabIndex={0} style={{ gridTemplateColumns: '80px 1fr auto', columnGap: 8, background: selected ? 'rgba(255,255,255,0.04)' : 'transparent' }}>
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
        <button className="pill focusable" onClick={() => { setExpanded(v => !v); if (onExpand) onExpand(post); }} style={{ background: 'transparent', cursor: 'pointer' }}>{expanded ? 'Collapse' : 'Expand'}</button>
        <button className="pill focusable" onClick={() => { onSave(); if (onSaveProp) onSaveProp(post); }} style={{ background: 'transparent', cursor: 'pointer' }}>Save</button>
      </div>
    </div>
  );
}
