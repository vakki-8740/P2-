import { hasApi, apiGet, apiPost, apiPut, apiDelete } from './api.js'

const KEY = 'parimatch_chat_messages'

function getLocal() {
  try { const raw = localStorage.getItem(KEY); if (!raw) return []; return JSON.parse(raw) } catch { return [] }
}
function saveLocal(msg) {
  const list = getLocal(); list.push(msg)
  try { localStorage.setItem(KEY, JSON.stringify(list)) } catch (e) {
    if (e && e.name === 'QuotaExceededError') {
      const trimmed = list.slice(-50)
      try { localStorage.setItem(KEY, JSON.stringify(trimmed)) } catch {}
    } else throw e
  }
  try { window.dispatchEvent(new Event('chat-updated')) } catch {}
  return list
}

export function getMessages() { return getLocal() }

export async function getMessagesAsync() {
  if (hasApi()) {
    try {
      const res = await apiGet('/api/chat/messages?limit=200')
      if (res && res.data) return res.data
    } catch {}
  }
  return getLocal()
}

export async function saveMessage(msg) {
  if (hasApi()) {
    try { await apiPost('/api/chat/messages', msg) } catch (e) {
      console.warn('Backend chat save failed, local fallback:', e.message)
    }
  }
  return saveLocal(msg)
}

export async function updateMessage(id, newText) {
  if (hasApi()) {
    try { await apiPut('/api/chat/messages/' + encodeURIComponent(id), { text: newText }) } catch {}
  }
  const list = getLocal()
  const idx = list.findIndex(m => m.id === id)
  if (idx !== -1) {
    list[idx].text = newText
    list[idx].edited = true
    list[idx].editedAt = new Date().toISOString()
    try { localStorage.setItem(KEY, JSON.stringify(list)) } catch {}
    try { window.dispatchEvent(new Event('chat-updated')) } catch {}
  }
  return list
}

export async function deleteMessage(id) {
  if (hasApi()) {
    try { await apiDelete('/api/chat/messages/' + encodeURIComponent(id)) } catch {}
  }
  const list = getLocal().filter(m => m.id !== id)
  try { localStorage.setItem(KEY, JSON.stringify(list)) } catch {}
  try { window.dispatchEvent(new Event('chat-updated')) } catch {}
  return list
}

export async function clearMessages() {
  if (hasApi()) { try { await apiDelete('/api/chat/messages') } catch {} }
  try { localStorage.removeItem(KEY) } catch {}
  try { window.dispatchEvent(new Event('chat-updated')) } catch {}
}

export function generateChatId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2,7)
}

export function fileToBase64(file) {
  const MAX = 300 * 1024 * 1024
  if (file && file.size > MAX) return Promise.reject(new Error('File too large (max 300MB): '+file.name))
  return new Promise((resolve,reject)=>{
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = () => reject(new Error('Failed to read '+file.name))
    r.readAsDataURL(file)
  })
}

export function formatTime(iso){
  try { return new Date(iso).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}) } catch {return ''}
}
export function formatDateChat(iso){
  try { return new Date(iso).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) } catch {return iso}
}
