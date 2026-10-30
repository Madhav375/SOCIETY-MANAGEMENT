// Resident dashboard: everything the home page needs in one request.
const Complaint = require("../models/Complaint");
const ServiceRequest = require("../models/ServiceRequest");
const ActivityLog = require("../models/ActivityLog");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { complaintShape, serviceShape, activityShape } = require("../utils/shapes");

exports.resident = asyncHandler(async (req, res) => {
  const id = req.session.user.id;
  const user = await User.findById(id);
  if (!user) throw new HttpError(401, "Please sign in.");

  const [byStatus, recent, services, activity] = await Promise.all([
    Complaint.aggregate([{ $match: { residentId: id } }, { $group: { _id: "$status", n: { $sum: 1 } } }]),
    Complaint.find({ residentId: id }).sort({ createdAt: -1 }).limit(4).lean(),
    ServiceRequest.find({ residentId: id }).sort({ createdAt: -1 }).lean(),
    ActivityLog.find({ residentId: id }).sort({ createdAt: -1 }).limit(6).lean(),
  ]);
  const n = (s) => (byStatus.find((x) => x._id === s) || {}).n || 0;

  res.json({
    ok: true,
    resident: User.toPublic(user),
    complaints: { pending: n("Pending"), inProgress: n("In progress"), resolved: n("Resolved"), total: byStatus.reduce((a, x) => a + x.n, 0) },
    services: {
      total: services.length,
      open: services.filter((s) => ["Requested", "In progress"].includes(s.status)).length,
      recent: services.slice(0, 3).map(serviceShape),
    },
    recentComplaints: recent.map(complaintShape),
    activity: activity.map(activityShape),
  });
});
