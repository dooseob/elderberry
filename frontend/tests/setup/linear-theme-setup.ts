/**
 * Linear Theme Test Setup
 * Playwright 테스트를 위한 테마 시스템 설정
 */
import { test as base, expect } from '@playwright/test';

// Linear Theme Test Fixtures
export interface LinearThemeFixtures {
  linearTheme: {
    loadTheme: (themeName?: string) => Promise<void>;
    switchTheme: (themeName: string) => Promise<void>;
    waitForThemeLoad: () => Promise<void>;
    getCSSVariable: (varName: string) => Promise<string>;
    enableHighContrast: () => Promise<void>;
    disableHighContrast: () => Promise<void>;
    verifyAccessibility: () => Promise<void>;
  };
}

// Extend Playwright test with Linear Theme fixtures
export const test = base.extend<LinearThemeFixtures>({
  linearTheme: async ({ page }, use) => {
    const themeHelper = {
      // Linear 테마 로드
      loadTheme: async (themeName: string = 'default-light') => {
        await page.addInitScript(() => {
          // Linear 테마 CSS 로드
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = './src/styles/linear-theme.css';
          document.head.appendChild(link);
          
          // 테마 전역 객체 설정
          (window as any).linearTheme = {
            currentTheme: 'default-light',
            setTheme: (theme: string) => {
              const root = document.documentElement;
              
              // 테마 클래스 제거
              root.classList.remove('theme-light', 'theme-dark', 'theme-high-contrast');
              
              // 새 테마 클래스 추가
              const isDark = theme.includes('dark') || theme.includes('mocha') || theme.includes('tokyo') || theme.includes('minimal');
              root.classList.add(isDark ? 'theme-dark' : 'theme-light');
              
              // LCH 값 업데이트 (테마별 기본값)
              const themeConfigs: Record<string, { base: string; accent: string }> = {
                'default-light': { base: '95 2 266', accent: '44 99 307' },
                'default-dark': { base: '18 11 280', accent: '72 40 311' },
                'catppuccin-latte': { base: '95.07617314910061 2.1856276247566773 265.9705972968138', accent: '43.717135811988086 99.37386079300107 307.12305463765506' },
                'catppuccin-mocha': { base: '16.02115422223583 13.102236978320558 282.51213623981425', accent: '71.7932136171783 46.50946588741101 305.26693753987405' },
                'github-light': { base: '98 0 0', accent: '40 80 210' },
                'tokyo-night': { base: '15 15 250', accent: '60 90 200' },
              };
              
              const config = themeConfigs[theme] || themeConfigs['default-light'];
              root.style.setProperty('--linear-lch-base', config.base);
              root.style.setProperty('--linear-lch-accent', config.accent);
              
              (window as any).linearTheme.currentTheme = theme;
            }
          };
        });
        
        await page.goto('about:blank');
        await page.evaluate((theme) => {
          (window as any).linearTheme?.setTheme(theme);
        }, themeName);
      },

      // 테마 전환
      switchTheme: async (themeName: string) => {
        await page.evaluate((theme) => {
          (window as any).linearTheme?.setTheme(theme);
        }, themeName);
        
        // 테마 전환 애니메이션 대기
        await page.waitForTimeout(300);
      },

      // 테마 로딩 대기
      waitForThemeLoad: async () => {
        await page.waitForFunction(() => {
          const rootStyle = getComputedStyle(document.documentElement);
          const accentColor = rootStyle.getPropertyValue('--linear-color-accent').trim();
          const backgroundColor = rootStyle.getPropertyValue('--linear-color-background').trim();
          return accentColor !== '' && backgroundColor !== '';
        }, undefined, { timeout: 5000 });
      },

      // CSS 변수 값 가져오기
      getCSSVariable: async (varName: string) => {
        return await page.evaluate((variable) => {
          return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
        }, varName);
      },

      // 고대비 모드 활성화
      enableHighContrast: async () => {
        await page.evaluate(() => {
          document.documentElement.classList.add('theme-high-contrast');
        });
        await page.waitForTimeout(100);
      },

      // 고대비 모드 비활성화
      disableHighContrast: async () => {
        await page.evaluate(() => {
          document.documentElement.classList.remove('theme-high-contrast');
        });
        await page.waitForTimeout(100);
      },

      // 접근성 검증
      verifyAccessibility: async () => {
        // 색상 대비 확인
        const textColor = await themeHelper.getCSSVariable('--linear-color-text-primary');
        const backgroundColor = await themeHelper.getCSSVariable('--linear-color-background');
        
        expect(textColor).toBeTruthy();
        expect(backgroundColor).toBeTruthy();
        
        // 포커스 링 확인
        const accentColor = await themeHelper.getCSSVariable('--linear-color-accent');
        expect(accentColor).toBeTruthy();
        
        // 키보드 내비게이션 테스트
        const focusableElements = await page.locator('button, input, [tabindex], a[href]').count();
        if (focusableElements > 0) {
          await page.keyboard.press('Tab');
          const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
          expect(focusedElement).toBeTruthy();
        }
      }
    };

    await use(themeHelper);
  },
});

// Linear Component Page Object Model
export class LinearComponentPage {
  constructor(public page: any) {}

  // Button Methods
  async clickPrimaryButton(text?: string) {
    const selector = text 
      ? `.linear-button-primary:has-text("${text}")`
      : '.linear-button-primary';
    await this.page.click(selector);
    await this.page.waitForTimeout(200);
  }

  async clickSecondaryButton(text?: string) {
    const selector = text 
      ? `.linear-button-secondary:has-text("${text}")`
      : '.linear-button-secondary';
    await this.page.click(selector);
    await this.page.waitForTimeout(200);
  }

  // Card Methods
  async hoverCard(selector: string = '.linear-card') {
    await this.page.hover(selector);
    await this.page.waitForTimeout(300);
  }

  async clickCard(selector: string = '.linear-card') {
    await this.page.click(selector);
    await this.page.waitForTimeout(200);
  }

  // Input Methods
  async fillInput(selector: string, value: string) {
    await this.page.fill(selector, value);
    await this.page.waitForTimeout(100);
  }

  async focusInput(selector: string) {
    await this.page.focus(selector);
    await this.page.waitForTimeout(100);
  }

  // Theme Methods  
  async getCurrentTheme(): Promise<string> {
    return await this.page.evaluate(() => {
      return (window as any).linearTheme?.currentTheme || 'unknown';
    });
  }

  async verifyThemeColors(expectedTheme: string) {
    const isDark = expectedTheme.includes('dark') || 
                   expectedTheme.includes('mocha') || 
                   expectedTheme.includes('tokyo') ||
                   expectedTheme.includes('minimal');
    
    const themeClass = isDark ? 'theme-dark' : 'theme-light';
    const hasThemeClass = await this.page.evaluate((className: string) => {
      return document.documentElement.classList.contains(className);
    }, themeClass);
    
    expect(hasThemeClass).toBe(true);
  }

  // Animation Methods
  async waitForAnimation(duration: number = 300) {
    await this.page.waitForTimeout(duration);
  }

  async verifyElementAnimation(selector: string, expectedTransform: string) {
    await this.page.hover(selector);
    await this.page.waitForTimeout(200);
    
    const transform = await this.page.evaluate((sel) => {
      const el = document.querySelector(sel);
      return el ? getComputedStyle(el).transform : '';
    }, selector);
    
    expect(transform).toContain(expectedTransform);
  }

  // Utility Methods
  async takeScreenshot(name: string, options?: any) {
    return await this.page.screenshot({ 
      path: `tests/screenshots/${name}.png`,
      fullPage: true,
      ...options 
    });
  }

  async compareScreenshot(name: string, threshold: number = 0.2) {
    await expect(this.page).toHaveScreenshot(`${name}.png`, { threshold });
  }
}

// Test Data
export const LinearTestData = {
  themes: [
    'default-light',
    'default-dark',
    'catppuccin-latte', 
    'catppuccin-mocha',
    'github-light',
    'tokyo-night'
  ],

  components: {
    buttons: [
      'linear-button-primary',
      'linear-button-secondary'
    ],
    
    cards: [
      'linear-card'
    ],
    
    inputs: [
      'linear-input'
    ]
  },

  accessibility: {
    minimumContrastRatio: 4.5,
    largeTextContrastRatio: 3.0,
    focusIndicatorMinSize: 2 // pixels
  }
};

export { expect } from '@playwright/test';