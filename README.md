# P2 — Parimatch Support (React frontend)

Support portal: marketing landing page + support center with 7 complaint flows
and live chat. **No server, no database** — the app is a pure static frontend.

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

## Data storage — Google Drive (Apps Script web app)

Sara data browser se seedha **Google Drive** me jayega, ek **Google Apps Script
web app** ke through. Koi PHP / Wasmer / MySQL / SQLite nahi.

```
Browser (Site)  ──fetch──▶  Apps Script Web App  ──▶  Drive file (JSON) / Sheet
```

| | |
|---|---|
| Backend code | [`apps-script/Code.gs`](apps-script/Code.gs) — ready, tested |
| Setup guide | [`apps-script/README.md`](apps-script/README.md) |
| Endpoint | `VITE_API_URL` (Apps Script `/exec` URL) |
| Abhi | `VITE_API_URL` khaali hai → app **localStorage-only** mode me chalta hai |

Setup: `script.new` → Code.gs paste → Deploy as Web app (Anyone) → `/exec` URL
→ Vercel me `VITE_API_URL` → Redeploy.

> Apps Script CORS preflight ka jawab nahi deta, isliye `Site/src/utils/api.js`
> sab writes `POST` + `Content-Type: text/plain` me bhejta hai (method body ke
> andar). Reads `GET ?path=…&client_id=…` se hote hain.

---

## Data check page (test ke liye)

`check/index.html` — ek chhota single-file page (koi build nahi). Vercel pe
**Root Directory = `check`** se deploy karo.

- Apps Script `/exec` URL + `ADMIN_PASSWORD` daalo → **Data check karo**
- Dikhata hai: connected hai ya nahi, kitni complaints hain, naam ki list, raw JSON
- **Test complaint bhejo** button se ek sample complaint Drive me daal ke verify kar sakte ho

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

```bash
# Site/.env  (optional — khaali chhodo to localStorage-only mode)
VITE_API_URL=
# VITE_API_URL=https://script.google.com/macros/s/XXXXXXXX/exec

# root .env (same variable; VITE_BASE_PATH=/site is set in vite.config.js)
VITE_API_URL=

# Blog/.env (optional)
VITE_SITE_URL=https://parimatch-senter-center.vercel.app
```

No trailing slash on `VITE_API_URL`. Env change ke baad **redeploy** (Vite env
build-time hota hai).

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
| `Site` | parimatch-senter-center | https://parimatch-senter-center.vercel.app | `Site` | `VITE_API_URL` (Apps Script URL) |

Dono `vercel.json` saare paths `/` pe rewrite karte hain, isliye refresh pe
client-side routing kaam karta hai.

---

## Tech

- Vite 5 + React 18 + React Router 6
- State/storage: `localStorage` (+ optional Apps Script → Google Drive)
- Styling: plain CSS modules/`*.css` per page

---

## Not built yet

**Admin Panel** — intentionally not recreated. Jab chaho, Apps Script side pe
admin listing bana ke jod sakte hain.
