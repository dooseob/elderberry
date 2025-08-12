/**
 * Jest + React Testing Library 통합 테스트 스위트
 * 엘더베리 프로젝트 전용 컴포넌트 및 통합 테스트 시스템
 * @version 1.0.0
 * @date 2025-08-12
 * @features Jest, React Testing Library, MSW, User Event Testing
 */

class JestTestingSuite {
    constructor() {
        this.version = '1.0.0';
        this.description = '엘더베리 프로젝트 Jest + RTL 통합 테스트 시스템';
        this.testEnvironment = 'jsdom';
        
        this.testCategories = {
            unit: '단위 테스트 (컴포넌트별)',
            integration: '통합 테스트 (기능별)',
            snapshot: '스냅샷 테스트 (UI 회귀)',
            accessibility: '접근성 테스트',
            hooks: '커스텀 훅 테스트',
            utils: '유틸리티 함수 테스트'
        };
        
        this.testTools = {
            jest: 'JavaScript 테스트 프레임워크',
            rtl: 'React Testing Library',
            msw: 'Mock Service Worker (API 모킹)',
            userEvent: 'User Event 시뮬레이션',
            axe: '접근성 테스트 도구',
            coverage: '코드 커버리지 측정'
        };
        
        this.elderberryComponents = [
            'AuthLayout', 'LoginForm', 'RegisterForm', 'ProtectedRoute',
            'Header', 'Sidebar', 'Footer', 'Layout',
            'FacilityCard', 'FacilityList', 'FacilitySearch', 'FacilityDetailModal',
            'HealthAssessment', 'HealthForm', 'HealthResults',
            'NotificationBell', 'NotificationList', 'ProfileOverview'
        ];
    }

    /**
     * 🚀 Jest 테스트 환경 설정 생성
     */
    generateJestConfig() {
        return {
            configFile: 'jest.config.js',
            content: `
module.exports = {
  // 테스트 환경 설정
  testEnvironment: 'jsdom',
  
  // 파일 확장자 및 모듈 경로 설정
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^entities/(.*)$': '<rootDir>/src/entities/$1',
    '^features/(.*)$': '<rootDir>/src/features/$1',
    '^widgets/(.*)$': '<rootDir>/src/widgets/$1',
    '^shared/(.*)$': '<rootDir>/src/shared/$1',
    '\\\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  
  // 테스트 파일 경로
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.(test|spec).{js,jsx,ts,tsx}'
  ],
  
  // 설정 파일
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  
  // 커버리지 설정
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/reportWebVitals.ts'
  ],
  
  // 커버리지 임계값
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // 변환 설정
  transform: {
    '^.+\\\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['react-app'] }]
  },
  
  // 무시할 경로
  testPathIgnorePatterns: [
    '/node_modules/',
    '/build/'
  ],
  
  // 모듈 파일 확장자
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  
  // 테스트 타임아웃
  testTimeout: 30000
};
            `.trim()
        };
    }

    /**
     * 🛠️ setupTests.ts 파일 생성
     */
    generateSetupTests() {
        return {
            filename: 'src/setupTests.ts',
            content: `
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { server } from './shared/api/mocks/server';

// React Testing Library 설정
configure({ testIdAttribute: 'data-testid' });

// MSW 서버 설정
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// 콘솔 에러 필터링
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning: ReactDOM.render is deprecated')) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// 전역 테스트 유틸리티
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// 모의 IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// window.matchMedia 모킹
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
            `.trim()
        };
    }

    /**
     * 🧪 컴포넌트별 테스트 파일 생성
     */
    generateComponentTests() {
        const tests = {};
        
        // AuthLayout 테스트
        tests['AuthLayout.test.tsx'] = `
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthLayout } from 'widgets/layout';

const AuthLayoutWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthLayout>{children}</AuthLayout>
  </BrowserRouter>
);

describe('AuthLayout', () => {
  test('인증 레이아웃이 올바르게 렌더링된다', () => {
    render(
      <AuthLayoutWrapper>
        <div>테스트 콘텐츠</div>
      </AuthLayoutWrapper>
    );
    
    expect(screen.getByText('테스트 콘텐츠')).toBeInTheDocument();
  });

  test('엘더베리 로고가 표시된다', () => {
    render(
      <AuthLayoutWrapper>
        <div>콘텐츠</div>
      </AuthLayoutWrapper>
    );
    
    // 로고 또는 브랜드명 확인
    expect(screen.getByText(/elderberry|엘더베리/i)).toBeInTheDocument();
  });

  test('레이아웃이 접근성 기준을 준수한다', async () => {
    const { container } = render(
      <AuthLayoutWrapper>
        <div>콘텐츠</div>
      </AuthLayoutWrapper>
    );
    
    // 기본 랜드마크 역할 확인
    expect(container.querySelector('main')).toBeInTheDocument();
  });
});
        `.trim();

        // LoginForm 테스트
        tests['LoginForm.test.tsx'] = `
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { LoginForm } from 'features/auth';

const LoginFormWrapper = () => (
  <BrowserRouter>
    <LoginForm />
  </BrowserRouter>
);

describe('LoginForm', () => {
  test('로그인 폼이 올바르게 렌더링된다', () => {
    render(<LoginFormWrapper />);
    
    expect(screen.getByLabelText(/이메일|email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/비밀번호|password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /로그인|login/i })).toBeInTheDocument();
  });

  test('이메일 입력이 정상 작동한다', async () => {
    const user = userEvent.setup();
    render(<LoginFormWrapper />);
    
    const emailInput = screen.getByLabelText(/이메일|email/i);
    await user.type(emailInput, 'test@example.com');
    
    expect(emailInput).toHaveValue('test@example.com');
  });

  test('비밀번호 입력이 정상 작동한다', async () => {
    const user = userEvent.setup();
    render(<LoginFormWrapper />);
    
    const passwordInput = screen.getByLabelText(/비밀번호|password/i);
    await user.type(passwordInput, 'password123');
    
    expect(passwordInput).toHaveValue('password123');
  });

  test('빈 폼 제출시 유효성 검증 메시지가 표시된다', async () => {
    const user = userEvent.setup();
    render(<LoginFormWrapper />);
    
    const submitButton = screen.getByRole('button', { name: /로그인|login/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/이메일.*필수|email.*required/i)).toBeInTheDocument();
    });
  });

  test('잘못된 이메일 형식시 오류 메시지가 표시된다', async () => {
    const user = userEvent.setup();
    render(<LoginFormWrapper />);
    
    const emailInput = screen.getByLabelText(/이메일|email/i);
    await user.type(emailInput, 'invalid-email');
    
    const submitButton = screen.getByRole('button', { name: /로그인|login/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/올바른.*이메일|valid.*email/i)).toBeInTheDocument();
    });
  });
});
        `.trim();

        // Header 테스트
        tests['Header.test.tsx'] = `
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from 'widgets/header';

const HeaderWrapper = () => (
  <BrowserRouter>
    <Header />
  </BrowserRouter>
);

describe('Header', () => {
  test('헤더가 올바르게 렌더링된다', () => {
    render(<HeaderWrapper />);
    
    // 헤더 요소 확인
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  test('로고가 홈으로 연결된다', () => {
    render(<HeaderWrapper />);
    
    const logoLink = screen.getByRole('link', { name: /logo|홈|home/i });
    expect(logoLink).toHaveAttribute('href', '/');
  });

  test('네비게이션 메뉴가 표시된다', () => {
    render(<HeaderWrapper />);
    
    // 주요 네비게이션 메뉴 확인
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  test('알림 벨이 표시된다', () => {
    render(<HeaderWrapper />);
    
    // 알림 버튼 확인
    const notificationButton = screen.getByRole('button', { name: /알림|notification/i });
    expect(notificationButton).toBeInTheDocument();
  });
});
        `.trim();

        // FacilityCard 테스트
        tests['FacilityCard.test.tsx'] = `
import { render, screen } from '@testing-library/react';
import { FacilityCard } from 'entities/facility';

const mockFacility = {
  id: '1',
  name: '엘더베리 요양원',
  address: '서울시 강남구 테헤란로 123',
  rating: 4.5,
  reviewCount: 42,
  imageUrl: '/images/facility-1.jpg'
};

describe('FacilityCard', () => {
  test('시설 카드가 올바르게 렌더링된다', () => {
    render(<FacilityCard facility={mockFacility} />);
    
    expect(screen.getByText('엘더베리 요양원')).toBeInTheDocument();
    expect(screen.getByText('서울시 강남구 테헤란로 123')).toBeInTheDocument();
  });

  test('평점이 올바르게 표시된다', () => {
    render(<FacilityCard facility={mockFacility} />);
    
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(42개 리뷰)')).toBeInTheDocument();
  });

  test('시설 이미지가 표시된다', () => {
    render(<FacilityCard facility={mockFacility} />);
    
    const image = screen.getByRole('img', { name: /엘더베리 요양원/i });
    expect(image).toHaveAttribute('src', '/images/facility-1.jpg');
  });

  test('클릭시 상세 페이지로 이동한다', () => {
    const mockOnClick = jest.fn();
    render(<FacilityCard facility={mockFacility} onClick={mockOnClick} />);
    
    const card = screen.getByRole('button');
    card.click();
    
    expect(mockOnClick).toHaveBeenCalledWith(mockFacility.id);
  });
});
        `.trim();

        return tests;
    }

    /**
     * 🔧 훅 테스트 파일 생성
     */
    generateHookTests() {
        const hookTests = {};

        // useSEO 훅 테스트
        hookTests['useSEO.test.ts'] = `
import { renderHook } from '@testing-library/react';
import { useSEO } from 'hooks/useSEO';

describe('useSEO', () => {
  test('기본 SEO 설정이 적용된다', () => {
    const { result } = renderHook(() => useSEO());
    
    expect(document.title).toBe('엘더베리 - 노인 케어 플랫폼');
  });

  test('커스텀 제목이 설정된다', () => {
    const { result } = renderHook(() => useSEO({
      title: '시설 검색',
      description: '최적의 요양시설을 찾아보세요'
    }));
    
    expect(document.title).toBe('시설 검색 | 엘더베리');
    
    const metaDescription = document.querySelector('meta[name="description"]');
    expect(metaDescription?.getAttribute('content')).toBe('최적의 요양시설을 찾아보세요');
  });

  test('구조화 데이터가 올바르게 설정된다', () => {
    const { result } = renderHook(() => useSEO({
      structuredData: {
        '@type': 'Organization',
        name: '엘더베리'
      }
    }));
    
    const structuredDataScript = document.querySelector('script[type="application/ld+json"]');
    expect(structuredDataScript).toBeInTheDocument();
  });
});
        `.trim();

        // useAuth 훅 테스트  
        hookTests['useAuth.test.ts'] = `
import { renderHook, act } from '@testing-library/react';
import { useAuth } from 'shared/hooks/useAuth';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('초기 상태가 올바르게 설정된다', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  test('로그인 함수가 정상 작동한다', async () => {
    const { result } = renderHook(() => useAuth());
    
    const mockUser = { id: '1', email: 'test@example.com', name: '테스트 사용자' };
    const mockToken = 'mock-jwt-token';
    
    await act(async () => {
      result.current.login(mockUser, mockToken);
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('authToken', mockToken);
  });

  test('로그아웃 함수가 정상 작동한다', async () => {
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      result.current.logout();
    });
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
  });
});
        `.trim();

        return hookTests;
    }

    /**
     * 📊 MSW (Mock Service Worker) 설정 생성
     */
    generateMSWConfig() {
        return {
            'src/shared/api/mocks/handlers.ts': `
import { rest } from 'msw';

export const handlers = [
  // 인증 관련 API 모킹
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: '테스트 사용자',
            role: 'domestic'
          },
          token: 'mock-jwt-token',
          refreshToken: 'mock-refresh-token'
        }
      })
    );
  }),

  rest.post('/api/auth/register', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        message: '회원가입이 완료되었습니다.'
      })
    );
  }),

  rest.get('/api/auth/me', (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return res(
        ctx.status(401),
        ctx.json({ error: '인증이 필요합니다.' })
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          id: '1',
          email: 'test@example.com',
          name: '테스트 사용자',
          role: 'domestic'
        }
      })
    );
  }),

  // 시설 관련 API 모킹
  rest.get('/api/facilities/search', (req, res, ctx) => {
    const query = req.url.searchParams.get('query');
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: [
          {
            id: '1',
            name: '엘더베리 요양원',
            address: '서울시 강남구 테헤란로 123',
            rating: 4.5,
            reviewCount: 42,
            imageUrl: '/images/facility-1.jpg'
          },
          {
            id: '2',
            name: '행복한 실버타운',
            address: '서울시 서초구 강남대로 456',
            rating: 4.2,
            reviewCount: 38,
            imageUrl: '/images/facility-2.jpg'
          }
        ],
        pagination: {
          currentPage: 1,
          totalPages: 5,
          totalItems: 50
        }
      })
    );
  }),

  rest.get('/api/facilities/:id', (req, res, ctx) => {
    const { id } = req.params;
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          id,
          name: '엘더베리 요양원',
          address: '서울시 강남구 테헤란로 123',
          phone: '02-1234-5678',
          rating: 4.5,
          reviewCount: 42,
          description: '최고의 노인 케어 서비스를 제공합니다.',
          amenities: ['24시간 간병', '의료진 상주', '레크리에이션'],
          images: ['/images/facility-1.jpg', '/images/facility-2.jpg']
        }
      })
    );
  }),

  // 건강평가 관련 API 모킹
  rest.post('/api/health/assessments', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: {
          id: '1',
          userId: '1',
          score: 85,
          category: 'excellent',
          recommendations: [
            '정기적인 운동을 계속하세요',
            '균형잡힌 식단을 유지하세요'
          ],
          createdAt: new Date().toISOString()
        }
      })
    );
  }),

  rest.get('/api/health/assessments', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: [
          {
            id: '1',
            score: 85,
            category: 'excellent',
            createdAt: '2025-08-12T00:00:00Z'
          },
          {
            id: '2',
            score: 78,
            category: 'good',
            createdAt: '2025-08-05T00:00:00Z'
          }
        ]
      })
    );
  }),
];
            `.trim(),

            'src/shared/api/mocks/server.ts': `
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
            `.trim(),

            'src/shared/api/mocks/browser.ts': `
import { setupWorker } from 'msw';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
            `.trim()
        };
    }

    /**
     * 🎯 테스트 유틸리티 함수 생성
     */
    generateTestUtils() {
        return {
            'src/shared/lib/test-utils.tsx': `
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 커스텀 렌더 함수
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// 커스텀 테스트 유틸리티
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0));

export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  });
  window.IntersectionObserver = mockIntersectionObserver;
};

export const mockResizeObserver = () => {
  const mockResizeObserver = jest.fn();
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  });
  window.ResizeObserver = mockResizeObserver;
};

// 폼 테스트 헬퍼
export const fillForm = async (user: any, fields: Record<string, string>) => {
  for (const [fieldName, value] of Object.entries(fields)) {
    const field = screen.getByLabelText(new RegExp(fieldName, 'i'));
    await user.clear(field);
    await user.type(field, value);
  }
};

// 접근성 테스트 헬퍼
export const expectElementToBeAccessible = (element: HTMLElement) => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
  expect(element).not.toHaveAttribute('aria-hidden', 'true');
};
            `.trim()
        };
    }

    /**
     * 📦 package.json 스크립트 생성
     */
    generatePackageScripts() {
        return {
            scripts: {
                'test': 'jest',
                'test:watch': 'jest --watch',
                'test:coverage': 'jest --coverage',
                'test:ci': 'jest --ci --watchAll=false --coverage',
                'test:debug': 'jest --no-cache --runInBand',
                'test:components': 'jest --testPathPattern=components',
                'test:hooks': 'jest --testPathPattern=hooks',
                'test:utils': 'jest --testPathPattern=utils',
                'test:auth': 'jest --testPathPattern=auth',
                'test:facilities': 'jest --testPathPattern=facilities',
                'test:health': 'jest --testPathPattern=health'
            },
            devDependencies: {
                '@testing-library/react': '^13.4.0',
                '@testing-library/jest-dom': '^5.16.5',
                '@testing-library/user-event': '^14.4.3',
                '@types/jest': '^29.5.5',
                'jest': '^29.7.0',
                'jest-environment-jsdom': '^29.7.0',
                'msw': '^1.3.2',
                'identity-obj-proxy': '^3.0.0',
                'babel-jest': '^29.7.0'
            }
        };
    }

    /**
     * 🚀 전체 테스트 스위트 생성
     */
    async generateCompleteTestSuite() {
        console.log('🚀 Jest + React Testing Library 테스트 스위트 생성 중...');
        
        const testSuite = {
            timestamp: new Date().toISOString(),
            version: this.version,
            description: this.description,
            
            // 설정 파일들
            configuration: {
                jestConfig: this.generateJestConfig(),
                setupTests: this.generateSetupTests(),
                testUtils: this.generateTestUtils(),
                packageScripts: this.generatePackageScripts()
            },
            
            // 테스트 파일들
            tests: {
                components: this.generateComponentTests(),
                hooks: this.generateHookTests(),
                mswConfig: this.generateMSWConfig()
            },
            
            // 테스트 전략
            testingStrategy: {
                approach: 'Bottom-up testing (단위 → 통합 → E2E)',
                coverage: '최소 70% 코드 커버리지 목표',
                priorities: [
                    '1. 핵심 인증 로직 (로그인/회원가입)',
                    '2. 시설 검색 및 필터링 기능',
                    '3. 건강평가 폼 및 결과 표시',
                    '4. 공통 UI 컴포넌트',
                    '5. 커스텀 훅 및 유틸리티'
                ]
            },
            
            // 실행 가이드
            executionGuide: {
                quickStart: [
                    '1. npm install (테스트 의존성 설치)',
                    '2. npm run test (전체 테스트 실행)',
                    '3. npm run test:watch (개발 모드)',
                    '4. npm run test:coverage (커버리지 리포트)'
                ],
                bestPractices: [
                    '✅ 테스트 파일은 컴포넌트와 동일한 디렉토리에 위치',
                    '✅ describe/test 구조로 체계적 구성',
                    '✅ MSW로 API 요청 모킹',
                    '✅ React Testing Library의 사용자 중심 테스트',
                    '✅ 접근성 테스트 포함',
                    '✅ 스냅샷 테스트로 UI 회귀 방지'
                ]
            },
            
            // 성능 메트릭
            metrics: {
                estimatedSetupTime: '15-30분',
                expectedCoverage: '70-85%',
                testExecutionTime: '30-60초',
                maintenanceEffort: '낮음 (자동화됨)'
            }
        };

        return testSuite;
    }

    /**
     * 📋 테스트 실행 체크리스트 생성
     */
    generateTestExecutionChecklist() {
        return {
            title: 'Jest + RTL 테스트 실행 체크리스트',
            sections: {
                setup: {
                    title: '🛠️ 초기 설정',
                    items: [
                        '□ Jest 및 RTL 패키지 설치 완료',
                        '□ jest.config.js 설정 파일 생성',
                        '□ setupTests.ts 설정 완료',
                        '□ MSW 핸들러 설정 완료',
                        '□ 테스트 유틸리티 함수 준비'
                    ]
                },
                execution: {
                    title: '🧪 테스트 실행',
                    items: [
                        '□ npm run test - 전체 테스트 실행',
                        '□ npm run test:watch - 개발 모드 실행',
                        '□ npm run test:coverage - 커버리지 확인',
                        '□ 모든 테스트 통과 확인',
                        '□ 70% 이상 코드 커버리지 달성'
                    ]
                },
                components: {
                    title: '🧩 컴포넌트 테스트',
                    items: [
                        '□ AuthLayout 렌더링 테스트',
                        '□ LoginForm 동작 테스트',
                        '□ Header 네비게이션 테스트',
                        '□ FacilityCard 표시 테스트',
                        '□ NotificationBell 상태 테스트'
                    ]
                },
                integration: {
                    title: '🔗 통합 테스트',
                    items: [
                        '□ 로그인 플로우 전체 테스트',
                        '□ 시설 검색 기능 테스트',
                        '□ 건강평가 생성 테스트',
                        '□ API 응답 처리 테스트',
                        '□ 에러 상황 처리 테스트'
                    ]
                },
                accessibility: {
                    title: '♿ 접근성 테스트',
                    items: [
                        '□ 폼 라벨링 확인',
                        '□ 키보드 네비게이션 테스트',
                        '□ 스크린 리더 지원 확인',
                        '□ 색상 대비 확인',
                        '□ ARIA 속성 검증'
                    ]
                }
            }
        };
    }
}

module.exports = { JestTestingSuite };