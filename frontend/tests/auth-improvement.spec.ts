/**
 * 개선된 인증 시스템 E2E 테스트
 * WebTestingMasterAgent v2.1.0 테스트 스위트
 */
import { test, expect } from '@playwright/test';

test.describe('개선된 인증 시스템', () => {
  test.beforeEach(async ({ page }) => {
    // 개발 서버 시작 대기
    await page.goto('/');
  });

  test('비회원이 랜딩페이지에 접근할 수 있어야 한다', async ({ page }) => {
    // 랜딩페이지가 로드되는지 확인
    await expect(page).toHaveTitle(/Elderberry/);
    
    // 메인 헤드라인 확인
    await expect(page.getByRole('heading', { name: /Find Quality Elder Care/ })).toBeVisible();
    
    // 로그인 없이도 접근 가능한 요소들 확인
    await expect(page.getByText('Worldwide')).toBeVisible();
    await expect(page.getByText('Connect with trusted caregivers')).toBeVisible();
    
    // CTA 버튼들 확인
    await expect(page.getByRole('link', { name: /Get Started/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Browse Facilities/ })).toBeVisible();
  });

  test('헤더 네비게이션이 올바르게 작동해야 한다', async ({ page }) => {
    // Sign In 버튼 확인
    const signInButton = page.getByRole('link', { name: /Sign In/ });
    await expect(signInButton).toBeVisible();
    
    // Get Started 버튼 확인  
    const getStartedButton = page.getByRole('link', { name: /Get Started/ });
    await expect(getStartedButton).toBeVisible();
    
    // 네비게이션 링크들 확인
    await expect(page.getByRole('link', { name: 'How it Works' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Find Care' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Pricing' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
  });

  test('Sign In 페이지가 글로벌 표준을 따라야 한다', async ({ page }) => {
    // Sign In 페이지로 이동
    await page.getByRole('link', { name: /Sign In/ }).click();
    
    // URL 확인
    await expect(page).toHaveURL('/auth/signin');
    
    // 글로벌 표준 제목 확인
    await expect(page.getByRole('heading', { name: /Welcome Back/ })).toBeVisible();
    
    // 소셜 로그인 버튼들 확인 (글로벌 우선순위)
    await expect(page.getByRole('button', { name: /Continue with Google/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Continue with Apple/ })).toBeVisible();
    
    // 이메일 입력 폼 확인
    await expect(page.getByLabel(/Email Address/)).toBeVisible();
    await expect(page.getByRole('button', { name: /Continue/ })).toBeVisible();
  });

  test('2단계 로그인 플로우가 작동해야 한다', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // 1단계: 이메일 입력
    const emailInput = page.getByLabel(/Email Address/);
    await emailInput.fill('test.domestic@example.com');
    await page.getByRole('button', { name: /Continue/ }).click();
    
    // 2단계: 비밀번호 입력 화면으로 전환 확인
    await expect(page.getByRole('heading', { name: /Enter Your Password/ })).toBeVisible();
    await expect(page.getByText(/Continue as test.domestic@example.com/)).toBeVisible();
    
    // 이메일 변경 버튼 확인
    await expect(page.getByRole('button', { name: /Change/ })).toBeVisible();
    
    // 비밀번호 입력 폼 확인
    await expect(page.getByLabel(/Password/)).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign In/ })).toBeVisible();
  });

  test('이메일 변경 기능이 작동해야 한다', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // 이메일 입력 후 Continue
    await page.getByLabel(/Email Address/).fill('test@example.com');
    await page.getByRole('button', { name: /Continue/ }).click();
    
    // Change 버튼 클릭
    await page.getByRole('button', { name: /Change/ }).click();
    
    // 첫 번째 단계로 돌아가는지 확인
    await expect(page.getByRole('heading', { name: /Welcome Back/ })).toBeVisible();
    await expect(page.getByLabel(/Email Address/)).toBeVisible();
  });

  test('개선된 에러 메시지가 표시되어야 한다', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // 잘못된 이메일 형식 테스트
    const emailInput = page.getByLabel(/Email Address/);
    await emailInput.fill('invalid-email');
    await emailInput.blur();
    
    // 에러 메시지 확인
    await expect(page.getByText(/Please enter a valid email address/)).toBeVisible();
  });

  test('소셜 로그인 버튼들이 올바르게 작동해야 한다', async ({ page }) => {
    await page.goto('/auth/signin');
    
    const googleButton = page.getByRole('button', { name: /Continue with Google/ });
    const appleButton = page.getByRole('button', { name: /Continue with Apple/ });
    
    // 버튼들이 클릭 가능한지 확인
    await expect(googleButton).toBeEnabled();
    await expect(appleButton).toBeEnabled();
    
    // 글로벌 우선순위 순서 확인 (Google이 먼저)
    const socialButtons = page.locator('[data-testid^="social-signin-"]');
    const firstButton = socialButtons.first();
    await expect(firstButton).toHaveAttribute('data-testid', 'social-signin-google');
  });

  test('접근성이 개선되었는지 확인해야 한다', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // ARIA 레이블 확인
    await expect(page.getByLabel(/Email Address/)).toHaveAttribute('required');
    
    // 키보드 네비게이션 테스트
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('기존 /login 경로가 새 경로로 리다이렉트되어야 한다', async ({ page }) => {
    // 기존 /login 경로 접근
    await page.goto('/login');
    
    // /auth/signin으로 리다이렉트 확인
    await expect(page).toHaveURL('/auth/signin');
    await expect(page.getByRole('heading', { name: /Welcome Back/ })).toBeVisible();
  });

  test('홈으로 돌아가기 링크가 작동해야 한다', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // "Back to Home" 링크 클릭
    await page.getByRole('link', { name: /Back to Home/ }).click();
    
    // 랜딩페이지로 돌아가는지 확인
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: /Find Quality Elder Care/ })).toBeVisible();
  });

  test('도움말 링크들이 올바르게 작동해야 한다', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // 이메일 입력 후 비밀번호 단계로 이동
    await page.getByLabel(/Email Address/).fill('test@example.com');
    await page.getByRole('button', { name: /Continue/ }).click();
    
    // 도움말 링크들 확인
    await expect(page.getByRole('link', { name: /Forgot password/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Get help/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /contact support/ })).toBeVisible();
  });

  test('회원가입 링크가 올바르게 작동해야 한다', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Create Account 링크 확인
    const createAccountLink = page.getByRole('link', { name: /Create Account/ });
    await expect(createAccountLink).toBeVisible();
    
    // 링크가 올바른 URL을 가리키는지 확인
    await expect(createAccountLink).toHaveAttribute('href', '/auth/signup');
  });

  test('Keep me signed in 체크박스가 작동해야 한다', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // 이메일 입력 후 비밀번호 단계로 이동
    await page.getByLabel(/Email Address/).fill('test@example.com');
    await page.getByRole('button', { name: /Continue/ }).click();
    
    // 체크박스 확인 및 클릭
    const rememberCheckbox = page.getByRole('checkbox', { name: /Keep me signed in/ });
    await expect(rememberCheckbox).toBeVisible();
    await rememberCheckbox.check();
    await expect(rememberCheckbox).toBeChecked();
  });
});

test.describe('랜딩페이지 기능', () => {
  test('모든 섹션이 올바르게 렌더링되어야 한다', async ({ page }) => {
    await page.goto('/');
    
    // 히어로 섹션
    await expect(page.getByRole('heading', { name: /Find Quality Elder Care Worldwide/ })).toBeVisible();
    
    // 특징 섹션
    await expect(page.getByRole('heading', { name: /Why Choose Elderberry/ })).toBeVisible();
    
    // 통계 섹션
    await expect(page.getByText(/10,000\+/)).toBeVisible();
    await expect(page.getByText(/Families Served/)).toBeVisible();
    
    // CTA 섹션
    await expect(page.getByRole('heading', { name: /Ready to Find the Perfect Care/ })).toBeVisible();
  });

  test('반응형 디자인이 올바르게 작동해야 한다', async ({ page }) => {
    await page.goto('/');
    
    // 모바일 뷰포트 테스트
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 헤더의 네비게이션이 축소되는지 확인
    await expect(page.getByRole('navigation')).toBeVisible();
    
    // CTA 버튼들이 스택으로 배열되는지 확인 (CSS 클래스 체크)
    const ctaContainer = page.locator('.flex-col.sm\\:flex-row').first();
    await expect(ctaContainer).toBeVisible();
  });

  test('CTA 버튼들이 올바른 링크를 가져야 한다', async ({ page }) => {
    await page.goto('/');
    
    // "Start Your Search" 버튼
    const startSearchBtn = page.getByRole('link', { name: /Start Your Search/ });
    await expect(startSearchBtn).toHaveAttribute('href', '/auth/signup');
    
    // "Browse Facilities" 버튼  
    const browseFacilitiesBtn = page.getByRole('link', { name: /Browse Facilities/ });
    await expect(browseFacilitiesBtn).toHaveAttribute('href', '/facilities/search');
  });
});

test.describe('사용자 경험 개선', () => {
  test('페이지 로딩 시간이 합리적이어야 한다', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // 3초 이내에 로드되어야 함
    expect(loadTime).toBeLessThan(3000);
  });

  test('404 에러가 랜딩페이지로 리다이렉트되어야 한다', async ({ page }) => {
    await page.goto('/non-existent-page');
    
    // 랜딩페이지로 리다이렉트되는지 확인
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: /Find Quality Elder Care/ })).toBeVisible();
  });

  test('SEO 메타 태그가 올바르게 설정되어야 한다', async ({ page }) => {
    await page.goto('/');
    
    // 페이지 제목 확인
    await expect(page).toHaveTitle(/Elderberry/);
    
    // 메타 디스크립션 확인 (있다면)
    const metaDescription = page.locator('meta[name="description"]');
    if (await metaDescription.count() > 0) {
      const content = await metaDescription.getAttribute('content');
      expect(content).toBeTruthy();
      expect(content!.length).toBeGreaterThan(10);
    }
  });
});