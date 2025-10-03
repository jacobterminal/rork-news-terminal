import React from "react";
import Panel from "../components/Panel";
import "../theme/tokens.css";
import "../theme/util.css";

function PageActionBar() {
  return (
    <div className="px-3 py-2 bg-[var(--panel)] border-b border-[var(--border)]" data-testid="trackers-saved-actionbar">
      <div className="flex flex-wrap gap-6 items-center">
        <div className="flex gap-2 flex-wrap">
          <button className="pill focusable"><span className="value">New</span></button>
          <button className="pill focusable"><span className="value">Import</span></button>
          <button className="pill focusable"><span className="value">Refresh</span></button>
        </div>
        <div className="flex-1" />
        <div className="flex gap-2 flex-wrap">
          <button className="pill focusable"><span className="value">Settings</span></button>
        </div>
      </div>
    </div>
  );
}

export default function TrackersSavedPage() {
  return (
    <div className="h-full w-full grid" style={{ gridTemplateRows: "auto auto 1fr" }} data-testid="trackers-saved-page">
      <div className="px-3 py-2 border-b border-[var(--border)] bg-[var(--panel-elev)]">
        <div className="flex items-center gap-2">
          <h1 className="text-sm tracking-wide"><span className="value">Saved Trackers</span></h1>
          <span className="pill"><span className="label">LIST</span></span>
        </div>
      </div>

      <PageActionBar />

      <div className="px-3 pb-3 overflow-hidden">
        <Panel title="Saved Trackers" toolbar={<button className="pill focusable"><span className="value">New</span></button>}>
          <div className="label"><span className="value">Empty state</span></div>
        </Panel>
      </div>
    </div>
  );
}
