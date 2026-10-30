const router = require("express").Router();
const { signedIn, residentOnly } = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const s = require("../controllers/serviceController");

router.get("/", signedIn, s.listMine);
router.post("/", residentOnly, s.create);
router.get("/all", adminOnly, s.listAll); // must stay above "/:id"
router.patch("/:id", adminOnly, s.update);

module.exports = router;
