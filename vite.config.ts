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
        task: "http://mytask.wiro.kr:5000/dist/assets/taskRemoteEntry.js",
      },
      shared: ["react", "react-dom"],
    }),
  ],
  server: {
    host: "127.0.0.1",
    allowedHosts: true,
  },
});
