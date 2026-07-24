import type { Action, GameState } from "@cg/engine";

export interface Me {
  id: string;
  username: string;
  name: string;
}

export interface DirectoryUser {
  id: string;
  username: string;
  name: string;
}

export interface InviteRow {
  id: string;
  table_id: string;
  rounds: number;
  host_name: string;
  humans: number;
}

export interface SeatRow {
  seat_idx: number;
  user_id: string | null;
  ai: boolean;
  name: string;
}

export interface TableInfo {
  id: string;
  host_id: string;
  invite_code: string;
  status: "lobby" | "playing" | "finished";
  rounds: number;
  game_id: string | null;
  seats: SeatRow[];
  invites?: { id: string; status: string; name: string }[];
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: "same-origin",
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
    ...init,
  });
  const body = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new ApiError(body.error ?? `HTTP ${res.status}`, res.status);
  return body;
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export const api = {
  me: () => req<{ user: Me | null }>("/api/me"),
  register: (username: string, name: string, password: string) =>
    req<{ user: Me }>("/api/auth/register", { method: "POST", body: JSON.stringify({ username, name, password }) }),
  login: (username: string, password: string) =>
    req<{ user: Me }>("/api/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  logout: () => req<{ ok: boolean }>("/api/auth/logout", { method: "POST" }),
  directory: () => req<{ users: DirectoryUser[] }>("/api/users"),
  myInvites: () => req<{ invites: InviteRow[] }>("/api/invites"),
  invitePlayer: (tableId: string, userId: string) =>
    req<{ table: TableInfo }>(`/api/tables/${tableId}/invite`, { method: "POST", body: JSON.stringify({ userId }) }),
  acceptInvite: (id: string) => req<{ table: TableInfo }>(`/api/invites/${id}/accept`, { method: "POST" }),
  declineInvite: (id: string) => req<{ ok: boolean }>(`/api/invites/${id}/decline`, { method: "POST" }),
  createTable: (seatCount: number, rounds: number) =>
    req<{ table: TableInfo }>("/api/tables", { method: "POST", body: JSON.stringify({ seatCount, rounds }) }),
  myTables: () => req<{ tables: Omit<TableInfo, "seats">[] }>("/api/tables/mine"),
  getTable: (id: string) => req<{ table: TableInfo }>(`/api/tables/${id}`),
  joinTable: (code: string) => req<{ table: TableInfo }>(`/api/tables/join/${encodeURIComponent(code)}`, { method: "POST" }),
  editSeat: (tableId: string, seatIdx: number, patch: { ai?: boolean; name?: string }) =>
    req<{ table: TableInfo }>(`/api/tables/${tableId}/seat`, { method: "POST", body: JSON.stringify({ seatIdx, ...patch }) }),
  startTable: (id: string) => req<{ gameId: string }>(`/api/tables/${id}/start`, { method: "POST" }),
  getGame: (id: string) =>
    req<{ gameId: string; tableId: string; mySeat: number | null; state: GameState }>(`/api/games/${id}`),
  submitAction: (id: string, action: Action) =>
    req<{ state: GameState }>(`/api/games/${id}/actions`, { method: "POST", body: JSON.stringify({ action }) }),
};

export type ConnState = "connecting" | "live" | "reconnecting";

/**
 * Live game socket with automatic reconnect. The server only pushes on new
 * actions, so on every (re)open we also pull current state via GET — that closes
 * the window where an action landed while the socket was down.
 */
export function openGameSocket(
  gameId: string,
  onState: (s: GameState) => void,
  onStatus?: (s: ConnState) => void,
): () => void {
  const proto = location.protocol === "https:" ? "wss" : "ws";
  let closed = false;
  let ws: WebSocket | null = null;
  let retry = 0;

  const connect = () => {
    if (closed) return;
    onStatus?.(retry === 0 ? "connecting" : "reconnecting");
    ws = new WebSocket(`${proto}://${location.host}/api/games/${gameId}/live`);
    ws.onopen = () => {
      retry = 0;
      onStatus?.("live");
      // Reconcile any actions missed while disconnected.
      api.getGame(gameId).then((r) => !closed && onState(r.state)).catch(() => {});
    };
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data as string) as { type: string; state?: GameState };
      if (msg.type === "state" && msg.state) onState(msg.state);
    };
    ws.onclose = () => {
      if (closed) return;
      onStatus?.("reconnecting");
      retry += 1;
      setTimeout(connect, Math.min(1000 * retry, 5000));
    };
    ws.onerror = () => ws?.close();
  };
  connect();

  return () => {
    closed = true;
    ws?.close();
  };
}
