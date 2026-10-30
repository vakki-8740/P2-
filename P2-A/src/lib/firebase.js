// Firebase app + Firestore ka ek hi instance.
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { firebaseConfig, isFirebaseConfigured } from '../firebase-config.js'

let app = null
let db = null

export function isFirebaseReady() {
  return isFirebaseConfigured()
}

export function getDb() {
  if (!isFirebaseConfigured()) return null
  if (db) return db
  try {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig)
    db = getFirestore(app)
    return db
  } catch (err) {
    console.warn('[firebase] init failed:', err && err.message)
    return null
  }
}
