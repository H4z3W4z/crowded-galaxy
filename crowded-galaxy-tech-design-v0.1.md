# Crowded Galaxy — Technical Design Document v0.1

**Status:** handoff-ready. Companion to `Background/crowded-galaxy-prototype-v0.2.md` (game rules) and `data/*.yaml` (canonical card data). Where this doc says LOCKED, do not revisit without checking with Mike. Where it says IMPLEMENTER'S CHOICE, use judgment.

## 1. Product requirements driving the architecture

| Requirement | Architectural consequence |
| --- | --- |
| Web first, iOS/iPad later | Browser app with touch-first UI; wrap for iOS rather than rewrite |
| Async multiplayer, unified with live play | Server-authoritative turn log; live play = async with everyone connected. One code path, no separate modes |
| 3-player default, min one human, AI fills seats | AI must run server-side against the same rules engine humans use |
| No turn timers, friends-first | Invite-link tables; nudge notifications instead of forfeit logic |
| 20-30 min live sessions | Turn submission must be low-latency; animations skippable |
| Strictly sequential turns, deterministic except server-rolled dice | Event-sourced game state; full replayability from the action log |
| Card data lives in YAML | Engine consumes compiled card data; balance patches without code changes |
| Rules will churn during playtesting (12 rounds is a hypothesis) | Round count, seeding density, and card values are config, not constants |

## 2. Stack summary (LOCKED)

| Layer | Choice | Rationale |
| --- | --- | --- |
| Language | TypeScript everywhere | One language; the rules engine must run identically in browser (preview), server (authority), and AI (planning) |
| Monorepo | pnpm workspaces | `engine`, `server`, `web`, `shared` packages |
| Rules engine | Pure TS package, zero runtime deps | Deterministic, seed-driven, headless. The heart of the project |
| Frontend | React 18 + Vite + Zustand + Tailwind | Boring, well-trodden, fast to iterate |
| Board rendering | SVG (not canvas/WebGL) | 30 nodes and ~40 edges is trivial for SVG; free hit-testing, CSS animation, accessibility, crisp on retina iPad |
| Backend | Node 22 + Fastify | Shares the engine package; zod-validated REST + WebSocket |
| Database | PostgreSQL 16 + Drizzle ORM | Event-sourced games table + append-only actions; relational for accounts/tables |
| Realtime | Native WebSocket (`ws`) via Fastify plugin | Presence + live turn push. Async fallback needs nothing fancy |
| Notifications | Web Push (VAPID) in v1; APNs via Capacitor later | "Your turn" nudges |
| Auth | Magic-link email + signed session cookies | Friends-first; no passwords to breach. IMPLEMENTER'S CHOICE on library (Lucia-style hand-roll is fine) |
| iOS path | Capacitor wrapper | Reuses the web client wholesale; App Store shell + APNs + haptics |
| Deploy | Docker Compose (app + Postgres + Caddy) on a VPS | Single-box friendly; Fly.io acceptable alternative |
| Testing | Vitest + fast-check property tests + golden replay fixtures | Determinism makes replay-based regression testing cheap — use it hard |

Explicitly rejected: Phaser/PixiJS (overkill for a node-map board game), microservices (one box), GraphQL/tRPC (REST+zod is enough surface), Redis in v1 (Postgres LISTEN/NOTIFY covers it), React Native (two UIs to maintain).

## 3. Repository layout

```
crowded-galaxy/
├── package.json              # pnpm workspace root
├── data/
│   ├── species.yaml          # canonical card data (already exists)
│   ├── traits.yaml           # (already exists)
│   └── map.yaml              # 30 systems, hyperlanes, wormholes, neutral
│                             #   seeding, starting board coordinates (already exists)
├── packages/
│   ├── engine/               # pure rules engine — ZERO dependencies
│   │   ├── src/
│   │   │   ├── state.ts      # GameState types
│   │   │   ├── actions.ts    # Action types + validators
│   │   │   ├── reducer.ts    # apply(state, action) -> state
│   │   │   ├── queries.ts    # legal-move generation, scoring preview
│   │   │   ├── rng.ts        # seeded PCG32; die rolls consume the stream
│   │   │   ├── cards.ts      # generated from data/*.yaml at build
│   │   │   └── ai/           # heuristic AI (see §7)
│   │   └── test/
│   │       ├── golden/       # recorded full-game replays as fixtures
│   │       └── properties/   # fast-check invariants
│   ├── shared/               # zod schemas for API payloads, shared types
│   ├── server/               # Fastify app
│   └── web/                  # React client (+ Capacitor config for iOS)
└── docker-compose.yml
```

## 4. The rules engine (LOCKED design, the most important section)

The engine is a **pure reducer**: `apply(state, action) → newState | RulesError`. No I/O, no clocks, no `Math.random`, no exceptions for control flow. All randomness comes from a PCG32 stream seeded by the server at game creation; die rolls consume the next value. Given `(seed, [actions])`, every environment reproduces the identical final state — this single property powers server validation, client preview, AI planning, replays, and regression tests.

### State model (sketch)

```ts
interface GameState {
  config: GameConfig;          // rounds, seedingDensity, playerCount — all tunable
  round: number;
  turnOrder: PlayerId[];
  activePlayer: PlayerId;
  phase: 'choose' | 'recall' | 'conquer' | 'redeploy' | 'score' | 'gameOver';
  market: MarketSlot[];        // 6 combos + accumulated skip-Influence
  players: Record<PlayerId, PlayerState>;   // active civ, remnant(s), influence, hand
  systems: Record<SystemId, SystemState>;   // occupant, tokens, starbases, markers, neutrals
  rngCursor: number;           // position in the deterministic RNG stream
  decks: { species: CardId[]; traits: CardId[] };
}
```

### Action vocabulary

`chooseCivilization(slot)`, `recall(tokenMap)`, `conquer(target)`, `attemptFinalConquest(target, committed)` (rolls the reinforcement die), `redeploy(tokenMap)`, `collapse()`, `endTurn()`, plus trait-specific actions (`placeStarbase`, `moveBulwarks`, `nameDiplomaticTarget`, `convertToken`, `chooseAdaptiveHabitat`, `remnantConquer` for Cryari). Keep the vocabulary flat and explicit — one action per player decision, no compound actions.

### Card data pipeline

`data/*.yaml` compiles to `cards.ts` at build time (a small codegen script, run via pnpm). Ability *effects* are implemented in the engine keyed by card id; the YAML remains the source of truth for names, costs, population values, and text. When a YAML value changes (pop, text), no engine change is needed; when an ability's mechanics change, the engine's effect for that id changes. Do not build a generic effect-scripting DSL in v1 — 32 cards do not justify it.

### Rules-churn guardrail

`GameConfig` must include: `rounds` (default 12), `neutralSeeding` (per-ring density), `marketSize`, `dieFaces` ([0,0,0,1,2,3]). Playtesting will move these numbers.

## 5. Server and persistence

### Event sourcing (LOCKED)

Games are stored as an append-only action log; state is derived by replaying through the engine.

```sql
games      (id, seed, config_json, status, created_at, current_player, turn_deadline_null)
game_actions (game_id, seq, player_id, action_json, created_at)  -- append-only, PK (game_id, seq)
game_snapshots (game_id, seq, state_json)   -- every N actions, optimization only
users      (id, email, display_name, created_at)
sessions   (id, user_id, expires_at)
tables     (id, host_id, invite_code, config_json, seats_json)   -- pre-game lobby
push_subscriptions (user_id, endpoint, keys_json)
```

### Turn submission flow

1. Client computes the intended action list locally (instant preview via the same engine).
2. `POST /api/games/:id/actions` with the batch for one turn, zod-validated.
3. Server replays current state (snapshot + tail), applies each action through the engine, rejects the whole batch on any illegal action (409 with the RulesError).
4. On success: append actions, advance `current_player`, `NOTIFY` the game channel.
5. Connected clients receive the new actions over WebSocket and animate them; offline players get a Web Push nudge. If the next seat is an AI, the server queues an AI turn job immediately.

Die rolls happen server-side during step 3 — the client's `attemptFinalConquest` preview shows odds, not outcomes.

### API surface (REST, all zod-validated)

- `POST /api/auth/magic-link`, `GET /api/auth/callback`
- `POST /api/tables` / `POST /api/tables/join/:inviteCode` / `POST /api/tables/:id/start`
- `GET /api/games/:id` (snapshot + actions since seq N)
- `POST /api/games/:id/actions`
- `POST /api/games/:id/nudge` (rate-limited "your turn" reminder)
- `WS /api/games/:id/live` (action stream + presence)

## 6. Client

- **Screens:** home/table list → lobby → game board → post-game summary. That's the entire v1 surface.
- **Board:** SVG star map, systems as nodes sized for touch (44 pt minimum targets — iPad is the design target even on web). Pan/zoom via CSS transforms.
- **Turn UX:** the client runs the engine locally for instant legality feedback and cost display ("this conquest: 4 tokens"). Submitting sends the action batch; nothing is trusted client-side.
- **Replay/catch-up:** on opening an async game, animate all actions since last seen, with a skip button. The Pelagic Oracles token conversion and every die roll get explicit callouts — these are the two "wait, what happened?" mechanics.
- **State:** Zustand store holding `{serverState, previewActions, derivedPreviewState}`.
- **iOS:** Capacitor wrap of the same build; APNs replaces Web Push; haptics on conquest/die roll. No iOS work until the web game is fun.

## 7. AI (v1: one solid heuristic)

Lives in `packages/engine/src/ai/` so it runs anywhere the engine runs; invoked server-side for AI seats.

1. **Move generation:** enumerate candidate turn plans — greedy beam search over conquest sequences (beam width ~8), not exhaustive search, no lookahead into future turns.
2. **Evaluation:** weighted sum — Influence gained this turn, habitat matches captured, cost efficiency (Influence per token spent), defensive exposure (tokens-per-system vs neighboring threats), market skip-Influence value when choosing civs.
3. **Collapse timing:** collapse when projected next-turn Influence as-is falls below projected launch-turn Influence of the best market combo (with a configurable inertia bonus to avoid twitchy collapses). Cryari Revenants and Twilight get dedicated handling.
4. **Weights in config**, tuned by self-play: run N seeded AI-vs-AI games headless (this is also the engine soak test).

Difficulty tiers, MCTS, anything fancier: explicitly out of scope for v1.

## 8. Security model

Threat model is casual (friends-first, no money), but hygiene is free:

- Server is the single authority; clients submit intents, never state.
- Zod validation at the boundary; engine legality check behind it (defense in depth).
- Magic-link tokens: single-use, 15-min expiry, hashed at rest. Sessions: httpOnly, SameSite=Lax, secure cookies.
- Invite codes: unguessable (128-bit), revocable by host.
- Rate limits on auth endpoints and nudges.
- No secrets in the client bundle; die-roll seed never leaves the server (only roll *results* are published, so future rolls aren't predictable from the log).
- Postgres access via parameterized queries only (Drizzle default).

## 9. Milestones

| Milestone | Deliverable | Definition of done |
| --- | --- | --- |
| **M0 — Engine** | `packages/engine` complete with all 32 cards, map, full turn loop | 100% of rules in v0.2 doc enforced; golden-replay + property tests green; a scripted 3-player game runs headless to completion |
| **M1 — Server + playable web game** | Fastify server (auth, tables, event-sourced games, WebSocket live play, Web Push nudges) + React board client | Two humans on separate devices finish a 12-round game, both live in one sitting and async across sessions; this is the first real playtest vehicle |

> **M1 implementation notes (shipped):** magic-link auth uses a console/dev-link provider — swap in a real email service before any non-LAN deployment. Clients receive full sanitized state pushes (rngState zeroed, decks stripped) rather than replaying the action log locally; the append-only `game_actions` log still exists for audit/replay tooling. Lobby freshness is 2s polling (game channel is WS). **Deferred to M1.5:** Web Push "your turn" nudges, catch-up turn animations, per-turn action batching (actions submit individually).
| **M2 — AI seats** | Heuristic AI filling seats, self-play harness | One human beats/loses to two AIs in a complete game without illegal moves or stalls |
| **M3 — Polish + iOS shell** | Replay/catch-up animations, Capacitor build, APNs, TestFlight | External friend playtest group runs games unassisted |

M1 ships on the real stack from day one — every playtest exercises the event-sourced log, server validation, and async flow that production uses. A same-browser hotseat mode is still worth keeping as a free dev-loop byproduct (the engine runs client-side anyway), but it is a debugging convenience, not a milestone. Rules churn discovered during M1 playtests (round count, seeding density, card values) lands in `GameConfig` and the YAML files, not in code rewrites.

## 10. Open questions for the implementer (fine to decide unilaterally)

- Exact magic-link email provider (SES, Resend, Postmark — any).
- Snapshot cadence (every 20 actions is a fine start).
- Whether market deck exhaustion reshuffles discards (rules doc silent; recommend reshuffle).
- Map layout is resolved: `data/map.yaml` ships with starting coordinates on a 1000×1000 canvas, rings laid out radially. Hand-tune them for art direction; nothing mechanical derives from geometry.

## 11. Non-goals for v1

Ranked ladders, matchmaking pools, spectating, chat (use the group text you already have), tournaments, cosmetics/monetization, Android, localization, rules variants beyond `GameConfig`, engine WASM ports. All possible later precisely because the engine is a pure TS package behind an event-sourced log.
