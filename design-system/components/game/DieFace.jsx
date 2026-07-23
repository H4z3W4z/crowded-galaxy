import React from "react";

const PIPS = { 0: [], 1: [[50, 50]], 2: [[30, 30], [70, 70]], 3: [[28, 28], [50, 50], [72, 72]] };

/** Reinforcement die face (faces 0-0-0-1-2-3). Zero renders blank. */
export function DieFace({ value = 0, size = 48, style }) {
  const pips = PIPS[value] || [];
  return (
    <span title={`Die: ${value}`} style={{ position: "relative", display: "inline-block", width: size, height: size, background: "var(--card)", border: "var(--bw) solid var(--ink)", borderRadius: Math.round(size * 0.22), boxShadow: "var(--shadow-chunk-sm)", flexShrink: 0, ...style }}>
      {pips.map(([x, y], i) => (
        <span key={i} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", width: size * 0.2, height: size * 0.2, borderRadius: "50%", background: "var(--ink)" }}></span>
      ))}
    </span>
  );
}
