# Data check page

Ek hi file: `index.html`. Koi build nahi, koi dependency nahi.
Bas ye dekhne ke liye ki Apps Script se **data aa raha hai ya nahi**.

## Vercel pe deploy (3 step)

1. vercel.com → **Add New… → Project** → repo import
2. **Root Directory** = `check`
3. Framework Preset: **Other** → **Deploy**

## Use kaise karo

Page kholne pe do field:

| Field | Value |
|---|---|
| Web App URL | Apps Script ka `…/exec` link |
| Admin password | `Code.gs` ki pehli line `ADMIN_PASSWORD` me jo likha |

- Page khulte hi data **apne aap load** ho jata hai (button dabane ki zarurat nahi)
- **Real-time** checkbox ON (default) → har **10 second** me khud refresh hota hai,
  nayi complaint apne aap list me aa jati hai
- **"Ab check karo"** button = manual refresh
- **"Test complaint bhejo"** → ek sample complaint Drive me daal ke verify kar sakte ho
- Neeche **Last update** ki time dikhti hai (pata chale refresh chal raha hai)

## Error ka matlab

| Message | Fix |
|---|---|
| `Admin token required` | password galat, ya `Code.gs` me `ADMIN_PASSWORD` set nahi + naya version deploy nahi hua |
| `Failed to fetch` | URL galat, ya Apps Script deployment "Anyone" pe nahi |
| `JSON nahi aaya` | URL ke aage `/exec` missing, ya Google login page khul raha hai |

Values browser me save ho jati hain (localStorage) — dobara nahi daalni padti.
