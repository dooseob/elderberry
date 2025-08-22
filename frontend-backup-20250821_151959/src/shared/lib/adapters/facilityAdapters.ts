/**
 * Facility API 응답 데이터 변환 어댑터
 * 백엔드 DTO와 프론트엔드 타입 간의 변환 처리
 */
import type {
  Facility,
  FacilityDetail,
  FacilityRecommendation,
  FacilitySearchResponse,
  FacilityType,
  FacilityGrade
} from '../../../entities/facility/model/types';

// 백엔드 DTO 타입 정의 (실제 백엔드 응답 구조)
interface BackendFacilityDto {
  id: number;
  facilityName: string;
  facilityType: string;
  facilityGrade: string | null;
  sido: string;
  sigungu: string;
  detailAddress: string;
  phoneNumber: string | null;
  totalCapacity: number | null;
  currentOccupancy: number | null;
  monthlyBasicFee: number | null;
  careGradeLevels: string | null;
  specialties: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  operatorType: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface BackendFacilitySearchResponseDto {
  content: BackendFacilityDto[];
  pageable: {
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    pageSize: number;
    pageNumber: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

// 타입 매핑 함수들
const mapFacilityType = (backendType: string): FacilityType => {
  const typeMap: Record<string, FacilityType> = {
    'NURSING_HOME': FacilityType.NURSING_HOME,
    'DAY_CARE_CENTER': FacilityType.DAY_CARE_CENTER,
    'SENIOR_WELFARE_CENTER': FacilityType.SENIOR_WELFARE_CENTER,
    'GROUP_HOME': FacilityType.GROUP_HOME,
    'SHORT_TERM_CARE': FacilityType.SHORT_TERM_CARE,
    'HOME_CARE_SERVICE': FacilityType.HOME_CARE_SERVICE,
    'SENIOR_HOUSING': FacilityType.SENIOR_HOUSING,
    'MEDICAL_FACILITY': FacilityType.MEDICAL_FACILITY
  };
  
  return typeMap[backendType] || FacilityType.NURSING_HOME;
};

const mapFacilityGrade = (backendGrade: string | null): FacilityGrade => {
  if (!backendGrade) return FacilityGrade.UNGRADED;
  
  const gradeMap: Record<string, FacilityGrade> = {
    'A': FacilityGrade.A,
    'B': FacilityGrade.B,
    'C': FacilityGrade.C,
    'D': FacilityGrade.D,
    'UNGRADED': FacilityGrade.UNGRADED
  };
  
  return gradeMap[backendGrade.toUpperCase()] || FacilityGrade.UNGRADED;
};

const parseArrayString = (value: string | null): string[] => {
  if (!value) return [];
  try {
    // 쉼표로 구분된 문자열을 배열로 변환
    return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
  } catch {
    return [];
  }
};

const parseCareGradeLevels = (value: string | null): number[] => {
  if (!value) return [];
  try {
    return value.split(',')
      .map(item => parseInt(item.trim()))
      .filter(num => !isNaN(num));
  } catch {
    return [];
  }
};

/**
 * 백엔드 Facility DTO를 프론트엔드 Facility 타입으로 변환
 */
export const adaptBackendFacility = (backendFacility: BackendFacilityDto): Facility => {
  return {
    id: backendFacility.id,
    facilityName: backendFacility.facilityName,
    facilityType: mapFacilityType(backendFacility.facilityType),
    facilityGrade: mapFacilityGrade(backendFacility.facilityGrade),
    address: `${backendFacility.sido} ${backendFacility.sigungu} ${backendFacility.detailAddress || ''}`.trim(),
    phoneNumber: backendFacility.phoneNumber || '',
    totalCapacity: backendFacility.totalCapacity || 0,
    currentOccupancy: backendFacility.currentOccupancy || 0,
    monthlyBasicFee: backendFacility.monthlyBasicFee,
    availableCareGrades: parseCareGradeLevels(backendFacility.careGradeLevels),
    specialties: parseArrayString(backendFacility.specialties),
    latitude: backendFacility.latitude,
    longitude: backendFacility.longitude,
    description: backendFacility.description || undefined,
    createdAt: backendFacility.createdAt,
    updatedAt: backendFacility.updatedAt
  };
};

/**
 * 백엔드 검색 응답을 프론트엔드 검색 응답으로 변환
 */
export const adaptBackendSearchResponse = (backendResponse: BackendFacilitySearchResponseDto): FacilitySearchResponse => {
  return {
    content: backendResponse.content.map(adaptBackendFacility),
    totalElements: backendResponse.totalElements,
    totalPages: backendResponse.totalPages,
    page: backendResponse.number,
    size: backendResponse.size,
    first: backendResponse.first,
    last: backendResponse.last
  };
};

/**
 * 백엔드 단일 시설 응답을 FacilityDetail로 변환
 * (상세 정보가 없는 경우 기본 구조 제공)
 */
export const adaptBackendFacilityDetail = (backendFacility: BackendFacilityDto): FacilityDetail => {
  const baseFacility = adaptBackendFacility(backendFacility);
  
  return {
    ...baseFacility,
    detailedDescription: baseFacility.description || '상세 정보가 제공되지 않았습니다.',
    photos: [],
    videos: [],
    staffInfo: {
      totalStaff: 0,
      nurses: 0,
      caregivers: 0,
      doctors: 0,
      socialWorkers: 0
    },
    programsAndServices: [],
    mealServices: {
      breakfastIncluded: false,
      lunchIncluded: false,
      dinnerIncluded: false,
      specialDiets: []
    },
    visitingPolicies: {
      visitingHours: '문의 바랍니다',
      restrictionsAndGuidelines: []
    },
    contactInfo: {
      primaryContact: baseFacility.phoneNumber,
      email: '',
      emergencyContact: baseFacility.phoneNumber
    },
    reviews: [],
    averageRating: 0
  };
};

/**
 * 프론트엔드 검색 파라미터를 백엔드 형식으로 변환
 */
export const adaptFrontendSearchParams = (frontendParams: Record<string, any>): Record<string, any> => {
  const adaptedParams: Record<string, any> = {};
  
  // 기본 파라미터 매핑
  if (frontendParams.keyword) adaptedParams.keyword = frontendParams.keyword;
  if (frontendParams.region) adaptedParams.sido = frontendParams.region;
  if (frontendParams.district) adaptedParams.sigungu = frontendParams.district;
  if (frontendParams.facilityType) adaptedParams.facilityType = frontendParams.facilityType;
  if (frontendParams.minGrade) adaptedParams.minFacilityGrade = frontendParams.minGrade;
  if (frontendParams.maxMonthlyCost) adaptedParams.maxMonthlyFee = frontendParams.maxMonthlyCost;
  if (frontendParams.latitude) adaptedParams.latitude = frontendParams.latitude;
  if (frontendParams.longitude) adaptedParams.longitude = frontendParams.longitude;
  if (frontendParams.radiusKm) adaptedParams.radiusKm = frontendParams.radiusKm;
  if (frontendParams.sortBy) adaptedParams.sortBy = frontendParams.sortBy;
  if (frontendParams.page !== undefined) adaptedParams.page = frontendParams.page;
  if (frontendParams.size !== undefined) adaptedParams.size = frontendParams.size;
  
  // 불린 값 처리
  if (frontendParams.availableBedsOnly === true) {
    adaptedParams.hasAvailableSlots = true;
  }
  
  return adaptedParams;
};

/**
 * 타입 안전 검증 함수들
 */
export const isBackendFacilityDto = (data: any): data is BackendFacilityDto => {
  return data && 
         typeof data.id === 'number' &&
         typeof data.facilityName === 'string' &&
         typeof data.facilityType === 'string';
};

export const isBackendSearchResponseDto = (data: any): data is BackendFacilitySearchResponseDto => {
  return data && 
         Array.isArray(data.content) &&
         typeof data.totalElements === 'number' &&
         typeof data.totalPages === 'number';
};

/**
 * 에러 상황 처리를 위한 기본값 생성
 */
export const createEmptyFacilitySearchResponse = (): FacilitySearchResponse => ({
  content: [],
  totalElements: 0,
  totalPages: 0,
  page: 0,
  size: 20,
  first: true,
  last: true
});

export const createEmptyFacilityDetail = (id: number): FacilityDetail => ({
  id,
  facilityName: '정보 없음',
  facilityType: FacilityType.NURSING_HOME,
  facilityGrade: FacilityGrade.UNGRADED,
  address: '',
  phoneNumber: '',
  totalCapacity: 0,
  currentOccupancy: 0,
  monthlyBasicFee: null,
  availableCareGrades: [],
  specialties: [],
  latitude: null,
  longitude: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  detailedDescription: '시설 정보를 불러올 수 없습니다.',
  photos: [],
  staffInfo: {
    totalStaff: 0,
    nurses: 0,
    caregivers: 0,
    doctors: 0,
    socialWorkers: 0
  },
  programsAndServices: [],
  mealServices: {
    breakfastIncluded: false,
    lunchIncluded: false,
    dinnerIncluded: false,
    specialDiets: []
  },
  visitingPolicies: {
    visitingHours: '문의 바랍니다',
    restrictionsAndGuidelines: []
  },
  contactInfo: {
    primaryContact: '',
    email: '',
    emergencyContact: ''
  },
  reviews: [],
  averageRating: 0
});