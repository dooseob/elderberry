// 시설 관련 타입 정의

export interface FacilityProfileResponse {
  id: number;
  facilityName: string;
  facilityType: string;
  facilityGrade?: string;
  region: string;
  district: string;
  postalCode?: string;
  address: string;
  detailAddress?: string;
  latitude?: number;
  longitude?: number;
  contactNumber?: string;
  email?: string;
  website?: string;
  establishedDate?: string;
  capacity: number;
  currentOccupancy: number;
  availableSlots: number;
  basicMonthlyFee?: number;
  serviceFeatures?: string[];
  profileImageUrl?: string;
  introductionText?: string;
  rating?: number;
  reviewCount?: number;
}

export interface FacilitySearchParams {
  page?: number;
  size?: number;
  facilityType?: string;
  facilityGrade?: string;
  region?: string;
  searchKeyword?: string;
  sortBy?: 'distance' | 'rating' | 'review';
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface FacilityRecommendation {
  facilityId: number;
  facilityName: string;
  facilityType: string;
  facilityGrade?: string;
  region: string;
  district: string;
  matchingScore: number;
  recommendationReason: string;
  distance?: string;
}

export interface FacilityFilterOptions {
  facilityTypes: string[];
  facilityGrades: string[];
  regions: string[];
  priceRanges: {
    min: number;
    max: number;
    label: string;
  }[];
}