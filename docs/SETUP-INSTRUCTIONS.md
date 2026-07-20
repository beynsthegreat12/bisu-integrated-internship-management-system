# 📋 BISU Internship Management System — Setup Guide

## Para sa nag-clone sa GitHub

---

### ✅ Step 1: I-set ang `.env` file

Sa folder nga imong gi-clone, paghimo og file nga **`.env`** (walay lain extension). I-copy ug i-paste ni:

```
# ── Backend ─────────────────────────────────────────────────────
APP_ID=app
APP_SECRET=app-secret-change-me

# ── Database ───────────────────────────────────────────────────
DATABASE_URL=mysql://root:@localhost:3306/my_app

# ── Frontend (exposed to browser via Vite) ──────────────────────
VITE_KIMI_AUTH_URL=
VITE_APP_ID=

# ── Backend (Auth) ─────────────────────────────────────────────
KIMI_AUTH_URL=https://auth.kimi.com
KIMI_OPEN_URL=https://open.kimi.com

# ── Admin Role ──────────────────────────────────────────────────
OWNER_UNION_ID=
```

> ⚠️ **IMPORTANTE:** I-adjust ang `DATABASE_URL` base sa imong MySQL setup:
> - **XAMPP (walay password):** `mysql://root:@localhost:3306/my_app`
> - **XAMPP (naay password):** `mysql://root:password@localhost:3306/my_app`
> - **Lain nga database name:** ilisan ang `my_app`

---

### ✅ Step 2: I-install ang dependencies

Bukas og **terminal/cmd** sa folder, dayon i-run:

```bash
npm install
```

---

### ✅ Step 3: I-set up ang database

Siguroa nga naka-run ang **MySQL** (XAMPP → Start MySQL). Dayon i-run:

```bash
npm run db:push
```

Mugnaon niini ang mga tables sa database.

---

### ✅ Step 4: I-seed ang database (optional)

Kung gusto kaay test data (mga sample students, coordinators, etc.):

```bash
npm run db:seed
```

---

### ✅ Step 5: I-run ang app

```bash
npm run dev
```

Dayon adto sa browser: **http://localhost:5173**

---

### 🚀 Quick Login (Para sa testing — walay need og password)

I-type lang sa browser ang usa niini:

| Role | URL |
|------|-----|
| **Admin** | `http://localhost:5173/api/dev-login?role=admin` |
| **Student** | `http://localhost:5173/api/dev-login?role=student` |
| **Coordinator** | `http://localhost:5173/api/dev-login?role=coordinator` |
| **Supervisor** | `http://localhost:5173/api/dev-login?role=supervisor` |
| **SIPP Coordinator** | `http://localhost:5173/api/dev-login?role=sipp_coordinator` |

---

### 📁 File Structure (important)

```
app/
├── .env              ← Imong gi-create (DILI ni ma-commit sa GitHub)
├── .env.example      ← Template sa .env (naa sa GitHub)
├── api/              ← Backend (tRPC + Hono)
├── src/              ← Frontend (React + Vite)
├── db/               ← Database schema ug seed
└── docs/             ← Documentation
```

---

### ❓ Naay problema?

I-share lang ang screenshot sa error para matabangan ka.