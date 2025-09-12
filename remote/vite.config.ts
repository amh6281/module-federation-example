import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";
import dts from "vite-plugin-dts";

// https://vite.dev/config/
export default defineConfig({
  base: "http://localhost:4001/remote/",
  build: {
    target: "chrome89",
    rollupOptions: {
      output: {
        format: "es",
      },
    },
  },
  plugins: [
    react(),
    dts({
      outDir: "dist",
      tsconfigPath: "./tsconfig.app.json",
      include: ["src/store/useCount.ts"],
      aliasesExclude: ["zustand", "zustand/traditional"],
      resolvers: [
        {
          name: "declare-module-resolver",
          supports: (id) => id.includes("useCount"),
          transform: (payload) => {
            console.log(payload);
            return [
              {
                path: "useCount.d.ts",
                content: `declare module 'remote/useCount' ${payload.code}`,
              },
            ];
          },
        },
      ],
    }),
    federation({
      name: "remote",
      filename: "remoteEntry.js",
      exposes: {
        "./RemoteApp": "./src/App.tsx",
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
    }),
  ],
});
