// Single source of truth for map symbol explanations, shared by the in-app
// Legend panel and the standalone glossary. Each entry renders a live SVG swatch
// so the key always matches what's actually drawn on the board.
import { PLANET_TYPES } from "@ds/components/icons/PlanetIcon.jsx";
import type { PlanetType } from "@cg/engine";

export interface LegendEntry {
  swatch: React.ReactNode;
  title: string;
  body: string;
}

const P_COLORS = ["var(--p1)", "var(--p2)", "var(--p3)", "var(--p4)", "var(--p5)"];

function Swatch({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 60 60" width={52} height={52} style={{ flexShrink: 0 }}>
      {children}
    </svg>
  );
}

const node = (extra?: React.ReactNode, fill = "#232045", stroke = "rgba(239,234,248,.28)", sw = 1.5) => (
  <>
    <circle cx={30} cy={30} r={16} fill={fill} stroke={stroke} strokeWidth={sw} />
    {extra}
  </>
);

export const MAP_LEGEND: LegendEntry[] = [
  {
    swatch: <Swatch>{node(<circle cx={30} cy={30} r={22} fill="none" stroke="var(--starlight-2)" strokeWidth={1.5} strokeDasharray="2 4" opacity={0.8} />)}</Swatch>,
    title: "Rim Gate (faint dashed ring)",
    body: "A galactic entry point. A civilization with no territory — every new civ on its launch turn — must make its first conquest at a Rim Gate. They sit on the frontier tips of the spiral arms.",
  },
  {
    swatch: <Swatch>{node(<circle cx={30} cy={30} r={20} fill="none" stroke="var(--p3)" strokeWidth={2.5} strokeDasharray="4 4" opacity={0.9} />)}</Swatch>,
    title: "Reachable now (teal dashed ring)",
    body: "A system you can conquer on this turn — a live highlight that follows your borders. On your launch turn these sit on the Rim Gates; afterward they mark systems adjacent to your empire.",
  },
  {
    swatch: (
      <Swatch>
        {node()}
        <circle cx={44} cy={44} r={9} fill="var(--p3)" stroke="var(--space-0)" strokeWidth={1.5} />
        <text x={44} y={48} textAnchor="middle" fill="var(--on-accent)" style={{ font: "700 10px var(--font-mono)" }}>
          3
        </text>
      </Swatch>
    ),
    title: "Conquest cost (teal bubble)",
    body: "How many population tokens it costs to take this system right now, including its defenders, Hazard, and any Starbases — after your civilization's discounts.",
  },
  {
    swatch: (
      <Swatch>
        {node()}
        <circle cx={46} cy={16} r={9} fill="var(--neutral-token)" stroke="var(--space-0)" strokeWidth={1.5} />
        <text x={46} y={20} textAnchor="middle" fill="var(--space-0)" style={{ font: "700 10px var(--font-mono)" }}>
          2
        </text>
      </Swatch>
    ),
    title: "Token count (top-right badge)",
    body: "Population in the system. Grey = neutral defenders (seeded at setup). A player color = that player's population. A hollow ring in a player color = their Remnant Empire.",
  },
  {
    swatch: (
      <Swatch>
        <circle cx={30} cy={30} r={16} fill="#232045" stroke={P_COLORS[0]} strokeWidth={3} style={{ filter: `drop-shadow(0 0 5px ${P_COLORS[0]})` }} />
      </Swatch>
    ),
    title: "Active empire (solid glowing ring)",
    body: "A system held by a living civilization, ringed and glowing in that player's color.",
  },
  {
    swatch: (
      <Swatch>
        {node()}
        <circle cx={30} cy={30} r={16} fill="none" stroke={P_COLORS[3]} strokeWidth={3} strokeDasharray="3 3" />
      </Swatch>
    ),
    title: "Remnant Empire (dashed color ring)",
    body: "The lingering remains of a collapsed civilization. Still scores and defends, but usually weaker — one token per system (except Cryari Revenants, who keep everything).",
  },
  {
    swatch: (
      <Swatch>
        {node()}
        <circle cx={16} cy={16} r={8} fill="var(--hazard)" stroke="var(--space-0)" strokeWidth={1.5} />
        <text x={16} y={20} textAnchor="middle" fill="var(--starlight)" style={{ font: "700 10px var(--font-mono)" }}>
          !
        </text>
      </Swatch>
    ),
    title: "Hazard (red ! badge)",
    body: "A dangerous system: +1 to its conquest cost. Some abilities (Magmaforged, Stealth) ignore it.",
  },
  {
    swatch: (
      <Swatch>
        {node()}
        <text x={16} y={46} textAnchor="middle" fill="var(--relic)" style={{ font: "16px var(--font-mono)", filter: "drop-shadow(0 0 4px var(--relic))" }}>
          ✦
        </text>
      </Swatch>
    ),
    title: "Relic (glowing star)",
    body: "An ancient site. The Ancient trait scores +1 Influence for each Relic system you control. Most Relics sit in the contested galactic core.",
  },
  {
    swatch: (
      <Swatch>
        {node()}
        <circle cx={44} cy={44} r={5} fill="none" stroke="var(--wormhole)" strokeWidth={2} style={{ filter: "drop-shadow(0 0 4px var(--wormhole))" }} />
      </Swatch>
    ),
    title: "Wormhole endpoint (glowing ring)",
    body: "Linked to its pair by a dashed magenta arc across the galaxy. The two systems count as adjacent for everything — conquest, defense, scoring — so wormholes are strategic shortcuts.",
  },
  {
    swatch: (
      <Swatch>
        {node()}
        <text x={44} y={52} textAnchor="middle" fill="var(--ink-2)" style={{ font: "700 10px var(--font-mono)" }}>
          ▲2
        </text>
      </Swatch>
    ),
    title: "Starbase (▲ marker)",
    body: "Built by the Fortress-Building trait. Each adds +1 defense to the system and +1 Influence while the civilization is active.",
  },
  {
    swatch: (
      <Swatch>
        {node()}
        <circle cx={30} cy={30} r={24} fill="none" stroke="var(--ink)" strokeWidth={2} opacity={0.9} />
      </Swatch>
    ),
    title: "Bulwark (bright outer ring)",
    body: "Placed by the Heroic trait. That system simply cannot be conquered while the marker sits on it.",
  },
];

// Every system is a single planet; a species scores +1 from each system whose planet is its favored type.
export const PLANET_LEGEND: { type: PlanetType; label: string }[] = (
  ["terran", "ocean", "barren", "gas_giant", "ice", "volcanic"] as PlanetType[]
).map((type) => ({ type, label: (PLANET_TYPES as Record<string, { label: string }>)[type]!.label }));
