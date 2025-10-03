import React, { useEffect, useState } from 'react';
import '../theme/util.css';
import { xShim } from '../shim/xShim';

export default function Sidebar() {
  const [trackers, setTrackers] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const all = await xShim.listTrackers();
        setTrackers(all || []);
      } catch (e) {
        console.error('[Sidebar] listTrackers error', e);
      }
    })();
  }, []);

  return (
    <aside className="sidebar panel" role="complementary">
      <nav className="grid gap-1 p-2">
        <a className="pill focusable" href="/news">News</a>
        <a className="pill focusable" href="/moves">Moves</a>
        <a className="pill focusable" href="/trackers">Trackers</a>
        <a className="pill focusable" href="/watchlist">Watchlist</a>
        <div className="mt-2 border-t border-[var(--border)]" />
        <a className="pill focusable" href="/trackers/saved">Saved</a>
        <a className="pill focusable" href="/trackers/new">New</a>
      </nav>
    </aside>
  );
}
