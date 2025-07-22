import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
import { NativeFederationTypeScriptHost } from "@module-federation/native-federation-typescript/vite";
import path from "path";

const moduleFederationConfig = {
  name: "host",
  filename: "hostEntry.js",
  remotes: {
    remote: "http://localhost:4001/assets/remoteEntry.js",
  },
  shared: ["react", "react-dom"],
};

export default defineConfig({
  plugins: [
    react(),
    federation(moduleFederationConfig),
    NativeFederationTypeScriptHost({
      moduleFederationConfig,
      typesFolder: path.resolve(__dirname, "../@mf-types"), // 공통 타입 저장 위치
      deleteTypesFolder: true,
      maxRetries: 3,
    }),
  ],
  server: {
    port: 3000,
  },
});
