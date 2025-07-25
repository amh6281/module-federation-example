import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
import dynamicImport from "vite-plugin-dynamic-import";
import { customPlugin } from "../remote/src/customPlugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dynamicImport(),
    customPlugin,
    federation({
      name: "host",
      filename: "hostEntry.js",
      remotes: {
        remote: "http://localhost:4001/assets/remoteEntry.js",
      },
      shared: ["react", "react-dom"],
    }),
  ],
});
