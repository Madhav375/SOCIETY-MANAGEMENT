const router = require("express").Router();
const { residentOnly } = require("../middleware/authMiddleware");
const d = require("../controllers/dashboardController");

router.get("/", residentOnly, d.resident);

module.exports = router;
