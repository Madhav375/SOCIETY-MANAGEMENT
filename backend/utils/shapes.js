// Converts database documents into the JSON shapes the frontend expects
// (same field names the original single-file app used: cat, ts, updatedTs, addedAt...).
const ms = (d) => (d ? new Date(d).getTime() : 0);

const complaintShape = (c) => ({
  id: c.complaintId,
  cat: c.category,
  category: c.category,
  address: c.address,
  title: c.title,
  details: c.details || "",
  status: c.status,
  urgency: c.urgency,
  note: c.note || "",
  ts: ms(c.createdAt),
  updatedTs: ms(c.updatedAt),
  resident: c.residentName,
  hasPhoto: Boolean(c.photo && c.photo.imageId),
  statusHistory: (c.statusHistory || []).map((h) => ({ status: h.status, note: h.note, by: h.by, at: ms(h.at) })),
});

const serviceShape = (s) => ({
  id: String(s._id),
  serviceId: s.serviceId,
  name: s.name,
  category: s.category,
  status: s.status,
  note: s.note || "",
  addedAt: ms(s.createdAt),
  updatedAt: ms(s.updatedAt),
  addedBy: s.addedBy,
  address: s.address,
});

const activityShape = (a) => ({
  id: String(a._id),
  action: a.action,
  entityType: a.entityType,
  entityId: a.entityId,
  message: a.message,
  ts: ms(a.createdAt),
});

module.exports = { complaintShape, serviceShape, activityShape };
