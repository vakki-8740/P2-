# P2 — Parimatch Support (React + PHP + SQL)

Support portal with a marketing landing page, 7 complaint flows, live chat,
and a **PHP + SQL** backend deployable to **Wasmer.io**.

```
P2-/
├── Blog/          # 1. Landing (outer project)      → parimatch-blog.vercel.app
├── Site/          # 2. Support Center + shared code → parimatch-senter-center.vercel.app
├── backend/       # 3. PHP 8.3 + MySQL/SQLite API   → Wasmer Edge
└── root src/      # 4. Combined local build: "/" landing + "/site" support center
```

> The root project no longer contains a copy of the Site. It imports
> `Site/src/*` with `VITE_BASE_PATH=/site`, so **there is one source of truth**
> for every page, component, style and store.

---

## Live backend (deployed)

| | |
|---|---|
| API | <https://parimatch-backend.wasmer.app> |
| Health | <https://parimatch-backend.wasmer.app/api/health> |
| Dashboard | <https://wasmer.io/apps/vakki-8740/parimatch-backend> |

`GET /api/health` → `{"ok":true,"php":"8.3.4","db":"connected","db_driver":"sqlite", ...}`

> **DB:** plain PDO + SQL — MySQL server ki zarurat nahi. SQLite use hota hai
> (`DB_PATH=/data/app.db`) aur `/data` Wasmer **Volume** hai, isliye redeploy ke
> baad bhi data bacha rehta hai. MySQL sirf optional hai (DEPLOY.md §5).

## Projects

| # | Project | Folder | Dev | Routes |
|---|---------|--------|-----|--------|
| 1 | **Blog / Landing** | `Blog/` | `npm run dev -- --port 5175` | `/` (everything else redirects to `/`) |
| 2 | **Support Center** | `Site/` | `npm run dev -- --port 5174` | `/`, `/about`, `/terms`, `/all-complains`, `/deposit-complain`, `/withdrawal-complain`, `/bonus-complain`, `/bank-statement-complain`, `/unlock-withdrawal-complain`, `/kyc-complain`, `/live-chat` (+ legacy `.html` redirects) |
| 3 | **Backend API** | `backend/` | `composer serve` → `:8080` | `/api/*` — see [`backend/README.md`](backend/README.md) |
| 4 | **Root combined** | `src/` + `public/` | `npm run dev -- --port 5173` | `/` landing + `/site/*` support center |

---

## Features

- **7 complaint forms** — Deposit, Withdrawal, Bonus, Bank Statement, KYC,
  Unlock Withdrawal, Live Chat. Each has a 4-second in-button submitting state
  and a popup that auto-closes after 3 seconds and clears the form.
- **Attachments** — images/PDF/DOC/XLS/TXT/ZIP up to **100 MB per file**
  (300 MB per request). Files are uploaded to the backend and only their
  metadata is stored with the complaint, so lists stay fast.
- **All Complains** — list, status badge, date, details grid, file previews,
  per-complaint delete and "Clear" (own complaints only).
- **Live Chat** — send / edit / delete / copy, attachments with preview,
  auto support reply, clear history.
- **Offline-safe** — every write also lands in `localStorage`; with no
  `VITE_API_URL` the whole app works without a backend (small files only).
- **Privacy** — each browser gets a `client_id`; the API only returns that
  browser's complaints/chat. Complaint passwords are encrypted at rest and
  never sent back to the client (UI shows `••••••••`).

---

## Environment

```bash
# Site/.env  (required for the backend connection)
VITE_API_URL=https://parimatch-backend.wasmer.app
# empty = localStorage only

# root .env (same variable; VITE_BASE_PATH=/site is set in vite.config.js)
VITE_API_URL=https://parimatch-backend.wasmer.app

# Blog/.env (optional)
VITE_SITE_URL=https://parimatch-senter-center.vercel.app
```

No trailing slash on `VITE_API_URL`. Restart the dev server after editing.

---

## Local development

```bash
# backend (creates SQLite automatically, no DB server needed)
cd backend
export APP_KEY=$(openssl rand -hex 32)
composer serve                    # http://localhost:8080/api/health

# support center
cd Site && npm install && npm run dev -- --port 5174

# landing
cd Blog && npm install && npm run dev -- --port 5175

# combined (landing "/" + support center "/site")
npm install && npm run dev        # http://localhost:5173
```

`npm run build` works in the root, `Site/` and `Blog/`.

---

## Backend (PHP + SQL)

Endpoints: `GET /api/health`, `GET|POST /api/complains`,
`GET|DELETE /api/complains/{id}`, `DELETE /api/complains`,
`GET|POST /api/chat/messages`, `PUT|DELETE /api/chat/messages/{id}`,
`DELETE /api/chat/messages`, `POST /api/uploads`, `GET /api/uploads/{id}`.

Database: MySQL 8 / MariaDB (`backend/sql/schema.sql`) with an automatic
SQLite fallback. Tables: `complains`, `chat_messages`, `uploads`,
`admin_users`, `settings`, `rate_limits`.

Full API docs, env vars, security notes and the Wasmer deploy guide live in
[`backend/README.md`](backend/README.md).

---

## Deploy — Vercel (frontend) + Wasmer (backend)

| Folder | Vercel Project | URL | Root Directory | Env |
|--------|----------------|-----|----------------|-----|
| `Blog` | parimatch-blog | https://parimatch-blog.vercel.app | `Blog` | `VITE_SITE_URL` (optional) |
| `Site` | parimatch-senter-center | https://parimatch-senter-center.vercel.app | `Site` | `VITE_API_URL` |
| `backend` | Wasmer Edge | URL printed by `wasmer deploy` | — | DB / keys as Wasmer secrets |

Order: deploy `backend/` to Wasmer → copy its URL into `Site/.env`
(`VITE_API_URL`) → redeploy `Site` on Vercel.
Full settings (root directories, secrets, MySQL, troubleshooting):
[`DEPLOY.md`](DEPLOY.md). Phone se deploy karna ho to
[`DEPLOY-TERMUX.md`](DEPLOY-TERMUX.md). Both `vercel.json` files rewrite
all paths to `/` so client-side routing works on refresh.

---

## Tech

- Vite 5 + React 18 + React Router 6
- PHP 8.3 + PDO (MySQL / SQLite), Wasmer Edge (`wasmer.toml`, `app.yaml`)
- Storage: MySQL `utf8mb4`, files on disk or `uploads` blob fallback

---

## Not built yet

**Admin Panel** — removed on request and intentionally not recreated. The
backend already ships the `admin_users` table plus `X-Admin-Token` /
`?scope=all` access, ready for the new panel when you ask for it.
