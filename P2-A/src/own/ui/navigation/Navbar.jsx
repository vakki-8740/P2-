import { useState } from 'react'
import { Icon } from '../icons/Icons.jsx'
import './Navbar.css'

const LINKS = ['Home', 'Products', 'Pricing', 'Docs', 'Contact']

export default function Navbar({ brand = 'OWN App' }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('Home')

  return (
    <header className="own-navbar">
      <div className="own-navbar__inner">
        <a className="own-navbar__brand" href="#top" onClick={(e) => e.preventDefault()}>
          <span className="own-navbar__mark"><Icon name="grid" size={16} /></span>
          {brand}
        </a>
        <nav className="own-navbar__links" aria-label="Primary">
          {LINKS.map((l) => (
            <a
              key={l}
              href="#top"
              className={active === l ? 'is-active' : ''}
              onClick={(e) => { e.preventDefault(); setActive(l) }}
            >
              {l}
            </a>
          ))}
        </nav>
        <div className="own-navbar__actions">
          <button type="button" className="own-navbar__login">Sign in</button>
          <button type="button" className="own-navbar__cta">Get started</button>
        </div>
        <button
          type="button"
          className={`own-navbar__burger${open ? ' is-open' : ''}`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span /><span /><span />
        </button>
      </div>
      {open && (
        <nav className="own-navbar__mobile" aria-label="Mobile">
          {LINKS.map((l) => (
            <a
              key={l}
              href="#top"
              className={active === l ? 'is-active' : ''}
              onClick={(e) => { e.preventDefault(); setActive(l); setOpen(false) }}
            >
              {l}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
