import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Icon } from '../own/ui/icons/Icons.jsx'
import IconButton from '../own/ui/button/IconButton.jsx'
import { Badge } from '../own/ui/feedback/Alert.jsx'

const TABS = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/all', label: 'Complains', icon: 'grid' },
  { to: '/chat', label: 'Chat', icon: 'message' },
  { to: '/activity', label: 'Activity', icon: 'clock' },
  { to: '/setting', label: 'Setting', icon: 'settings' },
]

const isActive = (pathname, to) => (to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(to + '/'))

/** Mobile shell — topbar + bottom nav (OWN Library BottomNav classes) */
export default function AppShell({ title, subtitle, back = false, right = null, children, nav = true }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <div className={`pa-app ${nav ? '' : 'pa-app--no-nav'}`}>
      <header className="pa-topbar">
        {back ? (
          <IconButton icon="chevron-left" label="Back" onClick={() => navigate(-1)} />
        ) : (
          <span className="pa-brand"><span className="pa-brand__dot" />P2-A</span>
        )}

        <div className="pa-topbar__text">
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>

        {right || (back ? null : <Badge tone="success" dot>Live</Badge>)}
      </header>

      <main className="pa-screen">{children}</main>

      {nav ? (
        <nav className="own-bottomnav pa-bottomnav" aria-label="Main">
          {TABS.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={`own-bottomnav__item ${isActive(pathname, to) ? 'is-active' : ''}`}
              aria-current={isActive(pathname, to) ? 'page' : undefined}
            >
              <span className="own-bottomnav__icon"><Icon name={icon} size={21} /></span>
              <span className="own-bottomnav__label">{label}</span>
            </Link>
          ))}
        </nav>
      ) : null}
    </div>
  )
}
