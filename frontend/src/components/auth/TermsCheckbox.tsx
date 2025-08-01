/**
 * TermsCheckbox - 약관 동의 체크박스 컴포넌트
 * 폼 전문가가 설계한 이용약관/개인정보처리방침 동의 체크박스
 * 
 * @version 2025.1.0
 * @author 폼 전문가 (Linear Theme System)
 * 
 * Features:
 * - 개별/전체 약관 동의 관리
 * - 약관 내용 모달 연동
 * - Linear 테마 완전 적용
 * - 접근성 최적화
 * - 필수/선택 약관 구분
 * - 키보드 네비게이션 지원
 */
import React from 'react';
import { Check, ExternalLink, FileText, Shield, Users } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * 약관 타입
 */
export interface TermsItem {
  /** 약관 ID */
  id: string;
  
  /** 약관 제목 */
  title: string;
  
  /** 약관 설명 */
  description?: string;
  
  /** 필수 약관 여부 */
  required: boolean;
  
  /** 약관 링크 */
  link?: string;
  
  /** 약관 내용 (모달용) */
  content?: string;
  
  /** 아이콘 */
  icon?: React.ReactNode;
}

/**
 * TermsCheckbox Props
 */
export interface TermsCheckboxProps {
  /** 약관 목록 */
  terms: TermsItem[];
  
  /** 동의 상태 */
  values: Record<string, boolean>;
  
  /** 동의 상태 변경 콜백 */
  onChange: (values: Record<string, boolean>) => void;
  
  /** 에러 메시지 */
  error?: string;
  
  /** 전체 동의 체크박스 표시 */
  showSelectAll?: boolean;
  
  /** 약관 내용 모달 열기 콜백 */
  onOpenTerms?: (termId: string) => void;
  
  /** 컴팩트 모드 */
  compact?: boolean;
  
  /** 커스텀 클래스 */
  className?: string;
  
  /** 테스트 ID */
  testId?: string;
}

/**
 * 체크박스 스타일
 */
const checkboxVariants = {
  base: [
    'w-5 h-5 rounded-[var(--linear-radius-small)]',
    'border-2 border-[var(--linear-color-border-default)]',
    'bg-[var(--linear-color-surface-input)]',
    'transition-all duration-[var(--linear-transition-fast)]',
    'flex items-center justify-center cursor-pointer',
    'focus:outline-none focus:ring-2 focus:ring-[var(--linear-color-accent)] focus:ring-opacity-20',
    'hover:border-[var(--linear-color-accent)]',
  ],
  checked: [
    'bg-[var(--linear-color-accent)] border-[var(--linear-color-accent)]',
    'text-[var(--linear-color-text-on-accent)]',
  ],
  disabled: [
    'opacity-50 cursor-not-allowed',
  ],
};

/**
 * 커스텀 체크박스 컴포넌트
 */
const CustomCheckbox: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id: string;
  'aria-label'?: string;
}> = ({ checked, onChange, disabled = false, id, 'aria-label': ariaLabel }) => {
  return (
    <div
      role="checkbox"
      tabIndex={disabled ? -1 : 0}
      aria-checked={checked}
      aria-label={ariaLabel}
      id={id}
      className={cn(
        checkboxVariants.base,
        checked && checkboxVariants.checked,
        disabled && checkboxVariants.disabled
      )}
      onClick={() => !disabled && onChange(!checked)}
      onKeyDown={(e) => {
        if (!disabled && (e.key === ' ' || e.key === 'Enter')) {
          e.preventDefault();
          onChange(!checked);
        }
      }}
    >
      {checked && <Check className="w-3 h-3" strokeWidth={3} />}
    </div>
  );
};

/**
 * TermsCheckbox Component
 * 약관 동의 체크박스
 */
export const TermsCheckbox: React.FC<TermsCheckboxProps> = ({
  terms,
  values,
  onChange,
  error,
  showSelectAll = true,
  onOpenTerms,
  compact = false,
  className,
  testId = 'terms-checkbox',
}) => {
  // 전체 동의 상태 계산
  const allRequired = React.useMemo(() => {
    return terms.filter(term => term.required);
  }, [terms]);
  
  const allOptional = React.useMemo(() => {
    return terms.filter(term => !term.required);
  }, [terms]);
  
  const allRequiredChecked = React.useMemo(() => {
    return allRequired.every(term => values[term.id] === true);
  }, [allRequired, values]);
  
  const allOptionalChecked = React.useMemo(() => {
    return allOptional.every(term => values[term.id] === true);
  }, [allOptional, values]);
  
  const allChecked = React.useMemo(() => {
    return allRequiredChecked && allOptionalChecked;
  }, [allRequiredChecked, allOptionalChecked]);
  
  const someChecked = React.useMemo(() => {
    return Object.values(values).some(Boolean);
  }, [values]);
  
  // 전체 동의 토글
  const handleSelectAll = (checked: boolean) => {
    const newValues = { ...values };
    terms.forEach(term => {
      newValues[term.id] = checked;
    });
    onChange(newValues);
  };
  
  // 개별 약관 토글
  const handleTermToggle = (termId: string, checked: boolean) => {
    onChange({
      ...values,
      [termId]: checked,
    });
  };
  
  // 약관 링크 열기
  const handleOpenTerms = (term: TermsItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onOpenTerms) {
      onOpenTerms(term.id);
    } else if (term.link) {
      window.open(term.link, '_blank', 'noopener,noreferrer');
    }
  };
  
  // 기본 아이콘 반환
  const getDefaultIcon = (term: TermsItem) => {
    if (term.icon) return term.icon;
    
    if (term.title.includes('이용약관') || term.title.includes('서비스')) {
      return <FileText className="w-4 h-4" />;
    }
    if (term.title.includes('개인정보') || term.title.includes('프라이버시')) {
      return <Shield className="w-4 h-4" />;
    }
    if (term.title.includes('마케팅') || term.title.includes('광고')) {
      return <Users className="w-4 h-4" />;
    }
    
    return <FileText className="w-4 h-4" />;
  };
  
  return (
    <div className={cn('space-y-4', className)} data-testid={testId}>
      {/* 전체 동의 */}
      {showSelectAll && (
        <div className={cn(
          'p-4 rounded-[var(--linear-radius-medium)]',
          'bg-[var(--linear-color-surface-elevated)] border border-[var(--linear-color-border-subtle)]'
        )}>
          <label className="flex items-center gap-3 cursor-pointer">
            <CustomCheckbox
              id="select-all-terms"
              checked={allChecked}
              onChange={handleSelectAll}
              aria-label="모든 약관에 동의"
            />
            <div className="flex-1">
              <span className="text-sm font-[var(--linear-font-weight-medium)] text-[var(--linear-color-text-primary)]">
                모든 약관에 동의합니다
              </span>
              {!compact && (
                <p className="text-xs text-[var(--linear-color-text-secondary)] mt-1">
                  선택 항목을 포함하여 모든 약관에 동의합니다
                </p>
              )}
            </div>
          </label>
        </div>
      )}
      
      {/* 개별 약관 목록 */}
      <div className="space-y-3">
        {terms.map((term) => (
          <div key={term.id} className={cn(
            compact ? 'py-2' : 'p-3',
            'rounded-[var(--linear-radius-medium)]',
            'border border-[var(--linear-color-border-subtle)]',
            'hover:bg-[var(--linear-color-surface-elevated)] transition-colors'
          )}>
            <label className="flex items-start gap-3 cursor-pointer">
              <CustomCheckbox
                id={`term-${term.id}`}
                checked={values[term.id] || false}
                onChange={(checked) => handleTermToggle(term.id, checked)}
                aria-label={`${term.title} 동의`}
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {/* 아이콘 */}
                  <div className="text-[var(--linear-color-text-tertiary)] flex-shrink-0">
                    {getDefaultIcon(term)}
                  </div>
                  
                  {/* 제목 */}
                  <span className={cn(
                    'text-sm font-[var(--linear-font-weight-medium)] text-[var(--linear-color-text-primary)]',
                    'flex items-center gap-1'
                  )}>
                    {term.title}
                    {term.required && (
                      <span className="text-[var(--linear-color-error)] text-xs" aria-label="필수">
                        *
                      </span>
                    )}
                  </span>
                  
                  {/* 링크 버튼 */}
                  {(term.link || onOpenTerms) && (
                    <button
                      type="button"
                      onClick={(e) => handleOpenTerms(term, e)}
                      className="text-[var(--linear-color-text-tertiary)] hover:text-[var(--linear-color-accent)] transition-colors ml-auto"
                      aria-label={`${term.title} 내용 보기`}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
                
                {/* 설명 */}
                {!compact && term.description && (
                  <p className="text-xs text-[var(--linear-color-text-secondary)] leading-relaxed">
                    {term.description}
                  </p>
                )}
              </div>
            </label>
          </div>
        ))}
      </div>
      
      {/* 에러 메시지 */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-[var(--linear-color-error)]" role="alert">
          <ExternalLink className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
      
      {/* 필수 약관 안내 */}
      {!compact && allRequired.length > 0 && (
        <p className="text-xs text-[var(--linear-color-text-tertiary)] text-center">
          * 표시된 항목은 서비스 이용을 위한 필수 동의 사항입니다
        </p>
      )}
    </div>
  );
};

// === 기본 약관 데이터 ===

/**
 * 기본 약관 목록 (엘더베리 서비스용)
 */
export const DEFAULT_TERMS: TermsItem[] = [
  {
    id: 'service',
    title: '엘더베리 서비스 이용약관',
    description: '엘더베리 플랫폼 서비스 이용에 대한 기본 약관입니다.',
    required: true,
    link: '/terms/service',
    icon: <FileText className="w-4 h-4" />,
  },
  {
    id: 'privacy',
    title: '개인정보 수집 및 이용 동의',
    description: '서비스 제공을 위한 개인정보 처리에 대한 동의입니다.',
    required: true,
    link: '/terms/privacy',
    icon: <Shield className="w-4 h-4" />,
  },
  {
    id: 'location',
    title: '위치정보 서비스 이용 동의',
    description: '매칭 서비스 향상을 위한 위치정보 수집에 대한 동의입니다.',
    required: false,
    link: '/terms/location',
    icon: <Users className="w-4 h-4" />,
  },
  {
    id: 'marketing',
    title: '마케팅 정보 수신 동의',
    description: '서비스 소식 및 이벤트 정보 수신에 대한 동의입니다.',
    required: false,
    link: '/terms/marketing',
    icon: <Users className="w-4 h-4" />,
  },
];

/**
 * 약관 동의 유효성 검사
 */
export const validateTermsAgreement = (
  values: Record<string, boolean>,
  terms: TermsItem[]
): string | null => {
  const requiredTerms = terms.filter(term => term.required);
  const missingRequired = requiredTerms.filter(term => !values[term.id]);
  
  if (missingRequired.length > 0) {
    const missingTitles = missingRequired.map(term => term.title).join(', ');
    return `다음 필수 약관에 동의해주세요: ${missingTitles}`;
  }
  
  return null;
};

export default TermsCheckbox;