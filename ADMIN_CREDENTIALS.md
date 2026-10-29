# Admin Panel — Login Credentials

**Admin Panel URL (after deploy):**
- Local: `http://localhost:5173/admin` or `http://localhost:5174` (Admin project)
- Vercel (deploy with Root Directory = `Admin`): `https://parimatch-admin.vercel.app` (example — set your domain)

**Default Login:**
```
Username: admin
Password: Admin@123
```

**Where stored:**
- `localStorage` key `admin_credentials` = `{"username":"admin","password":"Admin@123"}`
- Session key `admin_session` after login

**How to change (inside Admin Panel):**
1. Login with above
2. Go to **Settings** → **Change Login Credentials**
3. Enter New Username + New Password + Confirm Password → **Update Credentials**
4. New credentials immediately replace old — share new ones with team
5. Old session stays until logout; next login requires new credentials

**How to reset if forgotten:**
- Open browser DevTools → Application → Local Storage → delete `admin_credentials` and `admin_session` → refresh → default `admin / Admin@123` restored
- Or run in console: `localStorage.removeItem('admin_credentials'); localStorage.removeItem('admin_session'); location.reload()`

**Security note:** This is localStorage demo auth for now. For production, connect to real backend API with hashed passwords, JWT, etc.

**Features in Admin:**
- Dashboard: Total Complaints, Today Complaints, Today Chat Users, Total Chat Users + user list (name, time, data, type, icon) → tap to detail
- User Detail: All complaints of that user, images via View → Close/Download
- Chat Manage → Chat Detail
- Activity: bar + pie by complaint type
- Settings: credentials, theme (dark + light blue buttons), data tools
- Theme: dark #16181e + yellow #F5FF00 ; light #ffffff + bright blue #0ea5e9
