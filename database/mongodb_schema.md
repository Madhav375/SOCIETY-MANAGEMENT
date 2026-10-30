# MongoDB collections

Database name comes from `MONGODB_URI` (e.g. `.../smart_society`). Mongoose creates collections and indexes automatically.

## `complaints`
| Field | Type | Notes |
|---|---|---|
| `complaintId` | String, unique | `MG-B-0147` style, from `counters` |
| `category` | enum | Maintenance, Water, Electricity, Cleanliness, Security, Other |
| `title` | String ≤180 | |
| `details` | String ≤4000 | |
| `urgency` | enum | Low, Medium, High |
| `status` | enum, indexed | Pending, In progress, Resolved |
| `note` | String ≤2000 | latest staff note |
| `address` | String | |
| `residentId` | Number, indexed | PostgreSQL `society_users.id` |
| `residentName` | String | denormalised for the admin table |
| `photo` | `{imageId, contentType, size, originalName}` | metadata only |
| `statusHistory[]` | `{status, note, by, at}` | one entry per status/note change |
| `createdAt`, `updatedAt` | Date | Mongoose timestamps |

Index: `{residentId: 1, createdAt: -1}`.

## `complaintimages`
`{complaintId, residentId, contentType, data: Buffer, createdAt}`. Served only through the authenticated `GET /api/complaints/:id/photo` (owner or staff).

## `servicerequests`
`{serviceId (gardening|plumbing|electricity|househelp), name, category, status (Requested|In progress|Provided|Completed|Cancelled), note, address, residentId, addedBy, statusHistory[], createdAt, updatedAt}`.
A resident can have one *open* (Requested / In progress) request per service; a new one is allowed after Provided / Completed / Cancelled.

## `activitylogs`
`{action, entityType (complaint|service|system), entityId, message, residentId, actorId, actorRole, createdAt}`. Powers "Recent activity" on the resident dashboard.

## `counters`
`{_id: "complaint", seq: Number}`: atomic sequence for complaint ids.
