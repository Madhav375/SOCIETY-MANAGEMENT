const router = require("express").Router();
const adminOnly = require("../middleware/adminMiddleware");
const a = require("../controllers/adminController");

router.use(adminOnly);
router.get("/dashboard", a.dashboard);
router.get("/users", a.users);
router.post("/reset-demo", a.resetDemo);

module.exports = router;
