# P2-A — Admin Panel (mobile only)

Parimatch support ka admin panel — **React + Vite**, sirf mobile ke liye design kiya
gaya hai (max width 480px, bottom tab bar). Theme user panel (`Site/`) jaisa hi
dark hai.

```
Home  |  Complains  |  Chat  |  Activity  |  Setting
```

## Pages

| Page | Kya dikhta hai |
|---|---|
| **Home** (`/`) | **Sirf aaj** ke users — icon, naam, complaint type, date & time. Stats: aaj ke users + aaj ki complaints. |
| **All Complains** (`/all`) | Saare users (search ke saath) — same list style |
| **User detail** (`/user/:clientId`) | Us user ki **saari complaints** — details, password (masked), attachments (**View** → popup), status change (Pending / Resolved / Rejected) |
| **Chat Manage** (`/chat`) | Jitne users ne chat ki hai — last message preview + time |
| **Chat thread** (`/chat/:clientId`) | Us user ki poori chat + **reply** bhejne ka box (support ki taraf se) |
| **Activity** (`/activity`) | Today / Yesterday ke hisaab se timeline — complaints + messages |
| **Setting** (`/setting`) | Admin name, password change, vibrate toggle, data counts, logout |

## Login

Panel khulte hi password maangta hai (browser session tak yaad rehta hai).

- Default password: **`p2a@2026`**
- Badalne ke 2 tareeke:
  1. **Setting → Security** (browser me save hota hai)
  2. `src/config.js` me `DEFAULT_PASSWORD` badal ke redeploy

> ⚠️ Ye simple client-side lock hai (koi auth server nahi). Data Firebase rules
> se protect hota hai — details `../firestore.rules` aur `../FIREBASE-SETUP.md` me.

## Data kahan se aata hai

Same Firestore project jo user panel use karta hai:

```
complaints/{id}  →  { clientId, type, status, createdAt, details, files }
messages/{id}    →  { clientId, sender, text, createdAt }
```

- Ek `clientId` = ek user (har browser ka apna id hota hai).
- Firestore `onSnapshot` se **live** — naya complaint aate hi list me aa jata hai.
- Config: `src/firebase-config.js` (jaan bujh ke same project ki values).

## Local development

```bash
cd P2-A
npm install
npm run dev -- --port 5176     # http://localhost:5176
npm run build                  # dist/
```

## Deploy (Vercel)

1. Vercel → **Add New Project** → same repo
2. **Root Directory** = `P2-A`
3. Framework preset: **Vite** (build: `npm run build`, output: `dist`)
4. Deploy → `https://<project>.vercel.app`

`vercel.json` me SPA rewrite hai, isliye `/user/...`, `/chat/...` refresh pe bhi
kaam karte hain.

## Firebase rules (zaroori)

Admin panel **saara** data padhta hai, isliye `complaints` aur `messages` pe
`read` allow hona chahiye (repo ki `firestore.rules` me hai). Reply bhejne ke liye
`messages` pe create bhi allowed hai (`sender: 'support'`), aur status badalne ke
liye `complaints` pe update.
