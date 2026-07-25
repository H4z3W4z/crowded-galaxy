// Procedural galaxy generation. Every game gets a fresh galaxy derived from its
// seed: the spiral skeleton is kept (it is tuned and balanced), while the
// terrain, hazards, relics, wormholes, names and jitter all vary — so habitat
// strategy, chokepoints and shortcut geography differ every game.
import { nextInt, shuffle } from "./rng.js";
import type { GameMap, PlanetType, SystemDef, SystemId } from "./types.js";

const PLANET_TYPES: PlanetType[] = ["terran", "ocean", "barren", "gas_giant", "ice", "volcanic"];

// Names are drawn from a pool, so galaxies read differently game to game.
const NAME_POOL = [
  "Blue Silence", "Crown Nexus", "Radiant Maw", "Cryos", "Solace", "Orphean Vault",
  "Halcyon Deep", "Red Choir", "Silica Verge", "Cinderwake", "Pelagos", "Aurora Gate",
  "Tethys Arc", "Forgeheart", "Nacre Belt", "Viridian Gate", "Greenwake", "Jove's Lantern",
  "Pale Anchor", "Emberfall", "Frostmere", "Ashen Bloom", "Cloudspire", "Kestrel Dust",
  "Bellows", "Sable Rift", "Altair Reach", "Zephyr Crown", "Ossuary", "Meridian",
  "Wraithfall", "Lethe Bank", "Gossamer", "Iron Vigil", "Saltmarch", "Hollow Star",
  "Verity", "Cold Harbour", "Ninefold", "Ashglass", "Tidewrack", "Cantor",
  "Bright Fathom", "Dust Requiem", "Umbral Key", "Starveil", "Quiet Anvil", "Mourn",
  "Lantern Deep", "Thistledown", "Pyre Gate", "Vesper Line",
];

function codeFor(name: string, used: Set<string>): string {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, "");
  const words = name.toUpperCase().split(/[^A-Z]+/).filter(Boolean);
  const candidates: string[] = [];
  if (words.length >= 2) candidates.push(words[0]![0]! + words[1]![0]!);
  for (let i = 0; i < letters.length - 1; i++) candidates.push(letters[i]! + letters[i + 1]!);
  for (let i = 0; i < letters.length; i++) {
    for (let j = i + 1; j < letters.length; j++) candidates.push(letters[i]! + letters[j]!);
  }
  for (const c of candidates) if (!used.has(c)) return c;
  // Exhausted: fall back to a numbered code.
  for (let n = 1; n < 100; n++) {
    const c = letters[0]! + String(n % 10);
    if (!used.has(c)) return c;
  }
  throw new Error("no unique system code available");
}

export interface MapGenOptions {
  arms: number; // default 5 — one per core-ring node
  armLength: number; // default 5
}

export const DEFAULT_MAPGEN: MapGenOptions = { arms: 5, armLength: 5 };

const CX = 500, CY = 500;
const CORE_RING_R = 122;
const ARM_R0 = 210, ARM_STEP = 76, ARM_CURL = 10;
const rad = (d: number) => (d * Math.PI) / 180;

/** Build a galaxy from the seeded RNG. Returns the map and the advanced rng state. */
export function generateMap(rngState: number, opts: MapGenOptions = DEFAULT_MAPGEN): [number, GameMap] {
  let rng = rngState;
  const armCount = opts.arms;
  const armLen = opts.armLength;
  const total = 1 + armCount + armCount * armLen;

  let names: string[];
  [rng, names] = shuffle(rng, NAME_POOL);
  names = names.slice(0, total);

  const used = new Set<string>();
  const systems: Record<SystemId, SystemDef> = {};
  const systemIds: SystemId[] = [];
  const lanes: [SystemId, SystemId][] = [];
  let p = 0;

  const jitter = (amount: number): [number, number] => {
    let a: number, b: number;
    [rng, a] = nextInt(rng, amount * 2 + 1);
    [rng, b] = nextInt(rng, amount * 2 + 1);
    return [a - amount, b - amount];
  };

  // Terrain is assigned after the graph exists (see growTerrain) so it can form
  // contiguous regions rather than confetti.
  const add = (name: string, ring: SystemDef["ring"], x: number, y: number): SystemId => {
    const planet: PlanetType = "terran"; // placeholder, overwritten below
    const code = codeFor(name, used);
    used.add(code);
    systems[code] = {
      code, name, ring, planet, planets: [planet],
      rimGate: false, hazard: false, relic: false, neutrals: 0, x, y,
    };
    systemIds.push(code);
    return code;
  };

  // --- Core: centre + a ring of `armCount` nodes ---
  const centre = add(names[p]!, "core", CX, CY);
  p += 1;
  const coreRing: SystemId[] = [];
  const baseAngles: number[] = [];
  for (let i = 0; i < armCount; i++) {
    const angle = (360 / armCount) * i + 18;
    baseAngles.push(angle);
    const [jx, jy] = jitter(6);
    const id = add(
      names[p]!, "core",
      Math.round(CX + Math.cos(rad(angle)) * CORE_RING_R) + jx,
      Math.round(CY + Math.sin(rad(angle)) * CORE_RING_R) + jy,
    );
    p += 1;
    coreRing.push(id);
    lanes.push([centre, id]);
  }
  for (let i = 0; i < coreRing.length; i++) lanes.push([coreRing[i]!, coreRing[(i + 1) % coreRing.length]!]);

  // --- Arms: one per core node, spiralling outward ---
  const armTips: SystemId[] = [];
  const armInner: SystemId[] = [];
  const armAll: SystemId[][] = [];
  for (let a = 0; a < armCount; a++) {
    let prev = coreRing[a]!;
    const chain: SystemId[] = [];
    for (let j = 0; j < armLen; j++) {
      const angle = baseAngles[a]! + ARM_CURL * (j + 1);
      const r = ARM_R0 + j * ARM_STEP;
      const [jx, jy] = jitter(9);
      const ring: SystemDef["ring"] = j <= 1 ? "inner" : j === 2 ? "middle" : "outer";
      const id = add(
        names[p]!, ring,
        Math.round(CX + Math.cos(rad(angle)) * r) + jx,
        Math.round(CY + Math.sin(rad(angle)) * r) + jy,
      );
      p += 1;
      lanes.push([prev, id]);
      prev = id;
      chain.push(id);
      if (j === 0) armInner.push(id);
      if (j === armLen - 1) armTips.push(id);
    }
    armAll.push(chain);
  }

  // Second ring: pentagon joining the inner-arm systems around the core.
  for (let i = 0; i < armInner.length; i++) lanes.push([armInner[i]!, armInner[(i + 1) % armInner.length]!]);

  // --- Terrain: contiguous regions, not confetti ---
  // Uniform shuffling produced same-terrain adjacency BELOW the random baseline,
  // so habitat could never be territory: no ocean sector to take and hold, and
  // nothing for two players who want the same terrain to collide over.
  {
    const laneAdj: Record<SystemId, SystemId[]> = {};
    for (const id of systemIds) laneAdj[id] = [];
    for (const [a, b] of lanes) {
      laneAdj[a]!.push(b);
      laneAdj[b]!.push(a);
    }
    const perType = Math.floor(total / PLANET_TYPES.length);
    let quotas: { type: PlanetType; left: number }[];
    [rng, quotas] = shuffle(rng, PLANET_TYPES.map((type) => ({ type, left: perType })));
    for (let i = 0; i < total - perType * PLANET_TYPES.length; i++) quotas[i % quotas.length]!.left += 1;

    const claimed: Record<SystemId, PlanetType> = {};
    const fronts: SystemId[][] = [];
    let seedPool: SystemId[];
    [rng, seedPool] = shuffle(rng, systemIds);
    // Two seeds per terrain, not one. A single seed grew each type into one
    // ~5-world blob, so an entire spiral arm came out the same colour and the
    // galaxy stopped looking natural. Two smaller pockets still give habitat
    // something to cluster around without painting the map in stripes.
    const SEEDS_PER_TYPE = 2;
    for (const q of quotas) {
      const front: SystemId[] = [];
      for (let s = 0; s < SEEDS_PER_TYPE && q.left > 0; s++) {
        const seed = seedPool.find((id) => !(id in claimed));
        if (!seed) break;
        claimed[seed] = q.type;
        q.left -= 1;
        front.push(seed);
      }
      fronts.push(front);
    }
    // Grow every region a world at a time, so regions stay comparable in size.
    for (let growing = true; growing; ) {
      growing = false;
      for (let i = 0; i < quotas.length; i++) {
        const q = quotas[i]!;
        if (q.left <= 0) continue;
        const edge: SystemId[] = [];
        for (const id of fronts[i]!) for (const n of laneAdj[id]!) if (!(n in claimed)) edge.push(n);
        const pool = edge.length > 0 ? edge : systemIds.filter((id) => !(id in claimed));
        if (pool.length === 0) {
          q.left = 0;
          continue;
        }
        let pick: number;
        [rng, pick] = nextInt(rng, pool.length);
        const chosen = pool[pick]!;
        claimed[chosen] = q.type;
        q.left -= 1;
        fronts[i]!.push(chosen);
        growing = true;
      }
    }
    for (const id of systemIds) {
      const type = claimed[id]!;
      systems[id]!.planet = type;
      systems[id]!.planets = [type];
    }
  }

  // --- Rim Gates: the outer two of every arm are the frontier ---
  for (const chain of armAll) {
    for (const id of chain.slice(-2)) {
      systems[id]!.rimGate = true;
      systems[id]!.ring = "outer";
    }
  }

  // --- Neutral defenders: core defended, frontier open ---
  systems[centre]!.neutrals = 2;
  for (const id of coreRing) systems[id]!.neutrals = 2;
  // One core node is left lightly held, so there is always a soft way in.
  let softIdx: number;
  [rng, softIdx] = nextInt(rng, coreRing.length);
  systems[coreRing[softIdx]!]!.neutrals = 1;
  for (const chain of armAll) {
    for (const id of chain) if (!systems[id]!.rimGate) systems[id]!.neutrals = 1;
  }

  // --- Relics: the reason to fight inward. Centre always, plus core nodes,
  //     plus one out in an arm so there is a mid-game objective too. ---
  systems[centre]!.relic = true;
  let relicCores: SystemId[];
  [rng, relicCores] = shuffle(rng, coreRing);
  for (const id of relicCores.slice(0, Math.max(1, coreRing.length - 2))) systems[id]!.relic = true;
  const midCandidates = armAll.flatMap((c) => c.slice(1, 3));
  let midPick: SystemId[];
  [rng, midPick] = shuffle(rng, midCandidates);
  if (midPick[0]) systems[midPick[0]]!.relic = true;

  // --- Hazards: one in the core, the rest scattered through mid/outer arms ---
  let hazCore: SystemId[];
  [rng, hazCore] = shuffle(rng, coreRing);
  systems[hazCore[0]!]!.hazard = true;
  // Draw the scattered hazards from the outer frontier only. Mixing in the
  // single middle system of each arm — an unavoidable chokepoint on the one
  // path inward — swung scoring by 16.7 points depending purely on the shuffle.
  const hazCandidates = armAll.flatMap((c) => c.slice(3));
  let hazPick: SystemId[];
  [rng, hazPick] = shuffle(rng, hazCandidates);
  for (const id of hazPick.slice(0, armCount - 1)) systems[id]!.hazard = true;

  // --- Wormholes: bridge distant arms, never adjacent arms ---
  const wormholes: [SystemId, SystemId][] = [];
  const laneKey = new Set(lanes.map(([a, b]) => [a, b].sort().join("|")));
  const gap = Math.max(2, Math.floor(armCount / 2));
  // One wormhole runs from the frontier into the contested centre — a back door
  // to the relic core is worth fighting over; a link between two frontier
  // cul-de-sacs is not. The rest bridge distant arm tips.
  let coreEnd: SystemId[];
  [rng, coreEnd] = shuffle(rng, coreRing);
  const pairs: [SystemId, SystemId][] = [[armTips[0]!, coreEnd[0]!]];
  for (let i = 1; i < Math.min(3, armCount); i++) pairs.push([armTips[i]!, armTips[(i + gap) % armCount]!]);
  for (const [from, to] of pairs) {
    const key = [from, to].sort().join("|");
    if (from !== to && !laneKey.has(key) && !wormholes.some((w) => [w[0], w[1]].sort().join("|") === key)) {
      wormholes.push([from, to]);
      laneKey.add(key);
    }
  }

  // --- Precomputed adjacency (JSON-safe: plain arrays, not Sets) ---
  const adjacency: Record<SystemId, SystemId[]> = {};
  const wormholeAdj: Record<SystemId, SystemId[]> = {};
  for (const id of systemIds) {
    adjacency[id] = [];
    wormholeAdj[id] = [];
  }
  const link = (a: SystemId, b: SystemId) => {
    if (!adjacency[a]!.includes(b)) adjacency[a]!.push(b);
    if (!adjacency[b]!.includes(a)) adjacency[b]!.push(a);
  };
  for (const [a, b] of lanes) link(a, b);
  for (const [a, b] of wormholes) {
    link(a, b);
    wormholeAdj[a]!.push(b);
    wormholeAdj[b]!.push(a);
  }

  return [rng, { systems, systemIds, lanes, wormholes, adjacency, wormholeAdj }];
}
