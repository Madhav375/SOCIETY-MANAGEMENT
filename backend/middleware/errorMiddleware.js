const multer = require("multer");
const { config } = require("../config/env");

function notFound(req, res) {
  res.status(404).json({ ok: false, error: "Not found." });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    const msg =
      err.code === "LIMIT_FILE_SIZE"
        ? `Photo is too large. Please choose an image under ${Math.round(config.maxUploadBytes / 1048576)} MB.`
        : "Upload failed.";
    return res.status(err.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({ ok: false, error: msg });
  }
  if (err.type === "entity.parse.failed") return res.status(400).json({ ok: false, error: "Invalid JSON body." });
  if (err.message === "Not allowed by CORS") return res.status(403).json({ ok: false, error: "Origin not allowed." });

  // Postgres unique violation (e.g. duplicate address)
  if (err.code === "23505") return res.status(409).json({ ok: false, error: "That record already exists." });

  const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 500;
  if (status >= 500) console.error(err);
  const message = err.expose || status < 500 ? err.message : config.isProd ? "Server error." : err.message || "Server error.";
  res.status(status).json({ ok: false, error: message });
}

module.exports = { notFound, errorHandler };
