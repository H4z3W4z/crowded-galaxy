import { useEffect } from "react";
import { useStore } from "./store";
import { api } from "./api";
import { Setup } from "./screens/Setup";
import { Game } from "./screens/Game";
import { Home, Login, Tables, Lobby } from "./screens/Online";

export function App() {
  const screen = useStore((s) => s.screen);
  const game = useStore((s) => s.game);
  const setMe = useStore((s) => s.setMe);
  const inProgress = game !== null && game.phase !== "over";

  // Restore the signed-in user (cookie session) on load.
  useEffect(() => {
    api
      .me()
      .then(({ user }) => setMe(user))
      .catch(() => setMe(null));
  }, [setMe]);

  useEffect(() => {
    if (!inProgress) return;
    const guard = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [inProgress]);

  switch (screen) {
    case "localSetup":
      return <Setup />;
    case "login":
      return <Login />;
    case "tables":
      return <Tables />;
    case "lobby":
      return <Lobby />;
    case "game":
      return game ? <Game /> : <Home />;
    default:
      return <Home />;
  }
}
