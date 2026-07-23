// Game persistence + the authoritative action pipeline.
import { randomBytes, randomInt } from "node:crypto";
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

/** Strip information clients must not see: the RNG stream and undrawn deck order. */
export function sanitize(state: GameState): GameState {
  return { ...state, rngState: 0, speciesDeck: [], traitDeck: [] };
}

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
  await pool.query(
    `INSERT INTO games (id, table_id, seed, seat_users, state) VALUES ($1, $2, $3, $4, $5)`,
    [id, tableId, seed, JSON.stringify(seatUsers), JSON.stringify(state)],
  );
  const row: GameRow = { id, tableId, state, seatUsers };
  await runAiSeats(row); // seat 0 may be an AI
  return row;
}

export async function loadGame(id: string): Promise<GameRow | null> {
  const r = await pool.query(`SELECT id, table_id, state, seat_users FROM games WHERE id = $1`, [id]);
  if (r.rowCount === 0) return null;
  const row = r.rows[0] as { id: string; table_id: string; state: GameState; seat_users: (string | null)[] };
  return { id: row.id, tableId: row.table_id, state: row.state, seatUsers: row.seat_users };
}

async function appendAction(game: GameRow, seat: number, action: Action): Promise<void> {
  await pool.query(
    `INSERT INTO game_actions (game_id, seq, seat, action)
     VALUES ($1, (SELECT COALESCE(MAX(seq), 0) + 1 FROM game_actions WHERE game_id = $1), $2, $3)`,
    [game.id, seat, JSON.stringify(action)],
  );
}

async function saveState(game: GameRow): Promise<void> {
  await pool.query(`UPDATE games SET state = $2, status = $3 WHERE id = $1`, [
    game.id,
    JSON.stringify(game.state),
    game.state.phase === "over" ? "over" : "playing",
  ]);
  if (game.state.phase === "over") {
    await pool.query(`UPDATE game_tables SET status = 'finished' WHERE id = $1`, [game.tableId]);
  }
}

/** Apply one human action (throws RulesError on illegal), then let AI seats play out. */
export async function submitAction(game: GameRow, action: Action): Promise<void> {
  const seat = game.state.current;
  game.state = apply(game.state, action);
  await appendAction(game, seat, action);
  await runAiSeats(game);
  await saveState(game);
}

const MAX_AI_ACTIONS = 500; // one full round of AI turns stays far below this

async function runAiSeats(game: GameRow): Promise<void> {
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
    await appendAction(game, seat, action);
    if (++guard > MAX_AI_ACTIONS) throw new Error(`AI runaway in game ${game.id}`);
  }
  await saveState(game);
}
