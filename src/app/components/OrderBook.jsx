import React from 'react';
import { LocalShim as api } from '../../shim/dataShim';

function DepthRow({ price, size, side, max }) {
  const pct = Math.min(100, Math.round(size/max*100));
  const bg = side==='bid'?'#00d07e22':'#ff3b3b22';
  return (
    <div className="row-compact" data-testid={`depth-row-${side}`} style={{position:'relative'}}>
      <div style={{position:'absolute',inset:'0 0 0 auto',width:`${pct}%`,background:bg}}/>
      <span className="value">{price.toFixed(2)}</span>
      <span style={{opacity:.7}}>{size}</span>
    </div>
  );
}

export default function OrderBook({symbol}){
  const [bk,setBk]=React.useState(null);
  React.useEffect(()=>{
    console.log('[OrderBook] fetching book for', symbol);
    api.getBook(symbol).then((res)=>{ console.log('[OrderBook] received snapshot', res); setBk(res); }).catch(err=>{
      console.error('[OrderBook] failed to fetch book', err);
      setBk(null);
    });
  },[symbol]);
  if(!bk) return <div className="panel" data-testid="orderbook-loading"><div className="label" style={{padding:10}}>Order Book…</div></div>;
  const max = Math.max(...bk.bids.map(b=>b.size),...bk.asks.map(a=>a.size),1);
  return (
    <div className="panel" data-testid="orderbook" style={{display:'grid',gridTemplateColumns:'1fr 1fr'}}>
      <div data-testid="orderbook-bids" style={{borderRight:'1px solid var(--border)'}}>
        <div className="label" style={{padding:'6px 10px'}}>Bids</div>
        {bk.bids.slice(0,12).map((b,i)=><DepthRow key={i} price={b.price} size={b.size} side="bid" max={max}/>)}
      </div>
      <div data-testid="orderbook-asks">
        <div className="label" style={{padding:'6px 10px'}}>Asks</div>
        {bk.asks.slice(0,12).map((a,i)=><DepthRow key={i} price={a.price} size={a.size} side="ask" max={max}/>)}
      </div>
    </div>
  );
}
