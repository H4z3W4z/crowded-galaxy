// GENERATED FILE — do not edit. Source: data/*.yaml. Regenerate with `pnpm gen`.

import type { PlanetType } from "../types.js";

export interface SpeciesDef {
  id: string; name: string; population: number; habitat: PlanetType;
  active: string; remnant: string;
}
export interface TraitDef { id: string; name: string; population: number; ability: string }

export const SPECIES: Record<string, SpeciesDef> = {
  "thalassi_compact": {
    "id": "thalassi_compact",
    "name": "Thalassi Compact",
    "population": 6,
    "habitat": "ocean",
    "active": "Ocean systems cost 1 fewer population to conquer, minimum 1.",
    "remnant": "Score +1 Influence if your Remnants control at least two Ocean systems."
  },
  "pelagic_oracles": {
    "id": "pelagic_oracles",
    "name": "Pelagic Oracles",
    "population": 5,
    "habitat": "ocean",
    "active": "Once per turn per opponent, replace a lone active enemy population token adjacent to your active empire with one of your tokens from the supply. The replaced token is removed from the game.",
    "remnant": "Score +1 Influence if your Remnants are adjacent to any active opponent empire."
  },
  "heliox_aerostats": {
    "id": "heliox_aerostats",
    "name": "Heliox Aerostats",
    "population": 4,
    "habitat": "gas_giant",
    "active": "You may conquer any Gas Giant system on the map, whether or not it is adjacent to your empire. Pay the normal cost.",
    "remnant": "Remnant tokens in Gas Giant systems count as two population when calculating conquest cost against them."
  },
  "jovian_reavers": {
    "id": "jovian_reavers",
    "name": "Jovian Reavers",
    "population": 7,
    "habitat": "gas_giant",
    "active": "At the start of your conquest phase, take 4 bonus population tokens from the supply. They may be used for conquests but must be returned to the supply before redeployment.",
    "remnant": "Score +1 Influence if your Remnants control at least two Gas Giant systems."
  },
  "ferrum_continuum": {
    "id": "ferrum_continuum",
    "name": "Ferrum Continuum",
    "population": 5,
    "habitat": "barren",
    "active": "Every Barren system you control has +1 defense.",
    "remnant": "Barren systems containing your Remnants retain the +1 defense."
  },
  "ossian_prospectors": {
    "id": "ossian_prospectors",
    "name": "Ossian Prospectors",
    "population": 7,
    "habitat": "barren",
    "active": "Score +1 Influence for every two Barren systems your active empire controls.",
    "remnant": "Score +1 Influence if your Remnants control two or more Barren systems."
  },
  "cryari_revenants": {
    "id": "cryari_revenants",
    "name": "Cryari Revenants",
    "population": 8,
    "habitat": "ice",
    "active": "None. Raw numbers — the largest population value in the game.",
    "remnant": "When this civilization Collapses, keep ALL of its population on the map instead of reducing to one token per system. On each of your turns, the Remnant may conquer one adjacent system, paying normal costs from its on-map population."
  },
  "vitrifrost_collective": {
    "id": "vitrifrost_collective",
    "name": "Vitrifrost Collective",
    "population": 5,
    "habitat": "ice",
    "active": "Your active tokens are never lost as casualties. When one of your systems is conquered, redeploy every token instead of removing one.",
    "remnant": "Ice systems containing your Remnants have +1 defense."
  },
  "kharax_brood": {
    "id": "kharax_brood",
    "name": "Kharax Brood",
    "population": 5,
    "habitat": "volcanic",
    "active": "At the end of your conquest phase, add 1 population token from the supply for every two non-empty systems you conquered this turn.",
    "remnant": "When a Volcanic system containing your Remnants is conquered, the attacker removes one participating population token after the conquest."
  },
  "magmaforged": {
    "id": "magmaforged",
    "name": "Magmaforged",
    "population": 6,
    "habitat": "volcanic",
    "active": "Ignore all Hazard defense modifiers.",
    "remnant": "Remnants in Hazard systems have +1 defense."
  },
  "verdant_mycelium": {
    "id": "verdant_mycelium",
    "name": "Verdant Mycelium",
    "population": 3,
    "habitat": "terran",
    "active": "On a turn you conquered at least one system, add one population token from the supply to a Terran system you control at the end of redeployment.",
    "remnant": "Score +1 Influence if your Remnants control two adjacent Terran systems."
  },
  "concord_of_many": {
    "id": "concord_of_many",
    "name": "Concord of Many",
    "population": 7,
    "habitat": "terran",
    "active": "Your active empire may expand through your own Remnant systems as if they were active systems, without removing them.",
    "remnant": "Your active empire may use your Remnant systems as conquest origins."
  }
} as const;
export const TRAITS: Record<string, TraitDef> = {
  "adaptive": {
    "id": "adaptive",
    "name": "Adaptive",
    "population": 2,
    "ability": "At the start of each Expand turn, choose a second favored habitat for that turn. No cap on the bonus Influence gained from it."
  },
  "aggressive": {
    "id": "aggressive",
    "name": "Aggressive",
    "population": 4,
    "ability": "All conquests cost 1 fewer population, minimum 1."
  },
  "catalytic": {
    "id": "catalytic",
    "name": "Catalytic",
    "population": 4,
    "ability": "Score +2 bonus Influence at the end of each of your turns while this civilization is active."
  },
  "ancient": {
    "id": "ancient",
    "name": "Ancient",
    "population": 4,
    "ability": "Relic systems you control score double — +1 Influence each on top of the Relic's normal value."
  },
  "berserk": {
    "id": "berserk",
    "name": "Berserk",
    "population": 5,
    "ability": "Roll the reinforcement die BEFORE each conquest and apply the result as a discount to that conquest's cost, minimum 1."
  },
  "colonizing": {
    "id": "colonizing",
    "name": "Colonizing",
    "population": 5,
    "ability": "Empty systems cost 1 fewer population to conquer, minimum 1."
  },
  "defensive": {
    "id": "defensive",
    "name": "Defensive",
    "population": 5,
    "ability": "Every system your active civilization controls has +1 defense."
  },
  "diplomatic": {
    "id": "diplomatic",
    "name": "Diplomatic",
    "population": 5,
    "ability": "At the end of your turn, name one opponent. That opponent's active civilization cannot attack your active civilization until your next turn. Remnants are not protected."
  },
  "echoing": {
    "id": "echoing",
    "name": "Echoing",
    "population": 5,
    "ability": "When this civilization Collapses, your previous Remnant Empire is not removed. You may have two Remnant Empires on the map at once, both scoring, until this civilization's Remnant is itself replaced."
  },
  "fortress_building": {
    "id": "fortress_building",
    "name": "Fortress-Building",
    "population": 3,
    "ability": "After redeploying, place one Starbase in an active system, maximum six. Each Starbase adds +1 defense and scores +1 Influence while your civilization is active."
  },
  "heroic": {
    "id": "heroic",
    "name": "Heroic",
    "population": 5,
    "ability": "After redeploying, place your two Bulwark markers in two active systems. Those systems cannot be conquered. Reposition the markers each turn."
  },
  "industrious": {
    "id": "industrious",
    "name": "Industrious",
    "population": 4,
    "ability": "Score +2 Influence if your active empire controls five or more systems."
  },
  "mercantile": {
    "id": "mercantile",
    "name": "Mercantile",
    "population": 2,
    "ability": "Score +1 Influence for each system your active civilization controls, doubling your base system scoring."
  },
  "nomadic": {
    "id": "nomadic",
    "name": "Nomadic",
    "population": 3,
    "ability": "Any of your conquests may enter through any Rim Gate, even while you control other systems."
  },
  "parasitic": {
    "id": "parasitic",
    "name": "Parasitic",
    "population": 4,
    "ability": "Score +1 Influence for each non-empty system you conquered this turn."
  },
  "quantum_drive": {
    "id": "quantum_drive",
    "name": "Quantum Drive",
    "population": 3,
    "ability": "Any conquest may target any system on the map that shares a planet type with a system you control, regardless of adjacency."
  },
  "stealth": {
    "id": "stealth",
    "name": "Stealth",
    "population": 4,
    "ability": "Ignore all Starbase and Hazard defense modifiers."
  },
  "twilight": {
    "id": "twilight",
    "name": "Twilight",
    "population": 4,
    "ability": "You may Collapse at the end of a normal Expand turn instead of spending a full turn on it."
  },
  "wealthy": {
    "id": "wealthy",
    "name": "Wealthy",
    "population": 4,
    "ability": "Score +7 bonus Influence at the end of your launch turn. One use."
  },
  "wormhole_savvy": {
    "id": "wormhole_savvy",
    "name": "Wormhole-Savvy",
    "population": 4,
    "ability": "All conquests made through a wormhole cost 1 fewer population, minimum 1. During redeployment, population may move freely through wormholes between your active systems."
  }
} as const;
export const SPECIES_IDS: string[] = ["thalassi_compact","pelagic_oracles","heliox_aerostats","jovian_reavers","ferrum_continuum","ossian_prospectors","cryari_revenants","vitrifrost_collective","kharax_brood","magmaforged","verdant_mycelium","concord_of_many"];
export const TRAIT_IDS: string[] = ["adaptive","aggressive","catalytic","ancient","berserk","colonizing","defensive","diplomatic","echoing","fortress_building","heroic","industrious","mercantile","nomadic","parasitic","quantum_drive","stealth","twilight","wealthy","wormhole_savvy"];
