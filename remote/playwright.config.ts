import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30 * 1000,
  retries: 1,
  webServer: {
    command: "npm run start",
    url: "http://localhost:3001",
    timeout: 120 * 1000,
    reuseExistingServer: true,
  },
  use: {
    headless: true, // GUI 표시 여부
    baseURL: "http://localhost:3001", // remote 앱 URL
  },
});
