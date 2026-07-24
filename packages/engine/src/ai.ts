// v1 heuristic AI — no search tree. Produces one action at a time so the UI
// can animate AI turns step by step. Deterministic given the same state.

import { SPECIES, TRAITS } from "./gen/cards.js";
import { SYSTEMS } from "./gen/map.js";
import { checkRemnantConquest, conversionTargets, favoredHabitats, hasPlanet, legalTargets, neighbors, systemsOf } from "./rules.js";
import type { Action, GameState, PlanetType, PlayerId, SystemId } from "./types.js";

/** Next action for the current (AI) player. Call repeatedly until the turn passes to someone else. */
export function aiNextAction(g: GameState): Action {
  const player = g.current;
  const p = g.players[player]!;

  if (g.phase === "start") {
    if (!p.active) {
      if (g.market.length === 0) return { type: "endTurn" }; // market ran dry — legal pass
      return { type: "chooseCivilization", slot: bestMarketSlot(g, player) };
    }
    if (shouldCollapse(g, player)) return { type: "collapse" };
    return { type: "recall", take: recallPlan(g, player) };
  }

  if (g.phase === "conquer") {
    const civ = p.active!;
    // Adaptive: pick the second habitat that shows up most among current legal targets.
    if (civ.trait === "adaptive" && g.turn.adaptiveHabitat === null) {
      return { type: "chooseAdaptiveHabitat", habitat: bestAdaptiveHabitat(g, player) };
    }
    // Free value first: Pelagic conversion.
    const conversions = conversionTargets(g, player);
    if (conversions.length > 0) return { type: "convertToken", target: conversions[0]! };
    // Cryari remnant conquest when available and affordable.
    if (!g.turn.remnantConquerUsed && p.remnants.some((r) => r.species === "cryari_revenants")) {
      const target = bestRemnantTarget(g, player);
      if (target) return { type: "remnantConquer", target };
    }
    const candidates = legalTargets(g, player)
      .map((c) => ({ ...c, value: targetValue(g, player, c.target, c.cost) }))
      .sort((a, b) => b.value - a.value);
    const affordable = candidates.filter((c) => c.cost <= civ.hand && c.value > 0);
    if (affordable.length > 0) return { type: "conquer", target: affordable[0]!.target };
    // Gamble on the die when barely short and the prize is good.
    const gamble = candidates.find((c) => {
      const short = c.cost - civ.hand;
      return short >= 1 && short <= 2 && c.value >= 2 && civ.hand >= 1;
    });
    if (gamble && !g.turn.finalConquestUsed) return { type: "finalConquest", target: gamble.target };
    return { type: "endConquests" };
  }

  // redeploy / post: let the reducer defaults handle distribution and Verdant growth.
  if (g.phase === "post") {
    if (p.active?.trait === "fortress_building" && !g.turn.starbasePlaced) {
      const own = systemsOf(g, player, "active");
      const total = own.reduce((s, id) => s + g.systems[id]!.starbases, 0);
      if (own.length > 0 && total < 6) {
        const frontier = own.sort((a, b) => g.systems[a]!.starbases - g.systems[b]!.starbases)[0]!;
        return { type: "placeStarbase", system: frontier };
      }
    }
    if (p.active?.trait === "heroic" && !g.turn.bulwarksMoved) {
      // Shield the two biggest stacks.
      const own = systemsOf(g, player, "active").sort((a, b) => g.systems[b]!.tokens - g.systems[a]!.tokens);
      if (own.length > 0) return { type: "moveBulwarks", systems: own.slice(0, 2) };
    }
    if (p.active?.trait === "diplomatic" && !g.turn.pactNamed) {
      const threat = biggestThreat(g, player);
      if (threat !== null && p.diplomaticTarget !== threat) return { type: "nameDiplomaticTarget", player: threat };
    }
    // Twilight: take the free-tempo collapse once the civ is winding down.
    if (p.active?.trait === "twilight" && p.active.turnsActive >= 2 && g.round < g.config.rounds) {
      const own = systemsOf(g, player, "active");
      const spare = own.reduce((s, id) => s + Math.max(0, g.systems[id]!.tokens - 1), 0) + p.active.hand;
      if (spare < 4) return { type: "collapse" };
    }
  }
  return { type: "endTurn" };
}

function bestAdaptiveHabitat(g: GameState, player: PlayerId): PlanetType {
  const counts = new Map<PlanetType, number>();
  for (const { target } of legalTargets(g, player)) {
    for (const pl of SYSTEMS[target]!.planets) counts.set(pl, (counts.get(pl) ?? 0) + 1);
  }
  const own = SPECIES[g.players[player]!.active!.species]!.habitat;
  let best: PlanetType = own === "ocean" ? "terran" : "ocean";
  let bestN = -1;
  for (const [pl, n] of counts) {
    if (pl !== own && n > bestN) {
      bestN = n;
      best = pl;
    }
  }
  return best;
}

function bestMarketSlot(g: GameState, player: PlayerId): number {
  const p = g.players[player]!;
  let best = 0;
  let bestScore = -Infinity;
  g.market.forEach((slot, i) => {
    if (i > p.influence) return; // cannot afford the skips
    const pop = SPECIES[slot.species]!.population + TRAITS[slot.trait]!.population;
    const habitat = SPECIES[slot.species]!.habitat;
    const habitatSupply = Object.values(SYSTEMS).filter(
      (s) => s.planets.includes(habitat) && g.systems[s.code]!.occupant === null,
    ).length;
    const score = pop + slot.influence - i + habitatSupply * 0.4;
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  });
  return best;
}

function shouldCollapse(g: GameState, player: PlayerId): boolean {
  const p = g.players[player]!;
  const civ = p.active!;
  if (civ.turnsActive < 2) return false;
  if (g.round >= g.config.rounds) return false; // never collapse on the last round
  const own = systemsOf(g, player, "active");
  const spare = own.reduce((s, id) => s + Math.max(0, g.systems[id]!.tokens - 1), 0) + civ.hand;
  const cheapest = legalTargets(g, player).reduce((m, c) => Math.min(m, c.cost), Infinity);
  if (spare < cheapest || (spare < 3 && civ.turnsActive >= 3)) return true;
  // An old empire that can barely take one more system should cycle — the relaunch
  // (fresh population + banked market influence) usually out-tempos limping onward.
  if (civ.turnsActive >= 4 && spare < cheapest * 2 && g.round <= g.config.rounds - 2) return true;
  // Hard stop on immortal empires (Verdant-style): cycle before the treadmill stalls.
  return civ.turnsActive >= 6 && g.round <= g.config.rounds - 2;
}

function recallPlan(g: GameState, player: PlayerId): Record<SystemId, number> {
  // Take every spare token; keep 1 everywhere (simple but effective).
  const take: Record<SystemId, number> = {};
  for (const id of systemsOf(g, player, "active")) {
    const spare = g.systems[id]!.tokens - 1;
    if (spare > 0) take[id] = spare;
  }
  return take;
}

function targetValue(g: GameState, player: PlayerId, target: SystemId, cost: number): number {
  const def = SYSTEMS[target]!;
  const habs = favoredHabitats(g, player);
  let inf = 1; // base system score
  if (habs.some((h) => def.planets.includes(h))) inf += 1;
  const trait = g.players[player]!.active!.trait;
  if (def.relic) inf += 1; // Relics pay every civilization
  if (trait === "ancient" && def.relic) inf += 1; // and double for Ancient
  if (trait === "mercantile") inf += 1;
  const occ = g.systems[target]!.occupant;
  if (trait === "parasitic" && (occ !== null || g.systems[target]!.neutrals > 0)) inf += 1;
  // Ossian: each Barren system is worth ~half a point via the pairing bonus.
  if (g.players[player]!.active!.species === "ossian_prospectors" && def.planets.includes("barren")) inf += 0.5;
  // Rough payback horizon: expect to hold for ~2 turns.
  return inf * 2 - cost * 0.55;
}

function bestRemnantTarget(g: GameState, player: PlayerId): SystemId | null {
  let best: SystemId | null = null;
  let bestCost = Infinity;
  for (const id of Object.keys(g.systems)) {
    const c = checkRemnantConquest(g, player, id);
    if (c.legal && c.cost < bestCost) {
      best = id;
      bestCost = c.cost;
    }
  }
  return bestCost <= 4 ? best : null;
}

function biggestThreat(g: GameState, player: PlayerId): PlayerId | null {
  // The opponent with the most active tokens in systems ADJACENT to ours.
  const own = systemsOf(g, player, "active");
  const border = new Set<string>();
  for (const id of own) for (const n of neighbors(id)) border.add(n);
  const pressure = new Map<PlayerId, number>();
  for (const n of border) {
    const occ = g.systems[n]!.occupant;
    if (occ && occ.player !== player && occ.kind === "active") {
      pressure.set(occ.player, (pressure.get(occ.player) ?? 0) + g.systems[n]!.tokens);
    }
  }
  let best: PlayerId | null = null;
  let bestP = 0;
  for (const [pl, val] of pressure) {
    if (val > bestP) {
      bestP = val;
      best = pl;
    }
  }
  return best;
}
