/**
 * Firebase config — same project jo user panel (Site) use karta hai.
 * Firebase console → ⚙️ Project settings → Your apps → Web app → firebaseConfig
 */
export const firebaseConfig = {
  apiKey: 'AIzaSyB6QQ2VkDkvnl_sbJlBGnw0Q4thU3noP5A',
  authDomain: 'parmatch-main.firebaseapp.com',
  projectId: 'parmatch-main',
  storageBucket: 'parmatch-main.firebasestorage.app',
  messagingSenderId: '417396734605',
  appId: '1:417396734605:web:ed307931c4af7022ad00c4',
}

export function isFirebaseConfigured() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)
}
