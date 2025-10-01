import '../theme/tokens.css';
import '../theme/util.css';

export default function AppShell({ sidebar, children }) {
  return (
    <div style={{display:'grid',gridTemplateColumns:'240px 1fr',gridTemplateRows:'48px 1fr',height:'100vh'}}>
      <header style={{gridColumn:'1/3'}} className="panel-elev">
        <div style={{display:'flex',alignItems:'center',height:48,padding:'0 10px',gap:10}}>
          <strong style={{fontFamily:'ui-monospace'}}>RORK</strong>
          <div style={{flex:1}}/>
          <button className="kbd focusable" title="Command Palette">⌘K</button>
        </div>
      </header>
      <aside className="panel" style={{overflow:'auto',padding:8}}>
        {sidebar}
      </aside>
      <main style={{overflow:'auto',padding:12}}>
        {children}
      </main>
    </div>
  );
}
