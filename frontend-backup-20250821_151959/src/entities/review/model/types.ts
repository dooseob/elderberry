/**
 * Review Entity - Domain Types
 * FSD 아키텍처: 리뷰 도메인 모델 타입 정의
 */

// 리뷰 타입 열거형
export type ReviewType = 
  | 'FACILITY'      // 시설 리뷰
  | 'SERVICE'       // 서비스 리뷰  
  | 'CAREGIVER'     // 요양보호사 리뷰
  | 'PROGRAM';      // 프로그램 리뷰

// 리뷰 상태
export type ReviewStatus = 
  | 'ACTIVE'        // 활성
  | 'PENDING'       // 검토중
  | 'BLOCKED'       // 차단됨
  | 'DELETED';      // 삭제됨

// 리뷰 기본 정보
export interface Review {
  id: number;
  reviewer: {
    id: number;
    name: string;
  };
  facility: {
    id: number;
    name: string;
  };
  title: string;
  content: string;
  overallRating: number;
  serviceQualityRating?: number;
  facilityRating?: number;
  staffRating?: number;
  priceRating?: number;
  accessibilityRating?: number;
  reviewType: ReviewType;
  status: ReviewStatus;
  recommended: boolean;
  visitDate?: string;
  serviceDurationDays?: number;
  helpfulCount: number;
  notHelpfulCount: number;
  reportCount: number;
  adminResponse?: string;
  adminResponseDate?: string;
  verified: boolean;
  anonymous: boolean;
  imageUrls: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// 리뷰 작성 요청
export interface ReviewCreateRequest {
  facilityId: number;
  title: string;
  content: string;
  overallRating: number;
  serviceQualityRating?: number;
  facilityRating?: number;
  staffRating?: number;
  priceRating?: number;
  accessibilityRating?: number;
  reviewType?: ReviewType;
  recommended?: boolean;
  visitDate?: string;
  serviceDurationDays?: number;
  anonymous?: boolean;
  imageUrls?: string[];
  tags?: string[];
}

// 리뷰 수정 요청
export interface ReviewUpdateRequest {
  title: string;
  content: string;
  overallRating: number;
  serviceQualityRating?: number;
  facilityRating?: number;
  staffRating?: number;
  priceRating?: number;
  accessibilityRating?: number;
  recommended?: boolean;
  visitDate?: string;
  serviceDurationDays?: number;
  anonymous?: boolean;
  imageUrls?: string[];
  tags?: string[];
}

// 리뷰 응답 (API)
export interface ReviewResponse {
  id: number;
  reviewerName: string;
  facilityId?: number;
  facilityName?: string;
  title: string;
  content: string;
  overallRating: number;
  serviceQualityRating?: number;
  facilityRating?: number;
  staffRating?: number;
  priceRating?: number;
  accessibilityRating?: number;
  status: ReviewStatus;
  recommended: boolean;
  visitDate?: string;
  serviceDurationDays?: number;
  helpfulCount: number;
  notHelpfulCount: number;
  anonymous: boolean;
  verified: boolean;
  imageUrls: string[];
  tags: string[];
  adminResponse?: string;
  adminResponseDate?: string;
  createdAt: string;
  updatedAt?: string;
}

// 페이지네이션 응답
export interface ReviewPage {
  content: ReviewResponse[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      property: string;
      direction: 'ASC' | 'DESC';
    };
  };
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

// 리뷰 통계
export interface ReviewStatistics {
  totalCount: number;
  averageRating: number;
  ratingDistribution: {
    [key: string]: number; // "5": 10, "4": 20, etc.
  };
  verifiedCount: number;
  recommendationRate: number;
  mostCommonTags: Array<{
    tag: string;
    count: number;
  }>;
}

// 리뷰 필터
export interface ReviewFilters {
  rating?: number; // 최소 평점
  verified?: boolean; // 검증된 리뷰만
  recommended?: boolean; // 추천 리뷰만
  hasImages?: boolean; // 이미지 포함
  sortBy?: 'createdAt' | 'overallRating' | 'helpfulCount';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  size?: number;
}

// 리뷰 투표 (도움됨/안됨)
export interface ReviewVote {
  reviewId: number;
  voteType: 'HELPFUL' | 'NOT_HELPFUL';
}

// 리뷰 신고
export interface ReviewReport {
  reviewId: number;
  reason: 'SPAM' | 'INAPPROPRIATE' | 'FALSE_INFO' | 'OTHER';
  description?: string;
}

// 별점 정보
export interface RatingBreakdown {
  category: string;
  label: string;
  value?: number;
  description: string;
}

// 리뷰 작성 단계
export type ReviewStepType = 
  | 'facility_select'   // 시설 선택
  | 'basic_info'        // 기본 정보
  | 'ratings'           // 평점
  | 'content'           // 내용 작성
  | 'media'             // 이미지/태그
  | 'final';            // 최종 확인

export interface ReviewStep {
  type: ReviewStepType;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}