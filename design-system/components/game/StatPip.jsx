import React from "react";
import { Icon } from "../icons/Icon.jsx";

/** Tiny icon + mono value stat (population, defense, cost…). */
export function StatPip({ icon, value, label, color = "var(--ink)", size = "md", style }) {
  const f = size === "lg" ? 18 : 14;
  return (
    <span title={label} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: f, color, whiteSpace: "nowrap", ...style }}>
      <Icon name={icon} size={f + 2} />
      {value}
    </span>
  );
}
