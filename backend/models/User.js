// PostgreSQL-backed user model (table: society_users). Thin data-access layer around pg.
const { pool } = require("../config/postgres");

/** Public shape sent to the frontend. Never includes the password hash. */
const toPublic = (u) =>
  u && {
    id: u.id,
    role: u.role,
    name: u.name,
    address: u.address || "",
    phone: u.phone || "",
    staffId: u.staff_id || "",
  };

const User = {
  toPublic,

  async findById(id) {
    const r = await pool.query("SELECT * FROM society_users WHERE id = $1", [id]);
    return r.rows[0] || null;
  },

  async findForLogin(role, identifier) {
    const col = role === "admin" ? "staff_id" : "address"; // fixed whitelist, never user input
    const r = await pool.query(`SELECT * FROM society_users WHERE role = $1 AND LOWER(${col}) = LOWER($2) LIMIT 1`, [
      role,
      identifier,
    ]);
    return r.rows[0] || null;
  },

  async createResident({ name, address, phone, passwordHash }) {
    const r = await pool.query(
      "INSERT INTO society_users (role, name, address, phone, password_hash) VALUES ('resident', $1, $2, $3, $4) RETURNING *",
      [name, address, phone, passwordHash]
    );
    return r.rows[0];
  },

  async listResidents() {
    const r = await pool.query(
      "SELECT id, name, address, phone, created_at FROM society_users WHERE role = 'resident' ORDER BY LOWER(address)"
    );
    return r.rows;
  },

  async countResidents() {
    const r = await pool.query("SELECT COUNT(*)::int AS n FROM society_users WHERE role = 'resident'");
    return r.rows[0].n;
  },
};

module.exports = User;
