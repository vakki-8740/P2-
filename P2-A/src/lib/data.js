/**
 * P2-A data layer — Firestore se **saara** data (har user ka).
 *
 * User panel me har browser ka apna clientId hota hai; admin panel usko
 * "user" ki tarah treat karta hai — ek clientId = ek user.
 *
 *   complaints/{id} → { id, clientId, type, title, status, createdAt,
 *                       details{userName,mobile,email,...}, hasPassword, files }
 *   messages/{id}   → { id, clientId, sender, text, file, createdAt, edited }
 */
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore'
import { getDb } from './firebase.js'

const MAX_DOCS = 500

/** Saari complaints (naye pehle) — live. */
export function subscribeComplaints(onData) {
  const db = getDb()
  if (!db) { onData([]); return () => {} }
  const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'), limit(MAX_DOCS))
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ ...d.data(), id: d.id }))),
    (err) => { console.warn('[p2a] complaints:', err && err.message); onData([]) }
  )
}

/** Saare chat messages (purane pehle) — live. */
export function subscribeMessages(onData) {
  const db = getDb()
  if (!db) { onData([]); return () => {} }
  const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'), limit(MAX_DOCS))
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ ...d.data(), id: d.id }))),
    (err) => { console.warn('[p2a] messages:', err && err.message); onData([]) }
  )
}

/* ------------------------------------------------------------------ */
/* Helpers (pure — test bhi inhi pe hai)                               */
/* ------------------------------------------------------------------ */

export function userNameOf(row) {
  const d = (row && row.details) || {}
  const name = d.userName || d.user_name || d.name
  return (name && String(name).trim()) || 'Unknown User'
}

/** User ka short label (jab naam na mile) */
export function shortId(clientId) {
  return String(clientId || '').slice(0, 6) || 'user'
}

/** "2026-10-30T10:24:00.000Z" → { date: "30 Oct", time: "10:24 AM" } */
export function formatStamp(iso) {
  if (!iso) return { date: '', time: '' }
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { date: String(iso).slice(0, 10), time: '' }
  return {
    date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
  }
}

/** "30 Oct, 10:24 AM" */
export function formatDateTime(iso) {
  const { date, time } = formatStamp(iso)
  if (!date) return '-'
  return time ? `${date} • ${time}` : date
}

/** Aaj ka din (local time) tha ya nahi */
export function isToday(iso, now = new Date()) {
  if (!iso) return false
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return false
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

/** complaints → user list (ek clientId = ek user), latest pehle */
export function groupUsers(complaints) {
  const map = new Map()
  for (const c of complaints || []) {
    const clientId = c.clientId || 'unknown'
    let user = map.get(clientId)
    if (!user) {
      user = {
        clientId,
        name: userNameOf(c),
        mobile: (c.details && c.details.mobile) || '',
        email: (c.details && c.details.email) || '',
        complaints: [],
        lastAt: '',
        latestType: '',
        total: 0,
        todayCount: 0,
      }
      map.set(clientId, user)
    }
    user.complaints.push(c)
    user.total += 1
    if (!user.lastAt || String(c.createdAt) > String(user.lastAt)) {
      user.lastAt = c.createdAt
      user.latestType = c.type || 'Complain'
      user.name = userNameOf(c)
      user.mobile = (c.details && c.details.mobile) || user.mobile
      user.email = (c.details && c.details.email) || user.email
    }
  }
  return [...map.values()].sort((a, b) => String(b.lastAt).localeCompare(String(a.lastAt)))
}

/** Sirf wo users jinki complaint aaj aayi */
export function todayUsers(complaints, now = new Date()) {
  const users = groupUsers(complaints)
  return users
    .map((u) => ({
      ...u,
      todayCount: u.complaints.filter((c) => isToday(c.createdAt, now)).length,
    }))
    .filter((u) => u.todayCount > 0)
    .sort((a, b) => String(b.lastAt).localeCompare(String(a.lastAt)))
}

/** messages → chat user list (latest message wale pehle) */
export function chatUsers(messages, complaints = []) {
  const users = groupUsers(complaints)
  const byId = new Map(users.map((u) => [u.clientId, u]))
  const map = new Map()

  for (const m of messages || []) {
    const clientId = m.clientId || 'unknown'
    const known = byId.get(clientId)
    let row = map.get(clientId)
    if (!row) {
      row = {
        clientId,
        name: known ? known.name : `User ${shortId(clientId)}`,
        complaints: known ? known.complaints : [],
        total: known ? known.total : 0,
        count: 0,
        lastText: '',
        lastAt: '',
        lastSender: '',
      }
      map.set(clientId, row)
    }
    row.count += 1
    if (!row.lastAt || String(m.createdAt) > String(row.lastAt)) {
      row.lastAt = m.createdAt
      row.lastText = m.text || (m.file ? '📎 Attachment' : '')
      row.lastSender = m.sender || 'user'
    }
  }
  return [...map.values()].sort((a, b) => String(b.lastAt).localeCompare(String(a.lastAt)))
}

/** Ek user ki complaints (naye pehle) */
export function complaintsOf(complaints, clientId) {
  return (complaints || [])
    .filter((c) => c.clientId === clientId)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
}

/** Ek user ke messages (purane pehle) */
export function messagesOf(messages, clientId) {
  return (messages || [])
    .filter((m) => m.clientId === clientId)
    .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)))
}

/** Activity feed — complaints + messages mila ke, naye pehle */
export function activityFeed(complaints, messages, max = 120) {
  const items = []
  for (const c of complaints || []) {
    items.push({
      kind: 'complaint',
      id: `c_${c.id}`,
      clientId: c.clientId,
      title: `${c.type || 'Complain'} complaint`,
      subtitle: userNameOf(c),
      at: c.createdAt,
      type: c.type,
    })
  }
  for (const m of messages || []) {
    items.push({
      kind: 'message',
      id: `m_${m.id}`,
      clientId: m.clientId,
      title: m.sender === 'user' ? 'New message' : 'You replied',
      subtitle: m.text ? String(m.text).slice(0, 60) : '📎 Attachment',
      at: m.createdAt,
      type: 'Chat',
    })
  }
  items.sort((a, b) => String(b.at).localeCompare(String(a.at)))
  return items.slice(0, max)
}

/* ------------------------------------------------------------------ */
/* Attachments                                                        */
/* ------------------------------------------------------------------ */

export function fileSrc(file) {
  if (!file) return ''
  return file.url || file.data || ''
}

export function isImageFile(file) {
  if (!file) return false
  if (String(file.type || '').startsWith('image/')) return true
  if (/^data:image\//i.test(fileSrc(file))) return true
  // kai purani complaints me `type` save nahi hua — naam se pakad lo
  return /\.(png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(String(file.name || ''))
}

export function formatFileSize(bytes) {
  const n = Number(bytes || 0)
  if (!n) return ''
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}
