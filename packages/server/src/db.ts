import pg from "pg";

export const pool = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ?? "postgres://cg:cg_dev_password@localhost:5433/crowded_galaxy",
});

// v1 schema management: idempotent bootstrap. Move to real migrations before any
// deployment that has data worth keeping.
export async function initDb(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      expires_at TIMESTAMPTZ NOT NULL
    );
    CREATE TABLE IF NOT EXISTS magic_tokens (
      token_hash TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      name TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used BOOLEAN NOT NULL DEFAULT false
    );
    CREATE TABLE IF NOT EXISTS game_tables (
      id TEXT PRIMARY KEY,
      host_id TEXT NOT NULL REFERENCES users(id),
      invite_code TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'lobby',
      rounds INT NOT NULL DEFAULT 12,
      game_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS table_seats (
      table_id TEXT NOT NULL REFERENCES game_tables(id),
      seat_idx INT NOT NULL,
      user_id TEXT REFERENCES users(id),
      ai BOOLEAN NOT NULL DEFAULT true,
      name TEXT NOT NULL,
      PRIMARY KEY (table_id, seat_idx)
    );
    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      table_id TEXT NOT NULL REFERENCES game_tables(id),
      seed BIGINT NOT NULL,
      status TEXT NOT NULL DEFAULT 'playing',
      seat_users JSONB NOT NULL,
      state JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS game_actions (
      game_id TEXT NOT NULL REFERENCES games(id),
      seq INT NOT NULL,
      seat INT NOT NULL,
      action JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (game_id, seq)
    );
    CREATE TABLE IF NOT EXISTS invites (
      id TEXT PRIMARY KEY,
      table_id TEXT NOT NULL REFERENCES game_tables(id),
      from_user TEXT NOT NULL REFERENCES users(id),
      to_user TEXT NOT NULL REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (table_id, to_user)
    );
  `);
  // v0.5: username/password accounts replace magic links. Email becomes optional.
  await pool.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
    ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
  `);
}
