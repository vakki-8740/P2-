/**
 * api.js — data layer, now backed by **Firebase Realtime Database**.
 *
 * Isi file ne pehle PHP/Wasmer backend (phir Apps Script/Drive) se baat ki thi.
 * Ab yahi functions Firebase ke saath kaam karte hain, isliye stores/pages me
 * bada change nahi karna pada.
 *
 * Real-time: `subscribeComplains()` / `subscribeMessages()` — data badalte hi
 * browser ko turant naya data mil jata hai (koi polling/refresh nahi).
 *
 * Data shape (Realtime DB me):
 *   parimatch/complains/{clientId}/{id} → { id, type, title, status,
 *                                           createdAt, updatedAt, details,
 *                                           hasPassword, files }
 *   parimatch/chat/{clientId}/{id}       → { id, sender, text, createdAt,
 *                                           edited, file }
 *
 * Config `Site/src/firebase-config.js` me — khaali ho to app localStorage
 * mode me chalta hai (kuch tootta nahi).
 */
import { get, ref, remove, set, update, onValue } from 'firebase/database'
import { getDb, isFirebaseReady } from './firebase.js'

const ROOT = 'parimatch'
const CLIENT_KEY = 'parimatch_client_id'

// Aap kitni badi file chun sakte ho (uske baad browser me compress hoti hai)
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024
// Compress ke baad Firebase me jane wali limit (base64 data URL)
export const MAX_STORED_FILE_BYTES = 400 * 1024

/* ------------------------------------------------------------------ */
/* Client id + basic helpers                                          */
/* ------------------------------------------------------------------ */

export function hasApi() {
  return isFirebaseReady()
}

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

/** Absolute URL for a stored path; data:, http:, blob: pass through unchanged. */
export function resolveApiUrl(path) {
  if (!path) return ''
  return path // Firebase me URLs (ya base64 data:) already absolute hote hain
}

function db() {
  const d = getDb()
  if (!d) throw new Error('Firebase configure nahi hai (Site/src/firebase-config.js)')
  return d
}

function clean(value) {
  return JSON.parse(JSON.stringify(value === undefined ? null : value))
}

/** RTDB object → sorted array. */
function toList(val, order = 'desc') {
  if (!val || typeof val !== 'object') return []
  const rows = Object.keys(val).map((key) => {
    const row = val[key] && typeof val[key] === 'object' ? val[key] : {}
    return { ...row, id: row.id || key }
  })
  rows.sort((a, b) => {
    const av = String(a.createdAt || '')
    const bv = String(b.createdAt || '')
    return order === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
  })
  return rows
}

const complaintsRef = (clientId) => ref(db(), `${ROOT}/complaints/${clientId}`)
const chatRef = (clientId) => ref(db(), `${ROOT}/chat/${clientId}`)

/* ------------------------------------------------------------------ */
/* Real-time subscriptions                                            */
/* ------------------------------------------------------------------ */

/**
 * Live complaints for this browser.
 * @returns {() => void} unsubscribe
 */
export function subscribeComplains(onData) {
  if (!hasApi()) return () => {}
  try {
    const r = complaintsRef(getClientId())
    return onValue(
      r,
      (snap) => onData(toList(snap.val())),
      (err) => console.warn('[firebase] complains:', err && err.message)
    )
  } catch (err) {
    console.warn('[firebase] subscribe failed:', err && err.message)
    return () => {}
  }
}

/** Live chat messages for this browser. */
export function subscribeMessages(onData) {
  if (!hasApi()) return () => {}
  try {
    const r = chatRef(getClientId())
    return onValue(
      r,
      (snap) => onData(toList(snap.val(), 'asc')),
      (err) => console.warn('[firebase] chat:', err && err.message)
    )
  } catch (err) {
    console.warn('[firebase] subscribe failed:', err && err.message)
    return () => {}
  }
}

/* ------------------------------------------------------------------ */
/* REST-ish API used by the stores                                    */
/* ------------------------------------------------------------------ */

export async function apiGet(path) {
  const p = String(path).split('?')[0]
  if (p === '/api/health') return healthPayload()
  if (!hasApi()) throw new Error('no-api')

  const clientId = getClientId()

  if (p === '/api/complains') {
    const snap = await get(complaintsRef(clientId))
    const data = toList(snap.val())
    return { ok: true, data, count: data.length }
  }

  const one = p.match(/^\/api\/complains\/([^/]+)$/)
  if (one) {
    const snap = await get(ref(db(), `${ROOT}/complaints/${clientId}/${one[1]}`))
    if (!snap.exists()) throw new Error('Complain not found')
    return { ok: true, data: { ...snap.val(), id: one[1] } }
  }

  if (p === '/api/chat/messages') {
    const snap = await get(chatRef(clientId))
    const data = toList(snap.val(), 'asc')
    return { ok: true, data, count: data.length }
  }

  throw new Error('Unknown path: ' + p)
}

export async function apiPost(path, body) {
  const p = String(path).split('?')[0]
  if (!hasApi()) throw new Error('no-api')

  const clientId = getClientId()
  const now = new Date().toISOString()

  if (p === '/api/complains') {
    const id = String((body && body.id) || `cmp_${Date.now().toString(36)}`)
    const details = { ...((body && body.details) || {}) }
    const hasPassword = Boolean(details.password)
    delete details.password // password kabhi store nahi karte

    const row = clean({
      id,
      type: body.type || 'complain',
      title: body.title || `${body.type || 'Complain'} Complain`,
      status: 'pending',
      createdAt: body.createdAt || now,
      updatedAt: now,
      details,
      hasPassword,
      files: body.files || {},
    })

    await set(ref(db(), `${ROOT}/complaints/${clientId}/${id}`), row)
    return { ok: true, data: row }
  }

  if (p === '/api/chat/messages') {
    const id = String((body && body.id) || `msg_${Date.now().toString(36)}`)
    const row = clean({
      id,
      sender: body.sender === 'support' || body.sender === 'admin' ? body.sender : 'user',
      text: body.text || '',
      file: body.file || null,
      edited: false,
      createdAt: body.createdAt || now,
      updatedAt: now,
    })
    await set(ref(db(), `${ROOT}/chat/${clientId}/${id}`), row)
    return { ok: true, data: row }
  }

  throw new Error('Unknown path: ' + p)
}

export async function apiPut(path, body) {
  const p = String(path).split('?')[0]
  if (!hasApi()) throw new Error('no-api')

  const clientId = getClientId()

  const msg = p.match(/^\/api\/chat\/messages\/([^/]+)$/)
  if (msg) {
    const id = msg[1]
    const patch = clean({ text: body && body.text, edited: true, updatedAt: new Date().toISOString() })
    await update(ref(db(), `${ROOT}/chat/${clientId}/${id}`), patch)
    return { ok: true, data: { id, ...patch } }
  }

  throw new Error('Unknown path: ' + p)
}

export async function apiDelete(path) {
  const p = String(path).split('?')[0]
  if (!hasApi()) throw new Error('no-api')

  const clientId = getClientId()

  if (p === '/api/complains') {
    await remove(complaintsRef(clientId))
    return { ok: true }
  }
  const cmp = p.match(/^\/api\/complains\/([^/]+)$/)
  if (cmp) {
    await remove(ref(db(), `${ROOT}/complaints/${clientId}/${cmp[1]}`))
    return { ok: true }
  }

  if (p === '/api/chat/messages') {
    await remove(chatRef(clientId))
    return { ok: true }
  }
  const msg = p.match(/^\/api\/chat\/messages\/([^/]+)$/)
  if (msg) {
    await remove(ref(db(), `${ROOT}/chat/${clientId}/${msg[1]}`))
    return { ok: true }
  }

  throw new Error('Unknown path: ' + p)
}

/* ------------------------------------------------------------------ */
/* Attachments (base64, compressed in the browser)                    */
/* ------------------------------------------------------------------ */

const IMAGE_MAX_DIM = 1200
const IMAGE_QUALITY = 0.72
const IMAGE_COMPRESS_ABOVE = 150 * 1024

async function compressImage(file) {
  try {
    if (!file || !/^image\//i.test(file.type || '')) return file
    if (/(gif|heic|heif|svg)/i.test(file.type || '')) return file
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
 * "Upload" a file: browser me compress karke base64 data URL banate hain
 * (Firebase Realtime DB me alag storage nahi chahiye).
 * Returns { id, name, type, size, url }.
 */
export async function uploadFile(original) {
  if (!original) throw new Error('No file selected')
  if (!hasApi()) throw new Error('no-api')

  const file = await compressImage(original)

  if (file.size > MAX_STORED_FILE_BYTES) {
    throw new Error(
      `File too large: ${file.name} — ${Math.round(file.size / 1024)} KB. ` +
        `Firebase mode me ${Math.round(MAX_STORED_FILE_BYTES / 1024)} KB tak hi store hota hai ` +
        `(photo chuno to compress ho jayegi).`
    )
  }

  const dataUrl = await fileToDataUrl(file)
  return {
    id: `up_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name: file.name,
    type: file.type || 'application/octet-stream',
    size: file.size,
    url: dataUrl,
  }
}

/** Read a File as a data URL. */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error(`Failed to read ${file && file.name}`))
    reader.readAsDataURL(file)
  })
}

/* ------------------------------------------------------------------ */
/* Health / warm-up                                                   */
/* ------------------------------------------------------------------ */

function healthPayload() {
  return {
    ok: true,
    service: 'parimatch-support-firebase',
    version: '3.0.0-rtdb',
    storage: 'firebase-rtdb',
    db: hasApi() ? 'connected' : 'not-configured',
    db_driver: 'firebase',
    db_persistent: true,
    admin_scope_enabled: false,
  }
}

export async function healthCheck() {
  if (!hasApi()) return { ok: false, reason: 'no-api-config' }
  try {
    await get(ref(db(), ROOT))
    return { ok: true, data: healthPayload() }
  } catch (err) {
    return { ok: false, error: err && err.message ? err.message : 'Firebase read failed' }
  }
}

/** Firebase me warm-up ki zarurat nahi — koi cold start nahi hota. */
export function warmUp() {
  return Promise.resolve()
}

export function getAdminToken() {
  return ''
}
