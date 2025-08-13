import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "host",
      filename: "hostEntry.js",
      remotes: {
        remote: {
          type: "module",
          name: "remote",
          entry: "http://localhost:4001/remote/remoteEntry.js",
          entryGlobalName: "remote",
          shareScope: "default",
        },
      },
      shared: {
        react: { singleton: true, requiredVersion: "18.2.0" },
        "react-dom": { singleton: true, requiredVersion: "18.2.0" },
      },
    }),
  ],
});
