import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "host",
      remotes: {
        zustand: "http://localhost:4174/assets/zustandRemoteEntry.js",
      },
      shared: ["react", "react-dom", "zustand", "zustand/traditional"],
    }),
  ],
  build: {
    sourcemap: true,
    modulePreload: false,
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
  },
});
