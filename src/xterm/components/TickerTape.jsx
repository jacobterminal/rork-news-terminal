import React, { useEffect, useRef, useState } from 'react';
import '../theme/util.css';

export default function TickerTape({ posts }) {
  const [items, setItems] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!posts || posts.length === 0) return;
    const recent = posts.slice(0, 20).map(p => ({
      id: p.id,
      handle: p.handle,
      text: (p.text || '').slice(0, 80).replace(/\s+/g, ' ').trim(),
      ts: p.ts,
    }));
    setItems(recent);
  }, [posts]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let offset = 0;
    const speed = 0.5;
    let animId;
    const animate = () => {
      offset += speed;
      if (offset >= el.scrollWidth / 2) offset = 0;
      el.scrollLeft = offset;
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [items]);

  if (items.length === 0) return null;

  const doubled = [...items, ...items];

  return (
    <div style={{ height: 28, background: 'var(--xt-panel)', borderBottom: '1px solid var(--xt-border)', overflow: 'hidden', position: 'relative' }}>
      <div ref={scrollRef} style={{ display: 'flex', alignItems: 'center', height: '100%', overflow: 'hidden', whiteSpace: 'nowrap' }}>
        {doubled.map((item, i) => (
          <div key={`${item.id}-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, paddingRight: 24, flexShrink: 0 }}>
            <span className="label" style={{ color: 'var(--xt-warn)', fontWeight: 600 }}>{item.handle}</span>
            <span className="value" style={{ fontSize: 11 }}>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
