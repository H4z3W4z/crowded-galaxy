// GENERATED FILE — do not edit. Source: data/*.yaml. Regenerate with `pnpm gen`.

import type { PlanetType } from "../types.js";

export interface SystemDef {
  code: string; name: string; ring: "outer" | "middle" | "inner" | "core";
  planets: PlanetType[]; rimGate: boolean; hazard: boolean; relic: boolean;
  neutrals: number; x: number; y: number;
}

export const SYSTEMS: Record<string, SystemDef> = {
  "BS": {
    "code": "BS",
    "name": "Blue Silence",
    "ring": "core",
    "planets": [
      "ocean",
      "terran"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": true,
    "neutrals": 2,
    "x": 500,
    "y": 500
  },
  "CN": {
    "code": "CN",
    "name": "Crown Nexus",
    "ring": "core",
    "planets": [
      "terran",
      "gas_giant",
      "barren"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": true,
    "neutrals": 2,
    "x": 500,
    "y": 608
  },
  "RM": {
    "code": "RM",
    "name": "Radiant Maw",
    "ring": "core",
    "planets": [
      "volcanic",
      "gas_giant"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": true,
    "neutrals": 2,
    "x": 397,
    "y": 533
  },
  "CY": {
    "code": "CY",
    "name": "Cryos",
    "ring": "core",
    "planets": [
      "ice",
      "ice",
      "ocean"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 2,
    "x": 437,
    "y": 413
  },
  "SO": {
    "code": "SO",
    "name": "Solace",
    "ring": "core",
    "planets": [
      "terran",
      "barren"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 1,
    "x": 563,
    "y": 413
  },
  "OV": {
    "code": "OV",
    "name": "Orphean Vault",
    "ring": "core",
    "planets": [
      "barren",
      "ice"
    ],
    "rimGate": false,
    "hazard": true,
    "relic": true,
    "neutrals": 2,
    "x": 603,
    "y": 533
  },
  "HD": {
    "code": "HD",
    "name": "Halcyon Deep",
    "ring": "inner",
    "planets": [
      "ocean",
      "gas_giant"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 1,
    "x": 456,
    "y": 645
  },
  "RC": {
    "code": "RC",
    "name": "Red Choir",
    "ring": "inner",
    "planets": [
      "volcanic",
      "volcanic"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 1,
    "x": 383,
    "y": 674
  },
  "SV": {
    "code": "SV",
    "name": "Silica Verge",
    "ring": "middle",
    "planets": [
      "barren",
      "terran"
    ],
    "rimGate": false,
    "hazard": true,
    "relic": false,
    "neutrals": 1,
    "x": 292,
    "y": 669
  },
  "AR": {
    "code": "AR",
    "name": "Altair Reach",
    "ring": "middle",
    "planets": [
      "terran",
      "barren"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 0,
    "x": 198,
    "y": 622
  },
  "CW": {
    "code": "CW",
    "name": "Cinderwake",
    "ring": "outer",
    "planets": [
      "volcanic"
    ],
    "rimGate": true,
    "hazard": false,
    "relic": false,
    "neutrals": 0,
    "x": 117,
    "y": 533
  },
  "PL": {
    "code": "PL",
    "name": "Pelagos",
    "ring": "outer",
    "planets": [
      "ocean",
      "ocean",
      "ice"
    ],
    "rimGate": true,
    "hazard": false,
    "relic": false,
    "neutrals": 0,
    "x": 68,
    "y": 408
  },
  "AG": {
    "code": "AG",
    "name": "Aurora Gate",
    "ring": "inner",
    "planets": [
      "ice",
      "gas_giant",
      "terran"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 1,
    "x": 348,
    "y": 503
  },
  "TA": {
    "code": "TA",
    "name": "Tethys Arc",
    "ring": "inner",
    "planets": [
      "ocean",
      "ice"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 1,
    "x": 298,
    "y": 442
  },
  "FH": {
    "code": "FH",
    "name": "Forgeheart",
    "ring": "middle",
    "planets": [
      "volcanic",
      "barren",
      "gas_giant"
    ],
    "rimGate": false,
    "hazard": true,
    "relic": false,
    "neutrals": 1,
    "x": 275,
    "y": 354
  },
  "ZC": {
    "code": "ZC",
    "name": "Zephyr Crown",
    "ring": "middle",
    "planets": [
      "gas_giant",
      "barren"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 0,
    "x": 290,
    "y": 250
  },
  "NB": {
    "code": "NB",
    "name": "Nacre Belt",
    "ring": "outer",
    "planets": [
      "barren",
      "ice"
    ],
    "rimGate": true,
    "hazard": false,
    "relic": false,
    "neutrals": 0,
    "x": 350,
    "y": 147
  },
  "VG": {
    "code": "VG",
    "name": "Viridian Gate",
    "ring": "outer",
    "planets": [
      "terran",
      "ocean"
    ],
    "rimGate": true,
    "hazard": false,
    "relic": false,
    "neutrals": 0,
    "x": 454,
    "y": 60
  },
  "GW": {
    "code": "GW",
    "name": "Greenwake",
    "ring": "inner",
    "planets": [
      "terran",
      "ocean"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 1,
    "x": 451,
    "y": 356
  },
  "JL": {
    "code": "JL",
    "name": "Jove's Lantern",
    "ring": "inner",
    "planets": [
      "gas_giant",
      "gas_giant"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 1,
    "x": 493,
    "y": 290
  },
  "PA": {
    "code": "PA",
    "name": "Pale Anchor",
    "ring": "middle",
    "planets": [
      "ice",
      "barren"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 1,
    "x": 569,
    "y": 241
  },
  "OS": {
    "code": "OS",
    "name": "Ossuary",
    "ring": "middle",
    "planets": [
      "barren",
      "volcanic"
    ],
    "rimGate": false,
    "hazard": true,
    "relic": false,
    "neutrals": 0,
    "x": 673,
    "y": 224
  },
  "EF": {
    "code": "EF",
    "name": "Emberfall",
    "ring": "outer",
    "planets": [
      "volcanic",
      "gas_giant"
    ],
    "rimGate": true,
    "hazard": false,
    "relic": false,
    "neutrals": 0,
    "x": 790,
    "y": 248
  },
  "FM": {
    "code": "FM",
    "name": "Frostmere",
    "ring": "outer",
    "planets": [
      "ice",
      "ocean"
    ],
    "rimGate": true,
    "hazard": false,
    "relic": false,
    "neutrals": 0,
    "x": 904,
    "y": 320
  },
  "AB": {
    "code": "AB",
    "name": "Ashen Bloom",
    "ring": "inner",
    "planets": [
      "volcanic",
      "terran"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 1,
    "x": 621,
    "y": 409
  },
  "CS": {
    "code": "CS",
    "name": "Cloudspire",
    "ring": "inner",
    "planets": [
      "gas_giant",
      "terran",
      "ocean"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 1,
    "x": 697,
    "y": 428
  },
  "KD": {
    "code": "KD",
    "name": "Kestrel Dust",
    "ring": "middle",
    "planets": [
      "barren",
      "barren"
    ],
    "rimGate": false,
    "hazard": true,
    "relic": false,
    "neutrals": 1,
    "x": 768,
    "y": 486
  },
  "MR": {
    "code": "MR",
    "name": "Meridian",
    "ring": "middle",
    "planets": [
      "terran",
      "barren",
      "ocean"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 0,
    "x": 816,
    "y": 579
  },
  "BL": {
    "code": "BL",
    "name": "Bellows",
    "ring": "outer",
    "planets": [
      "gas_giant",
      "volcanic"
    ],
    "rimGate": true,
    "hazard": false,
    "relic": false,
    "neutrals": 0,
    "x": 829,
    "y": 698
  },
  "SR": {
    "code": "SR",
    "name": "Sable Rift",
    "ring": "outer",
    "planets": [
      "barren",
      "ice"
    ],
    "rimGate": true,
    "hazard": false,
    "relic": false,
    "neutrals": 0,
    "x": 796,
    "y": 828
  }
} as const;
export const LANES: [string, string][] = [["BS","CN"],["BS","RM"],["BS","CY"],["BS","SO"],["BS","OV"],["OV","CN"],["CN","RM"],["RM","CY"],["CY","SO"],["SO","OV"],["CN","HD"],["HD","RC"],["RC","SV"],["SV","AR"],["AR","CW"],["CW","PL"],["RM","AG"],["AG","TA"],["TA","FH"],["FH","ZC"],["ZC","NB"],["NB","VG"],["CY","GW"],["GW","JL"],["JL","PA"],["PA","OS"],["OS","EF"],["EF","FM"],["SO","AB"],["AB","CS"],["CS","KD"],["KD","MR"],["MR","BL"],["BL","SR"]];
export const WORMHOLES: [string, string][] = [["PL","FM"],["VG","SR"],["AR","OS"]];
export const SYSTEM_IDS: string[] = ["BS","CN","RM","CY","SO","OV","HD","RC","SV","AR","CW","PL","AG","TA","FH","ZC","NB","VG","GW","JL","PA","OS","EF","FM","AB","CS","KD","MR","BL","SR"];
