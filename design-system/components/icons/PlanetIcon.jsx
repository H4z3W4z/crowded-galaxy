import React from "react";
import { Icon } from "./Icon.jsx";

export const PLANET_TYPES = {
  terran: { icon: "leaf", label: "Terran", color: "var(--pt-terran)", tint: "var(--pt-terran-tint)" },
  ocean: { icon: "waves-horizontal", label: "Ocean", color: "var(--pt-ocean)", tint: "var(--pt-ocean-tint)" },
  barren: { icon: "circle-dot", label: "Barren", color: "var(--pt-barren)", tint: "var(--pt-barren-tint)" },
  gas_giant: { icon: "cloud", label: "Gas Giant", color: "var(--pt-gas-giant)", tint: "var(--pt-gas-giant-tint)" },
  ice: { icon: "snowflake", label: "Ice", color: "var(--pt-ice)", tint: "var(--pt-ice-tint)" },
  volcanic: { icon: "flame", label: "Volcanic", color: "var(--pt-volcanic)", tint: "var(--pt-volcanic-tint)" },
};

/** Planet-type glyph. variant "chip" = tinted rounded square with ink border (paper surfaces); "glyph" = bare colored icon (space surfaces). */
export function PlanetIcon({ type, size = 22, variant = "chip", favored = false, style }) {
  const p = PLANET_TYPES[type];
  if (!p) return null;
  if (variant === "glyph") {
    return <Icon name={p.icon} size={size} style={{ color: p.color, ...style }} title={p.label} />;
  }
  const box = Math.round(size * 1.55);
  return (
    <span title={p.label} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: box, height: box, background: p.tint, border: favored ? "2px solid var(--ink)" : "1.5px solid var(--line-mid)", borderRadius: "var(--r-sm)", color: `color-mix(in oklab, ${p.color} 80%, var(--ink))`, boxShadow: favored ? "var(--shadow-chunk-sm)" : "none", flexShrink: 0, ...style }}>
      <Icon name={p.icon} size={size} />
    </span>
  );
}
