// The spiral map's coordinates are authored (computed by scripts/gen-spiral-map.mjs),
// so the client renders them directly — no relaxation, which would scramble the arms.
import { SYSTEMS, SYSTEM_IDS } from "@cg/engine";

export interface Placed {
  x: number;
  y: number;
}

export const LAYOUT: Record<string, Placed> = Object.fromEntries(
  SYSTEM_IDS.map((code) => [code, { x: SYSTEMS[code]!.x, y: SYSTEMS[code]!.y }]),
);
