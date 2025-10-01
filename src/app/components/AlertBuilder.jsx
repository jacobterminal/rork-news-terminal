export default function AlertBuilder(){
  return (
    <form className="panel" data-testid="alert-builder" style={{padding:10,display:'grid',gap:8}}>
      <div className="label"><span>IF</span></div>
      <input className="panel focusable" data-testid="alert-if" placeholder="keyword / @account / $cashtag"/>
      <div className="label"><span>AND</span></div>
      <input className="panel focusable" data-testid="alert-and" placeholder="filters (lang:en has:links -is:retweet)"/>
      <div className="label"><span>THEN</span></div>
      <select className="panel focusable" data-testid="alert-then">
        <option value="toast">Show toast</option>
        <option value="email">Email</option>
        <option value="sms">SMS</option>
      </select>
      <button type="button" data-testid="alert-save" className="pill"><span>Save Rule</span></button>
    </form>
  );
}
