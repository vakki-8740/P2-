import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Header({ showMenu = false }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  if (!showMenu) {
    return (
      <header className="page-header">
        <div className="header-inner">
          <img className="logo-icon" src="/logo/logo.png" alt="Parimatch Support logo" />
          <div className="logo-text">Parimatch Support</div>
        </div>
      </header>
    )
  }

  return (
    <>
      <header className="page-header">
        <div className="header-inner">
          <img className="logo-icon" src="/logo/logo.png" alt="Parimatch Support logo" />
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
          <img src="/logo/logo.png" alt="" />
          <span>Parimatch Support</span>
          <button className="side-close" type="button" aria-label="Close menu" onClick={() => setOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <Link className={`side-link ${isActive('/') ? 'active' : ''}`} to="/" onClick={() => setOpen(false)}>Home</Link>
        <Link className={`side-link ${isActive('/all-complains') ? 'active' : ''}`} to="/all-complains" onClick={() => setOpen(false)}>All Complains</Link>
        <Link className={`side-link ${isActive('/terms') ? 'active' : ''}`} to="/terms" onClick={() => setOpen(false)}>Terms &amp; Conditions</Link>
        <Link className={`side-link ${isActive('/about') ? 'active' : ''}`} to="/about" onClick={() => setOpen(false)}>About Us</Link>
      </nav>
    </>
  )
}
