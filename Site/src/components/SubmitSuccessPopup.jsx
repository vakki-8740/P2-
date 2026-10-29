export default function SubmitSuccessPopup({ open, onClose, onViewAll }) {
  if (!open) return null
  return (
    <div className="overlay open" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-icon success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="modal-title">
            <h3>Complaint Submitted Successfully!</h3>
            <p>Thank you for contacting us</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <div className="modal-body">
          <p><strong>Your complaint has been submitted successfully.</strong></p>
          <p>Please wait a few seconds while our support team reviews your request and begins working on it. You can track the progress and status updates on the <strong>All Complains</strong> page at any time.</p>
          <p>We appreciate your patience and will get back to you shortly.</p>
        </div>
        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>Continue</button>
          <button className="btn primary" onClick={onViewAll}>View All Complains</button>
        </div>
      </div>
    </div>
  )
}
