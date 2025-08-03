/**
 * EmailInput - 이메일 전용 입력 컴포넌트
 * 폼 전문가가 설계한 이메일 유효성 검사 포함 입력 필드
 * 
 * @version 2025.1.0
 * @author 폼 전문가 (Linear Theme System)
 * 
 * Features:
 * - 실시간 이메일 유효성 검사
 * - Linear 테마 완전 적용
 * - 자동 완성 지원
 * - 도메인 제안 기능
 * - 접근성 최적화
 * - 에러 상태 관리
 */
import React from 'react';
import { Mail, Check, AlertCircle } from 'lucide-react';
import { Input, validateEmail, type InputProps } from '../../shared/ui/Input';
import { cn } from '../../lib/utils';

// 한국 주요 이메일 도메인
const COMMON_DOMAINS = [
  'gmail.com',
  'naver.com',
  'daum.net',
  'kakao.com',
  'nate.com',
  'hanmail.net',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
];

/**
 * EmailInput Props
 */
export interface EmailInputProps extends Omit<InputProps, 'type' | 'validate' | 'startIcon'> {
  /** 도메인 자동 완성 활성화 */
  enableDomainSuggestion?: boolean;
  
  /** 중복 검사 함수 */
  checkDuplicate?: (email: string) => Promise<boolean>;
  
  /** 중복 검사 디바운스 지연시간 (ms) */
  duplicateCheckDelay?: number;
  
  /** 추가 유효성 검사 규칙 */
  additionalValidation?: (email: string) => string | null;
}

/**
 * EmailInput Component
 * 이메일 전용 입력 필드
 */
export const EmailInput: React.FC<EmailInputProps> = ({
  enableDomainSuggestion = true,
  checkDuplicate,
  duplicateCheckDelay = 500,
  additionalValidation,
  value,
  onChange,
  onBlur,
  className,
  ...props
}) => {
  // 상태 관리
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [isDuplicateChecking, setIsDuplicateChecking] = React.useState(false);
  const [isDuplicate, setIsDuplicate] = React.useState<boolean | null>(null);
  const [internalValue, setInternalValue] = React.useState(value || '');
  
  // 참조
  const inputRef = React.useRef<HTMLInputElement>(null);
  const duplicateCheckTimeoutRef = React.useRef<NodeJS.Timeout>();
  
  // 도메인 제안 생성
  const generateSuggestions = React.useCallback((email: string) => {
    if (!enableDomainSuggestion || !email.includes('@')) {
      return [];
    }
    
    const [localPart, domainPart] = email.split('@');
    if (!localPart || domainPart.length === 0) return [];
    
    return COMMON_DOMAINS
      .filter(domain => domain.startsWith(domainPart.toLowerCase()))
      .slice(0, 5)
      .map(domain => `${localPart}@${domain}`);
  }, [enableDomainSuggestion]);
  
  // 통합 유효성 검사
  const validateEmailInput = React.useCallback((email: string): string | null => {
    // 기본 이메일 형식 검사
    const basicValidation = validateEmail(email);
    if (basicValidation) return basicValidation;
    
    // 추가 검사 규칙
    if (additionalValidation) {
      const additionalResult = additionalValidation(email);
      if (additionalResult) return additionalResult;
    }
    
    // 중복 검사 결과 반영
    if (isDuplicate === true) {
      return '이미 사용 중인 이메일 주소입니다.';
    }
    
    return null;
  }, [additionalValidation, isDuplicate]);
  
  // 중복 검사 실행
  const performDuplicateCheck = React.useCallback(async (email: string) => {
    if (!checkDuplicate || !email || validateEmail(email)) {
      setIsDuplicate(null);
      return;
    }
    
    setIsDuplicateChecking(true);
    
    try {
      const exists = await checkDuplicate(email);
      setIsDuplicate(exists);
    } catch (error) {
      console.error('이메일 중복 검사 실패:', error);
      setIsDuplicate(null);
    } finally {
      setIsDuplicateChecking(false);
    }
  }, [checkDuplicate]);
  
  // 디바운스된 중복 검사
  const debouncedDuplicateCheck = React.useCallback((email: string) => {
    if (duplicateCheckTimeoutRef.current) {
      clearTimeout(duplicateCheckTimeoutRef.current);
    }
    
    duplicateCheckTimeoutRef.current = setTimeout(() => {
      performDuplicateCheck(email);
    }, duplicateCheckDelay);
  }, [performDuplicateCheck, duplicateCheckDelay]);
  
  // 입력값 변경 처리
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    
    // 중복 검사 상태 초기화
    setIsDuplicate(null);
    
    // 도메인 제안 업데이트
    if (enableDomainSuggestion) {
      const newSuggestions = generateSuggestions(newValue);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0 && newValue.includes('@'));
    }
    
    // 중복 검사 시작
    if (checkDuplicate && newValue && !validateEmail(newValue)) {
      debouncedDuplicateCheck(newValue);
    }
    
    onChange?.(e);
  };
  
  // 포커스 해제 처리
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // 제안 목록 숨기기 (약간의 지연으로 클릭 처리 시간 확보)
    setTimeout(() => {
      setShowSuggestions(false);
    }, 150);
    
    onBlur?.(e);
  };
  
  // 제안 선택 처리
  const handleSuggestionClick = (suggestion: string) => {
    setInternalValue(suggestion);
    setShowSuggestions(false);
    
    // 중복 검사 실행
    if (checkDuplicate) {
      debouncedDuplicateCheck(suggestion);
    }
    
    // onChange 이벤트 발생
    if (onChange) {
      const syntheticEvent = {
        target: { value: suggestion },
        currentTarget: { value: suggestion },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
    
    // 포커스 복원
    inputRef.current?.focus();
  };
  
  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        // 첫 번째 제안으로 포커스 이동 (실제 구현에서는 더 정교한 키보드 네비게이션 필요)
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    }
    
    props.onKeyDown?.(e);
  };
  
  // 상태 아이콘 결정
  const getStateIcon = () => {
    if (isDuplicateChecking) {
      return <div className="w-4 h-4 animate-spin rounded-full border-2 border-[var(--linear-color-accent)] border-t-transparent" />;
    }
    if (isDuplicate === false && internalValue && !validateEmail(internalValue)) {
      return <Check className="w-4 h-4 text-[var(--linear-color-success)]" />;
    }
    return <Mail className="w-4 h-4" />;
  };
  
  // 정리
  React.useEffect(() => {
    return () => {
      if (duplicateCheckTimeoutRef.current) {
        clearTimeout(duplicateCheckTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <div className="relative">
      <Input
        {...props}
        ref={inputRef}
        type="email"
        value={value !== undefined ? value : internalValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        validate={validateEmailInput}
        startIcon={getStateIcon()}
        autoComplete="email"
        spellCheck={false}
        className={cn(
          showSuggestions && 'rounded-b-none border-b-transparent',
          className
        )}
      />
      
      {/* 도메인 제안 드롭다운 */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 bg-[var(--linear-color-surface-modal)] border border-[var(--linear-color-border-default)] border-t-0 rounded-b-[var(--linear-radius-medium)] shadow-[var(--linear-shadow-dropdown)] max-h-40 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              className="w-full px-3 py-2 text-left text-sm text-[var(--linear-color-text-primary)] hover:bg-[var(--linear-color-surface-elevated)] focus:bg-[var(--linear-color-surface-elevated)] focus:outline-none transition-colors"
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseDown={(e) => e.preventDefault()} // 블러 이벤트 방지
            >
              <span className="flex items-center gap-2">
                <Mail className="w-3 h-3 text-[var(--linear-color-text-tertiary)]" />
                {suggestion}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmailInput;