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

/* ---------------- theme (OWN Library themes) ---------------- */
const KEY_THEME = 'p2a_theme'
export const DEFAULT_PANEL_THEME = 'dark'

export function getTheme() {
  try { return localStorage.getItem(KEY_THEME) || DEFAULT_PANEL_THEME } catch { return DEFAULT_PANEL_THEME }
}

/** <html data-theme="…"> set karta hai — saare own tokens badal jaate hain */
export function applyTheme(id) {
  const theme = id || DEFAULT_PANEL_THEME
  try {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(KEY_THEME, theme)
  } catch {}
  return theme
}
