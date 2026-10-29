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
| **"Deployment failed. Review the logs and update your configuration."** | Config format galat tha — ab fix hai (neeche section 6 dekho). Repo pull karke `cd backend && wasmer deploy` dobara chalao |
| `wasmer deploy` fail: package/permission | `wasmer login` dobara |
| App name already taken | `backend/app.yaml` me `name:` badal do (e.g. `parimatch-backend-api`) |
| Site pe "No Complains" lekin data tha | `VITE_API_URL` set nahi / redeploy nahi kiya (build-time var) |
| `db_driver: sqlite` | `DB_*` secrets missing ya galat; `wasmer secret list` se check karo |
| CORS error browser console me | `CORS_ORIGINS` ko `*` ya exact Vercel domain do, phir redeploy |
| 413 / upload fail | Edge ka request limit; `MAX_UPLOAD_MB` kam karo + php.ini limit already 100M |
| 404 on `/api/...` | App root directory galat (repo root deploy ho gaya) — `backend` hona chahiye |
| Data restart pe gayab | SQLite `/tmp` use ho raha hai, MySQL lagao |

---

## 5. "Deployment failed. Review the logs..." — kya hua tha

Repo me pehle jo config tha wo **purane/deprecated format** me tha, isliye
Wasmer ne deploy reject kiya. Ab official starters ke saath match kar diya hai:

| Pehle (galat) | Ab (verified) |
|---|---|
| `wasmer.toml` me `[package] name = "vakki-8740/..."` + `version` | `[package]` me sirf `entrypoint = "run"` (naam Wasmer khud banata hai) |
| `wasmer.toml` me `[capabilities]` aur `[capabilities.net]` | Ye `wasmer.toml` me **nahi** jaate — capabilities sirf `app.yaml` me |
| `wasmer.toml` me `[capabilities.instaboot]` | `app.yaml` → `capabilities.instaboot` |
| `app.yaml` me `package: {name, version}` (deprecated) | `app.yaml` me `package: .` |
| `-S 0.0.0.0:8080` | `-t /app -S localhost:8080 ... /app/index.php` (official order) |

### Ab kya karo

```bash
git pull                      # ya latest branch checkout
cd backend
wasmer deploy
```

### Phir bhi fail ho to logs nikaalo

```bash
# CLI se live logs
wasmer app logs parimatch-backend

# ya detail ke saath deploy
wasmer deploy --verbose
```

Dashboard: `https://wasmer.io/apps/vakki-8740/parimatch-backend` → **Deployments**
→ failed deployment → **Logs**. Usme 3 me se koi ek cheez milegi:

| Log me kya dikhega | Matlab | Fix |
|---|---|---|
| `unknown field` / `failed to parse manifest` | config schema | latest repo use karo (ab fix hai) |
| `package not found: php/php` | dependency version | `wasmer.toml` me `"php/php" = "=8.3.4"` hi rakho |
| `health check failed` / `connection refused` | app start nahi hua ya port galat | port `8080` hona chahiye (config me hai) |
| `app name already exists` / `forbidden` | naam ya permission | `app.yaml` me `name:` change karo, ya `wasmer login` dobara |
| `build failed` | file mount missing | `backend/` ke andar se deploy karo (root directory = `backend`) |

### Variant B — sabse minimal config (agar logs config/mount ki taraf point karein)

`backend/wasmer.toml` ko is se replace kar do (config `app/` ke andar mount hota hai,
`PHPRC` ki zarurat nahi kyunki limits `-d` flags se aa rahi hain):

```toml
[package]
entrypoint = "run"

[dependencies]
"php/php" = "=8.3.4"

[fs]
"/app" = "app"
"/app/config" = "config"

[[command]]
name = "run"
module = "php/php:php"
runner = "wasi"

[command.annotations.wasi]
main-args = ["-t", "/app", "-S", "localhost:8080", "-d", "upload_max_filesize=100M", "-d", "post_max_size=300M", "-d", "memory_limit=512M", "/app/index.php"]
env = ["DB_PATH=/tmp/parimatch_app.db", "UPLOAD_DIR=/tmp/parimatch_uploads"]
```

Aur `app.yaml` me `owner:` line hata do (Wasmer khud aapka namespace use karega):

```yaml
kind: wasmer.io/App.v0
name: parimatch-backend
package: .
scaling:
  mode: single_concurrency
capabilities:
  instaboot:
    requests:
      - path: /api/health
```

> `owner:` me **Wasmer ka username/namespace** hona chahiye, GitHub username nahi
> (dono same ho sakte hain, zaroori nahi). Galat owner = deploy fail.

### Plan B (agar phir bhi na chale)

Bilkul official scaffold banake usme apna code daal do:

```bash
cd /tmp
wasmer deploy --template=php-starter     # ye poochhega owner/name
cd php-starter
cp -r /path/to/P2-/backend/app/* app/    # app/index.php + helpers.php
cp -r /path/to/P2-/backend/config config/
# wasmer.toml me [fs] me add karo:  "/config" = "config"
# main-args ke last me add karo:    "/app/index.php"
# env me add karo:                  "PHPRC=/config/"
wasmer deploy
```

---

## 6. Ek line me summary

```
Wasmer root dir  = backend        (wasmer deploy yahin se)
Vercel root dirs = Site, Blog     (alag-alag projects)
VITE_API_URL     = Wasmer ka printed URL (bina trailing slash)
DB               = MySQL (SQLite sirf demo)
```
