/**
 * 프로필 유틸리티 Public API
 * FSD 아키텍처에 따른 캡슐화된 인터페이스
 */

// ===== 유효성 검증 모듈 =====
export {
  // 나이 계산
  calculateAge,
  
  // 문서 검증
  validateDocuments,
  
  // 프로필 검증
  validateDomesticProfile,
  validateOverseasProfile,
  validateProfile,
  
  // 보안 검증
  validateProfileSecurity,
  calculateDocumentExpiryRisk,
  getDocumentRenewalSchedule,
  
  // 검색 및 필터링
  createProfileSearchQuery,
  validateSearchFilters,
  sanitizeProfileData
} from './validation';

// ===== 포맷팅 및 마스킹 모듈 =====
export {
  // 마스킹 함수들
  maskPhoneNumber,
  maskHealthInsuranceNumber,
  maskPassportNumber,
  maskCreditCardNumber,
  maskResidentNumber,
  maskEmail,
  
  // 날짜 형식 변환
  formatDate,
  formatDateTime,
  
  // 연령대 분류
  getAgeGroup,
  getAgeGroupFromBirthDate,
  
  // 상태 표시
  getCompletionStatusColor,
  getCompletionStatusText,
  
  // 프로필 요약
  generateProfileSummary,
  getProfileTypeFromResponse,
  
  // 지역 데이터 상수
  KOREA_REGIONS,
  COUNTRIES,
  getCountryTimeZone,
  getRegionDistricts
} from './formatting';

// ===== 계산 모듈 =====
export {
  // 기본 완성도 계산
  calculateDomesticProfileCompletion,
  calculateOverseasProfileCompletion,
  
  // 가중치 적용 완성도 계산
  calculateDomesticProfileCompletionWeighted,
  calculateOverseasProfileCompletionWeighted,
  
  // 유틸리티 함수들
  checkFieldCompletion,
  calculateCompletionScore,
  calculateImprovementPriorities,
  estimateCompletionTime
} from './calculations';

// ===== 장기요양 관련 모듈 =====
export {
  // 기본 정보 조회
  getLtciGradeInfo,
  getLtciGradeText,
  isSevereLtciGrade,
  isCognitiveSupportGrade,
  
  // 고급 기능
  getLtciCareRequirements,
  getLtciGradeChangeRecommendation,
  getLtciEstimatedMonthlyCost,
  getLtciRequiredServiceHours,
  assessLtciGradeUpgradePossibility,
  getRecommendedFacilityTypes
} from './ltci-utils';

// ===== 타입 재export (편의를 위한) =====
export type {
  Profile,
  ProfileResponse,
  DomesticProfile,
  OverseasProfile,
  ProfileValidationResult,
  ProfileCompletionStatus,
  DocumentValidityStatus,
  LtciGradeInfo,
  Gender,
  CareLevel,
  BudgetRange,
  ProfileType
} from '../../../types/profile';