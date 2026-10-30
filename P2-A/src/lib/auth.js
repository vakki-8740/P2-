/**
 * Simple admin login — browser me hi check hota hai.
 *
 * Password: Setting page se badal sakte ho, ya src/config.js me
 * DEFAULT_PASSWORD badlo (naya deploy karna hoga).
 *
 * ⚠️ Ye "casual" protection hai (koi backend/login server nahi hai).
 *    Firebase rules ke hisaab se data technically public hai.
 */
import { DEFAULT_PASSWORD } from '../config.js'

const PASS_KEY = 'p2a_password'
const SESSION_KEY = 'p2a_session'

export function getPassword() {
  try {
    return localStorage.getItem(PASS_KEY) || DEFAULT_PASSWORD
  } catch {
    return DEFAULT_PASSWORD
  }
}

export function setPassword(next) {
  const value = String(next || '').trim()
  if (value.length < 4) throw new Error('Password kam se kam 4 characters ka ho')
  try { localStorage.setItem(PASS_KEY, value) } catch {}
  return value
}

export function login(input) {
  if (String(input || '') !== getPassword()) return false
  try { sessionStorage.setItem(SESSION_KEY, '1') } catch {}
  return true
}

export function isLoggedIn() {
  try { return sessionStorage.getItem(SESSION_KEY) === '1' } catch { return false }
}

export function logout() {
  try { sessionStorage.removeItem(SESSION_KEY) } catch {}
}
