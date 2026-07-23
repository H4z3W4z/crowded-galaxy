import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { RulesError } from "@cg/engine";
import type { Action } from "@cg/engine";
import { requireUser } from "./auth.js";
import { loadGame, sanitize, submitAction } from "./gameStore.js";
import { broadcastGame } from "./live.js";

// Action payloads come from the network — zod guards the shape, the engine guards legality.
const actionSchema: z.ZodType<Action> = z.discriminatedUnion("type", [
  z.object({ type: z.literal("chooseCivilization"), slot: z.number().int().min(0).max(9) }),
  z.object({ type: z.literal("recall"), take: z.record(z.string(), z.number().int().min(0)) }),
  z.object({ type: z.literal("conquer"), target: z.string().max(4) }),
  z.object({ type: z.literal("finalConquest"), target: z.string().max(4) }),
  z.object({ type: z.literal("convertToken"), target: z.string().max(4) }),
  z.object({ type: z.literal("remnantConquer"), target: z.string().max(4) }),
  z.object({
    type: z.literal("chooseAdaptiveHabitat"),
    habitat: z.enum(["terran", "ocean", "barren", "gas_giant", "ice", "volcanic"]),
  }),
  z.object({ type: z.literal("endConquests") }),
  z.object({ type: z.literal("redeploy"), dist: z.record(z.string(), z.number().int().min(0)) }),
  z.object({ type: z.literal("placeStarbase"), system: z.string().max(4) }),
  z.object({ type: z.literal("moveBulwarks"), systems: z.array(z.string().max(4)).max(2) }),
  z.object({ type: z.literal("verdantGrow"), system: z.string().max(4) }),
  z.object({ type: z.literal("nameDiplomaticTarget"), player: z.number().int().min(0).max(4) }),
  z.object({ type: z.literal("collapse") }),
  z.object({ type: z.literal("endTurn") }),
]);

export function registerGameRoutes(app: FastifyInstance): void {
  app.get("/api/games/:id", async (req, reply) => {
    const user = await requireUser(req, reply);
    if (!user) return;
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const game = await loadGame(id);
    if (!game) return reply.code(404).send({ error: "no such game" });
    const mySeat = game.seatUsers.indexOf(user.id);
    return reply.send({
      gameId: game.id,
      tableId: game.tableId,
      mySeat: mySeat === -1 ? null : mySeat,
      state: sanitize(game.state),
    });
  });

  app.post("/api/games/:id/actions", async (req, reply) => {
    const user = await requireUser(req, reply);
    if (!user) return;
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const action = actionSchema.parse((req.body as { action: unknown }).action);
    const game = await loadGame(id);
    if (!game) return reply.code(404).send({ error: "no such game" });
    if (game.state.phase === "over") return reply.code(400).send({ error: "game is over" });
    const seatUser = game.seatUsers[game.state.current];
    if (seatUser !== user.id) return reply.code(403).send({ error: "not your turn" });
    try {
      await submitAction(game, action);
    } catch (e) {
      if (e instanceof RulesError) return reply.code(409).send({ error: e.message });
      throw e;
    }
    const state = sanitize(game.state);
    broadcastGame(game.id, state);
    return reply.send({ state });
  });
}
