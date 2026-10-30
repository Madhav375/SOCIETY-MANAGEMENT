const { mongoose } = require("../config/mongodb");

const SERVICE_CATALOG = {
  gardening: { name: "Gardening", category: "Maintenance" },
  plumbing: { name: "Plumbing", category: "Water" },
  electricity: { name: "Electricity", category: "Electricity" },
  househelp: { name: "Househelp", category: "Cleanliness" },
};
const STATUSES = ["Requested", "In progress", "Provided", "Completed", "Cancelled"];
const OPEN_STATUSES = ["Requested", "In progress"];

const schema = new mongoose.Schema(
  {
    serviceId: { type: String, enum: Object.keys(SERVICE_CATALOG), required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    status: { type: String, enum: STATUSES, default: "Requested", index: true },
    note: { type: String, default: "", maxlength: 2000 },
    address: { type: String, required: true },
    residentId: { type: Number, index: true }, // PostgreSQL society_users.id
    addedBy: { type: String, required: true },
    statusHistory: {
      type: [{ status: String, note: String, by: String, at: { type: Date, default: Date.now }, _id: false }],
      default: [],
    },
  },
  { timestamps: true }
);

schema.index({ residentId: 1, createdAt: -1 });

module.exports = mongoose.model("ServiceRequest", schema);
module.exports.SERVICE_CATALOG = SERVICE_CATALOG;
module.exports.STATUSES = STATUSES;
module.exports.OPEN_STATUSES = OPEN_STATUSES;
