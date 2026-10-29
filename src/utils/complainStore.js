import { hasApi, apiGet, apiPost, apiDelete } from './api.js'

const KEY = 'parimatch_complains'

// --- Local helpers (fallback / offline) ---
function getLocal() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch { return [] }
}
function saveLocal(entry) {
  const list = getLocal()
  list.unshift(entry)
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch (e) {
    if (e && e.name === 'QuotaExceededError') {
      const trimmed = list.slice(0, 20)
      try { localStorage.setItem(KEY, JSON.stringify(trimmed)) } catch {}
    } else throw e
  }
  try { window.dispatchEvent(new Event('complains-updated')) } catch {}
  return list
}

export function getComplains() {
  // sync — local only (for instant render)
  return getLocal()
}

// async — tries backend first, falls back to local
export async function getComplainsAsync() {
  if (hasApi()) {
    try {
      const res = await apiGet('/api/complains?limit=200')
      if (res && res.data) return res.data
    } catch {}
  }
  return getLocal()
}

export async function saveComplain(entry) {
  // try backend (best-effort, non-blocking failure)
  if (hasApi()) {
    try {
      // map to backend expected shape (snake_case + flat)
      await apiPost('/api/complains', entry)
    } catch (e) {
      console.warn('Backend save failed, using localStorage:', e.message)
    }
  }
  // always save locally for offline + instant UI
  return saveLocal(entry)
}

export async function clearComplains() {
  if (hasApi()) {
    try { await apiDelete('/api/complains') } catch {}
  }
  try { localStorage.removeItem(KEY) } catch {}
  try { window.dispatchEvent(new Event('complains-updated')) } catch {}
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export function fileToBase64(file) {
  const MAX_SIZE = 100 * 1024 * 1024
  if (file && file.size > MAX_SIZE) {
    return Promise.reject(new Error('File too large (max 100MB): ' + file.name))
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Failed to read file: ' + (file && file.name)))
    reader.readAsDataURL(file)
  })
}

export function formatDate(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  } catch { return iso }
}
