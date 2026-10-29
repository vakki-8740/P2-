const CRED_KEY = 'admin_credentials'
const SESSION_KEY = 'admin_session'
const DEFAULT_CRED = { username: 'admin', password: 'Admin@123' }

export function getCredentials() {
  try {
    const raw = localStorage.getItem(CRED_KEY)
    if (!raw) {
      localStorage.setItem(CRED_KEY, JSON.stringify(DEFAULT_CRED))
      return DEFAULT_CRED
    }
    return JSON.parse(raw)
  } catch { return DEFAULT_CRED }
}

export function setCredentials(newCred) {
  localStorage.setItem(CRED_KEY, JSON.stringify(newCred))
  try { window.dispatchEvent(new Event('admin-cred-updated')) } catch {}
}

export function login(username, password) {
  const cred = getCredentials()
  if (username === cred.username && password === cred.password) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ loggedIn: true, at: new Date().toISOString(), username }))
    return { ok: true }
  }
  return { ok: false, error: 'Invalid username or password' }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}

export function isAuthenticated() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return false
    const s = JSON.parse(raw)
    return !!s.loggedIn
  } catch { return false }
}

export function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') } catch { return null }
}
