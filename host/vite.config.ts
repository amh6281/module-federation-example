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
      shareStrategy: "loaded-first",
      // Host: remote 빌드 타입을 URL로 가져옴 (remote 서빙 주소 기준)
      dts: {
        consumeTypes: {
          typesFolder: "@mf-types",
          remoteTypeUrls: {
            remote: {
              zip: "http://localhost:4001/remote/@mf-types.zip",
              api: "http://localhost:4001/remote/@mf-types/src/App.d.ts",
            },
          },
        },
        tsConfigPath: "./tsconfig.app.json",
        displayErrorInTerminal: true,
      },
      shared: {
        react: {
          singleton: true,
        },
        "react-dom": {
          singleton: true,
        },
      },
    }),
  ],
});
