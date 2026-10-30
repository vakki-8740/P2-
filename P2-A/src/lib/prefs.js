// Chhoti local settings (browser me save)
const KEY_NAME = 'p2a_admin_name'
const KEY_VIBRATE = 'p2a_vibrate'

export function getAdminName() {
  try { return localStorage.getItem(KEY_NAME) || 'Admin' } catch { return 'Admin' }
}
export function setAdminName(v) {
  try { localStorage.setItem(KEY_NAME, String(v || '').trim() || 'Admin') } catch {}
}

export function getVibrate() {
  try { return localStorage.getItem(KEY_VIBRATE) !== '0' } catch { return true }
}
export function setVibrate(on) {
  try { localStorage.setItem(KEY_VIBRATE, on ? '1' : '0') } catch {}
}
