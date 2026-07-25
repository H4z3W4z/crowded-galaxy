import { create } from "zustand";
import { type Action, type GameState } from "@cg/engine";
import { api, ApiError, openGameSocket, type ConnState, type Me } from "./api";

export type Screen = "login" | "tables" | "lobby" | "game";

interface Store {
  screen: Screen;
  me: Me | null;
  /** Always a server game. The server is authoritative; this is the last state
   *  it sent us, never something simulated locally. */
  game: GameState | null;
  error: string | null;
  selected: string | null;
  gameId: string | null;
  mySeat: number | null;
  lobbyTableId: string | null;
  closeSocket: (() => void) | null;
  conn: ConnState;
  setScreen: (s: Screen) => void;
  setMe: (me: Me | null) => void;
  openLobby: (tableId: string) => void;
  openGame: (gameId: string) => Promise<void>;
  leaveGame: () => void;
  dispatch: (action: Action) => boolean;
  select: (id: string | null) => void;
  clearError: () => void;
}

// Persist only where the player was, never the game itself — the server holds
// that, and a stale local copy is what used to blank the app after an upgrade.
const PERSIST_KEY = "cg-nav-v1";

interface Persisted {
  screen: Screen;
  gameId: string | null;
  mySeat: number | null;
  lobbyTableId: string | null;
}

function loadPersisted(): Partial<Persisted> {
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (!raw) return {};
    const p = JSON.parse(raw) as Persisted;
    if (p.screen === "game" && !p.gameId) p.screen = "tables";
    if (p.screen === "lobby" && !p.lobbyTableId) p.screen = "tables";
    return p;
  } catch {
    return {};
  }
}

function savePersisted(s: Store): void {
  try {
    const snapshot: Persisted = {
      screen: s.screen,
      gameId: s.gameId,
      mySeat: s.mySeat,
      lobbyTableId: s.lobbyTableId,
    };
    localStorage.setItem(PERSIST_KEY, JSON.stringify(snapshot));
  } catch {
    /* storage unavailable — non-fatal */
  }
}

const saved = loadPersisted();

export const useStore = create<Store>((set, get) => ({
  screen: saved.screen ?? "login",
  me: null,
  game: null,
  error: null,
  selected: null,
  gameId: saved.gameId ?? null,
  mySeat: saved.mySeat ?? null,
  lobbyTableId: saved.lobbyTableId ?? null,
  closeSocket: null,
  conn: "connecting",

  setScreen: (screen) => set({ screen }),
  setMe: (me) => set({ me }),
  openLobby: (tableId) => set({ lobbyTableId: tableId, screen: "lobby" }),

  openGame: async (gameId) => {
    get().closeSocket?.();
    const res = await api.getGame(gameId);
    const close = openGameSocket(
      gameId,
      (state) => {
        if (get().gameId === gameId) set({ game: state });
      },
      (conn) => {
        if (get().gameId === gameId) set({ conn });
      },
    );
    set({
      gameId,
      mySeat: res.mySeat,
      game: res.state,
      error: null,
      selected: null,
      screen: "game",
      closeSocket: close,
      conn: "connecting",
    });
  },

  /** Step away from the board. The game keeps running on the server; the lobby
   *  offers it back under Resume. */
  leaveGame: () => {
    get().closeSocket?.();
    set({ gameId: null, mySeat: null, game: null, closeSocket: null, screen: "tables", selected: null, error: null });
  },

  dispatch: (action) => {
    const { gameId } = get();
    if (!gameId) return false;
    api
      .submitAction(gameId, action)
      .then(({ state }) => {
        if (get().gameId === gameId) set({ game: state, error: null, selected: null });
      })
      .catch((e) => {
        set({ error: e instanceof ApiError ? e.message : "connection lost" });
      });
    return true;
  },

  select: (id) => set({ selected: id }),
  clearError: () => set({ error: null }),
}));

// Remember where the player was, so a reload puts them back.
useStore.subscribe(savePersisted);
