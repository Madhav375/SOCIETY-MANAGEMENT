const HttpError = require("../utils/httpError");

/** Any signed-in user. */
function signedIn(req, res, next) {
  if (!req.session || !req.session.user) return next(new HttpError(401, "Please sign in."));
  next();
}

/** Residents only (admins use the staff desk). */
function residentOnly(req, res, next) {
  if (!req.session || !req.session.user) return next(new HttpError(401, "Please sign in."));
  if (req.session.user.role !== "resident") return next(new HttpError(403, "Residents only."));
  next();
}

module.exports = { signedIn, residentOnly };
