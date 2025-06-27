import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "host",
      filename: "hostEntry.js",
      remotes: {
        remote: "http://localhost:3001/dist/assets/remoteEntry.js",
      },
      shared: ["react", "react-dom"],
    }),
    // {
    //   name: "vite-plugin-reload-endpoint",
    //   configureServer(server) {
    //     server.middlewares.use((req, res, next) => {
    //       if (req.url === "/__fullReload") {
    //         server.hot.send({ type: "full-reload" });

    //         res.end("Full reload triggered");
    //       } else {
    //         next();
    //       }
    //     });
    //   },
    // },
  ],
  build: {
    sourcemap: true,
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
    modulePreload: false,
  },
});
