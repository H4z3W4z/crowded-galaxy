import type { Action, GameState } from "@cg/engine";

export interface Me {
  id: string;
  email: string;
  name: string;
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
  requestMagicLink: (email: string, name: string) =>
    req<{ sent: boolean; devLink?: string }>("/api/auth/magic-link", { method: "POST", body: JSON.stringify({ email, name }) }),
  logout: () => req<{ ok: boolean }>("/api/auth/logout", { method: "POST" }),
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

export function openGameSocket(gameId: string, onState: (s: GameState) => void): () => void {
  const proto = location.protocol === "https:" ? "wss" : "ws";
  const ws = new WebSocket(`${proto}://${location.host}/api/games/${gameId}/live`);
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data as string) as { type: string; state?: GameState };
    if (msg.type === "state" && msg.state) onState(msg.state);
  };
  return () => ws.close();
}
