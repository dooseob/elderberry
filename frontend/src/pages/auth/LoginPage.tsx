/**
 * LoginPage - Linear 테마 로그인 페이지
 * 인증 전문가가 설계한 완전한 로그인 플로우
 * 
 * @version 2025.1.0
 * @author 인증 전문가 (Linear Theme System)
 * 
 * Features:
 * - Linear 테마 완전 적용
 * - 이메일/비밀번호 로그인
 * - 소셜 로그인 (구글, 카카오, 네이버)
 * - 로그인 유지 기능
 * - 실시간 유효성 검사
 * - 에러 처리 및 사용자 피드백
 * - 접근성 최적화
 * - 반응형 디자인
 * - 자동 리다이렉트
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
  Smartphone,
  MessageCircle,
  UserPlus,
  ArrowRight
} from 'lucide-react';

import { AuthLayout } from '../../components/auth/AuthLayout';
import { EmailInput } from '../../components/auth/EmailInput';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../entities/auth/model/store';
import { useLinearTheme } from '../../hooks/useLinearTheme';
import { cn } from '../../lib/utils';

// 로그인 폼 스키마
const loginSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요')
    .email('올바른 이메일 형식이 아닙니다'),
  password: z
    .string()
    .min(1, '비밀번호를 입력해주세요')
    .min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
  rememberMe: z.boolean().optional().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * 소셜 로그인 제공자 정보
 */
const SOCIAL_PROVIDERS = [
  {
    id: 'google',
    name: '구글',
    icon: Chrome,
    color: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50',
    enabled: true,
  },
  {
    id: 'kakao',
    name: '카카오',
    icon: MessageCircle,
    color: 'bg-yellow-300 border-yellow-300 text-gray-900 hover:bg-yellow-400',
    enabled: true,
  },
  {
    id: 'naver',
    name: '네이버',
    icon: Smartphone,
    color: 'bg-green-500 border-green-500 text-white hover:bg-green-600',
    enabled: true,
  },
];

/**
 * LoginPage Component
 */
export const LoginPage: React.FC = () => {
  // 훅스
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuthStore();
  const { isReducedMotion } = useLinearTheme();
  
  // 상태
  const [showPassword, setShowPassword] = React.useState(false);
  const [socialLoading, setSocialLoading] = React.useState<string | null>(null);
  
  // 폼 관리
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    mode: 'onChange',
  });
  
  // 폼 값 감시
  const emailValue = watch('email');
  const passwordValue = watch('password');
  const rememberMeValue = watch('rememberMe');
  
  // 리다이렉트 경로 계산
  const redirectPath = React.useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from || '/dashboard';
  }, [location.state]);
  
  // 에러 정리
  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);
  
  // 로그인 제출
  const onSubmit = async (data: LoginFormData) => {
    try {
      await login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });
      
      // 성공 시 리다이렉트
      navigate(redirectPath, { replace: true });
    } catch (error) {
      // 에러는 store에서 처리
      console.error('로그인 실패:', error);
    }
  };
  
  // 소셜 로그인
  const handleSocialLogin = async (provider: string) => {
    if (!SOCIAL_PROVIDERS.find(p => p.id === provider)?.enabled) {
      return;
    }
    
    setSocialLoading(provider);
    
    try {
      // 소셜 로그인 구현 (실제로는 OAuth 플로우)
      window.location.href = `/api/auth/oauth/${provider}?redirect=${encodeURIComponent(redirectPath)}`;
    } catch (error) {
      console.error(`${provider} 로그인 실패:`, error);
      setSocialLoading(null);
    }
  };
  
  // 비밀번호 가시성 토글
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // 테스트 계정 자동 입력
  const fillTestAccount = () => {
    setValue('email', 'test.domestic@example.com');
    setValue('password', 'Password123!');
  };
  
  return (
    <AuthLayout
      title="로그인"
      subtitle="계정에 로그인하여 서비스를 이용하세요"
      showHomeLink
      showThemeToggle
      testId="login-page"
    >
      <div className="space-y-6">
        {/* 테스트 계정 버튼 (개발 환경에서만) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={fillTestAccount}
              className="text-xs"
            >
              테스트 계정 자동 입력
            </Button>
          </div>
        )}
        
        {/* 소셜 로그인 */}
        <div className="space-y-3">
          <div className="text-center">
            <p className="text-sm text-[var(--linear-color-text-secondary)]">
              간편 로그인
            </p>
          </div>
          
          <div className="grid gap-2">
            {SOCIAL_PROVIDERS.map((provider) => (
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
                  !isReducedMotion && 'linear-animate-in',
                  provider.id === 'google' && 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50',
                  provider.id === 'kakao' && 'bg-yellow-300 border-yellow-300 text-gray-900 hover:bg-yellow-400',
                  provider.id === 'naver' && 'bg-green-500 border-green-500 text-white hover:bg-green-600'
                )}
                testId={`social-login-${provider.id}`}
              >
                <provider.icon className="w-4 h-4" />
                {provider.name}로 계속하기
              </Button>
            ))}
          </div>
        </div>
        
        {/* 구분선 */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--linear-color-border-subtle)]" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[var(--linear-color-surface-modal)] text-[var(--linear-color-text-secondary)]">
              또는 이메일로 로그인
            </span>
          </div>
        </div>
        
        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 이메일 입력 */}
          <div>
            <EmailInput
              label="이메일"
              placeholder="example@email.com"
              value={emailValue}
              onChange={(e) => setValue('email', e.target.value)}
              errorText={errors.email?.message}
              autoComplete="email"
              autoFocus
              required
              testId="login-email"
            />
          </div>
          
          {/* 비밀번호 입력 */}
          <div>
            <PasswordInput
              label="비밀번호"
              placeholder="비밀번호를 입력하세요"
              value={passwordValue}
              onChange={(e) => setValue('password', e.target.value)}
              errorText={errors.password?.message}
              showStrengthIndicator={false}
              showRequirements={false}
              autoComplete="current-password"
              required
              testId="login-password"
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
                로그인 상태 유지
              </span>
            </label>
            
            <Link
              to="/forgot-password"
              className="text-sm text-[var(--linear-color-accent)] hover:text-[var(--linear-color-accent-hover)] hover:underline"
            >
              비밀번호 찾기
            </Link>
          </div>
          
          {/* 에러 메시지 */}
          {error && (
            <div 
              className="flex items-center gap-2 p-3 bg-[var(--linear-color-error-bg)] text-[var(--linear-color-error)] rounded-[var(--linear-radius-medium)] text-sm"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          
          {/* 로그인 버튼 */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isLoading}
            disabled={!isValid || isLoading}
            className="w-full"
            testId="login-submit"
          >
            <LogIn className="w-4 h-4" />
            로그인
          </Button>
        </form>
        
        {/* 회원가입 링크 */}
        <div className="text-center space-y-3">
          <div className="text-sm text-[var(--linear-color-text-secondary)]">
            아직 계정이 없으신가요?
          </div>
          
          <Button
            variant="ghost"
            size="default"
            asChild
            className="w-full"
            testId="register-link"
          >
            <Link to="/register" className="flex items-center justify-center gap-2">
              <UserPlus className="w-4 h-4" />
              회원가입하기
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
        
        {/* 고객센터 링크 */}
        <div className="text-center pt-4 border-t border-[var(--linear-color-border-subtle)]">
          <p className="text-xs text-[var(--linear-color-text-tertiary)]">
            로그인에 문제가 있으신가요?{' '}
            <Link 
              to="/support" 
              className="text-[var(--linear-color-accent)] hover:underline"
            >
              고객센터
            </Link>
            에 문의해주세요.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;