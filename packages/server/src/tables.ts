import { randomBytes } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { pool } from "./db.js";
import { requireUser } from "./auth.js";
import { createGameForTable, type SeatMeta } from "./gameStore.js";

const AI_NAMES = ["Vex-7", "Oolan", "Karrix", "Meridia"];

function inviteCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

export async function tableDetail(tableId: string) {
  const t = await pool.query(
    `SELECT id, host_id, invite_code, status, rounds, game_id FROM game_tables WHERE id = $1`,
    [tableId],
  );
  if (t.rowCount === 0) return null;
  const seats = await pool.query(
    `SELECT seat_idx, user_id, ai, name FROM table_seats WHERE table_id = $1 ORDER BY seat_idx`,
    [tableId],
  );
  return { ...t.rows[0], seats: seats.rows };
}

export function registerTableRoutes(app: FastifyInstance): void {
  app.post("/api/tables", async (req, reply) => {
    const user = await requireUser(req, reply);
    if (!user) return;
    const body = z
      .object({ seatCount: z.number().int().min(2).max(5).default(3), rounds: z.number().int().min(6).max(16).default(12) })
      .parse(req.body ?? {});
    const id = randomBytes(9).toString("hex");
    await pool.query(
      `INSERT INTO game_tables (id, host_id, invite_code, rounds) VALUES ($1, $2, $3, $4)`,
      [id, user.id, inviteCode(), body.rounds],
    );
    for (let i = 0; i < body.seatCount; i++) {
      const mine = i === 0;
      await pool.query(
        `INSERT INTO table_seats (table_id, seat_idx, user_id, ai, name) VALUES ($1, $2, $3, $4, $5)`,
        [id, i, mine ? user.id : null, !mine, mine ? user.name : AI_NAMES[(i - 1) % AI_NAMES.length]],
      );
    }
    return reply.send({ table: await tableDetail(id) });
  });

  app.get("/api/tables/mine", async (req, reply) => {
    const user = await requireUser(req, reply);
    if (!user) return;
    const r = await pool.query(
      `SELECT DISTINCT t.id, t.invite_code, t.status, t.rounds, t.game_id, t.created_at
       FROM game_tables t JOIN table_seats s ON s.table_id = t.id
       WHERE s.user_id = $1 ORDER BY t.created_at DESC LIMIT 20`,
      [user.id],
    );
    return reply.send({ tables: r.rows });
  });

  app.get("/api/tables/:id", async (req, reply) => {
    const user = await requireUser(req, reply);
    if (!user) return;
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const table = await tableDetail(id);
    if (!table) return reply.code(404).send({ error: "no such table" });
    // Scope table reads (which expose the invite code + seat occupants) to
    // participants only. Outsiders join via the code, not by reading a table id.
    const seated = (table.seats as { user_id: string | null }[]).some((s) => s.user_id === user.id);
    if (table.host_id !== user.id && !seated) return reply.code(404).send({ error: "no such table" });
    return reply.send({ table });
  });

  app.post("/api/tables/join/:code", async (req, reply) => {
    const user = await requireUser(req, reply);
    if (!user) return;
    const { code } = z.object({ code: z.string().min(4).max(16) }).parse(req.params);
    const t = await pool.query(
      `SELECT id, status FROM game_tables WHERE invite_code = $1`,
      [code.toUpperCase()],
    );
    if (t.rowCount === 0) return reply.code(404).send({ error: "no table with that code" });
    const { id, status } = t.rows[0] as { id: string; status: string };
    if (status !== "lobby") return reply.code(400).send({ error: "game already started" });
    const seated = await pool.query(
      `SELECT seat_idx FROM table_seats WHERE table_id = $1 AND user_id = $2`,
      [id, user.id],
    );
    if (seated.rowCount === 0) {
      // Atomic claim of ONE open, human-designated seat (ai = false, unclaimed).
      // The FOR UPDATE SKIP LOCKED subquery routes concurrent joiners to distinct
      // seats, and the guarded UPDATE means a returned row is a real, exclusive claim.
      const claim = await pool.query(
        `UPDATE table_seats SET user_id = $2, name = $3
         WHERE table_id = $1 AND seat_idx = (
           SELECT seat_idx FROM table_seats
           WHERE table_id = $1 AND user_id IS NULL AND ai = false
           ORDER BY seat_idx LIMIT 1
           FOR UPDATE SKIP LOCKED
         )
         RETURNING seat_idx`,
        [id, user.id, user.name],
      );
      if (claim.rowCount === 0) return reply.code(400).send({ error: "no open seat — ask the host to open one" });
    }
    return reply.send({ table: await tableDetail(id) });
  });

  // Host controls: toggle an unclaimed seat between AI and open, or rename an AI.
  app.post("/api/tables/:id/seat", async (req, reply) => {
    const user = await requireUser(req, reply);
    if (!user) return;
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const body = z
      .object({ seatIdx: z.number().int().min(0).max(4), ai: z.boolean().optional(), name: z.string().min(1).max(40).optional() })
      .parse(req.body);
    const t = await pool.query(`SELECT host_id, status FROM game_tables WHERE id = $1`, [id]);
    if (t.rowCount === 0) return reply.code(404).send({ error: "no such table" });
    const row = t.rows[0] as { host_id: string; status: string };
    if (row.host_id !== user.id) return reply.code(403).send({ error: "host only" });
    if (row.status !== "lobby") return reply.code(400).send({ error: "game already started" });
    const seat = await pool.query(
      `SELECT user_id FROM table_seats WHERE table_id = $1 AND seat_idx = $2`,
      [id, body.seatIdx],
    );
    if (seat.rowCount === 0) return reply.code(404).send({ error: "no such seat" });
    if ((seat.rows[0] as { user_id: string | null }).user_id !== null) {
      return reply.code(400).send({ error: "seat is taken by a player" });
    }
    if (body.ai !== undefined) {
      await pool.query(`UPDATE table_seats SET ai = $3 WHERE table_id = $1 AND seat_idx = $2`, [id, body.seatIdx, body.ai]);
    }
    if (body.name) {
      await pool.query(`UPDATE table_seats SET name = $3 WHERE table_id = $1 AND seat_idx = $2`, [id, body.seatIdx, body.name]);
    }
    return reply.send({ table: await tableDetail(id) });
  });

  app.post("/api/tables/:id/start", async (req, reply) => {
    const user = await requireUser(req, reply);
    if (!user) return;
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const t = await pool.query(
      `SELECT host_id, status, rounds FROM game_tables WHERE id = $1`,
      [id],
    );
    if (t.rowCount === 0) return reply.code(404).send({ error: "no such table" });
    const row = t.rows[0] as { host_id: string; status: string; rounds: number };
    if (row.host_id !== user.id) return reply.code(403).send({ error: "host only" });
    if (row.status !== "lobby") return reply.code(400).send({ error: "already started" });
    // Atomically claim the right to start: only one concurrent starter wins the
    // lobby->starting transition, so a double-click can't spawn orphaned games.
    const claim = await pool.query(
      `UPDATE game_tables SET status = 'starting' WHERE id = $1 AND status = 'lobby' RETURNING rounds`,
      [id],
    );
    if (claim.rowCount === 0) return reply.code(400).send({ error: "already started" });
    const seatRows = await pool.query(
      `SELECT seat_idx, user_id, ai, name FROM table_seats WHERE table_id = $1 ORDER BY seat_idx`,
      [id],
    );
    const seats: SeatMeta[] = (seatRows.rows as { user_id: string | null; ai: boolean; name: string }[]).map((s) => ({
      name: s.name,
      // An unclaimed non-AI seat plays as AI so a short-handed table can still start.
      ai: s.ai || s.user_id === null,
      userId: s.user_id,
    }));
    if (!seats.some((s) => !s.ai)) {
      // Revert the claim so the host can fix the table and retry.
      await pool.query(`UPDATE game_tables SET status = 'lobby' WHERE id = $1`, [id]);
      return reply.code(400).send({ error: "need at least one human" });
    }
    const game = await createGameForTable(id, row.rounds, seats);
    await pool.query(`UPDATE game_tables SET status = 'playing', game_id = $2 WHERE id = $1`, [id, game.id]);
    return reply.send({ gameId: game.id });
  });
}
