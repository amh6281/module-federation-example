import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
import { NativeFederationTypeScriptHost } from "@module-federation/native-federation-typescript";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "host",
      filename: "hostEntry.js",
      remotes: {
        remote: "http://localhost:4001/assets/remoteEntry.js",
      },
    }),
    NativeFederationTypeScriptHost.vite({
      moduleFederationConfig: {
        remotes: {
          remote: "/remote/types/remote.d.ts",
        },
      },
      typesFolder: "./types", // 타입 저장 위치
      deleteTypesFolder: false, // 필요 시 true
    }),
  ],
});
