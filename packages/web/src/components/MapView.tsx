// Game-connected star map, visual language from the design system's MapView UI kit.
import { memo } from "react";
import { LANES, SYSTEMS, SYSTEM_IDS, WORMHOLES, type GameState } from "@cg/engine";
import { LAYOUT } from "../mapLayout";
import { PlanetOrb } from "@ds/components/game/PlanetOrb.jsx";

const P_COLORS = ["var(--p1)", "var(--p2)", "var(--p3)", "var(--p4)", "var(--p5)"];

function Stars() {
  let s = 42;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const stars = Array.from({ length: 110 }, () => ({ x: rnd() * 1000, y: rnd() * 1000, r: rnd() * 1.4 + 0.4, o: rnd() * 0.5 + 0.15 }));
  const SPARK = ["#E85D9E", "#6FC4E8", "#FFD98A", "#B49CFF"];
  const sparks = Array.from({ length: 14 }, (_, i) => ({ x: rnd() * 1000, y: rnd() * 1000, s: rnd() * 2.4 + 1.6, c: SPARK[i % 4]! }));
  return (
    <g>
      {stars.map((st, i) => (
        <circle key={i} cx={st.x} cy={st.y} r={st.r} fill="var(--starlight)" opacity={st.o} />
      ))}
      {sparks.map((sp, i) => (
        <path key={`s${i}`} d={`M ${sp.x} ${sp.y - sp.s * 1.6} L ${sp.x + sp.s} ${sp.y} L ${sp.x} ${sp.y + sp.s * 1.6} L ${sp.x - sp.s} ${sp.y} Z`} fill={sp.c} opacity="0.75" />
      ))}
    </g>
  );
}

export interface MapViewProps {
  game: GameState;
  selected: string | null;
  reachable: Map<string, number>; // system -> cost
  onSelect: (id: string) => void;
}

export const MapView = memo(function MapView({ game, selected, reachable, onSelect }: MapViewProps) {
  const wormSet = new Set(WORMHOLES.flat());
  return (
    <svg viewBox="-40 -40 1080 1080" style={{ width: "100%", height: "100%", display: "block" }}>
      <Stars />
      {LANES.map(([a, b], i) => {
        const A = LAYOUT[a]!;
        const B = LAYOUT[b]!;
        return <line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="rgba(239,234,248,.16)" strokeWidth={2} style={{ pointerEvents: "none" }} />;
      })}
      {WORMHOLES.map(([a, b], i) => {
        const A = LAYOUT[a]!;
        const B = LAYOUT[b]!;
        const mx = (A.x + B.x) / 2;
        const my = (A.y + B.y) / 2;
        let dx = mx - 500;
        let dy = my - 500;
        const len = Math.hypot(dx, dy) || 1;
        const cx = mx + (dx / len) * 620;
        const cy = my + (dy / len) * 620;
        return (
          <path key={i} d={`M ${A.x} ${A.y} Q ${cx} ${cy} ${B.x} ${B.y}`} fill="none" stroke="var(--wormhole)" strokeWidth={2.5} strokeDasharray="7 7" opacity={0.85} style={{ filter: "drop-shadow(0 0 5px var(--wormhole))", pointerEvents: "none" }} />
        );
      })}
      {SYSTEM_IDS.map((code) => {
        const def = SYSTEMS[code]!;
        const sys = game.systems[code]!;
        const pos = LAYOUT[code]!;
        const occ = sys.occupant;
        const isSel = selected === code;
        const cost = reachable.get(code);
        const canReach = cost !== undefined;
        const ownerColor = occ ? P_COLORS[occ.player]! : sys.neutrals > 0 ? "var(--neutral-token)" : null;
        const isRemnant = occ?.kind === "remnant";
        const count = occ ? sys.tokens : sys.neutrals;
        const n = def.planets.length;
        return (
          <g key={code} onClick={() => onSelect(code)} style={{ cursor: "pointer" }}>
            {def.rimGate && <circle cx={pos.x} cy={pos.y} r={37} fill="none" stroke="var(--starlight-2)" strokeWidth={1.5} strokeDasharray="3 6" opacity={0.7} />}
            {canReach && !isSel && <circle cx={pos.x} cy={pos.y} r={33} fill="none" stroke="var(--p3)" strokeWidth={2.5} strokeDasharray="5 5" opacity={0.9} />}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={27}
              fill={isSel ? "var(--space-2)" : "#232045"}
              stroke={isSel ? "var(--starlight)" : ownerColor || "rgba(239,234,248,.28)"}
              strokeWidth={isSel ? 3.5 : ownerColor && !isRemnant ? 3 : ownerColor ? 0 : 1.5}
              style={isSel ? { filter: "drop-shadow(0 0 8px rgba(239,234,248,.8))" } : occ && !isRemnant ? { filter: `drop-shadow(0 0 6px ${ownerColor})` } : undefined}
            />
            {isRemnant && <circle cx={pos.x} cy={pos.y} r={27} fill="none" stroke={ownerColor!} strokeWidth={3} strokeDasharray="4 4" />}
            {sys.bulwark && <circle cx={pos.x} cy={pos.y} r={41} fill="none" stroke="var(--ink)" strokeWidth={2} opacity={0.9} />}
            {def.planets.map((p, i) => {
              const px = pos.x + (i - (n - 1) / 2) * 16;
              return <PlanetOrb key={i} type={p} ring={false} size={17} x={px - 8.5} y={pos.y - 16.5} />;
            })}
            <text x={pos.x} y={pos.y + 13} textAnchor="middle" fill="var(--starlight)" style={{ font: "700 11px var(--font-mono)" }}>
              {code}
            </text>
            <text x={pos.x} y={pos.y + 45} textAnchor="middle" fill="var(--starlight-2)" style={{ font: "10.5px var(--font-body)", letterSpacing: ".02em", paintOrder: "stroke", stroke: "var(--space-0)", strokeWidth: 3 }}>
              {def.name}
            </text>
            {canReach && (
              <g>
                <circle cx={pos.x} cy={pos.y + 26} r={10} fill="var(--p3)" stroke="var(--space-0)" strokeWidth={1.5} />
                <text x={pos.x} y={pos.y + 30} textAnchor="middle" fill="var(--on-accent)" style={{ font: "700 11px var(--font-mono)" }}>
                  {cost}
                </text>
              </g>
            )}
            {def.hazard && (
              <g>
                <circle cx={pos.x - 21} cy={pos.y - 19} r={8.5} fill="var(--hazard)" stroke="var(--space-0)" strokeWidth={1.5} />
                <text x={pos.x - 21} y={pos.y - 15.5} textAnchor="middle" fill="var(--starlight)" style={{ font: "700 11px var(--font-mono)" }}>
                  !
                </text>
              </g>
            )}
            {def.relic && (
              <text x={pos.x - 22} y={pos.y + 26} textAnchor="middle" fill="var(--relic)" style={{ font: "14px var(--font-mono)", filter: "drop-shadow(0 0 4px var(--relic))" }}>
                ✦
              </text>
            )}
            {wormSet.has(code) && <circle cx={pos.x + 21} cy={pos.y + 19} r={5} fill="none" stroke="var(--wormhole)" strokeWidth={2} style={{ filter: "drop-shadow(0 0 4px var(--wormhole))" }} />}
            {(occ || sys.neutrals > 0) && (
              <g>
                <circle cx={pos.x + 21} cy={pos.y - 19} r={11} fill={isRemnant || !occ ? "var(--space-0)" : ownerColor!} stroke={isRemnant || !occ ? ownerColor! : "var(--space-0)"} strokeWidth={2} />
                <text x={pos.x + 21} y={pos.y - 15} textAnchor="middle" fill={isRemnant || !occ ? ownerColor! : "var(--on-accent)"} style={{ font: "700 12px var(--font-mono)" }}>
                  {count}
                </text>
              </g>
            )}
            {sys.starbases > 0 && (
              <text x={pos.x + 21} y={pos.y + 38} textAnchor="middle" fill="var(--ink-2)" style={{ font: "700 11px var(--font-mono)" }}>
                ▲{sys.starbases}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
});
