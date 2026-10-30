import { IconUser } from './Icons.jsx'

/** Har user ka same icon (jaisa user panel me hota hai) */
export function Avatar({ size = 40 }) {
  return (
    <span className="avatar" style={{ width: size, height: size }}>
      <IconUser width={size * 0.55} height={size * 0.55} />
    </span>
  )
}

/** pending = amber, resolved = green, rejected = red */
export function statusTone(status) {
  const s = String(status || '').toLowerCase()
  if (['resolved', 'done', 'closed', 'completed'].includes(s)) return 'success'
  if (['rejected', 'cancelled', 'canceled', 'failed'].includes(s)) return 'danger'
  return 'warning'
}

export function statusLabel(status) {
  return String(status || 'pending')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (ch) => ch.toUpperCase())
}

export function StatusPill({ status }) {
  return <span className={`pill ${statusTone(status)}`}>{statusLabel(status)}</span>
}

export function Empty({ title = 'Kuch nahi hai', text = '', icon = null }) {
  return (
    <div className="empty">
      {icon ? <div className="empty-icon">{icon}</div> : null}
      <h3>{title}</h3>
      {text ? <p>{text}</p> : null}
    </div>
  )
}

export function Field({ label, value }) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <span className="field-value">{value || '-'}</span>
    </div>
  )
}

/** paymentImage → "Payment Image" */
export function prettyLabel(key) {
  return String(key || 'File')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (ch) => ch.toUpperCase())
}
