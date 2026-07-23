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
export { SYSTEMS, LANES, WORMHOLES, SYSTEM_IDS } from "./gen/map.js";
export type { SystemDef } from "./gen/map.js";
