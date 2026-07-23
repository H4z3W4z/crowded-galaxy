// Online flow screens: Home, Login, Tables list, Lobby.
import { useEffect, useState } from "react";
import { api, type TableInfo } from "../api";
import { useStore } from "../store";
import { Button } from "@ds/components/core/Button.jsx";
import { Panel } from "@ds/components/core/Panel.jsx";
import { Badge } from "@ds/components/core/Badge.jsx";
import { Input } from "@ds/components/core/Input.jsx";
import { Icon } from "@ds/components/icons/Icon.jsx";
import { PlayerChip } from "@ds/components/game/PlayerChip.jsx";

function Shell({ title, children, back }: { title: string; children: React.ReactNode; back?: () => void }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Panel surface="paper" style={{ width: 560, maxWidth: "94vw" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          {back && <Button variant="ghost" size="sm" icon="chevron-left" onClick={back} />}
          <h1 style={{ fontSize: "var(--display-sm)" }}>{title}</h1>
        </div>
        {children}
      </Panel>
    </div>
  );
}

export function Home() {
  const setScreen = useStore((s) => s.setScreen);
  const me = useStore((s) => s.me);
  return (
    <Shell title="Crowded Galaxy">
      <div style={{ color: "var(--ink-2)", marginBottom: 20 }}>The galaxy is too small for everyone.</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Button variant="gold" size="lg" icon="rocket" onClick={() => setScreen("localSetup")}>
          Local game (this device)
        </Button>
        <Button variant="primary" size="lg" icon="users" onClick={() => setScreen(me ? "tables" : "login")}>
          Play online {me ? `— ${me.name}` : ""}
        </Button>
      </div>
    </Shell>
  );
}

export function Login() {
  const setScreen = useStore((s) => s.setScreen);
  const setMe = useStore((s) => s.setMe);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [devLink, setDevLink] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function request() {
    setErr(null);
    try {
      const r = await api.requestMagicLink(email.trim(), name.trim() || email.split("@")[0]!);
      setSent(true);
      setDevLink(r.devLink ?? null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "failed");
    }
  }

  async function followDevLink() {
    // Dev convenience: the server hands back the link so LAN playtests skip email.
    await fetch(devLink!, { credentials: "same-origin" });
    const { user } = await api.me();
    setMe(user);
    setScreen("tables");
  }

  return (
    <Shell title="Sign in" back={() => setScreen("home")}>
      {!sent ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Input label="Display name" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} placeholder="Grace" />
          <Input label="Email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} placeholder="you@example.com" />
          <Button variant="gold" icon="arrow-right" disabled={!email.includes("@")} onClick={request}>
            Send magic link
          </Button>
          {err && <div style={{ color: "var(--danger)", fontSize: 13 }}>{err}</div>}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ color: "var(--ink-2)" }}>Check your email for the sign-in link.</div>
          {devLink && (
            <Button variant="secondary" icon="door-open" onClick={followDevLink}>
              Dev shortcut: sign in now
            </Button>
          )}
        </div>
      )}
    </Shell>
  );
}

export function Tables() {
  const setScreen = useStore((s) => s.setScreen);
  const openLobby = useStore((s) => s.openLobby);
  const openOnlineGame = useStore((s) => s.openOnlineGame);
  const [tables, setTables] = useState<Omit<TableInfo, "seats">[]>([]);
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    const r = await api.myTables();
    setTables(r.tables);
  }
  useEffect(() => {
    void refresh();
  }, []);

  async function create() {
    const { table } = await api.createTable(3, 12);
    openLobby(table.id);
  }

  async function join() {
    setErr(null);
    try {
      const { table } = await api.joinTable(code.trim());
      openLobby(table.id);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "failed");
    }
  }

  return (
    <Shell title="Online tables" back={() => setScreen("home")}>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <Button variant="gold" icon="plus" onClick={create}>
          New table
        </Button>
        <Input value={code} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value)} placeholder="Invite code" style={{ flex: 1 }} />
        <Button variant="secondary" icon="door-open" disabled={code.trim().length < 4} onClick={join}>
          Join
        </Button>
      </div>
      {err && <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 8 }}>{err}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {tables.length === 0 && <div style={{ color: "var(--ink-3)" }}>No tables yet — start one and share the invite code.</div>}
        {tables.map((t) => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--paper-1)", border: "1.5px solid var(--line-mid)", borderRadius: "var(--r-md)" }}>
            <Badge mono>{t.invite_code}</Badge>
            <span style={{ color: "var(--ink-2)", fontSize: 13 }}>
              {t.status} · {t.rounds} rounds
            </span>
            <span style={{ marginLeft: "auto" }}>
              {t.status === "lobby" ? (
                <Button variant="secondary" size="sm" onClick={() => openLobby(t.id)}>
                  Open lobby
                </Button>
              ) : t.game_id ? (
                <Button variant="gold" size="sm" icon="rocket" onClick={() => void openOnlineGame(t.game_id!)}>
                  {t.status === "finished" ? "Review" : "Resume"}
                </Button>
              ) : null}
            </span>
          </div>
        ))}
      </div>
    </Shell>
  );
}

export function Lobby() {
  const tableId = useStore((s) => s.lobbyTableId)!;
  const setScreen = useStore((s) => s.setScreen);
  const openOnlineGame = useStore((s) => s.openOnlineGame);
  const me = useStore((s) => s.me);
  const [table, setTable] = useState<TableInfo | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    try {
      const { table } = await api.getTable(tableId);
      setTable(table);
      if (table.status === "playing" && table.game_id) void openOnlineGame(table.game_id);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "failed");
    }
  }

  // Lobby freshness: poll every 2s. (The WS channel is game-scoped; the lobby
  // predates the game, so polling keeps v1 simple.)
  useEffect(() => {
    void refresh();
    const t = setInterval(refresh, 2000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableId]);

  if (!table) return <Shell title="Lobby">{err ?? "Loading…"}</Shell>;
  const isHost = me?.id === table.host_id;
  const humans = table.seats.filter((s) => s.user_id !== null).length;

  return (
    <Shell title="Table lobby" back={() => setScreen("tables")}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ color: "var(--ink-2)" }}>Invite code</span>
        <Badge tone="gold" mono>
          {table.invite_code}
        </Badge>
        <span style={{ color: "var(--ink-3)", fontSize: 13 }}>· {table.rounds} rounds</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {table.seats.map((s) => (
          <div key={s.seat_idx} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <PlayerChip player={s.seat_idx + 1} name={s.name} ai={s.ai && !s.user_id} size="sm" />
            {s.user_id === null && (
              <>
                <Badge>{s.ai ? "AI seat" : "Waiting for player"}</Badge>
                {isHost && (
                  <Button variant="ghost" size="sm" onClick={() => api.editSeat(table.id, s.seat_idx, { ai: !s.ai }).then(refresh)}>
                    {s.ai ? "Open for humans" : "Make AI"}
                  </Button>
                )}
              </>
            )}
            {s.user_id === me?.id && <Badge tone="positive">You</Badge>}
          </div>
        ))}
      </div>
      {isHost ? (
        <Button variant="gold" size="lg" icon="rocket" onClick={() => api.startTable(table.id).then(({ gameId }) => void openOnlineGame(gameId)).catch((e) => setErr(e.message))}>
          Start game ({humans} human{humans === 1 ? "" : "s"})
        </Button>
      ) : (
        <div style={{ color: "var(--ink-2)", display: "flex", gap: 8, alignItems: "center" }}>
          <Icon name="hourglass" size={16} /> Waiting for the host to start…
        </div>
      )}
      {err && <div style={{ color: "var(--danger)", fontSize: 13, marginTop: 8 }}>{err}</div>}
    </Shell>
  );
}
