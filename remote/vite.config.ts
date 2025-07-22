import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
import { NativeFederationTypeScriptRemote } from "@module-federation/native-federation-typescript/vite";
import path from "path";

const moduleFederationConfig = {
  name: "remote", // 실제 사용할 remote 이름
  filename: "remoteEntry.js",
  exposes: {
    "./Button": "./src/components/button", // 상대경로 확실히 맞춰주세요
  },
  shared: ["react", "react-dom"],
};

export default defineConfig({
  plugins: [
    react(),
    federation(moduleFederationConfig),
    NativeFederationTypeScriptRemote({
      moduleFederationConfig,
      tsConfigPath: path.resolve(__dirname, "tsconfig.json"),
      typesFolder: path.resolve(__dirname, "../@mf-types"), // 타입은 루트 외부에 모아서 저장
      compiledTypesFolder: path.resolve(__dirname, "public/compiled-types"), // 빌드된 d.ts 위치
      deleteTypesFolder: true,
    }),
  ],
  server: {
    port: 3001,
    fs: {
      allow: ["."],
    },
  },
  build: {
    outDir: "dist",
  },
});
