export default function OrderCard({demo=false,status='ACTIVE'}){
  const side = 'SELL'; // demo
  const dur = 'DAY';
  return (
    <div className="panel" style={{padding:10,marginBottom:8}}>
      <div className="row-compact" style={{alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span className="value">AAPL</span>
          <span className={`pill ${side==='SELL'?'pill-down':'pill-up'}`}>{side}</span>
          <span className="pill">{status}</span>
          <span className="pill">{dur}</span>
        </div>
        <div className="grid-2rows" style={{textAlign:'right'}}>
          <span className="label">LMT</span><span className="value">182.75</span>
          <span className="label">Qty</span><span className="value">100</span>
        </div>
      </div>
      <details style={{marginTop:8}}>
        <summary className="label">Execution / Route / Avg Cost / Timestamps</summary>
        <div className="table-row" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
          <span className="label">Route</span><span className="value">ARCA</span>
          <span className="label">Avg Cost</span><span className="value">178.20</span>
        </div>
      </details>
    </div>
  );
}
