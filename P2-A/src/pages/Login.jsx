import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Input from '../own/ui/input/Input.jsx'
import Button from '../own/ui/button/Button.jsx'
import { Alert } from '../own/ui/feedback/Alert.jsx'
import { isLoggedIn, login } from '../lib/auth.js'
import { APP_NAME, DEFAULT_PASSWORD } from '../config.js'

export default function Login() {
  const navigate = useNavigate()
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  if (isLoggedIn()) return <Navigate to="/" replace />

  const submit = (e) => {
    e.preventDefault()
    if (login(value)) {
      navigate('/', { replace: true })
    } else {
      setError('Password galat hai')
      setValue('')
    }
  }

  return (
    <div className="pa-app pa-app--no-nav">
      <div className="pa-login">
        <div className="pa-center pa-stack" style={{ alignItems: 'center', gap: 10 }}>
          <span className="pa-brand" style={{ fontSize: 24 }}>
            <span className="pa-brand__dot" />
            {APP_NAME}
          </span>
          <p className="pa-muted">Support admin panel · mobile only</p>
        </div>

        <form className="own-card pa-card" onSubmit={submit}>
          <h2 className="pa-section__title">Admin login</h2>
          <Input
            id="login-pass"
            label="Password"
            type="password"
            allowPasswordToggle
            icon="lock"
            placeholder="Password"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError('') }}
            autoFocus
            autoComplete="current-password"
            error={error}
          />
          <Button type="submit" fullWidth icon="arrow-right" disabled={!value} loading={false}>Login</Button>

          <p className="pa-muted">
            Pehli baar? default password <code>{DEFAULT_PASSWORD}</code> — Setting page se badal sakte ho.
          </p>

          {error ? <Alert tone="danger" title="Login fail">{error}</Alert> : null}
        </form>
      </div>
    </div>
  )
}
