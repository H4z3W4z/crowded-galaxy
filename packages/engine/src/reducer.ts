// apply(state, action) -> new state. Throws RulesError on illegal actions.
// State is treated as immutable from the outside; internally we deep-clone once.

import { SPECIES, TRAITS } from "./gen/cards.js";
import { SYSTEMS, SYSTEM_IDS } from "./gen/map.js";
import { nextInt } from "./rng.js";
import {
  checkConquest,
  checkRemnantConquest,
  conversionTargets,
  hasPlanet,
  neighbors,
  systemsOf,
} from "./rules.js";
import { scoreExpandTurn, scoreRemnants, totalOf } from "./scoring.js";
import { freshTurnFlags } from "./setup.js";
import type { Action, GameState, PlayerId, SystemId } from "./types.js";
import { RulesError } from "./types.js";

export function apply(state: GameState, action: Action): GameState {
  if (state.phase === "over") throw new RulesError("game is over");
  const g: GameState = structuredClone(state);
  const player = g.current;
  const p = g.players[player]!;

  switch (action.type) {
    case "chooseCivilization": {
      requirePhase(g, "start");
      if (p.active) throw new RulesError("already leading a civilization");
      const slot = action.slot;
      if (slot < 0 || slot >= g.market.length) throw new RulesError("bad market slot");
      if (p.influence < slot) throw new RulesError(`skipping ${slot} combos costs ${slot} Influence`);
      p.influence -= slot;
      for (let i = 0; i < slot; i++) g.market[i]!.influence += 1;
      const combo = g.market.splice(slot, 1)[0]!;
      p.influence += combo.influence;
      refillMarket(g);
      p.active = {
        species: combo.species,
        trait: combo.trait,
        hand: SPECIES[combo.species]!.population + TRAITS[combo.trait]!.population,
        turnsActive: 0,
      };
      g.turn.launchTurn = true;
      log(g, `launched ${TRAITS[combo.trait]!.name} ${SPECIES[combo.species]!.name} (${p.active.hand} population)`);
      // Straight into the Expand turn; a fresh civ has nothing to recall.
      enterConquerPhase(g);
      return g;
    }

    case "collapse": {
      if (g.phase === "start") {
        collapseCiv(g, player, true);
        finishTurn(g);
        return g;
      }
      if (g.phase === "post") {
        if (p.active?.trait !== "twilight") throw new RulesError("only Twilight collapses at end of turn");
        scoreEndOfTurn(g, player);
        collapseCiv(g, player, false); // expand turn already scored — no second scoring
        finishTurn(g);
        return g;
      }
      throw new RulesError("collapse from turn start (or end of turn with Twilight)");
    }

    case "recall": {
      requirePhase(g, "start");
      if (!p.active) throw new RulesError("no active civilization — choose one");
      const own = new Set(systemsOf(g, player, "active"));
      for (const [id, n] of Object.entries(action.take)) {
        if (!own.has(id)) throw new RulesError(`${id} is not yours`);
        const sys = g.systems[id]!;
        if (!Number.isInteger(n) || n < 0 || n > sys.tokens) throw new RulesError(`bad recall from ${id}`);
        sys.tokens -= n;
        p.active.hand += n;
        if (sys.tokens === 0) {
          sys.occupant = null; // abandoned
          removeCivMarkers(g, id);
          log(g, `abandoned ${SYSTEMS[id]!.name}`);
        }
      }
      enterConquerPhase(g);
      return g;
    }

    case "chooseAdaptiveHabitat": {
      requirePhase(g, "conquer");
      if (p.active?.trait !== "adaptive") throw new RulesError("not Adaptive");
      g.turn.adaptiveHabitat = action.habitat;
      return g;
    }

    case "conquer": {
      requirePhase(g, "conquer");
      if (!p.active) throw new RulesError("no active civilization");
      if (g.turn.finalConquestUsed) throw new RulesError("conquests are over after the die roll");
      const check = checkConquest(g, player, action.target);
      if (!check.legal) throw new RulesError(check.reason!);
      let cost = check.cost;
      // Berserk: roll before every conquest, result discounts the cost.
      if (p.active.trait === "berserk") {
        const roll = rollDie(g);
        cost = Math.max(1, cost - roll);
        log(g, `Berserk roll: ${roll}`);
      }
      if (p.active.hand < cost) throw new RulesError(`costs ${cost}, hand has ${p.active.hand}`);
      resolveConquest(g, player, action.target, cost);
      return g;
    }

    case "finalConquest": {
      requirePhase(g, "conquer");
      if (!p.active) throw new RulesError("no active civilization");
      if (g.turn.finalConquestUsed) throw new RulesError("already used the reinforcement die");
      if (p.active.hand < 1) throw new RulesError("need at least one token");
      const check = checkConquest(g, player, action.target);
      if (!check.legal) throw new RulesError(check.reason!);
      let cost = check.cost;
      if (p.active.trait === "berserk") {
        const roll = rollDie(g);
        cost = Math.max(1, cost - roll);
        log(g, `Berserk roll: ${roll}`);
      }
      const shortfall = cost - p.active.hand;
      // Legality is judged on the deterministic cost; a Berserk roll may then swing the
      // shortfall either way. Affordable after the swing -> normal success. Hopeless -> auto-fail.
      const deterministicShort = check.cost - p.active.hand;
      if (deterministicShort > 3) throw new RulesError("short by more than 3");
      if (deterministicShort < 1 && p.active.trait !== "berserk") {
        throw new RulesError("you can afford this — conquer normally");
      }
      g.turn.finalConquestUsed = true;
      if (shortfall < 1) {
        log(g, `the Berserk roll covers the assault — ${SYSTEMS[action.target]!.name} falls`);
        resolveConquest(g, player, action.target, cost);
        endConquerPhase(g);
        return g;
      }
      if (shortfall > 3) {
        log(g, `the assault on ${SYSTEMS[action.target]!.name} was doomed from the start`);
        endConquerPhase(g);
        return g;
      }
      const roll = rollDie(g);
      g.turn.lastDieRoll = roll;
      if (p.active.hand + roll >= cost) {
        log(g, `reinforcement die: ${roll} — ${SYSTEMS[action.target]!.name} falls`);
        resolveConquest(g, player, action.target, p.active.hand);
      } else {
        log(g, `reinforcement die: ${roll} — the assault on ${SYSTEMS[action.target]!.name} fails`);
      }
      endConquerPhase(g);
      return g;
    }

    case "convertToken": {
      requirePhase(g, "conquer");
      const targets = conversionTargets(g, player);
      if (!targets.includes(action.target)) throw new RulesError("not a legal conversion target");
      const sys = g.systems[action.target]!;
      const victim = sys.occupant!.player;
      sys.occupant = { player, kind: "active", remnantIdx: -1 };
      sys.tokens = 1; // replaced from the supply; victim's token is removed from the game
      g.turn.conversionsUsed.push(victim);
      log(g, `Pelagic Oracles convert ${SYSTEMS[action.target]!.name} from ${g.config.seats[victim]!.name}`);
      return g;
    }

    case "remnantConquer": {
      if (g.phase !== "conquer" && g.phase !== "start") throw new RulesError("wrong phase");
      if (g.turn.remnantConquerUsed) throw new RulesError("Remnant already conquered this turn");
      const check = checkRemnantConquest(g, player, action.target);
      if (!check.legal) throw new RulesError(check.reason!);
      const idx = p.remnants.findIndex((r) => r.species === "cryari_revenants");
      // Pull cost from adjacent remnant stacks, largest first, leaving 1 behind.
      let needed = check.cost;
      const sources = SYSTEM_IDS.filter((id) => {
        const occ = g.systems[id]!.occupant;
        return occ?.player === player && occ.kind === "remnant" && occ.remnantIdx === idx && neighbors(id).has(action.target);
      }).sort((a, b) => g.systems[b]!.tokens - g.systems[a]!.tokens);
      const target = g.systems[action.target]!;
      clearDefender(g, action.target);
      target.occupant = { player, kind: "remnant", remnantIdx: idx };
      target.tokens = check.cost;
      for (const src of sources) {
        if (needed <= 0) break;
        const give = Math.min(needed, g.systems[src]!.tokens - 1);
        g.systems[src]!.tokens -= give;
        needed -= give;
      }
      g.turn.remnantConquerUsed = true;
      log(g, `the Cryari Revenants march on ${SYSTEMS[action.target]!.name}`);
      return g;
    }

    case "endConquests": {
      requirePhase(g, "conquer");
      endConquerPhase(g);
      return g;
    }

    case "redeploy": {
      requirePhase(g, "redeploy");
      if (!p.active) throw new RulesError("no active civilization");
      const own = systemsOf(g, player, "active");
      const onBoard = own.reduce((s, id) => s + g.systems[id]!.tokens, 0);
      let available = onBoard + p.active.hand - g.turn.jovianBonus;
      if (available < 0) available = 0; // Jovian loan can eat the whole hand
      const distTotal = Object.values(action.dist).reduce((s, n) => s + n, 0);
      const keys = Object.keys(action.dist);
      if (keys.some((id) => !own.includes(id))) throw new RulesError("can only redeploy to your active systems");
      if (keys.some((id) => !Number.isInteger(action.dist[id]!) || action.dist[id]! < 1)) {
        throw new RulesError("each kept system needs at least 1 token");
      }
      if (own.length > 0 && distTotal > available) throw new RulesError(`only ${available} tokens available`);
      // Systems omitted from dist are abandoned (needed for the Jovian edge case).
      for (const id of own) {
        const kept = action.dist[id] ?? 0;
        if (kept === 0) {
          g.systems[id]!.occupant = null;
          g.systems[id]!.tokens = 0;
          removeCivMarkers(g, id);
          log(g, `abandoned ${SYSTEMS[id]!.name}`);
        } else {
          g.systems[id]!.tokens = kept;
        }
      }
      p.active.hand = own.length === 0 ? Math.max(0, p.active.hand - g.turn.jovianBonus) : available - distTotal;
      g.turn.jovianBonus = 0;
      g.phase = "post";
      return g;
    }

    case "placeStarbase": {
      requirePhase(g, "post");
      if (p.active?.trait !== "fortress_building") throw new RulesError("not Fortress-Building");
      if (g.turn.starbasePlaced) throw new RulesError("one Starbase per turn");
      const own = systemsOf(g, player, "active");
      if (!own.includes(action.system)) throw new RulesError("not your system");
      const total = own.reduce((s, id) => s + g.systems[id]!.starbases, 0);
      if (total >= 6) throw new RulesError("maximum six Starbases");
      g.systems[action.system]!.starbases += 1;
      g.turn.starbasePlaced = true;
      return g;
    }

    case "moveBulwarks": {
      requirePhase(g, "post");
      if (p.active?.trait !== "heroic") throw new RulesError("not Heroic");
      if (action.systems.length > 2) throw new RulesError("two Bulwark markers");
      const own = systemsOf(g, player, "active");
      if (action.systems.some((id) => !own.includes(id))) throw new RulesError("Bulwarks go on your systems");
      for (const id of SYSTEM_IDS) g.systems[id]!.bulwark = false;
      for (const id of action.systems) g.systems[id]!.bulwark = true;
      return g;
    }

    case "verdantGrow": {
      requirePhase(g, "post");
      if (p.active?.species !== "verdant_mycelium") throw new RulesError("not Verdant Mycelium");
      if (g.turn.verdantPlaced) throw new RulesError("already grown this turn");
      const own = systemsOf(g, player, "active");
      if (!own.includes(action.system) || !hasPlanet(action.system, "terran")) {
        throw new RulesError("choose one of your Terran systems");
      }
      g.systems[action.system]!.tokens += 1;
      g.turn.verdantPlaced = true;
      return g;
    }

    case "nameDiplomaticTarget": {
      requirePhase(g, "post");
      if (p.active?.trait !== "diplomatic") throw new RulesError("not Diplomatic");
      if (action.player === player || action.player < 0 || action.player >= g.players.length) {
        throw new RulesError("name an opponent");
      }
      p.diplomaticTarget = action.player;
      log(g, `Diplomatic pact: ${g.config.seats[action.player]!.name} may not attack`);
      return g;
    }

    case "endTurn": {
      if (g.phase === "start") {
        // A player with no active civ and nothing to do (should not normally happen) or
        // a player who wants to sit tight: score remnants only.
        if (p.active) throw new RulesError("take your turn (recall/conquer or collapse)");
        const lines = scoreRemnants(g, player);
        const total = totalOf(lines);
        if (total > 0) {
          p.influence += total;
          log(g, `scores ${total} Influence from Remnants`);
        }
        finishTurn(g);
        return g;
      }
      if (g.phase === "conquer") endConquerPhase(g);
      if (g.phase === "redeploy") {
        // Auto-redeploy: keep board as is; return of the Jovian loan comes from hand.
        autoRedeploy(g, player);
      }
      requirePhase(g, "post");
      autoVerdant(g, player);
      scoreEndOfTurn(g, player);
      finishTurn(g);
      return g;
    }

    default:
      throw new RulesError("unknown action");
  }
}

// ---------- internals ----------

function requirePhase(g: GameState, phase: GameState["phase"]): void {
  if (g.phase !== phase) throw new RulesError(`wrong phase (${g.phase}, expected ${phase})`);
}

function log(g: GameState, text: string): void {
  g.log.push({ round: g.round, player: g.current, text });
}

function rollDie(g: GameState): number {
  const [s, i] = nextInt(g.rngState, g.config.dieFaces.length);
  g.rngState = s;
  return g.config.dieFaces[i]!;
}

function refillMarket(g: GameState): void {
  while (g.market.length < g.config.marketSize) {
    if (g.speciesDeck.length === 0 && g.speciesDiscard.length > 0) {
      g.speciesDeck = g.speciesDiscard;
      g.speciesDiscard = [];
    }
    if (g.traitDeck.length === 0 && g.traitDiscard.length > 0) {
      g.traitDeck = g.traitDiscard;
      g.traitDiscard = [];
    }
    if (g.speciesDeck.length === 0 || g.traitDeck.length === 0) break; // market shrinks — extreme edge
    g.market.push({ species: g.speciesDeck.pop()!, trait: g.traitDeck.pop()!, influence: 0 });
  }
}

function enterConquerPhase(g: GameState): void {
  const p = g.players[g.current]!;
  g.phase = "conquer";
  if (p.active?.species === "jovian_reavers") {
    p.active.hand += 4;
    g.turn.jovianBonus = 4;
  }
}

function endConquerPhase(g: GameState): void {
  const p = g.players[g.current]!;
  // Kharax Brood: +1 token per 2 non-empty systems conquered this turn.
  if (p.active?.species === "kharax_brood") {
    const grown = Math.floor(g.turn.conquests.filter((c) => c.wasNonEmpty).length / 2);
    if (grown > 0) {
      p.active.hand += grown;
      log(g, `the Kharax Brood grows by ${grown}`);
    }
  }
  g.phase = "redeploy";
}

function removeCivMarkers(g: GameState, id: SystemId): void {
  g.systems[id]!.starbases = 0;
  g.systems[id]!.bulwark = false;
}

/** Remove the current defender of `target` ahead of a successful conquest. */
function clearDefender(g: GameState, target: SystemId): void {
  const sys = g.systems[target]!;
  const occ = sys.occupant;
  if (!occ) {
    if (sys.neutrals > 0) sys.neutrals = 0; // neutral defenders are removed from the game
    return;
  }
  const owner = g.players[occ.player]!;
  if (occ.kind === "remnant") {
    // Remnant defeated: all tokens removed from the game.
    const species = owner.remnants[occ.remnantIdx]?.species;
    if (species === "kharax_brood" && hasPlanet(target, "volcanic")) {
      // Attacker removes one participating token after the conquest — handled by caller via flag.
      g.turn.lastDieRoll = g.turn.lastDieRoll; // no-op; see resolveConquest
    }
    sys.tokens = 0;
    sys.occupant = null;
    removeCivMarkers(g, target);
    return;
  }
  // Active civilization defeated.
  const vitrifrost = owner.active?.species === "vitrifrost_collective";
  let survivors = sys.tokens - (vitrifrost ? 0 : 1);
  if (survivors < 0) survivors = 0;
  sys.tokens = 0;
  sys.occupant = null;
  removeCivMarkers(g, target);
  if (survivors > 0) {
    // Immediate redeploy (deterministic): all survivors to the defender's active system
    // with the fewest tokens (alphabetical tiebreak); to hand if none remain.
    const remaining = systemsOf(g, occ.player, "active").sort((a, b) =>
      g.systems[a]!.tokens - g.systems[b]!.tokens || a.localeCompare(b),
    );
    if (remaining.length > 0) {
      g.systems[remaining[0]!]!.tokens += survivors;
    } else if (owner.active) {
      owner.active.hand += survivors;
    }
  }
}

function resolveConquest(g: GameState, player: PlayerId, target: SystemId, tokensCommitted: number): void {
  const p = g.players[player]!;
  const sys = g.systems[target]!;
  const wasNonEmpty = sys.occupant !== null || sys.neutrals > 0;
  const defOcc = sys.occupant;
  const kharaxRevenge =
    defOcc?.kind === "remnant" &&
    g.players[defOcc.player]!.remnants[defOcc.remnantIdx]?.species === "kharax_brood" &&
    hasPlanet(target, "volcanic");

  clearDefender(g, target);
  p.active!.hand -= tokensCommitted;
  sys.occupant = { player, kind: "active", remnantIdx: -1 };
  sys.tokens = tokensCommitted;

  if (kharaxRevenge) {
    if (sys.tokens >= 2) sys.tokens -= 1;
    else if (p.active!.hand > 0) p.active!.hand -= 1;
    log(g, `Kharax Remnant takes its revenge — one attacker token removed`);
  }

  g.turn.conquests.push({ system: target, wasNonEmpty });
  log(g, `conquered ${SYSTEMS[target]!.name} (${tokensCommitted} tokens)`);
}

function autoRedeploy(g: GameState, player: PlayerId): void {
  // Default distribution: leave the board as it stands; settle the Jovian loan from hand,
  // then from the largest stacks (never below 1 per system).
  const p = g.players[player]!;
  if (!p.active) {
    g.phase = "post";
    return;
  }
  let owe = g.turn.jovianBonus;
  const fromHand = Math.min(owe, p.active.hand);
  p.active.hand -= fromHand;
  owe -= fromHand;
  if (owe > 0) {
    const own = systemsOf(g, player, "active").sort((a, b) => g.systems[b]!.tokens - g.systems[a]!.tokens);
    for (const id of own) {
      while (owe > 0 && g.systems[id]!.tokens > 1) {
        g.systems[id]!.tokens -= 1;
        owe -= 1;
      }
    }
    // If still owed, abandon smallest systems until settled.
    if (owe > 0) {
      for (const id of own.reverse()) {
        if (owe <= 0) break;
        owe -= g.systems[id]!.tokens;
        g.systems[id]!.tokens = 0;
        g.systems[id]!.occupant = null;
        removeCivMarkers(g, id);
        log(g, `abandoned ${SYSTEMS[id]!.name}`);
      }
    }
  }
  g.turn.jovianBonus = 0;
  g.phase = "post";
}

function autoVerdant(g: GameState, player: PlayerId): void {
  const p = g.players[player]!;
  if (p.active?.species !== "verdant_mycelium" || g.turn.verdantPlaced) return;
  const terran = systemsOf(g, player, "active")
    .filter((id) => hasPlanet(id, "terran"))
    .sort((a, b) => g.systems[a]!.tokens - g.systems[b]!.tokens || a.localeCompare(b));
  if (terran.length > 0) {
    g.systems[terran[0]!]!.tokens += 1;
    g.turn.verdantPlaced = true;
    log(g, `the Mycelium spreads on ${SYSTEMS[terran[0]!]!.name}`);
  }
}

function scoreEndOfTurn(g: GameState, player: PlayerId): void {
  const p = g.players[player]!;
  const lines = scoreExpandTurn(g, player);
  const total = totalOf(lines);
  p.influence += total;
  if (p.active) p.active.turnsActive += 1;
  log(g, `scores ${total} Influence`);
}

function collapseCiv(g: GameState, player: PlayerId, scoreCollapse: boolean): void {
  const p = g.players[player]!;
  if (!p.active) throw new RulesError("nothing to collapse");
  const civ = p.active;
  const echoing = civ.trait === "echoing";

  // Clear prior remnants (Echoing keeps the newest one; hard cap of two empires).
  const keep = echoing ? p.remnants.slice(0, 1) : [];
  p.remnants.forEach((rem, idx) => {
    const kept = echoing && idx === 0;
    if (kept) return;
    for (const id of SYSTEM_IDS) {
      const occ = g.systems[id]!.occupant;
      if (occ?.player === player && occ.kind === "remnant" && occ.remnantIdx === idx) {
        g.systems[id]!.occupant = null;
        g.systems[id]!.tokens = 0;
      }
    }
    g.speciesDiscard.push(rem.species);
  });

  // Re-index the kept remnant to idx 1 (new remnant becomes idx 0).
  for (const id of SYSTEM_IDS) {
    const occ = g.systems[id]!.occupant;
    if (occ?.player === player && occ.kind === "remnant") occ.remnantIdx = 1;
  }

  const cryari = civ.species === "cryari_revenants";
  for (const id of systemsOf(g, player, "active")) {
    const sys = g.systems[id]!;
    if (!cryari) sys.tokens = 1;
    sys.occupant = { player, kind: "remnant", remnantIdx: 0 };
    removeCivMarkers(g, id);
  }

  g.traitDiscard.push(civ.trait);
  p.remnants = [{ species: civ.species }, ...keep];
  p.active = null;
  p.diplomaticTarget = null;
  log(g, `${SPECIES[civ.species]!.name} collapse into a Remnant Empire`);

  if (scoreCollapse) {
    const lines = scoreRemnants(g, player);
    const total = totalOf(lines);
    p.influence += total;
    log(g, `scores ${total} Influence in the collapse`);
  }
}

function finishTurn(g: GameState): void {
  const p = g.players[g.current]!;
  // The pact a player made lasts until their own next turn begins — clear as their turn ends? No:
  // it protects THEM during opponents' turns; clear when their next turn starts.
  g.turn = freshTurnFlags();
  const nextPlayer = (g.current + 1) % g.players.length;
  if (nextPlayer === 0) {
    g.round += 1;
    if (g.round > g.config.rounds) {
      g.phase = "over";
      g.winners = computeWinners(g);
      log(g, `game over`);
      return;
    }
  }
  g.current = nextPlayer;
  g.players[nextPlayer]!.diplomaticTarget = null; // their previous pact expires as their turn starts
  g.phase = "start";
  void p;
}

function computeWinners(g: GameState): PlayerId[] {
  const stats = g.players.map((p, i) => {
    const systems = SYSTEM_IDS.filter((id) => g.systems[id]!.occupant?.player === i).length;
    const tokens = SYSTEM_IDS.reduce(
      (s, id) => s + (g.systems[id]!.occupant?.player === i ? g.systems[id]!.tokens : 0),
      0,
    );
    return { i, influence: p.influence, systems, tokens };
  });
  stats.sort((a, b) => b.influence - a.influence || b.systems - a.systems || b.tokens - a.tokens);
  const best = stats[0]!;
  return stats
    .filter((s) => s.influence === best.influence && s.systems === best.systems && s.tokens === best.tokens)
    .map((s) => s.i);
}
