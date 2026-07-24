// Online flow screens: Home, Login, Tables list, Lobby.
import { useEffect, useState } from "react";
import { api, type DirectoryUser, type InviteRow, type TableInfo } from "../api";
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
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const ready = username.trim().length >= 3 && password.length >= 6 && (mode === "signin" || name.trim().length > 0);

  async function submit() {
    setErr(null);
    setBusy(true);
    try {
      const r =
        mode === "signin"
          ? await api.login(username.trim(), password)
          : await api.register(username.trim(), name.trim(), password);
      setMe(r.user);
      setScreen("tables");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell title={mode === "signin" ? "Sign in" : "Create account"} back={() => setScreen("home")}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Button variant={mode === "signin" ? "primary" : "secondary"} size="sm" onClick={() => setMode("signin")}>
          Sign in
        </Button>
        <Button variant={mode === "signup" ? "primary" : "secondary"} size="sm" onClick={() => setMode("signup")}>
          Create account
        </Button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Input
          label="Username"
          value={username}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
          placeholder="grace"
          hint={mode === "signup" ? "3-20 characters: letters, numbers, underscore" : undefined}
          autoCapitalize="none"
          autoCorrect="off"
        />
        {mode === "signup" && (
          <Input
            label="Display name"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            placeholder="Grace"
            hint="How other players see you"
          />
        )}
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          placeholder="••••••••"
          hint={mode === "signup" ? "At least 6 characters" : undefined}
          onKeyDown={(e: React.KeyboardEvent) => e.key === "Enter" && ready && submit()}
        />
        <Button variant="gold" icon="arrow-right" disabled={!ready || busy} onClick={submit}>
          {mode === "signin" ? "Sign in" : "Create account & sign in"}
        </Button>
        {err && <div style={{ color: "var(--danger)", fontSize: 13 }}>{err}</div>}
      </div>
    </Shell>
  );
}

export function Tables() {
  const setScreen = useStore((s) => s.setScreen);
  const openLobby = useStore((s) => s.openLobby);
  const openOnlineGame = useStore((s) => s.openOnlineGame);
  const [tables, setTables] = useState<Omit<TableInfo, "seats">[]>([]);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [seatCount, setSeatCount] = useState(3);
  const [rounds, setRounds] = useState(12);

  async function refresh() {
    const [t, i] = await Promise.all([api.myTables(), api.myInvites()]);
    setTables(t.tables);
    setInvites(i.invites);
  }
  useEffect(() => {
    void refresh();
    const t = setInterval(refresh, 5000); // invitations arrive while you sit here
    return () => clearInterval(t);
  }, []);

  async function accept(inv: InviteRow) {
    setErr(null);
    try {
      const { table } = await api.acceptInvite(inv.id);
      openLobby(table.id);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "failed");
      void refresh();
    }
  }

  async function create() {
    const { table } = await api.createTable(seatCount, rounds);
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
    <Shell title="Lobby" back={() => setScreen("home")}>
      {invites.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "var(--gold, var(--influence))", marginBottom: 8 }}>
            Invitations
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {invites.map((inv) => (
              <div key={inv.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--paper-1)", border: "1.5px solid var(--influence)", borderRadius: "var(--r-md)" }}>
                <Icon name="bell" size={16} style={{ color: "var(--influence)" }} />
                <span style={{ fontSize: 14 }}>
                  <b>{inv.host_name}</b> invited you — {inv.rounds} rounds, {inv.humans} seated
                </span>
                <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                  <Button variant="gold" size="sm" icon="check" onClick={() => void accept(inv)}>
                    Accept
                  </Button>
                  <Button variant="ghost" size="sm" icon="x" onClick={() => api.declineInvite(inv.id).then(refresh)}>
                    Decline
                  </Button>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "var(--ink-3)" }}>Seats</span>
        {[2, 3, 4, 5].map((n) => (
          <Button key={n} variant={seatCount === n ? "primary" : "secondary"} size="sm" onClick={() => setSeatCount(n)}>
            {n}
          </Button>
        ))}
        <span style={{ marginLeft: 8, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "var(--ink-3)" }}>Rounds</span>
        {[9, 10, 12].map((n) => (
          <Button key={n} variant={rounds === n ? "primary" : "secondary"} size="sm" onClick={() => setRounds(n)}>
            {n}
          </Button>
        ))}
      </div>
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
  const [players, setPlayers] = useState<DirectoryUser[]>([]);
  const [pick, setPick] = useState("");

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
    api.directory().then((r) => setPlayers(r.users)).catch(() => {});
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
      {isHost && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 12, letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 6 }}>
            Invite a player
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <select
              className="cg-input"
              value={pick}
              onChange={(e) => setPick(e.target.value)}
              style={{ flex: 1, minWidth: 180, height: 44 }}
            >
              <option value="">Choose a player…</option>
              {players
                .filter((u) => u.id !== me?.id && !table.seats.some((s) => s.user_id === u.id))
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} (@{u.username})
                  </option>
                ))}
            </select>
            <Button
              variant="secondary"
              size="sm"
              icon="bell"
              disabled={!pick}
              onClick={() => api.invitePlayer(table.id, pick).then(() => { setPick(""); void refresh(); }).catch((e) => setErr(e.message))}
            >
              Invite
            </Button>
          </div>
          {(table.invites?.length ?? 0) > 0 && (
            <div style={{ marginTop: 8, fontSize: 13, color: "var(--ink-2)" }}>
              Invited: {table.invites!.map((i) => i.name).join(", ")} <span style={{ color: "var(--ink-3)" }}>(waiting)</span>
            </div>
          )}
        </div>
      )}
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
