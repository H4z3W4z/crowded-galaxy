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
    "y": 618
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
    "x": 388,
    "y": 536
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
    "x": 431,
    "y": 405
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
    "x": 569,
    "y": 405
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
    "x": 612,
    "y": 536
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
    "x": 448,
    "y": 693
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
    "x": 368,
    "y": 729
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
    "x": 268,
    "y": 732
  },
  "AR": {
    "code": "AR",
    "name": "Altair Reach",
    "ring": "middle",
    "planet": "terran",
    "planets": [
      "terran"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 0,
    "x": 161,
    "y": 696
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
    "x": 60,
    "y": 618
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
    "x": -20,
    "y": 500
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
    "x": 300,
    "y": 510
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
    "x": 242,
    "y": 445
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
    "x": 208,
    "y": 351
  },
  "ZC": {
    "code": "ZC",
    "name": "Zephyr Crown",
    "ring": "middle",
    "planet": "gas_giant",
    "planets": [
      "gas_giant"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 0,
    "x": 209,
    "y": 238
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
    "x": 252,
    "y": 118
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
    "x": 339,
    "y": 5
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
    "x": 428,
    "y": 313
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
    "x": 472,
    "y": 237
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
    "x": 551,
    "y": 176
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
    "neutrals": 0,
    "x": 659,
    "y": 142
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
    "x": 787,
    "y": 146
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
    "x": 921,
    "y": 194
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
    "x": 655,
    "y": 374
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
    "x": 741,
    "y": 393
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
    "x": 824,
    "y": 449
  },
  "MR": {
    "code": "MR",
    "name": "Meridian",
    "ring": "middle",
    "planet": "terran",
    "planets": [
      "terran"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 0,
    "x": 890,
    "y": 541
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
    "x": 926,
    "y": 663
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
    "x": 921,
    "y": 806
  }
} as const;
export const LANES: [string, string][] = [["BS","CN"],["BS","RM"],["BS","CY"],["BS","SO"],["BS","OV"],["OV","CN"],["CN","RM"],["RM","CY"],["CY","SO"],["SO","OV"],["CN","HD"],["HD","RC"],["RC","SV"],["SV","AR"],["AR","CW"],["CW","PL"],["RM","AG"],["AG","TA"],["TA","FH"],["FH","ZC"],["ZC","NB"],["NB","VG"],["CY","GW"],["GW","JL"],["JL","PA"],["PA","OS"],["OS","EF"],["EF","FM"],["SO","AB"],["AB","CS"],["CS","KD"],["KD","MR"],["MR","BL"],["BL","SR"],["HD","AG"],["AG","GW"],["GW","AB"],["AB","OV"]];
export const WORMHOLES: [string, string][] = [["PL","FM"],["VG","SR"],["AR","OS"]];
export const SYSTEM_IDS: string[] = ["BS","CN","RM","CY","SO","OV","HD","RC","SV","AR","CW","PL","AG","TA","FH","ZC","NB","VG","GW","JL","PA","OS","EF","FM","AB","CS","KD","MR","BL","SR"];
