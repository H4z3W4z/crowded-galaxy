import { create } from "zustand";
import {
  apply,
  createGame,
  DEFAULT_CONFIG,
  type Action,
  type GameConfig,
  type GameState,
  RulesError,
} from "@cg/engine";
import { api, ApiError, openGameSocket, type ConnState, type Me } from "./api";

export type Screen = "home" | "localSetup" | "game" | "login" | "tables" | "lobby";

interface Store {
  screen: Screen;
  me: Me | null;
  game: GameState | null;
  history: GameState[]; // for undo (hotseat misclick insurance; local mode only)
  error: string | null;
  selected: string | null;
  // Online mode
  mode: "local" | "online";
  onlineGameId: string | null;
  mySeat: number | null;
  lobbyTableId: string | null;
  closeSocket: (() => void) | null;
  conn: ConnState;
  setScreen: (s: Screen) => void;
  setMe: (me: Me | null) => void;
  openLobby: (tableId: string) => void;
  start: (seats: GameConfig["seats"], rounds: number) => void;
  openOnlineGame: (gameId: string) => Promise<void>;
  leaveOnlineGame: () => void;
  leaveToMenu: () => void;
  resumeGame: () => void;
  discardGame: () => void;
  dispatch: (action: Action) => boolean;
  undo: () => void;
  select: (id: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

// --- Persistence: survive a tab reload (iOS discards backgrounded tabs). ---
const PERSIST_KEY = "cg-state-v3";

interface Persisted {
  screen: Screen;
  mode: "local" | "online";
  onlineGameId: string | null;
  mySeat: number | null;
  game: GameState | null; // local mode only; online is re-fetched from the server
  history: GameState[];
}

/** A saved game from an older build can be structurally wrong for the current
 *  engine — e.g. games saved before the galaxy moved into state have no `map`,
 *  and rendering one blanks the whole app. Anything that fails this check is
 *  discarded rather than restored. */
function isPlayable(game: unknown): game is GameState {
  const g = game as GameState | null;
  return !!(
    g &&
    g.map &&
    Array.isArray(g.map.systemIds) &&
    g.map.systemIds.length > 0 &&
    g.map.systems &&
    g.map.adjacency &&
    Array.isArray(g.players) &&
    g.config
  );
}

function loadPersisted(): Partial<Persisted> {
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (!raw) return {};
    const p = JSON.parse(raw) as Persisted;
    if (p.game && !isPlayable(p.game)) {
      p.game = null;
      p.history = [];
    }
    p.history = (p.history ?? []).filter(isPlayable);
    // Don't restore a "game" screen with no game to show.
    if (p.screen === "game" && p.mode === "local" && !p.game) p.screen = "home";
    return p;
  } catch {
    return {};
  }
}

function savePersisted(s: Store): void {
  try {
    const snapshot: Persisted = {
      screen: s.screen,
      mode: s.mode,
      onlineGameId: s.onlineGameId,
      mySeat: s.mySeat,
      game: s.mode === "local" ? s.game : null, // online state is authoritative on the server
      history: s.mode === "local" ? s.history.slice(-8) : [],
    };
    localStorage.setItem(PERSIST_KEY, JSON.stringify(snapshot));
  } catch {
    /* storage full or unavailable — non-fatal */
  }
}

const saved = loadPersisted();

export const useStore = create<Store>((set, get) => ({
  screen: saved.screen ?? "home",
  me: null,
  game: saved.mode === "local" ? (saved.game ?? null) : null,
  history: saved.mode === "local" ? (saved.history ?? []) : [],
  error: null,
  selected: null,
  mode: saved.mode ?? "local",
  onlineGameId: saved.onlineGameId ?? null,
  mySeat: saved.mySeat ?? null,
  lobbyTableId: null,
  closeSocket: null,
  conn: "connecting",

  setScreen: (screen) => set({ screen }),
  setMe: (me) => set({ me }),
  openLobby: (tableId) => set({ lobbyTableId: tableId, screen: "lobby" }),

  start: (seats, rounds) => {
    const seed = (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
    set({
      mode: "local",
      game: createGame({ ...DEFAULT_CONFIG, rounds, seats, seed }),
      history: [],
      error: null,
      selected: null,
      screen: "game",
    });
  },

  openOnlineGame: async (gameId) => {
    get().closeSocket?.();
    const res = await api.getGame(gameId);
    const close = openGameSocket(
      gameId,
      (state) => {
        if (get().onlineGameId === gameId) set({ game: state });
      },
      (conn) => {
        if (get().onlineGameId === gameId) set({ conn });
      },
    );
    set({
      mode: "online",
      onlineGameId: gameId,
      mySeat: res.mySeat,
      game: res.state,
      history: [],
      error: null,
      selected: null,
      screen: "game",
      closeSocket: close,
      conn: "connecting",
    });
  },

  leaveOnlineGame: () => {
    get().closeSocket?.();
    set({ mode: "local", onlineGameId: null, mySeat: null, game: null, closeSocket: null, screen: "tables" });
  },

  /** Step out of a game without losing it. A local game has no server copy, so
   *  leaving keeps it saved and the home screen offers to resume. */
  leaveToMenu: () => {
    if (get().mode === "online") {
      get().leaveOnlineGame();
      return;
    }
    set({ screen: "home", selected: null, error: null });
  },

  resumeGame: () => set({ screen: "game", selected: null, error: null }),

  discardGame: () => set({ game: null, history: [], screen: "home", selected: null, error: null }),

  dispatch: (action) => {
    const { game, history, mode, onlineGameId } = get();
    if (!game) return false;
    if (mode === "online") {
      if (!onlineGameId) return false;
      api
        .submitAction(onlineGameId, action)
        .then(({ state }) => {
          if (get().onlineGameId === onlineGameId) set({ game: state, error: null, selected: null });
        })
        .catch((e) => {
          set({ error: e instanceof ApiError ? e.message : "connection lost" });
        });
      return true;
    }
    try {
      const next = apply(game, action);
      set({ game: next, history: [...history.slice(-30), game], error: null, selected: null });
      return true;
    } catch (e) {
      if (e instanceof RulesError) {
        set({ error: e.message });
        return false;
      }
      throw e;
    }
  },

  undo: () => {
    // Rewind to the latest human decision point — undoing into AI history just
    // makes the deterministic AI replay the same moves, which reads as a broken undo.
    const { history, game } = get();
    if (!game || history.length === 0) return;
    let idx = history.length - 1;
    while (idx >= 0 && game.config.seats[history[idx]!.current]!.ai) idx--;
    if (idx < 0) return;
    set({ game: history[idx]!, history: history.slice(0, idx), selected: null, error: null });
  },

  select: (id) => set({ selected: id }),
  clearError: () => set({ error: null }),
  reset: () => {
    const { mode } = get();
    if (mode === "online") {
      get().leaveOnlineGame();
      return;
    }
    set({ game: null, history: [], error: null, selected: null, screen: "home" });
  },
}));

// Persist the relevant slice on every change so a reload restores the game.
useStore.subscribe(savePersisted);
