// Regression tests for bugs found by the adversarial playtest panels.
// System references are derived from the map so these survive map changes.
import { describe, expect, it } from "vitest";
import {
  apply,
  checkConquest,
  conversionTargets,
  createGame,
  DEFAULT_CONFIG,
  legalTargets,
  neighbors,
  scoreExpandTurn,
  SYSTEM_IDS,
  SYSTEMS,
  totalOf,
} from "../src/index.js";
import type { GameConfig, GameState } from "../src/types.js";

function config(seed: number, seats = 2): GameConfig {
  return {
    ...DEFAULT_CONFIG,
    startingInfluence: 0, // exact-value assertions below assume an empty starting bank
    seed,
    seats: Array.from({ length: seats }, (_, i) => ({ name: `P${i + 1}`, ai: true })),
  };
}

// A non-hazard rim gate, one of its non-rim neighbors (reachable only by adjacency),
// and an adjacent rim gate an opponent can stage from.
const RIM = SYSTEM_IDS.find((id) => SYSTEMS[id]!.rimGate && !SYSTEMS[id]!.hazard)!;
const INNER = [...neighbors(RIM)].find((n) => !SYSTEMS[n]!.rimGate)!;
const ADJ_RIM = [...neighbors(RIM)].find((n) => SYSTEMS[n]!.rimGate)!;
const OTHER_RIM = SYSTEM_IDS.find((id) => SYSTEMS[id]!.rimGate && id !== RIM && !SYSTEMS[id]!.hazard)!;

describe("panel bug 1: Concord of Many Remnant origins", () => {
  it("a different active civ may launch conquests from the Concord remnant network", () => {
    let g = createGame(config(41));
    g.market[0] = { species: "concord_of_many", trait: "industrious", influence: 0 };
    g.market[1] = { species: "magmaforged", trait: "catalytic", influence: 0 };
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    g = apply(g, { type: "conquer", target: RIM });
    g = apply(g, { type: "endTurn" });
    g = apply(g, { type: "chooseCivilization", slot: 0 }); // P2 launches, no conquest
    g = apply(g, { type: "endTurn" });
    g = apply(g, { type: "collapse" }); // P1: Concord remnant on RIM
    g = apply(g, { type: "recall", take: {} }); // P2 quiet turn
    g = apply(g, { type: "endTurn" });
    // P1 launches a NEW civ; INNER is adjacent only to the Concord remnant (RIM), not a rim gate.
    g.market[0] = { species: "kharax_brood", trait: "aggressive", influence: 0 };
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    const check = checkConquest(g, 0, INNER);
    expect(check.legal).toBe(true);
    g = apply(g, { type: "conquer", target: INNER });
    expect(g.systems[INNER]!.occupant).toEqual({ player: 0, kind: "active", remnantIdx: -1 });
    expect(g.systems[RIM]!.occupant!.kind).toBe("remnant"); // remnant unharmed
  });
});

describe("panel bugs 2/4/7: Pelagic conversion holes", () => {
  // P1 (ossian + p1Trait) holds RIM (1 token) and INNER; returns in the post phase.
  function pelagicSetup(seed: number, p1Trait: string): GameState {
    let g = createGame(config(seed));
    g.market[0] = { species: "ossian_prospectors", trait: p1Trait, influence: 0 };
    g.market[1] = { species: "pelagic_oracles", trait: "industrious", influence: 0 };
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    g = apply(g, { type: "conquer", target: RIM });
    g = apply(g, { type: "conquer", target: INNER });
    g = apply(g, { type: "endConquests" });
    const hand = g.players[0]!.active!.hand;
    const rimT = g.systems[RIM]!.tokens;
    const innerT = g.systems[INNER]!.tokens;
    g = apply(g, { type: "redeploy", dist: { [RIM]: 1, [INNER]: innerT + rimT - 1 + hand } });
    return g; // post phase
  }

  it("bulwarked systems cannot be converted", () => {
    let g = pelagicSetup(42, "heroic");
    g = apply(g, { type: "moveBulwarks", systems: [RIM] });
    g = apply(g, { type: "endTurn" });
    g = apply(g, { type: "chooseCivilization", slot: 0 }); // P2 = Pelagic
    g = apply(g, { type: "conquer", target: ADJ_RIM }); // adjacent to RIM
    expect(conversionTargets(g, 1)).not.toContain(RIM);
    expect(() => apply(g, { type: "convertToken", target: RIM })).toThrow(/not a legal conversion/);
  });

  it("conversion strips the victim's Starbase instead of inheriting it", () => {
    let g = pelagicSetup(43, "fortress_building");
    g = apply(g, { type: "placeStarbase", system: RIM });
    g = apply(g, { type: "endTurn" });
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    g = apply(g, { type: "conquer", target: ADJ_RIM });
    expect(conversionTargets(g, 1)).toContain(RIM);
    g = apply(g, { type: "convertToken", target: RIM });
    expect(g.systems[RIM]!.occupant!.player).toBe(1);
    expect(g.systems[RIM]!.starbases).toBe(0);
  });

  it("the Diplomatic pact blocks conversion by the named opponent", () => {
    let g = pelagicSetup(44, "diplomatic");
    g = apply(g, { type: "nameDiplomaticTarget", player: 1 });
    g = apply(g, { type: "endTurn" });
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    g = apply(g, { type: "conquer", target: ADJ_RIM });
    expect(conversionTargets(g, 1)).not.toContain(RIM);
  });
});

describe("iPad bug: turn-1 market has agency (Small World starting coins)", () => {
  it("players start with 5 Influence by default and can skip on turn 1", () => {
    const g = createGame({
      ...DEFAULT_CONFIG,
      seed: 60,
      seats: [
        { name: "A", ai: false },
        { name: "B", ai: true },
      ],
    });
    expect(g.players[0]!.influence).toBe(5);
    const after = apply(g, { type: "chooseCivilization", slot: 3 });
    expect(after.players[0]!.influence).toBe(2); // 5 - 3 skipped; chosen combo had 0 banked
    expect(after.players[0]!.active).not.toBeNull();
    expect(after.market[0]!.influence).toBe(1);
    expect(after.market[1]!.influence).toBe(1);
    expect(after.market[2]!.influence).toBe(1);
  });
});

describe("panel bug 3: launching is mandatory", () => {
  it("a player with no civilization cannot pass while the market has combos", () => {
    const g = createGame(config(45));
    expect(() => apply(g, { type: "endTurn" })).toThrow(/must choose/);
  });
});

describe("panel bugs 5/6: unconditional trait scoring", () => {
  it("Wealthy pays +7 on a zero-system launch turn", () => {
    let g = createGame(config(46));
    g.market[0] = { species: "ossian_prospectors", trait: "wealthy", influence: 0 };
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    g = apply(g, { type: "endTurn" });
    expect(g.players[0]!.influence).toBe(7);
  });

  it("Catalytic pays +2 while active even with zero systems", () => {
    let g = createGame(config(47));
    g.market[0] = { species: "ossian_prospectors", trait: "catalytic", influence: 0 };
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    g = apply(g, { type: "endTurn" });
    expect(g.players[0]!.influence).toBe(2);
  });
});

describe("panel bug: Magmaforged+Stealth hazard double-dip", () => {
  it("ignoring a Hazard twice zeros the charge but never makes it a discount", () => {
    let g = createGame(config(48));
    g.market[0] = { species: "magmaforged", trait: "stealth", influence: 0 };
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    // Push inward until a Hazard system is reachable, then check its cost.
    let hazardChecked = false;
    for (let step = 0; step < 6 && !hazardChecked; step++) {
      const opts = legalTargets(g, 0);
      const hz = opts.find((o) => SYSTEMS[o.target]!.hazard);
      if (hz) {
        // Hazard fully ignored: cost is base 2 + neutrals, NOT 2 + neutrals - 1.
        expect(hz.cost).toBe(2 + g.systems[hz.target]!.neutrals);
        hazardChecked = true;
        break;
      }
      const next = opts.slice().sort((a, b) => a.cost - b.cost)[0];
      if (!next || next.cost > g.players[0]!.active!.hand) break;
      g = apply(g, { type: "conquer", target: next.target });
    }
    expect(hazardChecked).toBe(true);
  });
});

describe("panel deviation: dead Remnant leaves play", () => {
  it("defeating a Remnant's last system discards its species card", () => {
    let g = createGame(config(49));
    g.market[0] = { species: "ossian_prospectors", trait: "industrious", influence: 0 };
    g.market[1] = { species: "magmaforged", trait: "catalytic", influence: 0 };
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    g = apply(g, { type: "conquer", target: RIM });
    g = apply(g, { type: "endTurn" });
    g = apply(g, { type: "chooseCivilization", slot: 0 }); // P2 burns its turn on another rim gate
    g = apply(g, { type: "conquer", target: OTHER_RIM });
    g = apply(g, { type: "endTurn" });
    g = apply(g, { type: "collapse" }); // P1 remnant on RIM only
    expect(g.players[0]!.remnants).toHaveLength(1);
    g = apply(g, { type: "recall", take: {} }); // P2 re-enters RIM (rim gate) and destroys the remnant
    g = apply(g, { type: "conquer", target: RIM });
    expect(g.players[0]!.remnants).toHaveLength(0);
    expect(g.speciesDiscard).toContain("ossian_prospectors");
  });
});

describe("panel bug: no-progress action loops", () => {
  it("Adaptive's habitat pick is once per turn", () => {
    let g = createGame(config(50));
    g.market[0] = { species: "ossian_prospectors", trait: "adaptive", influence: 0 };
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    g = apply(g, { type: "chooseAdaptiveHabitat", habitat: "ocean" });
    expect(() => apply(g, { type: "chooseAdaptiveHabitat", habitat: "ice" })).toThrow(/already chosen/);
  });
});

describe("panel bug: Twilight collapse scoring", () => {
  it("scores the expand turn AND the collapse, per rules 6.B", () => {
    function run(twilightCollapse: boolean): number {
      let g = createGame(config(51));
      g.market[0] = { species: "ossian_prospectors", trait: "twilight", influence: 0 };
      g = apply(g, { type: "chooseCivilization", slot: 0 });
      g = apply(g, { type: "conquer", target: RIM });
      g = apply(g, { type: "conquer", target: INNER });
      g = apply(g, { type: "endConquests" });
      const hand = g.players[0]!.active!.hand;
      g = apply(g, { type: "redeploy", dist: { [RIM]: g.systems[RIM]!.tokens, [INNER]: g.systems[INNER]!.tokens + hand } });
      if (twilightCollapse) g = apply(g, { type: "collapse" });
      else g = apply(g, { type: "endTurn" });
      return g.players[0]!.influence;
    }
    // Score the expand turn once to know the baseline.
    let h = createGame(config(51));
    h.market[0] = { species: "ossian_prospectors", trait: "twilight", influence: 0 };
    h = apply(h, { type: "chooseCivilization", slot: 0 });
    h = apply(h, { type: "conquer", target: RIM });
    h = apply(h, { type: "conquer", target: INNER });
    h = apply(h, { type: "endConquests" });
    const hnd = h.players[0]!.active!.hand;
    h = apply(h, { type: "redeploy", dist: { [RIM]: h.systems[RIM]!.tokens, [INNER]: h.systems[INNER]!.tokens + hnd } });
    const expandScore = totalOf(scoreExpandTurn(h, 0));

    expect(run(true)).toBe(expandScore + 2); // expand scoring + 2 remnant systems from the collapse
    expect(run(false)).toBe(expandScore); // plain end-of-turn scores only the expand turn
  });
});
