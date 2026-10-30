const { config, assertConfig } = require("./config/env");
const { connectMongo } = require("./config/mongodb");
const { initPostgres, pool } = require("./config/postgres");
const createApp = require("./app");

async function start() {
  assertConfig();
  // Both databases must be reachable. Failing fast is better than serving half-working requests.
  await initPostgres();
  await connectMongo();

  const app = createApp();
  const server = app.listen(config.port, "0.0.0.0", () => console.log(`Smart Society API listening on port ${config.port}`));

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down`);
    server.close(async () => {
      await pool.end().catch(() => {});
      require("mongoose").disconnect().finally(() => process.exit(0));
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

start().catch((err) => {
  console.error("Startup failed:", err.message);
  process.exit(1);
});
