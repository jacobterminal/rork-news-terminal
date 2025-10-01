import React, { useEffect, useState, useMemo } from 'react';
import { xShim } from '../shim/xShim';
import TrackerColumn from './TrackerColumn';
import '../theme/tokens.css';
import '../theme/util.css';

function usePinnedTrackers() {
  const [loading, setLoading] = useState(true);
  const [trackers, setTrackers] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const all = await xShim.listTrackers();
        const pinned = (all || []).filter(t => t.pinned);
        if (mounted) setTrackers(pinned);
      } catch (e) {
        console.error('[TrackerBoards] listTrackers error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return { loading, trackers };
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
        console.error('[TrackerBoards] listPosts batch error', e);
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

export default function TrackerBoards() {
  const { loading: loadingT, trackers } = usePinnedTrackers();
  const cols = useMemo(() => (trackers || []).slice(0, 3), [trackers]);
  const { loading: loadingP, map } = usePostsMap(cols.map(t => t.id));

  if (loadingT || loadingP) {
    return (
      <div style={{ padding: 16 }}>
        <div className="label">Loading…</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: 8 }}>
      {cols.map(t => (
        <TrackerColumn key={t.id} tracker={t} posts={map[t.id] || []} />
      ))}
    </div>
  );
}
