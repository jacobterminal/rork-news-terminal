import React from 'react';
import { LocalShim as api } from '../../shim/dataShim';

export default function OptionChain({ symbol }) {
  const [rows, setRows] = React.useState([]);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    console.log('[OptionChain] fetching options for', symbol);
    setLoading(true);
    setError(null);
    api
      .getOptions(symbol, 'near')
      .then((res) => {
        console.log('[OptionChain] received rows', Array.isArray(res) ? res.length : 0);
        setRows(Array.isArray(res) ? res : []);
      })
      .catch((e) => {
        console.error('[OptionChain] failed to fetch options', e);
        setError('Failed to load option chain');
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, [symbol]);

  const paired = React.useMemo(() => {
    const calls = rows.filter((r) => r?.type === 'C');
    const putMap = new Map();
    rows.forEach((r) => {
      if (r?.type === 'P') {
        const key = `${r.expiry}|${r.strike}`;
        putMap.set(key, r);
      }
    });
    return calls.map((c) => {
      const key = `${c.expiry}|${c.strike}`;
      return { call: c, put: putMap.get(key) };
    });
  }, [rows]);

  if (loading) {
    return (
      <div className="panel" data-testid="optionchain-loading" style={{ padding: 10 }}>
        <div className="label">Loading option chain…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel" data-testid="optionchain-error" style={{ padding: 10 }}>
        <div className="label">{error}</div>
      </div>
    );
  }

  return (
    <div className="panel" data-testid="optionchain" style={{ overflow: 'auto', maxHeight: 280 }}>
      <div
        className="label"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 2,
          padding: '6px 10px',
          borderBottom: '1px solid var(--border)'
        }}
      >
        Option Chain (near)
      </div>

      <div
        className="table-row"
        style={{
          fontWeight: 600,
          position: 'sticky',
          top: 28,
          zIndex: 2,
          background: 'var(--panel)',
          borderBottom: '1px solid var(--border)'
        }}
      >
        <span>CALL Bid</span>
        <span>CALL Ask</span>
        <span style={{ textAlign: 'center' }}>Strike</span>
        <span>PUT Bid</span>
        <span>PUT Ask</span>
        <span>IV</span>
      </div>

      {paired.map(({ call, put }, i) => (
        <div key={`${call.expiry}-${call.strike}-${i}`} className="table-row" data-testid="optionchain-row">
          <span className="value">{toPrice(call?.bid)}</span>
          <span className="value">{toPrice(call?.ask)}</span>
          <span
            className="value"
            style={{
              position: 'relative',
              textAlign: 'center',
              fontWeight: 600,
              background: 'var(--panel)',
              borderLeft: '1px solid var(--border)',
              borderRight: '1px solid var(--border)'
            }}
          >
            {toPrice(call?.strike)}
          </span>
          <span className="value">{toPrice(put?.bid)}</span>
          <span className="value">{toPrice(put?.ask)}</span>
          <span className="value">{toNumber(put?.iv ?? call?.iv)}</span>
        </div>
      ))}
    </div>
  );
}

function toPrice(v) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return '-';
  try {
    return Number(v).toFixed(2);
  } catch {
    return '-';
  }
}

function toNumber(v) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return '-';
  try {
    return Number(v).toFixed(2);
  } catch {
    return '-';
  }
}
