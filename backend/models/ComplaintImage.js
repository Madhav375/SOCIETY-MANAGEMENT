const { mongoose } = require("../config/mongodb");

// Render's disk is ephemeral, so uploaded images are stored in MongoDB (limit: MAX_UPLOAD_MB, default 2 MB).
// Kept in their own collection so list queries on complaints never load image bytes.
const schema = new mongoose.Schema(
  {
    complaintId: { type: String, index: true },
    residentId: { type: Number },
    contentType: { type: String, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ComplaintImage", schema);
