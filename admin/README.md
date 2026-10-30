# Admin page — saari complaints ek jagah

Ek hi file: `index.html`. Koi build nahi, koi dependency nahi. Vercel pe
seedha static site ki tarah chalti hai.

## Kya karta hai

- **Saari complaints** dikhata hai (har browser/user ki) — newest pehle
- **Search**: naam, mobile, email, id, message, type
- **Filters**: type (deposit / kyc / bonus …) aur status
- **Attachments**: images inline dikhte hain, PDF/DOC par "Open" link
- **Auto-refresh** (30s) toggle, **Export JSON** button
- Password kabhi nahi dikhta — `••••••••` (Drive me sirf SHA-256 hash hai)

## Pehli baar (page kholne pe)

Do cheezein maangega, browser me yaad rah jayengi:

| Field | Kahan se |
|---|---|
| **Web App URL** | Apps Script → Deploy → Web app → `…/exec` link |
| **Admin token** | jo password aapne `Code.gs` ke `CONFIG.ADMIN_TOKEN` me likha (ya Script Properties ka `ADMIN_API_TOKEN`) |

"Save & check" dabao → green "Connected ✓" aana chahiye.

## Vercel pe deploy

1. [vercel.com](https://vercel.com) → **Add New… → Project**
2. Repo `P2-` import karo
3. **Root Directory** → `admin`  ← ye sabse zaroori hai
4. Framework Preset: **Other** (build command khaali, output `admin`)
5. **Deploy**

URL milega jaise `https://p2-admin-xxxx.vercel.app` — usko phone me bookmark kar lo.

## Dhyan rakho

- Page ko token chahiye, warna `Admin token required` error aayega.
  Token set karne ke 3 tarike [`../apps-script/README.md`](../apps-script/README.md) §2
  me hain — sabse aasan: `Code.gs` me `ADMIN_TOKEN: 'password'` likh do.
- Code ya property badalne ke baad **Deploy → Manage deployments → Edit →
  New version → Deploy** karna zaroori hai, warna purana version chalta rahega.
- Apps Script deployment **"Anyone"** pe hona chahiye, warna `Failed to fetch`.
- Ye page public URL pe hai — jiske paas link hai wo khol sakta hai. Zarurat ho to
  Vercel pe **Password Protection** (Pro plan) laga do, ya URL kisi ko na do.
- Data live Drive se aata hai; page khud kuch store nahi karta (sirf URL/token
  localStorage me).
