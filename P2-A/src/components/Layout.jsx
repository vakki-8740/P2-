import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  IconActivity, IconBack, IconChat, IconHome, IconList, IconSetting,
} from './Icons.jsx'

const TABS = [
  { to: '/', label: 'Home', Icon: IconHome },
  { to: '/all', label: 'Complains', Icon: IconList },
  { to: '/chat', label: 'Chat', Icon: IconChat },
  { to: '/activity', label: 'Activity', Icon: IconActivity },
  { to: '/setting', label: 'Setting', Icon: IconSetting },
]

function isActive(pathname, to) {
  if (to === '/') return pathname === '/'
  return pathname === to || pathname.startsWith(to + '/')
}

export default function Layout({ title, subtitle, back = false, right = null, children, nav = true }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <div className={`app ${nav ? "" : "no-nav"}`}>
      <header className="topbar">
        {back ? (
          <button type="button" className="icon-btn" onClick={() => navigate(-1)} aria-label="Back">
            <IconBack width="18" height="18" />
          </button>
        ) : (
          <span className="brand">
            <span className="brand-dot" />
            P2-A
          </span>
        )}

        <div className="topbar-text">
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>

        {right || (back ? null : <span className="live-dot" title="Live" />)}
      </header>

      <main className="screen">{children}</main>

      {nav ? (
        <nav className="tabbar">
          {TABS.map(({ to, label, Icon }) => (
            <Link key={to} to={to} className={`tab ${isActive(pathname, to) ? 'active' : ''}`}>
              <Icon width="21" height="21" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      ) : null}
    </div>
  )
}
