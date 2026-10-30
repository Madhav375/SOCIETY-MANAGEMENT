// Creates the admin account, demo residents and sample complaints/services. Idempotent.
//   npm run seed
// Development: falls back to admin1234 / demo1234 unless SEED_* variables are set.
// Production : never uses default passwords. Set SEED_ADMIN_PASSWORD / SEED_RESIDENT_PASSWORD,
//              otherwise random passwords are generated and printed once.
const crypto = require("crypto");
const { config, assertConfig } = require("../config/env");
const { connectMongo, mongoose } = require("../config/mongodb");
const { initPostgres, pool } = require("../config/postgres");
const { ensureAdmin, ensureDemoResidents, ensureDemoRecords } = require("../services/demoData");

function pick(envValue, devDefault) {
  if (envValue) return { value: envValue, generated: false };
  if (!config.isProd) return { value: devDefault, generated: false };
  return { value: crypto.randomBytes(9).toString("base64url"), generated: true };
}

(async () => {
  assertConfig();
  await initPostgres();
  await connectMongo();

  const admin = pick(process.env.SEED_ADMIN_PASSWORD, "admin1234");
  const resident = pick(process.env.SEED_RESIDENT_PASSWORD, "demo1234");

  const adminCreated = await ensureAdmin(admin.value);
  const residentsCreated = await ensureDemoResidents(resident.value);
  const { complaints, services } = await ensureDemoRecords();

  console.log(`Admin RWA-01: ${adminCreated ? "created" : "already exists"}`);
  console.log(`Demo residents created: ${residentsCreated}`);
  console.log(`Demo complaints added: ${complaints}, services added: ${services}`);
  if (adminCreated && admin.generated) console.log(`Generated admin password (shown once): ${admin.value}`);
  if (residentsCreated && resident.generated) console.log(`Generated demo resident password (shown once): ${resident.value}`);
  if (!config.isProd) console.log("Development logins -> admin: RWA-01 / admin1234, resident: B-10, Mayfield Gardens / demo1234");

  await pool.end();
  await mongoose.disconnect();
})().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
