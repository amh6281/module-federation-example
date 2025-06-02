import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "zustand",
      filename: "zustandRemoteEntry.js",
      exposes: {
        "./ZustandApp": "./src/App.jsx",
      },
      // shared 설정 공통 (host와 remote 둘 다)
      shared: {
        react: {
          import: true,
          requiredVersion: "18.2.0",
          version: "18.2.0",
        },
        "react-dom": {
          import: true,
          requiredVersion: "18.2.0",
          version: "18.2.0",
        },
        zustand: {
          import: true,
          requiredVersion: "5.0.5",
          version: "5.0.5",
        },
      },
      shareScope: "default",
    }),
  ],
  build: {
    sourcemap: true,
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
    modulePreload: false,
    rollupOptions: {
      output: {
        format: "es",
      },
    },
  },
});
