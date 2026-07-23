# Crowded Galaxy

## First Playable Prototype v0.1

**Working title:** Crowded Galaxy  
**Players:** 2-5  
**Target play time:** 60-90 minutes  
**Prototype focus:** 4 players, 9 rounds  
**Genre:** Fast area control, civilization cycling, asymmetric powers

## 1. Core pitch

The galaxy is too small for everyone.

Each player leads a succession of alien civilizations. Every civilization combines one **Species** with one randomly paired **Trait**, producing combinations such as Terraforming Thalassi, Parasitic Ferrum, or Wormhole-Savvy Kharax. An empire expands across connected solar systems, earns Influence, becomes overstretched, and eventually collapses into a weakened **Remnant Empire**. The player then launches a completely new civilization while the old one lingers on the map.

Systems contain one to three planets of different types. A species earns additional Influence in systems containing its favored habitat. Wormholes create long-distance connections, hazards make certain systems harder to capture, and the remains of dead civilizations continue to shape the board.

The intended emotional rhythm is:

1. Discover a ridiculous but promising species-and-trait combination.
2. Explode onto the map.
3. Exploit the geography and habitat distribution.
4. Realize the empire is running out of population.
5. Decide whether to squeeze out one more scoring turn or collapse now.
6. Return with an entirely different civilization while the old one haunts the board.

## 2. What makes this version distinct

The first prototype should stay light, but its identity rests on four ideas:

- **Multi-planet systems:** A system is one territory, but it can contain one to three planet icons. More planets provide more opportunities for habitat and trait bonuses.
- **Habitat specialization:** Every species favors one planet type. An active civilization earns +1 Influence from each controlled system containing at least one favored planet.
- **Wormhole geography:** Three paired wormholes connect distant systems. They count as adjacency for conquest, defense, powers, and scoring.
- **Persistent Remnant Empires:** A collapsed civilization leaves one population in each surviving system. It continues to score and retains a smaller passive ability printed on the Remnant side of its Species card.

Planets are not individually occupied in this version. This keeps the pace fast: conquer the system and you control every planet shown in it.

## 3. Prototype components

- 1 star map with 30 systems
- 12 Species cards, each with an Active side and a Remnant side
- 20 Trait cards
- 150 population tokens in five player colors
- 25 generic starbase markers
- 15 terraforming markers
- 5 Influence markers and an Influence track, or a supply of Influence tokens
- 1 round marker
- 6 combination slots for the civilization market
- Optional reference cards for conquest cost and turn order

No dice are required in the first prototype. Conquest is deterministic so players can read the board and plan quickly.

## 4. Planet and system anatomy

Each system shows:

- A system name and two-letter code
- One to three planet icons
- Hyperlanes to neighboring systems
- A Rim Gate icon if a new civilization can enter there
- A Hazard icon if the system has +1 defense
- A Relic icon if certain Traits can exploit it
- A wormhole endpoint, when present

### Planet types

| Planet | Icon suggestion | Typical inhabitants |
| --- | --- | --- |
| Terran | Leaf | Biological generalists, fungal networks |
| Ocean | Wave | Aquatic and amphibious species |
| Barren | Crater | Machines, miners, silicon life |
| Gas Giant | Cloud | Floaters, atmospheric megafauna |
| Ice | Crystal | Cryogenic and ammonia-based life |
| Volcanic | Flame | Thermophiles, magma-forged species |

### System rules

- A system is controlled by the civilization with population tokens in it.
- A system containing multiple planet types can satisfy several abilities at once.
- A system provides only one normal habitat bonus, even if it contains two planets of the active species' favored type.
- A Hazard adds +1 to the cost of conquering the system.
- A Starbase adds +1 to the cost of conquering the system.
- Wormhole-linked systems are adjacent for all rules unless a card explicitly says otherwise.

## 5. Setup

1. Place the map and round marker. For the first test, use all 30 systems and set the game to 9 rounds.
2. Shuffle the Species deck and Trait deck separately.
3. Create six civilization combinations in a row. Each slot receives one Species and one Trait.
4. Put the Influence track and markers nearby.
5. Each player chooses a color and starts at 0 Influence.
6. Randomly choose the first player. Play proceeds clockwise.

### Choosing a civilization

When a player needs a new civilization, they choose one of the six visible combinations.

- The first combination is free.
- To choose a later combination, place 1 Influence on every skipped combination.
- The chosen combination receives any Influence already sitting on it.
- Slide the remaining combinations toward the front and refill the empty slots.
- Take population tokens equal to the Species population value plus the Trait population value.

This makes weaker-looking combinations increasingly tempting without requiring every pairing to be equally powerful.

## 6. The turn and scoring loop

At the start of a turn, a player does one of the following:

- **Expand** with their active civilization.
- **Collapse** their active civilization into a Remnant Empire.
- If they have no active civilization, **Choose and Launch** a new one, then perform an Expand turn immediately.

### A. Expand

#### 1. Recall population

Take any number of population tokens from your active systems back into your hand. Leave at least one token in every system you wish to keep. A system left empty is abandoned immediately.

Tokens belonging to your Remnant Empire cannot be recalled or moved.

#### 2. Conquer systems

Conquer one system at a time. Each conquest must be adjacent to one of your active systems by hyperlane or wormhole. If your active civilization controls no systems, its first conquest must enter through any Rim Gate.

The population cost is:

> **2 + opposing population + Starbases + Hazard modifiers**

Place that many population tokens from your hand into the conquered system.

Examples:

- An empty normal system costs 2 population.
- A system with one opposing token costs 3 population.
- A hazardous system with one opposing token costs 4 population.
- A system with two opposing tokens and a Starbase costs 5 population.

When an active civilization is defeated in a system, its owner permanently loses one population token from that system and takes the others back into hand for their next turn. When a Remnant Empire is defeated, remove all of its population from that system.

There is no random final conquest in v0.1. If you cannot pay the complete cost, you cannot take the system.

#### 3. Redeploy

After the last conquest, redistribute your active population among your controlled active systems. Leave at least one token in each. Population cannot be moved into Remnant systems.

#### 4. Score Influence

Score all of the following:

- **1 Influence** for each system controlled by your active civilization.
- **+1 Influence** for each active system containing at least one planet of your Species' favored habitat.
- **1 Influence** for each system controlled by your Remnant Empire.
- Any additional Influence produced by Species, Remnant, Trait, Relic, or adjacency abilities.

A system controlled by an active empire and a system controlled by its owner's Remnant Empire score separately. The two civilizations never occupy the same system.

### B. Collapse into a Remnant Empire

Collapsing consumes the turn. Resolve it in this order:

1. If you already control a Remnant Empire, remove all of its population from the map and discard its Species card.
2. In every system controlled by the collapsing active civilization, leave exactly one population token and return all extras to the supply.
3. Discard the civilization's Trait card and remove its Trait markers, including Starbases or terraform markers unless the Trait says otherwise.
4. Flip the Species card to its Remnant side. Its Remnant ability is now active.
5. Score 1 Influence for each surviving Remnant-controlled system, plus its printed Remnant bonus.

On the player's next turn, they choose a new civilization and launch it. An active civilization may conquer its owner's Remnant systems normally, but this is rarely efficient unless a power rewards doing so.

### C. End of the round and game

After every player takes a turn, advance the round marker.

| Players | Suggested map | Rounds |
| --- | --- | ---: |
| 2 | Remove one outer quadrant and its attached middle systems | 10 |
| 3 | Remove one outer sector of four systems | 10 |
| 4 | Full 30-system map | 9 |
| 5 | Full 30-system map | 8 |

After the final round, the player with the most Influence wins. Break ties by:

1. Most active and Remnant systems controlled
2. Most population remaining on the map
3. Shared victory if still tied

## 7. Twelve alien Species

The population value is added to the population value on the paired Trait card.

| Species | Pop. | Favored habitat | Active ability | Remnant ability |
| --- | ---: | --- | --- | --- |
| **Thalassi Compact** | 6 | Ocean | The first Ocean system you conquer each turn costs 1 fewer population, minimum 1. | Score +1 if your Remnants control at least two Ocean systems. |
| **Pelagic Oracles** | 5 | Ocean | Once per turn, you may treat any Ocean system as adjacent to one Ocean system you control. Pay the normal conquest cost. | One Remnant Ocean system of your choice scores +1 if adjacent to an opponent. |
| **Heliox Aerostats** | 6 | Gas Giant | Gas Giant systems cost you 1 fewer population to conquer, minimum 1, when they contain no Starbase. | A Remnant in a Gas Giant system counts as two population when calculating conquest cost. |
| **Jovian Grazers** | 7 | Gas Giant | After your final conquest, move up to two population between any Gas Giant systems you control before redeploying. | Score +1 if your Remnants control Gas Giant systems on both halves of the map. |
| **Ferrum Continuum** | 5 | Barren | Every active Barren system you control has +1 defense. | Every Remnant Barren system you control retains +1 defense. |
| **Ossian Prospectors** | 7 | Barren | Score +1 for each active system containing at least two Barren planets. | Score +1 if your Remnants control any three-planet system. |
| **Cryari Clans** | 6 | Ice | The first Ice system you conquer each turn costs 1 fewer population, minimum 1. | Ice systems containing your Remnants ignore the first Trait-based conquest discount used against them. |
| **Vitrifrost Collective** | 5 | Ice | Once per turn when you lose a system, return the casualty token to your supply instead of removing it permanently. | When a Remnant Ice system survives an entire round, it gains +1 defense for the following round. Use one temporary marker. |
| **Kharax Brood** | 5 | Volcanic | After conquering your first Volcanic system each turn, add one population from the supply to that system. | When a Remnant Volcanic system is conquered, the attacker must remove one participating population after the conquest. |
| **Magmaforged** | 7 | Volcanic | Ignore Hazard defense modifiers in systems containing a Volcanic planet. | Remnant Volcanic systems have +1 defense in Hazard systems. |
| **Verdant Mycelium** | 5 | Terran | At the end of redeployment, add one population from the supply to one Terran system you control. | Score +1 if your Remnants control two adjacent Terran systems. |
| **Concord of Many** | 7 | Terran | Your active empire may expand through your own Remnant systems as if they were active systems, without removing them. | Your active empire may use your Remnant systems as conquest origins. |

### Species card template

Each Species card should visibly contain:

- Species name
- Population value
- Favored habitat icon
- One-sentence Active ability
- One-sentence Remnant ability on the reverse or lower half

## 8. Twenty Traits

Trait population is added to the paired Species population.

| Trait | Pop. | Ability |
| --- | ---: | --- |
| **Adaptive** | 2 | At the start of each Expand turn, choose a second favored habitat. You may gain no more than +3 total habitat Influence from the chosen type that turn. |
| **Aggressive** | 4 | The first conquest against an active enemy each turn costs 1 fewer population, minimum 1. |
| **Ancient** | 3 | Score +1 for every Relic system you actively control. |
| **Colonizing** | 5 | Empty systems cost 1 fewer population to conquer, minimum 1. |
| **Cybernetic** | 3 | Once per turn when one of your systems is conquered, return the casualty token to your hand instead of removing it. |
| **Defensive** | 4 | Every active system containing at least two of your population has +1 defense. |
| **Diplomatic** | 4 | During scoring, gain +1 Influence for each different opponent adjacent to your active empire, maximum +2. |
| **Fortress-Building** | 2 | After redeploying, place one Starbase in an active system, maximum three. Each adds +1 defense. |
| **Hive-Linked** | 3 | An active system adjacent to at least two other active systems you control has +1 defense. |
| **Industrious** | 3 | Score +1 for each active three-planet system you control. |
| **Mercantile** | 4 | Score +1 if you control systems containing at least three different planet types, or +2 for at least five types. |
| **Nomadic** | 3 | Your first conquest each turn may enter through any Rim Gate even while you control other systems. |
| **Parasitic** | 3 | Gain +1 Influence the first time each turn you remove an active enemy casualty. |
| **Psionic** | 3 | Once per turn, one opposing active population does not add to a system's conquest cost. |
| **Quantum** | 2 | Once per turn, conquer a system anywhere on the map that contains a planet type also present in the system from which you launch the conquest. Pay the normal cost. |
| **Replicating** | 2 | After your third successful conquest in one turn, add one population from the supply to the last system conquered. |
| **Ruthless** | 4 | A conquest that would normally cost 4 or more population costs 1 fewer, minimum 3. |
| **Scouting** | 4 | Once per turn, leap over one adjacent system along two connected hyperlanes and attack the system beyond it. Wormholes cannot be used for this leap. |
| **Stealth** | 4 | Ignore one Starbase or one Hazard modifier during each conquest. |
| **Wormhole-Savvy** | 3 | The first conquest made through a wormhole each turn costs 1 fewer population, minimum 1. During redeployment, one population may move through a wormhole into an active system you control. |

## 9. Prototype star map

The map uses 30 systems organized into an outer rim, a middle ring, an inner ring, and the central Blue Silence system. Solid lines are hyperlanes. Three wormholes create long-distance adjacency:

- Cinderwake (CW) to Ossuary (OS)
- Pelagos (PL) to Meridian (MR)
- Zephyr Crown (ZC) to Sable Rift (SR)

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
| HD | Halcyon Deep | Ocean, Gas Giant | None |
| RC | Red Choir | Volcanic, Volcanic | None |
| SV | Silica Verge | Barren, Terran | None |
| AG | Aurora Gate | Ice, Gas Giant, Terran | None |
| TA | Tethys Arc | Ocean, Ice | None |
| FH | Forgeheart | Volcanic, Barren, Gas Giant | Hazard, Relic |
| GW | Greenwake | Terran, Ocean | None |
| JL | Jove's Lantern | Gas Giant, Gas Giant | None |
| PA | Pale Anchor | Ice, Barren | None |
| AB | Ashen Bloom | Volcanic, Terran | None |
| CS | Cloudspire | Gas Giant, Terran, Ocean | None |
| KD | Kestrel Dust | Barren, Barren | None |
| CY | Cryos | Ice, Ice, Ocean | None |
| SO | Solace | Terran | None |
| CN | Crown Nexus | Terran, Gas Giant, Barren | Relic |
| OV | Orphean Vault | Barren, Ice | Hazard, Relic |
| RM | Radiant Maw | Volcanic, Gas Giant | Relic |
| BS | Blue Silence | Ocean, Terran | Relic |

### Hyperlane topology

The outer 12 systems form a complete ring in this order:

> AR - CW - PL - ZC - NB - VG - OS - EF - FM - MR - BL - SR - AR

The middle 12 systems form a complete ring in this order:

> HD - RC - SV - AG - TA - FH - GW - JL - PA - AB - CS - KD - HD

Outer-to-middle connections:

- AR-HD, AR-RC
- CW-RC, CW-SV
- PL-SV, PL-AG
- ZC-AG
- NB-TA
- VG-TA, VG-FH
- OS-FH, OS-GW
- EF-GW, EF-JL
- FM-JL, FM-PA
- MR-PA, MR-AB
- BL-AB, BL-CS
- SR-CS, SR-KD

Middle-to-inner connections:

- HD-CY, RC-CY, KD-CY
- SV-SO, AG-SO
- TA-CN, FH-CN
- GW-OV, JL-OV
- PA-RM, AB-RM, CS-RM

The inner ring is:

> CY - SO - CN - OV - RM - CY

Blue Silence connects to all five inner systems: CY, SO, CN, OV, and RM.

## 10. Balance assumptions for the first test

These values are starting hypotheses, not final balance.

- A healthy active civilization should begin with roughly 9-12 population.
- A civilization should usually conquer 3-5 systems on its launch turn.
- A strong scoring turn should produce roughly 8-13 Influence.
- Most civilizations should feel ready to Collapse after 2-4 Expand turns.
- Habitat bonuses should represent roughly one-third to one-half of active scoring.
- Remnants should remain relevant but fragile. They score systems but normally receive no habitat bonus.
- A powerful Trait should provide fewer population. A narrow Trait should provide more.
- A combination that is skipped twice should become attractive because of the Influence placed on it.

## 11. First playtest script

Use four players and nine rounds. Do not change rules during the first complete game unless the game becomes impossible to continue. Record issues and adjust afterward.

Track these questions:

1. How many systems does a civilization capture on its launch turn?
2. How many Expand turns occur before Collapse?
3. Is +1 Influence for every favored-habitat system too generous?
4. Do three-planet systems become disproportionately valuable?
5. Are wormholes used often enough to matter?
6. Do wormholes create surprise attacks without making defense meaningless?
7. Do Remnant abilities remain understandable when several are on the board?
8. Does any Species-Trait combination create a conquest discount below the intended minimum?
9. Are players choosing later civilization combinations and paying the skip cost?
10. Does the game end while players still want one more round?

### Metrics worth recording

For every civilization, note:

- Species and Trait combination
- Starting population
- Systems captured on launch
- Total turns active
- Influence earned while active
- Influence earned as Remnants
- Reason the player chose to Collapse

## 12. Likely adjustments after testing

If scoring is too high, test one of these changes at a time:

- A favored habitat awards +1 for every two matching systems rather than every matching system.
- Only the first four favored-habitat systems score their bonus.
- Three-planet systems have +1 inherent defense.

If players remain active too long:

- Increase the empty-system conquest cost from 2 to 3 in the inner ring.
- Award +2 Influence when launching a new civilization.
- Reduce average Species population by one.

If players Collapse too quickly:

- Let players recover one removed population at the start of each Expand turn.
- Increase Trait population values by one.
- Let an active empire score +2 for Blue Silence.

If Remnants dominate scoring:

- Remnants score 1 Influence for every two systems instead of every system.
- A player may score only their five most valuable Remnant systems.
- Remove defensive Remnant bonuses after the Remnant's first complete round.

## 13. Scope guardrails

Do not add these until the central loop is fun:

- Fleet movement as a separate subsystem
- Technology trees
- Resource production
- Diplomacy agreements
- Hidden objectives
- Event decks
- Individual planet occupation
- Dice-based combat
- Ship miniatures with different statistics

Those could all become expansion ideas, but the first prototype is about expansion, habitat, collapse, and rebirth.

## 14. Commercial-development note

The prototype deliberately uses original terminology, setting, map structure, species, abilities, and rule text. Before commercial publication, the game should continue moving beyond its inspiration through its multi-planet habitat system, wormhole topology, two-state Species cards, and persistent Remnant abilities. A tabletop-game attorney should review the finished title, presentation, card structure, iconography, and overall trade dress before release.

