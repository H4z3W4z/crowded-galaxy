import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";
import Fastify from "fastify";
import cookie from "@fastify/cookie";
import websocket from "@fastify/websocket";
import fastifyStatic from "@fastify/static";
import { ZodError } from "zod";
import { initDb } from "./db.js";
import { registerAuthRoutes } from "./auth.js";
import { registerTableRoutes } from "./tables.js";
import { registerGameRoutes } from "./games.js";
import { registerLiveRoutes } from "./live.js";

const PORT = Number(process.env.PORT ?? 8787);
const HOST = process.env.HOST ?? "0.0.0.0"; // LAN playtests by default

const app = Fastify({ logger: { level: "info" } });

// One error boundary: malformed input -> 400 (no schema/DB internals leaked);
// anything unexpected -> a generic 500 with the detail logged server-side only.
app.setErrorHandler((err, _req, reply) => {
  if (err instanceof ZodError || (err as { validation?: unknown }).validation) {
    return reply.code(400).send({ error: "invalid request" });
  }
  if (typeof err.statusCode === "number" && err.statusCode < 500) {
    return reply.code(err.statusCode).send({ error: err.message });
  }
  app.log.error(err);
  return reply.code(500).send({ error: "internal error" });
});

await app.register(cookie);
await app.register(websocket);

registerAuthRoutes(app);
registerTableRoutes(app);
registerGameRoutes(app);
registerLiveRoutes(app);

// Production: serve the built web client from this same process.
const webDist = join(dirname(fileURLToPath(import.meta.url)), "../../web/dist");
if (existsSync(webDist)) {
  await app.register(fastifyStatic, { root: webDist });
  app.setNotFoundHandler((req, reply) => {
    if (req.url.startsWith("/api/")) return reply.code(404).send({ error: "not found" });
    return reply.sendFile("index.html"); // SPA fallback
  });
}

await initDb();
await app.listen({ port: PORT, host: HOST });
app.log.info(`Crowded Galaxy server on http://${HOST}:${PORT}`);
