import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getComplains, getTodayComplains, getGroupedUsers, getMessages } from '../utils/dataStore.js'

export default function Dashboard(){
  const [complains,setComplains]=useState([])
  const [today,setToday]=useState([])
  const [users,setUsers]=useState([])
  const [msgs,setMsgs]=useState([])

  const load = ()=>{
    setComplains(getComplains())
    setToday(getTodayComplains())
    setUsers(getGroupedUsers())
    try{ setMsgs(JSON.parse(localStorage.getItem('parimatch_chat_messages')||'[]')) }catch{ setMsgs([]) }
  }
  useEffect(()=>{ load(); const h=()=>load(); window.addEventListener('storage',h); window.addEventListener('complains-updated',h); window.addEventListener('chat-updated',h); return ()=>{ window.removeEventListener('storage',h); window.removeEventListener('complains-updated',h); window.removeEventListener('chat-updated',h) } },[])

  const todayChatUsers = (()=>{ if(msgs.length===0) return 0; const todayStr=new Date().toDateString(); const mToday=msgs.filter(m=>{try{return new Date(m.createdAt).toDateString()===todayStr}catch{return false}}); return mToday.length?1:0 })()

  return (
    <div>
      <div style={{marginBottom:16}}>
        <h1 style={{fontSize:'1.35rem', fontWeight:800}}>Dashboard</h1>
        <p style={{fontSize:'.85rem', color:'var(--admin-muted)', marginTop:4}}>Welcome back — here's what's happening today</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-head">
            <span className="stat-label">Total Complaints</span>
            <span className="stat-icon yellow"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></span>
          </div>
          <div className="stat-value">{complains.length}</div>
          <div className="stat-sub">All time complaints</div>
        </div>
        <div className="stat-card">
          <div className="stat-head">
            <span className="stat-label">Today Complaints</span>
            <span className="stat-icon blue"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
          </div>
          <div className="stat-value">{today.length}</div>
          <div className="stat-sub">Submitted today</div>
        </div>
        <div className="stat-card">
          <div className="stat-head">
            <span className="stat-label">Today Chat Users</span>
            <span className="stat-icon green"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg></span>
          </div>
          <div className="stat-value">{todayChatUsers}</div>
          <div className="stat-sub">Active chat today</div>
        </div>
        <div className="stat-card">
          <div className="stat-head">
            <span className="stat-label">Total Chat Users</span>
            <span className="stat-icon purple"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg></span>
          </div>
          <div className="stat-value">{msgs.length ? 1 : 0}</div>
          <div className="stat-sub">Total chat sessions</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-head">
          <div>
            <h2>All Users — Complaint List</h2>
            <p>Tap any user to see all complaints in detail (images via View button)</p>
          </div>
          <Link to="/users" className="btn-admin ghost small">View All</Link>
        </div>
        <div className="admin-card-body">
          {users.length===0 ? (
            <div className="empty-admin">
              <div style={{fontSize:22}}>📭</div>
              <h3 style={{fontWeight:800, color:'var(--admin-text)', marginBottom:6}}>No complaints yet</h3>
              <p style={{fontSize:'.85rem'}}>When users submit complaints from Site, they will appear here grouped by user.</p>
            </div>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:8}}>
              {users.slice(0,6).map(u=>(
                <Link key={u.id} to={`/users/${encodeURIComponent(u.id)}`} className="user-row">
                  <div className="user-avatar">{u.avatarLetter}</div>
                  <div className="user-main">
                    <div className="user-name">{u.displayName} <span style={{fontWeight:400, color:'var(--admin-muted)', fontSize:'.78rem'}}>• {u.complains.length} complaints</span></div>
                    <div className="user-meta">
                      <span>📱 {u.mobile}</span>
                      <span>•</span>
                      <span>✉️ {u.email}</span>
                      <span>•</span>
                      <span className="user-badge">{u.types.join(', ')}</span>
                    </div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div className="user-time">{new Date(u.lastAt).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'})}</div>
                    <div style={{fontSize:11, color:'var(--admin-muted)'}}>{u.complains.length} types</div>
                  </div>
                  <div className="user-chevron">›</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{marginTop:14, display:'flex', gap:12, flexWrap:'wrap'}}>
        <Link to="/activity" className="btn-admin ghost">View Activity →</Link>
        <Link to="/chat" className="btn-admin ghost">Chat Manage →</Link>
        <Link to="/settings" className="btn-admin ghost">Settings →</Link>
      </div>
    </div>
  )
}
