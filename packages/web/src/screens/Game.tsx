import { useEffect, useMemo, useState } from "react";
import {
  aiNextAction,
  checkConquest,
  checkRemnantConquest,
  conversionTargets,
  hasPlanet,
  legalTargets,
  SPECIES,
  SYSTEMS,
  systemsOf,
  TRAITS,
  type PlanetType,
} from "@cg/engine";
import { useStore } from "../store";
import { MapView } from "../components/MapView";
import { Button } from "@ds/components/core/Button.jsx";
import { Panel } from "@ds/components/core/Panel.jsx";
import { Badge } from "@ds/components/core/Badge.jsx";
import { PlayerChip } from "@ds/components/game/PlayerChip.jsx";
import { SpeciesCard } from "@ds/components/cards/SpeciesCard.jsx";
import { TraitCard } from "@ds/components/cards/TraitCard.jsx";
import { ComboSlot } from "@ds/components/cards/ComboSlot.jsx";
import { PlanetIcon, PLANET_TYPES } from "@ds/components/icons/PlanetIcon.jsx";
import { DieFace } from "@ds/components/game/DieFace.jsx";

const AI_DELAY_MS = 450;
const PLANETS: PlanetType[] = ["terran", "ocean", "barren", "gas_giant", "ice", "volcanic"];

export function Game() {
  const game = useStore((s) => s.game)!;
  const dispatch = useStore((s) => s.dispatch);
  const undo = useStore((s) => s.undo);
  const reset = useStore((s) => s.reset);
  const selected = useStore((s) => s.selected);
  const select = useStore((s) => s.select);
  const error = useStore((s) => s.error);
  const clearError = useStore((s) => s.clearError);

  const mode = useStore((s) => s.mode);
  const mySeat = useStore((s) => s.mySeat);
  const player = game.current;
  const seat = game.config.seats[player]!;
  const p = game.players[player]!;
  // "waiting" = this device may not act right now (AI turn locally, or someone else online).
  const isAI = mode === "local" ? seat.ai : mySeat === null || player !== mySeat;
  const over = game.phase === "over";

  // AI autoplay — local mode only; online, the server plays AI seats.
  useEffect(() => {
    if (mode !== "local" || !seat.ai || over) return;
    const t = setTimeout(() => dispatch(aiNextAction(game)), AI_DELAY_MS);
    return () => clearTimeout(t);
  }, [game, seat.ai, over, dispatch, mode]);

  // Error toast auto-clear.
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(clearError, 3200);
    return () => clearTimeout(t);
  }, [error, clearError]);

  const reachable = useMemo(() => {
    const m = new Map<string, number>();
    if (!isAI && game.phase === "conquer" && p.active) {
      for (const { target, cost } of legalTargets(game, player)) m.set(target, cost);
    }
    return m;
  }, [game, player, isAI, p.active]);

  const conversions = useMemo(
    () => (!isAI && game.phase === "conquer" ? conversionTargets(game, player) : []),
    [game, player, isAI],
  );

  const needsMarket = !isAI && game.phase === "start" && !p.active;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
        <MapView game={game} selected={selected} reachable={reachable} onSelect={(id) => select(selected === id ? null : id)} />
        {mode === "online" && <ConnBadge />}
        {error && (
          <div style={{ position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)", background: "var(--pt-volcanic)", color: "var(--paper-0)", border: "var(--bw) solid var(--ink)", borderRadius: "var(--r-md)", boxShadow: "var(--shadow-chunk)", padding: "10px 18px", fontFamily: "var(--font-display)", fontWeight: 700 }}>
            {error}
          </div>
        )}
      </div>

      <div style={{ width: 400, flexShrink: 0, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 12, borderLeft: "var(--bw) solid var(--ink)", background: "var(--paper-0)" }}>
        <Header round={game.round} rounds={game.config.rounds} />
        <Players game={game} />
        {over ? (
          <GameOver game={game} onAgain={reset} />
        ) : isAI ? (
          <Panel surface="inset" pad="14px">
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ink-2)" }}>
              <span className="cg-spin" /> {seat.ai ? `${seat.name} is thinking…` : `Waiting for ${seat.name}…`}
            </div>
          </Panel>
        ) : (
          <>
            <CivPanel game={game} />
            <PhaseControls game={game} selected={selected} conversions={conversions} reachable={reachable} />
          </>
        )}
        <Log game={game} />
        {!over && !isAI && mode === "local" && (
          <Button variant="ghost" size="sm" icon="chevron-left" onClick={undo}>
            Undo
          </Button>
        )}
        {mode === "online" && (
          <Button variant="ghost" size="sm" icon="door-open" onClick={reset}>
            Leave game (keeps running)
          </Button>
        )}
      </div>

      {needsMarket && <MarketOverlay game={game} online={mode === "online"} onLeave={reset} />}
    </div>
  );
}

function ConnBadge() {
  const conn = useStore((s) => s.conn);
  if (conn === "live") return null;
  return (
    <div style={{ position: "absolute", top: 12, left: 12, background: "var(--paper-2)", border: "1.5px solid var(--line-mid)", borderRadius: "var(--r-pill)", padding: "4px 12px", fontSize: 12, color: "var(--ink-2)", display: "flex", alignItems: "center", gap: 6 }}>
      <span className="cg-spin" style={{ width: 11, height: 11 }} /> {conn === "connecting" ? "Connecting…" : "Reconnecting…"}
    </div>
  );
}

function Header({ round, rounds }: { round: number; rounds: number }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
      <h2 style={{ fontSize: "var(--display-sm)" }}>Crowded Galaxy</h2>
      <Badge tone="ink" mono>
        {round > rounds ? "Final" : `Round ${round}/${rounds}`}
      </Badge>
    </div>
  );
}

function Players({ game }: { game: ReturnType<typeof useStore.getState>["game"] & object }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {game.config.seats.map((seat: { name: string; ai: boolean }, i: number) => (
        <PlayerChip key={i} player={i + 1} name={seat.name} ai={seat.ai} influence={game.players[i]!.influence} active={game.current === i && game.phase !== "over"} size="sm" />
      ))}
    </div>
  );
}

function CivPanel({ game }: { game: NonNullable<ReturnType<typeof useStore.getState>["game"]> }) {
  const p = game.players[game.current]!;
  if (!p.active) return null;
  const sp = SPECIES[p.active.species]!;
  const tr = TRAITS[p.active.trait]!;
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <SpeciesCard species={sp} compact width={200} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <TraitCard trait={tr} compact width="100%" />
        <Panel surface="inset" pad="10px">
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>
            Hand: <b style={{ fontSize: 17 }}>{p.active.hand}</b> tokens
          </div>
          <div style={{ color: "var(--ink-3)", fontSize: 12 }}>Turn {p.active.turnsActive + 1} of this civilization</div>
        </Panel>
      </div>
    </div>
  );
}

function PhaseControls({
  game,
  selected,
  conversions,
  reachable,
}: {
  game: NonNullable<ReturnType<typeof useStore.getState>["game"]>;
  selected: string | null;
  conversions: string[];
  reachable: Map<string, number>;
}) {
  const dispatch = useStore((s) => s.dispatch);
  const player = game.current;
  const p = game.players[player]!;
  const civ = p.active;

  if (game.phase === "start") {
    if (!civ) return null; // market overlay handles it
    return (
      <Panel surface="inset" pad="12px">
        <ActionTitle>Begin your turn</ActionTitle>
        <Row>
          <Button variant="gold" size="sm" icon="rocket" onClick={() => dispatch({ type: "recall", take: recallAllSpare(game) })}>
            Recall spare & expand
          </Button>
          <Button variant="secondary" size="sm" onClick={() => dispatch({ type: "recall", take: {} })}>
            Expand without recall
          </Button>
        </Row>
        <Row style={{ marginTop: 8 }}>
          <Button variant="danger" size="sm" icon="skull" onClick={() => dispatch({ type: "collapse" })}>
            Collapse into Remnant
          </Button>
        </Row>
      </Panel>
    );
  }

  if (game.phase === "conquer") {
    const sel = selected;
    const check = sel ? checkConquest(game, player, sel) : null;
    const cost = sel ? reachable.get(sel) : undefined;
    const short = cost !== undefined && civ ? cost - civ.hand : 0;
    const hasCryari = p.remnants.some((r) => r.species === "cryari_revenants");
    const march = sel && hasCryari && !game.turn.remnantConquerUsed ? checkRemnantConquest(game, player, sel) : null;
    return (
      <Panel surface="inset" pad="12px">
        <ActionTitle>
          Conquest — hand {civ?.hand} {game.turn.lastDieRoll !== null && <DieFace value={game.turn.lastDieRoll} size={22} style={{ verticalAlign: "middle", marginLeft: 6 }} />}
        </ActionTitle>
        {civ?.trait === "adaptive" && !game.turn.adaptiveHabitat && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: "var(--ink-2)", marginBottom: 4 }}>Adaptive: pick a second habitat for this turn</div>
            <Row>
              {PLANETS.map((pt) => (
                <button key={pt} className="cg-btn cg-btn--ghost cg-btn--sm" onClick={() => dispatch({ type: "chooseAdaptiveHabitat", habitat: pt })} title={(PLANET_TYPES as any)[pt].label}>
                  <PlanetIcon type={pt} size={16} variant="glyph" />
                </button>
              ))}
            </Row>
          </div>
        )}
        {sel && cost !== undefined ? (
          <>
            <SystemSummary id={sel} />
            <Row style={{ marginTop: 8 }}>
              {short <= 0 && (
                <Button variant="gold" size="sm" icon="swords" onClick={() => dispatch({ type: "conquer", target: sel })}>
                  Conquer for {cost}
                </Button>
              )}
              {short >= 1 && short <= 3 && civ && civ.hand >= 1 && !game.turn.finalConquestUsed && (
                <Button variant="danger" size="sm" icon="dices" onClick={() => dispatch({ type: "finalConquest", target: sel })}>
                  Gamble the die (short {short})
                </Button>
              )}
              {short > 3 && (
                <span style={{ fontSize: 13, color: "var(--ink-3)" }}>
                  You are {short} tokens short — too far even for the die.
                </span>
              )}
            </Row>
          </>
        ) : sel && check && !check.legal ? (
          <div style={{ fontSize: 13, color: "var(--ink-3)" }}>
            {SYSTEMS[sel]!.name}: {check.reason}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: "var(--ink-3)" }}>Select a highlighted system to conquer.</div>
        )}
        {march?.legal && sel && (
          <Row style={{ marginTop: 8 }}>
            <Button variant="secondary" size="sm" icon="skull" onClick={() => dispatch({ type: "remnantConquer", target: sel })}>
              March the Revenants ({march.cost})
            </Button>
          </Row>
        )}
        {conversions.length > 0 && selected && conversions.includes(selected) && (
          <Row style={{ marginTop: 8 }}>
            <Button variant="secondary" size="sm" icon="sparkles" onClick={() => dispatch({ type: "convertToken", target: selected })}>
              Convert lone token (free)
            </Button>
          </Row>
        )}
        <Row style={{ marginTop: 10 }}>
          <Button variant="primary" size="sm" icon="arrow-right" onClick={() => dispatch({ type: "endConquests" })}>
            Done conquering
          </Button>
        </Row>
      </Panel>
    );
  }

  if (game.phase === "redeploy") {
    return <RedeployControls game={game} />;
  }

  if (game.phase === "post") {
    const own = systemsOf(game, player, "active");
    const starbases = own.reduce((s, id) => s + game.systems[id]!.starbases, 0);
    const hasMapActions =
      (civ?.trait === "fortress_building" && !game.turn.starbasePlaced && starbases < 6) ||
      civ?.trait === "heroic" ||
      (civ?.species === "verdant_mycelium" && !game.turn.verdantPlaced);
    return (
      <Panel surface="inset" pad="12px">
        <ActionTitle>Consolidate</ActionTitle>
        {hasMapActions && !selected && (
          <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 8 }}>
            Select one of your systems on the map to use your civilization's placement abilities.
          </div>
        )}
        {civ?.trait === "fortress_building" && !game.turn.starbasePlaced && starbases < 6 && selected && own.includes(selected) && (
          <Row>
            <Button variant="secondary" size="sm" icon="castle" onClick={() => dispatch({ type: "placeStarbase", system: selected })}>
              Starbase on {selected}
            </Button>
          </Row>
        )}
        {civ?.trait === "heroic" && selected && own.includes(selected) && (
          <Row style={{ marginTop: 6 }}>
            <Button
              variant="secondary"
              size="sm"
              icon="shield"
              onClick={() => {
                const cur = own.filter((id) => game.systems[id]!.bulwark);
                const next = cur.includes(selected) ? cur.filter((x) => x !== selected) : [...cur, selected].slice(-2);
                dispatch({ type: "moveBulwarks", systems: next });
              }}
            >
              Toggle Bulwark on {selected}
            </Button>
          </Row>
        )}
        {civ?.species === "verdant_mycelium" && !game.turn.verdantPlaced && selected && own.includes(selected) && hasPlanet(selected, "terran") && (
          <Row style={{ marginTop: 6 }}>
            <Button variant="secondary" size="sm" icon="leaf" onClick={() => dispatch({ type: "verdantGrow", system: selected })}>
              Grow on {selected}
            </Button>
          </Row>
        )}
        {civ?.trait === "diplomatic" && (
          <Row style={{ marginTop: 6 }}>
            {game.config.seats.map((s: { name: string }, i: number) =>
              i === player ? null : (
                <Button key={i} variant={p.diplomaticTarget === i ? "primary" : "secondary"} size="sm" onClick={() => dispatch({ type: "nameDiplomaticTarget", player: i })}>
                  Pact: {s.name}
                </Button>
              ),
            )}
          </Row>
        )}
        <Row style={{ marginTop: 10 }}>
          <Button variant="gold" size="sm" icon="star" onClick={() => dispatch({ type: "endTurn" })}>
            Score & end turn
          </Button>
          {civ?.trait === "twilight" && (
            <Button variant="danger" size="sm" icon="skull" onClick={() => dispatch({ type: "collapse" })}>
              Score, then Collapse
            </Button>
          )}
        </Row>
      </Panel>
    );
  }

  return null;
}

function RedeployControls({ game }: { game: NonNullable<ReturnType<typeof useStore.getState>["game"]> }) {
  const dispatch = useStore((s) => s.dispatch);
  const player = game.current;
  const p = game.players[player]!;
  const own = systemsOf(game, player, "active");
  const board = own.reduce((s, id) => s + game.systems[id]!.tokens, 0);
  const available = Math.max(0, board + (p.active?.hand ?? 0) - game.turn.jovianBonus);
  const [dist, setDist] = useState<Record<string, number>>(() => Object.fromEntries(own.map((id) => [id, game.systems[id]!.tokens])));
  const used = Object.values(dist).reduce((s, n) => s + n, 0);
  const pool = available - used;

  return (
    <Panel surface="inset" pad="12px">
      <ActionTitle>
        Redeploy — pool <b>{pool}</b>
        {game.turn.jovianBonus > 0 && <span style={{ color: "var(--ink-3)", fontSize: 12 }}> (returning {game.turn.jovianBonus} Reaver tokens)</span>}
      </ActionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 220, overflowY: "auto" }}>
        {own.map((id) => (
          <div key={id} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-mono)", fontSize: 13 }}>
            <span style={{ width: 30 }}>{id}</span>
            <span style={{ flex: 1, color: "var(--ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{SYSTEMS[id]!.name}</span>
            <button className="cg-btn cg-btn--ghost cg-btn--sm" disabled={(dist[id] ?? 0) <= 1} onClick={() => setDist({ ...dist, [id]: (dist[id] ?? 0) - 1 })}>
              −
            </button>
            <b style={{ width: 20, textAlign: "center" }}>{dist[id] ?? 0}</b>
            <button className="cg-btn cg-btn--ghost cg-btn--sm" disabled={pool <= 0} onClick={() => setDist({ ...dist, [id]: (dist[id] ?? 0) + 1 })}>
              +
            </button>
          </div>
        ))}
      </div>
      <Row style={{ marginTop: 10 }}>
        <Button variant="gold" size="sm" icon="check" disabled={pool < 0} onClick={() => dispatch({ type: "redeploy", dist })}>
          Confirm deployment
        </Button>
        <Button variant="secondary" size="sm" onClick={() => dispatch({ type: "endTurn" })}>
          Keep as is & end turn
        </Button>
      </Row>
      {pool > 0 && (
        <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6 }}>
          {pool} unassigned token{pool === 1 ? "" : "s"} will stay in hand until next turn.
        </div>
      )}
    </Panel>
  );
}

function MarketOverlay({
  game,
  online,
  onLeave,
}: {
  game: NonNullable<ReturnType<typeof useStore.getState>["game"]>;
  online: boolean;
  onLeave: () => void;
}) {
  const dispatch = useStore((s) => s.dispatch);
  const p = game.players[game.current]!;
  const [pick, setPick] = useState<number | null>(null);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(7,6,18,.72)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 40 }}>
      <Panel surface="paper" style={{ width: 700, maxWidth: "96vw", maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 2 }}>
          <h2 style={{ fontSize: "var(--display-sm)", flex: 1 }}>Choose your next civilization</h2>
          {online && (
            <Button variant="ghost" size="sm" icon="door-open" onClick={onLeave}>
              Leave
            </Button>
          )}
        </div>
        <div style={{ color: "var(--ink-2)", marginBottom: 14 }}>
          {game.config.seats[game.current]!.name} — {p.influence} Influence. Skipping a combo costs 1 Influence per slot passed.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {game.market.map((slot, i) => (
            <div key={i} style={{ opacity: i > p.influence ? 0.45 : 1 }}>
              <ComboSlot
                species={SPECIES[slot.species]}
                trait={TRAITS[slot.trait]}
                influence={slot.influence}
                free={i === 0}
                selected={pick === i}
                onSelect={() => (i <= p.influence ? setPick(pick === i ? null : i) : null)}
              />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center" }}>
          <Button variant="gold" size="md" icon="rocket" disabled={pick === null} onClick={() => pick !== null && dispatch({ type: "chooseCivilization", slot: pick })}>
            {pick === null ? "Select a combination" : pick === 0 ? "Launch (free)" : `Launch (pay ${pick} Influence)`}
          </Button>
        </div>
      </Panel>
    </div>
  );
}

function GameOver({ game, onAgain }: { game: NonNullable<ReturnType<typeof useStore.getState>["game"]>; onAgain: () => void }) {
  const standings = game.players
    .map((p, i) => ({ i, influence: p.influence }))
    .sort((a, b) => b.influence - a.influence);
  return (
    <Panel surface="paper">
      <h2 style={{ fontSize: "var(--display-sm)", marginBottom: 10 }}>
        {game.winners!.length > 1 ? "Shared victory" : `${game.config.seats[game.winners![0]!]!.name} rules the galaxy`}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
        {standings.map(({ i, influence }) => (
          <PlayerChip key={i} player={i + 1} name={game.config.seats[i]!.name} ai={game.config.seats[i]!.ai} influence={influence} active={game.winners!.includes(i)} />
        ))}
      </div>
      <Button variant="gold" icon="rocket" onClick={onAgain}>
        Done
      </Button>
    </Panel>
  );
}

function Log({ game }: { game: NonNullable<ReturnType<typeof useStore.getState>["game"]> }) {
  const entries = game.log.slice().reverse();
  return (
    <Panel surface="inset" pad="10px" style={{ marginTop: "auto" }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 11, letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 6 }}>
        Chronicle
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3, maxHeight: 190, overflowY: "auto" }}>
        {entries.map((e, i) => (
          <div key={game.log.length - i} style={{ fontSize: 12, color: i === 0 ? "var(--ink)" : "var(--ink-3)" }}>
            <span style={{ fontFamily: "var(--font-mono)", color: `var(--p${e.player + 1}-deep)` }}>{game.config.seats[e.player]!.name}</span>{" "}
            <span style={{ color: "var(--ink-3)", fontFamily: "var(--font-mono)", fontSize: 10 }}>r{e.round}</span> {e.text}
          </div>
        ))}
      </div>
    </Panel>
  );
}

function SystemSummary({ id }: { id: string }) {
  const def = SYSTEMS[id]!;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      <b style={{ fontFamily: "var(--font-display)" }}>{def.name}</b>
      {def.planets.map((p, i) => (
        <PlanetIcon key={i} type={p} size={14} />
      ))}
      {def.hazard && <Badge tone="hazard">Hazard</Badge>}
      {def.relic && <Badge tone="relic">Relic</Badge>}
      {def.rimGate && <Badge>Rim gate</Badge>}
    </div>
  );
}

function ActionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 8 }}>
      {children}
    </div>
  );
}

function Row({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ display: "flex", gap: 8, flexWrap: "wrap", ...style }}>{children}</div>;
}

function recallAllSpare(game: NonNullable<ReturnType<typeof useStore.getState>["game"]>): Record<string, number> {
  const take: Record<string, number> = {};
  for (const id of systemsOf(game, game.current, "active")) {
    const spare = game.systems[id]!.tokens - 1;
    if (spare > 0) take[id] = spare;
  }
  return take;
}
