/**
 * Facility 엔티티 타입 정의
 * FSD 구조에 맞춘 시설 도메인 타입
 */
import { BaseEntity } from '../../../shared/types/common';

// 기본 시설 엔티티
export interface Facility extends BaseEntity {
  facilityName: string;
  facilityType: FacilityType;
  facilityGrade: FacilityGrade;
  address: string;
  phoneNumber: string;
  totalCapacity: number;
  currentOccupancy: number;
  monthlyBasicFee: number | null;
  availableCareGrades: number[];
  specialties: string[];
  latitude: number | null;
  longitude: number | null;
  description?: string;
  imageUrl?: string;
  operatingHours?: string;
  facilities?: string[];
  certifications?: string[];
}

// 시설 타입 enum
export enum FacilityType {
  SENIOR_WELFARE_CENTER = 'SENIOR_WELFARE_CENTER',
  DAY_CARE_CENTER = 'DAY_CARE_CENTER',
  NURSING_HOME = 'NURSING_HOME',
  GROUP_HOME = 'GROUP_HOME',
  SHORT_TERM_CARE = 'SHORT_TERM_CARE',
  HOME_CARE_SERVICE = 'HOME_CARE_SERVICE',
  SENIOR_HOUSING = 'SENIOR_HOUSING',
  MEDICAL_FACILITY = 'MEDICAL_FACILITY',
}

// 시설 등급 enum
export enum FacilityGrade {
  A = 'A',
  B = 'B', 
  C = 'C',
  D = 'D',
  UNGRADED = 'UNGRADED',
}

// 시설 추천 정보
export interface FacilityRecommendation {
  facility: Facility;
  matchScore: number;
  recommendationReason: string;
  estimatedCost?: number;
  advantages: string[];
  considerations: string[];
}

// 시설 검색 필터
export interface FacilitySearchFilters {
  facilityType?: FacilityType[];
  facilityGrade?: FacilityGrade[];
  region?: string;
  careGradeLevel?: number;
  maxMonthlyFee?: number;
  minFacilityGrade?: FacilityGrade;
  specialties?: string[];
  maxDistanceKm?: number;
  hasAvailableSlots?: boolean;
  keywords?: string;
}

// 시설 매칭 선호도
export interface FacilityMatchingPreference {
  preferredRegions: string[];
  preferredFacilityTypes: FacilityType[];
  maxMonthlyFee: number | null;
  minFacilityGrade: FacilityGrade;
  requiredSpecialties: string[];
  maxDistanceKm: number | null;
  prioritizeAvailability: boolean;
  prioritizeCost: boolean;
  prioritizeQuality: boolean;
  specialRequirements?: string;
}

// 사용자 매칭 이력
export interface UserMatchingHistory {
  id: number;
  facilityId: number;
  facilityName: string;
  facilityType: FacilityType;
  matchScore: number;
  isViewed: boolean;
  isContacted: boolean;
  isVisited: boolean;
  isSelected: boolean;
  outcome?: MatchingOutcome;
  satisfactionScore?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

// 매칭 결과 enum
export enum MatchingOutcome {
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED',
}

// 시설 검색 요청
export interface FacilitySearchRequest {
  filters: FacilitySearchFilters;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  page?: number;
  size?: number;
  sortBy?: 'matchScore' | 'distance' | 'monthlyFee' | 'facilityGrade' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
}

// 시설 추천 요청
export interface FacilityRecommendationRequest {
  memberId: number;
  coordinatorId?: string;
  preference: FacilityMatchingPreference;
  maxResults?: number;
  includeAlternatives?: boolean;
}

// 시설 검색 응답
export interface FacilitySearchResponse {
  content: Facility[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  first: boolean;
  last: boolean;
}

// 시설 추천 응답
export interface FacilityRecommendationResponse {
  recommendations: FacilityRecommendation[];
  totalScore: number;
  alternativeOptions?: FacilityRecommendation[];
  explanations: {
    scoringCriteria: string[];
    matchingStrategy: string;
    improvementSuggestions: string[];
  };
}

// 시설 상세 정보
export interface FacilityDetail extends Facility {
  detailedDescription: string;
  photos: string[];
  videos?: string[];
  virtualTourUrl?: string;
  staffInfo: {
    totalStaff: number;
    nurses: number;
    caregivers: number;
    doctors: number;
    socialWorkers: number;
  };
  programsAndServices: string[];
  mealServices: {
    breakfastIncluded: boolean;
    lunchIncluded: boolean;
    dinnerIncluded: boolean;
    specialDiets: string[];
  };
  visitingPolicies: {
    visitingHours: string;
    restrictionsAndGuidelines: string[];
  };
  contactInfo: {
    primaryContact: string;
    email: string;
    website?: string;
    emergencyContact: string;
  };
  reviews: FacilityReview[];
  averageRating: number;
}

// 시설 리뷰
export interface FacilityReview {
  id: number;
  facilityId: number;
  userId: number;
  userName: string;
  rating: number;
  title: string;
  content: string;
  pros: string[];
  cons: string[];
  recommendToOthers: boolean;
  stayDuration?: string;
  careLevel?: number;
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

// 시설 통계
export interface FacilityStatistics {
  totalFacilities: number;
  facilitiesByType: {
    type: FacilityType;
    count: number;
  }[];
  facilitiesByGrade: {
    grade: FacilityGrade;
    count: number;
  }[];
  facilitiesByRegion: {
    region: string;
    count: number;
  }[];
  averageOccupancyRate: number;
  averageMonthlyFee: number;
  topSpecialties: {
    specialty: string;
    count: number;
  }[];
}

// 시설 가용성 정보
export interface FacilityAvailability {
  facilityId: number;
  totalCapacity: number;
  currentOccupancy: number;
  availableSlots: number;
  waitingListCount: number;
  estimatedWaitTime?: string;
  lastUpdated: string;
}

// 시설 방문 예약
export interface FacilityVisitRequest {
  facilityId: number;
  requestedDate: string;
  requestedTime: string;
  numberOfVisitors: number;
  specialRequests?: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
}

export interface FacilityVisitResponse {
  visitId: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  confirmedDate?: string;
  confirmedTime?: string;
  facilityContact: string;
  specialInstructions?: string;
  cancellationReason?: string;
}

// 시설 비교
export interface FacilityComparison {
  facilities: Facility[];
  comparisonMatrix: {
    criteriaName: string;
    values: (string | number | boolean)[];
    weights: number[];
  }[];
  overallScores: number[];
  recommendation: {
    topChoice: number; // facility index
    reasoning: string[];
  };
}

// 타입 가드 함수들
export function isFacilityWithRecommendation(item: any): item is FacilityRecommendation {
  return item && typeof item === 'object' && 'facility' in item && 'matchScore' in item;
}

export function isFacilityDetail(facility: any): facility is FacilityDetail {
  return facility && typeof facility === 'object' && 'detailedDescription' in facility && 'staffInfo' in facility;
}

export function isMatchingHistory(item: any): item is UserMatchingHistory {
  return item && typeof item === 'object' && 'facilityId' in item && 'matchScore' in item;
}

// 유틸리티 타입들
export type FacilitySearchSortBy = 'matchScore' | 'distance' | 'monthlyFee' | 'facilityGrade' | 'createdAt';
export type FacilityStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'UNDER_REVIEW';
export type VisitStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

// 상수 정의
export const FACILITY_TYPE_LABELS: Record<FacilityType, string> = {
  [FacilityType.SENIOR_WELFARE_CENTER]: '노인복지관',
  [FacilityType.DAY_CARE_CENTER]: '주간보호센터',
  [FacilityType.NURSING_HOME]: '요양원',
  [FacilityType.GROUP_HOME]: '그룹홈',
  [FacilityType.SHORT_TERM_CARE]: '단기보호시설',
  [FacilityType.HOME_CARE_SERVICE]: '재가요양서비스',
  [FacilityType.SENIOR_HOUSING]: '실버타운',
  [FacilityType.MEDICAL_FACILITY]: '의료시설',
};

export const FACILITY_GRADE_LABELS: Record<FacilityGrade, string> = {
  [FacilityGrade.A]: 'A등급 (우수)',
  [FacilityGrade.B]: 'B등급 (양호)',
  [FacilityGrade.C]: 'C등급 (보통)',
  [FacilityGrade.D]: 'D등급 (개선필요)',
  [FacilityGrade.UNGRADED]: '등급없음',
};

export const MATCHING_OUTCOME_LABELS: Record<MatchingOutcome, string> = {
  [MatchingOutcome.SUCCESSFUL]: '매칭성공',
  [MatchingOutcome.FAILED]: '매칭실패',
  [MatchingOutcome.PENDING]: '진행중',
  [MatchingOutcome.CANCELLED]: '취소됨',
};