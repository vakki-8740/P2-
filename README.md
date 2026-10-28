# P2 — Parimatch Support (React)

Same UI same-to-same React conversion. Ab GitHub per 2 folder hai: **Blog** aur **Site** — har folder apna alag React project hai.

## Folder Structure — 2 Folder hi main hai

```
P2-/
├── Blog/   # 1. Blog — Landing (outer project)
│   ├── index.html
│   ├── package.json        # Blog standalone
│   ├── vite.config.js
│   ├── vercel.json         # SPA rewrite
│   ├── public/
│   │   ├── banner/         # file_00000000...png + IMG_20261028...png
│   │   ├── logo/logo.png
│   │   └── opening/Intro-Animation.html
│   └── src/
│       ├── App.jsx         # Route "/" only
│       ├── main.jsx
│       ├── own-library.css
│       ├── index.css
│       ├── components/Header.jsx + IntroOverlay.jsx
│       └── pages/Landing.jsx  # Were Here to Help You + Support Center → Site
│
├── Site/   # 2. Site — Support Center (inner project)
│   ├── index.html
│   ├── package.json        # Site standalone
│   ├── vite.config.js
│   ├── vercel.json
│   ├── public/
│   │   ├── banner/file_00000000...png
│   │   ├── logo/logo.png
│   │   └── icons-options/  # 7 SVG (withdrawal, bonus, deposit, kyc, bank-statement, unlock-withdrawal, live-chat)
│   └── src/
│       ├── App.jsx         # Routes "/", "/about", "/terms", "/all-complains"
│       ├── main.jsx
│       ├── own-library.css
│       ├── index.css
│       ├── components/Header.jsx  # hamburger + side drawer
│       └── pages/SupportHome.jsx, About.jsx, Terms.jsx, AllComplains.jsx
│
├── public/ + src/ + index.html + package.json + vite.config.js + vercel.json
│   └── Root combined SPA (legacy) — "/" + "/site" dono ek saath, Vercel abhi isi ko deploy kar raha hai
└── README.md
```

> **Inki files and folder isne he folder me honge** — Done ✓ Har project ki apni files usi folder ke andar hai.

## Tech
- Vite + React 18 + React Router 6
- OWN Library design system (`own-library.css`)
- Dark theme `#0a0b0f` bg, `#16181e` cards, `#F5FF00` primary

## Routes

**Blog** (`/Blog` standalone — deploys to its own domain at `/`):
| Path | Component | Original |
|------|-----------|----------|
| `/` | Landing | `index.html` + `opening/Intro-Animation.html` (1150ms overlay) |

**Site** (`/Site` standalone — deploys to its own domain at `/`):
| Path | Component | Original |
|------|-----------|----------|
| `/` | SupportHome | `site/index.html` (7 problem cards) |
| `/about` | About | `site/about.html` |
| `/terms` | Terms | `site/terms.html` (14 sections) |
| `/all-complains` | AllComplains | `site/all-complains.html` |

Legacy `.html` URLs auto-redirect (`/about.html` → `/about`).

**Root combined** (legacy, still at repo root):
| Path | Component |
|------|-----------|
| `/` | Landing |
| `/site` | SupportHome |
| `/site/about` | About |
| `/site/terms` | Terms |
| `/site/all-complains` | AllComplains |

## Dev

Root combined:
```bash
npm install
npm run dev      # http://localhost:5173/
npm run build
```

Blog standalone:
```bash
cd Blog
npm install
npm run dev      # http://localhost:5173/
npm run build    # → Blog/dist/
```

Site standalone:
```bash
cd Site
npm install
npm run dev
npm run build    # → Site/dist/
```

## Deploy (Vercel) — 2 alag URLs

Target projects already GitHub `vakki-8740/P2-` se linked hai:

| Folder | Vercel Project | URL | Root Directory (Vercel dashboard me set karo) |
|--------|----------------|-----|-----------------------------------------------|
| `Blog` | `parimatch-blog` | https://parimatch-blog.vercel.app | `Blog` |
| `Site` | `parimatch-senter-center` | https://parimatch-senter-center.vercel.app | `Site` |

**Vercel Dashboard steps:**
1. Project → Settings → General → **Root Directory** → `Blog` ya `Site` set karo → Save
2. **Framework Preset:** `Vite` | **Build Command:** `npm run build` | **Output Directory:** `dist` | **Install Command:** `npm install`
3. Redeploy

> Abhi dono projects **Root Directory = (empty)** par hai, isliye dono same Root combined SPA deploy kar rahe hai. `Blog`/`Site` set karne ke baad har URL apna alag project serve karega, aur `Blog/src/pages/Landing.jsx` me `Support Center` button direct `https://parimatch-senter-center.vercel.app` par jata hai.

