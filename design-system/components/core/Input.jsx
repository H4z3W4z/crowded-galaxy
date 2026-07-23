import React from "react";

/** Labeled text input. */
export function Input({ label, hint, style, inputStyle, ...rest }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, fontFamily: "var(--font-body)", ...style }}>
      {label ? <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "var(--ink-2)" }}>{label}</span> : null}
      <input className="cg-input" style={inputStyle} {...rest} />
      {hint ? <span style={{ fontSize: 13, color: "var(--ink-3)" }}>{hint}</span> : null}
    </label>
  );
}
