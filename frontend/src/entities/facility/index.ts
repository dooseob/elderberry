/**
 * Facility 엔티티 Public API
 * FSD에 따른 시설 엔티티 공개 인터페이스
 */

// 기본 타입 내보내기
export type {
  Facility,
  FacilityDetail,
  FacilityRecommendation,
  FacilitySearchFilters,
  FacilityMatchingPreference,
  UserMatchingHistory,
  FacilitySearchRequest,
  FacilityRecommendationRequest,
  FacilitySearchResponse,
  FacilityRecommendationResponse,
  FacilityReview,
  FacilityStatistics,
  FacilityAvailability,
  FacilityVisitRequest,
  FacilityVisitResponse,
  FacilityComparison,
} from './model/types';

// Enum 타입 내보내기
export {
  FacilityType,
  FacilityGrade,
  MatchingOutcome,
} from './model/types';

// 타입 가드 함수 내보내기
export {
  isFacilityWithRecommendation,
  isFacilityDetail,
  isMatchingHistory,
} from './model/types';

// 상수 내보내기
export {
  FACILITY_TYPE_LABELS,
  FACILITY_GRADE_LABELS,
  MATCHING_OUTCOME_LABELS,
} from './model/types';

// 유틸리티 타입 내보내기
export type {
  FacilitySearchSortBy,
  FacilityStatus,
  VisitStatus,
} from './model/types';