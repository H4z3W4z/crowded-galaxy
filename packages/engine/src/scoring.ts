// End-of-turn Influence scoring. Pure: returns the breakdown without mutating.

import { SPECIES } from "./gen/cards.js";
import { SYSTEMS, SYSTEM_IDS } from "./gen/map.js";
import { favoredHabitats, hasPlanet, neighbors, systemsOf } from "./rules.js";
import type { GameState, PlayerId } from "./types.js";

export interface ScoreLine {
  label: string;
  amount: number;
}

export function scoreExpandTurn(g: GameState, player: PlayerId): ScoreLine[] {
  const lines: ScoreLine[] = [];
  const p = g.players[player]!;
  const civ = p.active;
  const active = systemsOf(g, player, "active");

  if (civ && active.length > 0) {
    lines.push({ label: "Active systems", amount: active.length });

    const habs = favoredHabitats(g, player);
    const habCount = active.filter((id) => habs.some((h) => hasPlanet(id, h))).length;
    if (habCount > 0) lines.push({ label: "Favored habitat", amount: habCount });

    if (civ.species === "ossian_prospectors") {
      const n = active.filter((id) => SYSTEMS[id]!.planets.filter((pl) => pl === "barren").length >= 2).length;
      if (n > 0) lines.push({ label: "Ossian: double-Barren systems", amount: n });
    }

    switch (civ.trait) {
      case "catalytic":
        lines.push({ label: "Catalytic", amount: 2 });
        break;
      case "ancient": {
        const n = active.filter((id) => SYSTEMS[id]!.relic).length;
        if (n > 0) lines.push({ label: "Ancient: Relic systems", amount: n });
        break;
      }
      case "fortress_building": {
        const n = active.reduce((sum, id) => sum + g.systems[id]!.starbases, 0);
        if (n > 0) lines.push({ label: "Fortress-Building: Starbases", amount: n });
        break;
      }
      case "industrious": {
        const n = active.filter((id) => SYSTEMS[id]!.planets.length >= 3).length;
        if (n > 0) lines.push({ label: "Industrious: 3-planet systems", amount: n });
        break;
      }
      case "mercantile":
        lines.push({ label: "Mercantile", amount: active.length });
        break;
      case "parasitic": {
        const n = g.turn.conquests.filter((c) => c.wasNonEmpty).length;
        if (n > 0) lines.push({ label: "Parasitic: non-empty conquests", amount: n });
        break;
      }
    }
    if (civ.trait === "wealthy" && g.turn.launchTurn) {
      lines.push({ label: "Wealthy: launch turn", amount: 7 });
    }
  }

  lines.push(...scoreRemnants(g, player));
  return lines;
}

export function scoreRemnants(g: GameState, player: PlayerId): ScoreLine[] {
  const lines: ScoreLine[] = [];
  const p = g.players[player]!;

  p.remnants.forEach((rem, idx) => {
    const held = SYSTEM_IDS.filter((id) => {
      const occ = g.systems[id]!.occupant;
      return occ?.player === player && occ.kind === "remnant" && occ.remnantIdx === idx;
    });
    if (held.length === 0) return;
    const name = SPECIES[rem.species]!.name;
    lines.push({ label: `Remnant systems (${name})`, amount: held.length });

    switch (rem.species) {
      case "thalassi_compact":
        if (held.filter((id) => hasPlanet(id, "ocean")).length >= 2) {
          lines.push({ label: "Thalassi Remnant bonus", amount: 1 });
        }
        break;
      case "pelagic_oracles": {
        const adjacentToOpponent = held.some((id) =>
          [...neighbors(id)].some((n) => {
            const occ = g.systems[n]!.occupant;
            return occ !== null && occ.player !== player && occ.kind === "active";
          }),
        );
        if (adjacentToOpponent) lines.push({ label: "Pelagic Remnant bonus", amount: 1 });
        break;
      }
      case "jovian_reavers":
        if (held.filter((id) => hasPlanet(id, "gas_giant")).length >= 2) {
          lines.push({ label: "Jovian Remnant bonus", amount: 1 });
        }
        break;
      case "ossian_prospectors":
        if (held.some((id) => SYSTEMS[id]!.planets.length >= 3)) {
          lines.push({ label: "Ossian Remnant bonus", amount: 1 });
        }
        break;
      case "verdant_mycelium": {
        const terran = held.filter((id) => hasPlanet(id, "terran"));
        const adjacentPair = terran.some((a) => terran.some((b) => a !== b && neighbors(a).has(b)));
        if (adjacentPair) lines.push({ label: "Verdant Remnant bonus", amount: 1 });
        break;
      }
    }
  });

  return lines;
}

export function totalOf(lines: ScoreLine[]): number {
  return lines.reduce((s, l) => s + l.amount, 0);
}
