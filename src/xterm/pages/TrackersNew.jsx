import React from "react";
import Panel from "../components/Panel";
import "../theme/tokens.css";
import "../theme/util.css";

export default function TrackersNewPage() {
  return (
    <div className="h-full w-full grid" style={{ gridTemplateRows: "auto auto 1fr" }} data-testid="trackers-new-page">
      <div className="px-3 py-2 border-b border-[var(--border)] bg-[var(--panel-elev)]">
        <div className="flex items-center gap-2">
          <h1 className="text-sm tracking-wide"><span className="value">New Tracker</span></h1>
          <span className="pill"><span className="label">DRAFT</span></span>
        </div>
      </div>

      <div className="px-3 py-2 bg-[var(--panel)] border-b border-[var(--border)]">
        <div className="flex flex-wrap gap-6 items-center">
          <div className="flex gap-2 flex-wrap">
            <button className="pill focusable"><span className="value">Save</span></button>
            <button className="pill focusable"><span className="value">Discard</span></button>
          </div>
          <div className="flex-1" />
          <div className="flex gap-2 flex-wrap">
            <button className="pill focusable"><span className="value">Settings</span></button>
          </div>
        </div>
      </div>

      <div className="px-3 pb-3 overflow-hidden">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[380px_1fr]">
          <Panel title="Basics">
            <label className="grid gap-1">
              <span className="label text-[11px] opacity-70">Name</span>
              <input className="focusable bg-[var(--panel-elev)] border border-[var(--border)] rounded-[var(--r-sm)] px-2 py-2 outline-none w-full font-mono text-[13px]" placeholder="$NVDA CHIPS" />
            </label>
          </Panel>
          <Panel title="Query">
            <textarea className="w-full h-[40vh] font-mono text-[14px] bg-[var(--panel-elev)] border border-[var(--border)] rounded-[var(--r-sm)] p-2 focus:outline-none" placeholder="(NVDA OR H200) min_likes:50" />
          </Panel>
        </div>
      </div>
    </div>
  );
}
