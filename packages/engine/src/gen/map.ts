// GENERATED FILE — do not edit. Source: data/*.yaml. Regenerate with `pnpm gen`.

import type { PlanetType } from "../types.js";

export interface SystemDef {
  code: string; name: string; ring: "outer" | "middle" | "inner" | "core";
  planets: PlanetType[]; rimGate: boolean; hazard: boolean; relic: boolean;
  neutrals: number; x: number; y: number;
}

export const SYSTEMS: Record<string, SystemDef> = {
  "AR": {
    "code": "AR",
    "name": "Altair Reach",
    "ring": "outer",
    "planets": [
      "terran",
      "barren"
    ],
    "rimGate": true,
    "hazard": false,
    "relic": false,
    "neutrals": 0,
    "x": 500,
    "y": 70
  },
  "CW": {
    "code": "CW",
    "name": "Cinderwake",
    "ring": "outer",
    "planets": [
      "volcanic"
    ],
    "rimGate": true,
    "hazard": true,
    "relic": false,
    "neutrals": 0,
    "x": 715,
    "y": 128
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
    "x": 872,
    "y": 285
  },
  "ZC": {
    "code": "ZC",
    "name": "Zephyr Crown",
    "ring": "outer",
    "planets": [
      "gas_giant",
      "barren"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 0,
    "x": 930,
    "y": 500
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
    "x": 872,
    "y": 715
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
    "x": 715,
    "y": 872
  },
  "OS": {
    "code": "OS",
    "name": "Ossuary",
    "ring": "outer",
    "planets": [
      "barren",
      "volcanic"
    ],
    "rimGate": false,
    "hazard": true,
    "relic": false,
    "neutrals": 0,
    "x": 500,
    "y": 930
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
    "x": 285,
    "y": 872
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
    "x": 128,
    "y": 715
  },
  "MR": {
    "code": "MR",
    "name": "Meridian",
    "ring": "outer",
    "planets": [
      "terran",
      "barren",
      "ocean"
    ],
    "rimGate": true,
    "hazard": false,
    "relic": false,
    "neutrals": 0,
    "x": 70,
    "y": 500
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
    "x": 128,
    "y": 285
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
    "hazard": true,
    "relic": false,
    "neutrals": 0,
    "x": 285,
    "y": 128
  },
  "HD": {
    "code": "HD",
    "name": "Halcyon Deep",
    "ring": "middle",
    "planets": [
      "ocean",
      "gas_giant"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 1,
    "x": 425,
    "y": 220
  },
  "RC": {
    "code": "RC",
    "name": "Red Choir",
    "ring": "middle",
    "planets": [
      "volcanic",
      "volcanic"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 1,
    "x": 575,
    "y": 220
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
    "hazard": false,
    "relic": false,
    "neutrals": 1,
    "x": 705,
    "y": 295
  },
  "AG": {
    "code": "AG",
    "name": "Aurora Gate",
    "ring": "middle",
    "planets": [
      "ice",
      "gas_giant",
      "terran"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 1,
    "x": 780,
    "y": 425
  },
  "TA": {
    "code": "TA",
    "name": "Tethys Arc",
    "ring": "middle",
    "planets": [
      "ocean",
      "ice"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 1,
    "x": 780,
    "y": 575
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
    "relic": true,
    "neutrals": 1,
    "x": 705,
    "y": 705
  },
  "GW": {
    "code": "GW",
    "name": "Greenwake",
    "ring": "middle",
    "planets": [
      "terran",
      "ocean"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 1,
    "x": 575,
    "y": 780
  },
  "JL": {
    "code": "JL",
    "name": "Jove's Lantern",
    "ring": "middle",
    "planets": [
      "gas_giant",
      "gas_giant"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 1,
    "x": 425,
    "y": 780
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
    "x": 295,
    "y": 705
  },
  "AB": {
    "code": "AB",
    "name": "Ashen Bloom",
    "ring": "middle",
    "planets": [
      "volcanic",
      "terran"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 1,
    "x": 220,
    "y": 575
  },
  "CS": {
    "code": "CS",
    "name": "Cloudspire",
    "ring": "middle",
    "planets": [
      "gas_giant",
      "terran",
      "ocean"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 1,
    "x": 220,
    "y": 425
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
    "hazard": false,
    "relic": false,
    "neutrals": 1,
    "x": 295,
    "y": 295
  },
  "CY": {
    "code": "CY",
    "name": "Cryos",
    "ring": "inner",
    "planets": [
      "ice",
      "ice",
      "ocean"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 1,
    "x": 460,
    "y": 350
  },
  "SO": {
    "code": "SO",
    "name": "Solace",
    "ring": "inner",
    "planets": [
      "terran"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": false,
    "neutrals": 1,
    "x": 634,
    "y": 422
  },
  "CN": {
    "code": "CN",
    "name": "Crown Nexus",
    "ring": "inner",
    "planets": [
      "terran",
      "gas_giant",
      "barren"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": true,
    "neutrals": 1,
    "x": 634,
    "y": 578
  },
  "OV": {
    "code": "OV",
    "name": "Orphean Vault",
    "ring": "inner",
    "planets": [
      "barren",
      "ice"
    ],
    "rimGate": false,
    "hazard": true,
    "relic": true,
    "neutrals": 1,
    "x": 500,
    "y": 655
  },
  "RM": {
    "code": "RM",
    "name": "Radiant Maw",
    "ring": "inner",
    "planets": [
      "volcanic",
      "gas_giant"
    ],
    "rimGate": false,
    "hazard": false,
    "relic": true,
    "neutrals": 1,
    "x": 350,
    "y": 540
  },
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
  }
} as const;
export const LANES: [string, string][] = [["AR","CW"],["CW","PL"],["PL","ZC"],["ZC","NB"],["NB","VG"],["VG","OS"],["OS","EF"],["EF","FM"],["FM","MR"],["MR","BL"],["BL","SR"],["SR","AR"],["HD","RC"],["RC","SV"],["SV","AG"],["AG","TA"],["TA","FH"],["FH","GW"],["GW","JL"],["JL","PA"],["PA","AB"],["AB","CS"],["CS","KD"],["KD","HD"],["AR","HD"],["AR","RC"],["CW","RC"],["CW","SV"],["PL","SV"],["PL","AG"],["ZC","AG"],["NB","TA"],["VG","TA"],["VG","FH"],["OS","FH"],["OS","GW"],["EF","GW"],["EF","JL"],["FM","JL"],["FM","PA"],["MR","PA"],["MR","AB"],["BL","AB"],["BL","CS"],["SR","CS"],["SR","KD"],["HD","CY"],["RC","CY"],["KD","CY"],["SV","SO"],["AG","SO"],["TA","CN"],["FH","CN"],["GW","OV"],["JL","OV"],["PA","RM"],["AB","RM"],["CS","RM"],["CY","SO"],["SO","CN"],["CN","OV"],["OV","RM"],["RM","CY"],["BS","CY"],["BS","SO"],["BS","CN"],["BS","OV"],["BS","RM"]];
export const WORMHOLES: [string, string][] = [["CW","OS"],["PL","MR"],["ZC","SR"]];
export const SYSTEM_IDS: string[] = ["AR","CW","PL","ZC","NB","VG","OS","EF","FM","MR","BL","SR","HD","RC","SV","AG","TA","FH","GW","JL","PA","AB","CS","KD","CY","SO","CN","OV","RM","BS"];
