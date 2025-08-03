/**
 * Playwright Configuration
 * Linear Design System Components 테스트를 위한 설정
 */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  
  // 테스트 실행 설정
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // 리포터 설정
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }]
  ],
  
  // 전역 설정
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Linear Theme 테스트를 위한 추가 설정
    extraHTTPHeaders: {
      // CSP 헤더가 있는 경우 테마 CSS 로딩을 위해 필요할 수 있음
    },
  },

  // 프로젝트별 설정
  projects: [
    // 데스크톱 브라우저
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox', 
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // 모바일 브라우저 (Linear 반응형 테스트)
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    // 태블릿 (중간 크기 화면 테스트)
    {
      name: 'Tablet',
      use: { ...devices['iPad Pro'] },
    },

    // 접근성 테스트 (고대비 모드)
    {
      name: 'High Contrast',
      use: {
        ...devices['Desktop Chrome'],
        colorScheme: 'dark',
        forcedColors: 'active', // Windows 고대비 모드 시뮬레이션
      },
    },

    // 다크 모드 테스트
    {
      name: 'Dark Mode',
      use: {
        ...devices['Desktop Chrome'],
        colorScheme: 'dark',
      },
    },
  ],

  // 개발 서버 설정
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // Linear 테마 로딩 시간 고려
  },

  // 테스트 설정
  timeout: 30000, // 테스트 타임아웃
  expect: {
    timeout: 10000, // assertion 타임아웃
    toHaveScreenshot: {
      threshold: 0.2, // 스크린샷 비교 임계값
      mode: 'strict', // 엄격한 비교 모드
    },
  },

  // 테스트 매칭 패턴
  testMatch: [
    '**/tests/**/*.spec.ts',
    '**/tests/**/*.test.ts',
  ],

  // 무시할 파일들
  testIgnore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
  ],

  // 글로벌 설정 (Chrome 설치 최적화)
  globalSetup: './tests/setup/global-setup.ts',
  // globalTeardown: './tests/setup/global-teardown.ts',
  
  // 🚀 Chrome 설치 문제 해결 설정
  workers: process.env.CI ? 1 : 2, // CI에서 안정성 향상
  maxFailures: process.env.CI ? 5 : 3, // 실패 시 조기 종료
  
  // 브라우저 재설치 방지 설정
  metadata: {
    skipBrowserDownload: true, // 브라우저 재다운로드 방지
  },
  
  // 브라우저 실행 최적화
  launchOptions: {
    // Chrome 실행 시 안정성 향상 옵션
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=TranslateUI',
      '--disable-ipc-flooding-protection',
    ],
    timeout: 30000, // 브라우저 시작 타임아웃 30초
  },
});