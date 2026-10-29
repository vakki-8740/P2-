# Parimatch Backend — PHP + SQL (Wasmer.io)

Backend for Parimatch Support Center — **PHP 8.3** + **SQL (MySQL/SQLite)**.  
Frontend (Blog + Site) isse `VITE_API_URL` se connect hota hai.  
Wasmer.io pe deploy karne ke liye ready — `wasmer.toml` + `app.yaml` included.

---

## Folder

```
backend/
  app/
    index.php         ← main router (all API)
  config/
    database.php      ← PDO (MySQL primary, SQLite fallback)
    php.ini           ← upload 100M / 300M, memory 512M
  sql/
    schema.sql        ← MySQL schema (3 tables)
  wasmer.toml         ← Wasmer package manifest
  app.yaml            ← Wasmer Edge app config
  composer.json
  .env.example
```

---

## Database (SQL)

Use **MySQL** — tables:
- `complains` — all 7 complain types (Deposit, Withdrawal, Bonus, Bank Statement, KYC, Unlock Withdrawal, Live Chat)
- `chat_messages` — user ↔ support chat
- `admin_users` — for future Admin Panel (abhi use nahi, aap dobara banayenge)
- `settings` — key-value

Import:
```bash
mysql -h HOST -u USER -p DB_NAME < sql/schema.sql
# or for local SQLite: auto-created at /tmp/parimatch_app.db on first request
```

Default admin (for future): `admin / Admin@123` — hash already in schema.

---

## API Endpoints

All JSON, CORS open.

| Method | Path | Kaam |
|--------|------|------|
| GET | `/api/health` | health + DB check |
| GET | `/api/complains?limit=200&type=Deposit` | list complains |
| POST | `/api/complains` | create complain (body: `{id, type, title, details:{userName,mobile...}, files:{...}}`) |
| GET | `/api/complains/:id` | single |
| DELETE | `/api/complains/:id` | delete one |
| DELETE | `/api/complains` | clear all |
| GET | `/api/chat/messages` | list chat |
| POST | `/api/chat/messages` | send message |
| PUT | `/api/chat/messages/:id` | edit |
| DELETE | `/api/chat/messages/:id` | delete one |
| DELETE | `/api/chat/messages` | clear all |

Example POST complain:
```bash
curl -X POST https://your-backend.wasmer.app/api/complains \
  -H "Content-Type: application/json" \
  -d '{"type":"Deposit","title":"Deposit Complain","details":{"userName":"Amit","mobile":"9999999999","email":"a@test.com","depositAmount":"5000"},"files":{}}'
```

---

## Local Run (without Wasmer)

```bash
cd backend
php -S localhost:8080 -t app -d upload_max_filesize=100M -d post_max_size=300M app/index.php
# test
curl http://localhost:8080/api/health
```

No PHP? Use SQLite fallback — no DB setup needed.

---

## Wasmer.io Deploy

1. **Install Wasmer CLI**
   https://docs.wasmer.io/install
   ```bash
   curl https://get.wasmer.io -sSfL | sh
   wasmer login
   ```

2. **Set DB (optional — MySQL)**
   For production, create MySQL on Railway / PlanetScale / FreeSQL:
   ```bash
   wasmer secret create DB_HOST --value=your-mysql-host
   wasmer secret create DB_NAME --value=parimatch_support
   wasmer secret create DB_USER --value=your_user
   wasmer secret create DB_PASS --value=your_pass
   ```
   If you skip, it uses SQLite at `/tmp/parimatch_app.db` (ephemeral — OK for demo).

   Import schema to MySQL:
   ```bash
   mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME < sql/schema.sql
   ```

3. **Deploy**
   ```bash
   cd backend
   wasmer deploy
   # choose owner: vakki-8740, name: parimatch-backend
   # → https://parimatch-backend-vakki-8740.wasmer.app
   ```

   Update frontend ENV:
   ```
   VITE_API_URL=https://parimatch-backend-vakki-8740.wasmer.app
   ```
   Set in `Site/.env`, `Blog/.env`, and root `.env`, then redeploy frontend to Vercel.

4. **Test**
   ```bash
   curl https://parimatch-backend-vakki-8740.wasmer.app/api/health
   ```

Docs: https://docs.wasmer.io/edge/guides/php/

---

## Frontend Connect

Already done:
- `src/utils/api.js` + `Site/src/utils/api.js` — checks `VITE_API_URL`
- `complainStore.js` + `chatStore.js` — try backend first, fallback to localStorage (offline works)
- `AllComplains.jsx` + `ChatPage.jsx` — async fetch via `getComplainsAsync()` etc.

If `VITE_API_URL` empty, app still works with localStorage (no breaking).

---

## Limits

- Images: **100MB** max (php.ini `upload_max_filesize=100M`, check in `complainStore.js`)
- Chat fields: **300MB** max (`post_max_size=300M`)
- Backend stores `files` as LONGTEXT JSON base64 — for production, consider S3/R2 for large files.

---

## Admin Panel

Aapne bola tha purana Admin delete karo — **kar diya** (Admin/ + ADMIN_CREDENTIALS.md removed in this commit).  
Naya Admin Panel aap jab bolo, tab dobara fresh banayenge — is backend ke `admin_users` table pe based hoga.

---

## License

MIT — vakki-8740/P2-
