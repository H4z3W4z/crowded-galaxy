# Crowded Galaxy

Fast area-control strategy game — civilization cycling, asymmetric powers,
and empires that die into persistent Remnants. Web first, iOS/iPad later.

## Where to start

| File | What it is |
| --- | --- |
| `crowded-galaxy-tech-design-v0.1.md` | Technical design doc — stack, architecture, milestones. **Implementers start here.** |
| `Background/crowded-galaxy-prototype-v0.2.md` | Current game rules (v0.2, Small World-aligned) |
| `Background/crowded-galaxy-prototype-v0.1.md` | Original design for historical reference |
| `data/species.yaml` | Canonical card data — 12 species |
| `data/traits.yaml` | Canonical card data — 20 traits (random special powers) |
| `data/map.yaml` | Canonical map — 30 systems, hyperlanes, wormholes, neutral seeding, board coordinates |

The YAML files are the single source of truth for cards and map; tables in
the design docs are summaries. Balance changes are YAML edits.

## Status

Design phase complete through v0.2. Next: **M0 — headless rules engine**
(see the tech design doc's milestone plan).
