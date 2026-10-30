# Smart Society: Backend (Express API)

Node.js + Express REST API. Independent of the frontend: it does not serve any React files.

* **PostgreSQL**: users, roles, login sessions
* **MongoDB**: complaints, photos, service requests, activity log, id counters
* Details: [`../database/README.md`](../database/README.md)

## Run locally
```bash
cp .env.example .env     # fill in MONGODB_URI, DATABASE_URL, SESSION_SECRET
npm install
npm run seed             # admin + demo residents + sample complaints/services (idempotent)
npm run dev              # http://localhost:3000
npm test                 # unit tests for pure helpers
```
Dev demo logins (after seed): staff `RWA-01` / `admin1234`; resident `B-10, Mayfield Gardens` / `demo1234`.

## Environment variables
| Variable | Purpose |
|---|---|
| `PORT` | Listen port (Render sets it). Binds to `0.0.0.0`. |
| `NODE_ENV` | `production` enables Secure/SameSite=None cookies and refuses localhost DB URLs |
| `SESSION_SECRET` | Long random string (required in production) |
| `FRONTEND_URL` | Allowed browser origin(s) for CORS, comma-separated, no trailing slash |
| `MONGODB_URI` | MongoDB connection string (Atlas) |
| `DATABASE_URL` | PostgreSQL connection string |
| `PGSSL` | `true` for hosted Postgres that needs TLS |
| `MAX_UPLOAD_MB` | Photo size limit, default 2 |
| `SEED_ADMIN_PASSWORD`, `SEED_RESIDENT_PASSWORD` | Seed passwords. In production, if unset, random ones are generated and printed once |
| `ALLOW_DEMO_RESET` | `true` to allow `/api/admin/reset-demo` in production |

## API
All responses are JSON `{ ok: true, ... }` or `{ ok: false, error }`. Every non-GET request must send `X-Requested-With: fetch` (CSRF defence).

| Method & path | Access | Purpose |
|---|---|---|
| `GET /api/health` | public | Pings both databases (503 if either is down) |
| `POST /api/auth/signup` | public | Resident registration (staff signup is refused) |
| `POST /api/auth/login` | public | `{role, identifier, password}` |
| `POST /api/auth/logout`, `GET /api/auth/me` | session | |
| `GET /api/dashboard` | resident | Stats, recent complaints, services, activity |
| `GET /api/complaints[?scope=all]` | resident (own) / staff (`all`) | |
| `POST /api/complaints` | resident | `multipart/form-data` (`photo` optional) or JSON |
| `PATCH /api/complaints/:id` | staff | `{status?, note?}` |
| `GET /api/complaints/:id/photo` | owner / staff | |
| `GET /api/services`, `POST /api/services` | resident | own history / request `{serviceId}` |
| `GET /api/services/all`, `PATCH /api/services/:id` | staff | list / `{status?, note?}` |
| `GET /api/admin/dashboard`, `GET /api/admin/users` | staff | Society statistics / residents |
| `POST /api/admin/reset-demo` | staff | Adds *missing* sample records; never deletes |

## Security notes
bcrypt password hashing · HttpOnly session cookies stored in PostgreSQL · session id regenerated on login · rate limit on login/signup · helmet · strict CORS allow-list · input type-coercion (blocks NoSQL operator injection) · image magic-byte check and size cap · residents can only read their own complaints/photos · `.env` is git-ignored.

## Deploy on Render
1. New **Web Service** → connect the repo → **Root Directory** `backend` (or use `render.yaml` in the repo root).
2. Build: `npm install` · Start: `npm start` · Health check path: `/api/health`.
3. Environment: `NODE_ENV=production`, `SESSION_SECRET`, `FRONTEND_URL=https://<your-app>.vercel.app`, `MONGODB_URI` (Atlas; allow Render's IPs or `0.0.0.0/0` in Atlas Network Access), `DATABASE_URL` (hosted Postgres, e.g. Render Postgres), `PGSSL=true`.
4. Once deployed, open a Render **Shell** (or run locally against the production URLs) and run `npm run seed` with `SEED_ADMIN_PASSWORD` set, to create the admin account. **No admin exists until you do.**
