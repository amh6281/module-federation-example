import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
// https://vite.dev/config/
export default defineConfig(() => {
  return {
    plugins: [
      react(),
      federation({
        name: "host",
        remotes: {
          task: "http://localhost:3001/dist/assets/remoteEntry.js",
          reserve: "http://mytask.wiro.kr:5001/dist/assets/remoteEntry.js",
        },
        shared: ["react", "react-dom", "@mailplug-inc/design-system"],
      }),
    ],
    build: {
      target: "esnext",
      minify: false,
      cssCodeSplit: false,
    },
  };
});
