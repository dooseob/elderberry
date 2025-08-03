/**
 * PhoneInput - 전화번호 전용 입력 컴포넌트
 * 폼 전문가가 설계한 한국 전화번호 형식 자동 포맷팅 포함
 * 
 * @version 2025.1.0
 * @author 폼 전문가 (Linear Theme System)
 * 
 * Features:
 * - 한국 전화번호 자동 포맷팅 (010-1234-5678)
 * - 실시간 유효성 검사
 * - 인증번호 발송 기능
 * - Linear 테마 완전 적용
 * - 접근성 최적화
 * - 통신사별 번호 패턴 인식
 */
import React from 'react';
import { Phone, Send, Check, Loader2 } from 'lucide-react';
import { Input, validatePhoneNumber, type InputProps } from '../../shared/ui/Input';
import { Button } from '../../shared/ui/Button';
import { cn } from '../../lib/utils';

/**
 * 한국 휴대폰 번호 패턴
 */
const MOBILE_PATTERNS = {
  SKT: /^010-[2-9]\d{3}-\d{4}$/,
  KT: /^010-[0-1]\d{3}-\d{4}$/,
  LG: /^010-(3|6|7|8|9)\d{3}-\d{4}$/,
  GENERAL: /^010-\d{4}-\d{4}$/,
};

/**
 * PhoneInput Props
 */
export interface PhoneInputProps extends Omit<InputProps, 'type' | 'validate' | 'startIcon'> {
  /** 자동 포맷팅 활성화 */
  enableAutoFormat?: boolean;
  
  /** 인증번호 발송 버튼 표시 */
  showVerificationButton?: boolean;
  
  /** 인증번호 발송 함수 */
  onSendVerification?: (phoneNumber: string) => Promise<void>;
  
  /** 인증번호 발송 중 상태 */
  isSendingVerification?: boolean;
  
  /** 인증번호 발송 완료 상태 */
  verificationSent?: boolean;
  
  /** 인증번호 재발송 대기시간 (초) */
  resendCooldown?: number;
  
  /** 통신사 정보 표시 */
  showCarrier?: boolean;
  
  /** 추가 유효성 검사 */
  additionalValidation?: (phone: string) => string | null;
}

/**
 * PhoneInput Component
 * 전화번호 전용 입력 필드
 */
export const PhoneInput: React.FC<PhoneInputProps> = ({
  enableAutoFormat = true,
  showVerificationButton = false,
  onSendVerification,
  isSendingVerification = false,
  verificationSent = false,
  resendCooldown = 60,
  showCarrier = false,
  additionalValidation,
  value,
  onChange,
  className,
  ...props
}) => {
  // 상태 관리
  const [internalValue, setInternalValue] = React.useState(value || '');
  const [carrier, setCarrier] = React.useState<string | null>(null);
  const [cooldownTimer, setCooldownTimer] = React.useState(0);
  
  // 참조
  const timerRef = React.useRef<NodeJS.Timeout>();
  
  // 전화번호 포맷팅
  const formatPhoneNumber = React.useCallback((phone: string): string => {
    if (!enableAutoFormat) return phone;
    
    // 숫자만 추출
    const numbers = phone.replace(/\D/g, '');
    
    // 길이에 따른 포맷팅
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else if (numbers.length <= 11) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    } else {
      // 11자리 초과 시 자르기
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  }, [enableAutoFormat]);
  
  // 통신사 식별
  const identifyCarrier = React.useCallback((phone: string): string | null => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 11) return null;
    
    const formatted = formatPhoneNumber(cleanPhone);
    
    if (MOBILE_PATTERNS.SKT.test(formatted)) return 'SKT';
    if (MOBILE_PATTERNS.KT.test(formatted)) return 'KT';
    if (MOBILE_PATTERNS.LG.test(formatted)) return 'LG U+';
    if (MOBILE_PATTERNS.GENERAL.test(formatted)) return '알 수 없음';
    
    return null;
  }, [formatPhoneNumber]);
  
  // 통합 유효성 검사
  const validatePhoneInput = React.useCallback((phone: string): string | null => {
    if (!phone) return null;
    
    // 기본 전화번호 검증
    const basicValidation = validatePhoneNumber(phone);
    if (basicValidation) return basicValidation;
    
    // 추가 검증
    if (additionalValidation) {
      const additionalResult = additionalValidation(phone);
      if (additionalResult) return additionalResult;
    }
    
    return null;
  }, [additionalValidation]);
  
  // 입력값 변경 처리
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatPhoneNumber(rawValue);
    const newCarrier = identifyCarrier(formattedValue);
    
    setInternalValue(formattedValue);
    setCarrier(newCarrier);
    
    // 실제 이벤트 객체의 값도 포맷된 값으로 변경
    const syntheticEvent = {
      ...e,
      target: { ...e.target, value: formattedValue },
    };
    
    onChange?.(syntheticEvent);
  };
  
  // 인증번호 발송 처리
  const handleSendVerification = async () => {
    if (!onSendVerification || isSendingVerification || cooldownTimer > 0) return;
    
    const currentPhone = value !== undefined ? value.toString() : internalValue;
    
    // 유효성 검사
    const validationError = validatePhoneInput(currentPhone);
    if (validationError) {
      console.error('전화번호 유효성 검사 실패:', validationError);
      return;
    }
    
    try {
      await onSendVerification(currentPhone);
      
      // 쿨다운 타이머 시작
      setCooldownTimer(resendCooldown);
      
      const startTimer = () => {
        timerRef.current = setInterval(() => {
          setCooldownTimer(prev => {
            if (prev <= 1) {
              if (timerRef.current) {
                clearInterval(timerRef.current);
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      };
      
      startTimer();
      
    } catch (error) {
      console.error('인증번호 발송 실패:', error);
    }
  };
  
  // 쿨다운 타이머 포맷
  const formatCooldown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // 정리
  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  const currentPhone = value !== undefined ? value.toString() : internalValue;
  const isValidPhone = !validatePhoneInput(currentPhone) && currentPhone.length >= 13;
  
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          {...props}
          type="tel"
          value={value !== undefined ? value : internalValue}
          onChange={handleChange}
          validate={validatePhoneInput}
          startIcon={<Phone className="w-4 h-4" />}
          autoComplete="tel"
          placeholder="010-1234-5678"
          maxLength={13}
          className={cn(
            showVerificationButton && 'flex-1',
            className
          )}
        />
        
        {/* 인증번호 발송 버튼 */}
        {showVerificationButton && (
          <Button
            type="button"
            variant={verificationSent ? "success" : "secondary"}
            size="default"
            onClick={handleSendVerification}
            disabled={!isValidPhone || isSendingVerification || cooldownTimer > 0}
            className="min-w-[100px] flex-shrink-0"
            aria-label="인증번호 발송"
          >
            {isSendingVerification ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="ml-2">발송중</span>
              </>
            ) : verificationSent && cooldownTimer === 0 ? (
              <>
                <Send className="w-4 h-4" />
                <span className="ml-2">재발송</span>
              </>
            ) : cooldownTimer > 0 ? (
              <span className="text-sm font-mono">
                {formatCooldown(cooldownTimer)}
              </span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span className="ml-2">인증</span>
              </>
            )}
          </Button>
        )}
      </div>
      
      {/* 통신사 정보 및 상태 표시 */}
      {(showCarrier || verificationSent) && currentPhone && (
        <div className="flex items-center justify-between text-xs text-[var(--linear-color-text-secondary)]">
          {/* 통신사 정보 */}
          {showCarrier && carrier && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {carrier}
            </span>
          )}
          
          {/* 인증 상태 */}
          {verificationSent && (
            <span className="flex items-center gap-1 text-[var(--linear-color-success)]">
              <Check className="w-3 h-3" />
              인증번호가 발송되었습니다
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default PhoneInput;