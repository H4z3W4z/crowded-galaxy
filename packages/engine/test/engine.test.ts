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
    startingInfluence: 0, // exact-value assertions below assume an empty starting bank
    seed,
    seats: Array.from({ length: seats }, (_, i) => ({ name: `P${i + 1}`, ai: true })),
  };
}

// Topology-agnostic helpers: derive systems from the map so these tests survive
// any map change (e.g. the ring -> spiral redesign).
const RIM = SYSTEM_IDS.find((id) => SYSTEMS[id]!.rimGate && !SYSTEMS[id]!.hazard)!;
const OCEAN_RIM = SYSTEM_IDS.find((id) => SYSTEMS[id]!.rimGate && SYSTEMS[id]!.planets.includes("ocean"))!;

function cheapest(g: GameState, player = 0): { target: string; cost: number } {
  return legalTargets(g, player).slice().sort((a, b) => a.cost - b.cost)[0]!;
}
/** Plain conquest cost (no attacker discounts): base 2 + neutrals + hazard. */
function plainCost(g: GameState, id: string): number {
  return 2 + g.systems[id]!.neutrals + (SYSTEMS[id]!.hazard ? 1 : 0);
}

function playFullGame(seed: number, seats = 3): GameState {
  let g = createGame(config(seed, seats));
  let guard = 0;
  while (g.phase !== "over") {
    g = apply(g, aiNextAction(g));
    if (++guard > 5000) throw new Error("game did not terminate");
  }
  return g;
}

describe("setup", () => {
  it("seeds neutral defenders per the map", () => {
    const g = createGame(config(1));
    const total = SYSTEM_IDS.reduce((s, id) => s + g.systems[id]!.neutrals, 0);
    const authored = SYSTEM_IDS.reduce((s, id) => s + SYSTEMS[id]!.neutrals, 0);
    expect(total).toBe(authored);
    expect(g.systems["BS"]!.neutrals).toBe(2); // the contested core
    expect(g.systems[RIM]!.neutrals).toBe(0); // frontier rim gates are undefended
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
    const expected =
      SPECIES[slot.species]!.population + TRAITS[slot.trait]!.population + (slot.species === "jovian_reavers" ? 4 : 0);
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    expect(g.players[0]!.active).not.toBeNull();
    expect(g.players[0]!.active!.hand).toBe(expected);
    expect(g.phase).toBe("conquer");
    expect(g.market).toHaveLength(6);
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
    expect(targets.length).toBeGreaterThan(0);
    for (const t of targets) expect(SYSTEMS[t]!.rimGate).toBe(true);
  });

  it("an empty rim gate costs 2 for a plain civilization", () => {
    let g = createGame(config(6));
    g.market[0] = { species: "ossian_prospectors", trait: "industrious", influence: 0 };
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    const costs = Object.fromEntries(legalTargets(g, 0).map((t) => [t.target, t.cost]));
    expect(costs[RIM]).toBe(2);
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
    let clearedANeutral = false;
    for (let step = 0; step < 4; step++) {
      const opts = legalTargets(g, 0).slice().sort((a, b) => a.cost - b.cost);
      // Prefer a neutral-bearing target so we exercise neutral clearing.
      const pick = opts.find((o) => g.systems[o.target]!.neutrals > 0) ?? opts[0];
      if (!pick || pick.cost > g.players[0]!.active!.hand) break;
      const hadNeutrals = g.systems[pick.target]!.neutrals > 0;
      expect(pick.cost).toBe(plainCost(g, pick.target));
      g = apply(g, { type: "conquer", target: pick.target });
      expect(g.systems[pick.target]!.occupant).toEqual({ player: 0, kind: "active", remnantIdx: -1 });
      expect(g.systems[pick.target]!.tokens).toBe(pick.cost);
      expect(g.systems[pick.target]!.neutrals).toBe(0);
      if (hadNeutrals) clearedANeutral = true;
    }
    expect(clearedANeutral).toBe(true);
  });

  it("aggressive discounts every conquest", () => {
    const g = launchAt(9, "ossian_prospectors", "aggressive");
    const costs = Object.fromEntries(legalTargets(g, 0).map((t) => [t.target, t.cost]));
    expect(costs[RIM]).toBe(1);
  });

  it("thalassi discount applies to all ocean systems, min 1", () => {
    const g = launchAt(10, "thalassi_compact", "industrious");
    const costs = Object.fromEntries(legalTargets(g, 0).map((t) => [t.target, t.cost]));
    expect(costs[OCEAN_RIM]).toBe(1); // empty ocean rim gate: 2 - 1
  });

  it("defender loses one token permanently, survivors redeploy to their smallest system", () => {
    let g = createGame(config(11, 2));
    g.market[0] = { species: "ossian_prospectors", trait: "industrious", influence: 0 };
    g.market[1] = { species: "magmaforged", trait: "catalytic", influence: 0 };
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    g = apply(g, { type: "conquer", target: RIM });
    const m = cheapest(g, 0).target; // P1's second system, adjacent to RIM
    g = apply(g, { type: "conquer", target: m });
    g = apply(g, { type: "endTurn" });
    g = apply(g, { type: "chooseCivilization", slot: 0 }); // P2
    const rimTokens = g.systems[RIM]!.tokens;
    const mBefore = g.systems[m]!.tokens;
    const cost = 2 + rimTokens; // magmaforged vs non-hazard RIM, no other modifiers
    g = apply(g, { type: "conquer", target: RIM });
    expect(g.systems[RIM]!.occupant!.player).toBe(1);
    expect(g.systems[RIM]!.tokens).toBe(cost);
    expect(g.systems[m]!.tokens).toBe(mBefore + rimTokens - 1); // survivor redeployed to P1's only other system
  });

  it("bulwarked systems cannot be conquered", () => {
    let g = createGame(config(12, 2));
    g.market[0] = { species: "ossian_prospectors", trait: "heroic", influence: 0 };
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    g = apply(g, { type: "conquer", target: RIM });
    g = apply(g, { type: "endConquests" });
    g = apply(g, { type: "redeploy", dist: { [RIM]: g.players[0]!.active!.hand + 2 } });
    g = apply(g, { type: "moveBulwarks", systems: [RIM] });
    g = apply(g, { type: "endTurn" });
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    expect(() => apply(g, { type: "conquer", target: RIM })).toThrow(/Bulwark/);
  });

  it("final conquest: only when short 1-3, die decides, conquests end either way", () => {
    let g = createGame(config(13));
    g.market[0] = { species: "ossian_prospectors", trait: "industrious", influence: 0 };
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    g.players[0]!.active!.hand = 1; // RIM costs 2 -> shortfall 1 -> legal gamble
    expect(() => apply(g, { type: "conquer", target: RIM })).toThrow(/costs 2/);
    g = apply(g, { type: "finalConquest", target: RIM });
    expect(g.phase).toBe("redeploy");
    const won = g.systems[RIM]!.occupant?.player === 0;
    if (won) expect(g.systems[RIM]!.tokens).toBe(1);
    else expect(g.players[0]!.active!.hand).toBe(1);
  });
});

describe("collapse and remnants", () => {
  it("collapse leaves one token per system, flips to remnant, scores it", () => {
    let g = createGame(config(14, 2));
    g.market[0] = { species: "ossian_prospectors", trait: "industrious", influence: 0 };
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    g = apply(g, { type: "conquer", target: RIM });
    const m = cheapest(g, 0).target;
    g = apply(g, { type: "conquer", target: m });
    g = apply(g, { type: "endTurn" });
    g = apply(g, { type: "chooseCivilization", slot: 0 }); // P2 launches, no conquest
    g = apply(g, { type: "endTurn" });
    const infBefore = g.players[0]!.influence;
    g = apply(g, { type: "collapse" });
    expect(g.players[0]!.active).toBeNull();
    expect(g.players[0]!.remnants).toHaveLength(1);
    expect(g.systems[RIM]!.occupant!.kind).toBe("remnant");
    expect(g.systems[RIM]!.tokens).toBe(1);
    expect(g.systems[m]!.tokens).toBe(1);
    expect(g.players[0]!.influence).toBe(infBefore + 2); // 2 remnant systems
  });

  it("cryari remnant keeps all tokens on collapse", () => {
    let g = createGame(config(15, 2));
    g.market[0] = { species: "cryari_revenants", trait: "industrious", influence: 0 };
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    g = apply(g, { type: "conquer", target: RIM });
    g = apply(g, { type: "endConquests" });
    const hand = g.players[0]!.active!.hand;
    g = apply(g, { type: "redeploy", dist: { [RIM]: hand + 2 } });
    g = apply(g, { type: "endTurn" });
    g = apply(g, { type: "chooseCivilization", slot: 0 }); // P2 launches, no conquest
    g = apply(g, { type: "endTurn" });
    const tokens = g.systems[RIM]!.tokens;
    g = apply(g, { type: "collapse" });
    expect(g.systems[RIM]!.tokens).toBe(tokens); // all kept
  });

  it("remnant defeated: all tokens removed", () => {
    let g = createGame(config(16, 2));
    g.market[0] = { species: "ossian_prospectors", trait: "industrious", influence: 0 };
    g.market[1] = { species: "magmaforged", trait: "catalytic", influence: 0 };
    g = apply(g, { type: "chooseCivilization", slot: 0 });
    g = apply(g, { type: "conquer", target: RIM });
    g = apply(g, { type: "endTurn" });
    g = apply(g, { type: "chooseCivilization", slot: 0 }); // P2 takes any rim gate to burn its turn
    const p2rim = SYSTEM_IDS.find((id) => SYSTEMS[id]!.rimGate && id !== RIM && !SYSTEMS[id]!.hazard)!;
    g = apply(g, { type: "conquer", target: p2rim });
    g = apply(g, { type: "endTurn" });
    g = apply(g, { type: "collapse" }); // P1 remnant on RIM
    g = apply(g, { type: "recall", take: {} });
    const cost = 2 + 1; // RIM: base 2 + 1 remnant token
    const before = g.players[1]!.active!.hand;
    // P2 needs to reach RIM; RIM is a rim gate so a launched/relaunched civ can always enter it.
    // P2 already holds p2rim; recall to nothing and re-enter RIM as a rim gate.
    g = apply(g, { type: "conquer", target: RIM });
    expect(g.systems[RIM]!.occupant!.player).toBe(1);
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
      const total = g.players.reduce((s, p) => s + p.influence, 0);
      expect(total).toBeGreaterThan(0);
      for (const p of g.players) expect(p.influence).toBeGreaterThanOrEqual(0);
      for (const id of SYSTEM_IDS) {
        const sys = g.systems[id]!;
        if (sys.occupant) expect(sys.tokens).toBeGreaterThan(0);
        else expect(sys.tokens).toBe(0);
      }
    }
  });

  it("same seed replays to the identical final state", () => {
    expect(JSON.stringify(playFullGame(555))).toBe(JSON.stringify(playFullGame(555)));
  });

  it("works at 2 and 5 players", () => {
    expect(playFullGame(200, 2).phase).toBe("over");
    expect(playFullGame(201, 5).phase).toBe("over");
  });
});
