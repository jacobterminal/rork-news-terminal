import React, { useMemo } from 'react';
import '../theme/tokens.css';
import '../theme/util.css';
import { summarizeTweet, opinionTag } from '../lib/ai';

function formatTime(ts) {
  const d = new Date(ts);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function extractCashtags(text) {
  const matches = text.match(/\$[A-Z]{1,5}\b/g);
  return matches ? [...new Set(matches)] : [];
}

function computeSentiment(post) {
  const text = (post.text || '').toLowerCase();
  const bullish = ['bullish', 'up', 'gain', 'rally', 'strong', 'buy', 'positive', 'growth'];
  const bearish = ['bearish', 'down', 'drop', 'fall', 'weak', 'sell', 'negative', 'decline'];
  
  let score = 0;
  bullish.forEach(w => { if (text.includes(w)) score += 1; });
  bearish.forEach(w => { if (text.includes(w)) score -= 1; });
  
  if (score > 0) return { label: 'Bullish', color: 'var(--xt-up)', pct: Math.min(100, 50 + score * 10) };
  if (score < 0) return { label: 'Bearish', color: 'var(--xt-down)', pct: Math.min(100, 50 + Math.abs(score) * 10) };
  return { label: 'Neutral', color: 'var(--xt-text-dim)', pct: 50 };
}

function computeImpact(metrics) {
  const total = (metrics?.like || 0) + (metrics?.rt || 0);
  if (total > 1000) return { label: 'High', color: 'var(--xt-down)' };
  if (total > 300) return { label: 'Medium', color: 'var(--xt-warn)' };
  return { label: 'Low', color: 'var(--xt-text-dim)' };
}

export default function TrackerPostRow({ post }) {
  const time = useMemo(() => formatTime(post.ts), [post.ts]);
  const cashtags = useMemo(() => extractCashtags(post.text), [post.text]);
  const sentiment = useMemo(() => computeSentiment(post), [post]);
  const impact = useMemo(() => computeImpact(post.metrics), [post.metrics]);
  const aiOverview = useMemo(() => summarizeTweet(post.text), [post.text]);
  const aiOpinion = useMemo(() => opinionTag(post.text), [post.text]);

  const preview = post.text.length > 80 ? post.text.slice(0, 80) + '…' : post.text;

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '48px 1fr auto', 
      gap: 8, 
      padding: '8px 12px', 
      borderBottom: '1px solid var(--xt-border-subtle)',
      alignItems: 'start'
    }}>
      <div className="label" style={{ fontSize: 11 }}>
        {time}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="value" style={{ fontSize: 11, fontWeight: 600 }}>
            {post.author}
          </span>
          <span className="label" style={{ fontSize: 10 }}>
            {post.handle}
          </span>
        </div>

        <div className="value" style={{ fontSize: 11, lineHeight: 1.4, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {preview}
        </div>

        {cashtags.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 2 }}>
            {cashtags.map(tag => (
              <span key={tag} className="pill" style={{ fontSize: 10, padding: '1px 6px', color: 'var(--xt-info)' }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--xt-border-subtle)' }}>
          <div className="label" style={{ fontSize: 10, marginBottom: 3 }}>
            AI OVERVIEW
          </div>
          <div className="value" style={{ fontSize: 10, lineHeight: 1.4, color: 'var(--xt-text-dim)' }}>
            {aiOverview}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span className="label" style={{ fontSize: 10 }}>AI OPINION</span>
            <span 
              className="pill" 
              style={{ 
                fontSize: 10, 
                padding: '2px 6px', 
                borderColor: aiOpinion.label === 'bullish' ? 'var(--xt-up)' : aiOpinion.label === 'bearish' ? 'var(--xt-down)' : 'var(--xt-text-dim)',
                color: aiOpinion.label === 'bullish' ? 'var(--xt-up)' : aiOpinion.label === 'bearish' ? 'var(--xt-down)' : 'var(--xt-text-dim)'
              }}
            >
              {aiOpinion.label.toUpperCase()} {Math.round(aiOpinion.conf * 100)}%
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
        <div className="pill" style={{ fontSize: 10, padding: '2px 6px', borderColor: sentiment.color, color: sentiment.color }}>
          {sentiment.label} {sentiment.pct}%
        </div>
        <div className="pill" style={{ fontSize: 10, padding: '2px 6px', borderColor: impact.color, color: impact.color }}>
          {impact.label}
        </div>
        {post.metrics && (
          <div style={{ display: 'flex', gap: 6, fontSize: 10, color: 'var(--xt-text-dim)', marginTop: 2 }}>
            <span>❤ {post.metrics.like || 0}</span>
            <span>🔁 {post.metrics.rt || 0}</span>
          </div>
        )}
      </div>
    </div>
  );
}
