// Compiles data/*.yaml (canonical card + map data) into packages/engine/src/gen/*.ts
// Run from repo root: pnpm gen
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import YAML from "yaml";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "packages/engine/src/gen");
mkdirSync(outDir, { recursive: true });

const banner = "// GENERATED FILE — do not edit. Source: data/*.yaml. Regenerate with `pnpm gen`.\n";

const species = YAML.parse(readFileSync(join(root, "data/species.yaml"), "utf8")).species;
const traits = YAML.parse(readFileSync(join(root, "data/traits.yaml"), "utf8")).traits;
const map = YAML.parse(readFileSync(join(root, "data/map.yaml"), "utf8"));

const speciesOut = Object.fromEntries(
  species.map((s) => [s.id, {
    id: s.id, name: s.name, population: s.population, habitat: s.habitat,
    active: s.active.trim(), remnant: s.remnant.trim(),
  }]),
);
const traitsOut = Object.fromEntries(
  traits.map((t) => [t.id, { id: t.id, name: t.name, population: t.population, ability: t.ability.trim() }]),
);

writeFileSync(join(outDir, "cards.ts"), `${banner}
import type { PlanetType } from "../types.js";

export interface SpeciesDef {
  id: string; name: string; population: number; habitat: PlanetType;
  active: string; remnant: string;
}
export interface TraitDef { id: string; name: string; population: number; ability: string }

export const SPECIES: Record<string, SpeciesDef> = ${JSON.stringify(speciesOut, null, 2)} as const;
export const TRAITS: Record<string, TraitDef> = ${JSON.stringify(traitsOut, null, 2)} as const;
export const SPECIES_IDS: string[] = ${JSON.stringify(Object.keys(speciesOut))};
export const TRAIT_IDS: string[] = ${JSON.stringify(Object.keys(traitsOut))};
`);

const systemsOut = Object.fromEntries(
  map.systems.map((s) => {
    // Each system is a single planet. Expose it as `planet` and also as a
    // 1-element `planets` array so habitat/hasPlanet logic stays unchanged.
    const planet = s.planet ?? s.planets?.[0];
    return [s.code, {
      code: s.code, name: s.name, ring: s.ring, planet, planets: [planet],
      rimGate: !!s.rim_gate, hazard: !!s.hazard, relic: !!s.relic,
      neutrals: s.neutrals ?? 0, x: s.position.x, y: s.position.y,
    }];
  }),
);

writeFileSync(join(outDir, "map.ts"), `${banner}
import type { PlanetType } from "../types.js";

export interface SystemDef {
  code: string; name: string; ring: "outer" | "middle" | "inner" | "core";
  planet: PlanetType; planets: PlanetType[]; rimGate: boolean; hazard: boolean; relic: boolean;
  neutrals: number; x: number; y: number;
}

export const SYSTEMS: Record<string, SystemDef> = ${JSON.stringify(systemsOut, null, 2)} as const;
export const LANES: [string, string][] = ${JSON.stringify(map.hyperlanes)};
export const WORMHOLES: [string, string][] = ${JSON.stringify(map.wormholes)};
export const SYSTEM_IDS: string[] = ${JSON.stringify(map.systems.map((s) => s.code))};
`);

console.log(`generated cards.ts (${species.length} species, ${traits.length} traits) and map.ts (${map.systems.length} systems)`);
