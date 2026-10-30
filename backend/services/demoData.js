// Demo data migrated from the original single-file app. Safe to run repeatedly (no duplicates).
const bcrypt = require("bcryptjs");
const { pool } = require("../config/postgres");
const Complaint = require("../models/Complaint");
const ServiceRequest = require("../models/ServiceRequest");
const Counter = require("../models/Counter");

const DAY = 86400000;

const DEMO_RESIDENTS = [
  ["B-10, Mayfield Gardens", "Demo Resident B-10"],
  ["B-702, Mayfield Gardens", "Demo Resident B-702"],
  ["B-108, Mayfield Gardens", "Demo Resident B-108"],
  ["B-201, Mayfield Gardens", "Demo Resident B-201"],
  ["B-609, Mayfield Gardens", "Demo Resident B-609"],
];

// [number, category, address, title, status, urgency, daysAgo, staffNote]
const DEMO_COMPLAINTS = [
  [146, "Water", "B-10, Mayfield Gardens", "No water supply on 3rd floor since morning", "In progress", "High", 0, "Booster pump valve being replaced."],
  [145, "Maintenance", "B-702, Mayfield Gardens", "Lift stops between 6th and 7th floor", "Pending", "High", 1, ""],
  [144, "Cleanliness", "B-108, Mayfield Gardens", "Garbage not collected from basement bay", "Pending", "Medium", 1, ""],
  [143, "Electricity", "B-10, Mayfield Gardens", "Corridor lights out on 3rd floor", "In progress", "Medium", 2, "Two fittings replaced, third on order."],
  [142, "Other", "B-201, Mayfield Gardens", "Visitor car parked in allotted slot 14", "Resolved", "Low", 3, "Vehicle moved, sticker rule shared with owner."],
  [140, "Security", "B-609, Mayfield Gardens", "Intercom not connecting to guard room", "Resolved", "Medium", 6, "Line re-terminated at the DP box."],
  [139, "Water", "B-10, Mayfield Gardens", "Leaking tap in the kitchen", "Resolved", "Low", 8, "Washer changed."],
];

// [serviceId, address, status, note, addedDaysAgo, updatedDaysAgo]
const DEMO_SERVICES = [
  ["gardening", "B-10, Mayfield Gardens", "Requested", "", 1, 1],
  ["plumbing", "B-702, Mayfield Gardens", "In progress", "Plumber visiting tomorrow.", 2, 1],
];

async function ensureAdmin(password) {
  const r = await pool.query("SELECT id FROM society_users WHERE LOWER(staff_id) = 'rwa-01'");
  if (r.rowCount) return false;
  await pool.query("INSERT INTO society_users (role, name, staff_id, password_hash) VALUES ('admin', $1, 'RWA-01', $2)", [
    "RWA Admin",
    await bcrypt.hash(password, 10),
  ]);
  return true;
}

async function ensureDemoResidents(password) {
  const hash = await bcrypt.hash(password, 10);
  let created = 0;
  for (const [address, name] of DEMO_RESIDENTS) {
    const r = await pool.query(
      `INSERT INTO society_users (role, name, address, phone, password_hash) VALUES ('resident', $1, $2, '', $3)
       ON CONFLICT (LOWER(address)) WHERE address IS NOT NULL DO NOTHING`,
      [name, address, hash]
    );
    created += r.rowCount;
  }
  return created;
}

async function residentsByAddress() {
  const r = await pool.query("SELECT id, name, address FROM society_users WHERE role = 'resident'");
  return new Map(r.rows.map((u) => [u.address.toLowerCase(), u]));
}

/** Inserts missing demo complaints/services for demo residents that exist. Never updates or deletes. */
async function ensureDemoRecords() {
  const users = await residentsByAddress();
  const now = Date.now();
  let complaints = 0;
  let services = 0;

  for (const [n, category, address, title, status, urgency, days, note] of DEMO_COMPLAINTS) {
    const u = users.get(address.toLowerCase());
    if (!u) continue;
    const at = new Date(now - days * DAY);
    const complaintId = "MG-B-" + String(n).padStart(4, "0");
    const r = await Complaint.updateOne(
      { complaintId },
      {
        $setOnInsert: {
          complaintId, category, title, details: "", urgency, status, note, address,
          residentId: u.id, residentName: u.name, createdAt: at, updatedAt: at,
          statusHistory: [{ status: "Pending", note: "Complaint submitted", by: u.name, at }].concat(
            status === "Pending" ? [] : [{ status, note, by: "RWA Admin", at }]
          ),
        },
      },
      { upsert: true, timestamps: false }
    );
    complaints += r.upsertedCount || 0;
  }
  // new complaints continue from MG-B-0147
  await Counter.updateOne({ _id: "complaint" }, { $max: { seq: 146 } }, { upsert: true });

  for (const [serviceId, address, status, note, added, updated] of DEMO_SERVICES) {
    const u = users.get(address.toLowerCase());
    if (!u) continue;
    const exists = await ServiceRequest.exists({ residentId: u.id, serviceId });
    if (exists) continue;
    const info = ServiceRequest.SERVICE_CATALOG[serviceId];
    const createdAt = new Date(now - added * DAY);
    const updatedAt = new Date(now - updated * DAY);
    await ServiceRequest.collection.insertOne({
      serviceId, name: info.name, category: info.category, status, note, address,
      residentId: u.id, addedBy: u.name, createdAt, updatedAt,
      statusHistory: [{ status, note, by: "RWA Admin", at: updatedAt }], __v: 0,
    });
    services += 1;
  }
  return { complaints, services };
}

module.exports = { ensureAdmin, ensureDemoResidents, ensureDemoRecords, DEMO_RESIDENTS };
