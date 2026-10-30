# Deploy backend from phone (Termux) — full commands

Backend `backend/` folder se Wasmer Edge pe deploy hota hai.
Do raaste hain: **Plan A** (Termux ki zarurat nahi, browser-only) aur
**Plan B** (Termux + Debian, poore commands neeche).

---

## Plan A — Phone browser + GitHub Actions (koi command nahi)

1. `https://wasmer.io/settings/access-tokens` → **Create token** → copy
2. GitHub repo → **Settings → Secrets and variables → Actions** →
   **New repository secret** → Name: `WASMER_TOKEN` → Value: token → Save
3. Branch ko **`main`** me merge karo (workflow default branch pe chahiye)
4. Repo → **Actions** → **Deploy backend (Wasmer)** → **Run workflow**

Ho gaya. URL workflow summary me milega (`VITE_API_URL=...`).

> Agar Actions tab khali dikhe: Settings → Actions → General → "Allow all actions".

---

## Plan B — Termux (Android) se deploy

> ⚠️ **Zaroori:** Termux **F-Droid** ya GitHub releases se install karo,
> Play Store wala version deprecated hai. Aur Termux ke andar **direct
> `wasmer` install nahi hoga** (wasmer binaries glibc ke hain, Android bionic
> use karta hai) — isliye hum **proot-distro Debian** ke andar chalayenge.
> Neeche commands me ye sab already handle hai.

### Step 1 — Termux update + tools

```bash
pkg update -y && pkg upgrade -y
pkg install -y proot-distro git curl openssl
termux-wake-lock          # phone ko sone se roko (deploy beech me na ruke)
```

> **Termux me pehle se wasmer install ho gaya hai?** Use hata do (wo kabhi nahi chalega):
> ```bash
> rm -rf ~/.wasmer
> ```

### Step 2 — Debian install karo

```bash
proot-distro install debian
proot-distro login debian
```
(Agar `proot-distro login` ke baad prompt `root@localhost:~#` jaisa dikhe →
aap Debian ke andar ho. **Baaki saare commands isi ke andar chalenge.**)

### Step 3 — Debian me basic packages

```bash
apt update && apt install -y curl git ca-certificates unzip openssl
```

### Step 4 — Wasmer CLI install

```bash
curl https://get.wasmer.io -sSfL | sh
source ~/.wasmer/wasmer.sh 2>/dev/null || export PATH="$HOME/.wasmer/bin:$PATH"
wasmer --version
```
Output me `wasmer 4.x` (ya 5.x) dikhna chahiye. Nahi dikha to:
```bash
export PATH="$HOME/.wasmer/bin:$PATH"
which wasmer
```

### Step 5 — Token set karo

```bash
export WASMER_TOKEN=paste_your_token_here
```
Check (token print nahi hoga, sirf namespace):
```bash
wasmer whoami 2>/dev/null || wasmer app list
```

### Step 6 — Repo clone karo

```bash
cd ~
git clone https://github.com/vakki-8740/P2-.git
cd P2-
git checkout arena/8531071e-p2
git log --oneline -1
```

### Step 7 — Deploy (script se — recommended)

```bash
cd ~/P2-/backend
bash deploy.sh
```
Script khud: files check → CLI check → token use → deploy → `/api/health` check →
`VITE_API_URL=...` print karegi.

**Manual** karna ho to:
```bash
cd ~/P2-/backend
wasmer deploy
```

### Step 8 — URL confirm

```bash
wasmer app info
# → Name / Owner / URL: https://<app>-<owner>.wasmer.app
curl -s https://<YOUR-URL>/api/health
```
Expected: `"ok":true ... "db":"connected"` (ya `"db":"sqlite"` agar MySQL abhi nahi lagaya).

### Step 9 — MySQL secrets (production ke liye zaroori)

```bash
cd ~/P2-/backend
wasmer secret create DB_HOST --value=your-mysql-host
wasmer secret create DB_NAME --value=parimatch_support
wasmer secret create DB_USER --value=your_user
wasmer secret create DB_PASS --value=your_password
wasmer secret create APP_KEY  --value=$(openssl rand -hex 32)
wasmer secret create ADMIN_API_TOKEN --value=$(openssl rand -hex 24)
wasmer deploy          # secrets apply karne ke liye dobara deploy
```

### Step 10 — Frontend connect (phone browser se)

Vercel → project **Site** → Settings → Environment Variables →
`VITE_API_URL = https://<YOUR-URL>` → **Redeploy** (env build-time hota hai).

---

## Repeat deploy (agli baar)

```bash
proot-distro login debian
export WASMER_TOKEN=your_token
cd ~/P2- && git pull && cd backend && bash deploy.sh
```

---

## Termux troubleshooting

| Problem | Fix |
|---|---|
| `wasmer: cannot execute: required file not found` | Ye **glibc vs Android bionic** issue hai. Wasmer CLI Termux me kabhi nahi chalega. Termux me `rm -rf ~/.wasmer` karo, phir `proot-distro login debian` ke andar install karo (Step 2-4) |
| `tee: /tmp/...: Permission denied` | Termux me `/tmp` nahi hota. Ab `deploy.sh` khud `$TMPDIR`/local path chunta hai — `git pull` karke latest script use karo |
| `wasmer: cannot execute binary file` / `not found` | Aap Termux ke andar direct install kar rahe ho → `proot-distro login debian` ke andar karo (Step 2) |
| `curl: command not found` | `apt install -y curl` (Debian ke andar) |
| `pkg: command not found` | Termux nahi, koi aur terminal hai — F-Droid se Termux install karo |
| Deploy beech me ruk gaya / phone ne app kill kiya | `termux-wake-lock` chalao, Termux notification "Acquire wakelock", battery optimization off |
| `401 Unauthorized` | Token galat/expired — naya token, `export WASMER_TOKEN=...` dobara |
| `owner mismatch` | `backend/app.yaml` me `owner:` aapke Wasmer namespace se match kare |
| `version already exists` | `wasmer deploy --bump` |
| `wasmer deploy` prompts pe atak raha | `wasmer deploy --non-interactive` (token env set hona chahiye) |
| Health check fail | `wasmer app logs parimatch-backend` se logs dekho |
| Phone storage full | `pkg clean`, `proot-distro clear-cache` |

---

## MySQL kahan se (phone se hi)

Wasmer Edge pe SQLite `/tmp` me banti hai → **redeploy pe data khatam**.
Production ke liye free MySQL: **Railway**, **Aiven**, **Filsh**, **FreeSQL**.
Host/user/password leke Step 9 ke secrets bhar do, phir `wasmer deploy`.
