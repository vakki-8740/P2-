# P2 — Parimatch Support (2 Projects)

Is repo me 2 alag projects hai:

| Project | Folder | Vercel URL | Local Preview |
|---------|--------|------------|---------------|
| **Outer / Landing** | `/` (root) — `index.html` + `opening/` + `banner/` + `lib/` + `logo/` | https://p2-outer-landing.vercel.app | https://8000-...e2b.app/ |
| **Inner / Support Site** | `/site` — `site/index.html`, `about.html`, `terms.html`, `all-complains.html` | https://p2-inner-site.vercel.app | https://8000-...e2b.app/site/index.html |

## Structure
```
P2-/
├── index.html          # Landing with intro animation (1150ms) → links to p2-inner-site.vercel.app
├── opening/Intro-Animation.html
├── banner/             # 2 banners (1.2M + 138k)
├── lib/own-library.css # OWN Library design tokens (dark theme)
├── logo/logo.png
├── site/               # Inner project — independent deploy
│   ├── index.html      # 7 problem cards (Withdrawal, Bonus, Deposit…)
│   ├── about.html
│   ├── terms.html
│   ├── all-complains.html
│   ├── icons-options/  # 7 SVG icons
│   ├── lib/own-library.css
│   └── logo/logo.png
└── vercel.json
```

## Vercel Deploy — 2 alag URLs
1. Outer: Vercel project `p2-outer-landing` → GitHub `vakki-8740/P2-` → **Root Directory: (empty / .)** → Production Branch `main`
2. Inner: Vercel project `p2-inner-site` → GitHub `vakki-8740/P2-` → **Root Directory: `site`** → Production Branch `main`

Dono projects `prj_Q7eytQzjYGIbzVxUfAvSQiShDFSm` aur `prj_LpEWOZFJr6aP8PdgPvXyfi2VnjH6` ke naam se ban chuke hai. Bas Vercel dashboard me GitHub connect karke Deploy dabao — alag-alag URLs mil jayenge.

Lokal test: `python3 -m http.server 8000` → http://localhost:8000/ aur http://localhost:8000/site/

