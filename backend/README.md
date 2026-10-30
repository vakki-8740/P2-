# Parimatch Backend — PHP + SQL (Wasmer.io)

REST API for the Parimatch Support Center. **PHP 8.3 + PDO** with **MySQL**
(production) and an automatic **SQLite** fallback (local dev / Wasmer demo).
Deployable to Wasmer Edge with the included `wasmer.toml` + `app.yaml`.

```
backend/
├── app/
│   ├── index.php          ← router + endpoints
│   └── helpers.php        ← crypto, uploads, validation, rate limit, normalisers
├── config/
│   ├── config.php         ← env, limits, CORS
│   ├── database.php       ← PDO + automatic schema creation
│   └── php.ini            ← 100 MB upload / 300 MB request
├── sql/schema.sql         ← MySQL schema (optional manual import)
├── wasmer.toml            ← Wasmer package
├── app.yaml               ← Wasmer Edge app config
├── composer.json
└── .env.example
```

---

## Quick start (local, no database server needed)

```bash
cd backend
export APP_KEY=$(openssl rand -hex 32)      # keeps encrypted passwords readable
export ADMIN_API_TOKEN=$(openssl rand -hex 24)   # optional, enables admin scope
composer serve                              # or the php -S line below
# php -S 0.0.0.0:8080 -t app -d upload_max_filesize=100M -d post_max_size=300M -d memory_limit=512M app/index.php

curl http://localhost:8080/api/health
```

Without `DB_*` variables the API creates a SQLite database automatically
(`backend/data/app.db`, or `/tmp/parimatch_app.db` on Wasmer).

Then point the frontend at it:

```
# Site/.env  (and root .env if you use the combined project)
VITE_API_URL=http://localhost:8080
```

Restart the dev server after changing `.env`.

---

## Endpoints

Every response is JSON: `{ "ok": true, "data": ... }` or
`{ "ok": false, "error": "message" }`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | version, PHP, DB driver, storage + limits |
| GET | `/api/complains?limit=200&type=&status=&scope=mine` | own complaints (newest first) |
| POST | `/api/complains` | create a complaint |
| GET | `/api/complains/{id}` | one complaint (owner only) |
| DELETE | `/api/complains/{id}` | delete one complaint + its files |
| DELETE | `/api/complains` | clear **own** complaints |
| GET | `/api/chat/messages?limit=200&scope=mine` | chat history |
| POST | `/api/chat/messages` | send a message / attachment |
| PUT | `/api/chat/messages/{id}` | edit message text |
| DELETE | `/api/chat/messages/{id}` | delete one message |
| DELETE | `/api/chat/messages` | clear **own** chat |
| POST | `/api/uploads` | multipart upload (field `file`) → `{id,name,type,size,url}` |
| GET | `/api/uploads/{id}?k={token}` | raw file (inline for images/PDF) |

### Identity — `X-Client-Id`

The frontend generates a random id per browser and sends it on every request
(`X-Client-Id: <uuid>`). Complaints and chat messages are **scoped to that id**,
so one visitor can never read or delete another visitor's data, and clearing
the list only clears your own rows.

Admin/agent access (used later by the Admin Panel) requires the
`X-Admin-Token` header matching `ADMIN_API_TOKEN`; `?scope=all` is only
available with that token.

### Create a complaint

```bash
curl -X POST http://localhost:8080/api/complains \
  -H "Content-Type: application/json" \
  -H "X-Client-Id: 6f1c2f2e-6b7a-4c3f-9a51-2b7d1e8f0a11" \
  -d '{
    "type": "Deposit",
    "title": "Deposit Complain",
    "details": {
      "userName": "Amit",
      "mobile": "9999999999",
      "password": "my-login-password",
      "email": "a@test.com",
      "depositAmount": "5000"
    },
    "files": { "paymentImage": { "id": "UPLOAD_ID" } }
  }'
```

Response (201):

```json
{
  "ok": true,
  "id": "9f2c1a...",
  "data": {
    "id": "9f2c1a...",
    "type": "Deposit",
    "title": "Deposit Complain",
    "status": "pending",
    "createdAt": "2026-10-30 11:24:02",
    "details": { "userName": "Amit", "mobile": "9999999999", "email": "a@test.com", "amount": "5000" },
    "hasPassword": true,
    "files": { "paymentImage": { "name": "proof.png", "type": "image/png", "size": 84213, "url": "/api/uploads/ab12...?k=..." } }
  }
}
```

### Upload a file

```bash
curl -X POST http://localhost:8080/api/uploads \
  -H "X-Client-Id: 6f1c2f2e-6b7a-4c3f-9a51-2b7d1e8f0a11" \
  -F "file=@proof.png"
# → {"ok":true,"data":{"id":"ab12...","name":"proof.png","type":"image/png","size":84213,"url":"/api/uploads/ab12...?k=..."}}
```

Files are stored on disk when a writable folder exists, otherwise in the
`uploads` table (Wasmer Edge fallback). Complaints/chat store only the
metadata + URL — never base64 blobs — so lists stay fast and MySQL packet
limits are never hit. Max: **100 MB** per file, **300 MB** per request,
types: images, PDF, Word/Excel, txt, zip.

---

## Database

### MySQL (recommended for production)

```bash
mysql -h HOST -u USER -p DB_NAME < sql/schema.sql   # optional: tables are auto-created
```

Tables: `complains`, `chat_messages`, `uploads`, `admin_users`, `settings`,
`rate_limits`. Charset `utf8mb4`.

The schema is created automatically on the first request for **both** MySQL
and SQLite, so a fresh database works out of the box.

### SQLite (fallback)

Created automatically, no setup. Data lives at `DB_PATH`
(`/tmp/parimatch_app.db` on Wasmer) — ephemeral, good for demos only.

---

## Security notes

- **Passwords** entered in complaint forms are encrypted at rest with
  AES-256-GCM (`APP_KEY`, or a generated key stored in `settings`) and are
  **never returned** by the API. The UI only shows `hasPassword`.
- **Per-browser scoping** (`X-Client-Id`) replaces the old "everyone can read
  and delete everything" behaviour.
- **CORS** is configurable (`CORS_ORIGINS`); `*` (public read of your own data)
  is the default, set an explicit list once the Vercel URLs are final.
- **Rate limits** per IP: 30 complaints/min, 60 uploads/min, 120 chat
  messages/min.
- Uploads are validated by MIME + extension, renamed, and served with
  `X-Content-Type-Options: nosniff` and a private token.
- `admin_users` holds the future Admin Panel login (default `admin` /
  `Admin@123` — **change it before production**).

---

## Upgrading an existing database (v0.2 → v1.1)

New installs need nothing — the schema is created automatically. If you
already imported the old `schema.sql`, run this once:

```sql
ALTER TABLE complains     ADD COLUMN client_id VARCHAR(64) NOT NULL DEFAULT '';
ALTER TABLE chat_messages ADD COLUMN client_id VARCHAR(64) NOT NULL DEFAULT '';
ALTER TABLE chat_messages ADD COLUMN file_json LONGTEXT DEFAULT NULL;
ALTER TABLE chat_messages DROP COLUMN file_data;   -- old base64 blobs (optional)
CREATE INDEX idx_complains_client ON complains (client_id);
CREATE INDEX idx_chat_client ON chat_messages (client_id);
-- uploads + rate_limits tables are created automatically on the next request
```

Old complains get an empty `client_id`, so they are not shown to visitors
anymore — read them with the admin token (`?scope=all`).

---

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `DB_HOST` / `DB_NAME` / `DB_USER` / `DB_PASS` / `DB_PORT` | empty / 3306 | MySQL connection. Empty → SQLite |
| `DB_PATH` | auto | SQLite file path |
| `UPLOAD_DIR` | `backend/data/uploads`, `/tmp/parimatch_uploads` on Wasmer | file storage |
| `MAX_UPLOAD_MB` | `100` | per-file limit |
| `MAX_REQUEST_MB` | `300` | request body limit |
| `CORS_ORIGINS` | `*` | comma separated origins, `*.vercel.app` allowed |
| `ADMIN_API_TOKEN` | empty | enables `scope=all` + admin replies (future admin panel) |
| `APP_KEY` | generated | key for encrypting complaint passwords |

---

## Deploy to Wasmer Edge

```bash
curl https://get.wasmer.io -sSfL | sh
wasmer login
cd backend

# production database (optional — else SQLite in /tmp)
wasmer app secrets create DB_HOST "your-mysql-host"
wasmer app secrets create DB_NAME "parimatch_support"
wasmer app secrets create DB_USER "your_user"
wasmer app secrets create DB_PASS "your_pass"
wasmer app secrets create APP_KEY "$(openssl rand -hex 32)"
wasmer app secrets create ADMIN_API_TOKEN "$(openssl rand -hex 24)"

wasmer deploy
# → copy the URL it prints, then check: <URL>/api/health
```

Then set `VITE_API_URL` in `Site/.env` (and the root `.env`), redeploy the
frontend to Vercel, and reload the site.

Step-by-step deploy checklist (with Vercel settings): [`../DEPLOY.md`](../DEPLOY.md).
Wasmer PHP guide: https://docs.wasmer.io/edge/guides/php/

---

## Limits

| Item | Limit |
|------|-------|
| Image / file upload | 100 MB (`upload_max_filesize`, `MAX_UPLOAD_MB`) |
| Request body | 300 MB (`post_max_size`) |
| Complaints per page | 500 max (`limit`) |
| Chat messages per page | 500 max (`limit`) |
| Rate limit | 30 complaints / 60 uploads / 120 chat messages per minute per IP |

---

## Admin Panel

Not built yet, as requested. The `admin_users` table and the
`X-Admin-Token` / `?scope=all` API access are ready for the new panel.
