import React from "react";
import { PlanetIcon, PLANET_TYPES } from "../icons/PlanetIcon.jsx";
import { PlanetOrb } from "../game/PlanetOrb.jsx";
import { Icon } from "../icons/Icon.jsx";

const label = { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 11, letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "var(--ink-3)", display: "flex", alignItems: "center", gap: 5 };

/** Species card: Active side + Remnant side. side="remnant" = flipped (Remnant rules live). */
export function SpeciesCard({ species, side = "active", compact = false, width = 270, style }) {
  const s = species || {};
  const pt = PLANET_TYPES[s.habitat] || {};
  const remnant = side === "remnant";
  return (
    <div style={{ width, background: "var(--card)", border: "var(--bw) solid var(--ink)", borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-chunk)", overflow: "hidden", fontFamily: "var(--font-body)", color: "var(--ink)", position: "relative", ...style }}>
      <div style={{ background: remnant ? "var(--paper-2)" : pt.tint, borderBottom: "var(--bw) solid var(--ink)", padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <PlanetOrb type={s.habitat} size={30} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: compact ? 15 : 18, lineHeight: 1.1, textWrap: "balance", overflowWrap: "break-word" }}>{s.name}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-2)", marginTop: 2 }}>{remnant ? "REMNANT EMPIRE" : `${pt.label || ""} habitat`}</div>
        </div>
        <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--card)", border: "var(--bw) solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 19, flexShrink: 0 }} title={`${s.population} population`}>{remnant ? <Icon name="skull" size={20} /> : s.population}</div>
      </div>
      {!compact && (
        <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ opacity: remnant ? 0.45 : 1 }}>
            <div style={label}><Icon name="rocket" size={12} />Active</div>
            <div style={{ fontSize: 13, lineHeight: 1.45, marginTop: 3 }}>{s.active}</div>
          </div>
          <div style={{ borderTop: "1.5px dashed var(--line-mid)", paddingTop: 10, opacity: remnant ? 1 : 0.75 }}>
            <div style={{ ...label, color: remnant ? "var(--ink)" : "var(--ink-3)" }}><Icon name="skull" size={12} />Remnant</div>
            <div style={{ fontSize: 13, lineHeight: 1.45, marginTop: 3 }}>{s.remnant}</div>
          </div>
        </div>
      )}
    </div>
  );
}
