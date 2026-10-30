import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import { initialsOf } from '../components/status.js'
import { Avatar } from '../own/ui/data/Avatar.jsx'
import KeyValue from '../own/ui/data/KeyValue.jsx'
import Input from '../own/ui/input/Input.jsx'
import { Checkbox } from '../own/ui/input/Checkbox.jsx'
import Button from '../own/ui/button/Button.jsx'
import { Alert, Chip } from '../own/ui/feedback/Alert.jsx'
import { THEMES } from '../own/themes.js'
import { useData } from '../App.jsx'
import { applyTheme, getAdminName, getTheme, getVibrate, setAdminName, setVibrate } from '../lib/prefs.js'
import { getPassword, logout, setPassword } from '../lib/auth.js'
import { firebaseConfig } from '../firebase-config.js'
import { APP_NAME, APP_VERSION, DEFAULT_PASSWORD } from '../config.js'

export default function Setting() {
  const navigate = useNavigate()
  const { complaints, messages, ready } = useData()

  const [name, setName] = useState(getAdminName())
  const [savedName, setSavedName] = useState(false)
  const [vibrate, setVibrateState] = useState(getVibrate())
  const [theme, setThemeState] = useState(getTheme())
  const [pass, setPass] = useState('')
  const [pass2, setPass2] = useState('')
  const [passMsg, setPassMsg] = useState({ tone: 'success', text: '' })

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

  const pickTheme = (id) => {
    applyTheme(id)
    setThemeState(id)
  }

  const changePass = (e) => {
    e.preventDefault()
    if (pass.length < 4) return setPassMsg({ tone: 'danger', text: 'Kam se kam 4 characters ka password daalo.' })
    if (pass !== pass2) return setPassMsg({ tone: 'danger', text: 'Dono password same nahi hain.' })
    setPassword(pass)
    setPass('')
    setPass2('')
    setPassMsg({ tone: 'success', text: 'Password badal gaya ✔' })
    setTimeout(() => setPassMsg({ tone: 'success', text: '' }), 2500)
  }

  const doLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const isDefaultPass = getPassword() === DEFAULT_PASSWORD

  return (
    <AppShell title="Setting" subtitle="Admin panel ki settings">
      <section className="own-card pa-card">
        <div className="pa-row">
          <Avatar initials={initialsOf(getAdminName(), 'AD')} size="lg" tone="accent" status="online" />
          <div className="own-list__meta">
            <strong>{getAdminName()}</strong>
            <span>{APP_NAME} · v{APP_VERSION}</span>
            <span className="pa-muted">Mobile admin panel</span>
          </div>
        </div>
      </section>

      {/* 1. profile */}
      <section className="own-card pa-card">
        <h2 className="pa-section__title">Profile</h2>
        <form className="pa-stack" onSubmit={saveName}>
          <Input id="admin-name" label="Admin name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Admin" />
          <div className="pa-row">
            <Button size="sm" type="submit" icon="check">Save</Button>
            {savedName ? <span className="pa-muted">Save ho gaya ✔</span> : null}
          </div>
        </form>
      </section>

      {/* 2. security */}
      <section className="own-card pa-card">
        <h2 className="pa-section__title">Security</h2>
        <form className="pa-stack" onSubmit={changePass}>
          <Input
            id="new-pass"
            label="Naya password"
            type="password"
            allowPasswordToggle
            icon="lock"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Naya password"
            autoComplete="new-password"
          />
          <Input
            id="repeat-pass"
            label="Dobara likho"
            type="password"
            allowPasswordToggle
            icon="lock"
            value={pass2}
            onChange={(e) => setPass2(e.target.value)}
            placeholder="Repeat password"
            autoComplete="new-password"
          />
          <Button size="sm" type="submit" icon="shield">Change password</Button>
          {passMsg.text ? <Alert tone={passMsg.tone} dismissible={false}>{passMsg.text}</Alert> : null}
        </form>
        <p className="pa-muted">
          {isDefaultPass ? `Abhi default password chal raha hai: ${DEFAULT_PASSWORD}` : 'Custom password set hai.'}
        </p>
      </section>

      {/* 3. theme */}
      <section className="own-card pa-card">
        <h2 className="pa-section__title">Theme (OWN Library)</h2>
        <div className="pa-theme-grid">
          {THEMES.map((t) => (
            <Chip key={t.id} label={t.label} icon="sun" selected={theme === t.id} onClick={() => pickTheme(t.id)} />
          ))}
        </div>
      </section>

      {/* 4. notifications */}
      <section className="own-card pa-card">
        <h2 className="pa-section__title">Notifications</h2>
        <Checkbox label="Nayi complaint pe vibrate" checked={vibrate} onChange={toggleVibrate} />
      </section>

      {/* 5. data */}
      <section className="own-card pa-card">
        <h2 className="pa-section__title">Data</h2>
        <KeyValue
          rows={[
            { k: 'Firestore', v: ready ? 'Connected' : 'Not configured' },
            { k: 'Project', v: firebaseConfig.projectId || '-' },
            { k: 'Users', v: String(new Set(complaints.map((c) => c.clientId)).size) },
            { k: 'Complaints', v: String(complaints.length) },
            { k: 'Chat messages', v: String(messages.length) },
          ]}
        />
      </section>

      {/* 6. about */}
      <section className="own-card pa-card">
        <h2 className="pa-section__title">About</h2>
        <KeyValue
          rows={[
            { k: 'App', v: APP_NAME },
            { k: 'Version', v: APP_VERSION },
            { k: 'Type', v: 'Mobile admin' },
            { k: 'UI', v: 'OWN Library' },
          ]}
        />
      </section>

      <Button variant="danger" fullWidth icon="logout" onClick={doLogout}>Logout</Button>

      <p className="pa-muted pa-center">{APP_NAME} · Parimatch Support admin</p>
    </AppShell>
  )
}
