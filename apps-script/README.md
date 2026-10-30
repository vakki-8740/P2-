# Google Drive backend (Apps Script) — setup

`Code.gs` = poora backend. Koi server nahi, koi database nahi.
Data seedha **Google Drive** me JSON files me jaata hai.

```
Drive/
├── PariMatch-Data/
│   ├── complains.json     ← saari complaints
│   ├── chat.json          ← live chat
│   └── uploads.json       ← attachments ka index
└── PariMatch-Uploads/     ← asli files (images / PDF / …)
```

---

## 1. Script banao (2 min)

1. Browser me kholo: **https://script.new**
2. Left me jo `function myFunction() {}` likha hai — **sab delete** karo
3. `Code.gs` ka poora content copy karke paste karo
4. **Ctrl/Cmd + S** — save

## 2. Admin access — 3 tarike (koi ek chuno)

Admin page (saari complaints ki list) ke liye token chahiye. Sabse aasan pehla hai.

### (A) File ki pehli line me password likh do — sabse aasan ⭐

`Code.gs` **khulte hi sabse upar** (line 5) ye dikhega:

```js
var ADMIN_PASSWORD = '';      // <-- jaise: var ADMIN_PASSWORD = 'vakeem8740';
```

Quotes ke andar apna password likh do — **`<` `>` mat lagao**:

```js
var ADMIN_PASSWORD = 'vakeem8740';
```

Phir **Ctrl+S** → **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**.

> ⚠️ Bahut zaroori: file ke top wala `/* … */` block **comment** hota hai — usme
> kuch likhne se koi asar nahi padta. Sirf `var ADMIN_PASSWORD = '...'` wali
> asli code line kaam karti hai.

### (B) Script Properties se (code chhedna nahi padta)

Editor ke **left sidebar me sabse neeche ⚙️ gear icon** → **Project Settings** →
neeche scroll → **Script Properties** → **Add script property**:

| Property | Value |
|---|---|
| `ADMIN_API_TOKEN` | `mera-password-123` |

Phir wahi: **Deploy → Manage deployments → Edit → New version → Deploy**
(property akela kaafi nahi — naya version deploy karna padta hai).

### (C) Token hi nahi chahiye

`CONFIG` me `ALLOW_PUBLIC_LIST: true` kar do → admin page bina token ke saari
complaints dikha dega. ⚠️ URL jiske paas hai wo sab padh lega.

## 3. Deploy karo (web app)

1. Top-right **Deploy** → **New deployment**
2. Gear ⚙️ → **Web app**
3. Settings:

| Field | Value |
|---|---|
| Description | `parimatch drive api` |
| **Execute as** | **Me (your-email)** |
| **Who has access** | **Anyone** |

> "Anyone" = login ke bina bhi frontend call kar sake. Iska matlab URL jiske paas hai
> wo data likh/padh sakta hai — isliye URL ko public repo me na daalo.

4. **Deploy** → **Authorize access** → apna Google account → *Advanced* →
   *Go to project (unsafe)* → **Allow**
   (Ye warning normal hai, script khud likha hua hai.)
5. Jo **Web app URL** mile (`https://script.google.com/macros/s/AKfy…/exec`) — copy karo

## 4. Test karo (browser me)

```
https://script.google.com/macros/s/XXXX/exec?path=/api/health
```

Aisa JSON aana chahiye:

```json
{"ok":true,"service":"parimatch-support-drive","version":"2.0.0-drive",
 "storage":"google-drive","db_driver":"drive-json","db_persistent":true, ...}
```

Pehli call pe Drive me dono folders khud ban jayenge.

## 5. Frontend se jodo

Vercel → project (**Site**, aur root wala bhi use karte ho to wahan) →
**Settings → Environment Variables**:

```
VITE_API_URL = https://script.google.com/macros/s/XXXX/exec
```

→ **Deployments → Redeploy** (Vite env build-time hota hai).

Local test ke liye `Site/.env`:

```bash
VITE_API_URL=https://script.google.com/macros/s/XXXX/exec
```

Ab Site pe complaint submit karo → Drive → `PariMatch-Data/complains.json` me dikhega.

---

## Frontend isse kaise baat karta hai

Apps Script CORS **preflight (OPTIONS)** ka jawab nahi de sakta, isliye
`Site/src/utils/api.js` ye pattern use karta hai:

| Kaam | Request |
|---|---|
| Read | `GET  <exec>?path=/api/complains&limit=200&client_id=…` |
| Create / update / delete | `POST <exec>` body `{path, method, clientId, adminToken, body}` with `Content-Type: text/plain` |

`text/plain` = "simple request" → browser preflight nahi bhejta.
PUT/DELETE bhi isi POST ke andar `method` se chalte hain.

---

## API endpoints (Code.gs me implement)

| Method | Path | Kaam |
|---|---|---|
| GET | `/api/health` | status + counts |
| GET | `/api/complains?limit=&scope=mine\|all&type=&status=` | list (`all` ke liye admin token) |
| POST | `/api/complains` | create (client apna `id` bhejta hai) |
| GET | `/api/complains/{id}` | ek complaint |
| DELETE | `/api/complains/{id}` | delete |
| DELETE | `/api/complains` | apni saari clear |
| GET/POST | `/api/chat/messages` | chat list / naya message |
| PUT | `/api/chat/messages/{id}` | edit |
| DELETE | `/api/chat/messages/{id}` | delete |
| DELETE | `/api/chat/messages` | chat clear |
| POST | `/api/uploads` | base64 file → Drive file, `{id,name,type,size,url}` |
| GET | `/api/uploads/{id}` | upload metadata |

---

## Limits / dhyan rakhne wali baatein

| Cheez | Value |
|---|---|
| File size (Drive mode) | **~15 MB** per file (`MAX_DRIVE_UPLOAD_BYTES`) — base64 +33% bada hota hai |
| Apps Script POST body | ~50 MB hard limit |
| Script runtime | 6 min per call (bahut bada file upload fail ho sakta hai) |
| Trigger quota | free account: ~20k URL fetch / day — normal support portal ke liye kaafi |
| Concurrency | `LockService` se writes serialised hain (do tabs ek saath likhne pe bhi safe) |
| Privacy | har browser ka `client_id`; API sirf usi ke records deta hai. Password ka sirf **SHA-256 hash** store hota hai, plain nahi |

## Maintenance (editor se manually chalao)

| Function | Kaam |
|---|---|
| `backupData()` | `-YYYYMMDD-HHmmss.json` naam se Drive me backup copies |
| `resetAllData()` | complaints/chat/uploads index khaali (⚠️ undo nahi) |

## Update karne ka tarika

Code.gs me change karne ke baad:
**Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**
(URL wahi rehta hai, isliye frontend me kuch badalna nahi padta.)
