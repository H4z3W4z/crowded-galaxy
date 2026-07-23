// Generates data/map.yaml as a 4-arm spiral galaxy: a dense contested core plus
// four spiral arms whose tips are sparse (degree 2) frontier entry points.
// Geometry is computed; planets/tags are authored below for balance control.
// Run: node scripts/gen-spiral-map.mjs
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const CX = 500, CY = 500;
const rad = (deg) => (deg * Math.PI) / 180;
const at = (angleDeg, r) => ({ x: Math.round(CX + Math.cos(rad(angleDeg)) * r), y: Math.round(CY + Math.sin(rad(angleDeg)) * r) });

// --- System definitions. ring is distance-from-core (core/inner/middle/outer). ---
// Core: Blue Silence at the center + a 5-node ring (one node, OV, has no arm).
const core = {
  BS: { name: "Blue Silence", planets: ["ocean", "terran"], relic: true, neutrals: 2, pos: { x: CX, y: CY } },
  CN: { name: "Crown Nexus", planets: ["terran", "gas_giant", "barren"], relic: true, neutrals: 2, angle: 90 },
  RM: { name: "Radiant Maw", planets: ["volcanic", "gas_giant"], relic: true, neutrals: 2, angle: 162 },
  CY: { name: "Cryos", planets: ["ice", "ice", "ocean"], neutrals: 2, angle: 234 },
  SO: { name: "Solace", planets: ["terran", "barren"], neutrals: 1, angle: 306 },
  OV: { name: "Orphean Vault", planets: ["barren", "ice"], hazard: true, relic: true, neutrals: 2, angle: 18 },
};
const CORE_RING_R = 108;

// Four arms, inner (j0) -> tip (j5). rimGate on the outer frontier (j4,j5).
const arms = [
  { core: "CN", codes: [
    { c: "HD", name: "Halcyon Deep", planets: ["ocean", "gas_giant"], neutrals: 1 },
    { c: "RC", name: "Red Choir", planets: ["volcanic", "volcanic"], neutrals: 1 },
    { c: "SV", name: "Silica Verge", planets: ["barren", "terran"], hazard: true, neutrals: 1 },
    { c: "AR", name: "Altair Reach", planets: ["terran", "barren"], neutrals: 0 },
    { c: "CW", name: "Cinderwake", planets: ["volcanic"], rimGate: true, neutrals: 0 },
    { c: "PL", name: "Pelagos", planets: ["ocean", "ocean", "ice"], rimGate: true, neutrals: 0 },
  ] },
  { core: "RM", codes: [
    { c: "AG", name: "Aurora Gate", planets: ["ice", "gas_giant", "terran"], neutrals: 1 },
    { c: "TA", name: "Tethys Arc", planets: ["ocean", "ice"], neutrals: 1 },
    { c: "FH", name: "Forgeheart", planets: ["volcanic", "barren", "gas_giant"], hazard: true, neutrals: 1 },
    { c: "ZC", name: "Zephyr Crown", planets: ["gas_giant", "barren"], neutrals: 0 },
    { c: "NB", name: "Nacre Belt", planets: ["barren", "ice"], rimGate: true, neutrals: 0 },
    { c: "VG", name: "Viridian Gate", planets: ["terran", "ocean"], rimGate: true, neutrals: 0 },
  ] },
  { core: "CY", codes: [
    { c: "GW", name: "Greenwake", planets: ["terran", "ocean"], neutrals: 1 },
    { c: "JL", name: "Jove's Lantern", planets: ["gas_giant", "gas_giant"], neutrals: 1 },
    { c: "PA", name: "Pale Anchor", planets: ["ice", "barren"], neutrals: 1 },
    { c: "OS", name: "Ossuary", planets: ["barren", "volcanic"], hazard: true, neutrals: 0 },
    { c: "EF", name: "Emberfall", planets: ["volcanic", "gas_giant"], rimGate: true, neutrals: 0 },
    { c: "FM", name: "Frostmere", planets: ["ice", "ocean"], rimGate: true, neutrals: 0 },
  ] },
  { core: "SO", codes: [
    { c: "AB", name: "Ashen Bloom", planets: ["volcanic", "terran"], neutrals: 1 },
    { c: "CS", name: "Cloudspire", planets: ["gas_giant", "terran", "ocean"], neutrals: 1 },
    { c: "KD", name: "Kestrel Dust", planets: ["barren", "barren"], hazard: true, neutrals: 1 },
    { c: "MR", name: "Meridian", planets: ["terran", "barren", "ocean"], neutrals: 0 },
    { c: "BL", name: "Bellows", planets: ["gas_giant", "volcanic"], rimGate: true, neutrals: 0 },
    { c: "SR", name: "Sable Rift", planets: ["barren", "ice"], rimGate: true, neutrals: 0 },
  ] },
];

const ARM_R0 = 152, ARM_STEP = 58, ARM_CURL = 17; // spiral: radius grows, angle curls per step
const ringOf = (j) => (j <= 1 ? "inner" : j <= 3 ? "middle" : "outer");

const systems = [];
const lanes = [];

// Core.
systems.push({ code: "BS", ...core.BS, ring: "core" });
for (const code of ["CN", "RM", "CY", "SO", "OV"]) {
  const d = core[code];
  systems.push({ code, name: d.name, planets: d.planets, relic: d.relic, hazard: d.hazard, neutrals: d.neutrals, ring: "core", pos: at(d.angle, CORE_RING_R) });
  lanes.push(["BS", code]); // spokes
}
// Core ring (ordered by angle for a clean pentagon): CN90 RM162 CY234 SO306 OV18
const ringOrder = ["OV", "CN", "RM", "CY", "SO"]; // 18,90,162,234,306
for (let i = 0; i < ringOrder.length; i++) lanes.push([ringOrder[i], ringOrder[(i + 1) % ringOrder.length]]);

// Arms.
for (const arm of arms) {
  const baseAngle = core[arm.core].angle;
  let prev = arm.core;
  arm.codes.forEach((s, j) => {
    const pos = at(baseAngle + ARM_CURL * (j + 1), ARM_R0 + j * ARM_STEP);
    systems.push({ code: s.c, name: s.name, planets: s.planets, rimGate: s.rimGate, hazard: s.hazard, relic: s.relic, neutrals: s.neutrals, ring: ringOf(j), pos });
    lanes.push([prev, s.c]); // spine (j0 attaches to its core node)
    prev = s.c;
  });
}

// Wormholes: bridge distant arm tips + one mid-arm shortcut across the core.
const wormholes = [
  ["PL", "FM"], // arm0 tip <-> arm2 tip
  ["VG", "SR"], // arm1 tip <-> arm3 tip
  ["AR", "OS"], // arm0 mid <-> arm2 mid (a core bypass)
];

// --- Emit YAML ---
const q = (s) => (/[':]/.test(s) ? JSON.stringify(s) : s);
let out = `# Crowded Galaxy — Star map (canonical map data)
# 4-arm SPIRAL GALAXY: dense contested core + four spiral arms. Arm tips are
# sparse frontier entry points (degree 2). GENERATED by scripts/gen-spiral-map.mjs.
# Edit that generator, not this file. Positions computed; planets/tags authored.

schema: crowded-galaxy-map/1
version: 0.3

config:
  canvas: { width: 1000, height: 1000 }
  layout: spiral-4arm
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
  out += `  - code: ${s.code}\n    name: ${q(s.name)}\n    ring: ${s.ring}\n    planets: [${s.planets.join(", ")}]\n`;
  for (const t of tags) out += `    ${t}\n`;
  out += `    neutrals: ${s.neutrals ?? 0}\n    position: { x: ${s.pos.x}, y: ${s.pos.y} }\n`;
}
out += `\nwormholes:\n`;
for (const [a, b] of wormholes) out += `  - [${a}, ${b}]\n`;
out += `\nhyperlanes:\n`;
for (const [a, b] of lanes) out += `  - [${a}, ${b}]\n`;

writeFileSync(join(root, "data/map.yaml"), out);
console.log(`wrote data/map.yaml — ${systems.length} systems, ${lanes.length} hyperlanes, ${wormholes.length} wormholes`);
