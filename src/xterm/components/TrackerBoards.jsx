import React, { useEffect, useState, useMemo } from 'react';
import '../theme/util.css';
import { xShim } from '../shim/xShim';
import TrackerColumnWithKeyboard from './TrackerColumnWithKeyboard';

export default function TrackerBoards() {
  const [trackers, setTrackers] = useState([]);
  const [postsMap, setPostsMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[TrackerBoards] mounting');
    let mounted = true;
    (async () => {
      try {
        const t = await xShim.listTrackers();
        console.log('[TrackerBoards] trackers', t);
        if (!mounted) return;
        setTrackers(t);
        const pinned = t.filter(x => x.pinned);
        const map = {};
        for (const tr of pinned) {
          const posts = await xShim.listPosts(tr.id);
          map[tr.id] = posts;
        }
        if (!mounted) return;
        setPostsMap(map);
        setLoading(false);
      } catch (e) {
        console.error('[TrackerBoards] error', e);
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const pinnedTrackers = useMemo(() => trackers.filter(t => t.pinned), [trackers]);

  if (loading) {
    return (
      <div style={{ padding: 16, color: 'var(--xt-text-dim)' }}>Loading trackers...</div>
    );
  }

  if (pinnedTrackers.length === 0) {
    return (
      <div style={{ padding: 16, color: 'var(--xt-text-dim)' }}>No pinned trackers found.</div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: 12, height: '100%', overflow: 'auto' }}>
      {pinnedTrackers.map(tracker => (
        <TrackerColumnWithKeyboard key={tracker.id} tracker={tracker} posts={postsMap[tracker.id] || []} />
      ))}
    </div>
  );
}
