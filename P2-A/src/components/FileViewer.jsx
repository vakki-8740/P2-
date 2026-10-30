import { useEffect } from 'react'
import { IconClose } from './Icons.jsx'

/** Attachment popup — image yahan khulti hai, close bhi ho sakti hai */
export default function FileViewer({ open, src, name, onClose }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || !src) return null

  return (
    <div className="overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={name || 'Attachment'}>
      <div className="viewer" onClick={(e) => e.stopPropagation()}>
        <div className="viewer-head">
          <span className="viewer-title">{name || 'Attachment'}</span>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <IconClose width="16" height="16" />
          </button>
        </div>
        <div className="viewer-body">
          <img src={src} alt={name || 'Attachment'} />
        </div>
        <div className="viewer-foot">
          <a className="btn ghost sm" href={src} target="_blank" rel="noopener">Open in new tab</a>
          <button type="button" className="btn primary sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
