/**
 * Firebase config — YAHAN apni values paste karo.
 * ---------------------------------------------------------------------------
 * Kahan se milega:
 *   1. https://console.firebase.google.com  → apna project
 *   2. Left me "Build" ke neeche **Realtime Database** → Create Database
 *      (location: Asia-southeast1 / us-central1 — jo bhi de, chalega)
 *      Start in **Test mode** (rules baad me badal sakte ho)
 *   3. Project settings (⚙️ upar) → "Your apps" → Web app (</>) add karo
 *      → wahan "firebaseConfig" ka block milega, uski values neeche copy karo
 *
 * ⚠️ `databaseURL` sabse zaroori hai — uske bina app localStorage mode me chalega.
 *    Realtime Database banao to wo apne aap config me aa jata hai.
 */

export const firebaseConfig = {
  apiKey: '',            // "AIza..."
  authDomain: '',        // "your-project.firebaseapp.com"
  databaseURL: '',       // "https://your-project-default-rtdb.firebaseio.com"  ← ZAROORI
  projectId: '',         // "your-project"
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
}

/** Firebase ready hai ya nahi (config bhara hai ya nahi). */
export function isFirebaseConfigured() {
  return Boolean(firebaseConfig.databaseURL && firebaseConfig.projectId)
}
