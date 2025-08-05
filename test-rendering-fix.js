/**
 * test-rendering-fix.js
 * 
 * SignInPage 렌더링 루프 수정 검증 스크립트
 * 브라우저 자동화를 통해 렌더링 성능을 측정하고 무한 루프 해결 여부를 확인
 * 
 * @version 1.0.0
 * @author RenderingOptimizationAgent
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 테스트 설정
const TEST_CONFIG = {
  baseUrl: 'http://localhost:5173',
  signInPath: '/auth/signin',
  timeout: 30000,
  maxRenderingThreshold: 5, // 5회 이상 렌더링 시 실패
  measurementDuration: 10000, // 10초간 측정
};

/**
 * 렌더링 성능 메트릭 수집
 */
async function measureRenderingMetrics(page) {
  const metrics = {
    networkRequests: [],
    consoleMessages: [],
    renderingCount: 0,
    performanceMetrics: null
  };

  // 네트워크 요청 모니터링
  page.on('request', (request) => {
    if (request.url().includes('vite.svg') || request.url().includes('/auth/signin')) {
      metrics.networkRequests.push({
        url: request.url(),
        method: request.method(),
        timestamp: Date.now()
      });
    }
  });

  // 콘솔 메시지 모니터링
  page.on('console', (msg) => {
    const message = msg.text();
    metrics.consoleMessages.push({
      type: msg.type(),
      text: message,
      timestamp: Date.now()
    });

    // "Throttling navigation" 경고 감지
    if (message.includes('Throttling navigation')) {
      console.error('🚨 CRITICAL: Throttling navigation detected!');
      metrics.renderingCount++;
    }

    // 렌더링 모니터 경고 감지
    if (message.includes('Suspicious rendering activity detected')) {
      console.error('🚨 CRITICAL: Suspicious rendering activity detected!');
      metrics.renderingCount++;
    }
  });

  return metrics;
}

/**
 * 렌더링 루프 테스트 실행
 */
async function testRenderingLoop() {
  console.log('🚀 Starting rendering loop fix verification...\n');
  
  const browser = await chromium.launch({ 
    headless: false, // UI 확인을 위해 헤드리스 모드 비활성화
    devtools: true,
    args: ['--disable-ipc-flooding-protection'] // Chrome 보호 비활성화 (테스트용)
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  
  const page = await context.newPage();
  
  try {
    // 메트릭 수집 시작
    const metrics = await measureRenderingMetrics(page);
    
    console.log('📊 Navigating to SignIn page...');
    await page.goto(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.signInPath}`, {
      waitUntil: 'networkidle',
      timeout: TEST_CONFIG.timeout
    });

    console.log('⏱️  Measuring rendering activity for 10 seconds...');
    
    // 페이지 로드 후 10초간 렌더링 활동 모니터링
    const startTime = Date.now();
    await page.waitForTimeout(TEST_CONFIG.measurementDuration);
    const endTime = Date.now();

    // 성능 메트릭 수집
    metrics.performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paintEntries = performance.getEntriesByType('paint');
      
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        memoryUsage: performance.memory ? {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        } : null
      };
    });

    // 결과 분석
    console.log('\n📈 Test Results:');
    console.log('================');
    
    // vite.svg 요청 횟수 확인
    const viteSvgRequests = metrics.networkRequests.filter(req => req.url.includes('vite.svg'));
    console.log(`🖼️  vite.svg requests: ${viteSvgRequests.length}`);
    
    if (viteSvgRequests.length > TEST_CONFIG.maxRenderingThreshold) {
      console.error(`❌ FAILED: Too many vite.svg requests (${viteSvgRequests.length} > ${TEST_CONFIG.maxRenderingThreshold})`);
      console.log('📋 Request timeline:');
      viteSvgRequests.forEach((req, index) => {
        console.log(`   ${index + 1}. ${new Date(req.timestamp).toISOString()} - ${req.url}`);
      });
    } else {
      console.log('✅ PASSED: vite.svg request count within normal range');
    }

    // 콘솔 경고 확인
    const throttlingWarnings = metrics.consoleMessages.filter(msg => 
      msg.text.includes('Throttling navigation') || 
      msg.text.includes('Suspicious rendering activity')
    );
    
    console.log(`⚠️  Rendering warnings: ${throttlingWarnings.length}`);
    
    if (throttlingWarnings.length > 0) {
      console.error('❌ FAILED: Rendering loop warnings detected');
      throttlingWarnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. [${warning.type}] ${warning.text}`);
      });
    } else {
      console.log('✅ PASSED: No rendering loop warnings detected');
    }

    // 성능 메트릭 출력
    console.log('\n🔍 Performance Metrics:');
    console.log(`   Load time: ${metrics.performanceMetrics.loadTime.toFixed(2)}ms`);
    console.log(`   DOM Content Loaded: ${metrics.performanceMetrics.domContentLoaded.toFixed(2)}ms`);
    console.log(`   First Paint: ${metrics.performanceMetrics.firstPaint.toFixed(2)}ms`);
    console.log(`   First Contentful Paint: ${metrics.performanceMetrics.firstContentfulPaint.toFixed(2)}ms`);
    
    if (metrics.performanceMetrics.memoryUsage) {
      const memUsageMB = (metrics.performanceMetrics.memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(2);
      console.log(`   Memory usage: ${memUsageMB}MB`);
    }

    // 전체 테스트 결과 판정
    const testPassed = viteSvgRequests.length <= TEST_CONFIG.maxRenderingThreshold && 
                      throttlingWarnings.length === 0;

    console.log('\n🏁 Final Result:');
    if (testPassed) {
      console.log('🎉 SUCCESS: Rendering loop fix verified! No infinite rendering detected.');
    } else {
      console.log('💥 FAILURE: Rendering loop still exists. Further optimization needed.');
    }

    // 결과를 파일로 저장
    const reportData = {
      timestamp: new Date().toISOString(),
      testPassed,
      metrics: {
        viteSvgRequestCount: viteSvgRequests.length,
        renderingWarnings: throttlingWarnings.length,
        performanceMetrics: metrics.performanceMetrics,
        testDuration: endTime - startTime
      },
      requests: viteSvgRequests,
      warnings: throttlingWarnings
    };

    fs.writeFileSync(
      path.join(__dirname, 'rendering-test-report.json'),
      JSON.stringify(reportData, null, 2)
    );

    console.log('\n📄 Detailed report saved to: rendering-test-report.json');

    return testPassed;

  } catch (error) {
    console.error('💥 Test execution error:', error);
    return false;
  } finally {
    await browser.close();
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  try {
    const testPassed = await testRenderingLoop();
    process.exit(testPassed ? 0 : 1);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// 스크립트가 직접 실행될 때만 메인 함수 실행
if (require.main === module) {
  main();
}

module.exports = { testRenderingLoop, measureRenderingMetrics };