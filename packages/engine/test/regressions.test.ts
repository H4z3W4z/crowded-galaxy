// Regression tests for bugs found by the adversarial playtest panel (v0.2.1).
import { describe, expect, it } from "vitest";
import {
  apply,
  checkConquest,
  conversionTargets,
  createGame,
  DEFAULT_CONFIG,
  legalTargets,
  scoreExpandTurn,
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

describe("panel bug 1: Concord of Many Remnant origins", () => {
  it("a different active civ may launch conquests from the Concord remnant network", () => {
    let g = createGame(config(41));
    g.market[0] = { species: "concord_of_many", trait: "industrious", influence: 0 };
    g.market[1] = { species: "magmaforged", trait: "catalytic", influence: 0 };
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    g = apply(g, { type: "conquer", target: "AR" });
    g = apply(g, { type: "endTurn" });
    g = apply(g, { type: "chooseCivilization", slot: 0 }); // P2
    g = apply(g, { type: "conquer", target: "MR" });
    g = apply(g, { type: "endTurn" });
    g = apply(g, { type: "collapse" }); // P1: Concord remnant on AR
    g = apply(g, { type: "recall", take: {} }); // P2 takes a quiet turn
    g = apply(g, { type: "endTurn" });
    // P1 launches a NEW civ; HD is adjacent only to the Concord remnant (AR).
    g.market[0] = { species: "kharax_brood", trait: "aggressive", influence: 0 };
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    const check = checkConquest(g, 0, "HD");
    expect(check.legal).toBe(true);
    g = apply(g, { type: "conquer", target: "HD" });
    expect(g.systems["HD"]!.occupant).toEqual({ player: 0, kind: "active", remnantIdx: -1 });
    expect(g.systems["AR"]!.occupant!.kind).toBe("remnant"); // remnant unharmed
  });
});

describe("panel bugs 2/4/7: Pelagic conversion holes", () => {
  function pelagicSetup(seed: number, p1Trait: string): GameState {
    let g = createGame(config(seed));
    g.market[0] = { species: "ossian_prospectors", trait: p1Trait, influence: 0 };
    g.market[1] = { species: "pelagic_oracles", trait: "industrious", influence: 0 };
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    g = apply(g, { type: "conquer", target: "AR" });
    g = apply(g, { type: "conquer", target: "SR" });
    g = apply(g, { type: "endConquests" });
    const hand = g.players[0]!.active!.hand;
    const ar = g.systems["AR"]!.tokens;
    const sr = g.systems["SR"]!.tokens;
    g = apply(g, { type: "redeploy", dist: { AR: 1, SR: sr + ar - 1 + hand } });
    return g;
  }

  it("bulwarked systems cannot be converted", () => {
    let g = pelagicSetup(42, "heroic");
    g = apply(g, { type: "moveBulwarks", systems: ["AR"] });
    g = apply(g, { type: "endTurn" });
    g = apply(g, { type: "chooseCivilization", slot: 0 }); // P2 = Pelagic
    g = apply(g, { type: "conquer", target: "CW" }); // adjacent to AR
    expect(conversionTargets(g, 1)).not.toContain("AR");
    expect(() => apply(g, { type: "convertToken", target: "AR" })).toThrow(/not a legal conversion/);
  });

  it("conversion strips the victim's Starbase instead of inheriting it", () => {
    let g = pelagicSetup(43, "fortress_building");
    g = apply(g, { type: "placeStarbase", system: "AR" });
    g = apply(g, { type: "endTurn" });
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    g = apply(g, { type: "conquer", target: "CW" });
    expect(conversionTargets(g, 1)).toContain("AR");
    g = apply(g, { type: "convertToken", target: "AR" });
    expect(g.systems["AR"]!.occupant!.player).toBe(1);
    expect(g.systems["AR"]!.starbases).toBe(0);
  });

  it("the Diplomatic pact blocks conversion by the named opponent", () => {
    let g = pelagicSetup(44, "diplomatic");
    g = apply(g, { type: "nameDiplomaticTarget", player: 1 });
    g = apply(g, { type: "endTurn" });
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    g = apply(g, { type: "conquer", target: "CW" });
    expect(conversionTargets(g, 1)).not.toContain("AR");
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
    // Reaching slot 3 costs 3 (one Influence per skipped combo) — affordable at 5.
    const after = apply(g, { type: "chooseCivilization", slot: 3 });
    expect(after.players[0]!.influence).toBe(2); // 5 - 3 skipped; chosen combo had 0 banked
    expect(after.players[0]!.active).not.toBeNull();
    expect(after.market[0]!.influence).toBe(1); // a coin landed on each skipped combo
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
    g = apply(g, { type: "endTurn" }); // no conquests at all
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
  it("ignoring a Hazard twice does not make it cheaper than no Hazard", () => {
    let g = createGame(config(48));
    g.market[0] = { species: "magmaforged", trait: "stealth", influence: 0 };
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    const costs = Object.fromEntries(legalTargets(g, 0).map((t) => [t.target, t.cost]));
    // CW: empty hazard rim gate. Base 2 + 1 hazard; both ignores zero the charge once -> 2.
    expect(costs["CW"]).toBe(2);
    expect(costs["AR"]).toBe(2); // identical to the non-hazard system, not cheaper
  });
});

describe("panel deviation: dead Remnant leaves play", () => {
  it("defeating a Remnant's last system discards its species card", () => {
    let g = createGame(config(49));
    g.market[0] = { species: "ossian_prospectors", trait: "industrious", influence: 0 };
    g.market[1] = { species: "magmaforged", trait: "catalytic", influence: 0 };
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    g = apply(g, { type: "conquer", target: "AR" });
    g = apply(g, { type: "endTurn" });
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    g = apply(g, { type: "conquer", target: "SR" });
    g = apply(g, { type: "endTurn" });
    g = apply(g, { type: "collapse" }); // P1 remnant on AR only
    expect(g.players[0]!.remnants).toHaveLength(1);
    g = apply(g, { type: "recall", take: {} });
    g = apply(g, { type: "conquer", target: "AR" }); // P2 destroys the remnant's last system
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
    let g = createGame(config(51));
    g.market[0] = { species: "ossian_prospectors", trait: "twilight", influence: 0 };
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    g = apply(g, { type: "conquer", target: "AR" });
    g = apply(g, { type: "conquer", target: "SR" });
    g = apply(g, { type: "endConquests" });
    g = apply(g, { type: "endTurn" }); // auto-redeploy -> post... but endTurn scores and ends
    // Redo properly: reach post phase, then collapse.
    let h = createGame(config(51));
    h.market[0] = { species: "ossian_prospectors", trait: "twilight", influence: 0 };
    h = apply(h, { type: "chooseCivilization", slot: 0 });
    h = apply(h, { type: "conquer", target: "AR" });
    h = apply(h, { type: "conquer", target: "SR" });
    h = apply(h, { type: "endConquests" });
    const hand = h.players[0]!.active!.hand;
    const ar = h.systems["AR"]!.tokens;
    const sr = h.systems["SR"]!.tokens;
    h = apply(h, { type: "redeploy", dist: { AR: ar, SR: sr + hand } });
    const expandScore = totalOf(scoreExpandTurn(h, 0));
    h = apply(h, { type: "collapse" }); // Twilight end-of-turn collapse
    expect(h.players[0]!.active).toBeNull();
    // Expand scoring + 2 surviving remnant systems from the collapse.
    expect(h.players[0]!.influence).toBe(expandScore + 2);
    // Plain endTurn path (g) must score strictly less than the Twilight path.
    expect(g.players[0]!.influence).toBe(expandScore);
  });
});
