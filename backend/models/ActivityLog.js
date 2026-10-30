const { mongoose } = require("../config/mongodb");

const schema = new mongoose.Schema(
  {
    action: { type: String, required: true }, // e.g. complaint.created, complaint.status, service.requested
    entityType: { type: String, enum: ["complaint", "service", "system"], required: true },
    entityId: { type: String, default: "" },
    message: { type: String, required: true },
    residentId: { type: Number, index: true }, // whose record this concerns (so residents see their own feed)
    actorId: Number,
    actorRole: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

schema.index({ createdAt: -1 });

module.exports = mongoose.model("ActivityLog", schema);
