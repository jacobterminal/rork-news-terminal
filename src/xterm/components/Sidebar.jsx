import React, { useEffect, useState } from 'react';
import '../theme/util.css';
import { xShim } from '../shim/xShim';
import SavedTrackers from './SavedTrackers';
import AlertBuilder from './AlertBuilder';

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
    <div className="sidebar list-scroll" role="complementary" aria-label="Navigation" data-testid="xterm-sidebar" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 12, padding: 12 }}>
      <SavedTrackers trackers={trackers} />
      <AlertBuilder />
    </div>
  );
}
