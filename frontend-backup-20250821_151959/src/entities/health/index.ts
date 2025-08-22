/**
 * Health 엔티티 Public API
 * FSD에 따른 건강 평가 엔티티 공개 인터페이스
 */

// 기본 타입 내보내기
export type {
  HealthAssessment,
  CreateHealthAssessmentRequest,
  UpdateHealthAssessmentRequest,
  CareGradeResult,
  AssessmentStep,
  HealthAssessmentWizardState,
  HealthAssessmentStatistics,
  HealthAssessmentHistory,
  HealthAssessmentComparison,
  HealthAssessmentSearchParams,
  HealthAssessmentListResponse,
  HealthSummary,
  HealthAlert,
  AdlLevel,
  AdlOptions,
  LtciGrade,
  CareTargetStatus,
  MealType,
  HealthGender,
} from './model/types';

// Enum 타입 내보내기
export {
  CareType,
} from './model/types';

// 타입 가드 함수 내보내기
export {
  isValidAdlLevel,
  isValidLtciGrade,
  isValidCareTargetStatus,
  isValidMealType,
  isHealthAssessmentComplete,
} from './model/types';

// 상수 내보내기
export {
  ADL_OPTIONS,
  LTCI_GRADES,
  CARE_TARGET_STATUS,
  MEAL_TYPES,
  CARE_TYPE_LABELS,
  HEALTH_ASSESSMENT_STEPS,
} from './model/types';