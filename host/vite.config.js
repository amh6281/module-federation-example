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
        zustand: "http://localhost:3001/dist/assets/zustandRemoteEntry.js",
      },
      shared: {
        react: {
          import: true,
          requiredVersion: "19.1.0",
          version: "19.1.0",
          generate: true,
          modulePreload: true,
        },
        "react-dom": {
          import: true,
          requiredVersion: "19.1.0",
          version: "19.1.0",
          generate: true,
          modulePreload: true,
        },
        "use-sync-external-store": {
          import: true,
          requiredVersion: "1.5.0",
          version: "1.5.0",
          generate: true,
          modulePreload: true,
        },
      },
      shareScope: "default",
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
