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
  dispatch: (action: Action) => boolean;
  undo: () => void;
  select: (id: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useStore = create<Store>((set, get) => ({
  screen: "home",
  me: null,
  game: null,
  history: [],
  error: null,
  selected: null,
  mode: "local",
  onlineGameId: null,
  mySeat: null,
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
