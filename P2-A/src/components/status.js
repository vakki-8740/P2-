// complaint status → OWN Library Badge/Chip tone
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

/** "Rahul Sharma" → "RS" (OWN Avatar initials) */
export function initialsOf(name, fallback = 'U') {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return fallback
  return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase()
}

/** paymentImage → "Payment Image" */
export function prettyLabel(key) {
  return String(key || 'File')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (ch) => ch.toUpperCase())
}
