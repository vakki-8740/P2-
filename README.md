# P2 — Parimatch Support (React) + Admin Panel

Same UI same-to-same React conversion. Ab GitHub per **3 folders** hai: **Blog**, **Site**, **Admin** — har folder apna alag React Vite project hai + Root combined legacy.

## Folder Structure

```
P2-/
├── Blog/   # 1. Blog — Landing (outer project)
│   ├── package.json, vite.config.js, vercel.json
│   ├── public/banner, logo, opening
│   └── src/App.jsx (route "/" only)
├── Site/   # 2. Site — Support Center
│   ├── package.json, vite.config.js, vercel.json
│   ├── public/icons-options (7 SVGs), banner, logo
│   └── src/App.jsx (/, /about, /terms, /all-complains, /withdrawal-complain ... /live-chat)
├── Admin/  # 3. Admin — Admin Panel (NEW)
│   ├── package.json, vite.config.js, vercel.json
│   ├── public/logo, banner, icons-options
│   └── src/
│       ├── App.jsx (protected routes)
│       ├── own-library.css, index.css (dark #0a0b0f #16181e #F5FF00 / light #fff #0ea5e9)
│       ├── utils/adminAuth.js, dataStore.js
│       ├── components/AdminLayout.jsx, ImageViewer.jsx
│       └── pages/Login.jsx, Dashboard.jsx, Users.jsx, UserDetail.jsx, Activity.jsx, ChatManage.jsx, ChatDetail.jsx, Settings.jsx
├── public/ + src/ + index.html + package.json ... (Root combined legacy — "/" + "/site")
├── ADMIN_CREDENTIALS.md  # login details shareable
└── README.md
```

## Admin Panel — Features (User request full)

**Login:**
- `/login` — Username + Password, Show/Hide, error, demo credentials box
- Stored in `localStorage.admin_credentials` default `admin / Admin@123`
- Changeable inside Settings → Credentials update → immediately new login required. Share `ADMIN_CREDENTIALS.md`.

**Dashboard (Home):**
- Top stats: **Total Complaints**, **Today Complaints**, **Today Chat Users**, **Total Chat Users** (from `parimatch_complains` + `parimatch_chat_messages`)
- Below: **All Users List** — each row: same icon (avatar letter), user name, time (lastAt), data (mobile/email), type problem badges. Tap → User Detail.

**Users List & User Detail:**
- Users page: search by name/mobile/email/problem, grouped by mobile > email > userName
- User Detail: all complaints of that user nicely (card, grid details, ID, date). Files: **View button** (not direct) → modal with Close + Download. Images preview, non-images download.

**Activity Page:**
- Bar + pie (conic-gradient) by complaint type: Deposit, Withdrawal, Bonus, KYC, Bank Statement, Unlock Withdrawal, Live Chat — shows which type most.

**Chat Manage:**
- User list like Users (from grouped users + chat messages) → tap opens Chat Detail
- Chat Detail: full thread, admin can reply as support, messages saved to same localStorage thread, clear chat.

**Settings:**
- Change Login Credentials, Theme toggle, Pages list, Danger Zone (clear complains/chats, logout)

**Theme:**
- Dark default: bg #0a0b0f, card #16181e, text #eceef3, primary yellow #F5FF00
- Light: bg #f1f5f9, card #ffffff, primary bright blue #0ea5e9 (user asked: light mode me button yellow nahi blue)
- Toggle via sidebar footer → saves to `admin_theme` localStorage.

**Other:**
- Responsive sidebar + mobile overlay, admin header, stats grid, image viewer modal (close/download)
- Demo seed if empty: 5 demo complaints + 3 chat messages auto-created for presentation

## Tech
- Vite + React 18 + React Router 6
- OWN Library design system (`own-library.css`)
- Dark theme #0a0b0f / #16181e / #F5FF00, Light #0ea5e9

## Routes

**Blog** (`Blog` Root Directory → `https://parimatch-blog.vercel.app`):
| Path | Component |
|------|-----------|
| `/` | Landing (Were Here to Help You + Support Center → Site) |

**Site** (`Site` Root Directory → `https://parimatch-senter-center.vercel.app`):
| Path | Component |
|------|-----------|
| `/` | SupportHome (7 problem cards) |
| `/about` | About |
| `/terms` | Terms (14 sections) |
| `/all-complains` | AllComplains |
| `/deposit-complain` etc | 6 complain forms |
| `/live-chat` | ChatPage |

**Admin** (`Admin` Root Directory → `https://parimatch-admin.vercel.app` — deploy new Vercel project):
| Path | Component |
|------|-----------|
| `/login` | Login |
| `/` | Dashboard (stats + users) |
| `/users` | Users list |
| `/users/:userId` | UserDetail (all complains + View/Download) |
| `/chat` | ChatManage |
| `/chat/:userId` | ChatDetail |
| `/activity` | Activity (bar+pie) |
| `/settings` | Settings (credentials, theme, danger zone) |

**Root combined** (legacy at repo root): `/` Landing + `/site/*` SupportHome

## Dev

```bash
# Root
npm install; npm run dev # http://localhost:5173/
# Blog
cd Blog; npm install; npm run dev
# Site
cd Site; npm install; npm run dev
# Admin
cd Admin; npm install; npm run dev # http://localhost:5173/ (admin)
```

## Deploy (Vercel) — 3 separate URLs

| Folder | Vercel Project | URL | Root Directory |
|--------|----------------|-----|----------------|
| `Blog` | parimatch-blog | https://parimatch-blog.vercel.app | `Blog` |
| `Site` | parimatch-senter-center | https://parimatch-senter-center.vercel.app | `Site` |
| `Admin` | parimatch-admin (new) | https://parimatch-admin.vercel.app | `Admin` |

Vercel Dashboard: Project → Settings → General → Root Directory → set → Save → Redeploy (Framework Vite, Build `npm run build`, Output `dist`).

> Note: Admin on separate domain has separate localStorage from Site. For real prod, use backend API. For demo, Admin will show seeded demo data if empty, or if you open Admin on same domain via Site's /admin embed, it shares storage. To test together locally, open Site and Admin in same browser — data is per browser storage.

## Credentials

See `ADMIN_CREDENTIALS.md` — default `admin / Admin@123`, changeable inside Settings.
