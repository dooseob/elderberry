/**
 * 프로필 완성도 계산 및 관련 계산 함수 모듈
 * 국내/해외 프로필 완성도 계산, 가중치 시스템 등
 */

import {
  DomesticProfile,
  OverseasProfile,
  ProfileCompletionStatus
} from '../../../types/profile';

// ===== 프로필 완성도 계산 (기본) =====

/**
 * 국내 프로필 완성도 계산
 * @param profile - 국내 프로필 데이터
 * @returns 프로필 완성도 상태
 */
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
      missingFields: fields.filter(field => completed.indexOf(field) === -1)
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

/**
 * 해외 프로필 완성도 계산
 * @param profile - 해외 프로필 데이터
 * @returns 프로필 완성도 상태
 */
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
      missingFields: fields.filter(field => completed.indexOf(field) === -1)
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

// ===== 프로필 완성도 가중치 시스템 =====

/**
 * 국내 프로필 완성도 계산 (가중치 적용)
 * 기본 정보 40% + 비상연락처 30% + 건강정보 20% + 케어정보 10%
 * @param profile - 국내 프로필 데이터
 * @returns 가중치 적용된 프로필 완성도 상태
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
      missingFields: fields.filter(field => completed.indexOf(field) === -1),
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
 * @param profile - 해외 프로필 데이터
 * @returns 가중치 적용된 프로필 완성도 상태
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
      missingFields: fields.filter(field => completed.indexOf(field) === -1),
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

// ===== 필드 완성도 검증 유틸리티 =====

/**
 * 필드 완성도 체크 헬퍼 함수
 * @param profile - 프로필 데이터
 * @param fields - 체크할 필드 배열
 * @returns 필드 완성도 정보
 */
export const checkFieldCompletion = (profile: any, fields: string[]): {
  completed: boolean;
  requiredFields: string[];
  completedFields: string[];
  missingFields: string[];
  percentage: number;
} => {
  const completed = fields.filter(field => {
    const value = profile[field];
    return value !== null && value !== undefined && value !== '';
  });
  
  return {
    completed: completed.length === fields.length,
    requiredFields: fields,
    completedFields: completed,
    missingFields: fields.filter(field => completed.indexOf(field) === -1),
    percentage: (completed.length / fields.length) * 100
  };
};

/**
 * 프로필 완성도 점수 계산
 * @param completionPercentage - 완성도 퍼센티지
 * @returns 완성도 점수 (A, B, C, D, F)
 */
export const calculateCompletionScore = (completionPercentage: number): string => {
  if (completionPercentage >= 90) return 'A';
  if (completionPercentage >= 80) return 'B';
  if (completionPercentage >= 70) return 'C';
  if (completionPercentage >= 60) return 'D';
  return 'F';
};

/**
 * 프로필 완성도 개선 우선순위 계산
 * @param profile - 프로필 데이터 (국내 또는 해외)
 * @returns 개선 우선순위 배열
 */
export const calculateImprovementPriorities = (profile: Partial<DomesticProfile | OverseasProfile>): Array<{
  category: string;
  priority: 'high' | 'medium' | 'low';
  missingFields: string[];
  impact: number; // 1-10 scale
}> => {
  const priorities = [];
  
  // 기본 정보 우선순위 (가장 높음)
  const basicFields = ['birthDate', 'gender'];
  const basicMissing = basicFields.filter(field => {
    const value = (profile as any)[field];
    return !value || value === '';
  });
  
  if (basicMissing.length > 0) {
    priorities.push({
      category: '기본 정보',
      priority: 'high' as const,
      missingFields: basicMissing,
      impact: 10
    });
  }
  
  // 연락처 정보 우선순위 (높음)
  const contactFields = 'emergencyContactName' in profile 
    ? ['emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelation']
    : ['overseasContactName', 'overseasContactPhone', 'overseasContactRelation'];
  
  const contactMissing = contactFields.filter(field => {
    const value = (profile as any)[field];
    return !value || value === '';
  });
  
  if (contactMissing.length > 0) {
    priorities.push({
      category: '연락처 정보',
      priority: 'high' as const,
      missingFields: contactMissing,
      impact: 9
    });
  }
  
  // 주소/거주지 정보 우선순위 (중간)
  const addressFields = 'address' in profile 
    ? ['address', 'postalCode']
    : ['residenceCountry', 'residenceCity'];
  
  const addressMissing = addressFields.filter(field => {
    const value = (profile as any)[field];
    return !value || value === '';
  });
  
  if (addressMissing.length > 0) {
    priorities.push({
      category: '주소/거주지 정보',
      priority: 'medium' as const,
      missingFields: addressMissing,
      impact: 7
    });
  }
  
  return priorities.sort((a, b) => b.impact - a.impact);
};

/**
 * 프로필 완성도 예상 시간 계산
 * @param missingFieldsCount - 누락된 필드 개수
 * @returns 예상 완성 시간 (분)
 */
export const estimateCompletionTime = (missingFieldsCount: number): number => {
  // 필드당 평균 2분으로 계산
  const baseTimePerField = 2;
  
  // 복잡도에 따른 가중치 적용
  let adjustedTime = missingFieldsCount * baseTimePerField;
  
  // 필드가 많을 경우 추가 시간 (복잡성 증가)
  if (missingFieldsCount > 10) {
    adjustedTime += (missingFieldsCount - 10) * 0.5;
  }
  
  return Math.round(adjustedTime);
};