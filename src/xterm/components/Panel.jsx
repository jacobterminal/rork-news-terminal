import React from "react";

export default function Panel({ title, toolbar, children, footer }) {
  return (
    <section className="panel min-h-[220px] grid" data-testid="panel" style={{ gridTemplateRows: "auto auto 1fr auto" }}>
      <div className="px-3 py-2 border-b border-[var(--border)] flex items-center justify-between">
        <div className="text-[13px] font-medium">{title}</div>
      </div>
      <div className="px-3 py-2 border-b border-[var(--border)]">
        <div className="flex flex-wrap gap-2">{toolbar}</div>
      </div>
      <div className="overflow-auto px-3 py-2">{children}</div>
      {footer && (
        <div className="px-3 py-2 border-t border-[var(--border)] bg-[var(--panel-elev)]">
          <div className="flex flex-wrap gap-2 justify-end">{footer}</div>
        </div>
      )}
    </section>
  );
}
