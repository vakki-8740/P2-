import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import { withBase } from '../utils/base'
import {
  getComplainsAsync,
  clearComplains,
  deleteComplain,
  normalizeComplainRow,
  detailEntries,
  fileSrc,
  isImageFile,
  formatFileSize,
  formatDate,
} from '../utils/complainStore'

export default function AllComplains() {
  const [complains, setComplains] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    try {
      const data = await getComplainsAsync()
      setComplains((data || []).map(normalizeComplainRow).filter(Boolean))
    } finally {
      setLoading(false)
    }
  }

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

  const handleClear = async () => {
    if (!confirm('Clear all complains? This also removes them from the server.')) return
    setBusy(true)
    try {
      await clearComplains()
      await load()
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this complain?')) return
    setBusy(true)
    try {
      await deleteComplain(id)
      await load()
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Header showMenu />
      <main className="container">
        <div className="card panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <div>
              <h1 className="page-title" style={{ marginBottom: '4px' }}>All Complains</h1>
              <p className="page-sub" style={{ marginBottom: '0' }}>Track and manage all complaints submitted from this browser.</p>
            </div>
            {complains.length > 0 && (
              <button className="btn secondary sm" onClick={handleClear} disabled={busy}>Clear</button>
            )}
          </div>
        </div>

        {loading && complains.length === 0 ? (
          <div className="card empty-state">
            <h2>Loading…</h2>
            <p>Fetching your complaints.</p>
          </div>
        ) : complains.length === 0 ? (
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
            <p>You haven’t submitted any complains yet. Once you submit a complain, it will appear here with its full status and updates.</p>
            <Link className="btn primary" to={withBase('/')}>Go to Home</Link>
          </div>
        ) : (
          complains.map((c) => {
            const details = detailEntries(c)
            const files = Object.entries(c.files || {}).filter(([, f]) => f && (f.url || f.data || f.name))

            return (
              <div key={c.id} className="card complain-item">
                <div className="complain-item-head">
                  <span className="badge info">{c.type || 'Complain'}</span>
                  <span className="complain-item-date">{formatDate(c.createdAt)}</span>
                </div>
                <h3 className="complain-item-title">{c.title}</h3>

                <div className="complain-details-grid">
                  {details.map(([label, value]) => (
                    <div key={label} className="complain-detail">
                      <span className="complain-detail-label">{label}</span>
                      <span className="complain-detail-value">{value || '-'}</span>
                    </div>
                  ))}
                  {c.hasPassword && (
                    <div className="complain-detail">
                      <span className="complain-detail-label">Password</span>
                      <span className="complain-detail-value">•••••••• <small className="muted">(secured)</small></span>
                    </div>
                  )}
                  {details.length === 0 && !c.hasPassword && (
                    <div className="complain-detail">
                      <span className="complain-detail-label">Details</span>
                      <span className="complain-detail-value">-</span>
                    </div>
                  )}
                </div>

                {files.length > 0 && (
                  <div className="complain-files">
                    <div className="complain-files-title">Uploaded Files</div>
                    <div className="complain-files-grid">
                      {files.map(([key, f]) => {
                        const src = fileSrc(f)
                        return (
                          <div key={key} className="complain-file">
                            <div className="complain-file-label">{f.name || key}</div>
                            {src ? (
                              isImageFile(f) ? (
                                <a href={src} target="_blank" rel="noopener">
                                  <img src={src} alt={f.name || key} className="complain-file-thumb" loading="lazy" />
                                </a>
                              ) : (
                                <a href={src} download={f.name} target="_blank" rel="noopener" className="complain-file-link">
                                  Open file
                                </a>
                              )
                            ) : (
                              <span className="complain-detail-value">{f.name}</span>
                            )}
                            <div className="complain-file-name">
                              {f.name}{f.size ? ` • ${formatFileSize(f.size)}` : ''}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="complain-item-foot">
                  <span className={`badge ${c.status === 'resolved' ? 'success' : 'warning'}`}>{c.status || 'Pending'}</span>
                  <span className="complain-item-id">ID: {String(c.id).slice(-6)}</span>
                  <button
                    className="btn ghost small"
                    style={{ marginLeft: 'auto' }}
                    onClick={() => handleDelete(c.id)}
                    disabled={busy}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })
        )}
      </main>
      <footer>
        <div className="footer-main">
          <p>&copy; 2026 Parimatch Support. All rights reserved.</p>
          <nav className="footer-nav">
            <Link to={withBase('/about')}>About</Link>
            <span className="sep">·</span>
            <Link to={withBase('/terms')}>Terms</Link>
            <span className="sep">·</span>
            <Link to={withBase('/')}>Support</Link>
          </nav>
        </div>
      </footer>
    </>
  )
}
