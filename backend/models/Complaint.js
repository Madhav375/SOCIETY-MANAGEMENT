const { mongoose } = require("../config/mongodb");

const CATEGORIES = ["Maintenance", "Water", "Electricity", "Cleanliness", "Security", "Other"];
const STATUSES = ["Pending", "In progress", "Resolved"];
const URGENCIES = ["Low", "Medium", "High"];

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: STATUSES, required: true },
    note: { type: String, default: "" },
    by: { type: String, default: "" }, // display name of whoever made the change
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    // Human-friendly unique id, e.g. MG-B-0147 (generated from the counters collection)
    complaintId: { type: String, required: true, unique: true, index: true },
    category: { type: String, enum: CATEGORIES, required: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    details: { type: String, default: "", maxlength: 4000 },
    urgency: { type: String, enum: URGENCIES, default: "Medium" },
    status: { type: String, enum: STATUSES, default: "Pending", index: true },
    note: { type: String, default: "", maxlength: 2000 }, // staff note
    address: { type: String, required: true, trim: true },
    // Link to the PostgreSQL society_users.id of the resident who raised it
    residentId: { type: Number, index: true },
    residentName: { type: String, required: true },
    // Image metadata; the bytes live in the ComplaintImage collection
    photo: {
      imageId: { type: mongoose.Schema.Types.ObjectId, ref: "ComplaintImage" },
      contentType: String,
      size: Number,
      originalName: String,
    },
    statusHistory: { type: [statusHistorySchema], default: [] },
  },
  { timestamps: true }
);

complaintSchema.index({ residentId: 1, createdAt: -1 });

module.exports = mongoose.model("Complaint", complaintSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.STATUSES = STATUSES;
module.exports.URGENCIES = URGENCIES;
