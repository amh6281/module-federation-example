import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30 * 1000,
  retries: 1,

  // 리포트 설정
  reporter: [["html", { outputFolder: "playwright-report" }], ["list"]],

  // 공통 설정
  use: {
    headless: true, // GUI 표시 여부
    baseURL: "http://localhost:3001/remote/", // remote 앱 URL
    screenshot: "only-on-failure", // 실패 시에만 스크린샷 저장
    video: "retain-on-failure", // 실패 시에만 비디오 저장
    trace: "retain-on-failure", // 실패 시에만 트레이스 저장
  },

  // 웹서버 설정
  webServer: {
    command: "npm run start",
    timeout: 120 * 1000,
    reuseExistingServer: true,
    port: 3001,
  },

  // 프로젝트별 브라우저 설정
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],

  // 기대값 설정
  expect: {
    timeout: 5 * 1000, // expect 타임아웃
    toHaveScreenshot: { threshold: 0.2 }, // 스크린샷 비교 임계값
    toMatchSnapshot: { threshold: 0.2 }, // 스냅샷 비교 임계값
  },
});
