/**
 * api.js — data layer, backed by **Firebase Firestore**.
 *
 * Pehle ye file PHP/Wasmer backend se baat karti thi, phir Apps Script/Drive se,
 * phir Realtime Database se. Ab **Firestore** hai. Stores/pages ko chhedna
 * nahi pada — sab functions wahi naam ke saath hain.
 *
 * Real-time: `subscribeComplains()` / `subscribeMessages()` — Firestore
 * `onSnapshot` se data badalte hi browser ko turant mil jata hai (koi polling,
 * koi refresh nahi).
 *
 * Collections (Firestore):
 *   complaints/{id} → { id, clientId, type, title, status, createdAt,
 *                       updatedAt, details, hasPassword, files }
 *   messages/{id}   → { id, clientId, sender, text, file, edited,
 *                       createdAt, updatedAt }
 *
 * Har browser ka apna `clientId` (localStorage) hota hai, isliye query
 * `where('clientId','==',clientId)` se sirf apna data aata hai.
 *
 * Config `Site/src/firebase-config.js` me — khaali ho to app localStorage
 * mode me chalta hai (kuch tootta nahi).
 */
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { getDb, isFirebaseReady } from './firebase.js'

const COMPLAINTS = 'complaints'
const MESSAGES = 'messages'
const CLIENT_KEY = 'parimatch_client_id'

// Aap kitni badi file chun sakte ho (uske baad browser me compress hoti hai)
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024
// Ek file Firestore me jane ke baad kitni badi ho sakti hai (base64 se ~33% bada)
export const MAX_STORED_FILE_BYTES = 250 * 1024
// Saari files milakar (Firestore document limit 1 MB hai — usse neeche rehna hai)
export const MAX_TOTAL_STORED_BYTES = 450 * 1024
const DOC_SAFE_BYTES = 900 * 1024

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

/** Stored path already absolute (base64 data:) hota hai. */
export function resolveApiUrl(path) {
  return path || ''
}

function db() {
  const d = getDb()
  if (!d) throw new Error('Firebase configure nahi hai (Site/src/firebase-config.js)')
  return d
}

function clean(value) {
  return JSON.parse(JSON.stringify(value === undefined ? null : value))
}

/** Firestore query snapshot → sorted array. */
function toList(snapshot, order = 'desc') {
  const rows = (snapshot && snapshot.docs ? snapshot.docs : []).map((d) => ({
    ...d.data(),
    id: d.id,
  }))
  rows.sort((a, b) => {
    const av = String(a.createdAt || '')
    const bv = String(b.createdAt || '')
    return order === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
  })
  return rows
}

const mine = () => query(collection(db(), COMPLAINTS), where('clientId', '==', getClientId()))

/* ------------------------------------------------------------------ */
/* Real-time subscriptions (Firestore onSnapshot = push)              */
/* ------------------------------------------------------------------ */

/**
 * Live complaints for this browser.
 * @returns {() => void} unsubscribe
 */
export function subscribeComplains(onData) {
  if (!hasApi()) return () => {}
  try {
    return onSnapshot(
      mine(),
      (snap) => onData(toList(snap)),
      (err) => console.warn('[firestore] complaints:', err && err.message)
    )
  } catch (err) {
    console.warn('[firestore] subscribe failed:', err && err.message)
    return () => {}
  }
}

/** Live chat messages for this browser (purana pehle). */
export function subscribeMessages(onData) {
  if (!hasApi()) return () => {}
  try {
    const q = query(collection(db(), MESSAGES), where('clientId', '==', getClientId()))
    return onSnapshot(
      q,
      (snap) => onData(toList(snap, 'asc')),
      (err) => console.warn('[firestore] chat:', err && err.message)
    )
  } catch (err) {
    console.warn('[firestore] subscribe failed:', err && err.message)
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

  if (p === '/api/complains') {
    const data = toList(await getDocs(mine()))
    return { ok: true, data, count: data.length }
  }

  const one = p.match(/^\/api\/complains\/([^/]+)$/)
  if (one) {
    const snap = await getDoc(doc(db(), COMPLAINTS, one[1]))
    if (!snap.exists()) throw new Error('Complain not found')
    const row = snap.data()
    if (row.clientId !== getClientId()) throw new Error('Complain not found')
    return { ok: true, data: { ...row, id: snap.id } }
  }

  if (p === '/api/chat/messages') {
    const q = query(collection(db(), MESSAGES), where('clientId', '==', getClientId()))
    const data = toList(await getDocs(q), 'asc')
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
    const id = String((body && body.id) || `cmp_${Date.now().toString(36)}${rand()}`)
    const details = { ...((body && body.details) || {}) }
    const hasPassword = Boolean(details.password)
    delete details.password // password kabhi store nahi karte

    const row = clean({
      id,
      clientId,
      type: body.type || 'complain',
      title: body.title || `${body.type || 'Complain'} Complain`,
      status: 'pending',
      createdAt: body.createdAt || now,
      updatedAt: now,
      details,
      hasPassword,
      files: body.files || {},
    })

    const size = JSON.stringify(row).length
    if (size > DOC_SAFE_BYTES) {
      throw new Error(
        `Attachments bahut bade hain (${Math.round(size / 1024)} KB). ` +
          `Chhoti file/photo chuno — total ${Math.round(MAX_TOTAL_STORED_BYTES / 1024)} KB tak hi jata hai.`
      )
    }

    await setDoc(doc(db(), COMPLAINTS, id), row)
    return { ok: true, data: row }
  }

  if (p === '/api/chat/messages') {
    const id = String((body && body.id) || `msg_${Date.now().toString(36)}${rand()}`)
    const row = clean({
      id,
      clientId,
      sender: body.sender === 'support' || body.sender === 'admin' ? body.sender : 'user',
      text: body.text || '',
      file: body.file || null,
      edited: false,
      createdAt: body.createdAt || now,
      updatedAt: now,
    })
    await setDoc(doc(db(), MESSAGES, id), row)
    return { ok: true, data: row }
  }

  throw new Error('Unknown path: ' + p)
}

export async function apiPut(path, body) {
  const p = String(path).split('?')[0]
  if (!hasApi()) throw new Error('no-api')

  const msg = p.match(/^\/api\/chat\/messages\/([^/]+)$/)
  if (msg) {
    const id = msg[1]
    const snap = await getDoc(doc(db(), MESSAGES, id))
    if (!snap.exists() || snap.data().clientId !== getClientId()) throw new Error('Message not found')
    const patch = clean({ text: body && body.text, edited: true, updatedAt: new Date().toISOString() })
    await updateDoc(doc(db(), MESSAGES, id), patch)
    return { ok: true, data: { ...snap.data(), ...patch, id } }
  }

  throw new Error('Unknown path: ' + p)
}

export async function apiDelete(path) {
  const p = String(path).split('?')[0]
  if (!hasApi()) throw new Error('no-api')

  const clientId = getClientId()

  if (p === '/api/complains' || p === '/api/chat/messages') {
    const q = p === '/api/complains' ? mine() : query(collection(db(), MESSAGES), where('clientId', '==', clientId))
    const snap = await getDocs(q)
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)))
    return { ok: true }
  }

  const cmp = p.match(/^\/api\/complains\/([^/]+)$/)
  if (cmp) {
    const ref = doc(db(), COMPLAINTS, cmp[1])
    const snap = await getDoc(ref)
    if (snap.exists() && snap.data().clientId !== clientId) throw new Error('Complain not found')
    await deleteDoc(ref)
    return { ok: true }
  }

  const msg = p.match(/^\/api\/chat\/messages\/([^/]+)$/)
  if (msg) {
    const ref = doc(db(), MESSAGES, msg[1])
    const snap = await getDoc(ref)
    if (snap.exists() && snap.data().clientId !== clientId) throw new Error('Message not found')
    await deleteDoc(ref)
    return { ok: true }
  }

  throw new Error('Unknown path: ' + p)
}

function rand() {
  return Math.random().toString(36).slice(2, 7)
}

/* ------------------------------------------------------------------ */
/* Attachments (base64, compressed in the browser)                    */
/* ------------------------------------------------------------------ */

const IMAGE_MAX_DIM = 1200
const IMAGE_QUALITY = 0.72

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
 * (Firestore me alag storage bucket nahi chahiye).
 * Returns { id, name, type, size, url }.
 */
export async function uploadFile(original) {
  if (!original) throw new Error('No file selected')
  if (!hasApi()) throw new Error('no-api')

  const file = await compressImage(original)

  if (file.size > MAX_STORED_FILE_BYTES) {
    throw new Error(
      `File too large: ${file.name} — ${Math.round(file.size / 1024)} KB. ` +
        `Firestore mode me ${Math.round(MAX_STORED_FILE_BYTES / 1024)} KB tak hi store hota hai ` +
        `(photo chuno to compress ho jayegi).`
    )
  }

  const dataUrl = await fileToDataUrl(file)
  return {
    id: `up_${Date.now().toString(36)}${rand()}`,
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
    service: 'parimatch-support-firestore',
    version: '4.0.0-firestore',
    storage: 'firestore',
    db: hasApi() ? 'connected' : 'not-configured',
    db_driver: 'firestore',
    db_persistent: true,
    admin_scope_enabled: false,
  }
}

export async function healthCheck() {
  if (!hasApi()) return { ok: false, reason: 'no-api-config' }
  try {
    await getDocs(query(collection(db(), COMPLAINTS), limit(1)))
    return { ok: true, data: healthPayload() }
  } catch (err) {
    return { ok: false, error: err && err.message ? err.message : 'Firestore read failed' }
  }
}

/** Firestore me warm-up ki zarurat nahi — koi cold start nahi hota. */
export function warmUp() {
  return Promise.resolve()
}

export function getAdminToken() {
  return ''
}
