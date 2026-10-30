const HttpError = require("../utils/httpError");

/**
 * CSRF defence for cookie sessions that must work cross-site (SameSite=None).
 * State-changing requests must carry a custom header. A custom header forces a CORS preflight,
 * and the preflight only succeeds for origins listed in FRONTEND_URL, so other websites cannot forge requests.
 */
function requireCustomHeader(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  if (req.get("X-Requested-With") !== "fetch") return next(new HttpError(403, "Missing request header."));
  next();
}

module.exports = requireCustomHeader;
