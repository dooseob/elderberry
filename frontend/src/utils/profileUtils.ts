/**
 * 프로필 시스템 유틸리티 함수들
 */

import {
  Profile,
  ProfileResponse,
  DomesticProfile,
  OverseasProfile,
  ProfileValidationResult,
  ProfileCompletionStatus,
  DocumentValidityStatus,
  LtciGradeInfo,
  LTCI_GRADE_INFO,
  isDomesticProfile,
  isOverseasProfile,
  isDomesticProfileResponse,
  isOverseasProfileResponse,
  Gender,
  CareLevel,
  BudgetRange,
  ProfileType
} from '../types/profile';

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

// ===== 전화번호 마스킹 함수 =====

export const maskPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber || phoneNumber.length < 8) {
    return phoneNumber;
  }
  
  return phoneNumber.substring(0, 3) + '-****-' + phoneNumber.substring(phoneNumber.length - 4);
};

// ===== 건강보험번호 마스킹 함수 =====

export const maskHealthInsuranceNumber = (insuranceNumber: string): string => {
  if (!insuranceNumber || insuranceNumber.length < 8) {
    return insuranceNumber;
  }
  
  return insuranceNumber.substring(0, 6) + '****' + insuranceNumber.substring(insuranceNumber.length - 3);
};

// ===== 여권번호 마스킹 함수 =====

export const maskPassportNumber = (passportNumber: string): string => {
  if (!passportNumber || passportNumber.length < 4) {
    return passportNumber;
  }
  
  return passportNumber.substring(0, 2) + '****' + passportNumber.substring(passportNumber.length - 2);
};

// ===== 장기요양등급 정보 조회 =====

export const getLtciGradeInfo = (grade: number): LtciGradeInfo | null => {
  return LTCI_GRADE_INFO[grade] || null;
};

export const getLtciGradeText = (grade: number): string => {
  const info = getLtciGradeInfo(grade);
  return info ? info.text : '미등록';
};

export const isSevereLtciGrade = (grade: number): boolean => {
  const info = getLtciGradeInfo(grade);
  return info ? info.isSevere : false;
};

export const isCognitiveSupportGrade = (grade: number): boolean => {
  const info = getLtciGradeInfo(grade);
  return info ? info.isCognitiveSupport : false;
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

// ===== 프로필 완성도 계산 =====

export const calculateDomesticProfileCompletion = (profile: Partial<DomesticProfile>): ProfileCompletionStatus => {
  const basicInfoFields = ['birthDate', 'gender', 'address', 'detailedAddress', 'postalCode'];
  const emergencyContactFields = ['emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelation'];
  const healthInfoFields = ['healthInsuranceNumber', 'ltciGrade', 'ltciCertificateNumber'];
  const careFields = ['careLevel', 'specialNeeds', 'budgetRange', 'preferredRegion', 'familyVisitFrequency'];
  
  const allFields = [...basicInfoFields, ...emergencyContactFields, ...healthInfoFields, ...careFields];
  
  const checkFieldCompletion = (fields: string[]) => {
    const completed = fields.filter(field => {
      const value = (profile as any)[field];
      return value !== null && value !== undefined && value !== '';
    });
    
    return {
      completed: completed.length === fields.length,
      requiredFields: fields,
      completedFields: completed,
      missingFields: fields.filter(field => !completed.includes(field))
    };
  };
  
  const basicInfo = checkFieldCompletion(basicInfoFields);
  const emergencyContact = checkFieldCompletion(emergencyContactFields);
  const specificInfo = checkFieldCompletion([...healthInfoFields, ...careFields]);
  
  const totalCompleted = allFields.filter(field => {
    const value = (profile as any)[field];
    return value !== null && value !== undefined && value !== '';
  }).length;
  
  const percentage = Math.round((totalCompleted / allFields.length) * 100);
  
  return {
    basicInfo,
    emergencyContact,
    specificInfo,
    overall: {
      percentage,
      isComplete: basicInfo.completed && emergencyContact.completed,
      totalFields: allFields.length,
      completedFields: totalCompleted
    }
  };
};

export const calculateOverseasProfileCompletion = (profile: Partial<OverseasProfile>): ProfileCompletionStatus => {
  const basicInfoFields = ['birthDate', 'gender'];
  const emergencyContactFields = ['overseasContactName', 'overseasContactPhone', 'overseasContactRelation'];
  const residenceFields = ['residenceCountry', 'residenceCity', 'koreanAddress', 'koreanPostalCode'];
  const documentFields = ['passportNumber', 'passportExpiryDate', 'visaStatus', 'visaExpiryDate'];
  const preferenceFields = ['languagePreference', 'timeZonePreference', 'preferredRegionInKorea', 'careLevel', 'specialNeeds', 'budgetRange', 'culturalDietaryRequirements'];
  
  const allFields = [...basicInfoFields, ...emergencyContactFields, ...residenceFields, ...documentFields, ...preferenceFields];
  
  const checkFieldCompletion = (fields: string[]) => {
    const completed = fields.filter(field => {
      const value = (profile as any)[field];
      return value !== null && value !== undefined && value !== '';
    });
    
    return {
      completed: completed.length === fields.length,
      requiredFields: fields,
      completedFields: completed,
      missingFields: fields.filter(field => !completed.includes(field))
    };
  };
  
  const basicInfo = checkFieldCompletion(basicInfoFields);
  const emergencyContact = checkFieldCompletion(emergencyContactFields);
  const specificInfo = checkFieldCompletion([...residenceFields, ...documentFields, ...preferenceFields]);
  
  const totalCompleted = allFields.filter(field => {
    const value = (profile as any)[field];
    return value !== null && value !== undefined && value !== '';
  }).length;
  
  const percentage = Math.round((totalCompleted / allFields.length) * 100);
  
  return {
    basicInfo,
    emergencyContact,
    specificInfo,
    overall: {
      percentage,
      isComplete: basicInfo.completed && emergencyContact.completed && profile.residenceCountry !== undefined,
      totalFields: allFields.length,
      completedFields: totalCompleted
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
    } else if (expiryDate <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)) {
      warnings.push('여권이 30일 이내에 만료됩니다.');
    }
  }
  
  // 비자 만료일 검증
  if (profile.visaExpiryDate) {
    const expiryDate = new Date(profile.visaExpiryDate);
    const now = new Date();
    
    if (expiryDate <= now) {
      errors.push('비자가 만료되었습니다.');
    } else if (expiryDate <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)) {
      warnings.push('비자가 30일 이내에 만료됩니다.');
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

// ===== 프로필 요약 정보 생성 =====

export const generateProfileSummary = (profile: ProfileResponse): string => {
  const age = profile.birthDate ? calculateAge(profile.birthDate) : null;
  
  let summary = `프로필 타입: ${isDomesticProfileResponse(profile) ? '국내' : '해외'}\n`;
  
  if (age) {
    summary += `나이: ${age}세\n`;
  }
  
  if (profile.gender) {
    summary += `성별: ${profile.gender}\n`;
  }
  
  if (isDomesticProfileResponse(profile)) {
    if (profile.address) {
      summary += `주소: ${profile.address}\n`;
    }
    if (profile.ltciGrade) {
      summary += `장기요양등급: ${getLtciGradeText(profile.ltciGrade)}\n`;
    }
    if (profile.preferredRegion) {
      summary += `선호지역: ${profile.preferredRegion}\n`;
    }
  } else if (isOverseasProfileResponse(profile)) {
    summary += `거주 국가: ${profile.residenceCountry}`;
    if (profile.residenceCity) {
      summary += ` (${profile.residenceCity})`;
    }
    summary += '\n';
    
    if (profile.preferredRegionInKorea) {
      summary += `한국 내 선호지역: ${profile.preferredRegionInKorea}\n`;
    }
    
    summary += `코디네이터 필요: ${profile.coordinatorRequired ? '예' : '아니오'}\n`;
  }
  
  summary += `완성도: ${profile.profileCompletionPercentage}%`;
  
  return summary;
};

// ===== 프로필 타입 확인 함수 =====

export const getProfileTypeFromResponse = (profile: ProfileResponse): ProfileType => {
  return isDomesticProfileResponse(profile) ? ProfileType.DOMESTIC : ProfileType.OVERSEAS;
};

// ===== 연령대 분류 함수 =====

/**
 * 나이를 기반으로 연령대를 분류합니다.
 * @param age - 나이
 * @returns 연령대 분류 결과
 */
export const getAgeGroup = (age: number | null): string => {
  if (age === null || age < 0) return '미상';
  
  if (age < 50) return '50세 미만';
  if (age < 60) return '50-59세';
  if (age < 70) return '60-69세';
  if (age < 80) return '70-79세';
  if (age < 90) return '80-89세';
  return '90세 이상';
};

/**
 * 생년월일로부터 연령대를 분류합니다.
 * @param birthDate - 생년월일 (YYYY-MM-DD 형식)
 * @returns 연령대 분류 결과
 */
export const getAgeGroupFromBirthDate = (birthDate: string): string => {
  const age = calculateAge(birthDate);
  return getAgeGroup(age);
};

// ===== 프로필 완성도 가중치 시스템 =====

/**
 * 국내 프로필 완성도 계산 (가중치 적용)
 * 기본 정보 40% + 비상연락처 30% + 건강정보 20% + 케어정보 10%
 */
export const calculateDomesticProfileCompletionWeighted = (profile: Partial<DomesticProfile>): ProfileCompletionStatus => {
  const weights = {
    basicInfo: 0.4,      // 40% - 기본 정보
    emergency: 0.3,      // 30% - 비상연락처
    health: 0.2,         // 20% - 건강 정보
    care: 0.1           // 10% - 케어 선호도
  };
  
  const basicInfoFields = ['birthDate', 'gender', 'address', 'detailedAddress', 'postalCode'];
  const emergencyContactFields = ['emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelation'];
  const healthInfoFields = ['healthInsuranceNumber', 'ltciGrade', 'ltciCertificateNumber'];
  const careFields = ['careLevel', 'specialNeeds', 'budgetRange', 'preferredRegion', 'familyVisitFrequency'];
  
  const checkFieldCompletion = (fields: string[]) => {
    const completed = fields.filter(field => {
      const value = (profile as any)[field];
      return value !== null && value !== undefined && value !== '';
    });
    
    return {
      completed: completed.length === fields.length,
      requiredFields: fields,
      completedFields: completed,
      missingFields: fields.filter(field => !completed.includes(field)),
      percentage: (completed.length / fields.length) * 100
    };
  };
  
  const basicInfo = checkFieldCompletion(basicInfoFields);
  const emergencyContact = checkFieldCompletion(emergencyContactFields);
  const healthInfo = checkFieldCompletion(healthInfoFields);
  const careInfo = checkFieldCompletion(careFields);
  
  // 가중 평균 계산
  const weightedPercentage = Math.round(
    (basicInfo.percentage * weights.basicInfo) +
    (emergencyContact.percentage * weights.emergency) +
    (healthInfo.percentage * weights.health) +
    (careInfo.percentage * weights.care)
  );
  
  const allFields = [...basicInfoFields, ...emergencyContactFields, ...healthInfoFields, ...careFields];
  const totalCompleted = allFields.filter(field => {
    const value = (profile as any)[field];
    return value !== null && value !== undefined && value !== '';
  }).length;
  
  return {
    basicInfo,
    emergencyContact,
    specificInfo: {
      completed: healthInfo.completed && careInfo.completed,
      requiredFields: [...healthInfoFields, ...careFields],
      completedFields: [...healthInfo.completedFields, ...careInfo.completedFields],
      missingFields: [...healthInfo.missingFields, ...careInfo.missingFields]
    },
    overall: {
      percentage: weightedPercentage,
      isComplete: basicInfo.completed && emergencyContact.completed,
      totalFields: allFields.length,
      completedFields: totalCompleted
    }
  };
};

/**
 * 해외 프로필 완성도 계산 (가중치 적용)
 * 기본 정보 25% + 거주지 정보 25% + 연락처 25% + 문서 15% + 선호도 10%
 */
export const calculateOverseasProfileCompletionWeighted = (profile: Partial<OverseasProfile>): ProfileCompletionStatus => {
  const weights = {
    basicInfo: 0.25,     // 25% - 기본 정보
    residence: 0.25,     // 25% - 거주지 정보
    contact: 0.25,       // 25% - 연락처 정보
    documents: 0.15,     // 15% - 문서 정보
    preferences: 0.1     // 10% - 선호도
  };
  
  const basicInfoFields = ['birthDate', 'gender'];
  const residenceFields = ['residenceCountry', 'residenceCity', 'koreanAddress', 'koreanPostalCode'];
  const contactFields = ['overseasContactName', 'overseasContactPhone', 'overseasContactRelation'];
  const documentFields = ['passportNumber', 'passportExpiryDate', 'visaStatus', 'visaExpiryDate'];
  const preferenceFields = ['languagePreference', 'timeZonePreference', 'preferredRegionInKorea', 'careLevel', 'specialNeeds', 'budgetRange', 'culturalDietaryRequirements'];
  
  const checkFieldCompletion = (fields: string[]) => {
    const completed = fields.filter(field => {
      const value = (profile as any)[field];
      return value !== null && value !== undefined && value !== '';
    });
    
    return {
      completed: completed.length === fields.length,
      requiredFields: fields,
      completedFields: completed,
      missingFields: fields.filter(field => !completed.includes(field)),
      percentage: (completed.length / fields.length) * 100
    };
  };
  
  const basicInfo = checkFieldCompletion(basicInfoFields);
  const residenceInfo = checkFieldCompletion(residenceFields);
  const contactInfo = checkFieldCompletion(contactFields);
  const documentInfo = checkFieldCompletion(documentFields);
  const preferenceInfo = checkFieldCompletion(preferenceFields);
  
  // 가중 평균 계산
  const weightedPercentage = Math.round(
    (basicInfo.percentage * weights.basicInfo) +
    (residenceInfo.percentage * weights.residence) +
    (contactInfo.percentage * weights.contact) +
    (documentInfo.percentage * weights.documents) +
    (preferenceInfo.percentage * weights.preferences)
  );
  
  const allFields = [...basicInfoFields, ...residenceFields, ...contactFields, ...documentFields, ...preferenceFields];
  const totalCompleted = allFields.filter(field => {
    const value = (profile as any)[field];
    return value !== null && value !== undefined && value !== '';
  }).length;
  
  return {
    basicInfo,
    emergencyContact: contactInfo,
    specificInfo: {
      completed: residenceInfo.completed && documentInfo.completed && preferenceInfo.completed,
      requiredFields: [...residenceFields, ...documentFields, ...preferenceFields],
      completedFields: [...residenceInfo.completedFields, ...documentInfo.completedFields, ...preferenceInfo.completedFields],
      missingFields: [...residenceInfo.missingFields, ...documentInfo.missingFields, ...preferenceInfo.missingFields]
    },
    overall: {
      percentage: weightedPercentage,
      isComplete: basicInfo.completed && contactInfo.completed && profile.residenceCountry !== undefined,
      totalFields: allFields.length,
      completedFields: totalCompleted
    }
  };
};

// ===== 고급 마스킹 함수들 =====

/**
 * 신용카드 번호 마스킹
 * @param cardNumber - 신용카드 번호
 * @returns 마스킹된 신용카드 번호
 */
export const maskCreditCardNumber = (cardNumber: string): string => {
  if (!cardNumber || cardNumber.length < 8) {
    return cardNumber;
  }
  
  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.length < 8) return cardNumber;
  
  return cleaned.substring(0, 4) + '-****-****-' + cleaned.substring(cleaned.length - 4);
};

/**
 * 주민등록번호 마스킹
 * @param residentNumber - 주민등록번호
 * @returns 마스킹된 주민등록번호
 */
export const maskResidentNumber = (residentNumber: string): string => {
  if (!residentNumber || residentNumber.length < 8) {
    return residentNumber;
  }
  
  const cleaned = residentNumber.replace(/-/g, '');
  if (cleaned.length !== 13) return residentNumber;
  
  return cleaned.substring(0, 6) + '-*******';
};

/**
 * 이메일 마스킹
 * @param email - 이메일 주소
 * @returns 마스킹된 이메일 주소
 */
export const maskEmail = (email: string): string => {
  if (!email || !email.includes('@')) {
    return email;
  }
  
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) {
    return email;
  }
  
  const maskedLocal = localPart.substring(0, 2) + '****' + localPart.substring(localPart.length - 1);
  return `${maskedLocal}@${domain}`;
};

// ===== 장기요양등급 고급 유틸리티 =====

/**
 * 장기요양등급별 케어 요구사항 반환
 * @param grade - 장기요양등급 (1-6)
 * @returns 케어 요구사항 정보
 */
export const getLtciCareRequirements = (grade: number): {
  dailySupport: string;
  medicalSupport: string;
  specialtySupport: string[];
  recommendedFacilities: string[];
} | null => {
  const requirements = {
    1: {
      dailySupport: '24시간 전면적 도움 필요',
      medicalSupport: '상시 의료진 관리',
      specialtySupport: ['전문간병', '의료기기 관리', '응급처치'],
      recommendedFacilities: ['요양병원', '전문요양시설']
    },
    2: {
      dailySupport: '일상생활 대부분 도움 필요',
      medicalSupport: '정기적 의료 관리',
      specialtySupport: ['식사보조', '이동보조', '배설도움'],
      recommendedFacilities: ['요양원', '주간보호센터']
    },
    3: {
      dailySupport: '일상생활 부분적 도움 필요',
      medicalSupport: '주기적 건강 점검',
      specialtySupport: ['목욕보조', '가사지원', '외출동행'],
      recommendedFacilities: ['주간보호센터', '방문요양']
    },
    4: {
      dailySupport: '일정 부분 도움 필요',
      medicalSupport: '기본 건강 관리',
      specialtySupport: ['가사지원', '안전관리', '사회활동'],
      recommendedFacilities: ['주간보호센터', '재가서비스']
    },
    5: {
      dailySupport: '인지기능 지원 필요',
      medicalSupport: '치매 전문 관리',
      specialtySupport: ['인지활동', '행동관리', '안전감시'],
      recommendedFacilities: ['치매전담시설', '인지센터']
    },
    6: {
      dailySupport: '인지지원 서비스',
      medicalSupport: '예방적 건강 관리',
      specialtySupport: ['인지훈련', '예방프로그램', '사회참여'],
      recommendedFacilities: ['인지지원센터', '경로당']
    }
  };
  
  return requirements[grade as keyof typeof requirements] || null;
};

/**
 * 장기요양등급 변경 권장사항
 * @param currentGrade - 현재 등급
 * @param targetGrade - 목표 등급
 * @returns 등급 변경 권장사항
 */
export const getLtciGradeChangeRecommendation = (currentGrade: number, targetGrade: number): string => {
  if (currentGrade === targetGrade) {
    return '현재 등급을 유지하세요.';
  }
  
  if (currentGrade > targetGrade) {
    return '건강 상태가 악화되었습니다. 전문의와 상담하여 케어 계획을 재검토하세요.';
  }
  
  return '건강 상태가 개선되었습니다. 현재 케어 서비스를 조정할 수 있습니다.';
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
  const sixMonthsBefore = new Date(expiry);
  sixMonthsBefore.setMonth(sixMonthsBefore.getMonth() - 6);
  schedule.push({
    date: sixMonthsBefore.toISOString().split('T')[0],
    message: '문서가 6개월 후 만료됩니다. 갱신 준비를 시작하세요.',
    priority: 'low' as const
  });
  
  // 3개월 전
  const threeMonthsBefore = new Date(expiry);
  threeMonthsBefore.setMonth(threeMonthsBefore.getMonth() - 3);
  schedule.push({
    date: threeMonthsBefore.toISOString().split('T')[0],
    message: '문서가 3개월 후 만료됩니다. 갱신 절차를 확인하세요.',
    priority: 'medium' as const
  });
  
  // 1개월 전
  const oneMonthBefore = new Date(expiry);
  oneMonthBefore.setMonth(oneMonthBefore.getMonth() - 1);
  schedule.push({
    date: oneMonthBefore.toISOString().split('T')[0],
    message: '문서가 1개월 후 만료됩니다. 즉시 갱신하세요.',
    priority: 'high' as const
  });
  
  return schedule.filter(item => new Date(item.date) >= new Date());
};

// ===== 날짜 형식 변환 함수 =====

export const formatDate = (dateString: string, format: 'short' | 'long' = 'short'): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  if (format === 'short') {
    return date.toLocaleDateString('ko-KR');
  } else {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  }
};

export const formatDateTime = (dateTimeString: string): string => {
  if (!dateTimeString) return '';
  
  const date = new Date(dateTimeString);
  return date.toLocaleString('ko-KR');
};

// ===== 상태 표시 함수 =====

export const getCompletionStatusColor = (percentage: number): string => {
  if (percentage >= 90) return 'text-green-600';
  if (percentage >= 70) return 'text-blue-600';
  if (percentage >= 50) return 'text-yellow-600';
  return 'text-red-600';
};

export const getCompletionStatusText = (percentage: number): string => {
  if (percentage >= 90) return '우수';
  if (percentage >= 70) return '양호';
  if (percentage >= 50) return '보통';
  return '미흡';
};

// ===== 지역 데이터 및 국가 데이터 상수 =====

/**
 * 한국 행정구역 데이터
 */
export const KOREA_REGIONS = {
  서울특별시: {
    code: 'SEOUL',
    districts: ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구']
  },
  부산광역시: {
    code: 'BUSAN',
    districts: ['강서구', '금정구', '기장군', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구']
  },
  대구광역시: {
    code: 'DAEGU',
    districts: ['남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구']
  },
  인천광역시: {
    code: 'INCHEON',
    districts: ['강화군', '계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '옹진군', '중구']
  },
  광주광역시: {
    code: 'GWANGJU',
    districts: ['광산구', '남구', '동구', '북구', '서구']
  },
  대전광역시: {
    code: 'DAEJEON',
    districts: ['대덕구', '동구', '서구', '유성구', '중구']
  },
  울산광역시: {
    code: 'ULSAN',
    districts: ['남구', '동구', '북구', '울주군', '중구']
  },
  세종특별자치시: {
    code: 'SEJONG',
    districts: ['세종시']
  },
  경기도: {
    code: 'GYEONGGI',
    districts: ['가평군', '고양시', '과천시', '광명시', '광주시', '구리시', '군포시', '김포시', '남양주시', '동두천시', '부천시', '성남시', '수원시', '시흥시', '안산시', '안성시', '안양시', '양주시', '양평군', '여주시', '연천군', '오산시', '용인시', '의왕시', '의정부시', '이천시', '파주시', '평택시', '포천시', '하남시', '화성시']
  },
  강원도: {
    code: 'GANGWON',
    districts: ['강릉시', '고성군', '동해시', '삼척시', '속초시', '양구군', '양양군', '영월군', '원주시', '인제군', '정선군', '철원군', '춘천시', '태백시', '평창군', '홍천군', '화천군', '횡성군']
  }
} as const;

/**
 * 주요 국가 데이터
 */
export const COUNTRIES = {
  미국: { code: 'US', continent: '북미', timeZone: 'UTC-5~UTC-10', currency: 'USD' },
  중국: { code: 'CN', continent: '아시아', timeZone: 'UTC+8', currency: 'CNY' },
  일본: { code: 'JP', continent: '아시아', timeZone: 'UTC+9', currency: 'JPY' },
  캐나다: { code: 'CA', continent: '북미', timeZone: 'UTC-3.5~UTC-8', currency: 'CAD' },
  호주: { code: 'AU', continent: '오세아니아', timeZone: 'UTC+8~UTC+11', currency: 'AUD' },
  독일: { code: 'DE', continent: '유럽', timeZone: 'UTC+1', currency: 'EUR' },
  영국: { code: 'GB', continent: '유럽', timeZone: 'UTC+0', currency: 'GBP' },
  프랑스: { code: 'FR', continent: '유럽', timeZone: 'UTC+1', currency: 'EUR' },
  러시아: { code: 'RU', continent: '유럽/아시아', timeZone: 'UTC+2~UTC+12', currency: 'RUB' },
  브라질: { code: 'BR', continent: '남미', timeZone: 'UTC-2~UTC-5', currency: 'BRL' }
} as const;

/**
 * 국가별 시간대 정보 조회
 * @param countryName - 국가명
 * @returns 시간대 정보
 */
export const getCountryTimeZone = (countryName: string): string => {
  const country = COUNTRIES[countryName as keyof typeof COUNTRIES];
  return country ? country.timeZone : 'UTC+0';
};

/**
 * 지역별 세부 구역 조회
 * @param regionName - 지역명
 * @returns 세부 구역 배열
 */
export const getRegionDistricts = (regionName: string): string[] => {
  const region = KOREA_REGIONS[regionName as keyof typeof KOREA_REGIONS];
  return region ? region.districts : [];
};

// ===== 고급 프로필 검증 함수 =====

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
    if (profile.healthInsuranceNumber && !profile.healthInsuranceNumber.includes('*')) {
      risks.push('건강보험번호가 마스킹되지 않음');
      recommendations.push('건강보험번호를 마스킹 처리하세요');
      securityScore -= 20;
    }
    
    if (profile.emergencyContactPhone && !profile.emergencyContactPhone.includes('*')) {
      risks.push('비상연락처 전화번호가 마스킹되지 않음');
      recommendations.push('전화번호를 마스킹 처리하세요');
      securityScore -= 15;
    }
  } else if (isOverseasProfileResponse(profile)) {
    if (profile.passportNumber && !profile.passportNumber.includes('*')) {
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
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });
  
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