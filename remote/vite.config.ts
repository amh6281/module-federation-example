import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";
import dts from "vite-plugin-dts";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

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
      outDir: "dist/mf-types",
      include: ["src/App.tsx"],
      insertTypesEntry: true,
      staticImport: true,
      rollupTypes: false,
      copyDtsFiles: false,
      tsconfigPath: "./tsconfig.app.json",
      compilerOptions: {
        declaration: true,
        emitDeclarationOnly: true,
        skipLibCheck: true,
      },
      afterBuild: async () => {
        const typesDir = `dist/mf-types`;
        const tarPath = `dist/mf-types.tar.gz`;

        // tar 압축 후 원본 폴더 삭제
        await execAsync(
          `tar -czf "${tarPath}" -C "${typesDir}" . && rm -rf "${typesDir}"`
        );
      },

      exclude: ["src/DnD.tsx"],
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
