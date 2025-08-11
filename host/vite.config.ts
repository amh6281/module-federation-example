import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "host",
      remotes: {
        remote: {
          type: "module",
          name: "remote",
          entry: "http://localhost:4002/remoteEntry.js",
          entryGlobalName: "remote",
          shareScope: "default",
        },
      },
      filename: "remoteEntry.js",
      shared: {
        react: { singleton: true },
        "react-dom": { singleton: true },
      },
    }),
  ],
});
