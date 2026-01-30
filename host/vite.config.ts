import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    hmr: {
      port: 3000,
      host: "localhost",
    },
  },
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
      shareStrategy: "loaded-first",
      shared: {
        react: {
          singleton: true,
          requiredVersion: "18.2.0",
          version: "18.2.0",
        },
        "react-dom": {
          singleton: true,
          requiredVersion: "18.2.0",
          version: "18.2.0",
        },
      },
      // localhost:3000 ↔ localhost:4001 CORS 이슈
      ignoreOrigin: true,
      // remote 파싱 타임아웃(초). 기본 10초, 느린 환경에서 증가
      moduleParseTimeout: 30,
    }),
  ],
});
