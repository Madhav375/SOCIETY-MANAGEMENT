const bcrypt = require("bcryptjs");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { str } = require("../utils/validate");
const { logActivity } = require("../utils/activity");

const COOKIE_NAME = "smart_society.sid";
// Used to keep response time similar when the account does not exist.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

/** Replaces the session id on login/signup (prevents session fixation). */
function startSession(req, user) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) return reject(err);
      req.session.user = { id: user.id, role: user.role };
      req.session.save((err2) => (err2 ? reject(err2) : resolve()));
    });
  });
}

exports.signup = asyncHandler(async (req, res) => {
  const body = req.body || {};
  if (body.role === "admin")
    throw new HttpError(403, "Staff accounts can't be created here. Ask the society administrator.");

  const name = str(body.name, 120);
  const address = str(body.address, 180);
  const phone = str(body.phone, 30);
  const password = typeof body.password === "string" ? body.password : "";

  if (!name || !address) throw new HttpError(400, "Please fill in your name and address.");
  if (phone && !/^[0-9+\-\s()]{6,30}$/.test(phone)) throw new HttpError(400, "Enter a valid phone number.");
  if (password.length < 6) throw new HttpError(400, "Password should be at least 6 characters.");
  if (password.length > 72) throw new HttpError(400, "Password is too long (max 72 characters).");

  let user;
  try {
    user = await User.createResident({ name, address, phone, passwordHash: await bcrypt.hash(password, 10) });
  } catch (e) {
    if (e.code === "23505") throw new HttpError(409, "That address is already registered.");
    throw e;
  }
  await startSession(req, user);
  logActivity({
    action: "user.signup",
    entityType: "system",
    message: `${user.name} registered at ${user.address}`,
    residentId: user.id,
    actorId: user.id,
    actorRole: "resident",
  });
  res.status(201).json({ ok: true, user: User.toPublic(user) });
});

exports.login = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const role = body.role;
  const identifier = str(body.identifier, 180);
  const password = typeof body.password === "string" ? body.password : "";

  if (!["resident", "admin"].includes(role) || !identifier || !password)
    throw new HttpError(400, "Enter your ID/address and password.");

  const user = await User.findForLogin(role, identifier);
  const ok = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
  if (!user || !ok) throw new HttpError(401, "Wrong ID or password.");

  await startSession(req, user);
  res.json({ ok: true, user: User.toPublic(user) });
});

exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(new HttpError(500, "Could not log out."));
    res.clearCookie(COOKIE_NAME);
    res.json({ ok: true });
  });
};

exports.me = asyncHandler(async (req, res) => {
  if (!req.session.user) return res.json({ ok: true, user: null });
  const user = await User.findById(req.session.user.id);
  if (!user) {
    // account was removed while the session was alive
    return req.session.destroy(() => res.json({ ok: true, user: null }));
  }
  res.json({ ok: true, user: User.toPublic(user) });
});

exports.COOKIE_NAME = COOKIE_NAME;
