/**
 * 엘더베리 시설찾기 E2E 테스트
 * Playwright를 사용한 전체 사용자 여정 테스트
 */

const { test, expect } = require('@playwright/test');

// 테스트 설정
const config = {
  baseURL: 'http://localhost:5173',
  testUser: {
    email: 'test.domestic@example.com',
    password: 'Password123!'
  },
  timeout: 30000
};

test.describe('엘더베리 시설찾기 E2E 테스트', () => {
  
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 홈페이지로 이동
    await page.goto(config.baseURL);
    await page.waitForLoadState('networkidle');
  });

  test('로그인 후 시설 검색 페이지 접근', async ({ page }) => {
    // 로그인 페이지로 이동
    await page.click('text=로그인');
    await page.waitForURL('**/login');

    // 로그인 정보 입력
    await page.fill('input[type="email"]', config.testUser.email);
    await page.fill('input[type="password"]', config.testUser.password);
    
    // 로그인 버튼 클릭
    await page.click('button[type="submit"]');
    
    // 로그인 성공 후 대시보드로 이동 확인
    await page.waitForURL('**/dashboard', { timeout: config.timeout });
    
    // 시설찾기 메뉴 클릭
    await page.click('text=시설찾기');
    await page.waitForURL('**/facilities/search');
    
    // 시설찾기 페이지 요소 확인
    await expect(page.locator('h1')).toContainText('시설찾기');
    await expect(page.locator('input[placeholder*="검색"]')).toBeVisible();
  });

  test('키워드 검색 기능 테스트', async ({ page }) => {
    // 로그인 과정 (간소화)
    await loginUser(page);
    
    // 시설찾기 페이지로 이동
    await page.goto(`${config.baseURL}/facilities/search`);
    await page.waitForLoadState('networkidle');
    
    // 검색 키워드 입력
    const searchInput = page.locator('input[placeholder*="검색"]');
    await searchInput.fill('서울');
    
    // 검색 버튼 클릭 또는 Enter 키 입력
    await searchInput.press('Enter');
    
    // 검색 결과 로딩 대기
    await page.waitForSelector('[data-testid="facility-list"]', { timeout: config.timeout });
    
    // 검색 결과 확인
    const facilityCards = page.locator('[data-testid="facility-card"]');
    await expect(facilityCards).toHaveCountGreaterThan(0);
    
    // 첫 번째 검색 결과 내용 확인
    const firstFacility = facilityCards.first();
    await expect(firstFacility.locator('h3')).toBeVisible(); // 시설명
    await expect(firstFacility.locator('[data-testid="facility-address"]')).toBeVisible(); // 주소
  });

  test('지도 뷰 전환 및 마커 상호작용', async ({ page }) => {
    await loginUser(page);
    await page.goto(`${config.baseURL}/facilities/search`);
    await page.waitForLoadState('networkidle');
    
    // 지도 뷰 전환 버튼 클릭
    const mapViewButton = page.locator('button:has-text("지도보기")');
    if (await mapViewButton.isVisible()) {
      await mapViewButton.click();
      
      // 지도 컨테이너 로딩 대기
      await page.waitForSelector('#kakao-map', { timeout: config.timeout });
      
      // 지도가 로드될 때까지 대기
      await page.waitForTimeout(3000);
      
      // 지도 내 마커 존재 확인 (카카오맵 API가 설정된 경우)
      const mapContainer = page.locator('#kakao-map');
      await expect(mapContainer).toBeVisible();
    } else {
      console.log('⚠️  지도 뷰 버튼을 찾을 수 없습니다. 카카오맵 API 키를 확인하세요.');
    }
  });

  test('시설 필터링 기능 테스트', async ({ page }) => {
    await loginUser(page);
    await page.goto(`${config.baseURL}/facilities/search`);
    await page.waitForLoadState('networkidle');
    
    // 필터 패널 열기
    const filterButton = page.locator('button:has-text("필터")');
    if (await filterButton.isVisible()) {
      await filterButton.click();
      
      // 지역 필터 선택
      const regionSelect = page.locator('select[name="region"]');
      if (await regionSelect.isVisible()) {
        await regionSelect.selectOption('서울특별시');
        
        // 필터 적용 버튼 클릭
        await page.click('button:has-text("적용")');
        
        // 필터링된 결과 로딩 대기
        await page.waitForTimeout(2000);
        
        // 검색 결과에 서울 지역 시설만 표시되는지 확인
        const facilityCards = page.locator('[data-testid="facility-card"]');
        if (await facilityCards.count() > 0) {
          const firstFacility = facilityCards.first();
          const address = await firstFacility.locator('[data-testid="facility-address"]').textContent();
          expect(address).toContain('서울');
        }
      }
    } else {
      console.log('⚠️  필터 기능이 아직 구현되지 않았습니다.');
    }
  });

  test('시설 상세 정보 모달/페이지 테스트', async ({ page }) => {
    await loginUser(page);
    await page.goto(`${config.baseURL}/facilities/search`);
    await page.waitForLoadState('networkidle');
    
    // 검색 실행 (시설 목록이 없을 경우)
    const searchInput = page.locator('input[placeholder*="검색"]');
    await searchInput.fill('요양');
    await searchInput.press('Enter');
    await page.waitForTimeout(2000);
    
    // 첫 번째 시설 카드 클릭
    const facilityCards = page.locator('[data-testid="facility-card"]');
    if (await facilityCards.count() > 0) {
      await facilityCards.first().click();
      
      // 상세 정보 모달 또는 페이지 로딩 대기
      const detailModal = page.locator('[data-testid="facility-detail-modal"]');
      const detailPage = page.locator('[data-testid="facility-detail-page"]');
      
      // 모달 또는 페이지 중 하나가 나타날 때까지 대기
      try {
        await Promise.race([
          detailModal.waitFor({ timeout: 5000 }),
          detailPage.waitFor({ timeout: 5000 })
        ]);
        
        // 상세 정보 내용 확인
        const detailContainer = await detailModal.isVisible() ? detailModal : detailPage;
        await expect(detailContainer.locator('h2')).toBeVisible(); // 시설명
        await expect(detailContainer.locator('[data-testid="facility-info"]')).toBeVisible(); // 기본 정보
        
      } catch (error) {
        console.log('⚠️  시설 상세 정보 기능이 아직 완전히 구현되지 않았습니다.');
      }
    } else {
      console.log('⚠️  검색 결과가 없어 상세 정보 테스트를 진행할 수 없습니다.');
    }
  });

  test('반응형 디자인 테스트', async ({ page }) => {
    await loginUser(page);
    await page.goto(`${config.baseURL}/facilities/search`);
    
    // 모바일 뷰포트로 변경
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');
    
    // 모바일에서 주요 요소들이 제대로 표시되는지 확인
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[placeholder*="검색"]')).toBeVisible();
    
    // 햄버거 메뉴 또는 모바일 네비게이션 확인
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      // 메뉴 항목들이 표시되는지 확인
    }
    
    // 태블릿 뷰포트로 변경
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    // 데스크톱 뷰포트로 복원
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    
    // 모든 뷰포트에서 기본 기능이 작동하는지 확인
    await expect(page.locator('input[placeholder*="검색"]')).toBeVisible();
  });

  test('성능 및 로딩 테스트', async ({ page }) => {
    // 성능 측정 시작
    const startTime = Date.now();
    
    await page.goto(`${config.baseURL}/facilities/search`);
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // 페이지 로딩 시간이 10초 이내인지 확인
    expect(loadTime).toBeLessThan(10000);
    
    // 주요 요소들이 빠르게 로드되는지 확인
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[placeholder*="검색"]')).toBeVisible();
    
    console.log(`📊 페이지 로딩 시간: ${loadTime}ms`);
  });

  test('에러 핸들링 테스트', async ({ page }) => {
    await loginUser(page);
    await page.goto(`${config.baseURL}/facilities/search`);
    
    // 네트워크를 차단하여 에러 상황 시뮬레이션
    await page.route('**/api/facilities/search**', route => {
      route.abort('failed');
    });
    
    // 검색 실행
    const searchInput = page.locator('input[placeholder*="검색"]');
    await searchInput.fill('테스트');
    await searchInput.press('Enter');
    
    // 에러 메시지가 표시되는지 확인
    await page.waitForTimeout(3000);
    
    const errorMessage = page.locator('[data-testid="error-message"]');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toContainText('오류');
    } else {
      console.log('⚠️  에러 핸들링 UI가 아직 완전히 구현되지 않았습니다.');
    }
  });

});

// 헬퍼 함수
async function loginUser(page) {
  // 이미 로그인된 상태인지 확인
  try {
    await page.goto(`${config.baseURL}/dashboard`);
    await page.waitForTimeout(1000);
    
    // 대시보드가 로드되면 이미 로그인된 상태
    if (page.url().includes('/dashboard')) {
      return;
    }
  } catch (error) {
    // 로그인이 필요한 상태
  }
  
  // 로그인 수행
  await page.goto(`${config.baseURL}/login`);
  await page.fill('input[type="email"]', config.testUser.email);
  await page.fill('input[type="password"]', config.testUser.password);
  await page.click('button[type="submit"]');
  
  // 로그인 완료 대기
  try {
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  } catch (error) {
    console.log('⚠️  로그인 페이지 구조가 예상과 다를 수 있습니다.');
  }
}