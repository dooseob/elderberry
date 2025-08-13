/**
 * 로그인 문제 해결 검증 테스트
 * MemberRole enum 수정 후 로그인 기능 테스트
 */
const { chromium } = require('@playwright/test');

async function testLoginFix() {
  console.log('🧪 로그인 문제 해결 검증 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    // 1. 메인 페이지 접속
    console.log('📱 메인 페이지 접속 중...');
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
    
    // 2. 페이지 로딩 확인
    await page.waitForTimeout(2000);
    console.log('✅ 메인 페이지 로딩 완료');
    
    // 3. 로그인 페이지로 이동 시도 (세부메뉴 클릭 시뮬레이션)
    console.log('🔐 로그인 페이지로 이동...');
    
    // 보호된 페이지에 접근하여 로그인 페이지로 리다이렉트 확인
    await page.goto('http://localhost:5174/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // 4. 로그인 페이지가 올바르게 표시되는지 확인
    const currentUrl = page.url();
    console.log(`📍 현재 URL: ${currentUrl}`);
    
    if (currentUrl.includes('/auth/signin') || currentUrl.includes('/login')) {
      console.log('✅ 로그인 페이지로 올바르게 리다이렉트됨');
    } else {
      console.log('❌ 로그인 페이지로 리다이렉트되지 않음');
      return false;
    }
    
    // 5. 로그인 폼 요소 확인
    const emailInput = await page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = await page.locator('input[type="password"], input[name="password"]').first();
    const submitButton = await page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("로그인")').first();
    
    if (await emailInput.isVisible() && await passwordInput.isVisible() && await submitButton.isVisible()) {
      console.log('✅ 로그인 폼 요소들이 올바르게 표시됨');
    } else {
      console.log('❌ 로그인 폼 요소가 누락됨');
      return false;
    }
    
    // 6. 로그인 시도
    console.log('📝 로그인 정보 입력...');
    await emailInput.fill('test.domestic@example.com');
    await passwordInput.fill('Password123!');
    
    // 콘솔 에러 모니터링
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // 7. 로그인 제출
    console.log('🚀 로그인 제출...');
    await submitButton.click();
    
    // 8. 로그인 후 결과 확인
    await page.waitForTimeout(5000); // 로그인 처리 대기
    
    const afterLoginUrl = page.url();
    console.log(`📍 로그인 후 URL: ${afterLoginUrl}`);
    
    // 9. 콘솔 에러 확인
    if (consoleErrors.length > 0) {
      console.log('❌ 콘솔 에러 발견:');
      consoleErrors.forEach(error => {
        console.log(`   - ${error}`);
      });
      
      // MemberRole 관련 에러가 여전히 있는지 확인
      const memberRoleErrors = consoleErrors.filter(error => 
        error.includes('MemberRole is not defined')
      );
      
      if (memberRoleErrors.length > 0) {
        console.log('❌ MemberRole 에러가 여전히 존재함');
        return false;
      } else {
        console.log('✅ MemberRole 에러 해결됨');
      }
    } else {
      console.log('✅ 콘솔 에러 없음');
    }
    
    // 10. 로그인 성공 여부 확인
    if (afterLoginUrl.includes('/dashboard') || afterLoginUrl.includes('/mypage')) {
      console.log('✅ 로그인 성공 - 대시보드로 리다이렉트됨');
      return true;
    } else if (afterLoginUrl.includes('/signin') || afterLoginUrl.includes('/login')) {
      console.log('❌ 로그인 실패 - 여전히 로그인 페이지에 있음');
      
      // 에러 메시지 확인
      const errorMessage = await page.locator('.error, .alert, [role="alert"]').first();
      if (await errorMessage.isVisible()) {
        const errorText = await errorMessage.textContent();
        console.log(`   에러 메시지: ${errorText}`);
      }
      
      return false;
    } else {
      console.log('⚠️ 예상하지 못한 페이지로 이동됨');
      return false;
    }
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error);
    return false;
  } finally {
    await browser.close();
  }
}

// 테스트 실행
testLoginFix().then(success => {
  if (success) {
    console.log('\n🎉 로그인 문제 해결 검증 완료!');
    console.log('✅ MemberRole enum 수정이 성공적으로 적용됨');
    console.log('✅ 로그인 기능이 정상적으로 작동함');
  } else {
    console.log('\n❌ 로그인 문제가 여전히 존재함');
    console.log('🔍 추가 디버깅이 필요함');
  }
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ 테스트 실행 실패:', error);
  process.exit(1);
});