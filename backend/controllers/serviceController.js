const ServiceRequest = require("../models/ServiceRequest");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { str } = require("../utils/validate");
const { serviceShape } = require("../utils/shapes");
const { logActivity } = require("../utils/activity");

const { SERVICE_CATALOG, STATUSES, OPEN_STATUSES } = ServiceRequest;

/** Resident: their own request history. */
exports.listMine = asyncHandler(async (req, res) => {
  const rows = await ServiceRequest.find({ residentId: req.session.user.id }).sort({ createdAt: -1 }).lean();
  res.json({ ok: true, services: rows.map(serviceShape) });
});

/** Resident: request a service. */
exports.create = asyncHandler(async (req, res) => {
  const key = str(req.body && req.body.serviceId, 40);
  const info = Object.prototype.hasOwnProperty.call(SERVICE_CATALOG, key) ? SERVICE_CATALOG[key] : null;
  if (!info) throw new HttpError(400, "Unknown service.");

  const user = await User.findById(req.session.user.id);
  if (!user) throw new HttpError(401, "Please sign in.");

  // One open request per service; a new one is allowed once the last is Provided/Completed/Cancelled.
  const open = await ServiceRequest.exists({ residentId: user.id, serviceId: key, status: { $in: OPEN_STATUSES } });
  if (open) throw new HttpError(409, `You already have an open ${info.name} request.`);

  const doc = await ServiceRequest.create({
    serviceId: key,
    name: info.name,
    category: info.category,
    address: user.address,
    residentId: user.id,
    addedBy: user.name,
    statusHistory: [{ status: "Requested", note: "", by: user.name, at: new Date() }],
  });
  logActivity({
    action: "service.requested",
    entityType: "service",
    entityId: String(doc._id),
    message: `You requested ${info.name} service`,
    residentId: user.id,
    actorId: user.id,
    actorRole: "resident",
  });
  res.status(201).json({ ok: true, service: serviceShape(doc) });
});

/** Admin: every request. */
exports.listAll = asyncHandler(async (req, res) => {
  const rows = await ServiceRequest.find({}).sort({ createdAt: -1 }).lean();
  res.json({ ok: true, services: rows.map(serviceShape) });
});

/** Admin: change status and/or staff note. */
exports.update = asyncHandler(async (req, res) => {
  const b = req.body || {};
  if (b.status === undefined && b.note === undefined) throw new HttpError(400, "Nothing to update.");
  if (b.status !== undefined && !STATUSES.includes(b.status)) throw new HttpError(400, "Invalid service status.");
  if (b.note !== undefined && typeof b.note !== "string") throw new HttpError(400, "Invalid note.");
  if (!/^[a-f0-9]{24}$/i.test(String(req.params.id))) throw new HttpError(404, "Service request not found.");

  const doc = await ServiceRequest.findById(req.params.id);
  if (!doc) throw new HttpError(404, "Service request not found.");

  const admin = await User.findById(req.session.user.id);
  const statusChanged = b.status !== undefined && b.status !== doc.status;
  if (b.note !== undefined) doc.note = str(b.note, 2000);
  if (b.status !== undefined) doc.status = b.status;
  if (statusChanged || b.note !== undefined)
    doc.statusHistory.push({ status: doc.status, note: doc.note, by: admin ? admin.name : "RWA staff", at: new Date() });
  await doc.save();

  logActivity({
    action: statusChanged ? "service.status" : "service.note",
    entityType: "service",
    entityId: String(doc._id),
    message: statusChanged ? `${doc.name} request marked ${doc.status.toLowerCase()}` : `Staff added a note on your ${doc.name} request`,
    residentId: doc.residentId,
    actorId: req.session.user.id,
    actorRole: "admin",
  });
  res.json({ ok: true, service: serviceShape(doc) });
});
