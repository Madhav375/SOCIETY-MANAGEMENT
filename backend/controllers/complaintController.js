const Complaint = require("../models/Complaint");
const ComplaintImage = require("../models/ComplaintImage");
const User = require("../models/User");
const { nextSequence } = require("../models/Counter");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { str, oneOf } = require("../utils/validate");
const { complaintShape } = require("../utils/shapes");
const { logActivity } = require("../utils/activity");

const { CATEGORIES, STATUSES, URGENCIES } = Complaint;

// Check real file signatures instead of trusting the client-supplied mimetype.
function sniffImageType(buf) {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.slice(0, 4).toString("ascii") === "GIF8") return "image/gif";
  if (buf.slice(0, 4).toString("ascii") === "RIFF" && buf.slice(8, 12).toString("ascii") === "WEBP") return "image/webp";
  return null;
}

exports.list = asyncHandler(async (req, res) => {
  const me = req.session.user;
  let filter;
  if (req.query.scope === "all") {
    if (me.role !== "admin") throw new HttpError(403, "Staff only.");
    filter = {};
  } else {
    filter = { residentId: me.id }; // residents only ever see their own complaints
  }
  const rows = await Complaint.find(filter).sort({ createdAt: -1 }).lean();
  res.json({ ok: true, complaints: rows.map(complaintShape) });
});

exports.create = asyncHandler(async (req, res) => {
  const b = req.body || {};
  const category = oneOf(str(b.category, 40), CATEGORIES, "category");
  const title = str(b.title, 180);
  if (!title) throw new HttpError(400, "Title and category are required.");
  const urgency = URGENCIES.includes(b.urgency) ? b.urgency : "Medium";
  const details = str(b.details, 4000);

  const user = await User.findById(req.session.user.id); // PostgreSQL
  if (!user) throw new HttpError(401, "Please sign in.");
  const address = str(b.address, 180) || user.address;

  // Optional photo (multer put it in req.file)
  let imageDoc = null;
  if (req.file) {
    const type = sniffImageType(req.file.buffer);
    if (!type) throw new HttpError(400, "Please choose a JPG, PNG, GIF or WebP image.");
    imageDoc = new ComplaintImage({ residentId: user.id, contentType: type, data: req.file.buffer });
  }

  const complaintId = "MG-B-" + String(await nextSequence("complaint")).padStart(4, "0");
  const now = new Date();

  // MongoDB write 1: image (compensated below if write 2 fails)
  if (imageDoc) {
    imageDoc.complaintId = complaintId;
    await imageDoc.save();
  }
  let complaint;
  try {
    // MongoDB write 2: the complaint itself
    complaint = await Complaint.create({
      complaintId,
      category,
      title,
      details,
      urgency,
      address,
      residentId: user.id,
      residentName: user.name,
      photo: imageDoc
        ? { imageId: imageDoc._id, contentType: imageDoc.contentType, size: req.file.size, originalName: str(req.file.originalname, 120) }
        : undefined,
      statusHistory: [{ status: "Pending", note: "Complaint submitted", by: user.name, at: now }],
    });
  } catch (err) {
    if (imageDoc) await ComplaintImage.deleteOne({ _id: imageDoc._id }).catch(() => {}); // compensation: no orphan image
    throw err;
  }

  logActivity({
    action: "complaint.created",
    entityType: "complaint",
    entityId: complaintId,
    message: `You raised complaint ${complaintId}: ${title}`,
    residentId: user.id,
    actorId: user.id,
    actorRole: "resident",
  });
  res.status(201).json({ ok: true, complaint: complaintShape(complaint) });
});

exports.update = asyncHandler(async (req, res) => {
  const b = req.body || {};
  const hasStatus = b.status !== undefined;
  const hasNote = b.note !== undefined;
  if (!hasStatus && !hasNote) throw new HttpError(400, "Nothing to update.");
  if (hasStatus && !STATUSES.includes(b.status)) throw new HttpError(400, "Invalid complaint status.");
  if (hasNote && typeof b.note !== "string") throw new HttpError(400, "Invalid note.");

  const complaint = await Complaint.findOne({ complaintId: String(req.params.id) });
  if (!complaint) throw new HttpError(404, "Complaint not found.");

  const admin = await User.findById(req.session.user.id);
  const by = admin ? admin.name : "RWA staff";
  const statusChanged = hasStatus && b.status !== complaint.status;
  if (hasNote) complaint.note = str(b.note, 2000);
  if (hasStatus) complaint.status = b.status;
  if (statusChanged || hasNote) {
    complaint.statusHistory.push({ status: complaint.status, note: complaint.note, by, at: new Date() });
  }
  await complaint.save();

  logActivity({
    action: statusChanged ? "complaint.status" : "complaint.note",
    entityType: "complaint",
    entityId: complaint.complaintId,
    message: statusChanged
      ? `${complaint.complaintId} marked ${complaint.status.toLowerCase()}`
      : `Staff added a note on ${complaint.complaintId}`,
    residentId: complaint.residentId,
    actorId: req.session.user.id,
    actorRole: "admin",
  });
  res.json({ ok: true, complaint: complaintShape(complaint) });
});

/** Streams the attached photo. Only the owner or staff may fetch it. */
exports.photo = asyncHandler(async (req, res) => {
  const me = req.session.user;
  const complaint = await Complaint.findOne({ complaintId: String(req.params.id) }).lean();
  if (!complaint || !complaint.photo || !complaint.photo.imageId) throw new HttpError(404, "No photo attached.");
  if (me.role !== "admin" && complaint.residentId !== me.id) throw new HttpError(403, "Not allowed.");
  // Not lean(): a hydrated document returns a real Node Buffer for the data field.
  const img = await ComplaintImage.findById(complaint.photo.imageId);
  if (!img) throw new HttpError(404, "No photo attached.");
  const bytes = Buffer.from(img.data);
  res.set({
    "Content-Type": img.contentType,
    "Content-Length": bytes.length,
    "Cache-Control": "private, max-age=3600",
    "Cross-Origin-Resource-Policy": "cross-origin",
    "X-Content-Type-Options": "nosniff",
  });
  res.send(bytes);
});
