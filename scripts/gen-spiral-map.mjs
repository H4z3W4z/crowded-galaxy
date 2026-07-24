// Generates data/map.yaml as a 4-arm spiral galaxy. Each system is a SINGLE
// planet (Small World-style single-terrain regions), five of each of the six
// types. Geometry is computed; planet/tags are authored below for balance.
// Run: node scripts/gen-spiral-map.mjs
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const CX = 500, CY = 500;
const rad = (deg) => (deg * Math.PI) / 180;
const at = (angleDeg, r) => ({ x: Math.round(CX + Math.cos(rad(angleDeg)) * r), y: Math.round(CY + Math.sin(rad(angleDeg)) * r) });

// Spacing — bumped so the planet orbs (rendered ~50px) breathe, and so the
// second-ring lanes clear the core planets they pass.
const CORE_RING_R = 118;
const ARM_R0 = 200, ARM_STEP = 64, ARM_CURL = 15;

// Core: one planet each of the six types. Blue Silence at the center.
const core = {
  BS: { name: "Blue Silence", planet: "ocean", relic: true, neutrals: 2, pos: { x: CX, y: CY } },
  CN: { name: "Crown Nexus", planet: "terran", relic: true, neutrals: 2, angle: 90 },
  RM: { name: "Radiant Maw", planet: "volcanic", relic: true, neutrals: 2, angle: 162 },
  CY: { name: "Cryos", planet: "ice", neutrals: 2, angle: 234 },
  SO: { name: "Solace", planet: "barren", neutrals: 1, angle: 306 },
  OV: { name: "Orphean Vault", planet: "gas_giant", hazard: true, relic: true, neutrals: 2, angle: 18 },
};

// Four arms, inner (j0) -> tip (j5). rimGate on the outer frontier (j4,j5).
// Planet mix across the 24 arm systems is 4 of each type (+1 core each = 5 total).
const arms = [
  { core: "CN", codes: [
    { c: "HD", name: "Halcyon Deep", planet: "ocean", neutrals: 1 },
    { c: "RC", name: "Red Choir", planet: "volcanic", neutrals: 1 },
    { c: "SV", name: "Silica Verge", planet: "barren", hazard: true, neutrals: 1 },
    { c: "AR", name: "Altair Reach", planet: "terran", neutrals: 0 },
    { c: "CW", name: "Cinderwake", planet: "volcanic", rimGate: true, neutrals: 0 },
    { c: "PL", name: "Pelagos", planet: "ocean", rimGate: true, neutrals: 0 },
  ] },
  { core: "RM", codes: [
    { c: "AG", name: "Aurora Gate", planet: "ice", neutrals: 1 },
    { c: "TA", name: "Tethys Arc", planet: "ocean", neutrals: 1 },
    { c: "FH", name: "Forgeheart", planet: "volcanic", hazard: true, neutrals: 1 },
    { c: "ZC", name: "Zephyr Crown", planet: "gas_giant", neutrals: 0 },
    { c: "NB", name: "Nacre Belt", planet: "ocean", rimGate: true, neutrals: 0 },
    { c: "VG", name: "Viridian Gate", planet: "terran", rimGate: true, neutrals: 0 },
  ] },
  { core: "CY", codes: [
    { c: "GW", name: "Greenwake", planet: "terran", neutrals: 1 },
    { c: "JL", name: "Jove's Lantern", planet: "gas_giant", neutrals: 1 },
    { c: "PA", name: "Pale Anchor", planet: "ice", neutrals: 1 },
    { c: "OS", name: "Ossuary", planet: "barren", hazard: true, neutrals: 0 },
    { c: "EF", name: "Emberfall", planet: "volcanic", rimGate: true, neutrals: 0 },
    { c: "FM", name: "Frostmere", planet: "ice", rimGate: true, neutrals: 0 },
  ] },
  { core: "SO", codes: [
    { c: "AB", name: "Ashen Bloom", planet: "ice", neutrals: 1 },
    { c: "CS", name: "Cloudspire", planet: "gas_giant", neutrals: 1 },
    { c: "KD", name: "Kestrel Dust", planet: "barren", hazard: true, neutrals: 1 },
    { c: "MR", name: "Meridian", planet: "terran", neutrals: 0 },
    { c: "BL", name: "Bellows", planet: "gas_giant", rimGate: true, neutrals: 0 },
    { c: "SR", name: "Sable Rift", planet: "barren", rimGate: true, neutrals: 0 },
  ] },
];

const ringOf = (j) => (j <= 1 ? "inner" : j <= 3 ? "middle" : "outer");
const systems = [];
const lanes = [];

systems.push({ code: "BS", ...core.BS, ring: "core" });
for (const code of ["CN", "RM", "CY", "SO", "OV"]) {
  const d = core[code];
  systems.push({ code, name: d.name, planet: d.planet, relic: d.relic, hazard: d.hazard, neutrals: d.neutrals, ring: "core", pos: at(d.angle, CORE_RING_R) });
  lanes.push(["BS", code]);
}
const ringOrder = ["OV", "CN", "RM", "CY", "SO"]; // 18,90,162,234,306
for (let i = 0; i < ringOrder.length; i++) lanes.push([ringOrder[i], ringOrder[(i + 1) % ringOrder.length]]);

for (const arm of arms) {
  const baseAngle = core[arm.core].angle;
  let prev = arm.core;
  arm.codes.forEach((s, j) => {
    const pos = at(baseAngle + ARM_CURL * (j + 1), ARM_R0 + j * ARM_STEP);
    systems.push({ code: s.c, name: s.name, planet: s.planet, rimGate: s.rimGate, hazard: s.hazard, relic: s.relic, neutrals: s.neutrals, ring: ringOf(j), pos });
    lanes.push([prev, s.c]);
    prev = s.c;
  });
}

// Second ring: lateral lanes joining the inner-arm systems into a ring around
// the core, so the centre is a connected hub rather than four isolated spokes.
// The four arms occupy four of the five core-ring positions, so the ring closes
// through OV — the one core node without an arm — and its existing links.
const innerRing = arms.map((a) => a.codes[0].c); // HD, AG, GW, AB
for (let i = 0; i < innerRing.length - 1; i++) lanes.push([innerRing[i], innerRing[i + 1]]);
lanes.push([innerRing[innerRing.length - 1], "OV"]); // AB -> OV; OV-CN-HD closes it

const wormholes = [
  ["PL", "FM"],
  ["VG", "SR"],
  ["AR", "OS"],
];

const q = (s) => (/[':]/.test(s) ? JSON.stringify(s) : s);
let out = `# Crowded Galaxy — Star map (canonical map data)
# 4-arm SPIRAL GALAXY. Each system is a SINGLE planet (single-terrain regions,
# Small World style), five of each of the six types. GENERATED by
# scripts/gen-spiral-map.mjs — edit the generator, not this file.

schema: crowded-galaxy-map/2
version: 0.4

config:
  canvas: { width: 1000, height: 1000 }
  layout: spiral-4arm
  planets_per_system: 1
  neutral_seeding_note: >-
    Core is defended (2 neutrals each), inner/mid arm systems 1, frontier
    (rim gates) 0 so new civilizations enter cheaply and push inward.

systems:
`;
for (const s of systems) {
  const tags = [];
  if (s.rimGate) tags.push("rim_gate: true");
  if (s.hazard) tags.push("hazard: true");
  if (s.relic) tags.push("relic: true");
  out += `  - code: ${s.code}\n    name: ${q(s.name)}\n    ring: ${s.ring}\n    planet: ${s.planet}\n`;
  for (const t of tags) out += `    ${t}\n`;
  out += `    neutrals: ${s.neutrals ?? 0}\n    position: { x: ${s.pos.x}, y: ${s.pos.y} }\n`;
}
out += `\nwormholes:\n`;
for (const [a, b] of wormholes) out += `  - [${a}, ${b}]\n`;
out += `\nhyperlanes:\n`;
for (const [a, b] of lanes) out += `  - [${a}, ${b}]\n`;

writeFileSync(join(root, "data/map.yaml"), out);
console.log(`wrote data/map.yaml — ${systems.length} systems (single-planet), ${lanes.length} hyperlanes, ${wormholes.length} wormholes`);
