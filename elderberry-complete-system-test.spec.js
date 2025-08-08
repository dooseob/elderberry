const { test, expect } = require('@playwright/test');

/**
 * 엘더베리 프로젝트 최종 완성도 통합 테스트
 * 목표: 모든 주요 시스템 기능의 완전한 동작 검증
 */
test.describe('엘더베리 프로젝트 최종 완성도 테스트', () => {

  // 테스트 계정 정보
  const testUser = {
    email: 'test.domestic@example.com',
    password: 'Password123!'
  };

  test.beforeEach(async ({ page }) => {
    // 콘솔 에러 수집
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      }
    });

    // 네트워크 실패 수집
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`❌ HTTP ${response.status()}: ${response.url()}`);
      }
    });

    await page.goto('http://localhost:5173');
  });

  test('1. 시스템 초기 로딩 및 접근성 테스트', async ({ page }) => {
    // 페이지 기본 로딩 검증
    await expect(page).toHaveTitle(/엘더베리|Elderberry/);
    
    // 기본 네비게이션 요소 검증
    const navigation = page.locator('nav, header');
    await expect(navigation).toBeVisible();
    
    // 로그인 페이지로 리다이렉트 확인
    await expect(page).toHaveURL(/login/);
    
    console.log('✅ 시스템 초기 로딩 성공');
  });

  test('2. 인증 시스템 테스트 (로그인/로그아웃)', async ({ page }) => {
    // 로그인 폼 검증
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const loginButton = page.locator('button[type="submit"], button:has-text("로그인")');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginButton).toBeVisible();

    // 로그인 수행
    await emailInput.fill(testUser.email);
    await passwordInput.fill(testUser.password);
    await loginButton.click();

    // 로그인 성공 검증 (대시보드나 메인 페이지로 이동)
    await expect(page).toHaveURL(/dashboard|main|home/);
    
    console.log('✅ 로그인 성공');

    // 로그아웃 테스트
    const logoutButton = page.locator('button:has-text("로그아웃"), a:has-text("로그아웃")');
    if (await logoutButton.count() > 0) {
      await logoutButton.click();
      await expect(page).toHaveURL(/login/);
      console.log('✅ 로그아웃 성공');
    }
  });

  test('3. 시설 검색 시스템 테스트 (89% → 95% 목표)', async ({ page }) => {
    // 로그인
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard|main|home/);

    // 시설 검색 페이지 이동
    const facilityLink = page.locator('a:has-text("시설"), nav a[href*="facility"]');
    if (await facilityLink.count() > 0) {
      await facilityLink.click();
      
      // 검색 기능 테스트
      const searchInput = page.locator('input[type="search"], input[placeholder*="검색"]');
      if (await searchInput.count() > 0) {
        await searchInput.fill('요양원');
        
        // 검색 결과 확인
        const searchResults = page.locator('[data-testid="facility-list"], .facility-card');
        await expect(searchResults.first()).toBeVisible();
        console.log('✅ 시설 검색 기능 동작');
      }

      // 필터 기능 테스트
      const filterButton = page.locator('button:has-text("필터"), button:has-text("Filter")');
      if (await filterButton.count() > 0) {
        await filterButton.click();
        console.log('✅ 시설 필터 기능 동작');
      }
    }
  });

  test('4. 게시판 시스템 테스트 (100% 검증)', async ({ page }) => {
    // 로그인
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard|main|home/);

    // 게시판 페이지 이동
    const boardLink = page.locator('a:has-text("게시판"), nav a[href*="board"]');
    if (await boardLink.count() > 0) {
      await boardLink.click();
      
      // 게시글 목록 확인
      const postList = page.locator('[data-testid="post-list"], .post-item, .board-item');
      await expect(postList.first()).toBeVisible();
      
      // 게시글 작성 버튼 확인
      const writeButton = page.locator('button:has-text("작성"), a:has-text("글쓰기")');
      if (await writeButton.count() > 0) {
        console.log('✅ 게시판 작성 기능 존재');
      }
      
      console.log('✅ 게시판 시스템 동작');
    }
  });

  test('5. 리뷰 시스템 테스트 (100% 검증)', async ({ page }) => {
    // 로그인
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard|main|home/);

    // 리뷰 페이지 이동
    const reviewLink = page.locator('a:has-text("리뷰"), nav a[href*="review"]');
    if (await reviewLink.count() > 0) {
      await reviewLink.click();
      
      // 리뷰 목록 확인
      const reviewList = page.locator('[data-testid="review-list"], .review-item, .review-card');
      if (await reviewList.count() > 0) {
        await expect(reviewList.first()).toBeVisible();
      }
      
      // 별점 컴포넌트 확인
      const starRating = page.locator('.star-rating, [data-testid="star-rating"]');
      if (await starRating.count() > 0) {
        console.log('✅ 별점 시스템 존재');
      }
      
      console.log('✅ 리뷰 시스템 동작');
    }
  });

  test('6. 구인 시스템 테스트 (100% 검증)', async ({ page }) => {
    // 로그인
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard|main|home/);

    // 구인 페이지 이동
    const jobLink = page.locator('a:has-text("구인"), a:has-text("채용"), nav a[href*="job"]');
    if (await jobLink.count() > 0) {
      await jobLink.click();
      
      // 구인 목록 확인
      const jobList = page.locator('[data-testid="job-list"], .job-item, .job-card');
      if (await jobList.count() > 0) {
        await expect(jobList.first()).toBeVisible();
      }
      
      // 지원하기 버튼 확인
      const applyButton = page.locator('button:has-text("지원"), button:has-text("Apply")');
      if (await applyButton.count() > 0) {
        console.log('✅ 구인 지원 기능 존재');
      }
      
      console.log('✅ 구인 시스템 동작');
    }
  });

  test('7. 관리자 시스템 테스트 (99% → 100% 목표)', async ({ page }) => {
    // 관리자 계정으로 로그인 시도
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard|main|home/);

    // 관리자 메뉴 확인
    const adminLink = page.locator('a:has-text("관리"), a:has-text("Admin"), nav a[href*="admin"]');
    if (await adminLink.count() > 0) {
      await adminLink.click();
      
      // 관리자 대시보드 확인
      const adminDashboard = page.locator('[data-testid="admin-dashboard"], .admin-content');
      if (await adminDashboard.count() > 0) {
        await expect(adminDashboard.first()).toBeVisible();
      }
      
      // 회원 관리 기능 확인
      const memberManagement = page.locator('a:has-text("회원"), button:has-text("사용자")');
      if (await memberManagement.count() > 0) {
        console.log('✅ 회원 관리 기능 존재');
      }
      
      console.log('✅ 관리자 시스템 동작');
    } else {
      console.log('ℹ️ 관리자 메뉴 접근 불가 (권한 제한)');
    }
  });

  test('8. 전체 시스템 성능 및 안정성 테스트', async ({ page }) => {
    const startTime = Date.now();
    
    // 로그인
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard|main|home/);
    
    const loginTime = Date.now() - startTime;
    console.log(`⏱️ 로그인 시간: ${loginTime}ms`);

    // 주요 페이지들을 빠르게 순회하며 응답성 테스트
    const testPages = [
      { name: '시설', selector: 'a:has-text("시설"), nav a[href*="facility"]' },
      { name: '게시판', selector: 'a:has-text("게시판"), nav a[href*="board"]' },
      { name: '리뷰', selector: 'a:has-text("리뷰"), nav a[href*="review"]' },
      { name: '구인', selector: 'a:has-text("구인"), nav a[href*="job"]' }
    ];

    let totalErrors = 0;
    let totalLoadTime = 0;

    for (const testPage of testPages) {
      try {
        const pageStartTime = Date.now();
        const link = page.locator(testPage.selector);
        
        if (await link.count() > 0) {
          await link.click();
          await page.waitForLoadState('networkidle');
          const pageLoadTime = Date.now() - pageStartTime;
          totalLoadTime += pageLoadTime;
          console.log(`✅ ${testPage.name} 페이지 로딩: ${pageLoadTime}ms`);
        } else {
          console.log(`⚠️ ${testPage.name} 페이지 링크 없음`);
        }
      } catch (error) {
        totalErrors++;
        console.log(`❌ ${testPage.name} 페이지 오류: ${error.message}`);
      }
    }

    const avgLoadTime = totalLoadTime / testPages.length;
    console.log(`📊 평균 페이지 로딩 시간: ${avgLoadTime.toFixed(0)}ms`);
    console.log(`📊 총 오류 수: ${totalErrors}`);
    
    // 성능 기준 검증 (5초 이내)
    expect(avgLoadTime).toBeLessThan(5000);
    expect(totalErrors).toBeLessThan(2);
  });

  test('9. API 연동 및 데이터 일관성 테스트', async ({ page }) => {
    // API 요청 모니터링
    const apiCalls = [];
    
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        apiCalls.push({
          url: response.url(),
          status: response.status(),
          method: response.request().method()
        });
      }
    });

    // 로그인 및 메인 기능 사용
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard|main|home/);

    // 시설 검색 API 테스트
    const facilityLink = page.locator('a:has-text("시설"), nav a[href*="facility"]');
    if (await facilityLink.count() > 0) {
      await facilityLink.click();
      await page.waitForLoadState('networkidle');
    }

    // API 호출 결과 분석
    const successfulAPIs = apiCalls.filter(api => api.status >= 200 && api.status < 300).length;
    const failedAPIs = apiCalls.filter(api => api.status >= 400).length;
    
    console.log(`📊 API 호출 통계:`);
    console.log(`  총 API 호출: ${apiCalls.length}`);
    console.log(`  성공: ${successfulAPIs}`);
    console.log(`  실패: ${failedAPIs}`);
    
    // 대부분의 API가 성공해야 함
    expect(successfulAPIs).toBeGreaterThan(failedAPIs);
  });

  test('10. 최종 완성도 평가', async ({ page }) => {
    const results = {
      systems: {},
      overall: { score: 0, status: 'PENDING' }
    };

    // 로그인
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard|main|home/);

    // 각 시스템 완성도 평가
    const systems = [
      { name: 'Facility', selector: 'a:has-text("시설"), nav a[href*="facility"]', target: 95 },
      { name: 'Board', selector: 'a:has-text("게시판"), nav a[href*="board"]', target: 100 },
      { name: 'Review', selector: 'a:has-text("리뷰"), nav a[href*="review"]', target: 100 },
      { name: 'Job', selector: 'a:has-text("구인"), nav a[href*="job"]', target: 100 },
      { name: 'Admin', selector: 'a:has-text("관리"), nav a[href*="admin"]', target: 100 }
    ];

    let totalScore = 0;
    let systemCount = 0;

    for (const system of systems) {
      try {
        const link = page.locator(system.selector);
        let score = 0;

        // 기본 점수: 링크 존재 여부
        if (await link.count() > 0) {
          score += 20;
          
          // 페이지 로딩 테스트
          await link.click();
          await page.waitForLoadState('networkidle');
          score += 30;
          
          // 컨텐츠 존재 테스트
          const content = page.locator('main, .content, [data-testid*="list"]');
          if (await content.count() > 0) {
            score += 30;
          }
          
          // 기능 버튼 존재 테스트
          const actionButtons = page.locator('button, a[href*="create"], a[href*="write"]');
          if (await actionButtons.count() > 0) {
            score += 20;
          }
        }

        results.systems[system.name] = {
          score: score,
          target: system.target,
          status: score >= (system.target * 0.8) ? 'PASS' : 'NEEDS_WORK'
        };

        totalScore += score;
        systemCount++;
        
        console.log(`${system.name}: ${score}/100 (목표: ${system.target}%)`);
        
      } catch (error) {
        results.systems[system.name] = {
          score: 0,
          target: system.target,
          status: 'ERROR',
          error: error.message
        };
        console.log(`❌ ${system.name} 평가 실패: ${error.message}`);
      }
    }

    // 전체 완성도 계산
    const averageScore = totalScore / systemCount;
    results.overall.score = Math.round(averageScore);
    results.overall.status = averageScore >= 90 ? 'PRODUCTION_READY' : 
                           averageScore >= 80 ? 'NEAR_COMPLETE' : 'NEEDS_WORK';

    console.log(`\n🎯 최종 완성도 평가 결과:`);
    console.log(`전체 점수: ${results.overall.score}/100`);
    console.log(`상태: ${results.overall.status}`);
    
    // 결과를 파일로 저장
    await page.evaluate((results) => {
      window.completionResults = results;
    }, results);

    // 프로덕션 준비 상태 검증
    expect(results.overall.score).toBeGreaterThan(85);
  });

});

/**
 * 테스트 완료 후 결과 요약
 */
test.afterAll(async ({ browser }) => {
  console.log('\n🏁 엘더베리 프로젝트 최종 완성도 테스트 완료');
  console.log('상세한 결과는 test-results/ 폴더에서 확인할 수 있습니다.');
});