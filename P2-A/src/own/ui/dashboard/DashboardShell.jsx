import { Icon } from '../icons/Icons.jsx'
import { StatCardGrid } from '../data/StatCard.jsx'
import './DashboardShell.css'

const NAV = [
  { id: 'dash', label: 'Dashboard', icon: 'grid', active: true },
  { id: 'analytics', label: 'Analytics', icon: 'pie' },
  { id: 'wallet', label: 'Wallet', icon: 'credit-card' },
  { id: 'files', label: 'Files', icon: 'folder' },
  { id: 'messages', label: 'Messages', icon: 'message', badge: 4 },
  { id: 'settings', label: 'Settings', icon: 'settings' },
]

export default function DashboardShell() {
  return (
    <div className="own-shell">
      <aside className="own-shell__sidebar" aria-label="Dashboard navigation">
        <div className="own-shell__brand">
          <span className="own-shell__mark"><Icon name="grid" size={15} /></span> Nova
        </div>
        <nav className="own-shell__nav">
          {NAV.map((n) => (
            <a key={n.id} href="#shell" className={n.active ? 'is-active' : ''} onClick={(e) => e.preventDefault()}>
              <Icon name={n.icon} size={17} />
              <span>{n.label}</span>
              {n.badge && <em className="own-shell__badge">{n.badge}</em>}
            </a>
          ))}
        </nav>
      </aside>
      <main className="own-shell__main">
        <div className="own-shell__topbar">
          <h2>Good morning, Aman</h2>
          <div className="own-shell__topactions">
            <span className="own-shell__search"><Icon name="search" size={15} /> Search…</span>
            <span className="own-shell__avatar">AK</span>
          </div>
        </div>
        <StatCardGrid />
        <div className="own-shell__panels">
          <div className="own-shell__panel">
            <h3>Weekly performance</h3>
            <div className="own-shell__bars">
              {[42, 68, 55, 84, 61, 38, 73].map((h, i) => (
                <span key={i} style={{ height: `${h}%` }} title={`${h}%`} />
              ))}
            </div>
          </div>
          <div className="own-shell__panel">
            <h3>Goals</h3>
            <p className="own-shell__goal"><span>Revenue target</span><b>78%</b></p>
            <div className="own-shell__track"><span style={{ width: '78%' }} /></div>
            <p className="own-shell__goal"><span>New customers</span><b>54%</b></p>
            <div className="own-shell__track"><span style={{ width: '54%' }} /></div>
            <p className="own-shell__goal"><span>Retention</span><b>91%</b></p>
            <div className="own-shell__track own-shell__track--yes"><span style={{ width: '91%' }} /></div>
          </div>
        </div>
      </main>
    </div>
  )
}
