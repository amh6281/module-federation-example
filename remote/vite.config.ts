import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

// https://vite.dev/config/
export default defineConfig({
  base: "http://localhost:4001/remote/",
  build: {
    target: "chrome89",
  },
  plugins: [
    react(),
    federation({
      name: "remote",
      filename: "remoteEntry.js",
      exposes: {
        "./RemoteApp": "./src/App.tsx",
      },
      shared: {
        react: { singleton: true, requiredVersion: "18.2.0" },
        "react-dom": { singleton: true, requiredVersion: "18.2.0" },
      },
    }),
  ],
});
