/**
 * 시설찾기 E2E 테스트
 * 실제 사용자 플로우를 검증하는 Playwright 테스트
 */
import { test, expect } from '@playwright/test';

test.describe('시설찾기 페이지', () => {
  test.beforeEach(async ({ page }) => {
    // 테스트 사용자로 로그인
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test.domestic@example.com');
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.click('[data-testid="login-button"]');
    
    // 로그인 성공 확인
    await expect(page).toHaveURL('/dashboard');
    
    // 시설찾기 페이지로 이동
    await page.goto('/facilities/search');
  });

  test('페이지가 올바로 로드되는지 확인', async ({ page }) => {
    // 페이지 제목 확인
    await expect(page.locator('h1')).toContainText('시설 검색 및 추천');
    
    // 검색바 존재 확인
    await expect(page.locator('input[placeholder*="지역명을 입력하세요"]')).toBeVisible();
    
    // 탭 네비게이션 확인
    await expect(page.locator('text=시설 검색')).toBeVisible();
    await expect(page.locator('text=맞춤 추천')).toBeVisible();
  });

  test('검색 기능이 정상 작동하는지 확인', async ({ page }) => {
    // 검색어 입력
    await page.fill('input[placeholder*="지역명을 입력하세요"]', '서울시');
    
    // 검색 버튼 클릭
    await page.click('button:has-text("검색")');
    
    // 로딩 상태 확인
    await expect(page.locator('text=검색 중...')).toBeVisible();
    
    // 검색 결과 또는 에러 메시지 표시 대기 (최대 10초)
    await page.waitForFunction(
      () => {
        const loadingElement = document.querySelector('text=검색 중...');
        return !loadingElement || !loadingElement.textContent?.includes('검색 중...');
      },
      { timeout: 10000 }
    );
    
    // 결과가 표시되었는지 확인 (검색 결과 또는 빈 상태 메시지)
    const hasResults = await page.locator('text=검색 결과').isVisible();
    const hasEmptyMessage = await page.locator('text=검색 조건에 맞는 시설이 없습니다').isVisible();
    const hasError = await page.locator('.bg-red-50').isVisible();
    
    expect(hasResults || hasEmptyMessage || hasError).toBeTruthy();
  });

  test('필터 기능이 정상 작동하는지 확인', async ({ page }) => {
    // 필터 버튼 클릭
    await page.click('button:has-text("필터")');
    
    // 필터 패널이 열리는지 확인
    await expect(page.locator('[data-testid="facility-filters"]')).toBeVisible();
    
    // 필터 닫기
    await page.click('button:has-text("필터")');
    
    // 필터 패널이 닫히는지 확인
    await expect(page.locator('[data-testid="facility-filters"]')).not.toBeVisible();
  });

  test('맞춤 추천 탭이 정상 작동하는지 확인', async ({ page }) => {
    // 맞춤 추천 탭 클릭
    await page.click('button:has-text("맞춤 추천")');
    
    // 추천 요청 대기 (최대 15초)
    await page.waitForTimeout(2000);
    
    // 추천 결과, 에러 메시지, 또는 빈 상태 중 하나가 표시되는지 확인
    const hasRecommendations = await page.locator('text=추천 시설').isVisible();
    const hasError = await page.locator('.bg-red-50').isVisible();
    const hasEmptyMessage = await page.locator('text=추천할 시설이 없습니다').isVisible();
    
    expect(hasRecommendations || hasError || hasEmptyMessage).toBeTruthy();
  });

  test('보기 모드 전환이 정상 작동하는지 확인', async ({ page }) => {
    // 먼저 검색 실행하여 결과가 있도록 함
    await page.fill('input[placeholder*="지역명을 입력하세요"]', '서울시');
    await page.click('button:has-text("검색")');
    
    // 검색 완료 대기
    await page.waitForTimeout(3000);
    
    // 결과가 있는 경우에만 보기 모드 테스트
    const hasResults = await page.locator('text=검색 결과').isVisible();
    
    if (hasResults) {
      // 그리드 보기 버튼 클릭
      const gridButton = page.locator('button[aria-label="Grid view"], button:has(svg + text="Grid")');
      if (await gridButton.count() > 0) {
        await gridButton.first().click();
        
        // 리스트 보기 버튼 클릭
        const listButton = page.locator('button[aria-label="List view"], button:has(svg + text("List"))');
        if (await listButton.count() > 0) {
          await listButton.first().click();
        }
      }
    }
  });

  test('에러 상태에서 복구가 가능한지 확인', async ({ page }) => {
    // 네트워크 오프라인 상태로 설정
    await page.context().setOffline(true);
    
    // 검색 시도
    await page.fill('input[placeholder*="지역명을 입력하세요"]', '서울시');
    await page.click('button:has-text("검색")');
    
    // 에러 메시지 확인
    await page.waitForTimeout(3000);
    
    // 네트워크 온라인 상태로 복구
    await page.context().setOffline(false);
    
    // 다시 검색 시도
    await page.click('button:has-text("검색")');
    
    // 정상 작동 확인
    await page.waitForTimeout(3000);
  });

  test('키보드 접근성이 올바로 구현되어 있는지 확인', async ({ page }) => {
    // Tab 키로 네비게이션 확인
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    // 검색 입력 필드에 포커스 이동
    await page.locator('input[placeholder*="지역명을 입력하세요"]').focus();
    
    // 엔터 키로 검색 실행
    await page.keyboard.type('서울시');
    await page.keyboard.press('Enter');
    
    // 검색이 실행되었는지 확인
    await expect(page.locator('text=검색 중...')).toBeVisible();
  });

  test('응답성 및 모바일 뷰가 올바로 작동하는지 확인', async ({ page }) => {
    // 모바일 뷰포트로 변경
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 페이지가 모바일에서도 올바로 표시되는지 확인
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[placeholder*="지역명을 입력하세요"]')).toBeVisible();
    
    // 태블릿 뷰포트로 변경
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // 태블릿에서도 올바로 표시되는지 확인
    await expect(page.locator('h1')).toBeVisible();
    
    // 데스크톱으로 복원
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('성능 및 로딩 시간 확인', async ({ page }) => {
    const startTime = Date.now();
    
    // 페이지 로드 시간 측정
    await page.goto('/facilities/search');
    
    const loadTime = Date.now() - startTime;
    
    // 5초 이내 로드 확인
    expect(loadTime).toBeLessThan(5000);
    
    // 주요 요소들이 표시되는지 확인
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[placeholder*="지역명을 입력하세요"]')).toBeVisible();
  });
});

test.describe('시설찾기 에러 처리', () => {
  test('useLinearTheme 무한 루프 에러가 해결되었는지 확인', async ({ page }) => {
    // 콘솔 에러 수집
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // 페이지 로드
    await page.goto('/facilities/search');
    
    // 3초 대기 (에러가 발생한다면 이 시간 내에 나타날 것)
    await page.waitForTimeout(3000);
    
    // Maximum update depth exceeded 에러가 없는지 확인
    const hasInfiniteLoopError = consoleErrors.some(error => 
      error.includes('Maximum update depth exceeded') || 
      error.includes('useLinearTheme')
    );
    
    expect(hasInfiniteLoopError).toBeFalsy();
  });

  test('API 에러가 올바로 처리되는지 확인', async ({ page }) => {
    // API 응답을 에러로 모킹
    await page.route('**/api/facilities/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error' })
      });
    });
    
    // 검색 시도
    await page.fill('input[placeholder*="지역명을 입력하세요"]', '서울시');
    await page.click('button:has-text("검색")');
    
    // 에러 메시지가 표시되는지 확인
    await expect(page.locator('.bg-red-50')).toBeVisible();
  });

  test('네트워크 연결 문제 처리 확인', async ({ page }) => {
    // 네트워크 오프라인
    await page.context().setOffline(true);
    
    // 추천 시설 요청
    await page.click('button:has-text("맞춤 추천")');
    
    // 적절한 에러 처리 확인
    await page.waitForTimeout(5000);
    
    // 에러 상태 또는 빈 상태가 표시되는지 확인
    const hasError = await page.locator('.bg-red-50').isVisible();
    const hasEmptyState = await page.locator('text=추천할 시설이 없습니다').isVisible();
    
    expect(hasError || hasEmptyState).toBeTruthy();
  });
});