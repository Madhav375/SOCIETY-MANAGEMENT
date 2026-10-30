# Smart Society: Mayfield Gardens RWA Portal

Complaint and service portal for B Block, restructured from a single-file app into three independent parts:

```
Smart-Society/
├── frontend/   React + Vite  → deploy on Vercel
├── backend/    Express API   → deploy on Render
└── database/   PostgreSQL schema + MongoDB schema docs + data-ownership plan
```

| | |
|---|---|
| Frontend | React 18, React Router, Context API, original design preserved |
| Backend | Node.js, Express, express-session (sessions in PostgreSQL), bcryptjs |
| PostgreSQL | users, roles, sessions |
| MongoDB | complaints (+ photos, status history), service requests, activity log |

## Features
Resident: sign up / log in, dashboard (counts, recent complaints, service requests, activity), raise complaints with optional photo, track status and staff notes, request services (Gardening, Plumbing, Electricity, Househelp) and see history.
RWA staff: view all complaints and service requests, change status, add staff notes, see statistics, category breakdown, oldest open ticket and the resident list. Residents cannot reach `/admin`; staff accounts cannot be self-registered.

## Local quick start
Prerequisites: Node 18+, a local MongoDB and PostgreSQL (or Atlas / hosted URLs).
```bash
# 1. backend
cd backend && cp .env.example .env     # edit the two DB URLs
npm install && npm run seed && npm run dev

# 2. frontend (new terminal)
cd frontend && cp .env.example .env
npm install && npm run dev             # open http://localhost:5173
```
Demo logins (development only): staff `RWA-01` / `admin1234`; resident `B-10, Mayfield Gardens` / `demo1234`.

## Deployment
See [`backend/README.md`](backend/README.md) (Render) and [`frontend/README.md`](frontend/README.md) (Vercel, including the third-party-cookie note). Order: deploy backend → deploy frontend with `VITE_API_URL` → set backend `FRONTEND_URL` → seed the admin.

## Changes from the original app
* Complaints/services moved from PostgreSQL to MongoDB; users stay in PostgreSQL (rationale in `database/README.md`). **Existing data in the old PostgreSQL `complaints` / `service_requests` tables is not migrated automatically**; only the demo records are.
* Photos are stored in MongoDB (was base64 in a Postgres column) and served through an authenticated endpoint.
* Residents are linked to their records by user id (was matched by address text).
* Staff can now add notes (the original displayed notes but had no way to write them). A resident may not hold two open requests for the same service (previously enforced only in the browser).
* The admin account is no longer auto-created with a known password on startup; use `npm run seed`.
* "Reset demo data" now only adds missing sample records. The old endpoint deleted every complaint and service request, contradicting its own confirmation text.
* Staff signup tab removed from the public form (it only ever returned an error).
