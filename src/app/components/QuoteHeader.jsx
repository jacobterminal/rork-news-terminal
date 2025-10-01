export default function QuoteHeader({ q }) {
  const up = (q.change ?? 0) >= 0;
  return (
    <div className="panel row-compact">
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div style={{fontFamily:'ui-monospace',fontSize:18}}>{q.symbol}</div>
        <div style={{fontSize:20,color:up?'var(--up)':'var(--down)'}}>{q.last?.toFixed(2)}</div>
        <div style={{opacity:.85}}>{(up?'+':'')+q.change?.toFixed(2)} ({(q.pct*100).toFixed(2)}%)</div>
        <span className="pill">RANGE {q.day_low?.toFixed(2)}–{q.day_high?.toFixed(2)}</span>
        <span className="pill">52W {q.wk52_low?.toFixed(0)}–{q.wk52_high?.toFixed(0)}</span>
      </div>
      <div className="grid-2rows" style={{textAlign:'right'}}>
        <span className="label">VOL</span><span className="value">{q.volume?.toLocaleString?.()}</span>
        <span className="label">MKT CAP</span><span className="value">{(q.mktcap/1e12).toFixed(2)}T</span>
      </div>
    </div>
  );
}
