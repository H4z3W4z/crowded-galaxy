import React from "react";
import { Icon } from "../icons/Icon.jsx";

/** Influence score: gold star + mono number. delta renders "+n". */
export function InfluenceBadge({ value = 0, size = "md", delta = false, style }) {
  const dims = { sm: { h: 24, f: 13, i: 13, p: 8 }, md: { h: 32, f: 16, i: 16, p: 10 }, lg: { h: 44, f: 22, i: 20, p: 14 } }[size];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: dims.h, padding: `0 ${dims.p}px`, background: "var(--influence)", color: "var(--on-accent)", border: "var(--bw) solid var(--ink)", borderRadius: "var(--r-pill)", boxShadow: "var(--shadow-chunk-sm)", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: dims.f, whiteSpace: "nowrap", ...style }}>
      <Icon name="star" size={dims.i} />
      {delta && value >= 0 ? `+${value}` : value}
    </span>
  );
}
