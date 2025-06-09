import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "zustand",
      filename: "zustandRemoteEntry.js",
      exposes: {
        "./ZustandApp": "./src/App.jsx",
        "./useCount": "./src/store/useCount.js",
      },
      shared: ["react", "react-dom", "zustand"],
      shareScope: "default",
    }),
  ],
  build: {
    sourcemap: true,
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
    modulePreload: false,
    rollupOptions: {
      output: {
        format: "es",
      },
    },
  },
});
