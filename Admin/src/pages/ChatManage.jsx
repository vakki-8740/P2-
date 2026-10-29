import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMessages, getGroupedUsers } from '../utils/dataStore.js'

export default function ChatManage(){
  const [users,setUsers]=useState([])
  const [msgs,setMsgs]=useState([])
  const load=()=>{
    // chat users: we don't have per-user chat id, so we derive pseudo-users from complaint users + one generic chat user
    const g = getGroupedUsers()
    const m = (()=>{ try{ return JSON.parse(localStorage.getItem('parimatch_chat_messages')||'[]')}catch{return []} })()
    setMsgs(m)
    // Build chat user list: if complains exist, show them as chat users (they likely also chatted), else generic
    if(g.length){
      // add last chat time to each
      const withChat = g.map(u=> ({...u, lastChatAt: m.length? m[m.length-1].createdAt : u.lastAt, chatCount: m.length? Math.ceil(m.length / Math.max(1,g.length)) : 0 }))
      setUsers(withChat)
    } else {
      const generic = m.length ? [{ id:'guest', displayName:'Guest User', mobile:'—', email:'—', avatarLetter:'G', lastAt: m[m.length-1].createdAt, lastChatAt: m[m.length-1].createdAt, chatCount: m.length, types:['Live Chat'] }] : []
      setUsers(generic)
    }
  }
  useEffect(()=>{ load(); const h=()=>load(); window.addEventListener('storage',h); window.addEventListener('chat-updated',h); window.addEventListener('complains-updated',h); return ()=>{ window.removeEventListener('storage',h); window.removeEventListener('chat-updated',h); window.removeEventListener('complains-updated',h)} },[])

  return (
    <div>
      <h1 style={{fontWeight:800, fontSize:'1.3rem'}}>Chat Manage</h1>
      <p style={{color:'var(--admin-muted)', fontSize:'.85rem', marginTop:4}}>User list like Users — tap to open chats</p>
      <div className="admin-card" style={{marginTop:14}}>
        <div className="admin-card-head">
          <h2>Chat Users</h2>
          <span style={{fontSize:'.78rem', color:'var(--admin-muted)'}}>{users.length} users • {msgs.length} messages</span>
        </div>
        <div className="admin-card-body" style={{display:'flex', flexDirection:'column', gap:8}}>
          {users.length===0 ? <div className="empty-admin">No chat users yet — when someone uses Live Chat, they appear here</div> : users.map(u=>(
            <Link key={u.id} to={`/chat/${encodeURIComponent(u.id)}`} className="user-row">
              <div className="user-avatar" style={{background:'var(--admin-card-3)'}}>{u.avatarLetter}</div>
              <div className="user-main">
                <div className="user-name">{u.displayName}</div>
                <div className="user-meta">
                  <span>💬 {u.chatCount || msgs.length} messages</span>
                  <span>•</span>
                  <span>⏰ {new Date(u.lastChatAt || u.lastAt).toLocaleString('en-IN',{day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'})}</span>
                </div>
              </div>
              <span style={{fontSize:11, background:'var(--admin-primary)', color:'var(--admin-primary-text)', padding:'4px 8px', borderRadius:999, fontWeight:800}}>{u.chatCount || ''}</span>
              <span className="user-chevron">›</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
