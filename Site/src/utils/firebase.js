/**
 * firebase.js — Firebase app ka ek hi instance (Realtime Database).
 *
 * Config `Site/src/firebase-config.js` me hai. Bina config ke app chalta hai
 * (sirf localStorage mode), kuch crash nahi hota.
 */
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { firebaseConfig, isFirebaseConfigured } from '../firebase-config.js'

let app = null
let db = null

export function isFirebaseReady() {
  return isFirebaseConfigured()
}

/** Realtime Database instance, ya null agar config nahi bhara. */
export function getDb() {
  if (!isFirebaseConfigured()) return null
  if (db) return db
  try {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig)
    db = getDatabase(app)
    return db
  } catch (err) {
    console.warn('[firebase] init failed:', err && err.message)
    return null
  }
}
