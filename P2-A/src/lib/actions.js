// Admin ke write actions (Firestore)
import { doc, setDoc, updateDoc } from 'firebase/firestore'
import { getDb } from './firebase.js'

function db() {
  const d = getDb()
  if (!d) throw new Error('Firebase configure nahi hai')
  return d
}

/** User ko support reply bhejo (chat me right side pe dikhega) */
export async function sendSupportMessage(clientId, text) {
  const body = String(text || '').trim()
  if (!body) throw new Error('Message khaali hai')

  const id = `msg_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
  const now = new Date().toISOString()
  const row = {
    id,
    clientId,
    sender: 'support',
    text: body.slice(0, 2000),
    file: null,
    edited: false,
    createdAt: now,
    updatedAt: now,
  }
  await setDoc(doc(db(), 'messages', id), row)
  return row
}

/** Complaint ka status badlo (pending / resolved / rejected) */
export async function updateComplaintStatus(complainId, status) {
  const value = String(status || 'pending').toLowerCase()
  await updateDoc(doc(db(), 'complaints', complainId), {
    status: value,
    updatedAt: new Date().toISOString(),
  })
  return value
}
