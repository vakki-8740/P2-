import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import { getComplains, clearComplains, formatDate } from '../utils/complainStore'

export default function AllComplains() {
  const [complains, setComplains] = useState([])

  const load = () => setComplains(getComplains())

  useEffect(() => {
    load()
    const handler = () => load()
    window.addEventListener('complains-updated', handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener('complains-updated', handler)
      window.removeEventListener('storage', handler)
    }
  }, [])

  return (
    <>
      <Header showMenu />
      <main className="container">
        <div className="card panel">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:'12px'}}>
            <div>
              <h1 className="page-title" style={{marginBottom:'4px'}}>All Complains</h1>
              <p className="page-sub" style={{marginBottom:'0'}}>Track and manage all complaints submitted from this portal.</p>
            </div>
            {complains.length > 0 && (
              <button className="btn secondary sm" onClick={()=>{ if(confirm('Clear all complains?')) { clearComplains(); load() } }}>Clear</button>
            )}
          </div>
        </div>

        {complains.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <h2>No Complains Yet</h2>
            <p>You haven't submitted any complains yet. Once you submit a complain, it will appear here with its full status and updates.</p>
            <Link className="btn primary" to="/">Go to Home</Link>
          </div>
        ) : (
          complains.map((c) => (
            <div key={c.id} className="card complain-item">
              <div className="complain-item-head">
                <span className="badge info">{c.type}</span>
                <span className="complain-item-date">{formatDate(c.createdAt)}</span>
              </div>
              <h3 className="complain-item-title">{c.title}</h3>

              <div className="complain-details-grid">
                {Object.entries(c.details || {}).map(([k, v]) => (
                  <div key={k} className="complain-detail">
                    <span className="complain-detail-label">{k.replace(/([A-Z])/g, ' $1').replace(/^./, s=>s.toUpperCase())}</span>
                    <span className="complain-detail-value">{v || '-'}</span>
                  </div>
                ))}
              </div>

              {c.files && Object.keys(c.files).length > 0 && (
                <div className="complain-files">
                  <div className="complain-files-title">Uploaded Files</div>
                  <div className="complain-files-grid">
                    {Object.entries(c.files).map(([key, f]) => (
                      <div key={key} className="complain-file">
                        <div className="complain-file-label">{key}</div>
                        {f.data ? (
                          f.data.startsWith('data:image') ? (
                            <img src={f.data} alt={key} className="complain-file-thumb" />
                          ) : (
                            <a href={f.data} download={f.name} className="complain-file-link">{f.name}</a>
                          )
                        ) : (
                          <span className="complain-detail-value">{f.name}</span>
                        )}
                        <div className="complain-file-name">{f.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="complain-item-foot">
                <span className="badge warning">Pending</span>
                <span className="complain-item-id">ID: {c.id.slice(-6)}</span>
              </div>
            </div>
          ))
        )}
      </main>
      <footer><p>&copy; 2026 Parimatch Support. All rights reserved.</p></footer>
    </>
  )
}
