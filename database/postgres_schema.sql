-- Smart Society: PostgreSQL schema (relational data: users, roles, sessions)
-- Idempotent. Run automatically at server start, or manually: psql $DATABASE_URL -f postgres_schema.sql

CREATE TABLE IF NOT EXISTS society_users (
  id            SERIAL PRIMARY KEY,
  role          VARCHAR(12)  NOT NULL CHECK (role IN ('resident', 'admin')),
  name          VARCHAR(120) NOT NULL,
  address       VARCHAR(180),                 -- residents only, e.g. "B-10, Mayfield Gardens"
  phone         VARCHAR(30)  DEFAULT '',
  staff_id      VARCHAR(30),                  -- admins only, e.g. "RWA-01"
  password_hash TEXT         NOT NULL,
  created_at    TIMESTAMPTZ  DEFAULT NOW(),
  -- a resident has an address and no staff id; an admin has a staff id and no address
  CONSTRAINT society_users_identity_chk CHECK (
    (role = 'resident' AND address IS NOT NULL AND staff_id IS NULL) OR
    (role = 'admin'    AND staff_id IS NOT NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS society_address_unique ON society_users (LOWER(address)) WHERE address IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS society_staff_unique   ON society_users (LOWER(staff_id)) WHERE staff_id IS NOT NULL;

-- Login sessions (connect-pg-simple). Sessions survive restarts and work across instances.
CREATE TABLE IF NOT EXISTS user_sessions (
  sid    VARCHAR NOT NULL PRIMARY KEY,
  sess   JSON    NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expire ON user_sessions (expire);
