import React from "react";
import { Text } from "react-native";
import { LocalShim as api } from '../../shim/dataShim';

export default function NewsPanel({symbols=[]}){
  const [items,setItems]=React.useState([]);
  const symbolsKey = React.useMemo(()=>symbols.join(','),[symbols]);

  React.useEffect(()=>{api.getNews({symbols}).then(setItems)},[symbolsKey]);
  return (
    <div className="panel" style={{maxHeight:240,overflow:'auto'}}>
      <div className="label" style={{padding:'6px 10px',borderBottom:'1px solid var(--border)'}}><Text>Wires</Text></div>
      {items.map(n=>(
        <div key={n.id} className="table-row" style={{gridTemplateColumns:'120px 1fr 80px'}}>
          <span className="value">{new Date(n.ts).toLocaleTimeString()}</span>
          <span>{n.title}</span>
          <span className="pill">{n.sentiment||'neu'}</span>
        </div>
      ))}
    </div>
  );
}
