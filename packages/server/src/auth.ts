import { createHash, randomBytes } from "node:crypto";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { pool } from "./db.js";

const SESSION_COOKIE = "cg_session";
const SESSION_DAYS = 30;
const isProd = process.env.NODE_ENV === "production";

export interface AuthedUser {
  id: string;
  email: string;
  name: string;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function currentUser(req: FastifyRequest): Promise<AuthedUser | null> {
  const sid = req.cookies[SESSION_COOKIE];
  if (!sid) return null;
  const r = await pool.query(
    `SELECT u.id, u.email, u.name FROM sessions s JOIN users u ON u.id = s.user_id
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

export function registerAuthRoutes(app: FastifyInstance): void {
  // Magic-link provider: production wants a real email service; dev logs the link
  // to the server console AND returns it in the response so LAN playtests are 1-step.
  app.post("/api/auth/magic-link", async (req, reply) => {
    const body = z.object({ email: z.string().email(), name: z.string().min(1).max(40) }).parse(req.body);
    const token = randomBytes(24).toString("hex");
    const expires = new Date(Date.now() + 15 * 60_000);
    await pool.query(
      `INSERT INTO magic_tokens (token_hash, email, name, expires_at) VALUES ($1, $2, $3, $4)`,
      [hashToken(token), body.email.toLowerCase(), body.name, expires],
    );
    const link = `/api/auth/callback?token=${token}`;
    app.log.info(`magic link for ${body.email}: ${link}`);
    return reply.send(isProd ? { sent: true } : { sent: true, devLink: link });
  });

  app.get("/api/auth/callback", async (req, reply) => {
    const { token } = z.object({ token: z.string().min(10) }).parse(req.query);
    const r = await pool.query(
      `UPDATE magic_tokens SET used = true
       WHERE token_hash = $1 AND used = false AND expires_at > now()
       RETURNING email, name`,
      [hashToken(token)],
    );
    if (r.rowCount === 0) return reply.code(400).send({ error: "invalid or expired link" });
    const { email, name } = r.rows[0] as { email: string; name: string };
    const u = await pool.query(
      `INSERT INTO users (id, email, name) VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [randomBytes(12).toString("hex"), email, name],
    );
    await createSession(reply, (u.rows[0] as { id: string }).id);
    return reply.redirect("/");
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
}
