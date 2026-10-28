# P2 — Parimatch Support (React)

Same UI — Same to Same React conversion. 2 projects unified into one React SPA with client-side routing.

## Tech
- **Vite + React 18 + React Router 6**
- **OWN Library** design system (`src/own-library.css`)
- Dark theme (`#0a0b0f` bg, `#16181e` cards, `#F5FF00` primary)

## Routes
| Path | Component | Original |
|------|-----------|----------|
| `/` | `Landing` (outer) | `index.html` + `opening/Intro-Animation.html` |
| `/site` | `SupportHome` | `site/index.html` (7 problem cards) |
| `/site/about` | `About` | `site/about.html` |
| `/site/terms` | `Terms` | `site/terms.html` (14 sections) |
| `/site/all-complains` | `AllComplains` | `site/all-complains.html` |

Legacy `.html` URLs auto-redirect (e.g. `/site/about.html` → `/site/about`).

## Structure
```
src/
├── App.jsx              # Routes + redirects
├── main.jsx
├── own-library.css      # Design tokens
├── index.css            # All original <style> blocks (landing + site)
├── components/
│   ├── Header.jsx       # Sticky header + hamburger + side drawer
│   └── IntroOverlay.jsx # 1150ms iframe overlay + click-to-close
└── pages/
    ├── Landing.jsx      # Banner + 4 feature items + Support Center → /site
    ├── SupportHome.jsx  # Banner + 7 ProblemCards
    ├── About.jsx
    ├── Terms.jsx
    └── AllComplains.jsx
public/
├── banner/              # 2 banners (1.2M + 138k)
├── logo/logo.png
├── opening/Intro-Animation.html
└── site/                # Icons (7 SVG) + banner for SupportHome
```

## Dev
```bash
npm install
npm run dev      # http://localhost:5173/
npm run build    # → dist/
npm run preview  # preview dist/
```

## Deploy (Vercel)
Single Vercel project → Git `vakki-8740/P2-` → Build `npm run build` → Output `dist` → SPA rewrite `/(.*) → /`.

For 2 separate Vercel URLs (old setup):
- `p2-outer-landing` → Root `.` → `https://p2-outer-landing.vercel.app/`
- `p2-inner-site`   → Root `site` → `https://p2-inner-site.vercel.app/` (now just `/site` route in one app)

Vercel handles own — just connect GitHub and deploy.
