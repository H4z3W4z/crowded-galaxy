import { SPECIES_IDS, TRAIT_IDS } from "./gen/cards.js";
import { SYSTEMS, SYSTEM_IDS } from "./gen/map.js";
import { seedState, shuffle } from "./rng.js";
import type { GameConfig, GameState, MarketSlot, SystemState } from "./types.js";
import { RulesError } from "./types.js";

export const DEFAULT_CONFIG: Omit<GameConfig, "seats" | "seed"> = {
  rounds: 12,
  marketSize: 6,
  dieFaces: [0, 0, 0, 1, 2, 3],
  neutralScale: 1,
};

export function createGame(config: GameConfig): GameState {
  if (config.seats.length < 2 || config.seats.length > 5) {
    throw new RulesError("2-5 players required");
  }
  let rng = seedState(config.seed);
  let speciesDeck: string[];
  let traitDeck: string[];
  [rng, speciesDeck] = shuffle(rng, SPECIES_IDS);
  [rng, traitDeck] = shuffle(rng, TRAIT_IDS);

  const market: MarketSlot[] = [];
  for (let i = 0; i < config.marketSize; i++) {
    market.push({ species: speciesDeck.pop()!, trait: traitDeck.pop()!, influence: 0 });
  }

  const systems: Record<string, SystemState> = {};
  for (const id of SYSTEM_IDS) {
    systems[id] = {
      occupant: null,
      tokens: 0,
      neutrals: Math.round(SYSTEMS[id]!.neutrals * config.neutralScale),
      starbases: 0,
      bulwark: false,
    };
  }

  return {
    config,
    round: 1,
    current: 0,
    phase: "start",
    market,
    speciesDeck,
    traitDeck,
    speciesDiscard: [],
    traitDiscard: [],
    players: config.seats.map(() => ({
      influence: 0,
      active: null,
      remnants: [],
      diplomaticTarget: null,
    })),
    systems,
    rngState: rng,
    turn: freshTurnFlags(),
    log: [],
    winners: null,
  };
}

export function freshTurnFlags(): GameState["turn"] {
  return {
    conquests: [],
    finalConquestUsed: false,
    conversionsUsed: [],
    adaptiveHabitat: null,
    remnantConquerUsed: false,
    jovianBonus: 0,
    starbasePlaced: false,
    verdantPlaced: false,
    bulwarksMoved: false,
    pactNamed: false,
    launchTurn: false,
    lastDieRoll: null,
  };
}
