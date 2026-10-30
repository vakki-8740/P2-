/**
 * FileViewer — attachment ka popup (lightbox).
 *
 * All Complains page pe image seedha nahi dikhti; wahan "View" button hota hai
 * aur tap karne pe image isi popup me khulti hai.
 *
 *   <FileViewer open={!!viewer} src={viewer?.src} name={viewer?.name} onClose={() => setViewer(null)} />
 */
import { useEffect } from 'react'

export default function FileViewer({ open, src, name, onClose }) {
  // Esc dabane pe band
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || !src) return null

  return (
    <div
      className="overlay open"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={name || 'Attachment'}
    >
      <div className="file-viewer" onClick={(e) => e.stopPropagation()}>
        <div className="file-viewer-head">
          <span className="file-viewer-title">{name || 'Attachment'}</span>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="file-viewer-body">
          <img src={src} alt={name || 'Attachment'} />
        </div>

        <div className="file-viewer-foot">
          <a className="btn secondary sm" href={src} target="_blank" rel="noopener">
            Open in new tab
          </a>
          <button type="button" className="btn ghost small" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
