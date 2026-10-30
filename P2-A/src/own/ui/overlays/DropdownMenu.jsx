import { useEffect, useRef, useState } from 'react'
import { Icon } from '../icons/Icons.jsx'
import './DropdownMenu.css'

const ITEMS = [
  { id: 'profile', label: 'View profile', icon: 'user' },
  { id: 'settings', label: 'Account settings', icon: 'settings' },
  { id: 'billing', label: 'Billing', icon: 'credit-card' },
  { id: 'divider' },
  { id: 'logout', label: 'Sign out', icon: 'logout', danger: true },
]

export function DropdownMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div className="own-dropdown" ref={ref}>
      <button type="button" className="own-dropdown__trigger" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="own-dropdown__avatar">AK</span>
        <span className="own-dropdown__name">Aman Kumar</span>
        <Icon name="chevron-down" size={16} />
      </button>
      {open && (
        <div className="own-dropdown__menu" role="menu">
          {ITEMS.map((item) => item.id === 'divider' ? (
            <hr key="divider" className="own-dropdown__divider" />
          ) : (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              className={`own-dropdown__item${item.danger ? ' is-danger' : ''}`}
              onClick={() => setOpen(false)}
            >
              <Icon name={item.icon} size={16} /> {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function Popover() {
  const [open, setOpen] = useState(false)
  return (
    <span className="own-popover-wrap">
      <button type="button" className="own-drawer__trigger" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Icon name="filter" size={16} /> Filters
      </button>
      {open && (
        <div className="own-popover" role="dialog" aria-label="Filter options">
          <p className="own-popover__title">Price range</p>
          <label className="own-popover__opt"><input type="checkbox" defaultChecked /> Under ₹1,000</label>
          <label className="own-popover__opt"><input type="checkbox" /> ₹1,000 – ₹5,000</label>
          <label className="own-popover__opt"><input type="checkbox" /> Above ₹5,000</label>
          <div className="own-popover__actions">
            <button type="button" className="own-popover__reset" onClick={() => setOpen(false)}>Reset</button>
            <button type="button" className="own-popover__apply" onClick={() => setOpen(false)}>Apply</button>
          </div>
        </div>
      )}
    </span>
  )
}
