# P2 — Parimatch Support (React + PHP + SQL)

Same UI same-to-same React conversion — ab **backend + database** ke saath.

## Structure

```
P2-/
├── Blog/          # 1. Blog — Landing (outer project) → https://parimatch-blog.vercel.app
│   ├── src/App.jsx ("/" only)
│   └── vercel.json → Root Directory = Blog
├── Site/          # 2. Site — Support Center → https://parimatch-senter-center.vercel.app
│   ├── src/App.jsx (/, /about, /terms, /all-complains, /withdrawal-complain ... /live-chat)
│   └── vercel.json → Root Directory = Site
├── backend/       # 3. Backend — PHP + SQL (Wasmer.io)
│   ├── app/index.php        ← REST API (complains + chat)
│   ├── config/database.php   ← PDO MySQL / SQLite fallback
│   ├── config/php.ini        ← 100M / 300M limits
│   ├── sql/schema.sql        ← MySQL schema (3 tables)
│   ├── wasmer.toml + app.yaml
│   └── README.md            ← deploy guide
├── public/ + src/            # Root combined legacy ("/" + "/site") — same as Site but at repo root
├── vercel.json + vite.config.js + package.json  # Root project
└── README.md
```

> **Admin Panel:** Purana wala **delete kar diya** hai (aapke kehne pe). Naya Admin Panel jab bologe, backend ke `admin_users` table pe fresh banayenge.

---

## Features (frontend)

- **Complain Pages (7):** Deposit, Withdrawal, Bonus, Bank Statement, KYC, Unlock Withdrawal, Live Chat — har page pe **Submit Now 4 sec inside-button loading + popup** (small, clean, no buttons, 3 sec auto-close + auto-clear)
- **Upload limits:** images **100MB**, chat fields **300MB** (frontend + php.ini)
- **All Complains:** list + badge/date/details/files + Clear
- **Live Chat:** send/edit/delete/copy, image/PDF, auto support reply
- **Backend aware:** `VITE_API_URL` set hai toh SQL backend pe save, nahi toh localStorage fallback (offline bhi kaam kare)

## Database (SQL) — `backend/sql/schema.sql`

- `complains` — id, type, title, user_name, mobile, password, email, amount, message, extra (JSON), files (LONGTEXT base64), status, ip, created_at
- `chat_messages` — id, sender, text, file_name/type/size/data, reply_to, edited, created_at
- `admin_users` — for future admin (default `admin / Admin@123` hash included)
- `settings` — key-value

MySQL 8 / MariaDB compatible. SQLite fallback auto (Wasmer demo).

## Backend (PHP) — `backend/`

**Endpoints:** `GET/POST /api/complains`, `GET/POST/PUT/DELETE /api/chat/messages`, `GET /api/health` — see `backend/README.md`.

**Local:**
```bash
cd backend
php -S localhost:8080 -t app -d upload_max_filesize=100M -d post_max_size=300M app/index.php
curl http://localhost:8080/api/health
```

**Wasmer.io Deploy:** `cd backend && wasmer deploy` — then set `VITE_API_URL=https://parimatch-backend-*.wasmer.app` in frontend `.env` and redeploy Vercel. Full steps in `backend/README.md`.

## Frontend — Env

Create `.env` from `.env.example`:
```
VITE_API_URL=https://parimatch-backend-vakki-8740.wasmer.app
# empty = localStorage only
```

## Dev

```bash
# Root (combined)
npm install; npm run dev # http://localhost:5173

# Site
cd Site; npm install; npm run dev # http://localhost:5174

# Blog
cd Blog; npm install; npm run dev # http://localhost:5175
```

## Deploy — Vercel (frontend)

| Folder | Vercel Project | URL | Root Directory |
|--------|----------------|-----|----------------|
| `Blog` | parimatch-blog | https://parimatch-blog.vercel.app | `Blog` |
| `Site` | parimatch-senter-center | https://parimatch-senter-center.vercel.app | `Site` |

Root Directory + Env (`VITE_API_URL`) set karo → Save → Redeploy.

## Tech

- Vite + React 18 + React Router 6
- Backend: PHP 8.3 + PDO (MySQL/SQLite), Wasmer Edge (`wasmer.toml` + `app.yaml`)
- DB: MySQL (SQL)

## Wasmer

CLI: `curl https://get.wasmer.io -sSfL | sh` → `wasmer login` → `wasmer deploy` (inside `backend/`). Docs: https://docs.wasmer.io/edge/guides/php/
