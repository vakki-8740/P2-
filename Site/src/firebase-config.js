/**
 * Firebase config — YAHAN apni values paste karo.
 * ---------------------------------------------------------------------------
 * Kahan se milega:
 *   1. https://console.firebase.google.com → apna project
 *   2. Left me "Build" → **Firestore Database** → Create Database
 *      → location chuno → **Start in test mode** → Create
 *   3. ⚙️ Project settings → "Your apps" → Web app (</>) add karo
 *      → wahan "firebaseConfig" ka block milega, uski values neeche copy karo
 *
 * ⚠️ `apiKey` aur `projectId` zaroori hain — inke bina app localStorage mode me
 *    chalega (crash nahi karega, bas data sirf usi browser me rahega).
 */

export const firebaseConfig = {
  apiKey: '',          // "AIza..."
  authDomain: '',      // "your-project.firebaseapp.com"
  projectId: '',       // "your-project"           ← ZAROORI
  storageBucket: '',   // "your-project.appspot.com"
  messagingSenderId: '',
  appId: '',           // "1:123:web:abc"
}

/** Firebase ready hai ya nahi (config bhara hai ya nahi). */
export function isFirebaseConfigured() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)
}
