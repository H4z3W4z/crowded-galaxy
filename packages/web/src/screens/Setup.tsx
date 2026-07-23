import { useState } from "react";
import { useStore } from "../store";
import { Button } from "@ds/components/core/Button.jsx";
import { Panel } from "@ds/components/core/Panel.jsx";
import { Icon } from "@ds/components/icons/Icon.jsx";
import { PLAYER_COLORS } from "@ds/components/game/PlayerChip.jsx";

interface SeatDraft {
  name: string;
  ai: boolean;
  enabled: boolean;
}

export function Setup() {
  const start = useStore((s) => s.start);
  const [rounds, setRounds] = useState(12);
  const [seats, setSeats] = useState<SeatDraft[]>([
    { name: "Mike", ai: false, enabled: true },
    { name: "Vex-7", ai: true, enabled: true },
    { name: "Oolan", ai: true, enabled: true },
    { name: "Player 4", ai: true, enabled: false },
    { name: "Player 5", ai: true, enabled: false },
  ]);

  const active = seats.filter((s) => s.enabled);
  const canStart = active.length >= 2 && active.some((s) => !s.ai);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Panel surface="paper" style={{ width: 520, maxWidth: "94vw" }}>
        <h1 style={{ fontSize: "var(--display-md)", marginBottom: 4 }}>Crowded Galaxy</h1>
        <div style={{ color: "var(--ink-2)", marginBottom: 20 }}>The galaxy is too small for everyone.</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {seats.map((seat, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                className="cg-btn cg-btn--ghost cg-btn--sm"
                onClick={() =>
                  setSeats(seats.map((s, j) => (j === i ? { ...s, enabled: i < 2 ? true : !s.enabled } : s)))
                }
                style={{ opacity: seat.enabled ? 1 : 0.35 }}
                title={i < 2 ? "Minimum two seats" : "Toggle seat"}
              >
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: (PLAYER_COLORS as any)[i + 1].color, border: "2px solid var(--ink)", display: "inline-block" }} />
              </button>
              <input
                className="cg-input"
                style={{ flex: 1, opacity: seat.enabled ? 1 : 0.35 }}
                value={seat.name}
                disabled={!seat.enabled}
                onChange={(e) => setSeats(seats.map((s, j) => (j === i ? { ...s, name: e.target.value } : s)))}
              />
              <Button
                variant={seat.ai ? "secondary" : "gold"}
                size="sm"
                icon={seat.ai ? "bot" : "user-round"}
                disabled={!seat.enabled}
                onClick={() => setSeats(seats.map((s, j) => (j === i ? { ...s, ai: !s.ai } : s)))}
              >
                {seat.ai ? "AI" : "Human"}
              </Button>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "var(--ink-2)" }}>
            Rounds
          </span>
          {[9, 10, 12].map((r) => (
            <Button key={r} variant={rounds === r ? "primary" : "secondary"} size="sm" onClick={() => setRounds(r)}>
              {r}
            </Button>
          ))}
          <span style={{ marginLeft: "auto", color: "var(--ink-3)", fontSize: 13 }}>12 is the playtest baseline</span>
        </div>

        <Button
          variant="gold"
          size="lg"
          icon="rocket"
          disabled={!canStart}
          onClick={() => start(active.map(({ name, ai }) => ({ name: name.trim() || "Player", ai })), rounds)}
          style={{ width: "100%" }}
        >
          Launch
        </Button>
        {!canStart && active.length >= 2 && (
          <div style={{ marginTop: 10, color: "var(--ink-3)", fontSize: 13, display: "flex", gap: 6, alignItems: "center" }}>
            <Icon name="triangle-alert" size={14} /> At least one seat must be human.
          </div>
        )}
      </Panel>
    </div>
  );
}
