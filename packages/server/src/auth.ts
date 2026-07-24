import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { pool } from "./db.js";

const SESSION_COOKIE = "cg_session";
const SESSION_DAYS = 30;
const isProd = process.env.NODE_ENV === "production";

export interface AuthedUser {
  id: string;
  username: string;
  name: string;
}

// -- Password hashing: scrypt (Node built-in), salt:hash hex. --
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

// -- Light per-IP login throttle (in-memory; single-process server). --
const attempts = new Map<string, { count: number; resetAt: number }>();
function throttled(ip: string): boolean {
  const now = Date.now();
  const a = attempts.get(ip);
  if (!a || now > a.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  a.count += 1;
  return a.count > 10;
}

export async function currentUser(req: FastifyRequest): Promise<AuthedUser | null> {
  const sid = req.cookies[SESSION_COOKIE];
  if (!sid) return null;
  const r = await pool.query(
    `SELECT u.id, u.username, u.name FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.id = $1 AND s.expires_at > now()`,
    [sid],
  );
  return (r.rows[0] as AuthedUser | undefined) ?? null;
}

export async function requireUser(req: FastifyRequest, reply: FastifyReply): Promise<AuthedUser | null> {
  const user = await currentUser(req);
  if (!user) reply.code(401).send({ error: "not signed in" });
  return user;
}

async function createSession(reply: FastifyReply, userId: string): Promise<void> {
  const sid = randomBytes(24).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 86400_000);
  await pool.query(`INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)`, [sid, userId, expires]);
  reply.setCookie(SESSION_COOKIE, sid, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    expires,
  });
}

const credentials = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/, "letters, numbers, underscore"),
  password: z.string().min(6).max(200),
});

export function registerAuthRoutes(app: FastifyInstance): void {
  app.post("/api/auth/register", async (req, reply) => {
    const body = credentials.extend({ name: z.string().min(1).max(40) }).parse(req.body);
    const existing = await pool.query(`SELECT 1 FROM users WHERE lower(username) = lower($1)`, [body.username]);
    if ((existing.rowCount ?? 0) > 0) return reply.code(409).send({ error: "that username is taken" });
    const id = randomBytes(12).toString("hex");
    await pool.query(`INSERT INTO users (id, username, name, password_hash) VALUES ($1, $2, $3, $4)`, [
      id,
      body.username,
      body.name,
      hashPassword(body.password),
    ]);
    await createSession(reply, id);
    return reply.send({ user: { id, username: body.username, name: body.name } });
  });

  app.post("/api/auth/login", async (req, reply) => {
    if (throttled(req.ip)) return reply.code(429).send({ error: "too many attempts — wait a minute" });
    const body = credentials.parse(req.body);
    const r = await pool.query(
      `SELECT id, username, name, password_hash FROM users WHERE lower(username) = lower($1)`,
      [body.username],
    );
    const row = r.rows[0] as { id: string; username: string; name: string; password_hash: string | null } | undefined;
    if (!row?.password_hash || !verifyPassword(body.password, row.password_hash)) {
      return reply.code(401).send({ error: "wrong username or password" });
    }
    await createSession(reply, row.id);
    return reply.send({ user: { id: row.id, username: row.username, name: row.name } });
  });

  app.get("/api/me", async (req, reply) => {
    const user = await currentUser(req);
    return reply.send({ user });
  });

  app.post("/api/auth/logout", async (req, reply) => {
    const sid = req.cookies[SESSION_COOKIE];
    if (sid) await pool.query(`DELETE FROM sessions WHERE id = $1`, [sid]);
    reply.clearCookie(SESSION_COOKIE, { path: "/" });
    return reply.send({ ok: true });
  });

  // Player directory for invites. Reasonable on a private friends server;
  // revisit (search-only, opt-in visibility) before any public deployment.
  app.get("/api/users", async (req, reply) => {
    const user = await requireUser(req, reply);
    if (!user) return;
    const r = await pool.query(
      `SELECT id, username, name FROM users WHERE username IS NOT NULL ORDER BY lower(name) LIMIT 200`,
    );
    return reply.send({ users: r.rows });
  });
}
