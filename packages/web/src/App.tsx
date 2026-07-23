import { useEffect } from "react";
import { useStore } from "./store";
import { Setup } from "./screens/Setup";
import { Game } from "./screens/Game";

export function App() {
  const game = useStore((s) => s.game);
  const inProgress = game !== null && game.phase !== "over";

  useEffect(() => {
    if (!inProgress) return;
    const guard = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [inProgress]);

  return game ? <Game /> : <Setup />;
}
