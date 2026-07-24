// Board queries: adjacency, control, conquest cost and legality.
// Pure functions over GameState — shared by reducer, AI, and UI preview.
// The galaxy is per-game (state.map), generated from the seed, so nothing here
// may depend on a module-level map.

import { SPECIES } from "./gen/cards.js";
import type { GameState, PlayerId, PlanetType, SystemId } from "./types.js";

export function neighbors(g: GameState, id: SystemId): readonly SystemId[] {
  return g.map.adjacency[id] ?? [];
}

export function isWormholeLink(g: GameState, a: SystemId, b: SystemId): boolean {
  return g.map.wormholeAdj[a]?.includes(b) ?? false;
}

export function systemsOf(g: GameState, player: PlayerId, kind: "active" | "remnant"): SystemId[] {
  return g.map.systemIds.filter((id) => {
    const occ = g.systems[id]!.occupant;
    return occ !== null && occ.player === player && occ.kind === kind;
  });
}

export function hasPlanet(g: GameState, id: SystemId, type: PlanetType): boolean {
  return g.map.systems[id]!.planet === type;
}

function speciesOf(g: GameState, player: PlayerId): string | null {
  return g.players[player]!.active?.species ?? null;
}

function traitOf(g: GameState, player: PlayerId): string | null {
  return g.players[player]!.active?.trait ?? null;
}

/** Systems a conquest by `player`'s active civ may originate from. */
function originSystems(g: GameState, player: PlayerId): SystemId[] {
  const own = systemsOf(g, player, "active");
  // Concord of Many, active side: expand through / launch from ALL own Remnant systems.
  if (speciesOf(g, player) === "concord_of_many") {
    return own.concat(systemsOf(g, player, "remnant"));
  }
  // Concord of Many, Remnant side: its systems serve the (different) active empire as origins.
  const p = g.players[player]!;
  const concordIdx = p.remnants.findIndex((r) => r.species === "concord_of_many");
  if (concordIdx !== -1) {
    return own.concat(
      g.map.systemIds.filter((id) => {
        const occ = g.systems[id]!.occupant;
        return occ?.player === player && occ.kind === "remnant" && occ.remnantIdx === concordIdx;
      }),
    );
  }
  return own;
}

export interface ConquestCheck {
  legal: boolean;
  reason?: string;
  cost: number; // meaningful when legal
  viaWormhole: boolean;
}

/** Full legality + cost for `player`'s active civ conquering `target`. Ignores hand size. */
export function checkConquest(g: GameState, player: PlayerId, target: SystemId): ConquestCheck {
  const civ = g.players[player]!.active;
  const sys = g.systems[target];
  const def = g.map.systems[target];
  const illegal = (reason: string): ConquestCheck => ({ legal: false, reason, cost: 0, viaWormhole: false });
  if (!civ) return illegal("no active civilization");
  if (!sys || !def) return illegal("unknown system");
  if (sys.bulwark) return illegal("protected by a Bulwark");
  const occ = sys.occupant;
  if (occ && occ.player === player && occ.kind === "active") return illegal("already yours");

  // Diplomatic: the defender may have named this attacker as untouchable.
  if (occ && occ.kind === "active" && g.players[occ.player]!.diplomaticTarget === player) {
    return illegal("blocked by Diplomatic pact");
  }

  const species = civ.species;
  const trait = civ.trait;
  const origins = originSystems(g, player);
  const hasBoard = origins.length > 0;

  let reachable = false;
  let viaWormhole = false;
  if (hasBoard) {
    for (const o of origins) {
      if (neighbors(g, o).includes(target)) {
        reachable = true;
        if (isWormholeLink(g, o, target)) viaWormhole = true;
      }
    }
    // Nomadic: any conquest may enter through any Rim Gate.
    if (!reachable && trait === "nomadic" && def.rimGate) reachable = true;
    // Heliox Aerostats: the atmospheric network — the drifting cities reach any
    // Gas Giant in the galaxy, so scattered Gas Giants are an asset, not a problem.
    if (!reachable && species === "heliox_aerostats" && def.planet === "gas_giant") reachable = true;
    // Quantum Drive: shared planet type with any controlled system, adjacency-free.
    if (!reachable && trait === "quantum_drive") {
      reachable = origins.some((o) => g.map.systems[o]!.planets.some((p) => def.planets.includes(p)));
    }
  } else {
    // Launch (or re-entry after being wiped out): enter through any Rim Gate.
    reachable = def.rimGate;
    if (!reachable) return illegal("first conquest must enter through a Rim Gate");
  }
  if (!reachable) return illegal("not adjacent to your empire");

  return { legal: true, cost: conquestCost(g, player, target, viaWormhole), viaWormhole };
}

/** Deterministic part of the cost (Berserk's die roll is applied by the reducer). */
export function conquestCost(g: GameState, player: PlayerId, target: SystemId, viaWormhole: boolean): number {
  const sys = g.systems[target]!;
  const def = g.map.systems[target]!;
  const civ = g.players[player]!.active!;
  const occ = sys.occupant;

  let defenderTokens = occ ? sys.tokens : sys.neutrals;
  // Heliox Remnant: tokens in Gas Giant systems count double.
  if (occ?.kind === "remnant" && hasPlanet(g, target, "gas_giant")) {
    const rem = g.players[occ.player]!.remnants[occ.remnantIdx];
    if (rem?.species === "heliox_aerostats") defenderTokens *= 2;
  }

  // "Ignore" effects zero the charge instead of discounting it, so stacked ignores
  // (Magmaforged + Stealth) cannot double-dip a single Hazard into a net discount.
  const ignoreHazard = civ.species === "magmaforged" || civ.trait === "stealth";
  const hazardCharge = def.hazard && !ignoreHazard ? 1 : 0;
  const starbaseCharge = civ.trait === "stealth" ? 0 : sys.starbases;

  let cost = 2 + defenderTokens + starbaseCharge + hazardCharge;

  // Defender bonuses.
  if (occ) {
    const owner = g.players[occ.player]!;
    const defSpecies = occ.kind === "active" ? owner.active?.species : owner.remnants[occ.remnantIdx]?.species;
    if (defSpecies === "ferrum_continuum" && hasPlanet(g, target, "barren")) cost += 1;
    if (occ.kind === "active" && owner.active?.trait === "defensive") cost += 1;
    if (occ.kind === "remnant" && defSpecies === "vitrifrost_collective" && hasPlanet(g, target, "ice")) cost += 1;
    if (occ.kind === "remnant" && defSpecies === "magmaforged" && def.hazard) cost += 1;
  }

  // Attacker discounts.
  const empty = !occ && sys.neutrals === 0;
  if (civ.species === "thalassi_compact" && hasPlanet(g, target, "ocean")) cost -= 1;
  if (civ.trait === "aggressive") cost -= 1;
  if (civ.trait === "colonizing" && empty) cost -= 1;
  if (civ.trait === "wormhole_savvy" && viaWormhole) cost -= 1;

  return Math.max(1, cost);
}

/** Every system the current player's active civ could legally target right now (hand size ignored). */
export function legalTargets(g: GameState, player: PlayerId): { target: SystemId; cost: number }[] {
  const out: { target: SystemId; cost: number }[] = [];
  for (const id of g.map.systemIds) {
    const c = checkConquest(g, player, id);
    if (c.legal) out.push({ target: id, cost: c.cost });
  }
  return out;
}

/** Cryari Revenants: legality + cost for the remnant's one conquest per turn. */
export function checkRemnantConquest(g: GameState, player: PlayerId, target: SystemId): ConquestCheck {
  const illegal = (reason: string): ConquestCheck => ({ legal: false, reason, cost: 0, viaWormhole: false });
  const p = g.players[player]!;
  const idx = p.remnants.findIndex((r) => r.species === "cryari_revenants");
  if (idx === -1) return illegal("no Cryari Revenants remnant");
  const sys = g.systems[target]!;
  if (sys.bulwark) return illegal("protected by a Bulwark");
  const occ = sys.occupant;
  if (occ && occ.player === player) return illegal("cannot attack your own systems");
  // The Diplomatic pact binds the whole player, marching Remnants included.
  if (occ && occ.kind === "active" && g.players[occ.player]!.diplomaticTarget === player) {
    return illegal("blocked by Diplomatic pact");
  }
  const remSystems = g.map.systemIds.filter((id) => {
    const o = g.systems[id]!.occupant;
    return o?.player === player && o.kind === "remnant" && o.remnantIdx === idx;
  });
  let viaWormhole = false;
  const reachable = remSystems.some((o) => {
    if (!neighbors(g, o).includes(target)) return false;
    if (isWormholeLink(g, o, target)) viaWormhole = true;
    return true;
  });
  if (!reachable) return illegal("not adjacent to your Remnant");

  // Base cost only — remnants have no trait, no species attack discounts.
  const def = g.map.systems[target]!;
  let defenderTokens = occ ? sys.tokens : sys.neutrals;
  if (occ?.kind === "remnant" && hasPlanet(g, target, "gas_giant")) {
    const rem = g.players[occ.player]!.remnants[occ.remnantIdx];
    if (rem?.species === "heliox_aerostats") defenderTokens *= 2;
  }
  let cost = 2 + defenderTokens + sys.starbases + (def.hazard ? 1 : 0);
  if (occ) {
    const owner = g.players[occ.player]!;
    const defSpecies = occ.kind === "active" ? owner.active?.species : owner.remnants[occ.remnantIdx]?.species;
    if (defSpecies === "ferrum_continuum" && hasPlanet(g, target, "barren")) cost += 1;
    if (occ.kind === "active" && owner.active?.trait === "defensive") cost += 1;
    if (occ.kind === "remnant" && defSpecies === "vitrifrost_collective" && hasPlanet(g, target, "ice")) cost += 1;
    if (occ.kind === "remnant" && defSpecies === "magmaforged" && def.hazard) cost += 1;
  }
  cost = Math.max(1, cost);

  // Paying: pull spare tokens (leaving 1 behind) from remnant systems adjacent to the target.
  const spare = remSystems
    .filter((id) => neighbors(g, id).includes(target))
    .reduce((sum, id) => sum + Math.max(0, g.systems[id]!.tokens - 1), 0);
  if (spare < cost) return illegal(`needs ${cost} spare Remnant population adjacent, has ${spare}`);
  return { legal: true, cost, viaWormhole };
}

/** Pelagic Oracles conversion targets: lone active enemy token adjacent to the player's active empire. */
export function conversionTargets(g: GameState, player: PlayerId): SystemId[] {
  if (g.players[player]!.active?.species !== "pelagic_oracles") return [];
  const own = new Set(systemsOf(g, player, "active"));
  const out: SystemId[] = [];
  for (const id of g.map.systemIds) {
    const sys = g.systems[id]!;
    const occ = sys.occupant;
    if (!occ || occ.kind !== "active" || occ.player === player || sys.tokens !== 1) continue;
    if (sys.bulwark) continue; // Bulwarks stop conversion, not just conquest
    if (g.players[occ.player]!.diplomaticTarget === player) continue; // pact covers conversion
    if (g.turn.conversionsUsed.includes(occ.player)) continue;
    if (neighbors(g, id).some((n) => own.has(n))) out.push(id);
  }
  return out;
}

/** Favored habitats for scoring this turn (species habitat + Adaptive's pick). */
export function favoredHabitats(g: GameState, player: PlayerId): PlanetType[] {
  const civ = g.players[player]!.active;
  if (!civ) return [];
  const habs: PlanetType[] = [SPECIES[civ.species]!.habitat];
  if (civ.trait === "adaptive" && g.turn.adaptiveHabitat && g.current === player) {
    if (!habs.includes(g.turn.adaptiveHabitat)) habs.push(g.turn.adaptiveHabitat);
  }
  return habs;
}
