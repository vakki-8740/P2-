import { useEffect, useState } from 'react'
import { Icon } from '../icons/Icons.jsx'
import './Drawer.css'

const NAV = ['Dashboard', 'Projects', 'Team', 'Reports', 'Settings']

export default function Drawer({ side = 'left' }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button type="button" className="own-drawer__trigger" onClick={() => setOpen(true)}>
        <Icon name="menu" size={17} /> Open {side} drawer
      </button>
      {open && (
        <div className="own-drawer-scrim" onClick={() => setOpen(false)}>
          <aside
            className={`own-drawer own-drawer--${side}`}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="own-drawer__head">
              <strong>Workspace</strong>
              <button type="button" aria-label="Close drawer" className="own-drawer__close" onClick={() => setOpen(false)}>
                <Icon name="x" size={17} />
              </button>
            </div>
            <nav className="own-drawer__nav">
              {NAV.map((n, i) => (
                <a key={n} href="#drawer" className={i === 0 ? 'is-active' : ''} onClick={(e) => { e.preventDefault(); setOpen(false) }}>
                  <Icon name={['grid', 'folder', 'user', 'pie', 'settings'][i]} size={17} /> {n}
                </a>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  )
}
