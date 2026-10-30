import { useState } from 'react'
import { Icon } from '../icons/Icons.jsx'
import './Alert.css'

const TONE_ICON = { info: 'info', success: 'check-circle', warning: 'alert-triangle', danger: 'x-circle' }

export function Alert({ tone = 'info', title, children, dismissible = true }) {
  const [open, setOpen] = useState(true)
  if (!open) return null
  return (
    <div className={`own-alert own-alert--${tone}`} role="alert">
      <Icon name={TONE_ICON[tone]} size={19} className="own-alert__icon" />
      <div className="own-alert__body">
        {title && <p className="own-alert__title">{title}</p>}
        <p className="own-alert__text">{children}</p>
      </div>
      {dismissible && (
        <button type="button" className="own-alert__close" aria-label="Dismiss" onClick={() => setOpen(false)}>
          <Icon name="x" size={15} />
        </button>
      )}
    </div>
  )
}

export function Badge({ tone = 'accent', children, dot = false }) {
  return (
    <span className={`own-badge own-badge--${tone}`}>
      {dot && <span className="own-badge__dot" />}
      {children}
    </span>
  )
}

export function Chip({ label, onRemove, icon, selected = false, onClick }) {
  return (
    <span className={`own-chip${selected ? ' is-selected' : ''}`}>
      {icon && <Icon name={icon} size={14} />}
      <button type="button" className="own-chip__label" onClick={onClick}>{label}</button>
      {onRemove && (
        <button type="button" className="own-chip__remove" aria-label={`Remove ${label}`} onClick={() => onRemove(label)}>
          <Icon name="x" size={12} />
        </button>
      )}
    </span>
  )
}
