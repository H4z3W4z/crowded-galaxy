import React from "react";

/** Surface container. surface="paper" cream card | "inset" recessed well | "space" dark map window. */
export function Panel({ surface = "paper", pad = "var(--space-5)", shadow = true, children, style }) {
  const surfaces = {
    paper: { background: "var(--card)", border: "var(--bw) solid var(--ink)", color: "var(--ink)", boxShadow: shadow ? "var(--shadow-chunk)" : "none" },
    inset: { background: "var(--paper-1)", border: "1.5px solid var(--line-mid)", color: "var(--ink)", boxShadow: "none" },
    space: { background: "radial-gradient(120% 120% at 50% 30%, var(--space-1), var(--space-0) 70%)", border: "var(--bw) solid var(--ink)", color: "var(--starlight)", boxShadow: shadow ? "var(--shadow-chunk)" : "none" },
  };
  return <div style={{ borderRadius: "var(--r-lg)", padding: pad, ...surfaces[surface], ...style }}>{children}</div>;
}
