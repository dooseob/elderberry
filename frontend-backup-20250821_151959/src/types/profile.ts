/**
 * 프로필 관련 타입 정의
 * 백엔드 Java 엔티티와 정확히 대응
 */

// ====== 기본 Enum 타입들 ======

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

export enum CareLevel {
  LOW = 'LOW',           // 경증
  MODERATE = 'MODERATE', // 중등도
  HIGH = 'HIGH',         // 중증
  SEVERE = 'SEVERE'      // 최중증
}

export enum LtciGrade {
  GRADE_1 = 1,  // 1등급 (최중증)
  GRADE_2 = 2,  // 2등급
  GRADE_3 = 3,  // 3등급
  GRADE_4 = 4,  // 4등급
  GRADE_5 = 5,  // 5등급
  GRADE_6 = 6,  // 6등급 (경증)
  COGNITIVE_SUPPORT = 99 // 인지지원등급
}

export enum BudgetRange {
  UNDER_50 = 'UNDER_50',         // 50만원 이하
  FROM_50_TO_100 = 'FROM_50_TO_100',     // 50-100만원
  FROM_100_TO_150 = 'FROM_100_TO_150',   // 100-150만원
  FROM_150_TO_200 = 'FROM_150_TO_200',   // 150-200만원
  FROM_100_TO_200 = 'FROM_100_TO_200',   // 100-200만원 (해외용)
  FROM_200_TO_300 = 'FROM_200_TO_300',   // 200-300만원 (해외용)
  FROM_300_TO_500 = 'FROM_300_TO_500',   // 300-500만원 (해외용)
  OVER_200 = 'OVER_200',         // 200만원 이상
  OVER_500 = 'OVER_500'          // 500만원 이상 (해외용)
}

export enum VisaStatus {
  TOURIST = 'TOURIST',           // 관광비자
  STUDY = 'STUDY',               // 학생비자
  WORK = 'WORK',                 // 취업비자
  RESIDENCE = 'RESIDENCE',       // 거주비자
  PERMANENT_RESIDENCE = 'PERMANENT_RESIDENCE' // 영주권
}

export enum TimeZonePreference {
  KOREA_MORNING = 'KOREA_MORNING',     // 한국시간 오전
  KOREA_AFTERNOON = 'KOREA_AFTERNOON', // 한국시간 오후
  OVERSEAS_TIME = 'OVERSEAS_TIME'      // 해외시간 기준
}

export enum CommunicationMethod {
  VIDEO_CALL = 'VIDEO_CALL',   // 화상통화
  PHONE_CALL = 'PHONE_CALL',   // 전화
  EMAIL = 'EMAIL',             // 이메일
  TEXT = 'TEXT'                // 문자
}

export enum ProfileType {
  DOMESTIC = 'DOMESTIC',     // 국내 프로필
  OVERSEAS = 'OVERSEAS'      // 해외 프로필
}

export enum FamilyVisitFrequency {
  DAILY = 'DAILY',           // 매일
  WEEKLY = 'WEEKLY',         // 주 1회
  BIWEEKLY = 'BIWEEKLY',     // 2주 1회
  MONTHLY = 'MONTHLY',       // 월 1회
  RARELY = 'RARELY'          // 거의 없음
}

// ====== 기본 프로필 인터페이스 ======

export interface BaseProfile {
  id?: number;
  memberId: number;
  profileType: ProfileType;
  
  // 개인 정보
  birthDate?: string;
  gender?: Gender;
  address?: string;
  detailedAddress?: string;
  postalCode?: string;
  
  // 비상 연락처
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  
  // 케어 정보
  careLevel?: CareLevel;
  specialNeeds?: string;
  budgetRange?: BudgetRange;
  
  // 메타 정보
  profileCompletionPercentage: number;
  createdAt: string;
  updatedAt: string;
}

// ====== 국내 프로필 ======

export interface DomesticProfile extends BaseProfile {
  profileType: ProfileType.DOMESTIC;
  
  // 국내 전용 필드
  healthInsuranceNumber?: string;
  ltciGrade?: LtciGrade;
  ltciCertificateNumber?: string;
  preferredRegion?: string;
  familyVisitFrequency?: FamilyVisitFrequency;
}

// ====== 해외 프로필 ======

export interface OverseasProfile extends BaseProfile {
  profileType: ProfileType.OVERSEAS;
  
  // 거주지 정보
  residenceCountry: string;  // 필수 필드
  residenceCity?: string;
  koreanAddress?: string;
  koreanPostalCode?: string;
  
  // 여권/비자 정보
  passportNumber?: string;
  passportExpiryDate?: string;
  visaStatus?: VisaStatus;
  visaExpiryDate?: string;
  
  // 현지 연락처
  overseasContactName?: string;
  overseasContactPhone?: string;
  overseasContactRelation?: string;
  
  // 선호도
  languagePreference?: string;
  timeZonePreference?: string;
  preferredRegionInKorea?: string;
  
  // 기타
  culturalDietaryRequirements?: string;
  coordinatorRequired?: boolean;
}

// ====== Request 타입들 ======

export interface BaseProfileRequest {
  // 개인 정보
  birthDate?: string;
  gender?: Gender;
  address?: string;
  detailedAddress?: string;
  postalCode?: string;
  
  // 비상 연락처
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  
  // 케어 정보
  careLevel?: CareLevel;
  specialNeeds?: string;
  budgetRange?: BudgetRange;
}

export interface DomesticProfileRequest extends BaseProfileRequest {
  // 국내 전용 필드
  healthInsuranceNumber?: string;
  ltciGrade?: LtciGrade;
  ltciCertificateNumber?: string;
  preferredRegion?: string;
  familyVisitFrequency?: FamilyVisitFrequency;
}

export interface OverseasProfileRequest extends BaseProfileRequest {
  // 거주지 정보 (필수)
  residenceCountry: string;
  residenceCity?: string;
  koreanAddress?: string;
  koreanPostalCode?: string;
  
  // 여권/비자 정보
  passportNumber?: string;
  passportExpiryDate?: string;
  visaStatus?: VisaStatus;
  visaExpiryDate?: string;
  
  // 현지 연락처
  overseasContactName?: string;
  overseasContactPhone?: string;
  overseasContactRelation?: string;
  
  // 선호도
  languagePreference?: string;
  timeZonePreference?: string;
  preferredRegionInKorea?: string;
  
  // 기타
  culturalDietaryRequirements?: string;
  coordinatorRequired?: boolean;
}

// ====== Response 타입들 ======

export interface DomesticProfileResponse extends DomesticProfile {
  memberName: string;
  memberEmail: string;
  age?: number;
  ltciGradeText?: string;
  hasEssentialInfo: boolean;
  isSevereCase?: boolean;
  isCognitiveSupport?: boolean;
}

export interface OverseasProfileResponse extends OverseasProfile {
  memberName: string;
  memberEmail: string;
  age?: number;
  hasValidDocuments: boolean;
  isPassportExpiringSoon: boolean;
  isVisaExpiringSoon: boolean;
  hasKoreanContact: boolean;
  hasOverseasContact: boolean;
}

// ====== 검색 및 필터 타입들 ======

export interface ProfileSearchParams {
  keyword?: string;
  profileType?: ProfileType;
  minCompletion?: number;
  maxCompletion?: number;
  careLevel?: CareLevel[];
  budgetRange?: BudgetRange[];
  age?: { min?: number; max?: number };
  
  // 국내 프로필 전용
  ltciGrade?: LtciGrade[];
  preferredRegion?: string[];
  
  // 해외 프로필 전용
  residenceCountry?: string[];
  coordinatorRequired?: boolean;
  documentStatus?: 'valid' | 'expiring' | 'expired';
  
  // 페이징
  page?: number;
  size?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'profileCompletionPercentage' | 'age';
  sortDirection?: 'asc' | 'desc';
}

export interface ProfileListResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// ====== 통계 및 분석 타입들 ======

export interface ProfileStatistics {
  totalProfiles: number;
  domesticProfiles: number;
  overseasProfiles: number;
  averageCompletionRate: number;
  
  // 완성도별 분포
  completionDistribution: {
    low: number;    // 0-30%
    medium: number; // 31-70%
    high: number;   // 71-100%
  };
  
  // 연령대별 분포
  ageDistribution: {
    range: string;
    count: number;
  }[];
  
  // 케어 레벨별 분포
  careLevelDistribution: {
    level: CareLevel;
    count: number;
  }[];
  
  // 지역별 분포 (국내)
  regionDistribution: {
    region: string;
    count: number;
  }[];
  
  // 국가별 분포 (해외)
  countryDistribution: {
    country: string;
    count: number;
  }[];
}

// ====== 유효성 검증 타입들 ======

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

export interface ProfileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingFields: string[];
}

export interface ProfileCompletionStatus {
  basicInfo: FieldCompletionInfo;
  emergencyContact: FieldCompletionInfo;
  specificInfo: FieldCompletionInfo;
  overall: OverallCompletionInfo;
}

export interface FieldCompletionInfo {
  completed: boolean;
  requiredFields: string[];
  completedFields: string[];
  missingFields: string[];
  percentage?: number;
}

export interface OverallCompletionInfo {
  percentage: number;
  isComplete: boolean;
  totalFields: number;
  completedFields: number;
}

export interface DocumentValidityStatus {
  passport: DocumentStatus;
  visa: DocumentStatus;
  overall: {
    hasValidDocuments: boolean;
    hasExpiringDocuments: boolean;
    warnings: string[];
  };
}

export interface DocumentStatus {
  isValid: boolean;
  expiryDate?: string;
  isExpiringSoon: boolean;
  daysUntilExpiry?: number;
}

export interface LtciGradeInfo {
  text: string;
  description: string;
  color: string;
  isSevere: boolean;
  isCognitiveSupport: boolean;
}

// ====== 프로필 개선 제안 타입들 ======

export interface ProfileImprovementSuggestion {
  category: 'completion' | 'accuracy' | 'security' | 'documentation';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionRequired: string;
  estimatedImpact: number; // 완성도 향상 예상치 (%)
}

// ====== 해외 프로필 전용 타입들 ======

export interface VisaRequirement {
  country: string;
  purpose: string;
  requirements: string[];
  processingTime: string;
  validityPeriod: string;
  cost: string;
  additionalNotes?: string;
}

export interface DocumentExpiryAlert {
  profileId: number;
  memberName: string;
  documentType: 'passport' | 'visa';
  expiryDate: string;
  daysUntilExpiry: number;
  urgencyLevel: 'high' | 'medium' | 'low';
}

// ====== 프로필 활동 로그 ======

export interface ProfileActivityLog {
  id: number;
  profileId: number;
  actionType: 'created' | 'updated' | 'viewed' | 'deleted';
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  performedBy: number;
  performedByName: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

// ====== 공통 타입들 ======

export type Profile = DomesticProfile | OverseasProfile;
export type ProfileRequest = DomesticProfileRequest | OverseasProfileRequest;
export type ProfileResponse = DomesticProfileResponse | OverseasProfileResponse;

// ====== 타입 가드 함수들 ======

export function isDomesticProfile(profile: BaseProfile): profile is DomesticProfile {
  return profile.profileType === ProfileType.DOMESTIC;
}

export function isOverseasProfile(profile: BaseProfile): profile is OverseasProfile {
  return profile.profileType === ProfileType.OVERSEAS;
}

export function isDomesticProfileRequest(request: any): request is DomesticProfileRequest {
  return !request.residenceCountry;
}

export function isOverseasProfileRequest(request: any): request is OverseasProfileRequest {
  return !!request.residenceCountry;
}

export function isDomesticProfileResponse(profile: ProfileResponse): profile is DomesticProfileResponse {
  return profile.profileType === ProfileType.DOMESTIC;
}

export function isOverseasProfileResponse(profile: ProfileResponse): profile is OverseasProfileResponse {
  return profile.profileType === ProfileType.OVERSEAS;
}

// ====== 상수 정의 ======

export const LTCI_GRADE_INFO: Record<number, LtciGradeInfo> = {
  1: {
    text: '1등급 (최중증)',
    description: '일상생활에서 전적으로 다른 사람의 도움이 필요한 상태',
    color: 'red',
    isSevere: true,
    isCognitiveSupport: false
  },
  2: {
    text: '2등급 (중증)',
    description: '일상생활에서 상당 부분 다른 사람의 도움이 필요한 상태',
    color: 'orange',
    isSevere: true,
    isCognitiveSupport: false
  },
  3: {
    text: '3등급 (중등증)',
    description: '일상생활에서 부분적으로 다른 사람의 도움이 필요한 상태',
    color: 'yellow',
    isSevere: false,
    isCognitiveSupport: false
  },
  4: {
    text: '4등급 (경증)',
    description: '일상생활에서 일정 부분 다른 사람의 도움이 필요한 상태',
    color: 'blue',
    isSevere: false,
    isCognitiveSupport: false
  },
  5: {
    text: '5등급 (경증)',
    description: '치매환자 (인지기능 장애)',
    color: 'blue',
    isSevere: false,
    isCognitiveSupport: true
  },
  6: {
    text: '인지지원등급',
    description: '인지기능이 저하되어 일상생활에 지장을 주는 상태',
    color: 'purple',
    isSevere: false,
    isCognitiveSupport: true
  }
};

export const BUDGET_RANGE_INFO = {
  [BudgetRange.UNDER_50]: {
    text: '50만원 이하',
    range: { min: 0, max: 500000 }
  },
  [BudgetRange.FROM_50_TO_100]: {
    text: '50-100만원',
    range: { min: 500000, max: 1000000 }
  },
  [BudgetRange.FROM_100_TO_150]: {
    text: '100-150만원',
    range: { min: 1000000, max: 1500000 }
  },
  [BudgetRange.FROM_150_TO_200]: {
    text: '150-200만원',
    range: { min: 1500000, max: 2000000 }
  },
  [BudgetRange.FROM_100_TO_200]: {
    text: '100-200만원',
    range: { min: 1000000, max: 2000000 }
  },
  [BudgetRange.FROM_200_TO_300]: {
    text: '200-300만원',
    range: { min: 2000000, max: 3000000 }
  },
  [BudgetRange.FROM_300_TO_500]: {
    text: '300-500만원',
    range: { min: 3000000, max: 5000000 }
  },
  [BudgetRange.OVER_200]: {
    text: '200만원 이상',
    range: { min: 2000000, max: Infinity }
  },
  [BudgetRange.OVER_500]: {
    text: '500만원 이상',
    range: { min: 5000000, max: Infinity }
  }
};

export const PROFILE_FORM_STEPS = {
  DOMESTIC: [
    { id: 1, title: '기본 정보', fields: ['birthDate', 'gender', 'address'] },
    { id: 2, title: '비상 연락처', fields: ['emergencyContactName', 'emergencyContactPhone'] },
    { id: 3, title: '케어 정보', fields: ['careLevel', 'specialNeeds', 'budgetRange'] },
    { id: 4, title: '국내 전용 정보', fields: ['healthInsuranceNumber', 'ltciGrade', 'preferredRegion'] }
  ],
  OVERSEAS: [
    { id: 1, title: '기본 정보', fields: ['birthDate', 'gender', 'residenceCountry'] },
    { id: 2, title: '거주지 정보', fields: ['residenceCity', 'koreanAddress'] },
    { id: 3, title: '여권/비자 정보', fields: ['passportNumber', 'visaStatus'] },
    { id: 4, title: '연락처 정보', fields: ['emergencyContactName', 'overseasContactName'] },
    { id: 5, title: '케어 정보', fields: ['careLevel', 'specialNeeds', 'budgetRange'] },
    { id: 6, title: '선호도 설정', fields: ['languagePreference', 'coordinatorRequired'] }
  ]
};

// ====== API 에러 타입 ======

export interface ProfileApiError {
  message: string;
  code: string;
  status: number;
  timestamp: string;
  path: string;
  details?: Record<string, any>;
}