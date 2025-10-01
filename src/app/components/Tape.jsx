import { LocalShim as api } from '../../shim/dataShim';
import React from "react";
export default function Tape({symbol}){
  const [rows,setRows]=React.useState([]);
  React.useEffect(()=>{api.getTape(symbol).then(setRows)},[symbol]);
  return (
    <div className="panel" style={{maxHeight:240,overflow:'auto'}}>
      <div className="label" style={{padding:'6px 10px',borderBottom:'1px solid var(--border)'}}>Time & Sales</div>
      {rows.map((r,i)=>(
        <div key={i} className="row-compact hover:bg-[var(--muted)]">
          <span className="value">{new Date(r.t).toLocaleTimeString()}</span>
          <span className="value" style={{color:r.side==='B'?'var(--up)':'var(--down)'}}>{r.p.toFixed(2)}</span>
          <span style={{opacity:.7}}>{r.sz}</span>
        </div>
      ))}
    </div>
  );
}
