# Database layer

Smart Society uses two databases. **Only the backend talks to them**; the React app never holds a connection string.

| Data | Database | Why |
|---|---|---|
| Users (residents + RWA staff), roles, addresses | **PostgreSQL** `society_users` | Relational, strictly structured, needs unique constraints (one account per address / staff id) and a role check |
| Login sessions | **PostgreSQL** `user_sessions` | Same engine as users; sessions survive restarts and work across instances (no in-memory store) |
| Complaints, status history, staff notes | **MongoDB** `complaints` | Document-shaped, with an embedded history array that grows per complaint |
| Complaint photos | **MongoDB** `complaintimages` | Render's disk is ephemeral; images ≤ 2 MB live in their own collection so list queries never load bytes |
| Service requests | **MongoDB** `servicerequests` | Same shape as complaints |
| Activity log | **MongoDB** `activitylogs` | Append-only feed shown on the resident dashboard |
| Complaint id sequence (`MG-B-0147`…) | **MongoDB** `counters` | Atomic `$inc`, safe under concurrent requests |

The original app kept everything in PostgreSQL. Complaints and service requests moved to MongoDB per the new architecture; users stayed relational.

## Cross-database consistency

Records in MongoDB point at users with a plain number, `residentId` = `society_users.id`. There is no cross-database foreign key, so:

* Every **write** touches one database. Signup writes PostgreSQL only; creating a complaint/service writes MongoDB only. No distributed transaction is needed.
* The one multi-write case is *complaint + photo* (two MongoDB collections). The image is saved first, then the complaint; if the complaint insert fails, the image is deleted (compensation), so there are no orphan images and no complaint pointing at a missing image.
* **Reads** that need both (the complaint create flow reads the user's name/address from PostgreSQL, the admin dashboard combines Mongo aggregates with a PostgreSQL resident count). If either database is down the request fails with an error; nothing pretends to succeed. `GET /api/health` reports each database separately (HTTP 503 if either is down).
* The activity log is a best-effort audit trail written *after* the primary write succeeded. A failure is logged server-side and does not fail the user's request.
* Residents are never deleted by the app, so `residentId` references cannot dangle.

## Setup

* PostgreSQL: the backend runs `postgres_schema.sql` on startup (idempotent). To run it by hand: `psql "$DATABASE_URL" -f postgres_schema.sql`. *The canonical copy used at runtime is `backend/sql/postgres_schema.sql`; keep both files identical.*
* MongoDB: collections and indexes are created by Mongoose on first use. See `mongodb_schema.md`.
* Demo data: `cd backend && npm run seed`.
