// Live play: one WebSocket per open game view; the server pushes full sanitized
// state after every accepted action. Single-process pubsub — revisit with
// Postgres LISTEN/NOTIFY if this ever runs multi-process.
import type { FastifyInstance } from "fastify";
import type { WebSocket } from "ws";
import type { GameState } from "@cg/engine";
import { currentUser } from "./auth.js";

const rooms = new Map<string, Set<WebSocket>>();

export function broadcastGame(gameId: string, state: GameState): void {
  const room = rooms.get(gameId);
  if (!room) return;
  const msg = JSON.stringify({ type: "state", state });
  for (const ws of room) {
    if (ws.readyState === ws.OPEN) ws.send(msg);
  }
}

export function registerLiveRoutes(app: FastifyInstance): void {
  app.get("/api/games/:id/live", { websocket: true }, async (socket, req) => {
    const user = await currentUser(req);
    if (!user) {
      socket.close(4401, "not signed in");
      return;
    }
    const gameId = (req.params as { id: string }).id;
    let room = rooms.get(gameId);
    if (!room) {
      room = new Set();
      rooms.set(gameId, room);
    }
    room.add(socket);
    socket.on("close", () => {
      room!.delete(socket);
      if (room!.size === 0) rooms.delete(gameId);
    });
  });
}
