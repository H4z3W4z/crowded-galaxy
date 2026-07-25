import { Component, useEffect, type ReactNode } from "react";
import { useStore } from "./store";
import { api } from "./api";
import { Setup } from "./screens/Setup";
import { Game } from "./screens/Game";
import { Home, Login, Tables, Lobby } from "./screens/Online";

/** Last line of defence: a render crash used to leave an empty page with only
 *  the CSS starfield showing, which reads as "the game is down". Now it offers
 *  a way out. */
class Boundary extends Component<{ children: ReactNode }, { err: Error | null }> {
  state = { err: null as Error | null };
  static getDerivedStateFromError(err: Error) {
    return { err };
  }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ background: "var(--card)", border: "var(--bw) solid var(--ink)", borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-chunk)", padding: 24, maxWidth: 480 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--display-sm)", marginBottom: 8 }}>The galaxy hiccuped</h1>
          <p style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.5 }}>
            Something went wrong drawing the board — most likely a saved game left over from an older version. Starting fresh
            will clear it.
          </p>
          <p style={{ color: "var(--ink-3)", fontFamily: "var(--font-mono)", fontSize: 11, margin: "10px 0 16px", wordBreak: "break-word" }}>
            {String(this.state.err.message ?? this.state.err)}
          </p>
          <button
            className="cg-btn cg-btn--gold cg-btn--md"
            onClick={() => {
              try {
                localStorage.clear();
              } catch {
                /* ignore */
              }
              location.reload();
            }}
          >
            Start fresh
          </button>
        </div>
      </div>
    );
  }
}

function AppInner() {
  const screen = useStore((s) => s.screen);
  const game = useStore((s) => s.game);
  const setMe = useStore((s) => s.setMe);
  const inProgress = game !== null && game.phase !== "over";

  // Restore the signed-in user (cookie session) on load, and reconnect a
  // persisted online game once auth is confirmed. (Local games restore from
  // localStorage directly in the store.)
  useEffect(() => {
    api
      .me()
      .then(({ user }) => {
        setMe(user);
        const st = useStore.getState();
        if (user && st.mode === "online" && st.onlineGameId && !st.closeSocket) {
          void st.openOnlineGame(st.onlineGameId).catch(() => {});
        }
      })
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

export function App() {
  return (
    <Boundary>
      <AppInner />
    </Boundary>
  );
}
