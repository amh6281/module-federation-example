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
      shared: {
        react: {
          import: "react",
          requiredVersion: "19.1.0",
          version: "19.1.0",
          generate: true,
          modulePreload: true,
          eager: true,
          singleton: true,
        },
        "react-dom": {
          import: "react-dom",
          requiredVersion: "19.1.0",
          version: "19.1.0",
          generate: true,
          modulePreload: true,
          eager: true,
          singleton: true,
        },
        zustand: {
          import: "zustand",
          requiredVersion: "5.0.5",
          version: "5.0.5",
          generate: true,
          modulePreload: true,
          eager: true,
          singleton: true,
        },
        "use-sync-external-store": {
          import: "use-sync-external-store",
          requiredVersion: "1.5.0",
          version: "1.5.0",
          generate: true,
          modulePreload: true,
          eager: true,
          singleton: true,
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
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
    },
  },
});
