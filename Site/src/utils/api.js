// api.js — central data client. Talks to a Google Apps Script web app
// (VITE_API_URL) that stores everything in Google Drive. No server, no DB.
// Configure with VITE_API_URL. When it is empty the app runs in
// localStorage-only mode (offline) and every store falls back gracefully.

const RAW_BASE = import.meta.env.VITE_API_URL || ''
export const API_BASE = RAW_BASE.replace(/\/+$/, '')
export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024 // 100 MB client ceiling
export const MAX_DRIVE_UPLOAD_BYTES = 15 * 1024 * 1024 // Apps Script POST limit (base64 ~+33%)
// NOTE: Drive mode me file base64 hoke Apps Script ko jaati hai — bade files slow.

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

const ADMIN_TOKEN_KEY = 'parimatch_admin_token'

/** Optional admin token (Drive mode me ?scope=all ke liye). */
export function getAdminToken() {
  try {
    return import.meta.env.VITE_ADMIN_TOKEN || localStorage.getItem(ADMIN_TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

/**
 * All traffic goes to ONE Google Apps Script /exec URL.
 *
 * Apps Script CORS preflight (OPTIONS) ka jawab nahi de sakta, isliye:
 *  - GET  : sab kuch query params me (client_id bhi)
 *  - POST : Content-Type text/plain (simple request = koi preflight nahi) aur
 *           asli method + payload body ke andar JSON me
 */
async function request(path, options = {}, timeoutMs = 25000) {
  if (!API_BASE) throw new Error('no-api')

  const method = (options.method || 'GET').toUpperCase()
  const clientId = getClientId()

  let target
  let init

  if (method === 'GET') {
    const sep = path.indexOf('?') >= 0 ? '&' : '?'
    target = `${API_BASE}${path}${sep}client_id=${encodeURIComponent(clientId)}`
    init = { method: 'GET' }
  } else {
    target = API_BASE
    init = {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        path,
        method,
        clientId,
        adminToken: getAdminToken(),
        body: options.json === undefined ? {} : options.json,
      }),
    }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  let res
  try {
    res = await fetch(target, { ...init, signal: controller.signal })
  } catch (err) {
    clearTimeout(timer)
    if (err && err.name === 'AbortError') throw new Error('Server took too long to respond')
    throw new Error('Cannot reach the server')
  }
  clearTimeout(timer)

  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }

  if (!res.ok) {
    throw new Error((data && data.error) || `Request failed (HTTP ${res.status})`)
  }
  // Apps Script hamesha HTTP 200 deta hai — error JSON ke andar aata hai.
  if (data && data.ok === false) {
    throw new Error(data.error || 'Request failed')
  }

  return data === null ? text : data
}

export async function apiGet(path) {
  return request(path, { method: 'GET' })
}

export async function apiPost(path, body) {
  return request(path, { method: 'POST', json: body })
}

export async function apiPut(path, body) {
  return request(path, { method: 'PUT', json: body })
}

export async function apiDelete(path) {
  return request(path, { method: 'DELETE' })
}

/* Photos seedha 5-10 MB ke hote hain; base64 me +33% aur hota hai.
   Upload se pehle browser me hi resize/compress kar dete hain — phone se
   bhejne me ye sabse bada speed-up hai. */
const IMAGE_MAX_DIM = 1600
const IMAGE_QUALITY = 0.82
const IMAGE_COMPRESS_ABOVE = 350 * 1024 // 350 KB se chhoti images waise hi bhej do

async function compressImage(file) {
  try {
    if (!file || !/^image\//i.test(file.type || '')) return file
    if (/(gif|heic|heif|svg)/i.test(file.type || '')) return file // canvas inhe theek se nahi kholta
    if (file.size <= IMAGE_COMPRESS_ABOVE) return file
    if (typeof document === 'undefined' || typeof createImageBitmap !== 'function') return file

    const bitmap = await createImageBitmap(file)
    const w = bitmap.width || 1
    const h = bitmap.height || 1
    const scale = Math.min(1, IMAGE_MAX_DIM / Math.max(w, h))

    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(w * scale))
    canvas.height = Math.max(1, Math.round(h * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', IMAGE_QUALITY))
    if (!blob || blob.size >= file.size) return file

    const name = String(file.name || 'image').replace(/\.[^.]+$/, '') + '.jpg'
    return new File([blob], name, { type: 'image/jpeg' })
  } catch {
    return file
  }
}

/**
 * Upload one File to the backend and get back
 * { id, name, type, size, url } — files never travel inside the JSON body.
 */
export async function uploadFile(original) {
  if (!original) throw new Error('No file selected')

  const file = await compressImage(original)

  if (file.size > MAX_DRIVE_UPLOAD_BYTES) {
    throw new Error(
      `File too large for Drive: ${file.name} (max ${Math.round(MAX_DRIVE_UPLOAD_BYTES / 1024 / 1024)} MB)`
    )
  }
  if (!hasApi()) throw new Error('no-api')

  // Apps Script multipart/FormData nahi leta — file base64 me jaati hai.
  const dataUrl = await fileToDataUrl(file)
  const comma = String(dataUrl).indexOf(',')
  const base64 = comma >= 0 ? String(dataUrl).slice(comma + 1) : ''

  const res = await request(
    '/api/uploads',
    {
      method: 'POST',
      json: { name: file.name, type: file.type || 'application/octet-stream', data: base64 },
    },
    180000
  )
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

let warmedUp = false

/**
 * Apps Script ko pehle hi "jaga" do (cold start 2-8s le sakta hai).
 * App load pe ek chhoti health call bhejne se pehli complaint fast ho jaati hai.
 */
export function warmUp() {
  if (warmedUp || !API_BASE) return Promise.resolve()
  warmedUp = true
  return request('/api/health', { method: 'GET' }, 15000).catch(() => {})
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
