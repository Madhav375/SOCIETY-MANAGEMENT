// Central, validated environment configuration.
require("dotenv").config();

const isProd = process.env.NODE_ENV === "production";

const config = {
  isProd,
  port: Number(process.env.PORT || 3000),
  sessionSecret: process.env.SESSION_SECRET || "",
  frontendUrls: (process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean),
  mongoUri: process.env.MONGODB_URI || "",
  databaseUrl: process.env.DATABASE_URL || "",
  pgSsl: process.env.PGSSL === "true",
  maxUploadBytes: Math.max(1, Number(process.env.MAX_UPLOAD_MB || 2)) * 1024 * 1024,
};

/** Throws a readable error when required configuration is missing. */
function assertConfig() {
  const missing = [];
  if (!config.mongoUri) missing.push("MONGODB_URI");
  if (!config.databaseUrl) missing.push("DATABASE_URL");
  if (!config.sessionSecret || config.sessionSecret === "replace_with_a_secure_secret") {
    if (isProd) missing.push("SESSION_SECRET");
    else config.sessionSecret = "dev-only-insecure-secret";
  }
  if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  if (isProd) {
    const local = /localhost|127\.0\.0\.1/;
    if (local.test(config.mongoUri) || local.test(config.databaseUrl))
      throw new Error("Production must not use localhost database URLs.");
  }
}

module.exports = { config, assertConfig };
