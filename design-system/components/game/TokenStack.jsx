import React from "react";
import { PLAYER_COLORS } from "./PlayerChip.jsx";

/** Population token stack: offset discs for depth, count on the front disc. */
export function TokenStack({ player = 1, count = 1, size = 28, style }) {
  const p = PLAYER_COLORS[player] || PLAYER_COLORS.neutral;
  const depth = Math.min(Math.max(count, 1), 3) - 1;
  const off = Math.round(size * 0.14);
  return (
    <span title={`${count} population`} style={{ position: "relative", display: "inline-block", width: size + depth * off, height: size + depth * off, ...style }}>
      {Array.from({ length: depth + 1 }).map((_, i) => {
        const front = i === depth;
        return (
          <span key={i} style={{ position: "absolute", left: (depth - i) * off, top: (depth - i) * off, width: size, height: size, borderRadius: "50%", background: p.color, border: "2px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: size * 0.46, color: "var(--on-accent)" }}>
            {front && count > 1 ? count : ""}
          </span>
        );
      })}
    </span>
  );
}
