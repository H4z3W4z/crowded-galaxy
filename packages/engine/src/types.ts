export type PlanetType = "terran" | "ocean" | "barren" | "gas_giant" | "ice" | "volcanic";
export type PlayerId = number; // seat index, 0-based
export type SystemId = string; // two-letter system code

export interface PlayerSeat {
  name: string;
  ai: boolean;
}

export interface GameConfig {
  seats: PlayerSeat[];
  rounds: number; // baseline 12 — a playtest hypothesis, keep configurable
  seed: number;
  marketSize: number; // 6
  dieFaces: number[]; // [0, 0, 0, 1, 2, 3]
  neutralScale: number; // 1 = seeding as authored in map.yaml, 0 = none
}

export interface MarketSlot {
  species: string;
  trait: string;
  influence: number; // skip-Influence accumulated on this combo
}

export interface ActiveCiv {
  species: string;
  trait: string;
  hand: number; // tokens held for conquest/redeploy
  turnsActive: number;
}

export interface RemnantEmpire {
  species: string;
}

export interface PlayerState {
  influence: number;
  active: ActiveCiv | null;
  /** newest first; length may reach 2 via Echoing */
  remnants: RemnantEmpire[];
  /** Diplomatic trait: the opponent this player named — that opponent may not attack this player's active civ until this player's next turn. */
  diplomaticTarget: PlayerId | null;
}

export interface Occupant {
  player: PlayerId;
  kind: "active" | "remnant";
  /** index into PlayerState.remnants when kind === "remnant" */
  remnantIdx: number;
}

export interface SystemState {
  occupant: Occupant | null;
  tokens: number; // occupant population (0 when unoccupied)
  neutrals: number; // neutral defender tokens
  starbases: number;
  bulwark: boolean; // Heroic marker: cannot be conquered
}

export type TurnPhase =
  | "start" // must choose civ / collapse / recall (or conquer if never launched)
  | "conquer"
  | "redeploy"
  | "post" // starbase / bulwarks / verdant growth / diplomatic naming / end turn
  | "over"; // game finished

export interface ConquestRecord {
  system: SystemId;
  wasNonEmpty: boolean;
}

export interface TurnFlags {
  conquests: ConquestRecord[];
  finalConquestUsed: boolean;
  conversionsUsed: PlayerId[]; // Pelagic Oracles: once per opponent per turn
  adaptiveHabitat: PlanetType | null;
  remnantConquerUsed: boolean; // Cryari Revenants
  jovianBonus: number; // bonus tokens currently loaned to the hand
  starbasePlaced: boolean;
  verdantPlaced: boolean;
  launchTurn: boolean;
  lastDieRoll: number | null;
}

export interface LogEntry {
  round: number;
  player: PlayerId;
  text: string;
}

export interface GameState {
  config: GameConfig;
  round: number; // 1-based
  current: PlayerId;
  phase: TurnPhase;
  market: MarketSlot[];
  speciesDeck: string[];
  traitDeck: string[];
  speciesDiscard: string[];
  traitDiscard: string[];
  players: PlayerState[];
  systems: Record<SystemId, SystemState>;
  rngState: number;
  turn: TurnFlags;
  log: LogEntry[];
  winners: PlayerId[] | null; // set when phase === "over"
}

export type Action =
  | { type: "chooseCivilization"; slot: number }
  | { type: "recall"; take: Record<SystemId, number> }
  | { type: "conquer"; target: SystemId }
  | { type: "finalConquest"; target: SystemId }
  | { type: "convertToken"; target: SystemId } // Pelagic Oracles
  | { type: "remnantConquer"; target: SystemId } // Cryari Revenants remnant
  | { type: "chooseAdaptiveHabitat"; habitat: PlanetType }
  | { type: "endConquests" }
  | { type: "redeploy"; dist: Record<SystemId, number> }
  | { type: "placeStarbase"; system: SystemId }
  | { type: "moveBulwarks"; systems: SystemId[] }
  | { type: "verdantGrow"; system: SystemId }
  | { type: "nameDiplomaticTarget"; player: PlayerId }
  | { type: "collapse" } // full-turn collapse from "start", or Twilight collapse from "post"
  | { type: "endTurn" };

export class RulesError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RulesError";
  }
}
