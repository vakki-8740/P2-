// api.js — central data client. Talks to a Google Apps Script web app
// (VITE_API_URL) that stores everything in Google Drive. No server, no DB.
// Configure with VITE_API_URL. When it is empty the app runs in
// localStorage-only mode (offline) and every store falls back gracefully.

const RAW_BASE = import.meta.env.VITE_API_URL || ''
export const API_BASE = RAW_BASE.replace(/\/+$/, '')
export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024 // 100 MB client ceiling
// NOTE: Apps Script/Drive quotas are lower — keep attachments small in Drive mode.

const CLIENT_KEY = 'parimatch_client_id'

/** Stable per-browser id — the backend scopes complaints/chat to it. */
export function getClientId() {
  try {
    let id = localStorage.getItem(CLIENT_KEY)
    if (!id || !/^[A-Za-z0-9._-]{8,64}$/.test(id)) {
      id = newClientId()
      localStorage.setItem(CLIENT_KEY, id)
    }
    return id
  } catch {
    return newClientId()
  }
}

function newClientId() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  } catch {}
  return `c_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`
}

export function hasApi() {
  return !!API_BASE
}

/** Absolute URL for a backend-relative path (upload links, file previews). */
export function resolveApiUrl(path) {
  if (!path) return ''
  if (/^(https?:|data:|blob:)/i.test(path)) return path
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`
}

async function errorMessage(res) {
  try {
    const data = await res.json()
    if (data && data.error) return data.error
  } catch {}
  return `Request failed (HTTP ${res.status})`
}

async function request(path, options = {}, timeoutMs = 25000) {
  if (!API_BASE) throw new Error('no-api')

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  let res
  try {
    res = await fetch(API_BASE + path, {
      ...options,
      signal: controller.signal,
      headers: {
        'X-Client-Id': getClientId(),
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(options.headers || {}),
      },
    })
  } catch (err) {
    clearTimeout(timer)
    if (err && err.name === 'AbortError') throw new Error('Server took too long to respond')
    throw new Error('Cannot reach the server')
  }
  clearTimeout(timer)

  if (!res.ok) throw new Error(await errorMessage(res))

  const type = res.headers.get('content-type') || ''
  if (type.includes('application/json')) return res.json()
  return res.text()
}

export async function apiGet(path) {
  return request(path, { method: 'GET' })
}

export async function apiPost(path, body) {
  return request(path, { method: 'POST', body: JSON.stringify(body) })
}

export async function apiPut(path, body) {
  return request(path, { method: 'PUT', body: JSON.stringify(body) })
}

export async function apiDelete(path) {
  return request(path, { method: 'DELETE' })
}

/**
 * Upload one File to the backend and get back
 * { id, name, type, size, url } — files never travel inside the JSON body.
 */
export async function uploadFile(file) {
  if (!file) throw new Error('No file selected')
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`File too large: ${file.name} (max ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB)`)
  }
  if (!hasApi()) throw new Error('no-api')

  const form = new FormData()
  form.append('file', file, file.name)

  const res = await request('/api/uploads', { method: 'POST', body: form }, 180000)
  if (!res || !res.data) throw new Error('Upload failed')
  return res.data
}

/** Read a File as a data URL (local/offline fallback only). */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error(`Failed to read ${file && file.name}`))
    reader.readAsDataURL(file)
  })
}

export async function healthCheck() {
  try {
    if (!API_BASE) return { ok: false, reason: 'no-api-config' }
    const data = await request('/api/health', { method: 'GET' }, 8000)
    return { ok: true, data }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}
