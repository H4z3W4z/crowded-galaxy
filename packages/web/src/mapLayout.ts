// Organic map placement — deterministic jitter + relaxation, ported from the
// design system's ui_kits/game/mapdata.js so the shipped board matches the mockups.
import { SYSTEMS, SYSTEM_IDS } from "@cg/engine";

export interface Placed {
  x: number;
  y: number;
}

function computeLayout(): Record<string, Placed> {
  let s = 20260723;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const pts = SYSTEM_IDS.map((code) => ({ code, x: SYSTEMS[code]!.x, y: SYSTEMS[code]!.y }));
  for (const p of pts) {
    if (p.code !== "BS") {
      p.x += (rnd() - 0.5) * 85;
      p.y += (rnd() - 0.5) * 85;
    }
  }
  for (let it = 0; it < 60; it++) {
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i]!;
        const b = pts[j]!;
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 1;
        if (d < 115) {
          const push = (115 - d) / 2;
          dx /= d;
          dy /= d;
          a.x -= dx * push;
          a.y -= dy * push;
          b.x += dx * push;
          b.y += dy * push;
        }
      }
    }
    for (const p of pts) {
      p.x = Math.min(955, Math.max(45, p.x));
      p.y = Math.min(808, Math.max(50, p.y));
    }
  }
  return Object.fromEntries(pts.map((p) => [p.code, { x: p.x, y: p.y }]));
}

export const LAYOUT: Record<string, Placed> = computeLayout();
