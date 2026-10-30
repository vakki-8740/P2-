# Firebase setup — 10 minute, ek baar

Ab koi server, Drive, Apps Script ya database nahi. Data **Firebase Realtime
Database** me jata hai — isliye data **turant** (real-time) dikhta hai.

```
Website  ──▶  Firebase Realtime Database  ──(live)──▶  Website / check page
```

---

## Step 1 — Firebase project banao

1. Kholo: **https://console.firebase.google.com**
2. **Add project** → naam do (e.g. `parimatch-support`) → Continue
3. Google Analytics **off** kar do (zarurat nahi) → **Create project**

## Step 2 — Realtime Database on karo

1. Left sidebar me **Build** → **Realtime Database**
2. **Create Database**
3. Location: jo bhi default aaye (`asia-southeast1` / `us-central1`) → **Next**
4. **Start in test mode** → **Enable**

> Test mode = 30 din tak sab open. Rules neeche Step 6 me hai — permanent
> chalane ke liye wo laga lena.

## Step 3 — Config copy karo

1. Upar left **⚙️ Project settings**
2. Neeche **Your apps** → **`</>` (Web)** icon dabao
3. App nickname: `web` → **Register app**
4. Ye block dikhega — **poora copy** karo:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "parimatch-support.firebaseapp.com",
  databaseURL: "https://parimatch-support-default-rtdb.firebaseio.com",
  projectId: "parimatch-support",
  storageBucket: "parimatch-support.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
};
```

> ⚠️ **`databaseURL` sabse zaroori hai.** Agar Realtime Database Step 2 me nahi banaya,
> to ye line config me nahi aayegi — pehle wo banao.

## Step 4 — App me config daalo

File kholo: **`Site/src/firebase-config.js`**

`firebaseConfig` object me apni values paste karo:

```js
export const firebaseConfig = {
  apiKey: 'AIzaSy...',
  authDomain: 'parimatch-support.firebaseapp.com',
  databaseURL: 'https://parimatch-support-default-rtdb.firebaseio.com',
  projectId: 'parimatch-support',
  storageBucket: 'parimatch-support.appspot.com',
  messagingSenderId: '1234567890',
  appId: '1:1234567890:web:abcdef',
}
```

Phir commit + Vercel redeploy (ya `git push` karo, Vercel khud uthayega).

**Kuch nahi bhara ho to app crash nahi karta** — bas localStorage mode me chalta hai.

## Step 5 — Check page

`check/index.html` wala page kholo → wahan **wahi `firebaseConfig` block paste** karo → **Connect**.

- 🟢 **LIVE** badge + total complaints dikhega
- Website se nayi complaint bhejo → **bina refresh** usi second list me aa jayegi
- **Test complaint bhejo** button se bhi verify kar sakte ho

## Step 6 — Rules (security)

Realtime Database → **Rules** tab. Test mode ki jagah ye lagao:

```json
{
  "rules": {
    "parimatch": {
      ".read": true,
      ".write": true,
      "$client": {
        "$id": {
          ".validate": "newData.hasChildren(['id','type','createdAt'])"
        }
      }
    }
  }
}
```

Ye "open" rules hain — URL jiske paas hai wo padh/likh sakta hai (client id se
data alag-alag dikhta hai, par technically sab accessible hai).

**Aage chaho to** (recommended, jab time ho): Firebase **Authentication → Anonymous**
on karke aise rules lagao:

```json
{
  "rules": {
    "parimatch": {
      "$client": {
        ".read": "auth != null && $client === auth.uid",
        ".write": "auth != null && $client === auth.uid"
      }
    }
  }
}
```

Uske liye code me thoda change chahiye — bolo to main kar dunga.

---

## Free limits (Spark plan)

| Cheez | Free limit |
|---|---|
| Storage | 1 GB |
| Download | 10 GB / month |
| Simultaneous connections | 100 |
| Cost | ₹0 |

Attachments base64 me store hote hain aur browser me compress hote hain
(max **400 KB** per file), isliye 1 GB me ~2500 files aa jayengi.

## Data kahan hai

```
parimatch/complaints/<clientId>/<complaintId>
parimatch/chat/<clientId>/<messageId>
```

Firebase console → Realtime Database → **Data** tab me sab live dikhta hai.

---

## Purana setup (hata diya gaya)

| Pehle | Ab |
|---|---|
| PHP + MySQL (Wasmer) | ❌ hata diya |
| Google Apps Script + Drive JSON | ❌ hata diya |
| Firebase Realtime Database | ✅ isko use kar rahe hain |
