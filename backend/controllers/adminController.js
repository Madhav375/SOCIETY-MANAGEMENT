const Complaint = require("../models/Complaint");
const ServiceRequest = require("../models/ServiceRequest");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { config } = require("../config/env");
const { complaintShape } = require("../utils/shapes");
const { ensureDemoRecords } = require("../services/demoData");
const { logActivity } = require("../utils/activity");

/** Society-wide statistics: Mongo aggregations + a resident count from PostgreSQL. */
exports.dashboard = asyncHandler(async (req, res) => {
  const [byStatus, byCategory, serviceByStatus, oldest, residents] = await Promise.all([
    Complaint.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
    Complaint.aggregate([{ $group: { _id: "$category", n: { $sum: 1 } } }, { $sort: { n: -1 } }]),
    ServiceRequest.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
    Complaint.findOne({ status: { $ne: "Resolved" } }).sort({ createdAt: 1 }).lean(),
    User.countResidents(),
  ]);
  const n = (rows, k) => (rows.find((x) => x._id === k) || {}).n || 0;
  res.json({
    ok: true,
    residents,
    complaints: {
      pending: n(byStatus, "Pending"),
      inProgress: n(byStatus, "In progress"),
      resolved: n(byStatus, "Resolved"),
      total: byStatus.reduce((a, x) => a + x.n, 0),
      byCategory: byCategory.map((x) => ({ category: x._id, count: x.n })),
      oldestOpen: oldest ? complaintShape(oldest) : null,
    },
    services: {
      requested: n(serviceByStatus, "Requested"),
      inProgress: n(serviceByStatus, "In progress"),
      provided: n(serviceByStatus, "Provided"),
      total: serviceByStatus.reduce((a, x) => a + x.n, 0),
    },
  });
});

exports.users = asyncHandler(async (req, res) => {
  const rows = await User.listResidents();
  res.json({
    ok: true,
    users: rows.map((u) => ({ id: u.id, name: u.name, address: u.address, phone: u.phone || "", joinedAt: new Date(u.created_at).getTime() })),
  });
});

/**
 * Adds any missing sample complaints/services for existing demo residents.
 * Never deletes real data. Disabled in production unless ALLOW_DEMO_RESET=true.
 */
exports.resetDemo = asyncHandler(async (req, res) => {
  if (config.isProd && process.env.ALLOW_DEMO_RESET !== "true") throw new HttpError(403, "Demo data is disabled in production.");
  const added = await ensureDemoRecords();
  logActivity({ action: "demo.reset", entityType: "system", message: "Demo data refreshed", actorId: req.session.user.id, actorRole: "admin" });
  res.json({ ok: true, added: added.complaints + added.services, ...added });
});
