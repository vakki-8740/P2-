const KEY = 'parimatch_complains'

export function getComplains() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveComplain(entry) {
  const list = getComplains()
  list.unshift(entry)
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch (e) {
    if (e && e.name === 'QuotaExceededError') {
      // keep only last 20 to free space and retry once
      const trimmed = list.slice(0, 20)
      localStorage.setItem(KEY, JSON.stringify(trimmed))
    } else throw e
  }
  try { window.dispatchEvent(new Event('complains-updated')) } catch {}
  return list
}

export function clearComplains() {
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
