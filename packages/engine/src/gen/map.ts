// GENERATED FILE — do not edit. Source: data/*.yaml. Regenerate with `pnpm gen`.

import type { PlanetType } from "../types.js";

export interface SystemDef {
  code: string; name: string; ring: "outer" | "middle" | "inner" | "core";
  planet: PlanetType; planets: PlanetType[]; rimGate: boolean; hazard: boolean; relic: boolean;
  neutrals: number; x: number; y: number;
}

export const SYSTEMS: Record<string, SystemDef> = {
  "BS": {
    "code": "BS",
    "name": "Blue Silence",
    "ring": "core",
    "planet": "ocean",
    "planets": [
      "ocean"
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
    "planet": "terran",
    "planets": [
      "terran"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": true,
    "neutrals": 2,
    "x": 500,
    "y": 622
  },
  "RM": {
    "code": "RM",
    "name": "Radiant Maw",
    "ring": "core",
    "planet": "volcanic",
    "planets": [
      "volcanic"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": true,
    "neutrals": 2,
    "x": 384,
    "y": 538
  },
  "CY": {
    "code": "CY",
    "name": "Cryos",
    "ring": "core",
    "planet": "ice",
    "planets": [
      "ice"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 2,
    "x": 428,
    "y": 401
  },
  "SO": {
    "code": "SO",
    "name": "Solace",
    "ring": "core",
    "planet": "barren",
    "planets": [
      "barren"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 1,
    "x": 572,
    "y": 401
  },
  "OV": {
    "code": "OV",
    "name": "Orphean Vault",
    "ring": "core",
    "planet": "gas_giant",
    "planets": [
      "gas_giant"
    ],
    "rimGate": false,
    "hazard": true,
    "relic": true,
    "neutrals": 2,
    "x": 616,
    "y": 538
  },
  "HD": {
    "code": "HD",
    "name": "Halcyon Deep",
    "ring": "inner",
    "planet": "ocean",
    "planets": [
      "ocean"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 1,
    "x": 464,
    "y": 707
  },
  "RC": {
    "code": "RC",
    "name": "Red Choir",
    "ring": "inner",
    "planet": "volcanic",
    "planets": [
      "volcanic"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 1,
    "x": 402,
    "y": 769
  },
  "SV": {
    "code": "SV",
    "name": "Silica Verge",
    "ring": "middle",
    "planet": "barren",
    "planets": [
      "barren"
    ],
    "rimGate": false,
    "hazard": true,
    "relic": false,
    "neutrals": 1,
    "x": 319,
    "y": 814
  },
  "CW": {
    "code": "CW",
    "name": "Cinderwake",
    "ring": "outer",
    "planet": "volcanic",
    "planets": [
      "volcanic"
    ],
    "rimGate": true,
    "hazard": false,
    "relic": false,
    "neutrals": 0,
    "x": 218,
    "y": 836
  },
  "PL": {
    "code": "PL",
    "name": "Pelagos",
    "ring": "outer",
    "planet": "ocean",
    "planets": [
      "ocean"
    ],
    "rimGate": true,
    "hazard": false,
    "relic": false,
    "neutrals": 0,
    "x": 106,
    "y": 830
  },
  "AG": {
    "code": "AG",
    "name": "Aurora Gate",
    "ring": "inner",
    "planet": "ice",
    "planets": [
      "ice"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 1,
    "x": 292,
    "y": 529
  },
  "TA": {
    "code": "TA",
    "name": "Tethys Arc",
    "ring": "inner",
    "planet": "ocean",
    "planets": [
      "ocean"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 1,
    "x": 214,
    "y": 490
  },
  "FH": {
    "code": "FH",
    "name": "Forgeheart",
    "ring": "middle",
    "planet": "volcanic",
    "planets": [
      "volcanic"
    ],
    "rimGate": false,
    "hazard": true,
    "relic": false,
    "neutrals": 1,
    "x": 146,
    "y": 425
  },
  "NB": {
    "code": "NB",
    "name": "Nacre Belt",
    "ring": "outer",
    "planet": "ocean",
    "planets": [
      "ocean"
    ],
    "rimGate": true,
    "hazard": false,
    "relic": false,
    "neutrals": 0,
    "x": 94,
    "y": 336
  },
  "VG": {
    "code": "VG",
    "name": "Viridian Gate",
    "ring": "outer",
    "planet": "terran",
    "planets": [
      "terran"
    ],
    "rimGate": true,
    "hazard": false,
    "relic": false,
    "neutrals": 0,
    "x": 64,
    "y": 228
  },
  "GW": {
    "code": "GW",
    "name": "Greenwake",
    "ring": "inner",
    "planet": "terran",
    "planets": [
      "terran"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 1,
    "x": 408,
    "y": 311
  },
  "JL": {
    "code": "JL",
    "name": "Jove's Lantern",
    "ring": "inner",
    "planet": "gas_giant",
    "planets": [
      "gas_giant"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 1,
    "x": 421,
    "y": 225
  },
  "PA": {
    "code": "PA",
    "name": "Pale Anchor",
    "ring": "middle",
    "planet": "ice",
    "planets": [
      "ice"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 1,
    "x": 462,
    "y": 140
  },
  "EF": {
    "code": "EF",
    "name": "Emberfall",
    "ring": "outer",
    "planet": "volcanic",
    "planets": [
      "volcanic"
    ],
    "rimGate": true,
    "hazard": false,
    "relic": false,
    "neutrals": 0,
    "x": 531,
    "y": 63
  },
  "FM": {
    "code": "FM",
    "name": "Frostmere",
    "ring": "outer",
    "planet": "ice",
    "planets": [
      "ice"
    ],
    "rimGate": true,
    "hazard": false,
    "relic": false,
    "neutrals": 0,
    "x": 624,
    "y": 1
  },
  "AB": {
    "code": "AB",
    "name": "Ashen Bloom",
    "ring": "inner",
    "planet": "ice",
    "planets": [
      "ice"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 1,
    "x": 651,
    "y": 354
  },
  "CS": {
    "code": "CS",
    "name": "Cloudspire",
    "ring": "inner",
    "planet": "gas_giant",
    "planets": [
      "gas_giant"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 1,
    "x": 737,
    "y": 340
  },
  "KD": {
    "code": "KD",
    "name": "Kestrel Dust",
    "ring": "middle",
    "planet": "barren",
    "planets": [
      "barren"
    ],
    "rimGate": false,
    "hazard": true,
    "relic": false,
    "neutrals": 1,
    "x": 831,
    "y": 353
  },
  "BL": {
    "code": "BL",
    "name": "Bellows",
    "ring": "outer",
    "planet": "gas_giant",
    "planets": [
      "gas_giant"
    ],
    "rimGate": true,
    "hazard": false,
    "relic": false,
    "neutrals": 0,
    "x": 925,
    "y": 394
  },
  "SR": {
    "code": "SR",
    "name": "Sable Rift",
    "ring": "outer",
    "planet": "barren",
    "planets": [
      "barren"
    ],
    "rimGate": true,
    "hazard": false,
    "relic": false,
    "neutrals": 0,
    "x": 1013,
    "y": 464
  },
  "AR": {
    "code": "AR",
    "name": "Altair Reach",
    "ring": "inner",
    "planet": "terran",
    "planets": [
      "terran"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 1,
    "x": 685,
    "y": 599
  },
  "ZC": {
    "code": "ZC",
    "name": "Zephyr Crown",
    "ring": "inner",
    "planet": "gas_giant",
    "planets": [
      "gas_giant"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 1,
    "x": 725,
    "y": 676
  },
  "OS": {
    "code": "OS",
    "name": "Ossuary",
    "ring": "middle",
    "planet": "barren",
    "planets": [
      "barren"
    ],
    "rimGate": false,
    "hazard": true,
    "relic": false,
    "neutrals": 1,
    "x": 742,
    "y": 769
  },
  "MR": {
    "code": "MR",
    "name": "Meridian",
    "ring": "outer",
    "planet": "terran",
    "planets": [
      "terran"
    ],
    "rimGate": true,
    "hazard": false,
    "relic": false,
    "neutrals": 0,
    "x": 732,
    "y": 871
  },
  "WF": {
    "code": "WF",
    "name": "Wraithfall",
    "ring": "outer",
    "planet": "volcanic",
    "planets": [
      "volcanic"
    ],
    "rimGate": true,
    "hazard": false,
    "relic": false,
    "neutrals": 0,
    "x": 693,
    "y": 977
  }
} as const;
export const LANES: [string, string][] = [["BS","CN"],["BS","RM"],["BS","CY"],["BS","SO"],["BS","OV"],["OV","CN"],["CN","RM"],["RM","CY"],["CY","SO"],["SO","OV"],["CN","HD"],["HD","RC"],["RC","SV"],["SV","CW"],["CW","PL"],["RM","AG"],["AG","TA"],["TA","FH"],["FH","NB"],["NB","VG"],["CY","GW"],["GW","JL"],["JL","PA"],["PA","EF"],["EF","FM"],["SO","AB"],["AB","CS"],["CS","KD"],["KD","BL"],["BL","SR"],["OV","AR"],["AR","ZC"],["ZC","OS"],["OS","MR"],["MR","WF"],["HD","AG"],["AG","GW"],["GW","AB"],["AB","AR"],["AR","HD"]];
export const WORMHOLES: [string, string][] = [["PL","FM"],["VG","SR"],["WF","PA"]];
export const SYSTEM_IDS: string[] = ["BS","CN","RM","CY","SO","OV","HD","RC","SV","CW","PL","AG","TA","FH","NB","VG","GW","JL","PA","EF","FM","AB","CS","KD","BL","SR","AR","ZC","OS","MR","WF"];
