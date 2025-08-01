import { test, expect } from '@playwright/test';

test.describe('Elderberry UI Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should display login form components', async ({ page }) => {
    // 로그인 페이지로 이동
    await page.goto('http://localhost:5173/login');
    
    // 로그인 폼 요소들이 있는지 확인
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').first();
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
    
    // 플레이스홀더 텍스트 확인
    await expect(emailInput).toHaveAttribute('placeholder', /이메일|email/i);
  });

  test('should display navigation components', async ({ page }) => {
    // 네비게이션 요소들 확인
    const nav = page.locator('nav, header').first();
    await expect(nav).toBeVisible();
    
    // 로고 또는 브랜드명 확인
    const logo = page.locator('text=엘더베리').first();
    await expect(logo).toBeVisible();
  });

  test('should handle form validation', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    
    // 빈 폼 제출 시도
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // 에러 메시지가 표시되는지 확인 (에러 메시지가 있을 경우)
    await page.waitForTimeout(500); // 검증 메시지가 나타날 시간 대기
    
    // 이메일 필드에 포커스가 있는지 확인
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const isFocused = await emailInput.evaluate(el => el === document.activeElement);
    
    // 폼 검증이 작동하는지 확인
    expect(isFocused || await page.locator('.error, .invalid').count() > 0).toBeTruthy();
  });

  test('should have responsive design', async ({ page }) => {
    // 모바일 뷰포트 테스트
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:5173');
    
    // 모바일에서도 주요 요소가 보이는지 확인
    const logo = page.locator('text=엘더베리').first();
    await expect(logo).toBeVisible();
    
    // 데스크톱 뷰포트 테스트
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(logo).toBeVisible();
  });

  test('should handle theme switching if available', async ({ page }) => {
    // 테마 스위처가 있는지 확인
    const themeToggle = page.locator('[aria-label*="theme"], [title*="theme"], button:has-text("테마")').first();
    
    if (await themeToggle.isVisible()) {
      // 현재 배경색 가져오기
      const initialBgColor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });
      
      // 테마 전환
      await themeToggle.click();
      await page.waitForTimeout(300); // 애니메이션 대기
      
      // 배경색이 변경되었는지 확인
      const newBgColor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });
      
      expect(newBgColor).not.toBe(initialBgColor);
    }
  });
});