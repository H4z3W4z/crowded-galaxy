import { useStore } from "./store";
import { Setup } from "./screens/Setup";
import { Game } from "./screens/Game";

export function App() {
  const game = useStore((s) => s.game);
  return game ? <Game /> : <Setup />;
}
