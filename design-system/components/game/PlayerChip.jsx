import React from "react";
import { Icon } from "../icons/Icon.jsx";

export const PLAYER_COLORS = {
  1: { color: "var(--p1)", deep: "var(--p1-deep)", label: "Ember" },
  2: { color: "var(--p2)", deep: "var(--p2-deep)", label: "Gold" },
  3: { color: "var(--p3)", deep: "var(--p3-deep)", label: "Teal" },
  4: { color: "var(--p4)", deep: "var(--p4-deep)", label: "Violet" },
  5: { color: "var(--p5)", deep: "var(--p5-deep)", label: "Moss" },
  neutral: { color: "var(--neutral-token)", deep: "var(--ink-2)", label: "Neutral" },
};

/** Player identity pill: color disc + name (+ Influence, AI mark, turn ring). */
export function PlayerChip({ player = 1, name, influence, ai = false, active = false, size = "md", style }) {
  const p = PLAYER_COLORS[player] || PLAYER_COLORS[1];
  const h = size === "sm" ? 30 : 38;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, height: h, padding: "0 12px 0 6px", background: active ? "var(--card)" : "var(--paper-1)", border: active ? "var(--bw) solid var(--ink)" : "1.5px solid var(--line-mid)", borderRadius: "var(--r-pill)", boxShadow: active ? "var(--shadow-chunk-sm)" : "none", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: size === "sm" ? 13 : 15, color: "var(--ink)", whiteSpace: "nowrap", ...style }}>
      <span style={{ width: h - 12, height: h - 12, borderRadius: "50%", background: p.color, border: "2px solid var(--ink)", flexShrink: 0 }}></span>
      {name}
      {ai ? <Icon name="bot" size={15} style={{ color: "var(--ink-3)" }} /> : null}
      {influence != null ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--font-mono)", fontSize: size === "sm" ? 12 : 14, color: "var(--influence-deep)" }}><Icon name="star" size={14} />{influence}</span> : null}
    </span>
  );
}
