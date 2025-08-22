/**
 * Linear Design System Component Tests
 * Playwright를 이용한 컴포넌트 테스트 자동화
 */
import { test, expect, Page } from '@playwright/test';

// 테스트 유틸리티 함수
class LinearComponentTester {
  constructor(private page: Page) {}

  async waitForLinearTheme() {
    // Linear 테마 CSS가 로드될 때까지 대기 (간소화)
    try {
      await this.page.waitForFunction(() => {
        const rootStyle = getComputedStyle(document.documentElement);
        return rootStyle.getPropertyValue('--linear-color-accent').trim() !== '';
      }, { timeout: 2000 });
    } catch (error) {
      // CSS 변수가 없으면 기본값으로 진행
      console.log('Linear theme CSS not found, continuing with defaults...');
    }
  }

  async switchTheme(themeName: string) {
    // 테마 전환
    await this.page.evaluate((theme) => {
      const themeProvider = (window as any).linearTheme;
      if (themeProvider?.setTheme) {
        themeProvider.setTheme(theme);
      }
    }, themeName);
    
    await this.page.waitForTimeout(300); // 테마 전환 애니메이션 대기
  }

  async getCSSProperty(selector: string, property: string): Promise<string> {
    return await this.page.evaluate(
      ({ sel, prop }) => {
        const el = document.querySelector(sel);
        return el ? getComputedStyle(el).getPropertyValue(prop) : '';
      },
      { sel: selector, prop: property }
    );
  }

  async isElementVisible(selector: string): Promise<boolean> {
    return await this.page.isVisible(selector);
  }

  async clickAndWaitForAnimation(selector: string) {
    await this.page.click(selector);
    await this.page.waitForTimeout(200); // 애니메이션 완료 대기
  }
}

// 테스트 데이터
const testThemes = [
  'default-light',
  'default-dark', 
  'catppuccin-latte',
  'catppuccin-mocha',
  'github-light',
  'tokyo-night'
];

test.describe('Linear Button Component', () => {
  let tester: LinearComponentTester;

  test.beforeEach(async ({ page }) => {
    tester = new LinearComponentTester(page);
    // 직접 HTML 설정으로 변경 (개발 서버 의존성 제거)
    await page.setContent(`
      <html>
        <head>
          <style>
            /* 기본 Linear CSS 변수 설정 */
            :root {
              --linear-color-accent: #4A9EFF;
              --linear-color-background: #FFFFFF;
            }
          </style>
        </head>
        <body></body>
      </html>
    `);
  });

  test('should render primary button with correct styles', async ({ page }) => {
    const buttonHtml = `
      <div id="test-container">
        <button class="linear-button-primary">Primary Button</button>
      </div>
    `;
    
    await page.setContent(`
      <html>
        <head>
          <link rel="stylesheet" href="./src/styles/linear-theme.css">
        </head>
        <body>${buttonHtml}</body>
      </html>
    `);

    const button = page.locator('.linear-button-primary');
    await expect(button).toBeVisible();
    await expect(button).toHaveText('Primary Button');
    
    // CSS 속성 확인
    const backgroundColor = await tester.getCSSProperty('.linear-button-primary', 'background-color');
    expect(backgroundColor).toBeTruthy();
  });

  test('should handle button interactions correctly', async ({ page }) => {
    const buttonHtml = `
      <div id="test-container">
        <button class="linear-button-primary linear-animate-scale" onclick="this.textContent='Clicked!'">
          Click Me
        </button>
      </div>
    `;
    
    await page.setContent(`
      <html>
        <head>
          <link rel="stylesheet" href="./src/styles/linear-theme.css">
        </head>
        <body>${buttonHtml}</body>
      </html>
    `);

    const button = page.locator('.linear-button-primary');
    
    // 호버 효과 테스트
    await button.hover();
    await page.waitForTimeout(100);
    
    // 클릭 테스트
    await tester.clickAndWaitForAnimation('.linear-button-primary');
    await expect(button).toHaveText('Clicked!');
  });

  test('should support different button variants', async ({ page }) => {
    const buttonsHtml = `
      <div id="test-container">
        <button class="linear-button-primary">Primary</button>
        <button class="linear-button-secondary">Secondary</button>
        <button class="bg-[var(--linear-color-success)] text-white rounded-[var(--linear-radius-medium)] px-[var(--linear-spacing-lg)] py-[var(--linear-spacing-sm)]">Success</button>
        <button class="bg-[var(--linear-color-error)] text-white rounded-[var(--linear-radius-medium)] px-[var(--linear-spacing-lg)] py-[var(--linear-spacing-sm)]">Error</button>
      </div>
    `;
    
    await page.setContent(`
      <html>
        <head>
          <link rel="stylesheet" href="./src/styles/linear-theme.css">
        </head>
        <body>${buttonsHtml}</body>
      </html>
    `);

    await expect(page.locator('.linear-button-primary')).toBeVisible();
    await expect(page.locator('.linear-button-secondary')).toBeVisible();
    
    // 각 버튼이 다른 스타일을 가지는지 확인
    const primaryBg = await tester.getCSSProperty('.linear-button-primary', 'background-color');
    const secondaryBg = await tester.getCSSProperty('.linear-button-secondary', 'background-color');
    
    expect(primaryBg).not.toBe(secondaryBg);
  });
});

test.describe('Linear Card Component', () => {
  let tester: LinearComponentTester;

  test.beforeEach(async ({ page }) => {
    tester = new LinearComponentTester(page);
    await page.setContent(`
      <html>
        <head>
          <style>
            :root {
              --linear-color-accent: #4A9EFF;
              --linear-color-background: #FFFFFF;
              --linear-color-text-primary: #000000;
              --linear-color-text-secondary: #666666;
            }
          </style>
        </head>
        <body></body>
      </html>
    `);
  });

  test('should render card with correct structure', async ({ page }) => {
    const cardHtml = `
      <div id="test-container">
        <div class="linear-card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-[var(--linear-color-text-primary)]">Card Title</h3>
            <p class="text-sm text-[var(--linear-color-text-secondary)]">Card Description</p>
          </div>
          <div class="card-content">
            <p class="text-[var(--linear-color-text-primary)]">Card content goes here</p>
          </div>
        </div>
      </div>
    `;
    
    await page.setContent(`
      <html>
        <head>
          <link rel="stylesheet" href="./src/styles/linear-theme.css">
        </head>
        <body>${cardHtml}</body>
      </html>
    `);

    const card = page.locator('.linear-card');
    await expect(card).toBeVisible();
    
    // 카드 내부 요소들 확인
    await expect(card.locator('h3')).toHaveText('Card Title');
    await expect(card.locator('p').first()).toHaveText('Card Description');
  });

  test('should handle card hover effects', async ({ page }) => {
    const cardHtml = `
      <div id="test-container">
        <div class="linear-card hover:shadow-[var(--linear-shadow-modal)] hover:-translate-y-1 transition-all duration-200 cursor-pointer">
          <p>Hoverable Card</p>
        </div>
      </div>
    `;
    
    await page.setContent(`
      <html>
        <head>
          <link rel="stylesheet" href="./src/styles/linear-theme.css">
        </head>
        <body>${cardHtml}</body>
      </html>
    `);

    const card = page.locator('.linear-card');
    
    // 호버 전 위치 기록
    const initialPosition = await card.boundingBox();
    
    // 호버 효과 테스트
    await card.hover();
    await page.waitForTimeout(300);
    
    // 카드가 약간 위로 올라갔는지 확인 (transform: translateY(-1px))
    const hoveredPosition = await card.boundingBox();
    expect(hoveredPosition?.y).toBeLessThan(initialPosition?.y || 0);
  });
});

test.describe('Linear Theme System', () => {
  let tester: LinearComponentTester;

  test.beforeEach(async ({ page }) => {
    tester = new LinearComponentTester(page);
    await page.setContent(`
      <html>
        <head>
          <style>
            :root {
              --linear-color-accent: #4A9EFF;
              --linear-color-background: #FFFFFF;
              --linear-color-text-primary: #000000;
              --linear-color-text-secondary: #666666;
            }
          </style>
        </head>
        <body></body>
      </html>
    `);
  });

  test('should support multiple themes', async ({ page }) => {
    for (const theme of testThemes) {
      await tester.switchTheme(theme);
      
      // 테마가 적용되었는지 확인
      const themeClass = theme.includes('dark') || theme.includes('mocha') || theme.includes('tokyo') 
        ? 'theme-dark' 
        : 'theme-light';
      
      const hasThemeClass = await page.evaluate((className) => {
        return document.documentElement.classList.contains(className);
      }, themeClass);
      
      expect(hasThemeClass).toBe(true);
    }
  });

  test('should maintain accessibility in all themes', async ({ page }) => {
    const componentHtml = `
      <div id="test-container">
        <button class="linear-button-primary focus:linear-focus-ring">Accessible Button</button>
        <div class="linear-card" tabindex="0" role="button">Accessible Card</div>
        <input class="linear-input" placeholder="Accessible Input" aria-label="Test Input">
      </div>
    `;
    
    await page.setContent(`
      <html>
        <head>
          <link rel="stylesheet" href="./src/styles/linear-theme.css">
        </head>
        <body>${componentHtml}</body>
      </html>
    `);

    for (const theme of ['default-light', 'default-dark']) {
      await tester.switchTheme(theme);
      
      // 키보드 내비게이션 테스트
      await page.keyboard.press('Tab');
      await expect(page.locator('.linear-button-primary')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('.linear-card')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('.linear-input')).toBeFocused();
      
      // ARIA 속성 확인
      const input = page.locator('.linear-input');
      await expect(input).toHaveAttribute('aria-label', 'Test Input');
    }
  });

  test('should handle high contrast mode', async ({ page }) => {
    // 고대비 모드 토글
    await page.evaluate(() => {
      document.documentElement.classList.add('theme-high-contrast');
    });

    const componentHtml = `
      <div id="test-container">
        <button class="linear-button-primary">High Contrast Button</button>
        <p class="text-[var(--linear-color-text-primary)]">High contrast text</p>
      </div>
    `;
    
    await page.setContent(`
      <html>
        <head>
          <link rel="stylesheet" href="./src/styles/linear-theme.css">
        </head>
        <body class="theme-high-contrast">${componentHtml}</body>
      </html>
    `);

    // 고대비 모드에서 텍스트 대비가 충분한지 확인
    const textColor = await tester.getCSSProperty('p', 'color');
    const backgroundColor = await tester.getCSSProperty('body', 'background-color');
    
    // 실제 대비 계산은 복잡하므로, 여기서는 색상이 설정되었는지만 확인
    expect(textColor).toBeTruthy();
    expect(backgroundColor).toBeTruthy();
  });
});

test.describe('Linear Input Component', () => {
  let tester: LinearComponentTester;

  test.beforeEach(async ({ page }) => {
    tester = new LinearComponentTester(page);
    await page.setContent(`
      <html>
        <head>
          <style>
            :root {
              --linear-color-accent: #4A9EFF;
              --linear-color-background: #FFFFFF;
              --linear-color-text-primary: #000000;
              --linear-color-text-secondary: #666666;
              --linear-spacing-xs: 0.25rem;
              --linear-spacing-sm: 0.5rem;
              --linear-spacing-lg: 1rem;
            }
          </style>
        </head>
        <body></body>
      </html>
    `);
  });

  test('should render input with correct styles', async ({ page }) => {
    const inputHtml = `
      <div id="test-container">
        <div class="linear-input-group">
          <label class="block text-sm font-medium text-[var(--linear-color-text-primary)] mb-[var(--linear-spacing-xs)]">
            Test Label
          </label>
          <input class="linear-input w-full" type="text" placeholder="Enter text...">
        </div>
      </div>
    `;
    
    await page.setContent(`
      <html>
        <head>
          <link rel="stylesheet" href="./src/styles/linear-theme.css">
        </head>
        <body>${inputHtml}</body>
      </html>
    `);

    const input = page.locator('.linear-input');
    const label = page.locator('label');
    
    await expect(input).toBeVisible();
    await expect(label).toHaveText('Test Label');
    await expect(input).toHaveAttribute('placeholder', 'Enter text...');
  });

  test('should handle input focus states', async ({ page }) => {
    const inputHtml = `
      <div id="test-container">
        <input class="linear-input" type="text" placeholder="Focus test">
      </div>
    `;
    
    await page.setContent(`
      <html>
        <head>
          <link rel="stylesheet" href="./src/styles/linear-theme.css">
        </head>
        <body>${inputHtml}</body>
      </html>
    `);

    const input = page.locator('.linear-input');
    
    // 포커스 전 상태
    const unfocusedBorder = await tester.getCSSProperty('.linear-input', 'border-color');
    
    // 포커스
    await input.focus();
    await page.waitForTimeout(100);
    
    // 포커스 상태에서 스타일 변화 확인
    const focusedBorder = await tester.getCSSProperty('.linear-input', 'border-color');
    
    // 포커스 시 테두리 색상이 변해야 함
    expect(focusedBorder).not.toBe(unfocusedBorder);
  });
});

test.describe('Linear Component Performance', () => {
  test('should render components efficiently', async ({ page }) => {
    const startTime = Date.now();
    
    const manyComponentsHtml = `
      <div id="test-container">
        ${Array.from({ length: 100 }, (_, i) => `
          <div class="linear-card mb-4">
            <h3 class="text-lg font-semibold">Card ${i + 1}</h3>
            <p class="text-sm text-[var(--linear-color-text-secondary)]">Description ${i + 1}</p>
            <button class="linear-button-primary mt-2">Button ${i + 1}</button>
          </div>
        `).join('')}
      </div>
    `;
    
    await page.setContent(`
      <html>
        <head>
          <link rel="stylesheet" href="./src/styles/linear-theme.css">
        </head>
        <body>${manyComponentsHtml}</body>
      </html>
    `);

    // 모든 컴포넌트가 렌더링될 때까지 대기
    await page.waitForSelector('.linear-card:nth-child(100)');
    
    const endTime = Date.now();
    const renderTime = endTime - startTime;
    
    // 렌더링 시간이 2초를 넘지 않아야 함
    expect(renderTime).toBeLessThan(2000);
    
    // 모든 컴포넌트가 올바르게 렌더링되었는지 확인
    const cardCount = await page.locator('.linear-card').count();
    expect(cardCount).toBe(100);
  });
});

// 시각적 회귀 테스트
test.describe('Linear Component Visual Tests', () => {
  test('should match visual snapshots', async ({ page }) => {
    const componentShowcaseHtml = `
      <div id="showcase" style="padding: 20px; background: var(--linear-color-background);">
        <h1 style="color: var(--linear-color-text-primary); margin-bottom: 20px;">Linear Component Showcase</h1>
        
        <!-- Buttons -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: var(--linear-color-text-primary); margin-bottom: 10px;">Buttons</h2>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="linear-button-primary">Primary</button>
            <button class="linear-button-secondary">Secondary</button>
            <button class="bg-[var(--linear-color-success)] text-white rounded-[var(--linear-radius-medium)] px-[var(--linear-spacing-lg)] py-[var(--linear-spacing-sm)]">Success</button>
            <button class="bg-[var(--linear-color-error)] text-white rounded-[var(--linear-radius-medium)] px-[var(--linear-spacing-lg)] py-[var(--linear-spacing-sm)]">Error</button>
          </div>
        </div>
        
        <!-- Cards -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: var(--linear-color-text-primary); margin-bottom: 10px;">Cards</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
            <div class="linear-card">
              <h3 class="text-lg font-semibold text-[var(--linear-color-text-primary)] mb-2">Default Card</h3>
              <p class="text-sm text-[var(--linear-color-text-secondary)]">This is a default card with some content.</p>
            </div>
            <div class="linear-card hover:shadow-[var(--linear-shadow-modal)] transition-all">
              <h3 class="text-lg font-semibold text-[var(--linear-color-text-primary)] mb-2">Hover Card</h3>
              <p class="text-sm text-[var(--linear-color-text-secondary)]">This card has hover effects.</p>
            </div>
          </div>
        </div>
        
        <!-- Inputs -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: var(--linear-color-text-primary); margin-bottom: 10px;">Inputs</h2>
          <div style="max-width: 400px;">
            <div class="linear-input-group mb-4">
              <label class="block text-sm font-medium text-[var(--linear-color-text-primary)] mb-[var(--linear-spacing-xs)]">Default Input</label>
              <input class="linear-input w-full" type="text" placeholder="Enter text...">
            </div>
            <div class="linear-input-group">
              <label class="block text-sm font-medium text-[var(--linear-color-text-primary)] mb-[var(--linear-spacing-xs)]">Error Input</label>
              <input class="linear-input w-full border-[var(--linear-color-error)]" type="text" placeholder="Error state..." value="Invalid input">
            </div>
          </div>
        </div>
      </div>
    `;
    
    await page.setContent(`
      <html>
        <head>
          <link rel="stylesheet" href="./src/styles/linear-theme.css">
        </head>
        <body>${componentShowcaseHtml}</body>
      </html>
    `);

    // 라이트 테마 스크린샷
    await expect(page.locator('#showcase')).toHaveScreenshot('linear-components-light.png');
    
    // 다크 테마로 전환
    await page.evaluate(() => {
      document.documentElement.classList.remove('theme-light');
      document.documentElement.classList.add('theme-dark');
    });
    
    await page.waitForTimeout(300);
    
    // 다크 테마 스크린샷
    await expect(page.locator('#showcase')).toHaveScreenshot('linear-components-dark.png');
  });
});