import React from "react";

// Cartoon glossy planet illustrations — original art in the "space game icons" style:
// glossy sphere + type features (rings, craters, facets, corona). Literal colors tuned to the pt-* tokens.
const ORB = {
  terran: { hi: "#B8E066", base: "#6FB33C", rim: "#2E6B22", feat: "#3E8A2C" },
  ocean: { hi: "#7FD4E8", base: "#2E7FC2", rim: "#173E78", feat: "#1C5A9E" },
  barren: { hi: "#F2CE7E", base: "#D89B44", rim: "#8A5A1E", feat: "#A8712B" },
  gas_giant: { hi: "#FFD98A", base: "#EFA23F", rim: "#9E5B18", feat: "#C97F2A" },
  ice: { hi: "#D8F2FF", base: "#6FC4E8", rim: "#2E6FA8", feat: "#3E9ED4" },
  volcanic: { hi: "#FFA46B", base: "#E85D33", rim: "#8A2412", feat: "#C24222" },
};

/** Glossy cartoon planet orb. Rings on gas_giant & terran by default. */
export function PlanetOrb({ type = "terran", size = 48, ring, style, ...rest }) {
  const c = ORB[type] || ORB.terran;
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const hasRing = ring != null ? ring : type === "gas_giant" || type === "terran";
  const g = `g${uid}`, cl = `c${uid}`;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ overflow: "visible", flexShrink: 0, ...style }} aria-hidden="true" {...rest}>
      <defs>
        <radialGradient id={g} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor={c.hi} /><stop offset="55%" stopColor={c.base} /><stop offset="100%" stopColor={c.rim} />
        </radialGradient>
        <clipPath id={cl}><circle cx="50" cy="50" r="36" /></clipPath>
      </defs>
      {type === "volcanic" && (
        <g opacity="0.9">{Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <path key={i} d={`M ${50 + Math.cos(a) * 36} ${50 + Math.sin(a) * 36} L ${50 + Math.cos(a + 0.18) * 47} ${50 + Math.sin(a + 0.18) * 47} L ${50 + Math.cos(a + 0.36) * 36} ${50 + Math.sin(a + 0.36) * 36} Z`} fill="#C24222" />;
        })}</g>
      )}
      {hasRing && <ellipse cx="50" cy="50" rx="49" ry="13" fill="none" stroke={c.feat} strokeWidth="3.5" transform="rotate(-18 50 50)" opacity="0.9" />}
      <circle cx="50" cy="50" r="36" fill={`url(#${g})`} />
      <g clipPath={`url(#${cl})`}>
        {type === "terran" && <g fill={c.feat}><path d="M22 34 q10 -8 20 -2 q12 7 4 14 q-14 8 -24 0 q-6 -6 0 -12Z" /><path d="M56 58 q14 -6 22 4 q6 9 -4 13 q-14 5 -22 -4 q-5 -8 4 -13Z" /><circle cx="66" cy="30" r="6" /></g>}
        {type === "ocean" && <g fill="none" stroke={c.feat} strokeWidth="5" strokeLinecap="round"><path d="M16 40 q12 -10 26 -4 q14 6 26 -2" /><path d="M20 58 q14 -8 28 -1 q12 6 24 0" /><path d="M28 74 q12 -7 26 -2" /></g>}
        {type === "barren" && <g>{[[34, 36, 9], [60, 52, 12], [42, 68, 7], [70, 28, 5]].map(([x, y, r], i) => <g key={i}><circle cx={x} cy={y} r={r} fill={c.feat} /><circle cx={x - r * 0.22} cy={y - r * 0.22} r={r * 0.72} fill={c.rim} opacity="0.55" /></g>)}</g>}
        {type === "gas_giant" && <g fill={c.feat}><rect x="8" y="30" width="84" height="7" rx="3.5" opacity="0.85" /><rect x="8" y="46" width="84" height="10" rx="5" /><rect x="8" y="64" width="84" height="6" rx="3" opacity="0.7" /></g>}
        {type === "ice" && <g fill={c.feat} opacity="0.85"><path d="M50 14 L64 40 L50 52 L36 40 Z" /><path d="M30 48 L50 52 L44 76 L26 66 Z" opacity="0.8" /><path d="M56 54 L76 50 L70 72 Z" opacity="0.7" /></g>}
        {type === "volcanic" && <path d="M50 50 m0 -26 a26 26 0 1 1 -18 44 a19 19 0 1 0 12 -34 a12 12 0 1 0 6 22 a6 6 0 1 1 0 -12" fill={c.feat} />}
        <ellipse cx="50" cy="76" rx="34" ry="14" fill={c.rim} opacity="0.35" />
      </g>
      {hasRing && <path d="M 1.5 64.7 A 49 13 0 0 0 98.4 35.2" fill="none" stroke={c.feat} strokeWidth="3.5" transform="rotate(-18 50 50)" opacity="0" />}
      {hasRing && <ellipse cx="50" cy="50" rx="49" ry="13" fill="none" stroke={c.feat} strokeWidth="3.5" transform="rotate(-18 50 50)" strokeDasharray="77 78" strokeDashoffset="-39" />}
      <ellipse cx="37" cy="30" rx="12" ry="7" fill="#FFFFFF" opacity="0.45" transform="rotate(-24 37 30)" />
      <circle cx="27" cy="42" r="3" fill="#FFFFFF" opacity="0.35" />
      {type === "ice" && <g fill={c.hi}><path d="M86 22 l4 6 l-7 1 Z" /><path d="M90 66 l5 4 l-6 3 Z" /><path d="M12 74 l-5 3 l6 4 Z" /></g>}
      {type === "barren" && <g fill={c.base}><circle cx="88" cy="70" r="3" /><circle cx="10" cy="30" r="2.5" /><circle cx="84" cy="14" r="2" /></g>}
    </svg>
  );
}
