// chatStore.js — live chat data layer (user <-> support).
// Backend first, localStorage fallback. Attachments are uploaded to the
// backend when configured; offline they are inlined (small files only).
//
import {
  hasApi,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  uploadFile,
  fileToDataUrl,
  resolveApiUrl,
  MAX_UPLOAD_BYTES,
} from './api.js'

const KEY = 'parimatch_chat_messages'
const LOCAL_FILE_MAX = 4 * 1024 * 1024

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

function writeLocal(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    // Quota: drop attachment payloads, then retry once.
    try {
      localStorage.setItem(KEY, JSON.stringify(list.slice(-50).map((m) => ({ ...m, file: null }))))
    } catch {}
  }
  try {
    window.dispatchEvent(new Event('chat-updated'))
  } catch {}
}

function normalizeFile(file) {
  if (!file || typeof file !== 'object') return null
  return {
    name: file.name || 'file',
    type: file.type || '',
    size: Number(file.size) || 0,
    url: file.url || '',
    data: typeof file.data === 'string' ? file.data : '',
  }
}

export function normalizeChatRow(row) {
  if (!row || typeof row !== 'object') return null
  return {
    id: String(row.id || generateChatId()),
    sender: row.sender === 'support' || row.sender === 'admin' ? row.sender : 'user',
    text: row.text || '',
    createdAt: row.createdAt || row.created_at || new Date().toISOString(),
    edited: Boolean(row.edited),
    file: normalizeFile(row.file),
  }
}

export function generateChatId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

/* ------------------------------------------------------------------ */
/* Reads                                                              */
/* ------------------------------------------------------------------ */

export function getMessages() {
  return getLocal()
    .map(normalizeChatRow)
    .filter(Boolean)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
}

export async function getMessagesAsync() {
  if (hasApi()) {
    try {
      const res = await apiGet('/api/chat/messages?limit=200')
      if (res && Array.isArray(res.data)) {
        return res.data.map(normalizeChatRow).filter(Boolean)
      }
    } catch (e) {
      console.warn('Backend chat list failed, using localStorage:', e.message)
    }
  }
  return getMessages()
}

/* ------------------------------------------------------------------ */
/* Writes                                                             */
/* ------------------------------------------------------------------ */

async function prepareFile(file, useBackend) {
  if (!file || typeof file !== 'object') return null
  if (file.url || file.data) return normalizeFile(file)
  if (!file.raw) return null

  if (file.raw.size > MAX_UPLOAD_BYTES) {
    throw new Error(`File too large: ${file.raw.name} (max ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB)`)
  }

  if (useBackend) {
    try {
      return await uploadFile(file.raw)
    } catch (err) {
      if (file.raw.size > LOCAL_FILE_MAX) {
        throw new Error(err.message || `Could not upload ${file.raw.name}`)
      }
      console.warn('Chat upload failed, storing locally:', err.message)
    }
  }

  if (file.raw.size > LOCAL_FILE_MAX) {
    throw new Error(
      `Offline mode: ${file.raw.name} is too large. Connect the backend (VITE_API_URL) for larger files.`
    )
  }

  return {
    name: file.raw.name,
    type: file.raw.type || '',
    size: file.raw.size,
    data: await fileToDataUrl(file.raw),
  }
}

/**
 * @param {{id?:string,sender?:'user'|'support',text?:string,createdAt?:string,
 *          file?:{name:string,type:string,size:number,raw?:File}|null}} msg
 */
export async function saveMessage(msg) {
  const useBackend = hasApi()
  const file = await prepareFile(msg.file, useBackend)

  const entry = normalizeChatRow({
    id: msg.id || generateChatId(),
    sender: msg.sender || 'user',
    text: msg.text || '',
    createdAt: msg.createdAt || new Date().toISOString(),
    edited: false,
    file,
  })

  if (useBackend) {
    try {
      await apiPost('/api/chat/messages', {
        id: entry.id,
        sender: entry.sender,
        text: entry.text,
        createdAt: entry.createdAt,
        file: file
          ? { id: file.id, name: file.name, type: file.type, size: file.size, url: file.url }
          : null,
      })
    } catch (e) {
      console.warn('Backend chat save failed, message kept locally:', e.message)
    }
  }

  const list = getLocal()
  const idx = list.findIndex((m) => m && m.id === entry.id)
  if (idx >= 0) list.splice(idx, 1)
  list.push(entry)
  writeLocal(list)
  return getMessages()
}

export async function updateMessage(id, newText) {
  const text = (newText || '').trim()
  if (!text) return getMessages()

  if (hasApi()) {
    try {
      await apiPut('/api/chat/messages/' + encodeURIComponent(id), { text })
    } catch (e) {
      console.warn('Backend edit failed:', e.message)
    }
  }

  const list = getLocal()
  const idx = list.findIndex((m) => m && m.id === id)
  if (idx !== -1) {
    list[idx] = { ...list[idx], text, edited: true, editedAt: new Date().toISOString() }
    writeLocal(list)
  }
  return getMessages()
}

export async function deleteMessage(id) {
  if (hasApi()) {
    try {
      await apiDelete('/api/chat/messages/' + encodeURIComponent(id))
    } catch (e) {
      console.warn('Backend delete failed:', e.message)
    }
  }
  writeLocal(getLocal().filter((m) => m && m.id !== id))
  return getMessages()
}

export async function clearMessages() {
  if (hasApi()) {
    try {
      await apiDelete('/api/chat/messages')
    } catch (e) {
      console.warn('Backend clear failed:', e.message)
    }
  }
  try {
    localStorage.removeItem(KEY)
  } catch {}
  try {
    window.dispatchEvent(new Event('chat-updated'))
  } catch {}
  return []
}

/* ------------------------------------------------------------------ */
/* Display helpers                                                    */
/* ------------------------------------------------------------------ */

/** Usable src/href for a chat attachment. */
export function chatFileSrc(file) {
  if (!file) return ''
  if (file.url) return resolveApiUrl(file.url)
  return file.data || ''
}

export function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export function formatDateChat(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return iso || ''
  }
}
