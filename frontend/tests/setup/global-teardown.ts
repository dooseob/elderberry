/**
 * Playwright Global Teardown
 * Linear Theme System 전역 정리 작업
 */
import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting Playwright Global Teardown for Linear Design System...');

  try {
    // 테스트 결과 파일들 정리
    const testResultsPath = path.join(process.cwd(), 'test-results.json');
    if (fs.existsSync(testResultsPath)) {
      const results = JSON.parse(fs.readFileSync(testResultsPath, 'utf-8'));
      
      // 테스트 통계 출력
      console.log('📊 Test Results Summary:');
      console.log(`   Total Tests: ${results.stats?.total || 'N/A'}`);
      console.log(`   Passed: ${results.stats?.passed || 'N/A'}`);
      console.log(`   Failed: ${results.stats?.failed || 'N/A'}`);
      console.log(`   Skipped: ${results.stats?.skipped || 'N/A'}`);
    }

    // 스크린샷 결과 정리
    const screenshotsDir = path.join(process.cwd(), 'test-results');
    if (fs.existsSync(screenshotsDir)) {
      const screenshots = fs.readdirSync(screenshotsDir)
        .filter(file => file.endsWith('.png'))
        .length;
      
      if (screenshots > 0) {
        console.log(`📸 Generated ${screenshots} test screenshots`);
      }
    }

    // Linear Theme 테스트 특별 정리
    const linearReportPath = path.join(process.cwd(), 'linear-theme-test-report.json');
    const linearReport = {
      timestamp: new Date().toISOString(),
      testSuite: 'Linear Design System',
      version: '1.0.0',
      themes: [
        'default-light',
        'default-dark', 
        'catppuccin-latte',
        'catppuccin-mocha',
        'github-light',
        'tokyo-night'
      ],
      components: [
        'Button',
        'Card', 
        'Input',
        'ThemeProvider'
      ],
      testTypes: [
        'Visual Regression',
        'Accessibility',
        'Theme Switching',
        'Component Interaction',
        'Performance'
      ],
      environment: {
        os: process.platform,
        node: process.version,
        playwright: '1.54.1' // Package version
      }
    };

    fs.writeFileSync(linearReportPath, JSON.stringify(linearReport, null, 2));
    console.log('📋 Linear Theme test report generated');

    // HTML 리포트 경로 안내
    const htmlReportPath = path.join(process.cwd(), 'playwright-report', 'index.html');
    if (fs.existsSync(htmlReportPath)) {
      console.log(`📊 HTML Report available at: file://${htmlReportPath}`);
    }

    console.log('✅ Global teardown completed successfully');

  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // teardown 실패가 전체 테스트를 방해하지 않도록 함
  }
}

export default globalTeardown;