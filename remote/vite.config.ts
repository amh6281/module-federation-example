import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
import { NativeFederationTypeScriptRemote } from "@module-federation/native-federation-typescript";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "remote",
      filename: "remoteEntry.js",
      exposes: {
        "./Button": "./src/components/Button.tsx",
      },
    }),
    NativeFederationTypeScriptRemote.vite({
      moduleFederationConfig: {
        exposes: {
          "./Button": "./src/components/Button.tsx",
        },
      },
      tsConfigPath: "./tsconfig.json",
      typesFolder: "./dist/types/remote",
      compiledTypesFolder: "./dist/compiled-types",
      deleteTypesFolder: true, // 배포 전 타입 폴더 정리 원할 경우
    }),
  ],
});
