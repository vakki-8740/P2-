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
  localStorage.setItem(KEY, JSON.stringify(list))
  // dispatch storage event for same-tab listeners (custom)
  window.dispatchEvent(new Event('complains-updated'))
  return list
}

export function clearComplains() {
  localStorage.removeItem(KEY)
  window.dispatchEvent(new Event('complains-updated'))
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function formatDate(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  } catch { return iso }
}
