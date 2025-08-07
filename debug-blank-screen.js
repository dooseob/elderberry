/**
 * Critical Bug: React 빈화면 문제 진단 스크립트
 * Playwright를 사용한 브라우저 기반 디버깅
 */

const { chromium } = require('playwright');

async function debugBlankScreen() {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true,
    slowMo: 1000 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Console 에러 수집
  const consoleErrors = [];
  const jsErrors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push({
        text: msg.text(),
        location: msg.location()
      });
      console.log('❌ Console Error:', msg.text());
    }
  });
  
  page.on('pageerror', error => {
    jsErrors.push({
      message: error.message,
      stack: error.stack
    });
    console.log('🔥 JavaScript Error:', error.message);
  });
  
  // 네트워크 요청 모니터링
  page.on('request', request => {
    console.log('📤 Request:', request.url());
  });
  
  page.on('response', response => {
    if (!response.ok()) {
      console.log('❌ Failed Response:', response.url(), response.status());
    }
  });
  
  try {
    console.log('🚀 브라우저 테스트 시작...');
    
    // 애플리케이션 로드
    await page.goto('http://localhost:5175', { 
      waitUntil: 'networkidle',
      timeout: 15000 
    });
    
    console.log('📄 Page Title:', await page.title());
    
    // HTML 구조 확인
    const htmlContent = await page.content();
    console.log('📏 HTML Length:', htmlContent.length);
    
    // React root 요소 확인
    const rootElement = await page.locator('#root').count();
    console.log('🎯 Root element found:', rootElement > 0);
    
    if (rootElement > 0) {
      const rootContent = await page.locator('#root').innerHTML();
      console.log('📦 Root content length:', rootContent.length);
      console.log('📦 Root content preview:', rootContent.substring(0, 200));
    }
    
    // React 컴포넌트 렌더링 확인
    await page.waitForTimeout(3000);
    
    // 랜딩페이지 요소들 확인
    const landingElements = await page.evaluate(() => {
      return {
        hasNav: !!document.querySelector('nav'),
        hasHeader: !!document.querySelector('header'),
        hasMain: !!document.querySelector('main'),
        hasFooter: !!document.querySelector('footer'),
        hasLandingContent: !!document.querySelector('[class*="landing"]'),
        hasReactComponents: !!document.querySelector('[data-reactroot]'),
        totalElements: document.querySelectorAll('*').length
      };
    });
    
    console.log('🧩 Page Elements:', landingElements);
    
    // ThemeProvider 확인
    const themeElements = await page.evaluate(() => {
      return {
        hasThemeProvider: !!document.querySelector('[class*="theme"]'),
        hasLinearTheme: !!document.querySelector('[class*="linear"]'),
        computedStyles: window.getComputedStyle(document.body),
        bodyClasses: document.body.className
      };
    });
    
    console.log('🎨 Theme Elements:', themeElements);
    
    // 스크린샷 촬영
    await page.screenshot({ 
      path: '/mnt/c/Users/human-10/elderberry/debug-screenshot.png',
      fullPage: true 
    });
    
    console.log('📸 스크린샷 저장 완료');
    
    // 결과 요약
    console.log('\n=== 진단 결과 ===');
    console.log('Console Errors:', consoleErrors.length);
    console.log('JavaScript Errors:', jsErrors.length);
    console.log('Page loaded successfully:', true);
    console.log('React root exists:', rootElement > 0);
    
    if (consoleErrors.length > 0) {
      console.log('\n🔥 Console Errors:');
      consoleErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.text}`);
        if (error.location) {
          console.log(`   Location: ${error.location.url}:${error.location.lineNumber}`);
        }
      });
    }
    
    if (jsErrors.length > 0) {
      console.log('\n💥 JavaScript Errors:');
      jsErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.message}`);
        if (error.stack) {
          console.log(`   Stack: ${error.stack.split('\n')[0]}`);
        }
      });
    }
    
    // 브라우저를 3초간 열어두어서 수동 확인 가능
    console.log('\n⏰ 브라우저를 3초간 열어둡니다...');
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

debugBlankScreen().catch(console.error);