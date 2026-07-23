import { describe, expect, it } from "vitest";
import {
  aiNextAction,
  apply,
  createGame,
  DEFAULT_CONFIG,
  legalTargets,
  SPECIES,
  SYSTEM_IDS,
  SYSTEMS,
  TRAITS,
  systemsOf,
} from "../src/index.js";
import type { GameConfig, GameState } from "../src/types.js";

function config(seed: number, seats = 3): GameConfig {
  return {
    ...DEFAULT_CONFIG,
    seed,
    seats: Array.from({ length: seats }, (_, i) => ({ name: `P${i + 1}`, ai: true })),
  };
}

function playFullGame(seed: number, seats = 3): GameState {
  let g = createGame(config(seed, seats));
  let guard = 0;
  while (g.phase !== "over") {
    const action = aiNextAction(g);
    g = apply(g, action);
    if (++guard > 5000) throw new Error("game did not terminate");
  }
  return g;
}

describe("setup", () => {
  it("seeds neutral defenders per the map (19 tokens)", () => {
    const g = createGame(config(1));
    const total = SYSTEM_IDS.reduce((s, id) => s + g.systems[id]!.neutrals, 0);
    expect(total).toBe(19);
    expect(g.systems["BS"]!.neutrals).toBe(2);
    expect(g.systems["AR"]!.neutrals).toBe(0);
  });

  it("fills a 6-slot market and leaves the decks consistent", () => {
    const g = createGame(config(2));
    expect(g.market).toHaveLength(6);
    expect(g.speciesDeck.length).toBe(12 - 6);
    expect(g.traitDeck.length).toBe(20 - 6);
  });

  it("is deterministic: same seed, same setup", () => {
    expect(JSON.stringify(createGame(config(7)))).toBe(JSON.stringify(createGame(config(7))));
  });
});

describe("launch turn", () => {
  it("choosing a civ grants species+trait population and enters conquer phase", () => {
    let g = createGame(config(3));
    const slot = g.market[0]!;
    const expected = SPECIES[slot.species]!.population + TRAITS[slot.trait]!.population +
      (slot.species === "jovian_reavers" ? 4 : 0);
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    expect(g.players[0]!.active).not.toBeNull();
    expect(g.players[0]!.active!.hand).toBe(expected);
    expect(g.phase).toBe("conquer");
    expect(g.market).toHaveLength(6); // refilled
  });

  it("skip cost: taking slot 2 places 1 Influence on slots 0 and 1", () => {
    let g = createGame(config(4));
    g.players[0]!.influence = 5;
    const taken = g.market[2]!;
    g = apply(g, { type: "chooseCivilization", slot: 2 });
    expect(g.players[0]!.influence).toBe(5 - 2 + taken.influence);
    expect(g.market[0]!.influence).toBe(1);
    expect(g.market[1]!.influence).toBe(1);
  });

  it("first conquest must enter through a Rim Gate", () => {
    let g = createGame(config(5));
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    const targets = legalTargets(g, 0).map((t) => t.target);
    for (const t of targets) expect(SYSTEMS[t]!.rimGate).toBe(true);
  });

  it("empty rim system costs 2 (base), middle ring costs 3 (neutral)", () => {
    let g = createGame(config(6));
    // Force a known plain combo to avoid discount abilities.
    g.market[0] = { species: "ossian_prospectors", trait: "industrious", influence: 0 };
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    const costs = Object.fromEntries(legalTargets(g, 0).map((t) => [t.target, t.cost]));
    expect(costs["AR"]).toBe(2); // empty, no hazard
    expect(costs["CW"]).toBe(3); // hazard rim gate
  });
});

describe("conquest mechanics", () => {
  function launchAt(seed: number, species: string, trait: string): GameState {
    let g = createGame(config(seed));
    g.market[0] = { species, trait, influence: 0 };
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    return g;
  }

  it("conquering places cost tokens and clears neutrals permanently", () => {
    let g = launchAt(8, "ossian_prospectors", "industrious");
    g = apply(g, { type: "conquer", target: "AR" });
    expect(g.systems["AR"]!.occupant).toEqual({ player: 0, kind: "active", remnantIdx: -1 });
    expect(g.systems["AR"]!.tokens).toBe(2);
    g = apply(g, { type: "conquer", target: "HD" }); // middle ring, 1 neutral -> cost 3
    expect(g.systems["HD"]!.tokens).toBe(3);
    expect(g.systems["HD"]!.neutrals).toBe(0);
  });

  it("aggressive discounts every conquest", () => {
    const g = launchAt(9, "ossian_prospectors", "aggressive");
    const costs = Object.fromEntries(legalTargets(g, 0).map((t) => [t.target, t.cost]));
    expect(costs["AR"]).toBe(1);
  });

  it("thalassi discount applies to all ocean systems, min 1", () => {
    const g = launchAt(10, "thalassi_compact", "industrious");
    const costs = Object.fromEntries(legalTargets(g, 0).map((t) => [t.target, t.cost]));
    expect(costs["PL"]).toBe(1); // ocean rim gate, empty, 2-1
    expect(costs["VG"]).toBe(1);
  });

  it("defender loses one token permanently, survivors redeploy to their smallest system", () => {
    let g = createGame(config(11, 2));
    g.market[0] = { species: "ossian_prospectors", trait: "industrious", influence: 0 };
    g.market[1] = { species: "magmaforged", trait: "catalytic", influence: 0 };
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    g = apply(g, { type: "conquer", target: "AR" });
    g = apply(g, { type: "conquer", target: "SR" });
    g = apply(g, { type: "endTurn" });
    // P2 launches and attacks AR (2 defenders after redeploy? AR has whatever ended there).
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    const arTokens = g.systems["AR"]!.tokens;
    const srBefore = g.systems["SR"]!.tokens;
    const cost = 2 + arTokens; // no hazard, no modifiers for magmaforged vs AR
    g = apply(g, { type: "conquer", target: "AR" });
    expect(g.systems["AR"]!.occupant!.player).toBe(1);
    expect(g.systems["AR"]!.tokens).toBe(cost);
    // survivor(s) = arTokens - 1 went to SR
    expect(g.systems["SR"]!.tokens).toBe(srBefore + arTokens - 1);
  });

  it("bulwarked systems cannot be conquered", () => {
    let g = createGame(config(12, 2));
    g.market[0] = { species: "ossian_prospectors", trait: "heroic", influence: 0 };
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    g = apply(g, { type: "conquer", target: "AR" });
    g = apply(g, { type: "endConquests" });
    g = apply(g, { type: "redeploy", dist: { AR: g.players[0]!.active!.hand + 2 } });
    g = apply(g, { type: "moveBulwarks", systems: ["AR"] });
    g = apply(g, { type: "endTurn" });
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    expect(() => apply(g, { type: "conquer", target: "AR" })).toThrow(/Bulwark/);
  });

  it("final conquest: only when short 1-3, die decides, conquests end either way", () => {
    let g = createGame(config(13));
    g.market[0] = { species: "ossian_prospectors", trait: "industrious", influence: 0 };
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    g.players[0]!.active!.hand = 1; // engineer a shortfall vs HD (cost 3 via AR? not adjacent yet)
    // AR costs 2: shortfall 1 -> legal gamble.
    const before = g;
    expect(() => apply(before, { type: "conquer", target: "AR" })).toThrow(/costs 2/);
    g = apply(g, { type: "finalConquest", target: "AR" });
    expect(g.phase).toBe("redeploy");
    const won = g.systems["AR"]!.occupant?.player === 0;
    if (won) expect(g.systems["AR"]!.tokens).toBe(1);
    else expect(g.players[0]!.active!.hand).toBe(1);
  });
});

describe("collapse and remnants", () => {
  it("collapse leaves one token per system, flips to remnant, scores it", () => {
    let g = createGame(config(14, 2));
    g.market[0] = { species: "ossian_prospectors", trait: "industrious", influence: 0 };
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    g = apply(g, { type: "conquer", target: "AR" });
    g = apply(g, { type: "conquer", target: "SR" });
    g = apply(g, { type: "endTurn" });
    g = apply(g, { type: "chooseCivilization", slot: 0 }); // P2
    g = apply(g, { type: "endTurn" });
    const infBefore = g.players[0]!.influence;
    g = apply(g, { type: "collapse" });
    expect(g.players[0]!.active).toBeNull();
    expect(g.players[0]!.remnants).toHaveLength(1);
    expect(g.systems["AR"]!.occupant!.kind).toBe("remnant");
    expect(g.systems["AR"]!.tokens).toBe(1);
    expect(g.systems["SR"]!.tokens).toBe(1);
    expect(g.players[0]!.influence).toBe(infBefore + 2); // 2 remnant systems
  });

  it("cryari remnant keeps all tokens on collapse", () => {
    let g = createGame(config(15, 2));
    g.market[0] = { species: "cryari_revenants", trait: "industrious", influence: 0 };
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    g = apply(g, { type: "conquer", target: "AR" });
    g = apply(g, { type: "endConquests" });
    const hand = g.players[0]!.active!.hand;
    g = apply(g, { type: "redeploy", dist: { AR: hand + 2 } });
    g = apply(g, { type: "endTurn" });
    g = apply(g, { type: "chooseCivilization", slot: 0 }); // P2
    g = apply(g, { type: "endTurn" });
    const tokens = g.systems["AR"]!.tokens;
    g = apply(g, { type: "collapse" });
    expect(g.systems["AR"]!.tokens).toBe(tokens); // all kept
  });

  it("remnant defeated: all tokens removed", () => {
    let g = createGame(config(16, 2));
    g.market[0] = { species: "ossian_prospectors", trait: "industrious", influence: 0 };
    g.market[1] = { species: "magmaforged", trait: "catalytic", influence: 0 };
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    g = apply(g, { type: "conquer", target: "AR" });
    g = apply(g, { type: "endTurn" });
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    g = apply(g, { type: "conquer", target: "SR" }); // rim gate adjacent to AR
    g = apply(g, { type: "endTurn" });
    g = apply(g, { type: "collapse" }); // P1 remnant on AR
    g = apply(g, { type: "recall", take: {} });
    const cost = 2 + 1; // AR: base 2 + 1 remnant token
    const before = g.players[1]!.active!.hand;
    g = apply(g, { type: "conquer", target: "AR" });
    expect(g.systems["AR"]!.occupant!.player).toBe(1);
    expect(g.players[1]!.active!.hand).toBe(before - cost);
    expect(systemsOf(g, 0, "remnant")).toHaveLength(0);
  });
});

describe("full games (AI soak)", () => {
  it("plays 10 seeded 3-player games to completion with legal moves only", () => {
    for (let seed = 100; seed < 110; seed++) {
      const g = playFullGame(seed);
      expect(g.phase).toBe("over");
      expect(g.winners!.length).toBeGreaterThan(0);
      expect(g.round).toBe(g.config.rounds + 1);
      // Influence must be non-negative and someone should have scored.
      const total = g.players.reduce((s, p) => s + p.influence, 0);
      expect(total).toBeGreaterThan(0);
      for (const p of g.players) expect(p.influence).toBeGreaterThanOrEqual(0);
      // Board invariants: no system with occupant and 0 tokens, none with tokens and no occupant.
      for (const id of SYSTEM_IDS) {
        const sys = g.systems[id]!;
        if (sys.occupant) expect(sys.tokens).toBeGreaterThan(0);
        else expect(sys.tokens).toBe(0);
      }
    }
  });

  it("same seed replays to the identical final state", () => {
    const a = playFullGame(555);
    const b = playFullGame(555);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("works at 2 and 5 players", () => {
    expect(playFullGame(200, 2).phase).toBe("over");
    expect(playFullGame(201, 5).phase).toBe("over");
  });
});
