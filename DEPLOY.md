# Deploy Guide — Wasmer (backend) + Vercel (frontend)

Sab kuch ready hai. Do deployments hain: **backend → Wasmer Edge**, aur
**frontend → Vercel** (Site + Blog). Neeche exact settings di hain.

---

## 0. Order (isko follow karo)

1. **MySQL database** banao (Railway / Aiven / Filsh / apna hosting)
2. **Backend Wasmer pe deploy** karo → URL milega
3. Us URL ko **Vercel** me `VITE_API_URL` me daalo → **Site redeploy**
4. `https://your-site.vercel.app/all-complains` pe test karo

> ⚠️ Step 1 skip mat karo. Wasmer pe SQLite `/tmp` me banti hai jo
> **har redeploy/restart pe udd jati hai** (data loss). Production ke liye
> MySQL zaroori hai.

---

## 1. Backend — Wasmer Edge

### Root directory (ye sabse important)

| Setting | Value |
|---|---|
| **Deploy folder / Root directory** | `backend` |
| Folder me ye files honi chahiye | `wasmer.toml`, `app.yaml`, `app/`, `config/`, `sql/` |
| Deploy command | `wasmer deploy` — **`backend/` ke andar se chalao** |
| Package name (fixed) | `vakki-8740/parimatch-backend` |
| App name / owner (fixed) | `parimatch-backend` / `vakki-8740` |
| Internal port | `8080` (code already bind karta hai `0.0.0.0:8080`) |

Agar aap CLI ki jagah GitHub integration use karte ho, to **"App directory /
working directory" = `backend`** set karna (monorepo root nahi).

### Commands

```bash
# CLI install (ek baar)
curl https://get.wasmer.io -sSfL | sh

# login (browser khulega)
wasmer login

cd backend            # <-- root directory
wasmer deploy         # pooche to owner=vakki-8740, app=parimatch-backend
```

Success pe aisa output aayega:

```
App parimatch-backend (vakki-8740) was successfully deployed 🚀
https://parimatch-backend-vakki-8740.wasmer.app      <-- YAHI URL copy karo
```

Wasmer URL ka rule: `https://<app-name>.wasmer.app` agar free hai, warna
`https://<app-name>-<app-owner>.wasmer.app`.
**Jo URL CLI print kare, wahi final hai** — usko frontend me daalna hai.

### Secrets (DB + keys) — deploy se pehle ya baad me, dono chalega

```bash
cd backend
wasmer secret create DB_HOST --value=your-mysql-host
wasmer secret create DB_NAME --value=parimatch_support
wasmer secret create DB_USER --value=your_user
wasmer secret create DB_PASS --value=your_password
wasmer secret create APP_KEY  --value=$(openssl rand -hex 32)      # passwords encrypt karne ke liye
wasmer secret create ADMIN_API_TOKEN --value=$(openssl rand -hex 24) # future admin panel
```

Secret banane ke baad app ko ek baar restart/redeploy karna:
```bash
wasmer deploy
```

> Secrets `app.yaml` se override nahi hote kyunki humne wahan `DB_*` / `APP_KEY`
> deliberately nahi rakhe. `app.yaml` me sirf non-secret defaults hain.

### MySQL tables

Backend **pehli request pe khud tables bana leta hai** (`complains`,
`chat_messages`, `uploads`, `admin_users`, `settings`, `rate_limits`).
Manual import chahiye to:

```bash
mysql -h HOST -u USER -p DB_NAME < backend/sql/schema.sql
```

### Deploy ke baad verify (30 second)

```bash
curl https://<your-app>.wasmer.app/api/health
```

Expected:
```json
{"ok":true,"service":"parimatch-support-backend","version":"1.1.0",
 "db":"connected","db_driver":"mysql","storage":"writable", ...}
```

- `db` = `connected` → MySQL chal raha hai ✅
- `db_driver` = `sqlite` → secrets set nahi hue, data temporary hai ⚠️
- `storage` = `writable` → uploads kaam karenge ✅

Phir ek complaint test:
```bash
curl -X POST https://<your-app>.wasmer.app/api/complains \
  -H "Content-Type: application/json" \
  -H "X-Client-Id: 11111111-2222-3333-4444-555555555555" \
  -d '{"type":"Deposit","details":{"userName":"Test","mobile":"9999999999","email":"t@t.com","depositAmount":"100"}}'
```

Same header ke saath list:
```bash
curl "https://<your-app>.wasmer.app/api/complains?limit=5" \
  -H "X-Client-Id: 11111111-2222-3333-4444-555555555555"
```

### Wasmer limits / dhyan dene wali baat

- **App scale-to-zero** karta hai → pehli request thodi slow (cold start), normal hai.
- `/tmp` ephemeral hai → SQLite only demo. MySQL use karo.
- Upload limit PHP me 100 MB hai, lekin Edge ka apna request-size limit ho sakta hai.
  Bade files fail ho rahe ho to secrets me `MAX_UPLOAD_MB` chhota kar do (e.g. `25`).
- File storage `/tmp/parimatch_uploads` pe hai → instance recycle pe files ja sakti hain.
  Permanent chahiye to `UPLOAD_DIR` kisi volume pe set karo ya S3/R2 pe shift karenge.

---

## 2. Frontend — Vercel

Do alag projects (monorepo se do apps):

| | Site (Support Center) | Blog (Landing) |
|---|---|---|
| **Root Directory** | `Site` | `Blog` |
| Framework Preset | Vite | Vite |
| Build Command | `npm run build` | `npm run build` |
| Output Directory | `dist` | `dist` |
| Install Command | `npm install` | `npm install` |
| Env variable | `VITE_API_URL` = Wasmer URL | `VITE_SITE_URL` (optional) |
| Domain | parimatch-senter-center.vercel.app | parimatch-blog.vercel.app |

### Env variable (Site)

Vercel → Project → **Settings → Environment Variables**:

```
VITE_API_URL = https://parimatch-backend-vakki-8740.wasmer.app
```

Rules:
- **No trailing slash** (`/` hata do).
- Production + Preview dono pe set karo.
- Vite isko **build time pe inline** karta hai → env add karne ke baad
  **Redeploy** karna zaroori hai (sirf save se kaam nahi chalega).
- `vercel.json` already SPA rewrites handle karta hai (`/about`, `/live-chat`
  refresh pe bhi khulenge), kuch chhedna nahi hai.

### Root project (combined) deploy nahi karna

Repo root pe landing + `/site` dono chalta hai local ke liye. Vercel pe sirf
`Site` aur `Blog` deploy karo — root ko `Root Directory` me mat chuno.

---

## 3. Deploy ke baad final checklist

- [ ] `GET /api/health` → `"db":"connected"`, `"db_driver":"mysql"`
- [ ] Site khulta hai (loading animation ke baad home page)
- [ ] Ek complain submit → success popup → **All Complains** me details + image dikh rahi hai
- [ ] Live Chat me message + image bhej ke reload karo → message persist hai
- [ ] Clear button sirf usi browser ka data hata raha hai (dusre browser ka nahi)
- [ ] Password All Complains me `•••••••• (secured)` dikhta hai, plaintext nahi

---

## 4. Troubleshooting

| Problem | Wajah / fix |
|---|---|
| `wasmer deploy` fail: package/permission | `wasmer login` dobara; `wasmer.toml` ka name `vakki-8740/parimatch-backend` hona chahiye |
| Site pe "No Complains" lekin data tha | `VITE_API_URL` set nahi / redeploy nahi kiya (build-time var) |
| `db_driver: sqlite` | `DB_*` secrets missing ya galat; `wasmer secret list` se check karo |
| CORS error browser console me | `CORS_ORIGINS` ko `*` ya exact Vercel domain do, phir redeploy |
| 413 / upload fail | Edge ka request limit; `MAX_UPLOAD_MB` kam karo + php.ini limit already 100M |
| 404 on `/api/...` | App root directory galat (repo root deploy ho gaya) — `backend` hona chahiye |
| Data restart pe gayab | SQLite `/tmp` use ho raha hai, MySQL lagao |

---

## 5. Ek line me summary

```
Wasmer root dir  = backend        (wasmer deploy yahin se)
Vercel root dirs = Site, Blog     (alag-alag projects)
VITE_API_URL     = Wasmer ka printed URL (bina trailing slash)
DB               = MySQL (SQLite sirf demo)
```
