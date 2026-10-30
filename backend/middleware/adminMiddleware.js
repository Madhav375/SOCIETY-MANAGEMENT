const HttpError = require("../utils/httpError");

function adminOnly(req, res, next) {
  if (!req.session || !req.session.user) return next(new HttpError(401, "Please sign in."));
  if (req.session.user.role !== "admin") return next(new HttpError(403, "Staff only."));
  next();
}

module.exports = adminOnly;
