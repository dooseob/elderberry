import { BaseEntity } from 'shared/types';
import type { Member } from 'entities/auth';

/**
 * 언어 숨수준 레벨
 */
export enum LanguageLevel {
  BASIC = 'BASIC',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  NATIVE = 'NATIVE'
}

/**
 * 코디네이터 상태
 */
export enum CoordinatorStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  SUSPENDED = 'SUSPENDED'
}

/**
 * 매칭 우선순위
 */
export enum MatchingPriority {
  EXPERIENCE = 'EXPERIENCE',
  LANGUAGE_MATCH = 'LANGUAGE_MATCH',
  GEOGRAPHIC_PROXIMITY = 'GEOGRAPHIC_PROXIMITY',
  SATISFACTION_RATING = 'SATISFACTION_RATING',
  AVAILABILITY = 'AVAILABILITY'
}

/**
 * 코디네이터 엔티티
 */
export interface Coordinator extends BaseEntity {
  id: number;
  member: Member;
  coordinatorId: string;
  name: string;
  experienceYears: number;
  successfulCases: number;
  customerSatisfaction: number;
  specialtyAreas: string[];
  compatibleCareGrades: number[];
  languageSkills: CoordinatorLanguageSkill[];
  availableWeekends: boolean;
  availableEmergency: boolean;
  workingRegions: string[];
  currentActiveCases: number;
  maxSimultaneousCases: number;
  workloadRatio: number;
  status: CoordinatorStatus;
  bio?: string;
  certifications: string[];
  profileImageUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  
  // Computed properties
  isAvailable: boolean;
  availabilityStatus: string;
  experienceLevel: string;
  satisfactionLevel: string;
  remainingCapacity: number;
}

/**
 * 코디네이터 매칭 결과
 */
export interface CoordinatorMatch {
  coordinatorId: string;
  name: string;
  matchScore: number;
  matchReason: string;
  experienceYears: number;
  successfulCases: number;
  customerSatisfaction: number;
  specialtyAreas: string[];
  compatibleCareGrades: number[];
  languageSkills: CoordinatorLanguageSkill[];
  availableWeekends: boolean;
  availableEmergency: boolean;
  workingRegions: string[];
  currentActiveCases: number;
  maxSimultaneousCases: number;
  workloadRatio: number;
  profileImageUrl?: string;
  
  // Computed properties
  isAvailable: boolean;
  availabilityStatus: string;
  experienceLevel: string;
  satisfactionLevel: string;
}

/**
 * 코디네이터 언어 능력
 */
export interface CoordinatorLanguageSkill extends BaseEntity {
  id: number;
  coordinator: Coordinator;
  languageCode: string;
  languageName: string;
  proficiencyLevel: LanguageLevel;
  certificationName?: string;
  certificationDate?: string;
  isNative: boolean;
}

/**
 * 코디네이터 케어 설정
 */
export interface CoordinatorCareSettings extends BaseEntity {
  id: number;
  coordinator: Coordinator;
  preferredCareTypes: string[];
  minCareGrade: number;
  maxCareGrade: number;
  preferredServiceHours: string;
  specialNeedsExperience: string[];
  emergencyResponseCapable: boolean;
  nightCareAvailable: boolean;
  weekendCareAvailable: boolean;
  travelDistance: number; // km
  hourlyRate?: number;
  monthlyRate?: number;
}

/**
 * 매칭 선호도
 */
export interface MatchingPreference {
  userId: number;
  careGrade: number;
  requiredLanguages: string[];
  preferredRegion: string;
  urgentCare: boolean;
  weekendCareNeeded: boolean;
  emergencyCareNeeded: boolean;
  specialRequirements?: string[];
  maxDistance?: number;
  budgetRange?: {
    min: number;
    max: number;
  };
  priorityFactors: MatchingPriority[];
}

/**
 * 코디네이터 생성 요청
 */
export interface CoordinatorCreateRequest {
  memberId: number;
  coordinatorId: string;
  name: string;
  experienceYears: number;
  specialtyAreas: string[];
  compatibleCareGrades: number[];
  availableWeekends: boolean;
  availableEmergency: boolean;
  workingRegions: string[];
  maxSimultaneousCases: number;
  bio?: string;
  certifications?: string[];
  contactEmail?: string;
  contactPhone?: string;
  languageSkills?: {
    languageCode: string;
    languageName: string;
    proficiencyLevel: LanguageLevel;
    certificationName?: string;
    isNative?: boolean;
  }[];
}

/**
 * 코디네이터 수정 요청
 */
export interface CoordinatorUpdateRequest {
  name?: string;
  experienceYears?: number;
  specialtyAreas?: string[];
  compatibleCareGrades?: number[];
  availableWeekends?: boolean;
  availableEmergency?: boolean;
  workingRegions?: string[];
  maxSimultaneousCases?: number;
  status?: CoordinatorStatus;
  bio?: string;
  certifications?: string[];
  contactEmail?: string;
  contactPhone?: string;
}

/**
 * 코디네이터 검색 필터
 */
export interface CoordinatorSearchFilters {
  region?: string;
  careGrade?: number;
  languageCode?: string;
  experienceYears?: number;
  minSatisfactionRating?: number;
  availableWeekends?: boolean;
  availableEmergency?: boolean;
  status?: CoordinatorStatus;
  maxDistance?: number;
  sortBy?: 'matchScore' | 'experience' | 'satisfaction' | 'availability';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

/**
 * 매칭 요청
 */
export interface MatchingRequest {
  userId: number;
  preferences: MatchingPreference;
  simulationMode?: boolean;
}

/**
 * 매칭 결과
 */
export interface MatchingResult {
  requestId: string;
  userId: number;
  matches: CoordinatorMatch[];
  totalMatches: number;
  averageMatchScore: number;
  matchingCriteria: MatchingPreference;
  executionTime: number;
  recommendations: string[];
  alternatives?: CoordinatorMatch[];
}

/**
 * 매칭 통계
 */
export interface MatchingStatistics {
  totalMatches: number;
  successfulMatches: number;
  averageMatchScore: number;
  topPerformingCoordinators: CoordinatorMatch[];
  regionalDistribution: Record<string, number>;
  languageDistribution: Record<string, number>;
  satisfactionTrends: Array<{
    period: string;
    averageRating: number;
    totalReviews: number;
  }>;
  workloadAnalysis: {
    overloadedCoordinators: number;
    availableCoordinators: number;
    optimalWorkloadCoordinators: number;
  };
}

/**
 * 언어 레벨별 디스플레이 명
 */
export const LANGUAGE_LEVEL_LABELS: Record<LanguageLevel, string> = {
  [LanguageLevel.BASIC]: '기초',
  [LanguageLevel.INTERMEDIATE]: '중급',
  [LanguageLevel.ADVANCED]: '고급',
  [LanguageLevel.NATIVE]: '모국어'
};

/**
 * 코디네이터 상태별 디스플레이 명
 */
export const COORDINATOR_STATUS_LABELS: Record<CoordinatorStatus, string> = {
  [CoordinatorStatus.ACTIVE]: '활성',
  [CoordinatorStatus.INACTIVE]: '비활성',
  [CoordinatorStatus.ON_LEAVE]: '휴가중',
  [CoordinatorStatus.SUSPENDED]: '정지됨'
};

/**
 * 매칭 우선순위별 디스플레이 명
 */
export const MATCHING_PRIORITY_LABELS: Record<MatchingPriority, string> = {
  [MatchingPriority.EXPERIENCE]: '경력 우선',
  [MatchingPriority.LANGUAGE_MATCH]: '언어 매칭',
  [MatchingPriority.GEOGRAPHIC_PROXIMITY]: '지리적 근접성',
  [MatchingPriority.SATISFACTION_RATING]: '만족도 평점',
  [MatchingPriority.AVAILABILITY]: '가용성'
};

/**
 * 전문 분야 매핑
 */
export const SPECIALTY_AREA_LABELS: Record<string, string> = {
  'dementia': '치매 전문',
  'stroke': '뇌졸중 전문',
  'diabetes': '당놨병 관리',
  'mobility': '이동성 지원',
  'mental_health': '정신건강',
  'rehabilitation': '재활 치료',
  'palliative': '완화 의료',
  'emergency': '응급 케어'
};

/**
 * 매칭 점수 색상 매핑
 */
export const MATCH_SCORE_COLORS = {
  excellent: '#10b981', // 녹색 (90-100)
  good: '#22c55e',      // 연녹색 (80-89)
  fair: '#eab308',      // 노랑색 (70-79)
  poor: '#f97316',      // 주황색 (60-69)
  bad: '#ef4444'        // 빨간색 (< 60)
};

/**
 * 매칭 점수별 라벨
 */
export const MATCH_SCORE_LABELS = {
  getLabel: (score: number): string => {
    if (score >= 90) return '최적 매칭';
    if (score >= 80) return '우수 매칭';
    if (score >= 70) return '양호 매칭';
    if (score >= 60) return '보통 매칭';
    return '매칭 부족';
  },
  getColor: (score: number): string => {
    if (score >= 90) return MATCH_SCORE_COLORS.excellent;
    if (score >= 80) return MATCH_SCORE_COLORS.good;
    if (score >= 70) return MATCH_SCORE_COLORS.fair;
    if (score >= 60) return MATCH_SCORE_COLORS.poor;
    return MATCH_SCORE_COLORS.bad;
  }
};
