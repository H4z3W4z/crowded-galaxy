# Crowded Galaxy

## Playable Prototype v0.2

**Working title:** Crowded Galaxy
**Players:** 2-5 (digital default: 3, minimum one human, AI fills open seats)
**Target play time:** 20-30 minutes compressed live play; async over days
**Prototype baseline:** 3-4 players, 12 rounds
**Genre:** Fast area control, civilization cycling, asymmetric powers

## 0. Changelog from v0.1

| Change | Summary |
| --- | --- |
| Small World alignment | Gameplay now follows Small World as closely as possible. The reinforcement die is in, defenders redeploy immediately, and neutral defenders seed the board. |
| 12 rounds | Up from 9. Treated as a hypothesis to validate in playtesting, not a commitment. |
| Reinforcement die | Optional roll on the final conquest of a turn (faces 0-0-0-1-2-3) covering a shortfall of up to 3. |
| Defender casualties | Defender loses one token permanently and immediately redeploys survivors (was: back to hand until next turn). |
| Neutral defenders | Lost Tribes analog. Outer rim starts empty; middle and inner rings seeded; Blue Silence gets two. |
| Species rework | All 12 species unhedged (no more "first per turn" rationing); four Small World archetypes added (Sorcerers, Amazons, Ghouls, Skeletons). Balance moved into population values. |
| Trait rework | Six traits cut, six Small World special-power archetypes added (Berserk, Alchemist, Spirit, Heroic, Stout, Wealthy analogs); survivors unhedged and repriced. |
| Card data externalized | `data/species.yaml` and `data/traits.yaml` are the canonical card definitions. Tables in this doc are summaries. |
| Digital-first design | Web first, iOS/iPad later. Async multiplayer with a unified live/async model. One heuristic AI at launch. |

## 1. Core pitch

The galaxy is too small for everyone.

Each player leads a succession of alien civilizations. Every civilization combines one **Species** with one randomly paired **Trait**, producing combinations such as Aggressive Thalassi, Echoing Cryari Revenants, or Wormhole-Savvy Kharax. An empire expands across connected solar systems, earns Influence, becomes overstretched, and eventually collapses into a weakened **Remnant Empire**. The player then launches a completely new civilization while the old one lingers on the map.

Systems contain one to three planets of different types. A species earns additional Influence in systems containing its favored habitat. Wormholes create long-distance connections, hazards make certain systems harder to capture, and the remains of dead civilizations continue to shape the board.

The intended emotional rhythm:

1. Discover a ridiculous but promising species-and-trait combination.
2. Explode onto the map.
3. Exploit the geography and habitat distribution.
4. Realize the empire is running out of population.
5. Decide whether to squeeze out one more scoring turn or collapse now.
6. Return with an entirely different civilization while the old one haunts the board.

## 2. Design pillars

Gameplay fidelity target: **Small World**, as closely as possible. The original material lives in the layers on top:

- **Multi-planet systems:** a system is one territory containing one to three planet icons.
- **Habitat specialization:** an active civilization earns +1 Influence from each controlled system containing at least one favored planet.
- **Wormhole geography:** three paired wormholes count as adjacency for conquest, defense, powers, and scoring.
- **Persistent Remnant Empires:** every species has a Remnant ability — simplified in v0.2 to passive scoring or defense so several Remnants on the board stay readable.

Planets are not individually occupied. Conquer the system and you control every planet in it.

## 3. Components

- 1 star map with 30 systems
- 12 Species cards (Active side / Remnant side) — canonical data: `data/species.yaml`
- 20 Trait cards — canonical data: `data/traits.yaml`
- 150 population tokens in five player colors
- 19 neutral defender tokens
- 1 reinforcement die, faces 0-0-0-1-2-3
- Generic Starbase markers (6 max in play per Fortress-Building civ)
- 2 Bulwark markers (Heroic)
- 5 Influence markers and an Influence track, or Influence tokens
- 1 round marker
- 6 combination slots for the civilization market

## 4. Planet and system anatomy

Each system shows: a name and two-letter code, one to three planet icons, hyperlanes, and possibly a Rim Gate icon (new civilizations may enter), Hazard icon (+1 defense), Relic icon (Trait interactions), or wormhole endpoint.

### Planet types

| Planet | Icon | Typical inhabitants |
| --- | --- | --- |
| Terran | Leaf | Biological generalists, fungal networks |
| Ocean | Wave | Aquatic and amphibious species |
| Barren | Crater | Machines, miners, silicon life |
| Gas Giant | Cloud | Floaters, atmospheric megafauna |
| Ice | Crystal | Cryogenic and ammonia-based life |
| Volcanic | Flame | Thermophiles, magma-forged species |

### System rules

- A system is controlled by the civilization with population tokens in it.
- A multi-planet system can satisfy several abilities at once, but provides only one habitat bonus per turn regardless of duplicate favored planets.
- A Hazard adds +1 to conquest cost. A Starbase adds +1. Neutral and enemy tokens each add +1.
- Wormhole-linked systems are adjacent for all rules unless a card says otherwise.

## 5. Setup

1. Place the map and round marker. Baseline: 12 rounds (see Section 11 — this number is under test).
2. **Seed neutral defenders:** 1 neutral token in each of the 12 middle-ring systems, 1 in each of the 5 inner-ring systems, 2 in Blue Silence. The outer rim starts empty. Neutrals never move, never score, add +1 conquest cost per token, and are removed from the game when conquered.
3. Shuffle the Species and Trait decks separately. Fill six market slots, each with one Species and one Trait.
4. Each player starts at 0 Influence. Random first player, clockwise play.

### Choosing a civilization

When a player needs a new civilization, they choose one of the six visible combinations:

- The first combination is free. To take a later one, place 1 Influence on every skipped combination.
- The chosen combination collects any Influence sitting on it.
- Slide remaining combinations forward and refill.
- Take population tokens equal to Species population + Trait population.

## 6. The turn and scoring loop

At the start of a turn, a player does one of:

- **Expand** with their active civilization.
- **Collapse** into a Remnant Empire (consumes the turn, unless Twilight).
- **Choose and Launch** a new civilization if they have none, then Expand immediately.

### A. Expand

**1. Recall population.** Take any number of tokens from your active systems into hand, leaving at least one in each system you keep. An emptied system is abandoned. Remnant tokens never move.

**2. Conquer systems**, one at a time, each adjacent by hyperlane or wormhole to a system you control. A civilization with no systems enters through any Rim Gate.

> **Cost: 2 + defending tokens (enemy or neutral) + Starbases + Hazard modifiers**

Place that many tokens from hand into the conquered system.

- **Defender casualties (Small World style):** when an active civilization loses a system, its owner removes one token permanently and immediately redeploys the survivors onto their remaining systems. When a Remnant or neutral force is defeated, remove all its tokens from the game.
- **The reinforcement die:** on your final conquest of the turn, if you are short by 1-3 tokens (and have at least one in hand), you may declare the attempt and roll. Add the result (0, 0, 0, 1, 2, or 3) to your committed tokens. If the total meets the cost, the conquest succeeds. If not, the attempt fails and your remaining tokens redeploy normally. Your turn's conquests end either way.

**3. Redeploy.** Redistribute active population among controlled systems, at least one token each.

**4. Score Influence:**

- 1 per system your active civilization controls
- +1 per active system containing a favored-habitat planet
- 1 per system your Remnant Empire controls (two, if Echoing keeps a second Remnant alive)
- Plus Species, Remnant, Trait, and Relic bonuses

### B. Collapse into a Remnant Empire

1. If you already control a Remnant Empire, remove it (unless the collapsing civilization has Echoing).
2. Leave exactly one token in each system of the collapsing civilization; return extras to the supply. **Exception:** Cryari Revenants keep all tokens.
3. Discard the Trait card and its markers.
4. Flip the Species card to its Remnant side. Score 1 Influence per surviving Remnant system plus its printed Remnant bonus.

A civilization with **Twilight** collapses at the end of a normal Expand turn instead of spending a turn.

### C. End of round and game

After every player takes a turn, advance the round marker. After the final round, most Influence wins. Ties: most systems (active + Remnant), then most population on the map, then shared victory.

| Players | Map | Rounds |
| --- | --- | ---: |
| 2 | Remove one outer quadrant and attached middle systems | 12 |
| 3 | Full map (digital default) or remove one outer sector for tabletop | 12 |
| 4 | Full 30-system map | 12 |
| 5 | Full 30-system map | 10 |

## 7. Species (summary — canonical: `data/species.yaml`)

Abilities are unhedged: no "first per turn" rationing. Balance lives in population values — loud ability, cheap pop; plain ability, big pop.

| Species | Pop | Habitat | Active | Remnant | SW analog |
| --- | ---: | --- | --- | --- | --- |
| Thalassi Compact | 6 | Ocean | Ocean systems cost 1 less | +1 if 2+ Ocean Remnant systems | Tritons |
| Pelagic Oracles | 5 | Ocean | Convert lone adjacent enemy tokens (1/turn/opponent) | +1 if Remnants adjacent to an opponent | Sorcerers |
| Heliox Aerostats | 6 | Gas Giant | Gas Giants cost 1 less | Gas Giant Remnants count as 2 pop | Giants |
| Jovian Reavers | 5 | Gas Giant | +4 supply tokens for conquest only | +1 if 2+ Gas Giant Remnant systems | Amazons |
| Ferrum Continuum | 5 | Barren | Barren systems +1 defense | Barren Remnants keep +1 defense | Trolls |
| Ossian Prospectors | 7 | Barren | +1 per system with 2+ Barren planets | +1 if Remnants hold a 3-planet system | Dwarves |
| Cryari Revenants | 8 | Ice | None — raw numbers | Remnant keeps ALL tokens, may conquer 1 system/turn | Ghouls + Ratmen |
| Vitrifrost Collective | 5 | Ice | Never lose casualties; all survivors redeploy | Ice Remnants +1 defense | Elves |
| Kharax Brood | 5 | Volcanic | +1 token per 2 non-empty systems conquered | Attacker loses 1 token conquering Volcanic Remnants | Skeletons |
| Magmaforged | 6 | Volcanic | Ignore all Hazard modifiers | Remnants in Hazards +1 defense | Giants/Underworld |
| Verdant Mycelium | 5 | Terran | +1 token to a Terran system each redeploy | +1 if 2 adjacent Terran Remnant systems | original |
| Concord of Many | 7 | Terran | Expand through own Remnants without harm | Remnant systems usable as conquest origins | original |

## 8. Traits (summary — canonical: `data/traits.yaml`)

Traits are the game's random Special Powers. Cut in v0.2: Psionic, Cybernetic, Replicating, Ruthless, Scouting, Hive-Linked.

| Trait | Pop | Ability | SW analog |
| --- | ---: | --- | --- |
| Adaptive | 2 | Choose a second favored habitat each turn (no cap) | original |
| Aggressive | 4 | All conquests cost 1 less | Commando |
| Catalytic | 4 | +2 Influence per turn while active | Alchemist |
| Ancient | 4 | +1 per Relic system controlled | Forest/Hill |
| Berserk | 4 | Roll the die before EVERY conquest as a discount | Berserk |
| Colonizing | 5 | Empty systems cost 1 less | Mounted |
| Defensive | 5 | Every active system +1 defense | Fortified (loose) |
| Diplomatic | 5 | Name one opponent; they cannot attack your active civ | Diplomat |
| Echoing | 5 | Previous Remnant persists — two Remnant Empires at once | Spirit |
| Fortress-Building | 3 | 1 Starbase/turn (max 6): +1 defense, +1 Influence each | Fortified |
| Heroic | 5 | 2 Bulwark markers: those systems cannot be conquered | Heroic |
| Industrious | 4 | +1 per active 3-planet system | terrain scoring |
| Mercantile | 2 | +1 per active system (doubles base scoring) | Merchant |
| Nomadic | 3 | Any conquest may enter through any Rim Gate | Halflings |
| Parasitic | 4 | +1 per non-empty system conquered this turn | Pillaging |
| Quantum Drive | 3 | Conquer any system sharing a planet type with one you hold | Flying (restricted) |
| Stealth | 4 | Ignore all Starbase and Hazard modifiers | Underworld (loose) |
| Twilight | 4 | Collapse at the end of a normal Expand turn | Stout |
| Wealthy | 4 | +7 Influence at the end of your launch turn | Wealthy |
| Wormhole-Savvy | 4 | Wormhole conquests cost 1 less; redeploy through wormholes | Underworld |

## 9. Prototype star map

Unchanged from v0.1. Thirty systems: outer rim (12), middle ring (12), inner ring (5), and central Blue Silence. Three wormholes: Cinderwake (CW)-Ossuary (OS), Pelagos (PL)-Meridian (MR), Zephyr Crown (ZC)-Sable Rift (SR).

### System roster

| Code | System | Planets | Tags |
| --- | --- | --- | --- |
| AR | Altair Reach | Terran, Barren | Rim Gate |
| CW | Cinderwake | Volcanic | Rim Gate, Hazard, Wormhole |
| PL | Pelagos | Ocean, Ocean, Ice | Rim Gate, Wormhole |
| ZC | Zephyr Crown | Gas Giant, Barren | Wormhole |
| NB | Nacre Belt | Barren, Ice | Rim Gate |
| VG | Viridian Gate | Terran, Ocean | Rim Gate |
| OS | Ossuary | Barren, Volcanic | Hazard, Wormhole |
| EF | Emberfall | Volcanic, Gas Giant | Rim Gate |
| FM | Frostmere | Ice, Ocean | Rim Gate |
| MR | Meridian | Terran, Barren, Ocean | Rim Gate, Wormhole |
| BL | Bellows | Gas Giant, Volcanic | Rim Gate |
| SR | Sable Rift | Barren, Ice | Rim Gate, Hazard, Wormhole |
| HD | Halcyon Deep | Ocean, Gas Giant | Neutral 1 |
| RC | Red Choir | Volcanic, Volcanic | Neutral 1 |
| SV | Silica Verge | Barren, Terran | Neutral 1 |
| AG | Aurora Gate | Ice, Gas Giant, Terran | Neutral 1 |
| TA | Tethys Arc | Ocean, Ice | Neutral 1 |
| FH | Forgeheart | Volcanic, Barren, Gas Giant | Hazard, Relic, Neutral 1 |
| GW | Greenwake | Terran, Ocean | Neutral 1 |
| JL | Jove's Lantern | Gas Giant, Gas Giant | Neutral 1 |
| PA | Pale Anchor | Ice, Barren | Neutral 1 |
| AB | Ashen Bloom | Volcanic, Terran | Neutral 1 |
| CS | Cloudspire | Gas Giant, Terran, Ocean | Neutral 1 |
| KD | Kestrel Dust | Barren, Barren | Neutral 1 |
| CY | Cryos | Ice, Ice, Ocean | Neutral 1 |
| SO | Solace | Terran | Neutral 1 |
| CN | Crown Nexus | Terran, Gas Giant, Barren | Relic, Neutral 1 |
| OV | Orphean Vault | Barren, Ice | Hazard, Relic, Neutral 1 |
| RM | Radiant Maw | Volcanic, Gas Giant | Relic, Neutral 1 |
| BS | Blue Silence | Ocean, Terran | Relic, Neutral 2 |

### Hyperlane topology

Outer ring: AR - CW - PL - ZC - NB - VG - OS - EF - FM - MR - BL - SR - AR

Middle ring: HD - RC - SV - AG - TA - FH - GW - JL - PA - AB - CS - KD - HD

Outer-to-middle: AR-HD, AR-RC, CW-RC, CW-SV, PL-SV, PL-AG, ZC-AG, NB-TA, VG-TA, VG-FH, OS-FH, OS-GW, EF-GW, EF-JL, FM-JL, FM-PA, MR-PA, MR-AB, BL-AB, BL-CS, SR-CS, SR-KD

Middle-to-inner: HD-CY, RC-CY, KD-CY, SV-SO, AG-SO, TA-CN, FH-CN, GW-OV, JL-OV, PA-RM, AB-RM, CS-RM

Inner ring: CY - SO - CN - OV - RM - CY. Blue Silence connects to all five.

## 10. Digital design (new in v0.2)

- **Platform path:** web first, then iOS/iPad. Touch-first layout from the start.
- **Multiplayer model:** async online with one unified system — a live 20-30 minute session is simply an async game where everyone is present. Turns are strictly sequential (conquest changes the board), so each game is up to `players × rounds` turn notifications.
- **Tables:** 3-player default, 2-5 supported. Minimum one human; AI fills open seats. No turn timers — friends-first, social pressure and nudge notifications only.
- **AI:** one solid heuristic AI at launch. Headless rules engine scores candidate turn plans on cost efficiency, habitat matches, defensive exposure, and collapse timing. Cryari Revenants and Twilight need dedicated collapse-timing evaluation. No search tree, no difficulty tiers in v1.
- **Determinism:** the only RNG is the reinforcement die (server-rolled), Berserk rolls, and market refills. Everything else is open information — enables clean turn replays and "what happened while you were away" summaries. The Pelagic Oracles conversion and die rolls must be explicit in replays.
- **Architecture note:** build the simulation as a deterministic, seed-driven headless engine with the renderer strictly separated. The same engine drives rules enforcement, AI planning, replays, and server-side validation.

## 11. Balance assumptions for the first test

Starting hypotheses, not final balance:

- Combined starting population: 7-13 (species 5-8 + trait 2-5).
- With neutral defenders, a launch turn should capture 3-4 systems (down from 4-5 in v0.1). This slower expansion is intentional — it delays board saturation across 12 rounds.
- A strong scoring turn: roughly 8-13 Influence.
- Most civilizations should collapse after 2-4 Expand turns.
- Habitat bonuses: roughly one-third to one-half of active scoring.
- **12 rounds is a hypothesis.** If late rounds drag or scoring flattens, test 10; the digital build should make round count a config value.

### Playtest watch-list

1. Vitrifrost (full Elves) over 12 rounds of attrition.
2. Diplomatic in 3-player — immunity from half the table. Candidate rider: cannot name the same opponent on consecutive turns.
3. Heroic — two immune systems on a 30-system map.
4. Echoing + Cryari Revenants — two immortal marching Remnants. Deliberately left in for the first playtest.
5. Mercantile at 2 pop — is the Merchant pricing lesson right for this map size?
6. Neutral seeding density — if launch turns feel anemic, seed only 8 of 12 middle-ring systems before touching population values.
7. Berserk average value (die EV is 1.0 per conquest) vs Aggressive's flat 1 — the gamble should feel different, not strictly worse.

## 12. Playtest script

Use 3-4 players, 12 rounds. No rule changes mid-game. Track:

1. Systems captured on launch turns (target 3-4).
2. Expand turns before Collapse (target 2-4).
3. Round count feel — did the game end while players wanted one more round, or two rounds after they stopped caring?
4. Are Remnant abilities readable with several on the board?
5. Reinforcement die: how often attempted, how often decisive, how it feels to miss.
6. Do neutral defenders create a real early-game cost gradient?
7. Market skip-Influence: are weak combos eventually taken?
8. Per civilization: combination, starting pop, launch captures, turns active, Influence active vs Remnant, reason for collapse.

## 13. Scope guardrails

Do not add until the central loop is fun: fleet movement, tech trees, resource production, diplomacy agreements, hidden objectives, event decks, individual planet occupation, ship stats. First prototype is expansion, habitat, collapse, rebirth.

## 14. Commercial-development note

v0.2 deliberately moves *closer* to Small World mechanically. Game mechanics are not protectable; names, art, writing, and trade dress are. The original layers (multi-planet habitats, wormhole topology, Remnant abilities, the market's Influence-skip economy, all naming and setting) carry the identity. Before commercial publication, revisit differentiation and have a tabletop-game attorney review presentation, card structure, iconography, and trade dress.
