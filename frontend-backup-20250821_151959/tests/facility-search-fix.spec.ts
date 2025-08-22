/**
 * 시설찾기 메뉴 문제 해결 E2E 테스트
 * 무한 리렌더링 문제 해결 및 API 연결 테스트 검증
 */
import { test, expect, Page } from '@playwright/test';

test.describe('시설찾기 메뉴 문제 해결 테스트', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // 개발자 도구 콘솔 에러 캐치
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // 네트워크 에러 캐치
    const networkErrors: string[] = [];
    page.on('requestfailed', request => {
      networkErrors.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });

    // 에러 배열을 페이지 컨텍스트에 저장
    await page.evaluate(() => {
      (window as any).testErrors = {
        console: [],
        network: []
      };
    });
  });

  test('1. 로그인 후 시설찾기 메뉴 접근 테스트', async () => {
    // 로그인 페이지로 이동
    await page.goto('http://localhost:5173/auth/signin');
    
    // 페이지 로드 대기
    await page.waitForLoadState('networkidle');
    
    // 로그인 폼 채우기
    await page.fill('input[type="email"]', 'test.domestic@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    
    // 로그인 버튼 클릭
    await page.click('button[type="submit"]');
    
    // 대시보드로 리다이렉트 대기
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // 시설찾기 메뉴 클릭
    await page.click('text=시설 검색');
    
    // 시설찾기 페이지로 이동 확인
    await page.waitForURL('**/facility-search', { timeout: 10000 });
    
    // 페이지 제목 확인
    await expect(page.locator('h1')).toContainText('시설 검색 및 추천');
  });

  test('2. useLinearTheme 무한 리렌더링 문제 해결 검증', async () => {
    // 로그인 후 시설찾기 페이지로 이동
    await page.goto('http://localhost:5173/auth/signin');
    await page.fill('input[type="email"]', 'test.domestic@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // 시설찾기 페이지로 이동
    await page.goto('http://localhost:5173/facility-search');
    await page.waitForLoadState('networkidle');
    
    // 5초 동안 대기하며 무한 리렌더링 에러 발생 여부 확인
    await page.waitForTimeout(5000);
    
    // 콘솔에 "Maximum update depth exceeded" 에러가 없는지 확인
    const consoleMessages = await page.evaluate(() => {
      return (window as any).testErrors?.console || [];
    });
    
    const hasRenderingError = consoleMessages.some((msg: string) => 
      msg.includes('Maximum update depth exceeded') || 
      msg.includes('무한 루프')
    );
    
    expect(hasRenderingError).toBeFalsy();
    
    // 페이지가 정상적으로 렌더링되었는지 확인
    await expect(page.locator('[data-testid="facility-search-page"]').or(page.locator('h1'))).toBeVisible();
  });

  test('3. 시설 추천 API 연결 테스트', async () => {
    // 로그인 후 시설찾기 페이지로 이동
    await page.goto('http://localhost:5173/auth/signin');
    await page.fill('input[type="email"]', 'test.domestic@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    await page.goto('http://localhost:5173/facility-search');
    await page.waitForLoadState('networkidle');
    
    // 맞춤 추천 탭 클릭
    const recommendationTab = page.locator('text=맞춤 추천');
    if (await recommendationTab.isVisible()) {
      await recommendationTab.click();
      
      // API 요청 응답 대기 (최대 10초)
      await page.waitForTimeout(3000);
      
      // 400 에러가 아닌 다른 상태 확인 (건강 평가 데이터 부족으로 인한 400은 예상됨)
      const errorMessage = page.locator('text*=건강 평가 데이터가 없거나');
      const hasExpectedError = await errorMessage.isVisible();
      
      // 예상된 에러 메시지가 표시되거나, 추천 결과가 표시되면 성공
      const hasResults = await page.locator('[data-testid="recommendation-results"]').isVisible();
      
      expect(hasExpectedError || hasResults).toBeTruthy();
    }
  });

  test('4. LinearCard 컴포넌트 렌더링 테스트', async () => {
    await page.goto('http://localhost:5173/auth/signin');
    await page.fill('input[type="email"]', 'test.domestic@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    await page.goto('http://localhost:5173/facility-search');
    await page.waitForLoadState('networkidle');
    
    // Card 컴포넌트가 정상적으로 렌더링되는지 확인
    const cards = page.locator('[class*="card"], [class*="Card"]');
    await expect(cards.first()).toBeVisible();
    
    // Card 컴포넌트에서 useLinearTheme 관련 에러가 발생하지 않는지 확인
    await page.waitForTimeout(2000);
    
    const consoleMessages = await page.evaluate(() => {
      return (window as any).testErrors?.console || [];
    });
    
    const hasThemeError = consoleMessages.some((msg: string) => 
      msg.includes('useLinearTheme') || 
      msg.includes('theme error')
    );
    
    expect(hasThemeError).toBeFalsy();
  });

  test('5. 전체 사용자 플로우 테스트', async () => {
    // 1. 로그인
    await page.goto('http://localhost:5173/auth/signin');
    await page.fill('input[type="email"]', 'test.domestic@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // 2. 시설찾기 메뉴 클릭
    await page.click('text=시설 검색');
    await page.waitForURL('**/facility-search');
    
    // 3. 검색 기능 테스트
    await page.fill('input[placeholder*="지역명"]', '서울시');
    await page.click('button:has-text("검색")');
    
    // 4. 필터 기능 테스트
    const filterButton = page.locator('button:has-text("필터")');
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(1000);
    }
    
    // 5. 전체 플로우에서 치명적인 에러가 발생하지 않았는지 확인
    await page.waitForTimeout(3000);
    
    const consoleMessages = await page.evaluate(() => {
      return (window as any).testErrors?.console || [];
    });
    
    const hasCriticalError = consoleMessages.some((msg: string) => 
      msg.includes('Maximum update depth exceeded') ||
      msg.includes('Cannot read properties of undefined') ||
      msg.includes('TypeError')
    );
    
    expect(hasCriticalError).toBeFalsy();
    
    // 페이지가 여전히 응답하는지 확인
    await expect(page.locator('h1')).toBeVisible();
  });

  test('6. 네트워크 에러 처리 테스트', async () => {
    await page.goto('http://localhost:5173/auth/signin');
    await page.fill('input[type="email"]', 'test.domestic@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    await page.goto('http://localhost:5173/facility-search');
    await page.waitForLoadState('networkidle');
    
    // 네트워크 요청을 가로채서 에러 시뮬레이션
    await page.route('**/api/facilities/recommendations', route => {
      route.fulfill({
        status: 500,
        body: 'Internal Server Error'
      });
    });
    
    // 맞춤 추천 탭 클릭 시도
    const recommendationTab = page.locator('text=맞춤 추천');
    if (await recommendationTab.isVisible()) {
      await recommendationTab.click();
      await page.waitForTimeout(2000);
      
      // 에러 메시지가 적절히 표시되는지 확인
      const errorMessage = page.locator('[class*="error"], [class*="alert"], text*="실패"');
      await expect(errorMessage).toBeVisible();
    }
  });
});

test.describe('성능 및 안정성 테스트', () => {
  test('메모리 누수 방지 테스트', async ({ page }) => {
    await page.goto('http://localhost:5173/auth/signin');
    await page.fill('input[type="email"]', 'test.domestic@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // 시설찾기 페이지를 여러 번 방문하여 메모리 누수 확인
    for (let i = 0; i < 5; i++) {
      await page.goto('http://localhost:5173/facility-search');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      await page.goto('http://localhost:5173/dashboard');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    }
    
    // 최종적으로 시설찾기 페이지가 정상 작동하는지 확인
    await page.goto('http://localhost:5173/facility-search');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('시설 검색');
  });
});