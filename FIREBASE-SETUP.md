# Firebase Firestore setup — 10 minute, ek baar

Ab koi server, Drive, Apps Script ya SQL nahi. Data **Firebase Firestore** me
jata hai — isliye data **turant** (real-time) dikhta hai, bina refresh.

```
Website  ──▶  Firestore  ──(live push)──▶  Website (har tab turant update)
```

---

## Step 1 — Firebase project banao

1. Kholo: **https://console.firebase.google.com**
2. **Add project** → naam do (e.g. `parimatch-support`) → Continue
3. Google Analytics **off** (zarurat nahi) → **Create project**

## Step 2 — Firestore Database on karo

1. Left sidebar **Build** → **Firestore Database**
2. **Create database**
3. Location chuno (`asia-south1` / `asia-southeast1`) → **Next**
4. **Start in test mode** → **Create**

> Bas — koi collection banane ki zarurat nahi. Website pehli complaint bhejegi
> to `complaints` collection apne aap ban jayegi.

## Step 3 — Config copy karo

1. **⚙️ Project settings** (upar left)
2. Neeche **Your apps** → **`</>` (Web)** icon
3. App nickname: `web` → **Register app**
4. Ye block dikhega — **poora copy** karo:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "parimatch-support.firebaseapp.com",
  projectId: "parimatch-support",
  storageBucket: "parimatch-support.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
};
```

> Firestore ke liye `databaseURL` ki zarurat **nahi** hai (wo Realtime Database
> ka hota hai). Sirf `apiKey` + `projectId` chahiye — baaki optional hai.

## Step 4 — App me config daalo

File kholo: **`Site/src/firebase-config.js`**

`firebaseConfig` object me apni values daalo:

```js
export const firebaseConfig = {
  apiKey: 'AIzaSy...',
  authDomain: 'parimatch-support.firebaseapp.com',
  projectId: 'parimatch-support',
  storageBucket: 'parimatch-support.appspot.com',
  messagingSenderId: '1234567890',
  appId: '1:1234567890:web:abcdef',
}
```

Phir commit + push karo → Vercel **Redeploy**.

**Config khaali ho to app crash nahi karta** — bas localStorage mode me chalta
hai (data sirf usi browser me), aur All Complains page pe peela banner dikhta hai.

## Step 5 — Test karo

1. Website kholo → koi complaint submit karo
2. **Firebase console → Firestore Database → Data** → `complaints` collection
   me wo complaint turant dikhegi
3. Doosre tab me **All Complains** kholo → **bina refresh** wahan bhi aa jayegi
4. Live Chat me message bhejo → `messages` collection me turant

Kuch na dikhe to:
- `Firestore Database` create hua ya nahi (Step 2)
- `firebase-config.js` me `apiKey` + `projectId` bhare hain ya nahi
- Rules "test mode" me hain ya nahi

## Step 6 — Rules (security)

Firestore → **Rules** tab. Test mode ki jagah ye lagao:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /complaints/{id} {
      allow read, write: if true;
    }
    match /messages/{id} {
      allow read, write: if true;
    }
  }
}
```

Ye "open" rules hain — URL jiske paas hai wo padh/likh sakta hai. Har browser ka
apna `clientId` hai isliye app me data alag dikhta hai, par technically sab
accessible hai.

**Aage strong karna ho** to Firebase **Authentication → Anonymous** on karke:

```
match /complaints/{id} {
  allow read, write: if request.auth != null
                       && request.resource.data.clientId == request.auth.uid;
}
```

Uske liye code me thoda change chahiye — bolo to kar dunga.

---

## Free limits (Spark plan)

| Cheez | Free limit |
|---|---|
| Storage | 1 GiB |
| Document reads | 50,000 / day |
| Writes | 20,000 / day |
| Deletes | 20,000 / day |
| Cost | ₹0 |

Realtime listeners har change pe sirf badle hue documents padhte hain, isliye
normal use me ye limit bohot zyada hai.

## Data kahan hai (Firestore console)

```
complaints/{id}   → id, clientId, type, title, status, createdAt, updatedAt,
                    details{ userName, mobile, email, amount, message, … },
                    hasPassword, files{ … }

messages/{id}     → id, clientId, sender, text, file, edited, createdAt, updatedAt
```

Firebase console → Firestore Database → **Data** tab me sab live dikhta hai.

## Attachments

Firestore document ka limit **1 MB** hai, isliye:

- Photo browser me compress hoti hai (max 1200 px, JPEG 0.72)
- Ek file max **250 KB**, saari files milakar max **450 KB**
- Store base64 data URL ke roop me hota hai (alag Storage bucket ki zarurat nahi)

Badi file chahiye to Firebase **Storage** alag se on karna padega — bolo to kar denge.
