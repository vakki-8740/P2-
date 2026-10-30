import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { isLoggedIn, login } from '../lib/auth.js'
import { APP_NAME } from '../config.js'

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
    <div className="app login-screen">
      <div className="login-card">
        <div className="login-logo">
          <span className="brand-dot" />
          {APP_NAME}
        </div>
        <h2>Admin login</h2>
        <p className="muted">Password daalo aur andar aao.</p>

        <form onSubmit={submit}>
          <input
            className="input"
            type="password"
            inputMode="text"
            placeholder="Password"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError('') }}
            autoFocus
          />
          {error ? <p className="error">{error}</p> : null}
          <button className="btn primary full" type="submit" disabled={!value}>Login</button>
        </form>

        <p className="login-hint">
          Pehli baar? default password <code>p2a@2026</code> — Setting page se badal sakte ho.
        </p>
      </div>
    </div>
  )
}
