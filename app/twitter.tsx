import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';
import { Bell } from 'lucide-react-native';

const isWeb = Platform.OS === 'web';

let TickerTape: any = null;
let TrackerBoards: any = null;
let NotificationCenter: any = null;
let SavedTrackers: any = null;
let AlertBuilder: any = null;
let CommandPalette: any = null;
let ToastContainer: any = null;
let xShim: any = null;

if (isWeb) {
  try {
    TickerTape = require('../src/xterm/components/TickerTape').default;
    TrackerBoards = require('../src/xterm/components/TrackerBoards').default;
    NotificationCenter = require('../src/xterm/components/NotificationCenter').default;
    SavedTrackers = require('../src/xterm/components/SavedTrackers').default;
    AlertBuilder = require('../src/xterm/components/AlertBuilder').default;
    CommandPalette = require('../src/xterm/components/CommandPalette').default;
    ToastContainer = require('../src/xterm/components/ToastContainer').default;
    xShim = require('../src/xterm/shim/xShim').xShim;
  } catch (e) {
    console.error('[TwitterScreen] Failed to load web components', e);
  }
}

export default function TwitterScreen() {
  const insets = useSafeAreaInsets();
  const [notifOpen, setNotifOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [trackers, setTrackers] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);

  useEffect(() => {
    if (!isWeb || !xShim) return;
    let mounted = true;
    (async () => {
      try {
        const t = await xShim.listTrackers();
        if (!mounted) return;
        setTrackers(t);
        const pinned = t.filter((x: any) => x.pinned);
        const posts: any[] = [];
        for (const tr of pinned) {
          const p = await xShim.listPosts(tr.id);
          posts.push(...p);
        }
        if (!mounted) return;
        setAllPosts(posts.sort((a, b) => b.ts - a.ts));
      } catch (e) {
        console.error('[TwitterScreen] error', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!isWeb) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(v => !v);
      }
      if (e.key === 'Escape') {
        setNotifOpen(false);
        setCmdOpen(false);
      }
      if (e.key === '/') {
        e.preventDefault();
        const sidebar = document.querySelector('.sidebar-focus-target');
        if (sidebar instanceof HTMLElement) sidebar.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggleNotif = useCallback(() => setNotifOpen(v => !v), []);

  if (!isWeb) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.webOnlyMessage}>
          <View style={styles.webOnlyCard}>
            <View style={styles.webOnlyTitle} />
            <View style={styles.webOnlyBody} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--xt-bg)' }}>
        <div className="topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', height: 48, borderBottom: '1px solid var(--xt-border)', background: 'var(--xt-panel)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="value" style={{ fontWeight: 700, fontSize: 14, color: 'var(--xt-warn)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>RORK • X TERMINAL</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="kbd">⌘</span>
              <span className="kbd">K</span>
            </div>
          </div>
          <button onClick={toggleNotif} className="focusable" style={{ background: 'transparent', border: '1px solid var(--xt-border)', borderRadius: '4px', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
            <Bell size={16} color="var(--xt-text)" />
          </button>
        </div>

        {TickerTape && <TickerTape posts={allPosts} />}

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <div className="sidebar" style={{ width: 260, borderRight: '1px solid var(--xt-border)', background: 'var(--xt-panel)', display: 'flex', flexDirection: 'column', gap: 12, padding: 12, overflowY: 'auto' }}>
            <div className="sidebar-focus-target" tabIndex={0} style={{ outline: 'none' }} />
            {SavedTrackers && <SavedTrackers trackers={trackers} />}
            {AlertBuilder && <AlertBuilder />}
          </div>

          <div className="content" style={{ flex: 1, background: 'var(--xt-bg)', overflow: 'auto' }}>
            {TrackerBoards && <TrackerBoards />}
          </div>
        </div>

        {NotificationCenter && <NotificationCenter open={notifOpen} onClose={() => setNotifOpen(false)} />}
        {CommandPalette && <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />}
        {ToastContainer && <ToastContainer />}
      </div>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  webOnlyMessage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  webOnlyCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
    maxWidth: 400,
  },
  webOnlyTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  webOnlyBody: {
    color: theme.colors.textDim,
    fontSize: 13,
  },
});
