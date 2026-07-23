import React from "react";
import { SpeciesCard } from "./SpeciesCard.jsx";
import { TraitCard } from "./TraitCard.jsx";
import { Icon } from "../icons/Icon.jsx";

/** Market slot: Trait + Species pair, combined pop, Influence sitting on the slot. */
export function ComboSlot({ species, trait, influence = 0, free = false, compact = true, selected = false, onSelect, style }) {
  const pop = (species?.population || 0) + (trait?.population || 0);
  return (
    <div onClick={onSelect} role={onSelect ? "button" : undefined} tabIndex={onSelect ? 0 : undefined}
      style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: selected ? "var(--card)" : "var(--paper-1)", border: selected ? "var(--bw) solid var(--ink)" : "1.5px solid var(--line-mid)", borderRadius: "var(--r-xl)", boxShadow: selected ? "var(--shadow-pop)" : "none", cursor: onSelect ? "pointer" : "default", transition: "box-shadow var(--dur-fast) var(--ease-snap), transform var(--dur-fast) var(--ease-snap)", transform: selected ? "translate(-1px,-1px)" : "none", ...style }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 0, flex: "1 1 auto", minWidth: 0 }}>
        <div style={{ flex: "0 1 190px", minWidth: 110, transform: "rotate(-2deg) translateX(8px)", zIndex: 0 }}><TraitCard trait={trait} compact={compact} width="100%" /></div>
        <div style={{ flex: "0 1 220px", minWidth: 145, zIndex: 1 }}><SpeciesCard species={species} compact={compact} width="100%" /></div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginLeft: "auto", flexShrink: 0 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 17 }} title="Combined population"><Icon name="users" size={17} />{pop}</span>
        {free ? <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 12, letterSpacing: "var(--tracking-caps)", color: "var(--ink-2)" }}>FREE</span> : null}
        {influence > 0 ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4, height: 24, padding: "0 9px", background: "var(--influence)", border: "1.5px solid var(--ink)", borderRadius: "var(--r-pill)", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 12, color: "var(--on-accent)" }} title="Influence waiting on this combo"><Icon name="star" size={12} />+{influence}</span> : null}
      </div>
    </div>
  );
}
