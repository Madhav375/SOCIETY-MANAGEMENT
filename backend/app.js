// Express application (no network binding here, so it can be tested).
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);

const { config } = require("./config/env");
const { pool, pingPostgres } = require("./config/postgres");
const { pingMongo } = require("./config/mongodb");
const requireCustomHeader = require("./middleware/csrfMiddleware");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { COOKIE_NAME } = require("./controllers/authController");

function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1); // Render terminates TLS in front of the app

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin(origin, cb) {
        // allow non-browser clients (no Origin header) and the configured frontend(s)
        if (!origin || config.frontendUrls.includes(origin)) return cb(null, true);
        cb(new Error("Not allowed by CORS"));
      },
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "X-Requested-With"],
    })
  );
  app.use(express.json({ limit: "100kb" }));

  // Frontend (Vercel) and backend (Render) are different sites in production,
  // so the cookie must be SameSite=None; Secure. Locally Lax over http works.
  app.use(
    session({
      name: COOKIE_NAME,
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      store: new PgSession({ pool, tableName: "user_sessions", createTableIfMissing: false }),
      proxy: true,
      cookie: {
        httpOnly: true,
        secure: config.isProd,
        sameSite: config.isProd ? "none" : "lax",
        maxAge: 8 * 60 * 60 * 1000,
      },
    })
  );

  app.get("/", (req, res) => res.json({ ok: true, name: "Smart Society API" }));
  app.get("/api/health", async (req, res) => {
    const status = { ok: true, mongodb: false, postgres: false };
    try { status.mongodb = await pingMongo(); } catch (e) { /* reported below */ }
    try { status.postgres = await pingPostgres(); } catch (e) { /* reported below */ }
    status.ok = status.mongodb && status.postgres;
    res.status(status.ok ? 200 : 503).json(status);
  });

  app.use("/api", requireCustomHeader);
  app.use("/api/auth", require("./routes/authRoutes"));
  app.use("/api/dashboard", require("./routes/dashboardRoutes"));
  app.use("/api/complaints", require("./routes/complaintRoutes"));
  app.use("/api/services", require("./routes/serviceRoutes"));
  app.use("/api/admin", require("./routes/adminRoutes"));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = createApp;
