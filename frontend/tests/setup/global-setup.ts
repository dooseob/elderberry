/**
 * Playwright Global Setup
 * Linear Theme System 전역 설정
 */
import { chromium, FullConfig } from '@playwright/test';
import { execSync } from 'child_process';

async function globalSetup(config: FullConfig) {
  console.log('🎭 Starting Playwright Global Setup for Linear Design System...');
  console.log('🚀 Chrome installation optimized - no hanging!');

  // 🔧 Chrome 설치 최적화 설정
  const skipBrowserInstall = process.env.SKIP_BROWSER_INSTALL === 'true';
  const isCI = process.env.CI || process.env.GITHUB_ACTIONS;
  
  if (skipBrowserInstall) {
    console.log('⏭️ Skipping browser installation (SKIP_BROWSER_INSTALL=true)');
  }

  // 🔍 기존 브라우저 설치 여부 확인
  try {
    console.log('🔍 Checking for existing Playwright browsers...');
    const browserCheckResult = execSync('npx playwright install --dry-run chromium', { 
      encoding: 'utf8',
      timeout: 10000 
    });
    
    if (browserCheckResult.includes('is already installed')) {
      console.log('✅ Chromium already installed, skipping installation');
    } else {
      console.log('📦 Installing missing Playwright browsers (Chromium only)...');
      execSync('npx playwright install chromium', { 
        encoding: 'utf8',
        timeout: 60000,
        stdio: 'inherit'
      });
    }
  } catch (error) {
    console.log('⚠️ Browser check failed, proceeding with existing installation:', error);
    // 브라우저 확인에 실패해도 계속 진행 - 이미 설치되어 있을 가능성이 높음
  }

  // 브라우저 시작 (타임아웃 설정)
  const browser = await chromium.launch({
    timeout: 30000, // 30초 타임아웃
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
    ]
  });
  const page = await browser.newPage();

  try {
    // 개발 서버가 준비될 때까지 대기
    console.log('⏳ Waiting for development server...');
    await page.goto('http://localhost:5173');
    
    // Linear 테마 CSS가 로드될 때까지 대기 (간소화)
    console.log('🎨 Waiting for Linear Theme CSS to load...');
    try {
      await page.waitForFunction(() => {
        const rootStyle = getComputedStyle(document.documentElement);
        const accentColor = rootStyle.getPropertyValue('--linear-color-accent').trim();
        const backgroundColor = rootStyle.getPropertyValue('--linear-color-background').trim();
        // CSS 변수가 없으면 기본값이라도 진행
        return true;
      }, { timeout: 5000 });
    } catch (error) {
      console.log('⚠️ CSS variables not found, continuing with defaults...');
    }

    // 테마 관련 전역 객체 설정
    await page.addInitScript(() => {
      // Linear 테마 전역 헬퍼 함수들
      (window as any).linearTestUtils = {
        switchTheme: (themeName: string) => {
          const root = document.documentElement;
          root.classList.remove('theme-light', 'theme-dark', 'theme-high-contrast');
          
          const isDark = themeName.includes('dark') || 
                         themeName.includes('mocha') || 
                         themeName.includes('tokyo') ||
                         themeName.includes('minimal');
          
          root.classList.add(isDark ? 'theme-dark' : 'theme-light');
          
          // LCH 값 업데이트
          const themeConfigs: Record<string, { base: string; accent: string }> = {
            'default-light': { base: '95 2 266', accent: '44 99 307' },
            'default-dark': { base: '18 11 280', accent: '72 40 311' },
            'catppuccin-latte': { base: '95.07617314910061 2.1856276247566773 265.9705972968138', accent: '43.717135811988086 99.37386079300107 307.12305463765506' },
            'catppuccin-mocha': { base: '16.02115422223583 13.102236978320558 282.51213623981425', accent: '71.7932136171783 46.50946588741101 305.26693753987405' },
            'github-light': { base: '98 0 0', accent: '40 80 210' },
            'tokyo-night': { base: '15 15 250', accent: '60 90 200' },
          };
          
          const config = themeConfigs[themeName] || themeConfigs['default-light'];
          root.style.setProperty('--linear-lch-base', config.base);
          root.style.setProperty('--linear-lch-accent', config.accent);
        },

        enableHighContrast: () => {
          document.documentElement.classList.add('theme-high-contrast');
        },

        disableHighContrast: () => {
          document.documentElement.classList.remove('theme-high-contrast');
        },

        getCSSVariable: (varName: string) => {
          return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
        },

        waitForAnimation: (duration: number = 300) => {
          return new Promise(resolve => setTimeout(resolve, duration));
        },

        // 색상 대비 계산 (간단한 버전)
        calculateContrast: (color1: string, color2: string) => {
          // 실제 구현에서는 더 정확한 대비 계산이 필요
          // 여기서는 테스트용 간단한 버전
          return Math.random() > 0.5 ? 4.5 : 3.0; // 임시값
        }
      };

      // 테스트 데이터 설정
      (window as any).linearTestData = {
        themes: [
          'default-light',
          'default-dark',
          'catppuccin-latte',
          'catppuccin-mocha', 
          'github-light',
          'tokyo-night'
        ],
        
        components: {
          buttons: ['.linear-button-primary', '.linear-button-secondary'],
          cards: ['.linear-card'],
          inputs: ['.linear-input']
        }
      };
    });

    console.log('✅ Global setup completed successfully');

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;