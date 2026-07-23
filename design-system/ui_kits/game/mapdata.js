// Canonical map (from data/map.yaml) exposed for UI kit screens.
window.CG_MAP = {
  systems: [
    { code: "AR", name: "Altair Reach", ring: "outer", planets: ["terran", "barren"], rim: true, x: 500, y: 70 },
    { code: "CW", name: "Cinderwake", ring: "outer", planets: ["volcanic"], rim: true, hazard: true, x: 715, y: 128 },
    { code: "PL", name: "Pelagos", ring: "outer", planets: ["ocean", "ocean", "ice"], rim: true, x: 872, y: 285 },
    { code: "ZC", name: "Zephyr Crown", ring: "outer", planets: ["gas_giant", "barren"], x: 930, y: 500 },
    { code: "NB", name: "Nacre Belt", ring: "outer", planets: ["barren", "ice"], rim: true, x: 872, y: 715 },
    { code: "VG", name: "Viridian Gate", ring: "outer", planets: ["terran", "ocean"], rim: true, x: 715, y: 872 },
    { code: "OS", name: "Ossuary", ring: "outer", planets: ["barren", "volcanic"], hazard: true, x: 500, y: 930 },
    { code: "EF", name: "Emberfall", ring: "outer", planets: ["volcanic", "gas_giant"], rim: true, x: 285, y: 872 },
    { code: "FM", name: "Frostmere", ring: "outer", planets: ["ice", "ocean"], rim: true, x: 128, y: 715 },
    { code: "MR", name: "Meridian", ring: "outer", planets: ["terran", "barren", "ocean"], rim: true, x: 70, y: 500 },
    { code: "BL", name: "Bellows", ring: "outer", planets: ["gas_giant", "volcanic"], rim: true, x: 128, y: 285 },
    { code: "SR", name: "Sable Rift", ring: "outer", planets: ["barren", "ice"], rim: true, hazard: true, x: 285, y: 128 },
    { code: "HD", name: "Halcyon Deep", ring: "middle", planets: ["ocean", "gas_giant"], neutrals: 1, x: 425, y: 220 },
    { code: "RC", name: "Red Choir", ring: "middle", planets: ["volcanic", "volcanic"], neutrals: 1, x: 575, y: 220 },
    { code: "SV", name: "Silica Verge", ring: "middle", planets: ["barren", "terran"], neutrals: 1, x: 705, y: 295 },
    { code: "AG", name: "Aurora Gate", ring: "middle", planets: ["ice", "gas_giant", "terran"], neutrals: 1, x: 780, y: 425 },
    { code: "TA", name: "Tethys Arc", ring: "middle", planets: ["ocean", "ice"], neutrals: 1, x: 780, y: 575 },
    { code: "FH", name: "Forgeheart", ring: "middle", planets: ["volcanic", "barren", "gas_giant"], hazard: true, relic: true, neutrals: 1, x: 705, y: 705 },
    { code: "GW", name: "Greenwake", ring: "middle", planets: ["terran", "ocean"], neutrals: 1, x: 575, y: 780 },
    { code: "JL", name: "Jove's Lantern", ring: "middle", planets: ["gas_giant", "gas_giant"], neutrals: 1, x: 425, y: 780 },
    { code: "PA", name: "Pale Anchor", ring: "middle", planets: ["ice", "barren"], neutrals: 1, x: 295, y: 705 },
    { code: "AB", name: "Ashen Bloom", ring: "middle", planets: ["volcanic", "terran"], neutrals: 1, x: 220, y: 575 },
    { code: "CS", name: "Cloudspire", ring: "middle", planets: ["gas_giant", "terran", "ocean"], neutrals: 1, x: 220, y: 425 },
    { code: "KD", name: "Kestrel Dust", ring: "middle", planets: ["barren", "barren"], neutrals: 1, x: 295, y: 295 },
    { code: "CY", name: "Cryos", ring: "inner", planets: ["ice", "ice", "ocean"], neutrals: 1, x: 460, y: 350 },
    { code: "SO", name: "Solace", ring: "inner", planets: ["terran"], neutrals: 1, x: 634, y: 422 },
    { code: "CN", name: "Crown Nexus", ring: "inner", planets: ["terran", "gas_giant", "barren"], relic: true, neutrals: 1, x: 634, y: 578 },
    { code: "OV", name: "Orphean Vault", ring: "inner", planets: ["barren", "ice"], hazard: true, relic: true, neutrals: 1, x: 500, y: 655 },
    { code: "RM", name: "Radiant Maw", ring: "inner", planets: ["volcanic", "gas_giant"], relic: true, neutrals: 1, x: 350, y: 540 },
    { code: "BS", name: "Blue Silence", ring: "core", planets: ["ocean", "terran"], relic: true, neutrals: 2, x: 500, y: 500 },
  ],
  wormholes: [["CW", "OS"], ["PL", "MR"], ["ZC", "SR"]],
  lanes: [["AR","CW"],["CW","PL"],["PL","ZC"],["ZC","NB"],["NB","VG"],["VG","OS"],["OS","EF"],["EF","FM"],["FM","MR"],["MR","BL"],["BL","SR"],["SR","AR"],["HD","RC"],["RC","SV"],["SV","AG"],["AG","TA"],["TA","FH"],["FH","GW"],["GW","JL"],["JL","PA"],["PA","AB"],["AB","CS"],["CS","KD"],["KD","HD"],["AR","HD"],["AR","RC"],["CW","RC"],["CW","SV"],["PL","SV"],["PL","AG"],["ZC","AG"],["NB","TA"],["VG","TA"],["VG","FH"],["OS","FH"],["OS","GW"],["EF","GW"],["EF","JL"],["FM","JL"],["FM","PA"],["MR","PA"],["MR","AB"],["BL","AB"],["BL","CS"],["SR","CS"],["SR","KD"],["HD","CY"],["RC","CY"],["KD","CY"],["SV","SO"],["AG","SO"],["TA","CN"],["FH","CN"],["GW","OV"],["JL","OV"],["PA","RM"],["AB","RM"],["CS","RM"],["CY","SO"],["SO","CN"],["CN","OV"],["OV","RM"],["RM","CY"],["BS","CY"],["BS","SO"],["BS","CN"],["BS","OV"],["BS","RM"]],
};
// Organic placement: deterministic jitter + relaxation (never closer than ~115px, clamped to the board).
(() => {
  let s = 20260723; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const sys = window.CG_MAP.systems;
  sys.forEach(p => { if (p.code !== "BS") { p.x += (rnd() - 0.5) * 85; p.y += (rnd() - 0.5) * 85; } });
  for (let it = 0; it < 60; it++) {
    for (let i = 0; i < sys.length; i++) for (let j = i + 1; j < sys.length; j++) {
      const a = sys[i], b = sys[j]; let dx = b.x - a.x, dy = b.y - a.y; const d = Math.hypot(dx, dy) || 1;
      if (d < 115) { const push = (115 - d) / 2; dx /= d; dy /= d; a.x -= dx * push; a.y -= dy * push; b.x += dx * push; b.y += dy * push; }
    }
    sys.forEach(p => { p.x = Math.min(955, Math.max(45, p.x)); p.y = Math.min(808, Math.max(50, p.y)); });
  }
})();
