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

- **Data check karo** → batayega: connected / kitni complaints / naam ki list / raw JSON
- **Test complaint bhejo** → ek sample complaint Drive me daal dega; phir dobara "Data check karo" dabao, list me dikhni chahiye

## Error ka matlab

| Message | Fix |
|---|---|
| `Admin token required` | password galat, ya `Code.gs` me `ADMIN_PASSWORD` set nahi + naya version deploy nahi hua |
| `Failed to fetch` | URL galat, ya Apps Script deployment "Anyone" pe nahi |
| `JSON nahi aaya` | URL ke aage `/exec` missing, ya Google login page khul raha hai |

Values browser me save ho jati hain (localStorage) — dobara nahi daalni padti.
