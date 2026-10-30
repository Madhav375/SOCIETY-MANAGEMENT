const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const auth = require("../controllers/authController");

// Brute-force protection on credential endpoints.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: "Too many attempts. Please try again in a few minutes." },
});

router.post("/signup", authLimiter, auth.signup);
router.post("/login", authLimiter, auth.login);
router.post("/logout", auth.logout);
router.get("/me", auth.me);

module.exports = router;
