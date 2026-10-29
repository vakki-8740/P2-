import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getGroupedUserById } from '../utils/dataStore.js'

function fileSizeStr(b){ if(!b) return ''; if(b<1024) return b+' B'; if(b<1024*1024) return (b/1024).toFixed(1)+' KB'; return (b/1024/1024).toFixed(2)+' MB' }

export default function ChatDetail(){
  const { userId } = useParams()
  const id = decodeURIComponent(userId||'')
  const user = getGroupedUserById(id) || { displayName: 'Guest User', avatarLetter:'G', id, mobile:'—', email:'—' }
  const [msgs,setMsgs]=useState([])
  const [input,setInput]=useState('')
  const listRef=useRef(null)

  const load=()=>{ try{ const m=JSON.parse(localStorage.getItem('parimatch_chat_messages')||'[]'); setMsgs(m.sort((a,b)=> new Date(a.createdAt)-new Date(b.createdAt))) }catch{ setMsgs([])} }
  useEffect(()=>{ load(); const h=()=>load(); window.addEventListener('storage',h); window.addEventListener('chat-updated',h); return ()=>{ window.removeEventListener('storage',h); window.removeEventListener('chat-updated',h)} },[id])
  useEffect(()=>{ if(listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight },[msgs])

  const send = ()=>{
    const text = input.trim()
    if(!text) return
    const msg = { id: Date.now().toString(36)+Math.random().toString(36).slice(2,5), sender:'support', text, file:null, createdAt: new Date().toISOString() }
    const cur = (()=>{ try{ return JSON.parse(localStorage.getItem('parimatch_chat_messages')||'[]')}catch{return []}})()
    cur.push(msg)
    localStorage.setItem('parimatch_chat_messages', JSON.stringify(cur))
    window.dispatchEvent(new Event('chat-updated'))
    setInput('')
    load()
  }

  const clear = ()=>{
    if(!confirm('Clear all chat messages?')) return
    localStorage.removeItem('parimatch_chat_messages')
    window.dispatchEvent(new Event('chat-updated'))
    load()
  }

  return (
    <div>
      <Link to="/chat" className="btn-admin ghost small" style={{marginBottom:12, display:'inline-flex'}}>← Back to Chat Users</Link>
      <div className="admin-card" style={{overflow:'hidden'}}>
        <div className="admin-card-head" style={{background:'var(--admin-card)'}}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <div className="user-avatar" style={{width:40, height:40}}>{user.avatarLetter}</div>
            <div>
              <div style={{fontWeight:800}}>{user.displayName}</div>
              <div style={{fontSize:'.75rem', color:'var(--admin-muted)'}}>{user.mobile} • {user.email} • ID: {user.id.slice(0,12)}</div>
            </div>
          </div>
          <button className="btn-admin ghost small" onClick={clear}>Clear</button>
        </div>
        <div ref={listRef} className="chat-thread" style={{minHeight:380, maxHeight:'55vh'}}>
          {msgs.length===0 ? (
            <div className="empty-admin">
              <div style={{fontSize:24}}>💬</div>
              <h3 style={{fontWeight:800, color:'var(--admin-text)', marginTop:8}}>No messages yet</h3>
              <p style={{fontSize:'.85rem'}}>When user chats via Live Chat, messages appear here. You can reply as support.</p>
            </div>
          ) : msgs.map(m=>{
            const isUser = m.sender==='user'
            return (
              <div key={m.id} style={{display:'flex', justifyContent: isUser?'flex-start':'flex-end'}}>
                <div className={`chat-bubble-admin ${isUser?'support':'user'}`} style={{maxWidth:'78%'}}>
                  {m.file && (
                    <div style={{marginBottom:8}}>
                      {m.file.type && m.file.type.startsWith('image/') ? (
                        <a href={m.file.data} target="_blank" rel="noopener"><img src={m.file.data} alt={m.file.name} style={{maxWidth:180, borderRadius:8, border:'1px solid var(--admin-border)'}} /></a>
                      ) : (
                        <div style={{display:'flex', alignItems:'center', gap:8, background:'rgba(0,0,0,.08)', padding:'6px 8px', borderRadius:8}}>
                          <span>📎 {m.file.name}</span>
                          <a href={m.file.data} download={m.file.name} target="_blank" rel="noopener" style={{fontWeight:700, fontSize:12, color:'var(--admin-primary)'}}>Download</a>
                        </div>
                      )}
                    </div>
                  )}
                  <div>{m.text}</div>
                  <div style={{fontSize:11, opacity:.7, marginTop:6, textAlign:'right'}}>{new Date(m.createdAt).toLocaleTimeString('en-IN',{hour:'2-digit', minute:'2-digit'})} {m.edited?'• edited':''}</div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="chat-input-admin">
          <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Reply as support..." onKeyDown={e=> e.key==='Enter' && send()} />
          <button className="btn-admin primary" onClick={send} disabled={!input.trim()}>Send</button>
        </div>
      </div>
      <div style={{fontSize:'.72rem', color:'var(--admin-muted)', marginTop:8, textAlign:'center'}}>Admin replies are saved to same chat thread (localStorage). In production connect to real backend.</div>
    </div>
  )
}
