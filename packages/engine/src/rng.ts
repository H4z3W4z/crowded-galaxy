// Deterministic 32-bit RNG (mulberry32 core, integer state kept in GameState).
// Same seed + same action sequence => identical results in every environment.

export function seedState(seed: number): number {
  return seed >>> 0 || 0x9e3779b9;
}

/** Advance the state once; returns [newState, uint32]. Pure — no hidden state. */
export function next(state: number): [number, number] {
  let s = (state + 0x6d2b79f5) >>> 0;
  let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [s, (t ^ (t >>> 14)) >>> 0];
}

/** Uniform integer in [0, n). */
export function nextInt(state: number, n: number): [number, number] {
  const [s, u] = next(state);
  return [s, u % n];
}

/** Fisher-Yates shuffle, returns [newState, shuffledCopy]. */
export function shuffle<T>(state: number, items: readonly T[]): [number, T[]] {
  const arr = items.slice();
  let s = state;
  for (let i = arr.length - 1; i > 0; i--) {
    let j: number;
    [s, j] = nextInt(s, i + 1);
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return [s, arr];
}
