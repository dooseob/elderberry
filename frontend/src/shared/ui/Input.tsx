/**
 * Linear Design System Input Component
 * 완전한 Linear 테마 시스템 통합 입력 컴포넌트
 * 
 * @version 2025.1.0
 * @author 폼 전문가 (Linear Theme System)
 * 
 * Features:
 * - Linear 테마 CSS 클래스 완전 적용
 * - 다양한 input 타입 지원 (text, password, email, number 등)
 * - 에러 상태, 성공 상태, 경고 상태 표시
 * - 플레이스홀더, 라벨, 도움말 텍스트
 * - 완전한 접근성 개선 (ARIA 속성, 키보드 네비게이션)
 * - 아이콘 지원 (시작/끝 위치)
 * - useLinearTheme 훅 활용
 * - Forwardref 지원
 * - TypeScript 완전 타입 정의
 * - 애니메이션 및 인터랙션 효과
 * - 비밀번호 가시성 토글
 * - 검색 컴포넌트 지원
 * - 자동 완성 및 유효성 검사
 */
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff, Search, X, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from "../../lib/utils";
import { useLinearTheme } from '../../hooks/useLinearTheme';

// Linear Input Variants (Class Variance Authority 기반)
const inputVariants = cva(
  // 기본 클래스 - Linear 디자인 시스템 준수
  [
    "w-full border rounded-[var(--linear-radius-medium)]",
    "bg-[var(--linear-color-surface-input)] text-[var(--linear-color-text-primary)]",
    "border-[var(--linear-color-border-input)]",
    "transition-all duration-[var(--linear-transition-fast)]",
    "placeholder:text-[var(--linear-color-text-tertiary)]",
    "font-[var(--linear-font-family)] font-[var(--linear-font-weight-normal)]",
    "focus:outline-none focus:border-[var(--linear-color-accent)]",
    "focus:ring-2 focus:ring-[var(--linear-color-accent)] focus:ring-opacity-20",
    "disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-[var(--linear-color-control-default)]",
    "read-only:bg-[var(--linear-color-surface-panel)] read-only:cursor-default",
  ],
  {
    variants: {
      variant: {
        // 기본 입력 필드
        default: [],
        
        // 검색 입력 필드
        search: [
          "pl-10 pr-10",
        ],
        
        // 비밀번호 입력 필드
        password: [
          "pr-10",
        ],
        
        // 텍스트에리어
        textarea: [
          "resize-y min-h-[80px] py-[var(--linear-spacing-sm)]",
        ],
        
        // 숫자 입력
        number: [
          "text-right",
        ],
      },
      
      size: {
        sm: "text-sm py-[var(--linear-spacing-xs)] px-[var(--linear-spacing-sm)] min-h-[36px]",
        default: "text-sm py-[var(--linear-spacing-sm)] px-[var(--linear-spacing-md)] min-h-[44px]",
        lg: "text-base py-[var(--linear-spacing-md)] px-[var(--linear-spacing-lg)] min-h-[52px]",
      },
      
      state: {
        // 기본 상태
        default: [],
        
        // 에러 상태
        error: [
          "border-[var(--linear-color-error)] bg-[var(--linear-color-error-bg)]",
          "focus:border-[var(--linear-color-error)] focus:ring-[var(--linear-color-error)]",
        ],
        
        // 성공 상태
        success: [
          "border-[var(--linear-color-success)] bg-[var(--linear-color-success-bg)]",
          "focus:border-[var(--linear-color-success)] focus:ring-[var(--linear-color-success)]",
        ],
        
        // 경고 상태
        warning: [
          "border-[var(--linear-color-warning)] bg-[var(--linear-color-warning-bg)]",
          "focus:border-[var(--linear-color-warning)] focus:ring-[var(--linear-color-warning)]",
        ],
        
        // 정보 상태
        info: [
          "border-[var(--linear-color-info)] bg-[var(--linear-color-info-bg)]",
          "focus:border-[var(--linear-color-info)] focus:ring-[var(--linear-color-info)]",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      state: "default",
    },
  }
);

/**
 * Linear Input Props
 * 완전한 TypeScript 타입 정의
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  /** 입력 필드 라벨 */
  label?: string;
  
  /** 도움말 텍스트 */
  helperText?: string;
  
  /** 에러 메시지 */
  errorText?: string;
  
  /** 성공 메시지 */
  successText?: string;
  
  /** 경고 메시지 */
  warningText?: string;
  
  /** 정보 메시지 */
  infoText?: string;
  
  /** 시작 아이콘 */
  startIcon?: React.ReactNode;
  
  /** 끝 아이콘 */
  endIcon?: React.ReactNode;
  
  /** 전체 너비 사용 */
  fullWidth?: boolean;
  
  /** 비밀번호 가시성 토글 활성화 */
  showPasswordToggle?: boolean;
  
  /** 검색 필드 취소 버튼 활성화 */
  clearable?: boolean;
  
  /** 유효성 검사 함수 */
  validate?: (value: string) => string | null;
  
  /** 자동 포커스 */
  autoFocus?: boolean;
  
  /** 자동 완성 옵션 */
  autoComplete?: string;
  
  /** 텍스트에리어 모드 */
  multiline?: boolean;
  
  /** 텍스트에리어 행 수 */
  rows?: number;
  
  /** 에러 아이콘 숨기기 */
  hideErrorIcon?: boolean;
  
  /** 성공 아이콘 숨기기 */
  hideSuccessIcon?: boolean;
  
  /** 검색 이벤트 핸들러 (검색 variant용) */
  onSearch?: (value: string) => void;
  
  /** 취소 이벤트 핸들러 */
  onClear?: () => void;
  
  /** 접근성: 입력 필드 설명 */
  'aria-describedby'?: string;
  
  /** 접근성: 에러 상태 */
  'aria-invalid'?: boolean;
  
  /** 접근성: 필수 필드 */
  'aria-required'?: boolean;
  
  /** 테스트ID (data-testid로 변환됨) */
  testId?: string;
}

/**
 * Linear Input Component
 * React.forwardRef 및 완전한 접근성 지원
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type = "text",
    variant,
    size,
    state,
    label,
    helperText,
    errorText,
    successText,
    warningText,
    infoText,
    startIcon,
    endIcon,
    fullWidth = true,
    showPasswordToggle = false,
    clearable = false,
    validate,
    multiline = false,
    rows = 3,
    hideErrorIcon = false,
    hideSuccessIcon = false,
    onSearch,
    onClear,
    value,
    onChange,
    onBlur,
    onFocus,
    disabled,
    readOnly,
    required,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    'aria-required': ariaRequired,
    testId,
    ...props
  }, ref) => {
    // Linear 테마 훅 사용
    const { isReducedMotion } = useLinearTheme();
    
    // 내부 상태
    const [isFocused, setIsFocused] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(value || '');
    const [validationMessage, setValidationMessage] = React.useState<string | null>(null);
    
    // ID 생성
    const inputId = React.useId();
    const helperTextId = React.useId();
    const errorTextId = React.useId();
    const successTextId = React.useId();
    const warningTextId = React.useId();
    const infoTextId = React.useId();
    
    // 상태 계산
    const finalState = React.useMemo(() => {
      if (errorText || validationMessage) return 'error';
      if (successText) return 'success';
      if (warningText) return 'warning';
      if (infoText) return 'info';
      return state || 'default';
    }, [errorText, successText, warningText, infoText, validationMessage, state]);
    
    // variant 자동 설정
    const finalVariant = React.useMemo(() => {
      if (variant) return variant;
      if (type === 'password' || showPasswordToggle) return 'password';
      if (type === 'search' || onSearch) return 'search';
      if (multiline) return 'textarea';
      if (type === 'number') return 'number';
      return 'default';
    }, [variant, type, showPasswordToggle, onSearch, multiline]);
    
    // 입력 타입 계산
    const inputType = React.useMemo(() => {
      if (type === 'password' && showPassword) return 'text';
      return type;
    }, [type, showPassword]);
    
    // 접근성을 위한 describedBy 설정
    const describedBy = React.useMemo(() => {
      const ids = [
        ariaDescribedBy,
        helperText && helperTextId,
        errorText && errorTextId,
        validationMessage && errorTextId,
        successText && successTextId,
        warningText && warningTextId,
        infoText && infoTextId,
      ].filter(Boolean);
      return ids.length > 0 ? ids.join(' ') : undefined;
    }, [
      ariaDescribedBy, helperText, errorText, successText, warningText, infoText,
      validationMessage, helperTextId, errorTextId, successTextId, warningTextId, infoTextId
    ]);
    
    // 유효성 검사
    const handleValidation = React.useCallback((val: string) => {
      if (!validate) return;
      const message = validate(val);
      setValidationMessage(message);
    }, [validate]);
    
    // 비밀번호 가시성 토글
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };
    
    // 취소 버튼 클릭
    const handleClear = () => {
      setInternalValue('');
      setValidationMessage(null);
      onClear?.();
      if (onChange) {
        const syntheticEvent = {
          target: { value: '' },
          currentTarget: { value: '' },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };
    
    // 검색 수행
    const handleSearch = () => {
      const searchValue = typeof value === 'string' ? value : internalValue;
      onSearch?.(searchValue.toString());
    };
    
    // 이벤트 핸들러들
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      handleValidation(newValue);
      onChange?.(e);
    };
    
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      handleValidation(e.target.value);
      onBlur?.(e);
    };
    
    // 키보드 이벤트 핸들링
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && finalVariant === 'search') {
        e.preventDefault();
        handleSearch();
      }
      props.onKeyDown?.(e);
    };
    
    // 상태 아이콘 렌더링
    const renderStateIcon = () => {
      if (finalState === 'error' && !hideErrorIcon) {
        return <AlertCircle className="w-4 h-4 text-[var(--linear-color-error)]" />;
      }
      if (finalState === 'success' && !hideSuccessIcon) {
        return <CheckCircle className="w-4 h-4 text-[var(--linear-color-success)]" />;
      }
      if (finalState === 'warning') {
        return <AlertTriangle className="w-4 h-4 text-[var(--linear-color-warning)]" />;
      }
      return null;
    };
    
    // 시작 아이콘 렌더링
    const renderStartIcon = () => {
      if (finalVariant === 'search') {
        return (
          <button
            type="button"
            onClick={handleSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--linear-color-text-tertiary)] hover:text-[var(--linear-color-text-primary)] transition-colors"
            tabIndex={-1}
            aria-label="검색"
          >
            <Search className="w-4 h-4" />
          </button>
        );
      }
      if (startIcon) {
        return (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--linear-color-text-tertiary)] pointer-events-none">
            {startIcon}
          </div>
        );
      }
      return null;
    };
    
    // 끝 아이콘 렌더링
    const renderEndIcon = () => {
      const icons = [];
      
      // 취소 버튼
      if (clearable && internalValue && !disabled && !readOnly) {
        icons.push(
          <button
            key="clear"
            type="button"
            onClick={handleClear}
            className="text-[var(--linear-color-text-tertiary)] hover:text-[var(--linear-color-text-primary)] transition-colors"
            tabIndex={-1}
            aria-label="지우다"
          >
            <X className="w-4 h-4" />
          </button>
        );
      }
      
      // 비밀번호 가시성 토글
      if (showPasswordToggle && (type === 'password' || finalVariant === 'password')) {
        icons.push(
          <button
            key="password-toggle"
            type="button"
            onClick={togglePasswordVisibility}
            className="text-[var(--linear-color-text-tertiary)] hover:text-[var(--linear-color-text-primary)] transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        );
      }
      
      // 상태 아이콘
      const stateIcon = renderStateIcon();
      if (stateIcon) {
        icons.push(
          <div key="state" className="pointer-events-none">
            {stateIcon}
          </div>
        );
      }
      
      // 커스텀 끝 아이콘
      if (endIcon && !stateIcon) {
        icons.push(
          <div key="custom" className="text-[var(--linear-color-text-tertiary)] pointer-events-none">
            {endIcon}
          </div>
        );
      }
      
      if (icons.length === 0) return null;
      
      return (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {icons}
        </div>
      );
    };
    
    // 컴포넌트 렌더링
    const InputComponent = multiline ? 'textarea' : 'input';
    
    return (
      <div className={cn("linear-input-group", fullWidth && "w-full", !isReducedMotion && "linear-animate-in")}>
        {/* 라벨 */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-[var(--linear-font-weight-medium)] text-[var(--linear-color-text-primary)] mb-[var(--linear-spacing-xs)]"
          >
            {label}
            {(required || ariaRequired) && (
              <span className="text-[var(--linear-color-error)] ml-1" aria-label="필수">
                *
              </span>
            )}
          </label>
        )}

        {/* 입력 필드 컨테이너 */}
        <div className="relative">
          {renderStartIcon()}

          {/* 입력 필드 */}
          <InputComponent
            {...(multiline ? {} : { type: inputType })}
            id={inputId}
            className={cn(
              inputVariants({ variant: finalVariant, size, state: finalState }),
              (startIcon || finalVariant === 'search') && "pl-10",
              (endIcon || showPasswordToggle || clearable || finalState !== 'default') && "pr-10",
              isFocused && "ring-2 ring-[var(--linear-color-accent)] ring-opacity-20",
              className
            )}
            ref={ref as any}
            value={value !== undefined ? value : internalValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            aria-describedby={describedBy}
            aria-invalid={ariaInvalid !== undefined ? ariaInvalid : (!!errorText || !!validationMessage)}
            aria-required={ariaRequired !== undefined ? ariaRequired : required}
            data-testid={testId}
            {...(multiline ? { rows } : {})}
            {...props}
          />

          {renderEndIcon()}
        </div>

        {/* 도움말 텍스트 */}
        {helperText && finalState === 'default' && (
          <p
            id={helperTextId}
            className="mt-[var(--linear-spacing-xs)] text-sm text-[var(--linear-color-text-secondary)]"
          >
            {helperText}
          </p>
        )}

        {/* 에러 텍스트 */}
        {(errorText || validationMessage) && (
          <p
            id={errorTextId}
            className="mt-[var(--linear-spacing-xs)] text-sm text-[var(--linear-color-error)] flex items-center gap-1"
            role="alert"
          >
            {!hideErrorIcon && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            {errorText || validationMessage}
          </p>
        )}
        
        {/* 성공 텍스트 */}
        {successText && finalState === 'success' && (
          <p
            id={successTextId}
            className="mt-[var(--linear-spacing-xs)] text-sm text-[var(--linear-color-success)] flex items-center gap-1"
          >
            {!hideSuccessIcon && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
            {successText}
          </p>
        )}
        
        {/* 경고 텍스트 */}
        {warningText && finalState === 'warning' && (
          <p
            id={warningTextId}
            className="mt-[var(--linear-spacing-xs)] text-sm text-[var(--linear-color-warning)] flex items-center gap-1"
          >
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {warningText}
          </p>
        )}
        
        {/* 정보 텍스트 */}
        {infoText && finalState === 'info' && (
          <p
            id={infoTextId}
            className="mt-[var(--linear-spacing-xs)] text-sm text-[var(--linear-color-info)] flex items-center gap-1"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {infoText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "LinearInput";

// === 유틸리티 함수들 ===

/**
 * 이메일 유효성 검사
 */
export const validateEmail = (email: string): string | null => {
  if (!email) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? null : '유효한 이메일 주소를 입력해주세요.';
};

/**
 * 비밀번호 강도 검사
 */
export const validatePassword = (password: string): string | null => {
  if (!password) return null;
  if (password.length < 8) return '비밀번호는 8자 이상이어야 합니다.';
  if (!/(?=.*[a-z])/.test(password)) return '비밀번호에 소문자가 포함되어야 합니다.';
  if (!/(?=.*[A-Z])/.test(password)) return '비밀번호에 대문자가 포함되어야 합니다.';
  if (!/(?=.*\d)/.test(password)) return '비밀번호에 숫자가 포함되어야 합니다.';
  return null;
};

/**
 * 전화번호 유효성 검사 (한국 전화번호)
 */
export const validatePhoneNumber = (phone: string): string | null => {
  if (!phone) return null;
  const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
  return phoneRegex.test(phone.replace(/\s/g, '')) ? null : '유효한 전화번호를 입력해주세요.';
};

/**
 * 숫자 범위 검사
 */
export const validateNumberRange = (min?: number, max?: number) => {
  return (value: string): string | null => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num)) return '숫자만 입력 가능합니다.';
    if (min !== undefined && num < min) return `${min} 이상의 값을 입력해주세요.`;
    if (max !== undefined && num > max) return `${max} 이하의 값을 입력해주세요.`;
    return null;
  };
};

/**
 * 문자열 길이 검사
 */
export const validateLength = (min?: number, max?: number) => {
  return (value: string): string | null => {
    if (!value) return null;
    if (min !== undefined && value.length < min) return `최소 ${min}자 이상 입력해주세요.`;
    if (max !== undefined && value.length > max) return `최대 ${max}자까지 입력 가능합니다.`;
    return null;
  };
};

/**
 * 필수 필드 검사
 */
export const validateRequired = (value: string): string | null => {
  return value.trim() ? null : '필수 필드입니다.';
};

/**
 * 여러 검증 함수 조합
 */
export const combineValidators = (...validators: Array<(value: string) => string | null>) => {
  return (value: string): string | null => {
    for (const validator of validators) {
      const result = validator(value);
      if (result) return result;
    }
    return null;
  };
};

/**
 * 입력 필드 접근성 검증
 */
export const validateInputAccessibility = (props: InputProps) => {
  const warnings: string[] = [];
  
  if (!props.label && !props['aria-label']) {
    warnings.push('입력 필드에 label 또는 aria-label이 필요합니다.');
  }
  
  if (props.required && !props['aria-required']) {
    warnings.push('필수 필드에는 aria-required="true"를 설정하는 것이 좋습니다.');
  }
  
  if (props.errorText && !props['aria-invalid']) {
    warnings.push('에러 상태의 필드에는 aria-invalid="true"를 설정하는 것이 좋습니다.');
  }
  
  return warnings;
};

// === 텍스트에리어 컴포넌트 ===

/**
 * Linear Textarea Component
 * Input 컴포넌트의 텍스트에리어 버전
 */
export interface TextareaProps extends Omit<InputProps, 'type' | 'multiline'> {
  /** 텍스트에리어 행 수 */
  rows?: number;
  /** 최대 행 수 */
  maxRows?: number;
  /** 자동 크기 조정 */
  autoResize?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ rows = 3, ...props }, ref) => {
    return (
      <Input
        {...props}
        ref={ref as any}
        multiline
        rows={rows}
        variant="textarea"
      />
    );
  }
);

Textarea.displayName = "LinearTextarea";

// === 내보내기 ===
export { Input, inputVariants, Textarea };
export type { InputProps, TextareaProps };
export default Input;

// === JSDoc 사용 예시 (Storybook 준비) ===
/**
 * @example
 * // 기본 사용법
 * <Input label="이름" placeholder="이름을 입력하세요" />
 * 
 * // 비밀번호 입력
 * <Input 
 *   type="password" 
 *   label="비밀번호"
 *   showPasswordToggle
 *   validate={validatePassword}
 * />
 * 
 * // 검색 입력
 * <Input 
 *   variant="search"
 *   placeholder="검색어를 입력하세요"
 *   clearable
 *   onSearch={(value) => console.log('검색:', value)}
 * />
 * 
 * // 에러 상태
 * <Input 
 *   label="이메일"
 *   type="email"
 *   errorText="유효한 이메일 주소를 입력해주세요"
 *   validate={validateEmail}
 * />
 * 
 * // 텍스트에리어
 * <Textarea 
 *   label="메모"
 *   rows={5}
 *   placeholder="내용을 입력하세요"
 * />
 */