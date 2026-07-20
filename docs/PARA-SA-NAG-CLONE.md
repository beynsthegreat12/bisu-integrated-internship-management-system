# Para sa nag-clone sa GitHub

Pre, sunoda lang ni nga steps:

**Step 1:** Sa folder nga imong gi-clone, paghimo og **bag-ong file** nga ang ngalan kay `.env` (walay .txt or lain extension). Dayon i-paste ni:

```
APP_ID=app
APP_SECRET=app-secret-change-me
DATABASE_URL=mysql://root:@localhost:3306/my_app
VITE_KIMI_AUTH_URL=
VITE_APP_ID=
KIMI_AUTH_URL=https://auth.kimi.com
KIMI_OPEN_URL=https://open.kimi.com
OWNER_UNION_ID=
```

**Step 2:** Pag-open og **command prompt / terminal** sa folder, dayon i-type:

```
npm install
```

**Step 3:** Siguroa nga naka-ON ang **MySQL sa XAMPP** (Start → MySQL). Dayon i-type:

```
npm run db:push
```

**Step 4:** I-run ang app:

```
npm run dev
```

**Step 5:** Ablihi ang browser, adto sa **http://localhost:5173**

**Step 6:** Para maka-login dayon **walay password**, i-type sa browser address bar (dili sa login form) ang bisan asa ni:

- `http://localhost:5173/api/dev-login?role=admin` (Admin)
- `http://localhost:5173/api/dev-login?role=student` (Student)
- `http://localhost:5173/api/dev-login?role=coordinator` (Coordinator)
- `http://localhost:5173/api/dev-login?role=supervisor` (Supervisor)

Magsugod na dayon na ang app! Wala nay email/password nga kinahanglan.