import React, { useMemo } from 'react';
import '../theme/util.css';
import TrackerPostRow from './TrackerPostRow';

export default function TrackerColumn({ tracker, posts }) {
  const sorted = useMemo(() => {
    return [...(posts || [])]
      .map(p => ({ ...p, __score: (p?.metrics?.like || 0) + (p?.metrics?.rt || 0) }))
      .sort((a, b) => (b.__score || 0) - (a.__score || 0));
  }, [posts]);

  const totalPosts = sorted.length;
  const bullishCount = sorted.filter(p => {
    const t = (p.text || '').toLowerCase();
    return t.includes('bull') || t.includes('up') || t.includes('strong') || t.includes('beat');
  }).length;
  const sentimentPct = totalPosts > 0 ? Math.round((bullishCount / totalPosts) * 100) : 50;
  const sentiment = sentimentPct > 60 ? 'Bullish' : sentimentPct < 40 ? 'Bearish' : 'Neutral';
  const velocity = totalPosts > 15 ? 'High' : totalPosts > 8 ? 'Medium' : 'Low';

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', minWidth: 0, height: 'calc(100vh - 120px)' }}>
      <div style={{ borderBottom: '1px solid var(--xt-warn)', padding: '8px 12px', background: 'var(--xt-panel-elev)' }}>
        <div style={{ color: 'var(--xt-warn)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
          {tracker.title}
        </div>
        <div className="label" style={{ fontSize: 10, marginBottom: 6 }}>{tracker.query}</div>
        <div style={{ display: 'flex', gap: 12, fontSize: 10 }}>
          <span className="label">Tweets Today: <span className="value" style={{ fontFamily: 'monospace' }}>{totalPosts}</span></span>
          <span className="label">Sentiment: <span className="value" style={{ fontFamily: 'monospace', color: sentiment === 'Bullish' ? 'var(--xt-up)' : sentiment === 'Bearish' ? 'var(--xt-down)' : 'var(--xt-text-dim)' }}>{sentiment} {sentimentPct}%</span></span>
          <span className="label">Velocity: <span className="value" style={{ fontFamily: 'monospace' }}>{velocity}</span></span>
        </div>
      </div>
      <div className="list-scroll" style={{ flex: 1 }}>
        {sorted.map(p => (
          <TrackerPostRow key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}
