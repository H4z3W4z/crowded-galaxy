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

interface Store {
  game: GameState | null;
  history: GameState[]; // for undo (hotseat misclick insurance)
  error: string | null;
  selected: string | null;
  start: (seats: GameConfig["seats"], rounds: number) => void;
  dispatch: (action: Action) => boolean;
  undo: () => void;
  select: (id: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useStore = create<Store>((set, get) => ({
  game: null,
  history: [],
  error: null,
  selected: null,

  start: (seats, rounds) => {
    const seed = (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
    set({ game: createGame({ ...DEFAULT_CONFIG, rounds, seats, seed }), history: [], error: null, selected: null });
  },

  dispatch: (action) => {
    const { game, history } = get();
    if (!game) return false;
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
    const { history } = get();
    if (history.length === 0) return;
    set({ game: history[history.length - 1]!, history: history.slice(0, -1), selected: null, error: null });
  },

  select: (id) => set({ selected: id }),
  clearError: () => set({ error: null }),
  reset: () => set({ game: null, history: [], error: null, selected: null }),
}));
