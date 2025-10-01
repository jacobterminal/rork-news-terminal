import React, { useEffect, useMemo, useState } from 'react';
import { xShim } from '../shim/xShim';
import Column from '../components/Column';
import TickerTape from '../components/TickerTape';
import '../theme/tokens.css';
import '../theme/util.css';

function usePinnedTrackers() {
  const [loading, setLoading] = useState(true);
  const [trackers, setTrackers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const all = await xShim.listTrackers();
        const pinned = (all || []).filter(t => t.pinned);
        if (mounted) setTrackers(pinned);
      } catch (e) {
        console.error('[Boards] listTrackers error', e);
        if (mounted) setError(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return { loading, trackers, error };
}

function usePostsMap(trackerIds) {
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState({});

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      const result = {};
      try {
        await Promise.all((trackerIds || []).map(async (id) => {
          const posts = await xShim.listPosts(id);
          result[id] = posts || [];
        }));
      } catch (e) {
        console.error('[Boards] listPosts batch error', e);
      } finally {
        if (mounted) setMap(result);
        if (mounted) setLoading(false);
      }
    }
    if (trackerIds && trackerIds.length) run(); else { setMap({}); setLoading(false); }
    return () => { mounted = false; };
  }, [JSON.stringify(trackerIds)]);

  return { loading, map };
}

export default function Boards() {
  const { loading: loadingT, trackers } = usePinnedTrackers();
  const cols = useMemo(() => (trackers || []).slice(0, 3), [trackers]);
  const { loading: loadingP, map } = usePostsMap(cols.map(t => t.id));

  const allPosts = useMemo(() => {
    const posts = [];
    Object.values(map).forEach(arr => posts.push(...arr));
    return posts.sort((a, b) => b.ts - a.ts);
  }, [map]);

  if (loadingT || loadingP) {
    return (
      <div style={{ padding: 16 }}>
        <div className="label">Loading…</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TickerTape posts={allPosts} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: 8, flex: 1, overflow: 'auto' }}>
        {cols.map(t => (
          <Column key={t.id} tracker={t} posts={map[t.id] || []} />
        ))}
      </div>
    </div>
  );
}
