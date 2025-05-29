import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
import pkg from "./package.json";
import { resolve } from "path";

const { dependencies } = pkg;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "zustand",
      filename: "zustandRemoteEntry.js",
      exposes: {
        "./ZustandApp": "./src/App.tsx",
      },
      shared: {
        react: {
          version: dependencies["react"],
          requiredVersion: dependencies["react"],
          packagePath: resolve(__dirname, "node_modules/react"),
        },
        "react-dom": {
          version: dependencies["react-dom"],
          requiredVersion: dependencies["react-dom"],
          packagePath: resolve(__dirname, "node_modules/react-dom"),
        },
        zustand: {
          version: dependencies["zustand"],
          requiredVersion: dependencies["zustand"],
        },
        "use-sync-external-store": {
          version: dependencies["use-sync-external-store"],
          requiredVersion: dependencies["use-sync-external-store"],
        },
      },
    }),
  ],
  build: {
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
