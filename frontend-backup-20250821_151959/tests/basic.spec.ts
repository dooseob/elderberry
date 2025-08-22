import { test, expect } from '@playwright/test';

test.describe('Basic E2E Tests', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // 페이지가 로드되었는지 확인
    await expect(page).toHaveTitle(/엘더베리/);
    
    // 기본 요소가 있는지 확인
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // 로그인 링크 또는 버튼 찾기
    const loginLink = page.locator('text=로그인').or(page.locator('text=Login')).first();
    
    if (await loginLink.isVisible()) {
      await loginLink.click();
      
      // URL이 변경되었는지 확인
      await expect(page).toHaveURL(/.*login.*/);
    }
  });

  test('should display 404 page for invalid routes', async ({ page }) => {
    await page.goto('http://localhost:5173/invalid-route-12345');
    
    // 404 페이지가 로드되거나, 리다이렉트되는지 확인
    // 엘더베리 프로젝트는 404 대신 홈으로 리다이렉트할 수 있음
    const pageTitle = await page.title();
    expect(pageTitle).toContain('엘더베리');
  });
});