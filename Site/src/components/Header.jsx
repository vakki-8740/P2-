import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { withBase } from '../utils/base'

const LOGO = withBase('/logo/logo.png')

const MENU = [
  { label: 'Home', path: '/' },
  { label: 'All Complains', path: '/all-complains' },
  { label: 'Terms & Conditions', path: '/terms' },
  { label: 'About Us', path: '/about' },
]

export default function Header({ showMenu = false }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const isActive = (path) => location.pathname === withBase(path)

  if (!showMenu) {
    return (
      <header className="page-header">
        <div className="header-inner">
          <img className="logo-icon" src={LOGO} alt="Parimatch Support logo" />
          <div className="logo-text">Parimatch Support</div>
        </div>
      </header>
    )
  }

  return (
    <>
      <header className="page-header">
        <div className="header-inner">
          <img className="logo-icon" src={LOGO} alt="Parimatch Support logo" />
          <div className="logo-text">Parimatch Support</div>
          <button
            className="menu-btn"
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </header>

      <div className={`menu-overlay ${open ? 'open' : ''}`} onClick={() => setOpen(false)} />
      <nav className={`side-menu ${open ? 'open' : ''}`} aria-label="Menu">
        <div className="side-menu-head">
          <img src={LOGO} alt="" />
          <span>Parimatch Support</span>
          <button className="side-close" type="button" aria-label="Close menu" onClick={() => setOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {MENU.map((item) => (
          <Link
            key={item.path}
            className={`side-link ${isActive(item.path) ? 'active' : ''}`}
            to={withBase(item.path)}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  )
}
