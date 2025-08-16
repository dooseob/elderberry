const { test, expect } = require('@playwright/test');

test.describe('시설찾기 콘솔 에러 검증', () => {
  let consoleErrors = [];

  test.beforeEach(async ({ page }) => {
    // 콘솔 에러 수집
    consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // 페이지 접속
    await page.goto('http://localhost:5173');
  });

  test('시설찾기 페이지에서 무한 렌더링 에러가 발생하지 않는지 확인', async ({ page }) => {
    // 로그인
    await page.fill('input[type="email"]', 'test.domestic@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    // 로그인 완료 대기
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // 시설찾기 메뉴 클릭
    await page.click('text=시설찾기');
    
    // 페이지 로딩 대기
    await page.waitForTimeout(3000);
    
    // 무한 렌더링 에러 확인
    const hasMaxUpdateError = consoleErrors.some(error => 
      error.includes('Maximum update depth exceeded')
    );
    
    console.log('수집된 콘솔 에러:', consoleErrors);
    
    // 무한 렌더링 에러가 없어야 함
    expect(hasMaxUpdateError).toBeFalsy();
    
    // 페이지가 정상적으로 렌더되었는지 확인
    await expect(page.locator('text=시설 검색')).toBeVisible();
  });

  test('시설찾기 페이지의 기본 기능이 정상 동작하는지 확인', async ({ page }) => {
    // 로그인
    await page.fill('input[type="email"]', 'test.domestic@example.com');  
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    // 대시보드 대기
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // 시설찾기 접속
    await page.click('text=시설찾기');
    await page.waitForTimeout(2000);
    
    // 검색 기능 테스트
    const searchInput = page.locator('input[placeholder*="검색"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('서울');
      await page.click('button:has-text("검색")');
      await page.waitForTimeout(2000);
    }
    
    // 심각한 콘솔 에러가 없어야 함 (경고는 허용)
    const hasCriticalError = consoleErrors.some(error => 
      error.includes('Maximum update depth') || 
      error.includes('Cannot read properties') ||
      error.includes('is not a function')
    );
    
    expect(hasCriticalError).toBeFalsy();
  });
});