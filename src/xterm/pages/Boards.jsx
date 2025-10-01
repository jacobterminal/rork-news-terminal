import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { xShim } from '../shim/xShim';
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

function usePosts(trackerId) {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (!trackerId) return;
    setLoading(true);
    (async () => {
      try {
        const rows = await xShim.listPosts(trackerId);
        if (mounted) setPosts(rows || []);
      } catch (e) {
        console.error('[Boards] listPosts error', e);
        if (mounted) setError(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [trackerId]);

  return { loading, posts, error };
}

function Header({ title, query }) {
  return (
    <View className="row-compact" style={{ padding: 8, borderBottomWidth: 1, borderColor: 'var(--border-weak)' }}>
      <Text className="label" selectable>{title}</Text>
      <Text className="value" selectable style={{ color: 'var(--text-dim)' }}>{query}</Text>
    </View>
  );
}

function PostRow({ post }) {
  const likes = post?.metrics?.like || 0;
  const rts = post?.metrics?.rt || 0;
  const score = likes + rts;
  return (
    <View className="table-row" style={{ borderBottomWidth: 1, borderColor: 'var(--border-weak)', paddingVertical: 8 }}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Text className="label" selectable>{post.author}</Text>
        <Text className="value" selectable style={{ color: 'var(--text-dim)' }}>{post.handle}</Text>
        <View style={{ marginLeft: 'auto' }}>
          <Text className="value" selectable>{score}</Text>
        </View>
      </View>
      <Text className="value" selectable style={{ marginTop: 4 }}>{post.text}</Text>
    </View>
  );
}

function Column({ tracker }) {
  const { loading, posts } = usePosts(tracker?.id);
  const sorted = useMemo(() => {
    return [...(posts || [])]
      .map(p => ({ ...p, __score: (p?.metrics?.like || 0) + (p?.metrics?.rt || 0) }))
      .sort((a, b) => (b.__score || 0) - (a.__score || 0));
  }, [posts]);

  return (
    <View className="panel" style={{ flex: 1, minWidth: 0 }}>
      <Header title={tracker.title} query={tracker.query} />
      {loading ? (
        <View style={{ padding: 12 }}>
          <ActivityIndicator color="white" />
        </View>
      ) : (
        <View className="list-scroll" style={{ maxHeight: 'calc(100vh - 64px)', paddingHorizontal: 8 }}>
          {sorted.map(p => (
            <PostRow key={p.id} post={p} />
          ))}
        </View>
      )}
    </View>
  );
}

export default function Boards() {
  const { loading, trackers } = usePinnedTrackers();
  const cols = useMemo(() => (trackers || []).slice(0, 3), [trackers]);

  if (loading) {
    return (
      <View style={{ padding: 16 }}>
        <ActivityIndicator color="white" />
      </View>
    );
  }

  return (
    <View style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: 8 }}>
      {cols.map(t => (
        <Column key={t.id} tracker={t} />
      ))}
    </View>
  );
}
