import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { logout } from '../utils/adminAuth.js'

const nav = [
  { to:'/', label:'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10' },
  { to:'/users', label:'Users', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75' },
  { to:'/chat', label:'Chat Manage', icon: 'M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z' },
  { to:'/activity', label:'Activity', icon: 'M18 20V10 M12 20V4 M6 20v-6' },
  { to:'/settings', label:'Settings', icon: 'M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.38a2 2 0 00-.73-2.73l-.15-.09a2 2 0 01-1-1.74v-.5a2 2 0 011-1.72l.15-.1a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z M12 15a3 3 0 100-6 3 3 0 000 6z' },
]

export default function AdminLayout({ children }){
  const [open, setOpen] = useState(false)
  const navg = useNavigate()
  const onLogout = () => { logout(); navg('/login') }

  const toggleTheme = () => {
    const cur = document.documentElement.getAttribute('data-theme') || 'dark'
    const nxt = cur === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', nxt)
    localStorage.setItem('admin_theme', nxt)
  }

  return (
    <div className="admin-shell">
      <div className={`admin-overlay ${open?'open':''}`} onClick={()=> setOpen(false)} />
      <aside className={`admin-sidebar ${open?'open':''}`}>
        <div className="sidebar-brand">
          <img src="/logo/logo.png" alt="logo" />
          <div>
            <h1>Parimatch Admin</h1>
            <span>Support Panel</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {nav.map(n=>(
            <NavLink key={n.to} to={n.to} className={({isActive})=> `nav-item ${isActive?'active':''}`} onClick={()=> setOpen(false)}>
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={n.icon} /></svg>
              </span>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="theme-row">
            <span>Light Mode</span>
            <button className="theme-toggle-admin" onClick={toggleTheme} aria-label="Toggle theme"><span className="knob" /></button>
          </div>
          <button className="btn-admin ghost small" onClick={onLogout}>Logout</button>
          <div style={{fontSize:'.68rem', color:'var(--admin-muted)', textAlign:'center'}}>© 2026 Parimatch Support</div>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-header">
          <button className="menu-btn-admin" onClick={()=> setOpen(!open)}>☰</button>
          <div style={{flex:1, fontWeight:800, fontSize:'.95rem'}}>Admin Panel</div>
          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <span style={{fontSize:'.78rem', color:'var(--admin-muted)', fontWeight:700, background:'var(--admin-card-2)', border:'1px solid var(--admin-border)', padding:'6px 10px', borderRadius:999, display:'none'}} className="hide-mobile">v1.0</span>
            <button className="btn-admin ghost small" onClick={onLogout}>Logout</button>
          </div>
        </header>
        <div className="admin-content">
          {children}
        </div>
      </div>
    </div>
  )
}
