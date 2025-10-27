import { test, expect } from "@playwright/test";

test.describe("Remote App Test", () => {
  test("should display remote application", async ({ page }) => {
    // 1. 페이지 이동 (baseURL 자동 적용: http://localhost:4001/)
    await page.goto("/");

    // 2. 앱 제목 확인
    await expect(page.locator("div")).toContainText("App Test");

    // 3. 카운터 기능 테스트
    await expect(page.locator("text=Count:")).toBeVisible();

    // 4. 증가 버튼 클릭
    await page.click('button:has-text("+")');

    // 5. 카운트 증가 확인
    await expect(page.locator("text=Count: 1")).toBeVisible();
  });
});
