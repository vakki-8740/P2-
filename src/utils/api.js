// api.js — central API client for Parimatch backend (PHP + SQL)
// Uses VITE_API_URL, falls back to localStorage if backend unreachable
// Works for both Root (src/) and Site (Site/src/) — keep in sync

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function request(path, options = {}) {
  if (!API_BASE) throw new Error('no-api');
  const url = API_BASE + path;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(txt || `HTTP ${res.status}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

export function hasApi() {
  return !!API_BASE;
}

export async function apiGet(path) {
  return request(path, { method: 'GET' });
}

export async function apiPost(path, body) {
  return request(path, { method: 'POST', body: JSON.stringify(body) });
}

export async function apiPut(path, body) {
  return request(path, { method: 'PUT', body: JSON.stringify(body) });
}

export async function apiDelete(path) {
  return request(path, { method: 'DELETE' });
}

// Health check (used by UI to show backend status, optional)
export async function healthCheck() {
  try {
    if (!API_BASE) return { ok: false, reason: 'no-api-config' };
    const data = await request('/api/health', { method: 'GET' });
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
