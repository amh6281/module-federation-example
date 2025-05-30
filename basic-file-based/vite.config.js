import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import federation from "@originjs/vite-plugin-federation";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    federation({
      name: "tanstack",
      filename: "tanstackRemoteEntry.js",
      exposes: {
        "./TanstackApp": "./src/TanstackApp.tsx",
      },
      shared: [
        "react",
        "react-dom",
        "@tanstack/react-router",
        "@tanstack/react-router-devtools",
        // "@tanstack/router-plugin",
      ],
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
  optimizeDeps: {
    exclude: ["fsevents"],
  },
  resolve: {
    dedupe: ["react", "react-dom"],
  },
});
