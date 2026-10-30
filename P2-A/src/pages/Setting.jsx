import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import { Avatar } from '../components/ui.jsx'
import { IconLogout } from '../components/Icons.jsx'
import { useData } from '../App.jsx'
import { getAdminName, getVibrate, setAdminName, setVibrate } from '../lib/prefs.js'
import { getPassword, logout, setPassword } from '../lib/auth.js'
import { firebaseConfig } from '../firebase-config.js'
import { APP_NAME, APP_VERSION } from '../config.js'

export default function Setting() {
  const navigate = useNavigate()
  const { complaints, messages, ready } = useData()

  const [name, setName] = useState(getAdminName())
  const [savedName, setSavedName] = useState(false)
  const [vibrate, setVibrateState] = useState(getVibrate())
  const [pass, setPass] = useState('')
  const [pass2, setPass2] = useState('')
  const [passMsg, setPassMsg] = useState('')

  useEffect(() => { setName(getAdminName()) }, [])

  const saveName = (e) => {
    e.preventDefault()
    setAdminName(name)
    setSavedName(true)
    setTimeout(() => setSavedName(false), 1800)
  }

  const toggleVibrate = () => {
    const next = !vibrate
    setVibrate(next)
    setVibrateState(next)
  }

  const changePass = (e) => {
    e.preventDefault()
    if (pass.length < 4) { setPassMsg('Kam se kam 4 characters'); return }
    if (pass !== pass2) { setPassMsg('Dono password same nahi hain'); return }
    setPassword(pass)
    setPass('')
    setPass2('')
    setPassMsg('Password badal gaya ✔')
    setTimeout(() => setPassMsg(''), 2500)
  }

  const doLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <Layout title="Setting" subtitle="Admin panel ki settings">
      <div className="card user-card">
        <Avatar size={46} />
        <div className="user-card-text">
          <strong>{getAdminName()}</strong>
          <span className="muted">{APP_NAME} · v{APP_VERSION}</span>
        </div>
      </div>

      <section className="card">
        <h2 className="card-title">Profile</h2>
        <form onSubmit={saveName} className="stack">
          <label className="label">Admin name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Admin" />
          <button className="btn primary sm" type="submit">Save</button>
          {savedName ? <span className="ok-text">Save ho gaya ✔</span> : null}
        </form>
      </section>

      <section className="card">
        <h2 className="card-title">Security</h2>
        <form onSubmit={changePass} className="stack">
          <label className="label">Naya password</label>
          <input className="input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Naya password" />
          <label className="label">Dobara likho</label>
          <input className="input" type="password" value={pass2} onChange={(e) => setPass2(e.target.value)} placeholder="Repeat password" />
          <button className="btn primary sm" type="submit">Change password</button>
          {passMsg ? <span className="ok-text">{passMsg}</span> : null}
        </form>
        <p className="muted small">Abhi ka password isi browser me save hai. Default: <code>p2a@2026</code></p>
      </section>

      <section className="card">
        <h2 className="card-title">Notifications</h2>
        <div className="switch-row">
          <span>Nayi complaint pe vibrate</span>
          <button type="button" className={`switch ${vibrate ? 'on' : ''}`} onClick={toggleVibrate} aria-pressed={vibrate}>
            <span className="knob" />
          </button>
        </div>
      </section>

      <section className="card">
        <h2 className="card-title">Data</h2>
        <div className="kv"><span>Firestore</span><strong>{ready ? 'Connected' : 'Not configured'}</strong></div>
        <div className="kv"><span>Project</span><strong>{firebaseConfig.projectId || '-'}</strong></div>
        <div className="kv"><span>Users</span><strong>{new Set(complaints.map((c) => c.clientId)).size}</strong></div>
        <div className="kv"><span>Complaints</span><strong>{complaints.length}</strong></div>
        <div className="kv"><span>Chat messages</span><strong>{messages.length}</strong></div>
      </section>

      <section className="card">
        <h2 className="card-title">About</h2>
        <div className="kv"><span>App</span><strong>{APP_NAME}</strong></div>
        <div className="kv"><span>Version</span><strong>{APP_VERSION}</strong></div>
        <div className="kv"><span>Type</span><strong>Mobile admin</strong></div>
      </section>

      <button type="button" className="btn danger full" onClick={doLogout}>
        <IconLogout width="16" height="16" />
        Logout
      </button>

      <p className="muted small center" style={{ marginTop: 18 }}>
        {APP_NAME} · Parimatch Support admin
      </p>
    </Layout>
  )
}
