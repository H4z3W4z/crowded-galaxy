const PT_COLORS = { terran: "var(--pt-terran)", ocean: "var(--pt-ocean)", barren: "var(--pt-barren)", gas_giant: "var(--pt-gas-giant)", ice: "var(--pt-ice)", volcanic: "var(--pt-volcanic)" };
const P_COLORS = { 1: "var(--p1)", 2: "var(--p2)", 3: "var(--p3)", 4: "var(--p4)", 5: "var(--p5)", neutral: "var(--neutral-token)" };

function CG_Stars() {
  let s = 42; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const stars = Array.from({ length: 110 }, () => ({ x: rnd() * 1000, y: rnd() * 1000, r: rnd() * 1.4 + 0.4, o: rnd() * 0.5 + 0.15 }));
  const SPARK = ["#E85D9E", "#6FC4E8", "#FFD98A", "#B49CFF"];
  const sparks = Array.from({ length: 14 }, (_, i) => ({ x: rnd() * 1000, y: rnd() * 1000, s: rnd() * 2.4 + 1.6, c: SPARK[i % 4] }));
  return <g>
    {stars.map((st, i) => <circle key={i} cx={st.x} cy={st.y} r={st.r} fill="var(--starlight)" opacity={st.o} />)}
    {sparks.map((sp, i) => <path key={"s" + i} d={`M ${sp.x} ${sp.y - sp.s * 1.6} L ${sp.x + sp.s} ${sp.y} L ${sp.x} ${sp.y + sp.s * 1.6} L ${sp.x - sp.s} ${sp.y} Z`} fill={sp.c} opacity="0.75" />)}
  </g>;
}

function CG_MapView({ occupancy = {}, selected, onSelect, reachable = new Set() }) {
  const M = window.CG_MAP;
  const pos = Object.fromEntries(M.systems.map(sy => [sy.code, sy]));
  const wormSet = new Set(M.wormholes.flat());
  return (
    <svg viewBox="-40 -40 1080 1080" style={{ width: "100%", height: "100%", display: "block" }}>
      <CG_Stars />
      {M.lanes.map(([a, b], i) => {
        const A = pos[a], B = pos[b];
        return <line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="rgba(239,234,248,.16)" strokeWidth="2" style={{ pointerEvents: "none" }} />;
      })}
      {M.wormholes.map(([a, b], i) => {
        const A = pos[a], B = pos[b];
        const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
        let dx = mx - 500, dy = my - 500; const len = Math.hypot(dx, dy) || 1;
        const cx = mx + (dx / len) * 620, cy = my + (dy / len) * 620;
        return <path key={i} d={`M ${A.x} ${A.y} Q ${cx} ${cy} ${B.x} ${B.y}`} fill="none" stroke="var(--wormhole)" strokeWidth="2.5" strokeDasharray="7 7" opacity="0.85" style={{ filter: "drop-shadow(0 0 5px var(--wormhole))", pointerEvents: "none" }} />;
      })}
      {M.systems.map(sy => {
        const occ = occupancy[sy.code];
        const canReach = reachable.has(sy.code);
        const isSel = selected === sy.code;
        const ownerColor = occ ? P_COLORS[occ.player] : null;
        const n = sy.planets.length;
        const Orb = (window.CrowdedGalaxyUI_a6737a || {}).PlanetOrb;
        return (
          <g key={sy.code} onClick={() => onSelect && onSelect(sy.code)} style={{ cursor: "pointer" }}>
            {sy.rim && <circle cx={sy.x} cy={sy.y} r="37" fill="none" stroke="var(--starlight-2)" strokeWidth="1.5" strokeDasharray="3 6" opacity="0.7" />}
            {canReach && !isSel && <circle cx={sy.x} cy={sy.y} r="33" fill="none" stroke="var(--p3)" strokeWidth="2.5" strokeDasharray="5 5" opacity="0.9" />}
            <circle cx={sy.x} cy={sy.y} r="27" fill={isSel ? "var(--space-2)" : "#232045"}
              stroke={isSel ? "var(--starlight)" : ownerColor || "rgba(239,234,248,.28)"}
              strokeWidth={isSel ? 3.5 : ownerColor && !occ.remnant ? 3 : ownerColor ? 0 : 1.5}
              style={isSel ? { filter: "drop-shadow(0 0 8px rgba(239,234,248,.8))" } : occ && !occ.remnant ? { filter: `drop-shadow(0 0 6px ${ownerColor})` } : undefined} />
            {occ && occ.remnant && <circle cx={sy.x} cy={sy.y} r="27" fill="none" stroke={ownerColor} strokeWidth="3" strokeDasharray="4 4" />}
            {sy.planets.map((p, i) => {
              const px = sy.x + (i - (n - 1) / 2) * 16;
              return Orb ? <Orb key={i} type={p} ring={false} size={17} x={px - 8.5} y={sy.y - 16.5} />
                : <circle key={i} cx={px} cy={sy.y - 7} r="6" fill={PT_COLORS[p]} stroke="var(--space-0)" strokeWidth="1.5" />;
            })}
            <text x={sy.x} y={sy.y + 13} textAnchor="middle" fill="var(--starlight)" style={{ font: "700 11px var(--font-mono)" }}>{sy.code}</text>
            <text x={sy.x} y={sy.y + 45} textAnchor="middle" fill="var(--starlight-2)" style={{ font: "10.5px var(--font-body)", letterSpacing: ".02em", paintOrder: "stroke", stroke: "var(--space-0)", strokeWidth: 3 }}>{sy.name}</text>
            {sy.hazard && <g><circle cx={sy.x - 21} cy={sy.y - 19} r="8.5" fill="var(--hazard)" stroke="var(--space-0)" strokeWidth="1.5" /><text x={sy.x - 21} y={sy.y - 15.5} textAnchor="middle" fill="var(--starlight)" style={{ font: "700 11px var(--font-mono)" }}>!</text></g>}
            {sy.relic && <text x={sy.x - 22} y={sy.y + 26} textAnchor="middle" fill="var(--relic)" style={{ font: "14px var(--font-mono)", filter: "drop-shadow(0 0 4px var(--relic))" }}>✦</text>}
            {wormSet.has(sy.code) && <circle cx={sy.x + 21} cy={sy.y + 19} r="5" fill="none" stroke="var(--wormhole)" strokeWidth="2" style={{ filter: "drop-shadow(0 0 4px var(--wormhole))" }} />}
            {occ && (
              <g>
                <circle cx={sy.x + 21} cy={sy.y - 19} r="11" fill={occ.remnant ? "var(--space-0)" : ownerColor} stroke={occ.remnant ? ownerColor : "var(--space-0)"} strokeWidth="2" />
                <text x={sy.x + 21} y={sy.y - 15} textAnchor="middle" fill={occ.remnant ? ownerColor : "var(--on-accent)"} style={{ font: "700 12px var(--font-mono)" }}>{occ.count}</text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
window.CG_MapView = CG_MapView;
window.CG_PT_COLORS = PT_COLORS;
