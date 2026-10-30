const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const { config } = require("./env");

const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.pgSsl ? { rejectUnauthorized: false } : undefined,
  max: 10,
  connectionTimeoutMillis: 10000,
});

// A dropped idle client must not crash the process.
pool.on("error", (err) => console.error("PostgreSQL idle client error:", err.message));

/** Idempotent: creates tables and indexes if they do not exist yet. */
async function initPostgres() {
  const sql = fs.readFileSync(path.join(__dirname, "..", "sql", "postgres_schema.sql"), "utf8");
  await pool.query(sql);
  console.log("PostgreSQL connected, schema ready");
}

async function pingPostgres() {
  await pool.query("SELECT 1");
  return true;
}

module.exports = { pool, initPostgres, pingPostgres };
