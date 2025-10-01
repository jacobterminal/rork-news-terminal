import React from 'react';
import { LocalShim as api } from '../../shim/dataShim';
import QuoteHeader from '../components/QuoteHeader';
import OrderBook from '../components/OrderBook';
import Tape from '../components/Tape';
import OptionChain from '../components/OptionChain';
import NewsPanel from '../components/NewsPanel';
import OrderCard from '../components/OrderCard';

export default function QuotePage({ symbol='AAPL' }) {
  // Minimal data fetch – in Rork, use its state/effects equivalents
  // Assume synchronous demo for brevity; in real code, load async and show skeletons.
  return (
    <div className="space-y-3" data-testid="quote-page">
      {/* Header */}
      <AsyncQuote symbol={symbol}/>
      {/* Chart placeholder – your existing candle component plugs here */}
      <div className="panel" style={{height:260,display:'grid',placeItems:'center',color:'var(--txt-mute)'}}>Candlestick Chart (wire to OHLCV)</div>
      {/* Two columns */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 0.7fr',gap:'12px'}}>
        <div className="space-y-3">
          <OrderBook symbol={symbol} />
          <Tape symbol={symbol} />
        </div>
        <div className="space-y-3">
          <OptionChain symbol={symbol} />
          <NewsPanel symbols={[symbol]} />
        </div>
      </div>
      {/* Orders area – compact, dropdown cards */}
      <div className="panel" style={{padding:12}}>
        <div style={{display:'flex',gap:18,marginBottom:8}}>
          <span style={{textDecoration:'underline'}}>Open Orders</span>
          <span>Day Filled</span>
          <span>Day Cancelled</span>
        </div>
        <OrderCard demo />
        <OrderCard demo status="CANCELLED" />
      </div>
    </div>
  );
}

function AsyncQuote({symbol}){
  const [q,setQ]=React.useState(null);
  React.useEffect(()=>{api.getQuote(symbol).then(setQ)},[symbol]);
  if(!q) return <div className="panel row-compact"><div className="label">Loading {symbol}…</div></div>;
  return <QuoteHeader q={q}/>;
}
