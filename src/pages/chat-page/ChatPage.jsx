import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Header from '../../components/Header'
import { getMessages, saveMessage, updateMessage, deleteMessage, clearMessages, generateChatId, fileToBase64, formatTime, formatDateChat } from '../../utils/chatStore'

const SUPPORT_REPLIES = [
  "Thanks for reaching out! Our team is reviewing your message.",
  "Got it — could you share a bit more detail so we can help faster?",
  "We’ve received your file. Our support team will check and update you shortly.",
  "Your request is in queue. We typically reply within 2 minutes.",
  "Thanks for the update! We’ll get back to you very soon.",
]

function fileSizeStr(bytes){
  if(!bytes) return ""
  if(bytes < 1024) return bytes+" B"
  if(bytes < 1024*1024) return (bytes/1024).toFixed(1)+" KB"
  return (bytes/1024/1024).toFixed(2)+" MB"
}

export default function ChatPage(){
  const [messages, setMessages] = useState(()=>getMessages())
  const [input, setInput] = useState("")
  const [attach, setAttach] = useState(null)
  const [attachPreview, setAttachPreview] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [openMenu, setOpenMenu] = useState(null)
  const [toast, setToast] = useState("")
  const listRef = useRef(null)
  const fileRef = useRef(null)

  const load = ()=> setMessages(getMessages())
  useEffect(()=>{
    load()
    const h = ()=> load()
    window.addEventListener('chat-updated', h)
    window.addEventListener('storage', h)
    return ()=>{ window.removeEventListener('chat-updated', h); window.removeEventListener('storage', h)}
  },[])

  useEffect(()=>{
    if(listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  },[messages, attachPreview])

  useEffect(()=>{
    if(toast){
      const t=setTimeout(()=>setToast(""), 1800)
      return ()=>clearTimeout(t)
    }
  },[toast])

  const showToast = (msg)=> setToast(msg)

  const onFileSelect = async (e)=>{
    const f = e.target.files && e.target.files[0]
    if(!f) return
    try{
      const data = await fileToBase64(f)
      setAttach({name:f.name, type:f.type, size:f.size, data})
      if(f.type.startsWith('image/')) setAttachPreview(data)
      else setAttachPreview(null)
    }catch(err){ alert(err.message) }
    e.target.value=""
  }

  const removeAttach = ()=>{ setAttach(null); setAttachPreview(null) }

  const handleSend = async ()=>{
    const text = input.trim()
    if(!text && !attach) return
    if(editingId){
      updateMessage(editingId, text || "(file)")
      setMessages(getMessages())
      setEditingId(null)
      setInput("")
      setAttach(null); setAttachPreview(null)
      showToast("Edited ✓")
      return
    }
    const msg = {
      id: generateChatId(),
      sender: 'user',
      text: text,
      file: attach ? { ...attach } : null,
      createdAt: new Date().toISOString(),
      edited: false
    }
    saveMessage(msg)
    setMessages(getMessages())
    setInput("")
    setAttach(null); setAttachPreview(null)

    setTimeout(()=>{
      const rep = SUPPORT_REPLIES[Math.floor(Math.random()*SUPPORT_REPLIES.length)]
      const bot = {
        id: generateChatId(),
        sender: 'support',
        text: rep,
        file: null,
        createdAt: new Date().toISOString(),
        edited:false
      }
      saveMessage(bot)
      setMessages(getMessages())
    }, 1100 + Math.random()*600)
  }

  const startEdit = (m)=>{
    setEditingId(m.id)
    setInput(m.text)
    setOpenMenu(null)
  }
  const cancelEdit = ()=>{ setEditingId(null); setInput(""); setAttach(null); setAttachPreview(null) }

  const handleDelete = (id)=>{
    if(!confirm("Delete this message?")) return
    deleteMessage(id)
    setMessages(getMessages())
    setOpenMenu(null)
    showToast("Deleted")
  }

  const handleCopy = async (text)=>{
    try{ await navigator.clipboard.writeText(text); showToast("Copied ✓") }catch{ showToast("Copy failed") }
    setOpenMenu(null)
  }

  const handleClear = ()=>{
    if(!confirm("Clear all chat history?")) return
    clearMessages()
    setMessages([])
    showToast("Chat cleared")
  }

  return (
    <>
      <Header showMenu />
      <main className="container chat-page chat-fullpage complain-open">
        <div className="card chat-back-card complain-anim d1" style={{padding:'14px 16px'}}>
          <Link className="back-link" to="/site" style={{marginBottom:0}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
            Back
          </Link>
        </div>

        <div className="card chat-shell complain-anim d2">
          <div className="chat-topbar">
            <div className="chat-topbar-left">
              <div className="chat-avatar">P</div>
              <div className="chat-head-text">
                <span className="chat-title">Parimatch Live Support</span>
                <span className="chat-sub"><span className="online-dot"></span> Online • Typically replies in 2 min</span>
              </div>
            </div>
            <button className="btn ghost small" onClick={handleClear} title="Clear chat">Clear</button>
          </div>
          <div className="chat-list" ref={listRef}>
            {messages.length===0 ? (
              <div className="chat-empty">
                <div className="chat-empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><circle cx="12" cy="10" r="0.01" strokeWidth="2.5"/><circle cx="8.5" cy="10" r="0.01" strokeWidth="2.5"/><circle cx="15.5" cy="10" r="0.01" strokeWidth="2.5"/></svg>
                </div>
                <h3>Welcome to Live Chat</h3>
                <p>Send a message, image or PDF. Our team will reply shortly. You can edit, delete or copy your messages.</p>
              </div>
            ) : (
              messages.map((m, idx)=>{
                const prevDate = idx>0 ? formatDateChat(messages[idx-1].createdAt) : null
                const curDate = formatDateChat(m.createdAt)
                const showDate = prevDate !== curDate
                const isUser = m.sender==='user'
                return (
                  <div key={m.id}>
                    {showDate && <div className="chat-date-sep"><span>{curDate}</span></div>}
                    <div className={`chat-bubble-row ${isUser?'user':'support'}`}>
                      <div className="chat-bubble">
                        {m.file && (
                          <div className="chat-file">
                            {m.file.type && m.file.type.startsWith('image/') ? (
                              <a href={m.file.data} target="_blank" rel="noopener">
                                <img src={m.file.data} alt={m.file.name} className="chat-img" />
                              </a>
                            ) : (
                              <div className="chat-file-card">
                                <div className="chat-file-icon">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                </div>
                                <div className="chat-file-meta">
                                  <div className="chat-file-name">{m.file.name}</div>
                                  <div className="chat-file-size">{fileSizeStr(m.file.size)} {m.file.type.includes('pdf')?'• PDF':''}</div>
                                </div>
                                <a className="chat-file-dl" href={m.file.data} download={m.file.name} target="_blank" rel="noopener">Download</a>
                              </div>
                            )}
                          </div>
                        )}
                        {m.text && <div className="chat-text">{m.text}</div>}
                        <div className="chat-meta">
                          <span>{formatTime(m.createdAt)}</span>
                          {m.edited && <span>• edited</span>}
                          {isUser && <span className="chat-check">✓✓</span>}
                        </div>
                        {isUser && (
                          <div className="chat-actions">
                            <button className="ca-btn" onClick={()=>setOpenMenu(openMenu===m.id?null:m.id)} aria-label="More">⋮</button>
                            {openMenu===m.id && (
                              <div className="chat-menu">
                                <button onClick={()=> handleCopy(m.text || m.file?.name || "")}>
                                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v3"/></svg> Copy
                                </button>
                                <button onClick={()=> startEdit(m)}>
                                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit
                                </button>
                                <button className="danger" onClick={()=> handleDelete(m.id)}>
                                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {attach && (
            <div className="chat-attach-preview">
              {attachPreview ? <img src={attachPreview} alt="preview" /> : (
                <div className="attach-file-row">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span>{attach.name}</span><span className="muted">{fileSizeStr(attach.size)}</span>
                </div>
              )}
              <button className="attach-remove" onClick={removeAttach}>✕</button>
            </div>
          )}

          <div className="chat-inputbar">
            <input ref={fileRef} type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip" hidden onChange={onFileSelect} />
            <button className="chat-attach-btn" onClick={()=> fileRef.current && fileRef.current.click()} title="Attach image / PDF / file">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
            </button>
            <input
              className="chat-input"
              placeholder={editingId ? "Edit message..." : "Type a message..."}
              value={input}
              onChange={e=> setInput(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); handleSend() }}}
            />
            {editingId && <button className="btn ghost small" onClick={cancelEdit}>Cancel</button>}
            <button className="btn primary chat-send" onClick={handleSend} disabled={!input.trim() && !attach}>
              {editingId ? "Update" : "Send"}
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
          <div className="chat-hint">You can send images, PDFs and files • Tap ⋮ on your message to edit / delete / copy</div>
        </div>
      </main>

      {toast && <div className="chat-toast">{toast}</div>}
    </>
  )
}
