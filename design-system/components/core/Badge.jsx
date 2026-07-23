import React from "react";
import { Icon } from "../icons/Icon.jsx";

const TONES = {
  ink: { bg: "var(--ink)", fg: "var(--paper-0)", border: "var(--ink)" },
  paper: { bg: "var(--paper-1)", fg: "var(--ink)", border: "var(--line-mid)" },
  gold: { bg: "var(--influence)", fg: "var(--on-accent)", border: "var(--ink)" },
  hazard: { bg: "var(--pt-volcanic-tint)", fg: "color-mix(in oklab,var(--hazard) 80%,var(--ink))", border: "var(--hazard)" },
  relic: { bg: "color-mix(in oklab,var(--relic) 16%,var(--paper-0))", fg: "var(--relic)", border: "var(--relic)" },
  wormhole: { bg: "color-mix(in oklab,var(--wormhole) 14%,var(--paper-0))", fg: "color-mix(in oklab,var(--wormhole) 75%,var(--ink))", border: "var(--wormhole)" },
  positive: { bg: "var(--pt-terran-tint)", fg: "color-mix(in oklab,var(--pt-terran) 70%,var(--ink))", border: "var(--pt-terran)" },
};

/** Small pill label: statuses, tags, board modifiers. */
export function Badge({ tone = "paper", icon, mono = false, children, style }) {
  const t = TONES[tone] || TONES.paper;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 24, padding: "0 10px", background: t.bg, color: t.fg, border: `1.5px solid ${t.border}`, borderRadius: "var(--r-pill)", fontFamily: mono ? "var(--font-mono)" : "var(--font-body)", fontSize: 12, fontWeight: 700, letterSpacing: mono ? 0 : "var(--tracking-caps)", textTransform: mono ? "none" : "uppercase", whiteSpace: "nowrap", ...style }}>
      {icon ? <Icon name={icon} size={13} /> : null}
      {children}
    </span>
  );
}
