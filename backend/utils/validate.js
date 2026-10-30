const HttpError = require("./httpError");

/** Returns a trimmed string (never an object, which also blocks NoSQL operator injection). */
const str = (v, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function oneOf(value, allowed, label) {
  if (!allowed.includes(value)) throw new HttpError(400, `Invalid ${label}.`);
  return value;
}

function required(value, message) {
  if (!value) throw new HttpError(400, message);
  return value;
}

module.exports = { str, oneOf, required };
