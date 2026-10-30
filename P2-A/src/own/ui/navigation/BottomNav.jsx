import { useState } from 'react'
import { Icon } from '../icons/Icons.jsx'
import './BottomNav.css'

const ITEMS = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'search', label: 'Search', icon: 'search' },
  { id: 'cart', label: 'Cart', icon: 'cart', badge: 3 },
  { id: 'alerts', label: 'Alerts', icon: 'bell', badge: 2 },
  { id: 'profile', label: 'Profile', icon: 'user' },
]

export default function BottomNav() {
  const [active, setActive] = useState('home')
  return (
    <nav className="own-bottomnav" aria-label="Bottom navigation">
      {ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`own-bottomnav__item${active === item.id ? ' is-active' : ''}`}
          aria-current={active === item.id ? 'page' : undefined}
          onClick={() => setActive(item.id)}
        >
          <span className="own-bottomnav__icon">
            <Icon name={item.icon} size={21} />
            {item.badge && <span className="own-bottomnav__badge">{item.badge}</span>}
          </span>
          <span className="own-bottomnav__label">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
