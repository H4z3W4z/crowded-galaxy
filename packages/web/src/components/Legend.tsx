// Tappable map legend — the touch-friendly answer to "what does that symbol mean?".
import { useState } from "react";
import { PlanetOrb } from "@ds/components/game/PlanetOrb.jsx";
import { IconButton } from "@ds/components/core/IconButton.jsx";
import { MAP_LEGEND, PLANET_LEGEND } from "../legend";

export function LegendButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div style={{ position: "absolute", top: 12, right: 12, zIndex: 5 }}>
        <IconButton name="eye" size="md" variant="secondary" label="Map legend" onClick={() => setOpen(true)} />
      </div>
      {open && <LegendPanel onClose={() => setOpen(false)} />}
    </>
  );
}

function LegendPanel({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{ position: "absolute", inset: 0, background: "rgba(7,6,18,.7)", zIndex: 10, display: "flex", justifyContent: "flex-end" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 420,
          maxWidth: "92%",
          height: "100%",
          overflowY: "auto",
          background: "var(--paper-0)",
          borderLeft: "var(--bw) solid var(--ink)",
          padding: 18,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
          <h2 style={{ fontSize: "var(--display-sm)", flex: 1 }}>Map key</h2>
          <IconButton name="x" size="sm" variant="ghost" label="Close" onClick={onClose} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {MAP_LEGEND.map((e, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 52, flexShrink: 0 }}>{e.swatch}</div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, marginBottom: 2 }}>{e.title}</div>
                <div style={{ fontSize: 13, lineHeight: 1.45, color: "var(--ink-2)" }}>{e.body}</div>
              </div>
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: "var(--text-lg)", margin: "22px 0 10px" }}>Planet types</h3>
        <div style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 10, lineHeight: 1.45 }}>
          Each system holds 1–3 planets. A species scores +1 Influence from every system it controls that contains at least one of its favored planet types.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {PLANET_LEGEND.map((p) => (
            <div key={p.type} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <PlanetOrb type={p.type} size={28} />
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 }}>{p.label}</span>
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: "var(--text-lg)", margin: "22px 0 10px" }}>The spiral</h3>
        <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>
          The galaxy is four spiral arms around a dense, heavily defended core. New civilizations enter at the Rim Gates on the outer frontier and push inward. The core holds most of the Relics — it's the contested prize. Wormholes are the only fast way across the galaxy.
        </div>
      </div>
    </div>
  );
}
