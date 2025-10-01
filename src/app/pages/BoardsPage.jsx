import React from 'react';
import { LocalShim as api } from '../../shim/dataShim';
import AlertBuilder from '../components/AlertBuilder';

export default function BoardsPage(){
  const [posts,setPosts]=React.useState([]);
  React.useEffect(()=>{api.getXStreamDemo().then(setPosts)},[]);
  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}} data-testid="boards-page">
      <Column title="$NVDA • chip OR 'AI PC' (lang:en)" posts={posts}/>
      <Column title="FOMC • fed OR 'rate hike' (lang:en)" posts={posts}/>
      <div className="panel" style={{padding:12}} data-testid="alerts-panel">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <strong>Alerts</strong><span className="kbd">/</span>
        </div>
        <AlertBuilder/>
      </div>
    </div>
  );
}
function Column({title,posts}){
  return (
    <div className="panel" style={{display:'flex',flexDirection:'column',minHeight:420}} data-testid="boards-column">
      <div style={{padding:10,borderBottom:'1px solid var(--border)'}}>{title}</div>
      <div style={{overflow:'auto'}}>
        {posts.slice(0,40).map(p=>(
          <div key={p.id} className="table-row" style={{gridTemplateColumns:'120px 1fr 80px'}}>
            <span className="value">{new Date(p.ts).toLocaleTimeString()}</span>
            <span>{p.text}</span>
            <span className="label">{(p.metrics?.like_count??0)} ❤</span>
          </div>
        ))}
      </div>
    </div>
  );
}
