export * from "./types.js";
export { createGame, DEFAULT_CONFIG } from "./setup.js";
export { apply } from "./reducer.js";
export {
  checkConquest,
  checkRemnantConquest,
  conversionTargets,
  favoredHabitats,
  hasPlanet,
  isWormholeLink,
  legalTargets,
  neighbors,
  systemsOf,
} from "./rules.js";
export { scoreExpandTurn, scoreRemnants, totalOf } from "./scoring.js";
export { aiNextAction } from "./ai.js";
export { SPECIES, TRAITS, SPECIES_IDS, TRAIT_IDS } from "./gen/cards.js";
export type { SpeciesDef, TraitDef } from "./gen/cards.js";
// The galaxy is generated per game (state.map) — there is no global map.
export { generateMap, DEFAULT_MAPGEN } from "./mapgen.js";
export type { MapGenOptions } from "./mapgen.js";
