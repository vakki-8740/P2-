import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getGroupedUserById, formatDate } from '../utils/dataStore.js'
import ImageViewer from '../components/ImageViewer.jsx'

export default function UserDetail(){
  const { userId } = useParams()
  const id = decodeURIComponent(userId || '')
  const user = getGroupedUserById(id)
  const [viewFile, setViewFile]=useState(null)

  if(!user) return (
    <div className="admin-card" style={{padding:20}}>
      <h2>User not found</h2>
      <p style={{color:'var(--admin-muted)', marginTop:6}}>No complaints for id: {id}</p>
      <Link to="/users" className="btn-admin ghost small" style={{marginTop:12, display:'inline-flex'}}>Back to Users</Link>
    </div>
  )

  return (
    <div>
      <Link to="/users" className="btn-admin ghost small" style={{marginBottom:12, display:'inline-flex'}}>← Back to Users</Link>
      <div className="admin-card" style={{marginBottom:14}}>
        <div className="admin-card-body" style={{display:'flex', gap:14, alignItems:'center'}}>
          <div className="user-avatar" style={{width:52, height:52, fontSize:18}}>{user.avatarLetter}</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:800, fontSize:'1.05rem'}}>{user.displayName}</div>
            <div style={{fontSize:'.82rem', color:'var(--admin-muted)', marginTop:4, display:'flex', gap:12, flexWrap:'wrap'}}>
              <span>📱 {user.mobile}</span>
              <span>✉️ {user.email}</span>
              <span>🆔 {user.id}</span>
            </div>
            <div style={{marginTop:6, display:'flex', gap:6, flexWrap:'wrap'}}>
              {user.types.map(t=> <span key={t} className="user-badge">{t}</span>)}
            </div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontWeight:800, fontSize:'1.3rem'}}>{user.complains.length}</div>
            <div style={{fontSize:'.72rem', color:'var(--admin-muted)'}}>Complaints</div>
          </div>
        </div>
      </div>

      <h3 style={{fontWeight:800, marginBottom:10}}>All Complains — {user.displayName} ({user.complains.length})</h3>
      <div style={{display:'flex', flexDirection:'column', gap:14}}>
        {user.complains.slice().sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt)).map(c=>(
          <div key={c.id} className="comp-item">
            <div className="comp-head">
              <span className="comp-badge">{c.type} • {c.title}</span>
              <span className="comp-date">{formatDate(c.createdAt)}</span>
            </div>
            <div className="comp-title">{c.title} — {c.type}</div>
            <div className="comp-grid">
              {Object.entries(c.details || {}).map(([k,v])=>(
                <div key={k}>
                  <div className="comp-k">{k.replace(/([A-Z])/g,' $1')}</div>
                  <div className="comp-v">{v || '-'}</div>
                </div>
              ))}
              <div>
                <div className="comp-k">Created</div>
                <div className="comp-v">{formatDate(c.createdAt)}</div>
              </div>
              <div>
                <div className="comp-k">ID</div>
                <div className="comp-v" style={{fontFamily:'JetBrains Mono', fontSize:'.78rem'}}>{c.id}</div>
              </div>
            </div>
            {c.files && Object.keys(c.files).length>0 && (
              <div>
                <div style={{fontWeight:800, fontSize:'.82rem', marginBottom:8}}>Uploaded Images / Files</div>
                <div style={{display:'flex', flexDirection:'column', gap:8}}>
                  {Object.entries(c.files).map(([key,f])=>(
                    <div key={key} className="file-row">
                      <div className="file-icon">🖼️</div>
                      <div>
                        <div className="file-name">{key}</div>
                        <div className="file-sub">{f.name || key} {f.data ? '• ready' : ''}</div>
                      </div>
                      <button className="btn-admin primary small view-btn" onClick={()=> setViewFile(f)} disabled={!f.data}>{f.data ? 'View' : 'No file'}</button>
                    </div>
                  ))}
                </div>
                <div style={{fontSize:'.72rem', color:'var(--admin-muted)', marginTop:8}}>Images are not shown directly — tap View to open, then you can Close or Download.</div>
              </div>
            )}
          </div>
        ))}
      </div>
      {viewFile && <ImageViewer file={viewFile} onClose={()=> setViewFile(null)} />}
    </div>
  )
}
