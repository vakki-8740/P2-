import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getGroupedUsers, formatDate } from '../utils/dataStore.js'

export default function Users(){
  const [users,setUsers]=useState([])
  const [q,setQ]=useState('')
  const load=()=> setUsers(getGroupedUsers())
  useEffect(()=>{ load(); const h=()=>load(); window.addEventListener('storage',h); window.addEventListener('complains-updated',h); return ()=>{ window.removeEventListener('storage',h); window.removeEventListener('complains-updated',h)} },[])
  const filtered = users.filter(u=>{
    if(!q) return true
    const s=q.toLowerCase()
    return u.displayName.toLowerCase().includes(s) || u.mobile.includes(s) || u.email.toLowerCase().includes(s) || u.types.join(' ').toLowerCase().includes(s)
  })
  return (
    <div>
      <h1 style={{fontSize:'1.3rem', fontWeight:800}}>Users</h1>
      <p style={{color:'var(--admin-muted)', fontSize:'.85rem', marginTop:4}}>All users grouped by mobile/email — each shows name, time, data, problem type</p>
      <div style={{marginTop:14, display:'flex', gap:10, alignItems:'center'}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by name, mobile, email, problem..." style={{flex:1, height:42, border:'1px solid var(--admin-border)', background:'var(--admin-card)', color:'var(--admin-text)', borderRadius:12, padding:'0 14px', fontFamily:'inherit'}} />
        <span style={{fontSize:'.82rem', color:'var(--admin-muted)', fontWeight:700, whiteSpace:'nowrap'}}>{filtered.length} users</span>
      </div>
      <div className="admin-card" style={{marginTop:14}}>
        <div className="admin-card-body" style={{display:'flex', flexDirection:'column', gap:8}}>
          {filtered.length===0 ? <div className="empty-admin">No users found</div> : filtered.map(u=>(
            <Link key={u.id} to={`/users/${encodeURIComponent(u.id)}`} className="user-row">
              <div className="user-avatar">{u.avatarLetter}</div>
              <div className="user-main">
                <div className="user-name">{u.displayName} <span style={{fontWeight:400, color:'var(--admin-muted)'}}>• {u.complains.length} complaints</span></div>
                <div className="user-meta">
                  <span>👤 {u.id.slice(0,12)}…</span>
                  <span>⏰ {formatDate(u.lastAt)}</span>
                  <span className="user-badge">{u.types.join(' • ')}</span>
                </div>
                <div style={{fontSize:'.76rem', color:'var(--admin-muted)', marginTop:4, display:'flex', gap:10}}>
                  <span>📱 {u.mobile}</span>
                  <span>✉️ {u.email}</span>
                </div>
              </div>
              <div className="user-chevron">›</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
