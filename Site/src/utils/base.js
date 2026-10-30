// base.js — every link/asset path in this app goes through withBase().
//
// The Site project is deployed at the domain root  -> BASE_PATH = ''
// The root project mounts the same app under /site -> BASE_PATH = '/site'
// (set by the root vite.config.js), so both builds share ONE source tree.

export const BASE_PATH = String(import.meta.env.VITE_BASE_PATH || '').replace(/\/+$/, '')

export function withBase(path = '/') {
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${BASE_PATH}${clean}` === '' ? '/' : `${BASE_PATH}${clean}`
}

