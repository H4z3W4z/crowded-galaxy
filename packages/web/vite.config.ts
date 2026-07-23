import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@ds": resolve(root, "../../design-system"),
    },
  },
  server: {
    host: true, // bind 0.0.0.0 so other LAN devices (iPad, etc.) can reach the dev server
    fs: { allow: [resolve(root, "../..")] },
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        ws: true,
      },
    },
  },
});
