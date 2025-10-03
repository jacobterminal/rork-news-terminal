import React, { useMemo, useState, useCallback } from "react";
import Panel from "../components/Panel";
import "../theme/tokens.css";
import "../theme/util.css";

function PageActionBar({ onNew, onImport, onRefresh, onSettings }) {
  return (
    <div className="px-3 py-2 bg-[var(--panel)] border-b border-[var(--border)]" data-testid="trackers-actionbar">
      <div className="flex flex-wrap gap-6 items-center">
        <div className="flex gap-2 flex-wrap">
          <button className="pill focusable" onClick={onNew}>New</button>
          <button className="pill focusable" onClick={onImport}>Import</button>
          <button className="pill focusable" onClick={onRefresh}>Refresh</button>
        </div>
        <div className="flex-1" />
        <div className="flex gap-2 flex-wrap">
          <button className="pill focusable" onClick={onSettings}>Settings</button>
        </div>
      </div>
    </div>
  );
}

function LabeledInput({ label, type = "text", placeholder, value, onChange }) {
  return (
    <label className="grid gap-1">
      <span className="label text-[11px] opacity-70">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="focusable bg-[var(--panel-elev)] border border-[var(--border)] rounded-[var(--r-sm)] px-2 py-2 outline-none w-full font-mono text-[13px]"
      />
    </label>
  );
}

function LabeledSelect({ label, options, value, onChange }) {
  return (
    <label className="grid gap-1">
      <span className="label text-[11px] opacity-70">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="focusable bg-[var(--panel-elev)] border border-[var(--border)] rounded-[var(--r-sm)] px-2 py-2 outline-none w-full font-mono text-[13px]"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

function TrackerRow({ tracker, onOpen }) {
  return (
    <div className="table-row py-2 flex items-start justify-between gap-2 border-b border-[var(--border)]" data-testid="tracker-row">
      <div className="min-w-0">
        <div className="text-[13px] truncate" title={tracker.name}>{tracker.name}</div>
        <div className="label text-[11px] truncate font-mono opacity-80" title={tracker.query}>{tracker.query}</div>
        {tracker.pinned && (
          <span className="pill pill-up mt-1 inline-block">PINNED</span>
        )}
      </div>
      <div className="shrink-0">
        <button className="pill focusable" onClick={() => onOpen(tracker)}>Open</button>
      </div>
    </div>
  );
}

function TrackerList({ items, onOpen }) {
  return (
    <div className="max-h-[60vh] overflow-auto" data-testid="tracker-list">
      {items.map((t) => (
        <TrackerRow key={t.id} tracker={t} onOpen={onOpen} />
      ))}
    </div>
  );
}

function SavedTrackersPanel({ trackers, onOpen }) {
  return (
    <Panel
      title="Saved Trackers"
      toolbar={(
        <>
          <button className="pill focusable">New</button>
          <button className="pill focusable">Duplicate</button>
          <button className="pill focusable">Delete</button>
          <button className="pill focusable">Pin Selected</button>
        </>
      )}
      footer={(
        <>
          <button className="pill focusable">Export</button>
          <button className="pill focusable">Import</button>
        </>
      )}
    >
      <TrackerList items={trackers} onOpen={onOpen} />
    </Panel>
  );
}

function AlertBuilderPanel({ onSave }) {
  const [query, setQuery] = useState("");
  const [minLikes, setMinLikes] = useState("");
  const [channel, setChannel] = useState("TOAST");

  const save = useCallback(() => {
    onSave && onSave({ query, minLikes: Number(minLikes || 0), channel });
  }, [onSave, query, minLikes, channel]);

  return (
    <Panel
      title="Alert Builder"
      toolbar={(
        <>
          <button className="pill focusable">Templates</button>
          <button className="pill focusable">Backtest</button>
          <button className="pill focusable">Preview</button>
        </>
      )}
      footer={(
        <>
          <button className="pill focusable">TOAST</button>
          <button className="pill focusable">INBOX</button>
          <button className="pill pill-up focusable" onClick={save}>Save Alert</button>
        </>
      )}
    >
      <div className="grid gap-2">
        <LabeledInput label="IF QUERY" placeholder="NVDA OR H200" value={query} onChange={setQuery} />
        <LabeledInput label="AND MIN LIKES" type="number" placeholder="100" value={minLikes} onChange={setMinLikes} />
        <LabeledSelect label="THEN CHANNEL" options={["TOAST", "INBOX"]} value={channel} onChange={setChannel} />
      </div>
    </Panel>
  );
}

function PostRow({ post }) {
  return (
    <div className="table-row py-2 border-b border-[var(--border)]" data-testid="post-row">
      <div className="flex items-start gap-3">
        <div className="label tabular-nums w-[64px] shrink-0 text-right">{post.time}</div>
        <div className="min-w-0 flex-1">
          <div className="label opacity-80">{post.author}</div>
          <div className="text-[13px] leading-snug whitespace-pre-wrap break-words">{post.text}</div>
          <div className="flex gap-2 mt-1">
            <span className="pill"><span className="label">LIKES</span><span className="value">{post.likes}</span></span>
            <span className="pill"><span className="label">REPLIES</span><span className="value">{post.replies}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThreadTape({ title, posts, onOpen, onToggle, speed, onSpeed }) {
  return (
    <Panel
      title={title}
      toolbar={(
        <>
          <button className="pill focusable" onClick={onOpen}>Open</button>
          <button className="pill focusable" onClick={onToggle}>Pause/Play</button>
          <button className="pill focusable" onClick={onSpeed}>Speed {speed}x</button>
        </>
      )}
    >
      <div className="overflow-auto" style={{ maxHeight: "60vh" }}>
        {posts.map((p) => (
          <PostRow key={p.id} post={p} />
        ))}
      </div>
    </Panel>
  );
}

function CodeEditorArea({ value, onChange }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      className="w-full h-full min-h-[200px] font-mono text-[14px] bg-[var(--panel-elev)] border border-[var(--border)] rounded-[var(--r-sm)] p-2 focus:outline-none"
      spellCheck={false}
    />
  );
}

function EditorPanel() {
  const [text, setText] = useState("{\n  \"rules\": []\n}");
  return (
    <Panel
      title="Editor"
      toolbar={(
        <>
          <button className="pill focusable">Update</button>
          <button className="pill focusable">Format</button>
        </>
      )}
      footer={<button className="pill pill-up focusable">Apply</button>}
    >
      <div className="h-[40vh]">
        <CodeEditorArea value={text} onChange={setText} />
      </div>
    </Panel>
  );
}

function TapeEditorSplit({ tracker, posts }) {
  const [speed, setSpeed] = useState(1);
  const toggleSpeed = useCallback(() => setSpeed((s) => (s === 1 ? 2 : 1)), []);
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <ThreadTape
        title={tracker?.name || "$NVDA CHIPS"}
        posts={posts}
        onOpen={() => {}}
        onToggle={() => {}}
        speed={speed}
        onSpeed={toggleSpeed}
      />
      <EditorPanel />
    </div>
  );
}

function BottomNav() {
  return (
    <nav className="border-t border-[var(--border)] bg-[var(--panel)] px-3 py-2 sticky bottom-0" data-testid="bottom-nav">
      <div className="grid grid-cols-4 gap-2 text-center">
        <a href="/news" className="pill focusable block">News</a>
        <a href="/moves" className="pill focusable block">Moves</a>
        <a href="/trackers" className="pill focusable block">Trackers</a>
        <a href="/watchlist" className="pill focusable block">Watchlist</a>
      </div>
    </nav>
  );
}

export default function TrackersPage() {
  const trackers = useMemo(() => ([
    { id: "t1", name: "$NVDA CHIPS", query: "(NVDA OR H200) min_likes:50", pinned: true },
    { id: "t2", name: "$AAPL SUPPLY", query: "(AAPL AND supply) min_likes:25", pinned: false },
    { id: "t3", name: "$AI CLOUD", query: "(AI AND cloud) min_likes:100", pinned: false },
  ]), []);

  const posts = useMemo(() => ([
    { id: "p1", time: "09:31:02", author: "@semi_analyst", text: "NVDA H200 production checks positive; lead times steady.", likes: 128, replies: 7 },
    { id: "p2", time: "09:33:44", author: "@supplywatch", text: "Channel partners see stable datacenter orders into Q4.", likes: 64, replies: 3 },
    { id: "p3", time: "09:36:10", author: "@chipedge", text: "Rumor: additional CoWoS capacity coming online in TW.", likes: 51, replies: 12 },
  ]), []);

  const [active, setActive] = useState(trackers[0]);

  return (
    <div className="h-full w-full grid" style={{ gridTemplateRows: "auto auto 1fr auto" }} data-testid="trackers-page">
      <div className="px-3 py-2 border-b border-[var(--border)] bg-[var(--panel-elev)]">
        <div className="flex items-center gap-2">
          <h1 className="text-sm tracking-wide">Twitter Tracker</h1>
          <span className="pill">READY</span>
        </div>
      </div>

      <PageActionBar
        onNew={() => {}}
        onImport={() => {}}
        onRefresh={() => {}}
        onSettings={() => {}}
      />

      <div className="px-3 pb-3 overflow-hidden">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[380px_1fr]">
          <div className="grid gap-3">
            <SavedTrackersPanel trackers={trackers} onOpen={(t) => setActive(t)} />
            <AlertBuilderPanel onSave={() => {}} />
          </div>
          <TapeEditorSplit tracker={active} posts={posts} />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
