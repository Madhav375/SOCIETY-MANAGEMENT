const router = require("express").Router();
const multer = require("multer");
const { config } = require("../config/env");
const { signedIn, residentOnly } = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const c = require("../controllers/complaintController");

// Memory storage + hard size limit. Bytes are persisted to MongoDB by the controller.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: config.maxUploadBytes, files: 1, fields: 10 } });

router.get("/", signedIn, c.list);
router.post("/", residentOnly, upload.single("photo"), c.create);
router.get("/:id/photo", signedIn, c.photo);
router.patch("/:id", adminOnly, c.update);

module.exports = router;
