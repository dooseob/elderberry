/**
 * SignInPage - 글로벌 사인인 페이지 (개선된 버전)
 * 사용자 친화적이고 글로벌 표준을 따르는 인증 페이지
 * 
 * @version 2.0.0
 * @author WebTestingMasterAgent
 * 
 * Features:
 * - 글로벌 표준 용어 (Sign In)
 * - 단순화된 인터페이스
 * - 지역별 소셜 로그인 최적화
 * - 접근성 개선
 * - 더 나은 에러 처리
 */
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  LogIn, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Chrome, 
  Apple,
  MessageCircle,
  UserPlus,
  ArrowRight,
  ArrowLeft,
  Globe
} from 'lucide-react';

import { AuthLayout } from '../../components/auth/AuthLayout';
import { EmailInput } from '../../components/auth/EmailInput';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { Button } from '../../shared/ui';
import { useAuthStore } from '../../stores/authStore';
// import { useLinearTheme } from '../../hooks/useLinearTheme';
import { useLinearTheme } from '../../hooks/useLinearTheme.simple';
import { useRenderingMonitor, useDependencyTracker } from '../../hooks/useRenderingMonitor';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { cn } from '../../lib/utils';

// 개선된 폼 스키마 (더 관대한 검증)
const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

type SignInFormData = z.infer<typeof signInSchema>;

/**
 * 글로벌 소셜 로그인 제공자 (지역별 최적화)
 */
const GLOBAL_SOCIAL_PROVIDERS = [
  {
    id: 'google',
    name: 'Google',
    icon: Chrome,
    color: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50',
    regions: ['global'],
    priority: 1,
    enabled: true,
  },
  {
    id: 'apple',
    name: 'Apple',
    icon: Apple,
    color: 'bg-black border-black text-white hover:bg-gray-800',
    regions: ['global'],
    priority: 2,
    enabled: true,
  },
  {
    id: 'kakao',
    name: 'Kakao',
    icon: MessageCircle,
    color: 'bg-yellow-300 border-yellow-300 text-gray-900 hover:bg-yellow-400',
    regions: ['kr'],
    priority: 3,
    enabled: true,
  },
];

/**
 * 지역별 소셜 제공자 필터링
 */
const getProvidersForRegion = (locale: string = 'en-US') => {
  const region = locale.split('-')[1]?.toLowerCase() || 'us';
  
  return GLOBAL_SOCIAL_PROVIDERS.filter(provider => 
    provider.regions.includes('global') || 
    provider.regions.includes(region)
  ).sort((a, b) => a.priority - b.priority);
};

/**
 * 더 도움이 되는 에러 메시지
 */
const getHelpfulErrorMessage = (error: string) => {
  const errorMap: Record<string, string> = {
    'Invalid credentials': 'The email or password you entered is incorrect. Please try again.',
    'Account not found': 'No account found with this email address. Would you like to create an account?',
    'Account locked': 'Your account has been temporarily locked for security. Please try again later.',
    'Network error': 'Unable to connect. Please check your internet connection and try again.',
  };
  
  return errorMap[error] || error;
};

/**
 * SignInPage Component (Internal)
 */
const SignInPageInternal: React.FC = () => {
  // 훅스
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  const { isReducedMotion } = useLinearTheme();
  
  // 렌더링 성능 모니터링 (개발 환경에서만) - 민감도 강화
  const renderingMetrics = useRenderingMonitor({
    componentName: 'SignInPage',
    threshold: 3, // 3회 이상 렌더링 시 경고 (민감도 강화)
    timeWindow: 3000 // 3초 윈도우로 단축
  });
  
  
  // 상태
  const [showPassword, setShowPassword] = React.useState(false);
  const [socialLoading, setSocialLoading] = React.useState<string | null>(null);
  const [step, setStep] = React.useState<'email' | 'password'>('email');
  const [emailValue, setEmailValue] = React.useState('');
  
  // 폼 관리
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isValid },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    mode: 'onChange',
  });
  
  // 폼 값 감시
  const watchedEmail = watch('email');
  const watchedPassword = watch('password');
  const rememberMeValue = watch('rememberMe');
  
  // 리다이렉트 경로 계산
  const redirectPath = React.useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from || '/dashboard';
  }, [location.state]);
  
  // 지역별 소셜 제공자
  const socialProviders = React.useMemo(() => {
    return getProvidersForRegion(navigator.language);
  }, []);
  
  // 이미 로그인된 사용자 리다이렉트 (렌더링 루프 방지 최적화)
  const prevAuthenticatedRef = React.useRef(isAuthenticated);
  const stableNavigate = React.useCallback(
    (path: string) => navigate(path, { replace: true }),
    [navigate]
  );
  
  React.useEffect(() => {
    // 인증 상태가 false → true로 변경될 때만 네비게이션 실행
    if (isAuthenticated && !prevAuthenticatedRef.current) {
      stableNavigate(redirectPath);
    }
    prevAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated, stableNavigate, redirectPath]);
  
  // useEffect 의존성 추적 (개발 환경에서만)
  useDependencyTracker('SignInPage-Auth-Effect', [isAuthenticated, stableNavigate, redirectPath]);
  
  // 에러 정리
  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 8000); // 8초로 연장
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);
  
  // 이메일 단계에서 계속 버튼
  const handleEmailContinue = () => {
    if (watchedEmail && !errors.email) {
      setEmailValue(watchedEmail);
      setStep('password');
    }
  };
  
  // 뒤로가기
  const handleBackToEmail = () => {
    setStep('email');
    setValue('password', '');
  };
  
  // 로그인 제출
  const onSubmit = async (data: SignInFormData) => {
    try {
      await login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });
      
      // 성공 시 리다이렉트는 useEffect에서 처리하므로 여기서는 제거
      // (isAuthenticated 상태 변화로 자동 리다이렉트)
    } catch (error) {
      // 에러는 store에서 처리
      console.error('Login failed:', error);
    }
  };
  
  // 소셜 로그인
  const handleSocialLogin = async (provider: string) => {
    setSocialLoading(provider);
    
    try {
      // 소셜 로그인 구현 (실제로는 OAuth 플로우)
      window.location.href = `/api/auth/oauth/${provider}?redirect=${encodeURIComponent(redirectPath)}`;
    } catch (error) {
      console.error(`${provider} login failed:`, error);
      setSocialLoading(null);
    }
  };
  
  // 테스트 계정 자동 입력 상태
  const [isAutoFilling, setIsAutoFilling] = React.useState(false);
  
  // 테스트 계정 자동 입력 (개발 환경에서만) - 배치 업데이트 최적화 버전
  const fillTestAccount = React.useCallback(async () => {
    if (isAutoFilling) return; // 중복 실행 방지
    
    console.log('🧪 [TEST] fillTestAccount 시작 - 배치 업데이트 최적화 모드');
    setIsAutoFilling(true);
    
    try {
      // 1단계: React 상태를 완전히 분리된 마이크로태스크에서 처리
      await new Promise<void>(resolve => {
        React.startTransition(() => {
          console.log('🧪 [TEST] 1단계: 로컬 상태 업데이트 (React 상태)');
          // React 상태만 동기적으로 업데이트 (flushSync 호환성 확인)
          if (typeof React.flushSync === 'function') {
            React.flushSync(() => {
              setEmailValue('test.domestic@example.com');
              setStep('password');
            });
          } else {
            // flushSync가 없는 경우 일반 상태 업데이트
            setEmailValue('test.domestic@example.com');
            setStep('password');
          }
          resolve();
        });
      });
      
      // 2단계: 폼 상태는 별도 마이크로태스크에서 처리 (검증 비활성화)
      await new Promise<void>(resolve => {
        setTimeout(() => {
          console.log('🧪 [TEST] 2단계: 폼 값 업데이트 (검증 비활성화)');
          // shouldValidate: false로 불필요한 검증 방지
          setValue('email', 'test.domestic@example.com', { shouldValidate: false });
          setValue('password', 'Password123!', { shouldValidate: false });
          resolve();
        }, 0);
      });
      
      // 3단계: 최종 검증은 마지막에 한 번만 실행
      await new Promise<void>(resolve => {
        setTimeout(() => {
          console.log('🧪 [TEST] 3단계: 최종 폼 검증 (한 번만)');
          trigger(); // 전체 폼 검증을 한 번만 실행
          resolve();
        }, 10);
      });
      
      console.log('🧪 [TEST] fillTestAccount 완료 - 성공');
    } catch (error) {
      console.error('🧪 [TEST] Auto-fill failed:', error);
    } finally {
      setIsAutoFilling(false);
    }
  }, [isAutoFilling, setValue, trigger]);
  
  return (
    <AuthLayout
      title={step === 'email' ? 'Welcome Back' : 'Enter Your Password'}
      subtitle={step === 'email' 
        ? 'Sign in to your Elderberry account' 
        : `Continue as ${emailValue}`
      }
      showHomeLink
      showThemeToggle
      testId="signin-page"
    >
      <div className="space-y-3 sm:space-y-4">
        
        {/* 테스트 계정 버튼 (개발 환경에서만) */}
        {import.meta.env.MODE === 'development' && (
          <div className="text-center mb-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fillTestAccount}
              disabled={isAutoFilling || isLoading}
              loading={isAutoFilling}
              className="text-xs px-3 py-1.5 border-dashed transition-opacity duration-200"
              testId="test-account-button"
            >
              {isAutoFilling ? 'Filling...' : 'Use Test Account'}
            </Button>
            {/* 렌더링 성능 디버깅 정보 (개발 환경에서만) */}
            <div className="mt-2 text-xs text-gray-500">
              Renders: {renderingMetrics.renderCount} | Avg: {renderingMetrics.averageRenderTime.toFixed(1)}ms
              {renderingMetrics.suspiciousActivity && <span className="text-red-500 ml-2">⚠️ High render activity</span>}
            </div>
          </div>
        )}
        
        {/* 이메일 단계 */}
        {step === 'email' && (
          <>
            
            {/* 이메일 입력 */}
            <div className="space-y-4">
              <EmailInput
                label="Email Address"
                placeholder="Enter your email"
                value={watchedEmail}
                onChange={(e) => setValue('email', e.target.value)}
                errorText={errors.email?.message}
                autoComplete="email"
                autoFocus
                required
                testId="signin-email"
              />
              
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handleEmailContinue}
                disabled={!watchedEmail || !!errors.email}
                className="w-full transition-all duration-200 ease-out hover:shadow-lg hover:transform hover:scale-[1.01] active:scale-[0.99]"
                testId="email-continue"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            
            {/* 구분선 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--linear-color-border-subtle)]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[var(--linear-color-surface-modal)] text-[var(--linear-color-text-secondary)]">
                  Or continue with
                </span>
              </div>
            </div>
            
            {/* 소셜 로그인 (하단으로 이동) */}
            <div className="space-y-2">
              <div className="grid gap-2">
                {socialProviders.slice(0, 2).map((provider) => (
                  <Button
                    key={provider.id}
                    type="button"
                    variant="outline"
                    size="default"
                    onClick={() => handleSocialLogin(provider.id)}
                    disabled={!provider.enabled || socialLoading === provider.id}
                    loading={socialLoading === provider.id}
                    className={cn(
                      'w-full justify-center gap-3',
                      'transition-all duration-200 ease-out',
                      'hover:shadow-lg hover:transform hover:scale-[1.01]',
                      'active:scale-[0.99] active:shadow-sm',
                      !isReducedMotion && 'linear-animate-in',
                      // 소셜 로그인 버튼은 기본 outline variant 사용
                      provider.id === 'google' && 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50',
                      provider.id === 'apple' && 'bg-black border-black text-white hover:bg-gray-800',
                      provider.id === 'kakao' && 'bg-yellow-300 border-yellow-300 text-gray-900 hover:bg-yellow-400'
                    )}
                    testId={`social-signin-${provider.id}`}
                  >
                    <provider.icon className="w-4 h-4" />
                    Continue with {provider.name}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}
        
        {/* 비밀번호 단계 */}
        {step === 'password' && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* 이메일 표시 및 뒤로가기 */}
            <div className="flex items-center gap-2 p-3 bg-[var(--linear-color-surface-secondary)] rounded-[var(--linear-radius-medium)]">
              <Mail className="w-4 h-4 text-[var(--linear-color-text-secondary)]" />
              <span className="text-sm text-[var(--linear-color-text-primary)] flex-1">
                {emailValue}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleBackToEmail}
              >
                Change
              </Button>
            </div>
            
            {/* 비밀번호 입력 */}
            <div>
              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                value={watchedPassword}
                onChange={(e) => setValue('password', e.target.value)}
                errorText={errors.password?.message}
                showStrengthIndicator={false}
                showRequirements={false}
                autoComplete="current-password"
                autoFocus
                required
                testId="signin-password"
              />
            </div>
            
            {/* 로그인 유지 & 비밀번호 찾기 */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  {...register('rememberMe')}
                  type="checkbox"
                  className="w-4 h-4 rounded border-[var(--linear-color-border-default)] bg-[var(--linear-color-surface-input)] text-[var(--linear-color-accent)] focus:ring-[var(--linear-color-accent)] focus:ring-offset-0"
                />
                <span className="text-sm text-[var(--linear-color-text-secondary)]">
                  Keep me signed in
                </span>
              </label>
              
              <Link
                to="/auth/forgot-password"
                className="text-sm text-[var(--linear-color-accent)] hover:text-[var(--linear-color-accent-hover)] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            
            {/* 에러 메시지 (개선된 버전) */}
            {error && (
              <div 
                className="flex items-start gap-3 p-3 bg-[var(--linear-color-error-bg)] text-[var(--linear-color-error)] rounded-[var(--linear-radius-medium)] text-sm"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p>{getHelpfulErrorMessage(error)}</p>
                  {error.includes('Account not found') && (
                    <Link 
                      to="/auth/signup"
                      className="underline hover:no-underline mt-1 inline-block"
                    >
                      Create an account instead
                    </Link>
                  )}
                </div>
              </div>
            )}
            
            {/* 사인인 버튼 */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              disabled={!isValid || isLoading}
              className="w-full transition-all duration-200 ease-out hover:shadow-lg hover:transform hover:scale-[1.01] active:scale-[0.99]"
              testId="signin-submit"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
          </form>
        )}
        
        {/* 사인업 링크 */}
        <div className="text-center space-y-3 pt-2">
          <div className="text-sm text-[var(--linear-color-text-secondary)]">
            Don't have an account?
          </div>
          
          <Button
            variant="ghost"
            size="default"
            asChild
            className="w-full hover:bg-[var(--linear-color-surface-secondary)] transition-colors duration-200"
            testId="signup-link"
          >
            <Link to="/auth/signup" className="flex items-center justify-center gap-2">
              <UserPlus className="w-4 h-4" />
              Create Account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
        
        {/* 도움말 링크 */}
        <div className="text-center pt-3 border-t border-[var(--linear-color-border-subtle)]">
          <p className="text-xs text-[var(--linear-color-text-tertiary)]">
            Having trouble signing in?{' '}
            <Link 
              to="/help" 
              className="text-[var(--linear-color-accent)] hover:underline transition-colors"
            >
              Get help
            </Link>
            {' '}or{' '}
            <Link 
              to="/contact" 
              className="text-[var(--linear-color-accent)] hover:underline transition-colors"
            >
              contact support
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

/**
 * SignInPage Component with Error Boundary
 */
export const SignInPage: React.FC = () => {
  return (
    <ErrorBoundary maxErrors={2}>
      <SignInPageInternal />
    </ErrorBoundary>
  );
};

export default SignInPage;