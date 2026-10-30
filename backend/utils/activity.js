const ActivityLog = require("../models/ActivityLog");

/**
 * Best-effort audit trail. The primary write (complaint/service) has already succeeded when this
 * runs; a failure here is logged but must not turn a successful request into an error.
 */
async function logActivity(entry) {
  try {
    await ActivityLog.create(entry);
  } catch (err) {
    console.error("Activity log write failed:", err.message);
  }
}

module.exports = { logActivity };
