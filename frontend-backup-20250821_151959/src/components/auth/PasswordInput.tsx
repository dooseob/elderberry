/**
 * PasswordInput - 비밀번호 전용 입력 컴포넌트
 * 폼 전문가가 설계한 비밀번호 강도 검사 및 가시성 토글 포함
 * 
 * @version 2025.1.0
 * @author 폼 전문가 (Linear Theme System)
 * 
 * Features:
 * - 실시간 비밀번호 강도 검사
 * - 시각적 강도 표시기
 * - 비밀번호 가시성 토글
 * - Linear 테마 완전 적용
 * - 자동 완성 보안 설정
 * - 접근성 최적화
 * - 실시간 검증 피드백
 */
import React from 'react';
import { Eye, EyeOff, Shield, Check, X, AlertTriangle } from 'lucide-react';
import { Input, validatePassword, type InputProps } from '../../shared/ui/Input';
import { cn } from '../../lib/utils';

/**
 * 비밀번호 강도 타입
 */
export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

/**
 * 비밀번호 요구사항
 */
export interface PasswordRequirement {
  label: string;
  regex: RegExp;
  met: boolean;
}

/**
 * PasswordInput Props
 */
export interface PasswordInputProps extends Omit<InputProps, 'type' | 'validate' | 'showPasswordToggle' | 'endIcon'> {
  /** 비밀번호 강도 표시 */
  showStrengthIndicator?: boolean;
  
  /** 요구사항 체크리스트 표시 */
  showRequirements?: boolean;
  
  /** 최소 길이 */
  minLength?: number;
  
  /** 최대 길이 */
  maxLength?: number;
  
  /** 특수문자 요구 */
  requireSpecialChar?: boolean;
  
  /** 숫자 요구 */
  requireNumber?: boolean;
  
  /** 대문자 요구 */
  requireUpperCase?: boolean;
  
  /** 소문자 요구 */
  requireLowerCase?: boolean;
  
  /** 확인용 비밀번호 (비교용) */
  confirmValue?: string;
  
  /** 비밀번호 강도 변경 콜백 */
  onStrengthChange?: (strength: PasswordStrength) => void;
  
  /** 커스텀 유효성 검사 */
  customValidation?: (password: string) => string | null;
}

/**
 * PasswordInput Component
 * 비밀번호 전용 입력 필드
 */
export const PasswordInput: React.FC<PasswordInputProps> = ({
  showStrengthIndicator = true,
  showRequirements = true,
  minLength = 8,
  maxLength = 128,
  requireSpecialChar = true,
  requireNumber = true,
  requireUpperCase = true,
  requireLowerCase = true,
  confirmValue,
  onStrengthChange,
  customValidation,
  value,
  onChange,
  className,
  ...props
}) => {
  // 상태 관리
  const [showPassword, setShowPassword] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState(value || '');
  const [strength, setStrength] = React.useState<PasswordStrength>('weak');
  const [requirements, setRequirements] = React.useState<PasswordRequirement[]>([]);
  
  // 비밀번호 요구사항 정의
  const generateRequirements = React.useCallback((password: string): PasswordRequirement[] => {
    return [
      {
        label: `최소 ${minLength}자 이상`,
        regex: new RegExp(`.{${minLength},}`),
        met: password.length >= minLength,
      },
      {
        label: '소문자 포함',
        regex: /[a-z]/,
        met: requireLowerCase ? /[a-z]/.test(password) : true,
      },
      {
        label: '대문자 포함',
        regex: /[A-Z]/,
        met: requireUpperCase ? /[A-Z]/.test(password) : true,
      },
      {
        label: '숫자 포함',
        regex: /[0-9]/,
        met: requireNumber ? /[0-9]/.test(password) : true,
      },
      {
        label: '특수문자 포함',
        regex: /[!@#$%^&*(),.?":{}|<>]/,
        met: requireSpecialChar ? /[!@#$%^&*(),.?":{}|<>]/.test(password) : true,
      },
    ].filter(req => {
      // 요구사항이 비활성화된 항목 제거
      if (req.label.includes('소문자') && !requireLowerCase) return false;
      if (req.label.includes('대문자') && !requireUpperCase) return false;
      if (req.label.includes('숫자') && !requireNumber) return false;
      if (req.label.includes('특수문자') && !requireSpecialChar) return false;
      return true;
    });
  }, [minLength, requireLowerCase, requireUpperCase, requireNumber, requireSpecialChar]);
  
  // 비밀번호 강도 계산
  const calculateStrength = React.useCallback((password: string): PasswordStrength => {
    if (!password) return 'weak';
    
    const reqs = generateRequirements(password);
    const metCount = reqs.filter(req => req.met).length;
    const totalCount = reqs.length;
    const score = metCount / totalCount;
    
    if (score >= 0.9) return 'strong';
    if (score >= 0.7) return 'good';
    if (score >= 0.4) return 'fair';
    return 'weak';
  }, [generateRequirements]);
  
  // 통합 유효성 검사
  const validatePasswordInput = React.useCallback((password: string): string | null => {
    // 비어있는 경우 (required는 Input 컴포넌트에서 처리)
    if (!password) return null;
    
    // 길이 검사
    if (password.length < minLength) {
      return `비밀번호는 최소 ${minLength}자 이상이어야 합니다.`;
    }
    if (password.length > maxLength) {
      return `비밀번호는 최대 ${maxLength}자까지 입력 가능합니다.`;
    }
    
    // 기본 비밀번호 검증
    const basicValidation = validatePassword(password);
    if (basicValidation) return basicValidation;
    
    // 확인 비밀번호와 일치 검사
    if (confirmValue !== undefined && password !== confirmValue) {
      return '비밀번호가 일치하지 않습니다.';
    }
    
    // 커스텀 검증
    if (customValidation) {
      const customResult = customValidation(password);
      if (customResult) return customResult;
    }
    
    return null;
  }, [minLength, maxLength, confirmValue, customValidation]);
  
  // 입력값 변경 처리
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    
    // 요구사항 및 강도 업데이트
    const newRequirements = generateRequirements(newValue);
    const newStrength = calculateStrength(newValue);
    
    setRequirements(newRequirements);
    setStrength(newStrength);
    
    // 강도 변경 콜백
    onStrengthChange?.(newStrength);
    
    onChange?.(e);
  };
  
  // 비밀번호 가시성 토글
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // 강도별 색상 반환
  const getStrengthColor = (strength: PasswordStrength) => {
    switch (strength) {
      case 'weak':
        return 'text-[var(--linear-color-error)]';
      case 'fair':
        return 'text-[var(--linear-color-warning)]';
      case 'good':
        return 'text-[var(--linear-color-info)]';
      case 'strong':
        return 'text-[var(--linear-color-success)]';
      default:
        return 'text-[var(--linear-color-text-tertiary)]';
    }
  };
  
  // 강도별 배경색 반환
  const getStrengthBgColor = (strength: PasswordStrength) => {
    switch (strength) {
      case 'weak':
        return 'bg-[var(--linear-color-error)]';
      case 'fair':
        return 'bg-[var(--linear-color-warning)]';
      case 'good':
        return 'bg-[var(--linear-color-info)]';
      case 'strong':
        return 'bg-[var(--linear-color-success)]';
      default:
        return 'bg-[var(--linear-color-border-default)]';
    }
  };
  
  // 강도 텍스트 반환
  const getStrengthText = (strength: PasswordStrength) => {
    switch (strength) {
      case 'weak':
        return '약함';
      case 'fair':
        return '보통';
      case 'good':
        return '좋음';
      case 'strong':
        return '강함';
      default:
        return '';
    }
  };
  
  // 강도 진행률 계산 (0-100)
  const getStrengthProgress = (strength: PasswordStrength) => {
    switch (strength) {
      case 'weak':
        return 25;
      case 'fair':
        return 50;
      case 'good':
        return 75;
      case 'strong':
        return 100;
      default:
        return 0;
    }
  };
  
  const currentPassword = value !== undefined ? value.toString() : internalValue;
  const currentRequirements = requirements.length > 0 ? requirements : generateRequirements(currentPassword);
  const currentStrength = strength;
  
  return (
    <div className="space-y-3">
      <Input
        {...props}
        type={showPassword ? 'text' : 'password'}
        value={value !== undefined ? value : internalValue}
        onChange={handleChange}
        validate={validatePasswordInput}
        startIcon={<Shield className="w-4 h-4" />}
        endIcon={
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="text-[var(--linear-color-text-tertiary)] hover:text-[var(--linear-color-text-primary)] transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
        autoComplete="new-password"
        className={className}
      />
      
      {/* 비밀번호 강도 표시기 */}
      {showStrengthIndicator && currentPassword && (
        <div className="space-y-2">
          {/* 진행률 바 */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-[var(--linear-color-border-default)] rounded-full overflow-hidden">
              <div 
                className={cn(
                  'h-full transition-all duration-300 ease-out',
                  getStrengthBgColor(currentStrength)
                )}
                style={{ width: `${getStrengthProgress(currentStrength)}%` }}
              />
            </div>
            <span className={cn(
              'text-xs font-[var(--linear-font-weight-medium)]',
              getStrengthColor(currentStrength)
            )}>
              {getStrengthText(currentStrength)}
            </span>
          </div>
        </div>
      )}
      
      {/* 요구사항 체크리스트 */}
      {showRequirements && currentPassword && (
        <div className="space-y-1">
          {currentRequirements.map((requirement, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 text-xs"
            >
              {requirement.met ? (
                <Check className="w-3 h-3 text-[var(--linear-color-success)] flex-shrink-0" />
              ) : (
                <X className="w-3 h-3 text-[var(--linear-color-text-tertiary)] flex-shrink-0" />
              )}
              <span className={cn(
                requirement.met 
                  ? 'text-[var(--linear-color-text-secondary)]' 
                  : 'text-[var(--linear-color-text-tertiary)]'
              )}>
                {requirement.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * PasswordConfirmInput - 비밀번호 확인 컴포넌트
 */
export interface PasswordConfirmInputProps extends Omit<PasswordInputProps, 'showStrengthIndicator' | 'showRequirements' | 'onStrengthChange'> {
  /** 원본 비밀번호 */
  originalPassword: string;
}

export const PasswordConfirmInput: React.FC<PasswordConfirmInputProps> = ({
  originalPassword,
  ...props
}) => {
  return (
    <PasswordInput
      {...props}
      confirmValue={originalPassword}
      showStrengthIndicator={false}
      showRequirements={false}
      placeholder="비밀번호를 다시 입력하세요"
    />
  );
};

export default PasswordInput;