#!/usr/bin/env node
/**
 * Sign-In Auto-Fill Test
 * 테스트 계정 자동 입력 기능 검증
 */

import { chromium } from 'playwright';

async function testSignInAutoFill() {
  console.log('🧪 Sign-In Auto-Fill Test 시작...');
  
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();
  
  try {
    // 1. 로그인 페이지 접속
    console.log('📍 로그인 페이지 접속 중...');
    await page.goto('http://localhost:5174/auth/signin');
    await page.waitForLoadState('networkidle');
    
    // 2. 페이지 로딩 확인
    console.log('✅ 페이지 로딩 완료');
    
    // 3. 테스트 계정 버튼 존재 확인
    const testButton = await page.locator('[data-testid="test-account-button"]');
    const isVisible = await testButton.isVisible();
    
    if (!isVisible) {
      console.log('❌ 테스트 계정 버튼을 찾을 수 없습니다');
      return;
    }
    
    console.log('✅ 테스트 계정 버튼 발견');
    
    // 4. 버튼 클릭 전 상태 확인
    const emailBefore = await page.locator('[data-testid="signin-email"] input').inputValue();
    console.log(`📝 클릭 전 이메일 입력값: "${emailBefore}"`);
    
    // 5. 테스트 계정 버튼 클릭
    console.log('🖱️  테스트 계정 버튼 클릭...');
    await testButton.click();
    
    // 6. 약간의 대기 (자동 입력 완료 대기)
    await page.waitForTimeout(500);
    
    // 7. 자동 입력 결과 확인
    const emailAfter = await page.locator('[data-testid="signin-email"] input').inputValue();
    const passwordAfter = await page.locator('[data-testid="signin-password"] input').inputValue();
    
    console.log(`📝 클릭 후 이메일 입력값: "${emailAfter}"`);
    console.log(`📝 클릭 후 비밀번호 입력값: "${passwordAfter ? '****입력완료****' : '빈값'}"`);
    
    // 8. 결과 검증
    const expectedEmail = 'test.domestic@example.com';
    const expectedPassword = 'Password123!';
    
    if (emailAfter === expectedEmail && passwordAfter === expectedPassword) {
      console.log('🎉 자동 입력 성공!');
      console.log('✅ 이메일과 비밀번호가 정확히 입력됨');
    } else {
      console.log('❌ 자동 입력 실패');
      console.log(`   예상 이메일: ${expectedEmail}`);
      console.log(`   실제 이메일: ${emailAfter}`);
      console.log(`   비밀번호 입력: ${passwordAfter ? '완료' : '실패'}`);
    }
    
    // 9. 페이지 응답성 확인
    console.log('🔍 페이지 응답성 검사...');
    const pageTitle = await page.title();
    console.log(`📄 페이지 제목: ${pageTitle}`);
    
    if (pageTitle.includes('Elderberry')) {
      console.log('✅ 페이지가 정상적으로 응답함');
    } else {
      console.log('❌ 페이지 응답 이상');
    }
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error.message);
  } finally {
    await browser.close();
  }
}

// 테스트 실행
testSignInAutoFill().catch(console.error);