/**
 * 프로필 유효성 검증 모듈
 * 국내/해외 프로필 검증, 보안 점검, 검색 필터 검증 등
 */

import {
  Profile,
  ProfileResponse,
  DomesticProfile,
  OverseasProfile,
  ProfileValidationResult,
  DocumentValidityStatus,
  isDomesticProfile,
  isOverseasProfile,
  isDomesticProfileResponse,
  isOverseasProfileResponse
} from '../../../types/profile';

// ===== 나이 계산 함수 =====

export const calculateAge = (birthDate: string): number | null => {
  if (!birthDate) return null;
  
  const birth = new Date(birthDate);
  const today = new Date();
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// ===== 문서 유효성 검증 =====

export const validateDocuments = (profile: OverseasProfile): DocumentValidityStatus => {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const passport = {
    isValid: false,
    expiryDate: profile.passportExpiryDate,
    isExpiringSoon: false,
    daysUntilExpiry: undefined as number | undefined
  };
  
  const visa = {
    isValid: true, // 비자는 선택사항이므로 기본값 true
    expiryDate: profile.visaExpiryDate,
    isExpiringSoon: false,
    daysUntilExpiry: undefined as number | undefined
  };
  
  // 여권 유효성 검증
  if (profile.passportExpiryDate) {
    const expiryDate = new Date(profile.passportExpiryDate);
    passport.isValid = expiryDate > now;
    passport.isExpiringSoon = expiryDate <= thirtyDaysFromNow;
    passport.daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  }
  
  // 비자 유효성 검증
  if (profile.visaExpiryDate) {
    const expiryDate = new Date(profile.visaExpiryDate);
    visa.isValid = expiryDate > now;
    visa.isExpiringSoon = expiryDate <= thirtyDaysFromNow;
    visa.daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  }
  
  const warnings: string[] = [];
  if (passport.isExpiringSoon) {
    warnings.push('여권이 30일 이내에 만료됩니다.');
  }
  if (visa.isExpiringSoon) {
    warnings.push('비자가 30일 이내에 만료됩니다.');
  }
  
  return {
    passport,
    visa,
    overall: {
      hasValidDocuments: passport.isValid && visa.isValid,
      hasExpiringDocuments: passport.isExpiringSoon || visa.isExpiringSoon,
      warnings
    }
  };
};

// ===== 프로필 유효성 검증 =====

export const validateDomesticProfile = (profile: Partial<DomesticProfile>): ProfileValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingFields: string[] = [];
  
  // 필수 필드 검증
  if (!profile.birthDate) missingFields.push('생년월일');
  if (!profile.gender) missingFields.push('성별');
  if (!profile.address) missingFields.push('주소');
  
  // 비상연락처 검증
  if (!profile.emergencyContactName) missingFields.push('비상연락처 이름');
  if (!profile.emergencyContactPhone) missingFields.push('비상연락처 전화번호');
  if (!profile.emergencyContactRelation) missingFields.push('비상연락처 관계');
  
  // 전화번호 형식 검증
  if (profile.emergencyContactPhone && !/^01[0-9]-\d{3,4}-\d{4}$/.test(profile.emergencyContactPhone)) {
    errors.push('비상연락처 전화번호 형식이 올바르지 않습니다.');
  }
  
  // 우편번호 형식 검증
  if (profile.postalCode && !/^\d{5}$/.test(profile.postalCode)) {
    errors.push('우편번호는 5자리 숫자여야 합니다.');
  }
  
  // 장기요양등급 검증
  if (profile.ltciGrade && (profile.ltciGrade < 1 || profile.ltciGrade > 6)) {
    errors.push('장기요양등급은 1-6 사이의 값이어야 합니다.');
  }
  
  // 나이 검증
  if (profile.birthDate) {
    const age = calculateAge(profile.birthDate);
    if (age && age < 0) {
      errors.push('생년월일이 올바르지 않습니다.');
    } else if (age && age > 120) {
      warnings.push('생년월일을 다시 확인해주세요.');
    }
  }
  
  return {
    isValid: errors.length === 0 && missingFields.length === 0,
    errors,
    missingFields,
    warnings
  };
};

export const validateOverseasProfile = (profile: Partial<OverseasProfile>): ProfileValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingFields: string[] = [];
  
  // 필수 필드 검증
  if (!profile.birthDate) missingFields.push('생년월일');
  if (!profile.gender) missingFields.push('성별');
  if (!profile.residenceCountry) missingFields.push('거주 국가');
  
  // 비상연락처 검증
  if (!profile.overseasContactName) missingFields.push('현지 비상연락처 이름');
  if (!profile.overseasContactPhone) missingFields.push('현지 비상연락처 전화번호');
  
  // 한국 우편번호 형식 검증
  if (profile.koreanPostalCode && !/^\d{5}$/.test(profile.koreanPostalCode)) {
    errors.push('한국 우편번호는 5자리 숫자여야 합니다.');
  }
  
  // 여권 만료일 검증
  if (profile.passportExpiryDate) {
    const expiryDate = new Date(profile.passportExpiryDate);
    const now = new Date();
    
    if (expiryDate <= now) {
      errors.push('여권이 만료되었습니다.');
    } else {
      const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      if (expiryDate <= thirtyDaysLater) {
        warnings.push('여권이 30일 이내에 만료됩니다.');
      }
    }
  }
  
  // 비자 만료일 검증
  if (profile.visaExpiryDate) {
    const expiryDate = new Date(profile.visaExpiryDate);
    const now = new Date();
    
    if (expiryDate <= now) {
      errors.push('비자가 만료되었습니다.');
    } else {
      const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      if (expiryDate <= thirtyDaysLater) {
        warnings.push('비자가 30일 이내에 만료됩니다.');
      }
    }
  }
  
  // 나이 검증
  if (profile.birthDate) {
    const age = calculateAge(profile.birthDate);
    if (age && age < 0) {
      errors.push('생년월일이 올바르지 않습니다.');
    } else if (age && age > 120) {
      warnings.push('생년월일을 다시 확인해주세요.');
    }
  }
  
  return {
    isValid: errors.length === 0 && missingFields.length === 0,
    errors,
    missingFields,
    warnings
  };
};

// ===== 종합 프로필 검증 =====

/**
 * 종합 프로필 검증 (국내/해외 통합)
 * @param profile - 프로필 데이터
 * @returns 검증 결과
 */
export const validateProfile = (profile: Profile): ProfileValidationResult => {
  if (isDomesticProfile(profile)) {
    return validateDomesticProfile(profile);
  } else if (isOverseasProfile(profile)) {
    return validateOverseasProfile(profile);
  }
  
  return {
    isValid: false,
    errors: ['프로필 타입을 확인할 수 없습니다.'],
    missingFields: [],
    warnings: []
  };
};

// ===== 문서 만료일 체크 고급 기능 =====

/**
 * 문서 만료 위험도 계산
 * @param expiryDate - 만료일
 * @returns 위험도 (0-1, 1이 가장 위험)
 */
export const calculateDocumentExpiryRisk = (expiryDate: string): number => {
  if (!expiryDate) return 0;
  
  const expiry = new Date(expiryDate);
  const now = new Date();
  const daysUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  
  if (daysUntilExpiry <= 0) return 1; // 이미 만료
  if (daysUntilExpiry <= 7) return 0.9; // 7일 이내
  if (daysUntilExpiry <= 30) return 0.7; // 30일 이내
  if (daysUntilExpiry <= 90) return 0.4; // 90일 이내
  if (daysUntilExpiry <= 180) return 0.2; // 180일 이내
  
  return 0; // 안전
};

/**
 * 문서 갱신 알림 스케줄
 * @param expiryDate - 만료일
 * @returns 알림 스케줄 배열
 */
export const getDocumentRenewalSchedule = (expiryDate: string): Array<{
  date: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
}> => {
  if (!expiryDate) return [];
  
  const expiry = new Date(expiryDate);
  const schedule = [];
  
  // 6개월 전
  const sixMonthsBefore = new Date(expiry.getTime() - (6 * 30 * 24 * 60 * 60 * 1000));
  schedule.push({
    date: sixMonthsBefore.toISOString().split('T')[0],
    message: '문서가 6개월 후 만료됩니다. 갱신 준비를 시작하세요.',
    priority: 'low' as const
  });
  
  // 3개월 전
  const threeMonthsBefore = new Date(expiry.getTime() - (3 * 30 * 24 * 60 * 60 * 1000));
  schedule.push({
    date: threeMonthsBefore.toISOString().split('T')[0],
    message: '문서가 3개월 후 만료됩니다. 갱신 절차를 확인하세요.',
    priority: 'medium' as const
  });
  
  // 1개월 전
  const oneMonthBefore = new Date(expiry.getTime() - (30 * 24 * 60 * 60 * 1000));
  schedule.push({
    date: oneMonthBefore.toISOString().split('T')[0],
    message: '문서가 1개월 후 만료됩니다. 즉시 갱신하세요.',
    priority: 'high' as const
  });
  
  return schedule.filter(item => new Date(item.date) >= new Date());
};

// ===== 프로필 보안 점검 =====

/**
 * 프로필 보안 점검
 * @param profile - 프로필 데이터
 * @returns 보안 점검 결과
 */
export const validateProfileSecurity = (profile: ProfileResponse): {
  securityScore: number;
  risks: string[];
  recommendations: string[];
} => {
  const risks: string[] = [];
  const recommendations: string[] = [];
  let securityScore = 100;
  
  // 개인정보 노출 위험 점검
  if (isDomesticProfileResponse(profile)) {
    if (profile.healthInsuranceNumber && profile.healthInsuranceNumber.indexOf('*') === -1) {
      risks.push('건강보험번호가 마스킹되지 않음');
      recommendations.push('건강보험번호를 마스킹 처리하세요');
      securityScore -= 20;
    }
    
    if (profile.emergencyContactPhone && profile.emergencyContactPhone.indexOf('*') === -1) {
      risks.push('비상연락처 전화번호가 마스킹되지 않음');
      recommendations.push('전화번호를 마스킹 처리하세요');
      securityScore -= 15;
    }
  } else if (isOverseasProfileResponse(profile)) {
    if (profile.passportNumber && profile.passportNumber.indexOf('*') === -1) {
      risks.push('여권번호가 마스킹되지 않음');
      recommendations.push('여권번호를 마스킹 처리하세요');
      securityScore -= 25;
    }
    
    // 문서 만료 위험
    if (profile.passportExpiryDate) {
      const risk = calculateDocumentExpiryRisk(profile.passportExpiryDate);
      if (risk > 0.7) {
        risks.push('여권 만료 임박');
        recommendations.push('여권을 즉시 갱신하세요');
        securityScore -= 30;
      }
    }
    
    if (profile.visaExpiryDate) {
      const risk = calculateDocumentExpiryRisk(profile.visaExpiryDate);
      if (risk > 0.7) {
        risks.push('비자 만료 임박');
        recommendations.push('비자를 즉시 갱신하세요');
        securityScore -= 30;
      }
    }
  }
  
  return {
    securityScore: Math.max(0, securityScore),
    risks,
    recommendations
  };
};

// ===== 검색 및 필터링 유틸리티 =====

export const createProfileSearchQuery = (filters: Record<string, any>): URLSearchParams => {
  const params = new URLSearchParams();
  
  for (const key in filters) {
    if (filters.hasOwnProperty(key)) {
      const value = filters[key];
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    }
  }
  
  return params;
};

/**
 * 프로필 검색 필터 검증
 * @param filters - 검색 필터
 * @returns 검증된 필터
 */
export const validateSearchFilters = (filters: Record<string, any>): Record<string, any> => {
  const validatedFilters = { ...filters };
  
  // 나이 범위 검증
  if (validatedFilters.minAge && (validatedFilters.minAge < 0 || validatedFilters.minAge > 120)) {
    delete validatedFilters.minAge;
  }
  
  if (validatedFilters.maxAge && (validatedFilters.maxAge < 0 || validatedFilters.maxAge > 120)) {
    delete validatedFilters.maxAge;
  }
  
  // 페이지 번호 검증
  if (validatedFilters.page && validatedFilters.page < 0) {
    validatedFilters.page = 0;
  }
  
  // 페이지 크기 검증
  if (validatedFilters.size && (validatedFilters.size < 1 || validatedFilters.size > 100)) {
    validatedFilters.size = 20;
  }
  
  return validatedFilters;
};

// ===== 프로필 데이터 정제 함수 =====

export const sanitizeProfileData = (data: any): any => {
  const sanitized = { ...data };
  
  // 빈 문자열을 null로 변환
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === '') {
      sanitized[key] = null;
    }
  });
  
  return sanitized;
};