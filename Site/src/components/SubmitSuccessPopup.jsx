import { useEffect } from 'react'

export default function SubmitSuccessPopup({ open, onClose }) {
  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => onClose?.(), 3000)
    return () => clearTimeout(t)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="overlay open" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ textAlign: 'center', padding: '28px 22px 24px', width: 'min(360px, 92%)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <div className="modal-icon success" style={{ width: 42, height: 42, borderRadius: '50%' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        </div>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 8, color: 'var(--text)', lineHeight: 1.4 }}>
          Complaint Submitted Successfully
        </h3>
        <p style={{ fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--muted)', margin: 0 }}>
          Your complaint has been submitted successfully. Please wait while our support team reviews it.
        </p>
      </div>
    </div>
  )
}
