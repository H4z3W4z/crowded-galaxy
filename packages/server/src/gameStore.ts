// Game persistence + the authoritative action pipeline.
import { randomBytes, randomInt } from "node:crypto";
import type { PoolClient } from "pg";
import { aiNextAction, apply, createGame, DEFAULT_CONFIG, RulesError } from "@cg/engine";
import type { Action, GameState } from "@cg/engine";
import { pool } from "./db.js";

export interface SeatMeta {
  name: string;
  ai: boolean;
  userId: string | null;
}

export interface GameRow {
  id: string;
  tableId: string;
  state: GameState;
  seatUsers: (string | null)[];
}

/** Strip everything a client must not see: the RNG stream, undrawn deck order,
 *  AND the seed (the engine is seed-deterministic, so the seed reconstructs the decks). */
export function sanitize(state: GameState): GameState {
  return {
    ...state,
    rngState: 0,
    speciesDeck: [],
    traitDeck: [],
    config: { ...state.config, seed: 0 },
  };
}

export type SubmitResult =
  | { ok: true; state: GameState }
  | { ok: false; code: 400 | 403 | 404 | 409; error: string };

export async function createGameForTable(tableId: string, rounds: number, seats: SeatMeta[]): Promise<GameRow> {
  const seed = randomInt(0, 0xffffffff);
  const state = createGame({
    ...DEFAULT_CONFIG,
    rounds,
    seed,
    seats: seats.map((s) => ({ name: s.name, ai: s.ai })),
  });
  const id = randomBytes(12).toString("hex");
  const seatUsers = seats.map((s) => s.userId);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO games (id, table_id, seed, seat_users, state) VALUES ($1, $2, $3, $4, $5)`,
      [id, tableId, seed, JSON.stringify(seatUsers), JSON.stringify(state)],
    );
    const row: GameRow = { id, tableId, state, seatUsers };
    await runAiSeats(client, row); // seat 0 may itself be an AI
    await saveState(client, row);
    await client.query("COMMIT");
    return row;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function loadGame(id: string): Promise<GameRow | null> {
  const r = await pool.query(`SELECT id, table_id, state, seat_users FROM games WHERE id = $1`, [id]);
  if (r.rowCount === 0) return null;
  const row = r.rows[0] as { id: string; table_id: string; state: GameState; seat_users: (string | null)[] };
  return { id: row.id, tableId: row.table_id, state: row.state, seatUsers: row.seat_users };
}

/**
 * The one authoritative write path. Everything — load, turn/seat check, apply,
 * AI resolution, persistence — happens inside a single transaction that holds a
 * row lock (`FOR UPDATE`) on the game, so concurrent submissions for the same
 * turn serialize instead of racing the action log or double-applying.
 */
export async function submitAction(gameId: string, userId: string, action: Action): Promise<SubmitResult> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const r = await client.query(
      `SELECT id, table_id, state, seat_users FROM games WHERE id = $1 FOR UPDATE`,
      [gameId],
    );
    if (r.rowCount === 0) {
      await client.query("ROLLBACK");
      return { ok: false, code: 404, error: "no such game" };
    }
    const dbRow = r.rows[0] as { id: string; table_id: string; state: GameState; seat_users: (string | null)[] };
    const game: GameRow = { id: dbRow.id, tableId: dbRow.table_id, state: dbRow.state, seatUsers: dbRow.seat_users };

    if (game.state.phase === "over") {
      await client.query("ROLLBACK");
      return { ok: false, code: 400, error: "game is over" };
    }
    if (game.seatUsers[game.state.current] !== userId) {
      await client.query("ROLLBACK");
      return { ok: false, code: 403, error: "not your turn" };
    }

    const seat = game.state.current;
    try {
      game.state = apply(game.state, action);
    } catch (e) {
      await client.query("ROLLBACK");
      if (e instanceof RulesError) return { ok: false, code: 409, error: e.message };
      throw e;
    }
    await appendAction(client, game, seat, action);
    await runAiSeats(client, game);
    await saveState(client, game);
    await client.query("COMMIT");
    return { ok: true, state: game.state };
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

async function appendAction(client: PoolClient, game: GameRow, seat: number, action: Action): Promise<void> {
  // Safe under the games-row FOR UPDATE lock: all writers for this game serialize.
  await client.query(
    `INSERT INTO game_actions (game_id, seq, seat, action)
     VALUES ($1, (SELECT COALESCE(MAX(seq), 0) + 1 FROM game_actions WHERE game_id = $1), $2, $3)`,
    [game.id, seat, JSON.stringify(action)],
  );
}

async function saveState(client: PoolClient, game: GameRow): Promise<void> {
  await client.query(`UPDATE games SET state = $2, status = $3 WHERE id = $1`, [
    game.id,
    JSON.stringify(game.state),
    game.state.phase === "over" ? "over" : "playing",
  ]);
  if (game.state.phase === "over") {
    await client.query(`UPDATE game_tables SET status = 'finished' WHERE id = $1`, [game.tableId]);
  }
}

const MAX_AI_ACTIONS = 500; // one full round of AI turns stays far below this

async function runAiSeats(client: PoolClient, game: GameRow): Promise<void> {
  let guard = 0;
  while (game.state.phase !== "over" && game.state.config.seats[game.state.current]!.ai) {
    const seat = game.state.current;
    const action = aiNextAction(game.state);
    try {
      game.state = apply(game.state, action);
    } catch (e) {
      if (e instanceof RulesError) {
        // AI proposed something illegal (should not happen): fail safe by ending its turn.
        game.state = apply(game.state, { type: "endTurn" });
      } else throw e;
    }
    await appendAction(client, game, seat, action);
    if (++guard > MAX_AI_ACTIONS) throw new Error(`AI runaway in game ${game.id}`);
  }
}
