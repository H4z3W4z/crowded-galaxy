import React from "react";
import { Icon } from "../icons/Icon.jsx";

/** Trait card — the random special power paired with a species. Ink header. */
export function TraitCard({ trait, compact = false, width = 240, style }) {
  const t = trait || {};
  return (
    <div style={{ width, background: "var(--card)", border: "var(--bw) solid var(--ink)", borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-chunk)", overflow: "hidden", fontFamily: "var(--font-body)", color: "var(--ink)", ...style }}>
      <div style={{ background: "var(--ink)", color: "var(--paper-0)", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <Icon name="sparkles" size={16} style={{ color: "var(--influence)" }} />
        <div style={{ flex: 1, minWidth: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: compact ? 14 : 17, lineHeight: 1.1, overflowWrap: "break-word" }}>{t.name}</div>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--paper-0)", color: "var(--ink)", border: "2px solid var(--paper-0)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 16, flexShrink: 0 }} title={`+${t.population} population`}>+{t.population}</div>
      </div>
      {!compact && <div style={{ padding: "10px 14px", fontSize: 13, lineHeight: 1.45 }}>{t.ability}</div>}
    </div>
  );
}
