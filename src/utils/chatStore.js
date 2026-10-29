const KEY = 'parimatch_chat_messages'

export function getMessages() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch { return [] }
}

export function saveMessage(msg) {
  const list = getMessages()
  list.push(msg)
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch (e) {
    if (e && e.name === 'QuotaExceededError') {
      const trimmed = list.slice(-50)
      localStorage.setItem(KEY, JSON.stringify(trimmed))
    } else throw e
  }
  try { window.dispatchEvent(new Event('chat-updated')) } catch {}
  return list
}

export function updateMessage(id, newText) {
  const list = getMessages()
  const idx = list.findIndex(m => m.id === id)
  if (idx !== -1) {
    list[idx].text = newText
    list[idx].edited = true
    list[idx].editedAt = new Date().toISOString()
    localStorage.setItem(KEY, JSON.stringify(list))
    try { window.dispatchEvent(new Event('chat-updated')) } catch {}
  }
  return list
}

export function deleteMessage(id) {
  const list = getMessages().filter(m => m.id !== id)
  try { localStorage.setItem(KEY, JSON.stringify(list)) } catch {}
  try { window.dispatchEvent(new Event('chat-updated')) } catch {}
  return list
}

export function clearMessages() {
  try { localStorage.removeItem(KEY) } catch {}
  try { window.dispatchEvent(new Event('chat-updated')) } catch {}
}

export function generateChatId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2,7)
}

export function fileToBase64(file) {
  const MAX = 8 * 1024 * 1024
  if (file && file.size > MAX) return Promise.reject(new Error('File too large (max 8MB): '+file.name))
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
