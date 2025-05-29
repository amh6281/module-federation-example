import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import federation from "@originjs/vite-plugin-federation";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
    federation({
      name: "mainApp",
      filename: "remoteEntry.js",
      exposes: {
        "./mainApp": "./src/routes/__root.tsx",
      },
      shared: ["react", "react-dom"],
    }),
  ],
});
