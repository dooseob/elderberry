/**
 * 프로필 시스템 관련 상수 정의
 */

import { ProfileType, Gender, CareLevel, BudgetRange, VisaStatus, TimeZonePreference, CommunicationMethod } from '../types/profile';

// ===== API 엔드포인트 상수 =====

export const PROFILE_API_ENDPOINTS = {
  // 국내 프로필 API
  DOMESTIC: {
    CREATE: '/api/profiles/domestic',
    GET_BY_ID: (id: number) => `/api/profiles/domestic/${id}`,
    UPDATE: (id: number) => `/api/profiles/domestic/${id}`,
    DELETE: (id: number) => `/api/profiles/domestic/${id}`,
    GET_BY_MEMBER_ID: (memberId: number) => `/api/profiles/domestic/member/${memberId}`,
  },
  // 해외 프로필 API
  OVERSEAS: {
    CREATE: '/api/profiles/overseas',
    GET_BY_ID: (id: number) => `/api/profiles/overseas/${id}`,
    UPDATE: (id: number) => `/api/profiles/overseas/${id}`,
    DELETE: (id: number) => `/api/profiles/overseas/${id}`,
    GET_BY_MEMBER_ID: (memberId: number) => `/api/profiles/overseas/member/${memberId}`,
  },
  // 공통 API
  COMMON: {
    LIST: '/api/profiles',
    SEARCH: '/api/profiles/search',
    STATISTICS: '/api/profiles/statistics',
    VALIDATE: '/api/profiles/validate',
    COMPLETION: (profileId: number, profileType: ProfileType) => 
      `/api/profiles/${profileType.toLowerCase()}/${profileId}/completion`,
  }
} as const;

// ===== 성별 옵션 =====

export const GENDER_OPTIONS = [
  { value: '남성', label: '남성', enum: Gender.MALE },
  { value: '여성', label: '여성', enum: Gender.FEMALE }
] as const;

// ===== 케어 수준 옵션 =====

export const CARE_LEVEL_OPTIONS = [
  { value: '경증', label: '경증', enum: CareLevel.MILD, description: '일상생활에서 부분적인 도움이 필요' },
  { value: '중등도', label: '중등도', enum: CareLevel.MODERATE, description: '일상생활에서 상당한 도움이 필요' },
  { value: '중증', label: '중증', enum: CareLevel.SEVERE, description: '일상생활에서 전면적인 도움이 필요' },
  { value: '최중증', label: '최중증', enum: CareLevel.CRITICAL, description: '24시간 전문적인 케어가 필요' }
] as const;

// ===== 장기요양등급 옵션 =====

export const LTCI_GRADE_OPTIONS = [
  { value: 1, label: '1등급 (최중증)', description: '심신 기능 상태 장애로 일상생활에서 전적으로 다른 사람의 도움이 필요' },
  { value: 2, label: '2등급 (중증)', description: '심신 기능 상태 장애로 일상생활에서 상당 부분 다른 사람의 도움이 필요' },
  { value: 3, label: '3등급 (중등증)', description: '심신 기능 상태 장애로 일상생활에서 부분적으로 다른 사람의 도움이 필요' },
  { value: 4, label: '4등급 (경증)', description: '심신 기능 상태 장애로 일상생활에서 일정 부분 다른 사람의 도움이 필요' },
  { value: 5, label: '5등급 (경증)', description: '치매환자로서 인지기능 등의 장애로 일정 부분 다른 사람의 도움이 필요' },
  { value: 6, label: '인지지원등급', description: '치매환자로서 인지기능 등의 장애로 인지지원 서비스가 필요' }
] as const;

// ===== 예산 범위 옵션 =====

export const DOMESTIC_BUDGET_OPTIONS = [
  { value: '50만원 이하', label: '50만원 이하', enum: BudgetRange.UNDER_50 },
  { value: '50-100만원', label: '50-100만원', enum: BudgetRange.FROM_50_TO_100 },
  { value: '100-150만원', label: '100-150만원', enum: BudgetRange.FROM_100_TO_150 },
  { value: '150-200만원', label: '150-200만원', enum: BudgetRange.FROM_150_TO_200 },
  { value: '200만원 이상', label: '200만원 이상', enum: BudgetRange.OVER_200 }
] as const;

export const OVERSEAS_BUDGET_OPTIONS = [
  { value: '100만원 이하', label: '100만원 이하', enum: BudgetRange.UNDER_50 },
  { value: '100-200만원', label: '100-200만원', enum: BudgetRange.FROM_100_TO_200 },
  { value: '200-300만원', label: '200-300만원', enum: BudgetRange.FROM_200_TO_300 },
  { value: '300-500만원', label: '300-500만원', enum: BudgetRange.FROM_300_TO_500 },
  { value: '500만원 이상', label: '500만원 이상', enum: BudgetRange.OVER_500 }
] as const;

// ===== 가족 방문 빈도 옵션 =====

export const FAMILY_VISIT_FREQUENCY_OPTIONS = [
  { value: '매일', label: '매일' },
  { value: '주 2-3회', label: '주 2-3회' },
  { value: '주 1회', label: '주 1회' },
  { value: '월 2-3회', label: '월 2-3회' },
  { value: '월 1회', label: '월 1회' },
  { value: '분기 1회', label: '분기 1회' },
  { value: '거의 없음', label: '거의 없음' }
] as const;

// ===== 거주 국가 옵션 =====

export const RESIDENCE_COUNTRY_OPTIONS = [
  { value: '미국', label: '미국', code: 'US' },
  { value: '중국', label: '중국', code: 'CN' },
  { value: '일본', label: '일본', code: 'JP' },
  { value: '캐나다', label: '캐나다', code: 'CA' },
  { value: '호주', label: '호주', code: 'AU' },
  { value: '독일', label: '독일', code: 'DE' },
  { value: '영국', label: '영국', code: 'GB' },
  { value: '프랑스', label: '프랑스', code: 'FR' },
  { value: '러시아', label: '러시아', code: 'RU' },
  { value: '브라질', label: '브라질', code: 'BR' },
  { value: '아르헨티나', label: '아르헨티나', code: 'AR' },
  { value: '카자흐스탄', label: '카자흐스탄', code: 'KZ' },
  { value: '우즈베키스탄', label: '우즈베키스탄', code: 'UZ' },
  { value: '베트남', label: '베트남', code: 'VN' },
  { value: '필리핀', label: '필리핀', code: 'PH' },
  { value: '인도네시아', label: '인도네시아', code: 'ID' },
  { value: '태국', label: '태국', code: 'TH' },
  { value: '싱가포르', label: '싱가포르', code: 'SG' },
  { value: '말레이시아', label: '말레이시아', code: 'MY' },
  { value: '기타', label: '기타', code: 'OTHER' }
] as const;

// ===== 비자 상태 옵션 =====

export const VISA_STATUS_OPTIONS = [
  { value: '관광비자', label: '관광비자', enum: VisaStatus.TOURIST },
  { value: '학생비자', label: '학생비자', enum: VisaStatus.STUDY },
  { value: '취업비자', label: '취업비자', enum: VisaStatus.WORK },
  { value: '거주비자', label: '거주비자', enum: VisaStatus.RESIDENCE },
  { value: '영주권', label: '영주권', enum: VisaStatus.PERMANENT_RESIDENCE }
] as const;

// ===== 시간대 선호도 옵션 =====

export const TIME_ZONE_PREFERENCE_OPTIONS = [
  { value: '한국시간 오전', label: '한국시간 오전 (09:00-12:00)', enum: TimeZonePreference.KOREA_MORNING },
  { value: '한국시간 오후', label: '한국시간 오후 (13:00-18:00)', enum: TimeZonePreference.KOREA_AFTERNOON },
  { value: '해외시간 기준', label: '해외시간 기준', enum: TimeZonePreference.OVERSEAS_TIME }
] as const;

// ===== 의사소통 방법 옵션 =====

export const COMMUNICATION_METHOD_OPTIONS = [
  { value: '화상통화', label: '화상통화', enum: CommunicationMethod.VIDEO_CALL, icon: '📹' },
  { value: '전화', label: '전화', enum: CommunicationMethod.PHONE_CALL, icon: '📞' },
  { value: '이메일', label: '이메일', enum: CommunicationMethod.EMAIL, icon: '📧' },
  { value: '문자', label: '문자', enum: CommunicationMethod.TEXT, icon: '💬' }
] as const;

// ===== 언어 선호도 옵션 =====

export const LANGUAGE_PREFERENCE_OPTIONS = [
  { value: '한국어', label: '한국어', code: 'ko' },
  { value: '영어', label: '영어', code: 'en' },
  { value: '중국어', label: '중국어', code: 'zh' },
  { value: '일본어', label: '일본어', code: 'ja' },
  { value: '스페인어', label: '스페인어', code: 'es' },
  { value: '러시아어', label: '러시아어', code: 'ru' },
  { value: '독일어', label: '독일어', code: 'de' },
  { value: '프랑스어', label: '프랑스어', code: 'fr' },
  { value: '포르투갈어', label: '포르투갈어', code: 'pt' },
  { value: '아랍어', label: '아랍어', code: 'ar' }
] as const;

// ===== 한국 지역 옵션 =====

export const KOREA_REGION_OPTIONS = [
  { value: '서울특별시', label: '서울특별시', code: 'SEOUL' },
  { value: '부산광역시', label: '부산광역시', code: 'BUSAN' },
  { value: '대구광역시', label: '대구광역시', code: 'DAEGU' },
  { value: '인천광역시', label: '인천광역시', code: 'INCHEON' },
  { value: '광주광역시', label: '광주광역시', code: 'GWANGJU' },
  { value: '대전광역시', label: '대전광역시', code: 'DAEJEON' },
  { value: '울산광역시', label: '울산광역시', code: 'ULSAN' },
  { value: '세종특별자치시', label: '세종특별자치시', code: 'SEJONG' },
  { value: '경기도', label: '경기도', code: 'GYEONGGI' },
  { value: '강원도', label: '강원도', code: 'GANGWON' },
  { value: '충청북도', label: '충청북도', code: 'CHUNGBUK' },
  { value: '충청남도', label: '충청남도', code: 'CHUNGNAM' },
  { value: '전라북도', label: '전라북도', code: 'JEONBUK' },
  { value: '전라남도', label: '전라남도', code: 'JEONNAM' },
  { value: '경상북도', label: '경상북도', code: 'GYEONGBUK' },
  { value: '경상남도', label: '경상남도', code: 'GYEONGNAM' },
  { value: '제주특별자치도', label: '제주특별자치도', code: 'JEJU' }
] as const;

// ===== 체류 기간 옵션 =====

export const STAY_DURATION_OPTIONS = [
  { value: '1개월 이하', label: '1개월 이하' },
  { value: '1-3개월', label: '1-3개월' },
  { value: '3-6개월', label: '3-6개월' },
  { value: '6개월-1년', label: '6개월-1년' },
  { value: '1-2년', label: '1-2년' },
  { value: '2년 이상', label: '2년 이상' },
  { value: '영구 거주', label: '영구 거주' }
] as const;

// ===== 입국 목적 옵션 =====

export const ENTRY_PURPOSE_OPTIONS = [
  { value: '부모님 요양', label: '부모님 요양' },
  { value: '가족 간병', label: '가족 간병' },
  { value: '치료 동반', label: '치료 동반' },
  { value: '의료 관광', label: '의료 관광' },
  { value: '장기 체류', label: '장기 체류' },
  { value: '귀국 준비', label: '귀국 준비' },
  { value: '기타', label: '기타' }
] as const;

// ===== 관계 옵션 =====

export const RELATIONSHIP_OPTIONS = [
  { value: '자녀', label: '자녀' },
  { value: '배우자', label: '배우자' },
  { value: '형제/자매', label: '형제/자매' },
  { value: '부모', label: '부모' },
  { value: '친척', label: '친척' },
  { value: '지인', label: '지인' },
  { value: '간병인', label: '간병인' },
  { value: '기타', label: '기타' }
] as const;

// ===== 프로필 폼 단계 설정 =====

export const PROFILE_FORM_STEPS = {
  DOMESTIC: [
    {
      id: 'basic-info',
      title: '기본 정보',
      description: '생년월일, 성별, 주소 등 기본 정보를 입력해주세요.',
      isRequired: true,
      fields: ['birthDate', 'gender', 'address', 'detailedAddress', 'postalCode'],
      icon: '👤'
    },
    {
      id: 'emergency-contact',
      title: '비상 연락처',
      description: '응급상황 시 연락할 수 있는 분의 정보를 입력해주세요.',
      isRequired: true,
      fields: ['emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelation'],
      icon: '🆘'
    },
    {
      id: 'health-info',
      title: '건강 정보',
      description: '건강보험 및 장기요양보험 관련 정보를 입력해주세요.',
      isRequired: false,
      fields: ['healthInsuranceNumber', 'ltciGrade', 'ltciCertificateNumber'],
      icon: '🏥'
    },
    {
      id: 'care-preferences',
      title: '케어 선호도',
      description: '원하시는 케어 수준과 선호 지역을 선택해주세요.',
      isRequired: false,
      fields: ['careLevel', 'specialNeeds', 'preferredRegion', 'familyVisitFrequency', 'budgetRange'],
      icon: '💝'
    }
  ],
  OVERSEAS: [
    {
      id: 'basic-info',
      title: '기본 정보',
      description: '생년월일, 성별 등 기본 정보를 입력해주세요.',
      isRequired: true,
      fields: ['birthDate', 'gender'],
      icon: '👤'
    },
    {
      id: 'residence-info',
      title: '거주지 정보',
      description: '현재 거주하고 계신 국가와 한국 내 주소를 입력해주세요.',
      isRequired: true,
      fields: ['residenceCountry', 'residenceCity', 'overseasAddress', 'koreanAddress', 'koreanPostalCode'],
      icon: '🌍'
    },
    {
      id: 'documents',
      title: '여권/비자 정보',
      description: '여권 및 비자 정보를 입력해주세요.',
      isRequired: false,
      fields: ['passportNumber', 'passportExpiryDate', 'visaStatus', 'visaExpiryDate'],
      icon: '📄'
    },
    {
      id: 'contacts',
      title: '연락처 정보',
      description: '현지 및 한국 내 연락처 정보를 입력해주세요.',
      isRequired: true,
      fields: ['overseasContactName', 'overseasContactPhone', 'overseasContactRelation', 'koreaContactName', 'koreaContactPhone', 'koreaContactRelation'],
      icon: '📞'
    },
    {
      id: 'preferences',
      title: '선호도 설정',
      description: '언어, 시간대, 케어 관련 선호사항을 설정해주세요.',
      isRequired: false,
      fields: ['languagePreference', 'timeZonePreference', 'preferredCommunicationMethod', 'preferredRegionInKorea', 'careLevel', 'specialNeeds', 'culturalDietaryRequirements', 'budgetRange', 'coordinatorRequired'],
      icon: '⚙️'
    }
  ]
} as const;

// ===== 유효성 검증 규칙 =====

export const VALIDATION_RULES = {
  PHONE_NUMBER: /^01[0-9]-\d{3,4}-\d{4}$/,
  POSTAL_CODE: /^\d{5}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSPORT_NUMBER: /^[A-Z]{1,2}[0-9]{6,9}$/,
  HEALTH_INSURANCE_NUMBER: /^\d{13}$/,
  LTCI_CERTIFICATE_NUMBER: /^\d{4}-\d{10}$/,
  
  MAX_LENGTHS: {
    NAME: 50,
    ADDRESS: 500,
    DETAILED_ADDRESS: 200,
    SPECIAL_NEEDS: 1000,
    CULTURAL_DIETARY_REQUIREMENTS: 500,
    EMERGENCY_CONTACT_NAME: 50,
    EMERGENCY_CONTACT_RELATION: 30,
    PREFERRED_REGION: 100,
    FAMILY_VISIT_FREQUENCY: 50,
    BUDGET_RANGE: 50,
    CARE_LEVEL: 20,
    RESIDENCE_COUNTRY: 50,
    RESIDENCE_CITY: 100,
    PASSPORT_NUMBER: 50,
    VISA_STATUS: 50,
    LANGUAGE_PREFERENCE: 100,
    TIME_ZONE_PREFERENCE: 50
  },
  
  AGE_LIMITS: {
    MIN: 0,
    MAX: 120
  },
  
  LTCI_GRADE_RANGE: {
    MIN: 1,
    MAX: 6
  }
} as const;

// ===== 기본값 설정 =====

export const DEFAULT_VALUES = {
  PROFILE_COMPLETION_PERCENTAGE: 0,
  COORDINATOR_REQUIRED: true,
  PAGE_SIZE: 20,
  CACHE_TTL: 5 * 60 * 1000, // 5분
  API_TIMEOUT: 30 * 1000, // 30초
  RETRY_ATTEMPTS: 3,
  DEBOUNCE_DELAY: 300, // ms
  
  SEARCH_FILTERS: {
    PAGE: 0,
    SIZE: 20,
    SORT_FIELD: 'updatedAt',
    SORT_DIRECTION: 'desc'
  }
} as const;

// ===== 메시지 상수 =====

export const MESSAGES = {
  SUCCESS: {
    PROFILE_CREATED: '프로필이 성공적으로 생성되었습니다.',
    PROFILE_UPDATED: '프로필이 성공적으로 수정되었습니다.',
    PROFILE_DELETED: '프로필이 성공적으로 삭제되었습니다.',
  },
  
  ERROR: {
    PROFILE_NOT_FOUND: '프로필을 찾을 수 없습니다.',
    VALIDATION_FAILED: '입력 정보를 확인해주세요.',
    NETWORK_ERROR: '네트워크 오류가 발생했습니다.',
    SERVER_ERROR: '서버 오류가 발생했습니다.',
    UNAUTHORIZED: '권한이 없습니다.',
    EXPIRED_PASSPORT: '여권이 만료되었습니다.',
    EXPIRED_VISA: '비자가 만료되었습니다.',
  },
  
  WARNING: {
    PASSPORT_EXPIRING: '여권이 30일 이내에 만료됩니다.',
    VISA_EXPIRING: '비자가 30일 이내에 만료됩니다.',
    INCOMPLETE_PROFILE: '프로필 정보가 불완전합니다.',
    UNSAVED_CHANGES: '저장되지 않은 변경사항이 있습니다.',
  },
  
  INFO: {
    LOADING: '로딩 중...',
    NO_DATA: '데이터가 없습니다.',
    SEARCH_NO_RESULTS: '검색 결과가 없습니다.',
  }
} as const;

// ===== 스타일 상수 =====

export const STYLES = {
  COMPLETION_COLORS: {
    EXCELLENT: 'text-green-600 bg-green-50',
    GOOD: 'text-blue-600 bg-blue-50',
    FAIR: 'text-yellow-600 bg-yellow-50',
    POOR: 'text-red-600 bg-red-50'
  },
  
  STATUS_COLORS: {
    VALID: 'text-green-600',
    EXPIRING: 'text-yellow-600',
    EXPIRED: 'text-red-600',
    UNKNOWN: 'text-gray-600'
  }
} as const;

// ===== 기능 플래그 =====

export const FEATURE_FLAGS = {
  ENABLE_PROFILE_VALIDATION: true,
  ENABLE_DOCUMENT_EXPIRY_CHECK: true,
  ENABLE_PROFILE_COMPLETION_TRACKING: true,
  ENABLE_REAL_TIME_UPDATES: false,
  ENABLE_BATCH_OPERATIONS: false,
  ENABLE_PROFILE_ANALYTICS: true,
  ENABLE_MOBILE_OPTIMIZATION: true,
  ENABLE_ACCESSIBILITY_FEATURES: true
} as const;