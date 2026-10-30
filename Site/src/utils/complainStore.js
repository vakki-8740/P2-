// complainStore.js — complaints data layer.
// Remote store (Firebase Firestore) first, localStorage fallback
// offline. Both shapes are normalised to one structure before rendering:
//
//   { id, type, title, status, createdAt, hasPassword,
//     details: { userName, mobile, email, amount, message, ...extras },
//     files:   { field: { name, type, size, url } }   // local rows use `data`
//
import {
  hasApi,
  subscribeComplains as subscribeComplainsRaw,
  apiGet,
  apiPost,
  apiDelete,
  uploadFile,
  fileToDataUrl,
  resolveApiUrl,
  MAX_UPLOAD_BYTES,
} from './api.js'

const KEY = 'parimatch_complains'

// localStorage is ~5 MB per origin, so offline attachments stay small.
const LOCAL_FILE_MAX = 4 * 1024 * 1024
const LOCAL_TOTAL_MAX = 6 * 1024 * 1024

/* ------------------------------------------------------------------ */
/* Local helpers                                                      */
/* ------------------------------------------------------------------ */

function getLocal() {
  try {
    const raw = localStorage.getItem(KEY)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function emit() {
  try {
    window.dispatchEvent(new Event('complains-updated'))
  } catch {}
}

function saveLocal(entry) {
  const list = getLocal()
  const idx = list.findIndex((item) => item && item.id === entry.id)
  if (idx >= 0) list.splice(idx, 1)
  list.unshift(entry)

  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch (e) {
    // Quota: keep the newest entries without attachments.
    const trimmed = list.slice(0, 25).map((item) => ({ ...item, files: {} }))
    try {
      localStorage.setItem(KEY, JSON.stringify(trimmed))
    } catch {}
  }
  emit()
  return getComplains()
}

/* ------------------------------------------------------------------ */
/* Normalisation                                                      */
/* ------------------------------------------------------------------ */

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

function normalizeFiles(files) {
  const out = {}
  if (!files || typeof files !== 'object') return out

  Object.entries(files).forEach(([key, file]) => {
    if (!file || typeof file !== 'object') return
    out[key] = {
      name: file.name || key,
      type: file.type || '',
      size: Number(file.size) || 0,
      url: file.url || '',
      data: typeof file.data === 'string' ? file.data : '',
    }
  })
  return out
}

/**
 * Accepts a backend row (flat + details/files) or a local entry and returns
 * the single shape the UI renders. Passwords are never kept client side.
 */
export function normalizeComplainRow(row) {
  if (!row || typeof row !== 'object') return null

  const id = String(row.id || generateId())
  const type = String(row.type || '')
  const title = String(row.title || (type ? `${type} Complain` : 'Complain'))
  const createdAt = row.createdAt || row.created_at || new Date().toISOString()
  const status = String(row.status || 'pending')

  let details = {}
  if (row.details && typeof row.details === 'object') {
    details = { ...row.details }
  } else {
    details = {
      userName: row.userName || row.user_name || '',
      mobile: row.mobile || '',
      email: row.email || '',
    }
    if (row.amount) details.amount = row.amount
    if (row.message) details.message = row.message
    if (row.extra && typeof row.extra === 'object') details = { ...details, ...row.extra }
  }

  const hasPassword = Boolean(row.hasPassword) || Boolean(details.password)
  delete details.password

  return {
    id,
    type,
    title,
    status,
    createdAt,
    details,
    hasPassword,
    files: normalizeFiles(row.files),
  }
}

function stripPassword(entry) {
  const copy = { ...entry, details: { ...(entry.details || {}) } }
  copy.hasPassword = Boolean(copy.hasPassword) || Boolean(copy.details.password)
  delete copy.details.password
  return copy
}

/* ------------------------------------------------------------------ */
/* Reads                                                              */
/* ------------------------------------------------------------------ */

/** Instant (local) list, used for the first paint. */
export function getComplains() {
  return getLocal()
    .map(normalizeComplainRow)
    .filter(Boolean)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

/** Backend list when configured, otherwise the local list. */
export async function getComplainsAsync() {
  if (hasApi()) {
    try {
      const res = await apiGet('/api/complains?limit=200')
      if (res && Array.isArray(res.data)) {
        return res.data.map(normalizeComplainRow).filter(Boolean)
      }
    } catch (e) {
      console.warn('Backend list failed, using localStorage:', e.message)
    }
  }
  return getComplains()
}

/** Real-time list — Firebase se live update, warna localStorage. */
export function subscribeComplains(onChange) {
  if (!hasApi()) {
    onChange(getComplains())
    return () => {}
  }
  return subscribeComplainsRaw((rows) => {
    const list = (rows || []).map(normalizeComplainRow).filter(Boolean)
    onChange(list)
  })
}

/* ------------------------------------------------------------------ */
/* Writes                                                             */
/* ------------------------------------------------------------------ */

/** Upload every raw File (backend) or inline it as base64 (offline). */
async function prepareFiles(files, useBackend) {
  const entries = Object.entries(files || {}).filter(([, file]) => file && typeof file === 'object')
  if (!entries.length) return {}

  let localTotal = 0

  // Saare files EK SAATH upload karo (pehle ek-ek karke hota tha, isliye
  // 2 files = 2 baar network ka chakkar).
  const pairs = await Promise.all(
    entries.map(async ([key, file]) => {
      // Already prepared (re-save of a loaded row).
      if (file.url || file.data) {
        return [key, normalizeFiles({ [key]: file })[key]]
      }

      if (file.size > MAX_UPLOAD_BYTES) {
        throw new Error(`File too large: ${file.name} (max ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB)`)
      }

      if (useBackend) {
        try {
          return [key, await uploadFile(file)]
        } catch (err) {
          // Server unreachable / rejected: keep small files offline instead.
          if (file.size > LOCAL_FILE_MAX) {
            throw new Error(err.message || `Could not upload ${file.name}`)
          }
          console.warn('Upload failed, storing locally:', err.message)
        }
      }

      if (file.size > LOCAL_FILE_MAX) {
        throw new Error(
          `File too big: ${file.name} (${Math.round(file.size / 1024 / 1024)} MB). Firebase mode me ` +
            `browser compress karta hai, phir bhi 400 KB tak hi jata hai — chhoti photo/file chuno.`
        )
      }
      localTotal += file.size
      if (localTotal > LOCAL_TOTAL_MAX) {
        throw new Error('Offline mode: attachments are too large. Please use smaller files.')
      }

      return [
        key,
        {
          name: file.name,
          type: file.type || '',
          size: file.size,
          data: await fileToDataUrl(file),
        },
      ]
    })
  )

  const out = {}
  for (const [key, value] of pairs) out[key] = value
  return out
}

/**
 * Save a complaint. The backend is used when configured; the row is always
 * kept locally too, so the "All Complains" page works offline.
 *
 * @param {{id?:string,type:string,title?:string,createdAt?:string,
 *          details:object, files?:Object<string, File|object>}} entry
 */
export async function saveComplain(entry) {
  const useBackend = hasApi()
  const files = await prepareFiles(entry.files, useBackend)

  const payload = {
    id: entry.id || generateId(),
    type: entry.type,
    title: entry.title || `${entry.type} Complain`,
    createdAt: entry.createdAt || new Date().toISOString(),
    details: { ...(entry.details || {}) },
  }

  let saved = normalizeComplainRow({ ...payload, files })

  if (useBackend) {
    try {
      const res = await apiPost('/api/complains', { ...payload, files })
      if (res && res.data) saved = normalizeComplainRow(res.data)
    } catch (e) {
      console.warn('Backend save failed, complaint kept locally:', e.message)
    }
  }

  return saveLocal(stripPassword(saved))
}

export async function deleteComplain(id) {
  if (hasApi()) {
    try {
      await apiDelete('/api/complains/' + encodeURIComponent(id))
    } catch (e) {
      console.warn('Backend delete failed:', e.message)
    }
  }
  const list = getLocal().filter((item) => item && item.id !== id)
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {}
  emit()
  return getComplains()
}

export async function clearComplains() {
  if (hasApi()) {
    try {
      await apiDelete('/api/complains')
    } catch (e) {
      console.warn('Backend clear failed:', e.message)
    }
  }
  try {
    localStorage.removeItem(KEY)
  } catch {}
  emit()
}

/* ------------------------------------------------------------------ */
/* Display helpers                                                    */
/* ------------------------------------------------------------------ */

/** Usable src/href for a stored attachment (backend URL or inline data). */
export function fileSrc(file) {
  if (!file) return ''
  if (file.url) return resolveApiUrl(file.url)
  return file.data || ''
}

export function isImageFile(file) {
  if (!file) return false
  if ((file.type || '').startsWith('image/')) return true
  if ((file.data || '').startsWith('data:image/')) return true
  return /\.(png|jpe?g|gif|webp|bmp|heic|heif)(\?|$)/i.test(file.url || file.name || '')
}

export function formatFileSize(bytes) {
  const size = Number(bytes) || 0
  if (size <= 0) return ''
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(2)} MB`
}

export function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso || ''
  }
}

/** Ordered [label, value] pairs for the details grid. */
export function detailEntries(row) {
  if (!row) return []
  const labels = {
    userName: 'User Name',
    mobile: 'Mobile Number',
    email: 'E-mail ID',
    amount: 'Amount',
    message: 'Message',
  }
  const ordered = ['userName', 'mobile', 'email', 'amount', 'message']
  const src = row.details || {}
  const entries = []

  ordered.forEach((key) => {
    const value = src[key]
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      entries.push([labels[key] || key, String(value)])
    }
  })

  Object.entries(src).forEach(([key, value]) => {
    if (ordered.includes(key)) return
    if (value === undefined || value === null || String(value).trim() === '') return
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())
    entries.push([label, String(value)])
  })

  return entries
}
