/**
 * ForgotPasswordPage - Linear 테마 비밀번호 찾기 페이지
 * 인증 전문가가 설계한 비밀번호 재설정 플로우
 * 
 * @version 2025.1.0
 * @author 인증 전문가 (Linear Theme System)
 * 
 * Features:
 * - 2단계 비밀번호 재설정 프로세스
 * - 이메일 인증 및 인증번호 확인
 * - 새 비밀번호 설정 및 강도 검사
 * - Linear 테마 완전 적용
 * - 실시간 유효성 검사
 * - 에러 처리 및 사용자 피드백
 * - 접근성 최적화
 * - 보안 강화 (재설정 링크 만료, 토큰 검증)
 */
import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail,
  Shield,
  Key,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  LogIn,
  Send,
} from 'lucide-react';

import { AuthLayout } from '../../components/auth/AuthLayout';
import { EmailInput } from '../../components/auth/EmailInput';
import { PasswordInput, PasswordConfirmInput } from '../../components/auth/PasswordInput';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useLinearTheme } from '../../hooks/useLinearTheme';
import { cn } from '../../lib/utils';

// 단계별 스키마
const step1Schema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요')
    .email('올바른 이메일 형식이 아닙니다'),
});

const step2Schema = z.object({
  verificationCode: z
    .string()
    .min(6, '인증번호는 6자리입니다')
    .max(6, '인증번호는 6자리입니다'),
  newPassword: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, '비밀번호는 대소문자, 숫자, 특수문자를 포함해야 합니다'),
  confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
});

const forgotPasswordSchema = step1Schema.merge(step2Schema);

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * 단계 정보
 */
const STEPS = [
  {
    id: 1,
    title: '이메일 확인',
    description: '가입한 이메일 주소를 입력해주세요',
    icon: Mail,
  },
  {
    id: 2,
    title: '비밀번호 재설정',
    description: '인증번호 확인 후 새 비밀번호를 설정하세요',
    icon: Key,
  },
];

/**
 * ForgotPasswordPage Component
 */
export const ForgotPasswordPage: React.FC = () => {
  // 훅스
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isReducedMotion } = useLinearTheme();
  
  // URL에서 토큰 확인 (이메일 링크를 통한 접근)
  const resetToken = searchParams.get('token');
  const tokenEmail = searchParams.get('email');
  
  // 상태
  const [currentStep, setCurrentStep] = React.useState(resetToken ? 2 : 1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [emailSent, setEmailSent] = React.useState(false);
  const [resendCooldown, setResendCooldown] = React.useState(0);
  const [tokenValid, setTokenValid] = React.useState<boolean | null>(null);
  
  // 참조
  const cooldownRef = React.useRef<NodeJS.Timeout>();
  
  // 폼 관리
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: tokenEmail || '',
      verificationCode: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });
  
  // 폼 값 감시
  const emailValue = watch('email');
  const verificationCodeValue = watch('verificationCode');
  const newPasswordValue = watch('newPassword');
  const confirmPasswordValue = watch('confirmPassword');
  
  // 토큰 유효성 검사 (URL 접근 시)
  React.useEffect(() => {
    if (resetToken && tokenEmail) {
      validateResetToken(resetToken, tokenEmail);
    }
  }, [resetToken, tokenEmail]);
  
  // 쿨다운 타이머 관리
  React.useEffect(() => {
    if (resendCooldown > 0) {
      cooldownRef.current = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            if (cooldownRef.current) {
              clearInterval(cooldownRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current);
      }
    };
  }, [resendCooldown]);
  
  // 에러 자동 정리
  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  // 토큰 유효성 검사
  const validateResetToken = async (token: string, email: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/validate-reset-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.valid) {
        setTokenValid(true);
        setValue('email', email);
      } else {
        setTokenValid(false);
        setError('유효하지 않거나 만료된 재설정 링크입니다.');
        setCurrentStep(1);
      }
    } catch (error) {
      console.error('토큰 검증 실패:', error);
      setTokenValid(false);
      setError('링크 검증 중 오류가 발생했습니다.');
      setCurrentStep(1);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 비밀번호 재설정 이메일 발송
  const sendResetEmail = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setEmailSent(true);
        setSuccess('비밀번호 재설정 링크가 이메일로 전송되었습니다.');
        setCurrentStep(2);
      } else {
        throw new Error(data.message || '이메일 전송에 실패했습니다.');
      }
    } catch (error) {
      console.error('이메일 전송 실패:', error);
      setError(error instanceof Error ? error.message : '이메일 전송에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 인증번호로 비밀번호 재설정
  const resetPasswordWithCode = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          verificationCode: data.verificationCode,
          newPassword: data.newPassword,
          token: resetToken,
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setSuccess('비밀번호가 성공적으로 변경되었습니다.');
        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          navigate('/login', {
            state: { 
              message: '비밀번호가 변경되었습니다. 새 비밀번호로 로그인해주세요.',
              email: data.email,
            },
          });
        }, 3000);
      } else {
        throw new Error(result.message || '비밀번호 재설정에 실패했습니다.');
      }
    } catch (error) {
      console.error('비밀번호 재설정 실패:', error);
      setError(error instanceof Error ? error.message : '비밀번호 재설정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 1단계 제출 (이메일 발송)
  const handleStep1Submit = async () => {
    const isValid = await trigger(['email']);
    if (!isValid) return;
    
    await sendResetEmail(emailValue);
  };
  
  // 2단계 제출 (비밀번호 재설정)
  const handleStep2Submit = async (data: ForgotPasswordFormData) => {
    await resetPasswordWithCode(data);
  };
  
  // 이메일 재발송
  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;
    
    await sendResetEmail(emailValue);
    setResendCooldown(60); // 60초 쿨다운
  };
  
  // 진행률 계산
  const progress = Math.round((currentStep / STEPS.length) * 100);
  
  // 성공 상태 렌더링
  if (success && currentStep === 2 && !error) {
    return (
      <AuthLayout
        title="비밀번호 변경 완료"
        subtitle="비밀번호가 성공적으로 변경되었습니다"
        showHomeLink
        showThemeToggle
        testId="password-reset-success"
      >
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-[var(--linear-color-success)] rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-[var(--linear-font-weight-semibold)] text-[var(--linear-color-text-primary)]">
              변경 완료!
            </h2>
            <p className="text-[var(--linear-color-text-secondary)]">
              비밀번호가 성공적으로 변경되었습니다.<br />
              잠시 후 로그인 페이지로 이동됩니다.
            </p>
          </div>
          
          <div className="w-8 h-8 mx-auto animate-spin rounded-full border-2 border-[var(--linear-color-accent)] border-t-transparent" />
          
          <Button
            variant="primary"
            size="lg"
            asChild
            className="w-full"
          >
            <Link to="/login">
              <LogIn className="w-4 h-4" />
              지금 로그인하기
            </Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }
  
  return (
    <AuthLayout
      title="비밀번호 찾기"
      subtitle="등록된 이메일로 비밀번호를 재설정하세요"
      backLink="/login"
      showThemeToggle
      testId="forgot-password-page"
    >
      <div className="space-y-6">
        {/* 진행률 표시 */}
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-[var(--linear-color-text-secondary)]">
            <span>단계 {currentStep} / {STEPS.length}</span>
            <span>{progress}% 완료</span>
          </div>
          
          <div className="w-full h-2 bg-[var(--linear-color-border-subtle)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--linear-color-accent)] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-[var(--linear-color-accent)] rounded-full flex items-center justify-center">
              {React.createElement(STEPS[currentStep - 1].icon, {
                className: "w-6 h-6 text-white"
              })}
            </div>
            <h2 className="text-lg font-[var(--linear-font-weight-semibold)] text-[var(--linear-color-text-primary)]">
              {STEPS[currentStep - 1].title}
            </h2>
            <p className="text-sm text-[var(--linear-color-text-secondary)]">
              {STEPS[currentStep - 1].description}
            </p>
          </div>
        </div>
        
        {/* 1단계: 이메일 입력 */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <EmailInput
              label="이메일 주소"
              placeholder="가입할 때 사용한 이메일을 입력하세요"
              value={emailValue}
              onChange={(e) => setValue('email', e.target.value)}
              errorText={errors.email?.message}
              autoComplete="email"
              autoFocus
              required
            />
            
            {error && (
              <div 
                className="flex items-center gap-2 p-3 bg-[var(--linear-color-error-bg)] text-[var(--linear-color-error)] rounded-[var(--linear-radius-medium)] text-sm"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            
            {success && (
              <div 
                className="flex items-center gap-2 p-3 bg-[var(--linear-color-success-bg)] text-[var(--linear-color-success)] rounded-[var(--linear-radius-medium)] text-sm"
                role="alert"
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                {success}
              </div>
            )}
            
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleStep1Submit}
              loading={isLoading}
              disabled={!emailValue || !!errors.email || isLoading}
              className="w-full"
            >
              <Send className="w-4 h-4" />
              재설정 링크 받기
            </Button>
          </div>
        )}
        
        {/* 2단계: 인증번호 및 새 비밀번호 */}
        {currentStep === 2 && (
          <form onSubmit={handleSubmit(handleStep2Submit)} className="space-y-6">
            {/* 이메일 정보 표시 */}
            <div className="p-4 bg-[var(--linear-color-surface-elevated)] rounded-[var(--linear-radius-medium)] border border-[var(--linear-color-border-subtle)]">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[var(--linear-color-accent)]" />
                <div className="flex-1">
                  <p className="text-sm font-[var(--linear-font-weight-medium)] text-[var(--linear-color-text-primary)]">
                    {emailValue}
                  </p>
                  <p className="text-xs text-[var(--linear-color-text-secondary)]">
                    위 이메일로 인증번호가 전송되었습니다
                  </p>
                </div>
                {resendCooldown === 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResendEmail}
                    disabled={isLoading}
                  >
                    <RefreshCw className="w-3 h-3" />
                    재발송
                  </Button>
                )}
                {resendCooldown > 0 && (
                  <div className="flex items-center gap-1 text-xs text-[var(--linear-color-text-tertiary)]">
                    <Clock className="w-3 h-3" />
                    {resendCooldown}초
                  </div>
                )}
              </div>
            </div>
            
            {/* 인증번호 입력 */}
            <Input
              label="인증번호"
              placeholder="이메일로 받은 6자리 인증번호"
              value={verificationCodeValue}
              onChange={(e) => setValue('verificationCode', e.target.value)}
              errorText={errors.verificationCode?.message}
              startIcon={<Shield className="w-4 h-4" />}
              maxLength={6}
              autoComplete="one-time-code"
              required
            />
            
            {/* 새 비밀번호 */}
            <PasswordInput
              label="새 비밀번호"
              placeholder="새로운 비밀번호를 입력하세요"
              value={newPasswordValue}
              onChange={(e) => setValue('newPassword', e.target.value)}
              errorText={errors.newPassword?.message}
              showStrengthIndicator
              showRequirements
              autoComplete="new-password"
              required
            />
            
            {/* 비밀번호 확인 */}
            <PasswordConfirmInput
              label="비밀번호 확인"
              placeholder="새 비밀번호를 다시 입력하세요"
              originalPassword={newPasswordValue}
              value={confirmPasswordValue}
              onChange={(e) => setValue('confirmPassword', e.target.value)}
              errorText={errors.confirmPassword?.message}
              autoComplete="new-password"
              required
            />
            
            {error && (
              <div 
                className="flex items-center gap-2 p-3 bg-[var(--linear-color-error-bg)] text-[var(--linear-color-error)] rounded-[var(--linear-radius-medium)] text-sm"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setCurrentStep(1)}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4" />
                이전
              </Button>
              
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                disabled={!verificationCodeValue || !newPasswordValue || !confirmPasswordValue || 
                         !!errors.verificationCode || !!errors.newPassword || !!errors.confirmPassword || isLoading}
                className="flex-1"
              >
                <Key className="w-4 h-4" />
                비밀번호 변경
              </Button>
            </div>
          </form>
        )}
        
        {/* 로그인 링크 */}
        <div className="text-center pt-4 border-t border-[var(--linear-color-border-subtle)]">
          <p className="text-sm text-[var(--linear-color-text-secondary)]">
            비밀번호가 기억나셨나요?{' '}
            <Link 
              to="/login" 
              className="text-[var(--linear-color-accent)] hover:underline font-[var(--linear-font-weight-medium)] inline-flex items-center gap-1"
            >
              <LogIn className="w-3 h-3" />
              로그인하기
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;