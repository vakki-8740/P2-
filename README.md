# P2 — Parimatch Support (React frontend)

Support portal: marketing landing page + support center with 7 complaint flows
and live chat. **No server** — data goes straight from the browser to
**Firebase Firestore**, so everything is live (no refresh, no polling).

```
P2-/
├── Blog/          # 1. Landing (outer project)      → parimatch-blog.vercel.app
├── Site/          # 2. Support Center + shared code → parimatch-senter-center.vercel.app
└── root src/      # 3. Combined local build: "/" landing + "/site" support center
```

> The root project has no copy of the Site. It imports `Site/src/*` with
> `VITE_BASE_PATH=/site`, so **there is one source of truth** for every page,
> component, style and store.

---

## Data storage — Firebase Firestore

Browser seedha Firestore se baat karta hai. Koi server, Drive, Apps Script,
PHP ya MySQL nahi. Isliye data **turant** aata hai (`onSnapshot` push, <1 s).

```
Site (React)  ──▶  Firestore  ──onSnapshot (live)──▶  Site + check page
```

| | |
|---|---|
| Collections | `complaints`, `messages` (har doc me `clientId`) |
| Config file | [`Site/src/firebase-config.js`](Site/src/firebase-config.js) ← apni values paste karo |
| Setup guide | [`FIREBASE-SETUP.md`](FIREBASE-SETUP.md) |
| Config khaali ho to | app **localStorage mode** me chalta hai (crash nahi) |
| Free plan | Spark: 1 GiB storage, 50k reads/day, 20k writes/day, ₹0 |

```js
complaints/{id} → { id, clientId, type, title, status, createdAt, updatedAt,
                    details, hasPassword, files }
messages/{id}   → { id, clientId, sender, text, file, edited, createdAt, updatedAt }
```

Har browser ka apna `parimatch_client_id` (localStorage) hota hai, isliye
complaints usi browser me dikhti hain jahan se bheji gayi.

> Pehle Drive + Apps Script tha, usse pehle PHP/Wasmer + MySQL — sab **hata diya**.

---

## Data check page (test ke liye)

`check/index.html` — ek chhota single-file page (koi build nahi). Vercel pe
**Root Directory = `check`** se deploy karo.

- Wahi `firebaseConfig` block paste karo → **Connect** (ek hi baar, browser yaad rakhta hai)
- 🟢 **LIVE** badge, total complaints, naam ki list, raw JSON — sab **real-time**
- Website se complaint bhejo → bina refresh usi second yahan dikhegi
- **Test complaint bhejo** button se write bhi verify ho jata hai

Details: [`check/README.md`](check/README.md)

## Projects

| # | Project | Folder | Dev | Routes |
|---|---------|--------|-----|--------|
| 1 | **Blog / Landing** | `Blog/` | `npm run dev -- --port 5175` | `/` (everything else redirects to `/`) |
| 2 | **Support Center** | `Site/` | `npm run dev -- --port 5174` | `/`, `/about`, `/terms`, `/all-complains`, `/deposit-complain`, `/withdrawal-complain`, `/bonus-complain`, `/bank-statement-complain`, `/unlock-withdrawal-complain`, `/kyc-complain`, `/live-chat` (+ legacy `.html` redirects) |
| 3 | **Root combined** | `src/` + `public/` | `npm run dev -- --port 5173` | `/` landing + `/site/*` support center |

---

## Features

- **7 complaint forms** — Deposit, Withdrawal, Bonus, Bank Statement, KYC,
  Unlock Withdrawal, Live Chat. 4-second in-button submitting state, popup
  auto-closes after 3 seconds and clears the form.
- **Attachments** — images/PDF/DOC/XLS/TXT/ZIP (client-side limits, see
  `Site/src/utils/api.js`).
- **All Complains** — list, status badge, date, details grid, file previews,
  per-complaint delete and "Clear".
- **Live Chat** — send / edit / delete / copy, attachments with preview,
  auto support reply, clear history.
- **Offline-safe** — sab kuch `localStorage` me bhi save hota hai, isliye
  network fail ho to bhi UI chalta rehta hai.
- **Privacy** — har browser ka apna `client_id`; complaint passwords client pe
  kabhi wapas nahi aate (`••••••••`).

---

## Environment

**Firebase config env se nahi aata** — `Site/src/firebase-config.js` file me
paste hota hai (dekho [`FIREBASE-SETUP.md`](FIREBASE-SETUP.md)).

```bash
# Blog/.env (optional — landing se support center ka link)
VITE_SITE_URL=https://parimatch-senter-center.vercel.app
```

Config ya env change ke baad **redeploy** karo (values build ke time bake hoti hain).

---

## Local development

```bash
# support center
cd Site && npm install && npm run dev -- --port 5174

# landing
cd Blog && npm install && npm run dev -- --port 5175

# combined (landing "/" + support center "/site")
npm install && npm run dev        # http://localhost:5173
```

`npm run build` works in the root, `Site/` and `Blog/`.

---

## Deploy — Vercel

| Folder | Vercel Project | URL | Root Directory | Env |
|--------|----------------|-----|----------------|-----|
| `Blog` | parimatch-blog | https://parimatch-blog.vercel.app | `Blog` | `VITE_SITE_URL` (optional) |
| `Site` | parimatch-senter-center | https://parimatch-senter-center.vercel.app | `Site` | `Site/src/firebase-config.js` (env nahi) |

Dono `vercel.json` saare paths `/` pe rewrite karte hain, isliye refresh pe
client-side routing kaam karta hai.

---

## Tech

- Vite 5 + React 18 + React Router 6
- Storage: Firebase **Firestore** (+ localStorage fallback)
- Styling: plain CSS modules/`*.css` per page

---

## Not built yet

**Admin Panel** — intentionally not recreated. Jab chaho, naya fresh panel
banayenge (Firebase data padh ke).
