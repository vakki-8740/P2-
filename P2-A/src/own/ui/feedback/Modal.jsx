import { useEffect, useRef } from 'react'
import { Icon } from '../icons/Icons.jsx'
import './Modal.css'

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.querySelector('button, input, select, textarea, a[href]')?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="own-modal" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.() }}>
      <div
        className={`own-modal__panel own-modal__panel--${size}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={panelRef}
      >
        <div className="own-modal__head">
          <h3>{title}</h3>
          <button type="button" className="own-modal__close" aria-label="Close dialog" onClick={onClose}>
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="own-modal__body">{children}</div>
        {footer && <div className="own-modal__footer">{footer}</div>}
      </div>
    </div>
  )
}
