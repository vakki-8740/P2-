import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import FileViewer from '../components/FileViewer'
import { withBase } from '../utils/base'
import {
  getComplainsAsync,
  subscribeComplains,
  clearComplains,
  deleteComplain,
  normalizeComplainRow,
  detailEntries,
  fileSrc,
  isImageFile,
  formatFileSize,
  formatDate,
} from '../utils/complainStore'
import { isFirebaseConfigured } from '../firebase-config'

/** paymentImage → "Payment Image", aadharFront → "Aadhar Front" */
function prettyFileLabel(key) {
  return String(key || 'File')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (ch) => ch.toUpperCase())
}

export default function AllComplains() {
  const [complains, setComplains] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [viewer, setViewer] = useState(null) // { src, name } — image popup

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

    // Firebase real-time: naya/edited complaint turant screen pe.
    const unsubscribe = subscribeComplains((rows) => {
      setComplains((rows || []).map(normalizeComplainRow).filter(Boolean))
      setLoading(false)
    })

    const handler = () => load()
    window.addEventListener('complains-updated', handler)
    window.addEventListener('storage', handler)
    return () => {
      unsubscribe()
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

        {!isFirebaseConfigured() && (
          <div className="card" style={{ borderLeft: '4px solid #d97706', padding: '14px 16px' }}>
            <strong>Firebase configure nahi hai.</strong>{' '}
            <span style={{ fontSize: '14px' }}>
              Abhi complaints sirf isi browser me save ho rahi hain. Real-time ke liye{' '}
              <code>Site/src/firebase-config.js</code> me config daalo — steps:{' '}
              <code>FIREBASE-SETUP.md</code>.
            </span>
          </div>
        )}

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
                  <div className="complain-item-head-right">
                    <span className={`badge ${c.status === 'resolved' ? 'success' : 'warning'}`}>
                      {c.status || 'Pending'}
                    </span>
                    <span className="complain-item-date">{formatDate(c.createdAt)}</span>
                  </div>
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
                    <div className="complain-file-list">
                      {files.map(([key, f]) => {
                        const src = fileSrc(f)
                        const label = prettyFileLabel(key)
                        return (
                          <div key={key} className="complain-file-row">
                            <span className="complain-file-icon" aria-hidden="true">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="3" />
                                <circle cx="8.5" cy="9" r="1.6" />
                                <path d="M21 15l-5-5L5 21" />
                              </svg>
                            </span>
                            <span className="complain-file-meta">
                              <span className="complain-file-name">{label}</span>
                              <span className="complain-file-sub">
                                {f.name}{f.size ? ` • ${formatFileSize(f.size)}` : ''}
                              </span>
                            </span>
                            {src ? (
                              isImageFile(f) ? (
                                <button
                                  type="button"
                                  className="btn secondary sm complain-file-btn"
                                  onClick={() => setViewer({ src, name: f.name || label })}
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                                    <circle cx="12" cy="12" r="3" />
                                  </svg>
                                  View
                                </button>
                              ) : (
                                <a className="btn secondary sm complain-file-btn" href={src} download={f.name} target="_blank" rel="noopener">
                                  Open
                                </a>
                              )
                            ) : (
                              <span className="muted" style={{ fontSize: '0.75rem' }}>Not available</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="complain-item-foot">
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

      <FileViewer
        open={Boolean(viewer)}
        src={viewer?.src}
        name={viewer?.name}
        onClose={() => setViewer(null)}
      />

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
