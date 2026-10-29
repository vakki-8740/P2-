import { useState } from 'react'
import { getCredentials, setCredentials } from '../utils/adminAuth.js'

export default function Settings(){
  const cred = getCredentials()
  const [user,setUser]=useState(cred.username)
  const [pass,setPass]=useState(cred.password)
  const [pass2,setPass2]=useState('')
  const [msg,setMsg]=useState('')
  const [err,setErr]=useState('')

  const theme = document.documentElement.getAttribute('data-theme') || 'dark'
  const toggleTheme = ()=>{
    const nxt = theme==='dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', nxt)
    localStorage.setItem('admin_theme', nxt)
    window.location.reload()
  }

  const onSave = (e)=>{
    e.preventDefault()
    if(!user.trim() || !pass.trim()){ setErr('Username and password required'); return }
    if(pass !== pass2){ setErr('Passwords do not match'); return }
    setCredentials({ username:user.trim(), password:pass })
    setMsg('Credentials updated ✓ — new login will use these')
    setErr('')
    setTimeout(()=> setMsg(''), 3000)
  }

  const clearData = (key)=>{
    if(!confirm(`Clear ${key}?`)) return
    localStorage.removeItem(key)
    window.dispatchEvent(new Event('storage'))
    window.dispatchEvent(new Event('complains-updated'))
    window.dispatchEvent(new Event('chat-updated'))
    alert('Cleared')
  }

  return (
    <div>
      <h1 style={{fontWeight:800, fontSize:'1.3rem'}}>Settings</h1>
      <p style={{color:'var(--admin-muted)', fontSize:'.85rem', marginTop:4}}>Admin panel settings — change login, theme, manage data</p>

      <div className="admin-card" style={{marginTop:16}}>
        <div className="admin-card-head"><h2>Change Login Credentials</h2></div>
        <div className="admin-card-body">
          <div style={{background:'var(--admin-card-2)', border:'1px solid var(--admin-border)', borderRadius:12, padding:12, marginBottom:14, fontSize:'.82rem', lineHeight:1.6}}>
            <div style={{fontWeight:800, marginBottom:6}}>Current shareable login details:</div>
            <div><b>Username:</b> {cred.username}</div>
            <div><b>Password:</b> {cred.password}</div>
            <div style={{marginTop:8, fontSize:'.75rem', color:'var(--admin-muted)'}}>These are stored in browser localStorage (admin_credentials). Change below and share new details with team.</div>
          </div>
          {err && <div className="error-box">{err}</div>}
          {msg && <div style={{background:'rgba(34,197,94,.1)', border:'1px solid rgba(34,197,94,.25)', color:'#22c55e', padding:'10px 12px', borderRadius:8, fontWeight:700, fontSize:'.82rem', marginBottom:12}}>{msg}</div>}
          <form onSubmit={onSave}>
            <div className="form-group-admin"><label>New Username</label><input value={user} onChange={e=>setUser(e.target.value)} required /></div>
            <div className="form-group-admin"><label>New Password</label><input type="text" value={pass} onChange={e=>setPass(e.target.value)} required /></div>
            <div className="form-group-admin"><label>Confirm Password</label><input type="text" value={pass2} onChange={e=>setPass2(e.target.value)} placeholder="Retype password" required /></div>
            <button className="btn-admin primary" type="submit">Update Credentials</button>
          </form>
        </div>
      </div>

      <div className="admin-card" style={{marginTop:14}}>
        <div className="admin-card-head"><h2>Theme</h2><span style={{fontSize:'.78rem', color:'var(--admin-muted)'}}>Current: {theme}</span></div>
        <div className="admin-card-body" style={{display:'flex', gap:12, alignItems:'center', flexWrap:'wrap'}}>
          <div style={{flex:1, minWidth:200}}>
            <div style={{fontWeight:700}}>Admin panel theme — same as user panel + light mode</div>
            <div style={{fontSize:'.82rem', color:'var(--admin-muted)', marginTop:4}}>Dark: yellow buttons (#F5FF00). Light: bright blue buttons (#0ea5e9) as requested.</div>
          </div>
          <button className="btn-admin primary" onClick={toggleTheme}>Switch to {theme==='dark'?'Light':'Dark'}</button>
        </div>
      </div>

      <div className="admin-card" style={{marginTop:14}}>
        <div className="admin-card-head"><h2>Pages in Admin</h2></div>
        <div className="admin-card-body" style={{display:'grid', gap:8, fontSize:'.85rem'}}>
          <div>📊 <b>Dashboard</b> — Total/Today Complaints, Today/Total Chat Users, user list</div>
          <div>👥 <b>Users</b> — Full user list grouped, search, detail view</div>
          <div>📄 <b>User Detail</b> — All complaints of one user, View/Close/Download images</div>
          <div>💬 <b>Chat Manage</b> — Chat users list → tap to open chats</div>
          <div>📈 <b>Activity</b> — Which complaint types are most (bar + pie)</div>
          <div>⚙️ <b>Settings</b> — Credentials, theme, data tools (this page)</div>
          <div style={{color:'var(--admin-muted)', fontSize:'.78rem', marginTop:6}}>Add more pages per work in Admin/src/pages/ and link in Sidebar.</div>
        </div>
      </div>

      <div className="admin-card" style={{marginTop:14}}>
        <div className="admin-card-head"><h2>Danger Zone</h2></div>
        <div className="admin-card-body" style={{display:'flex', gap:10, flexWrap:'wrap'}}>
          <button className="btn-admin ghost small" onClick={()=> clearData('parimatch_complains')}>Clear All Complaints</button>
          <button className="btn-admin ghost small" onClick={()=> clearData('parimatch_chat_messages')}>Clear All Chats</button>
          <button className="btn-admin ghost small" onClick={()=>{ localStorage.removeItem('admin_session'); location.href='/login'}}>Logout</button>
        </div>
      </div>
    </div>
  )
}
