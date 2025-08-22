/**
 * 리뷰 시스템 타입 정의
 * 백엔드 Review 엔티티와 완전히 동기화
 */

/**
 * 리뷰 타입 열거형
 */
export enum ReviewType {
  FACILITY = 'FACILITY',        // 시설 리뷰
  SERVICE = 'SERVICE',          // 서비스 리뷰
  CAREGIVER = 'CAREGIVER',      // 요양보호사 리뷰
  PROGRAM = 'PROGRAM'           // 프로그램 리뷰
}

/**
 * 리뷰 상태 열거형
 */
export enum ReviewStatus {
  ACTIVE = 'ACTIVE',            // 활성
  PENDING = 'PENDING',          // 검토중
  BLOCKED = 'BLOCKED',          // 차단됨
  DELETED = 'DELETED'           // 삭제됨
}

/**
 * 리뷰 투표 타입
 */
export enum VoteType {
  HELPFUL = 'HELPFUL',          // 도움됨
  NOT_HELPFUL = 'NOT_HELPFUL'   // 도움안됨
}

/**
 * 신고 사유
 */
export enum ReportReason {
  INAPPROPRIATE_CONTENT = 'INAPPROPRIATE_CONTENT',  // 부적절한 내용
  SPAM = 'SPAM',                                    // 스팸
  FALSE_INFORMATION = 'FALSE_INFORMATION',          // 거짓 정보
  OFFENSIVE_LANGUAGE = 'OFFENSIVE_LANGUAGE',        // 욕설/비방
  PRIVACY_VIOLATION = 'PRIVACY_VIOLATION',          // 개인정보 침해
  COPYRIGHT_VIOLATION = 'COPYRIGHT_VIOLATION',      // 저작권 침해
  OTHER = 'OTHER'                                   // 기타
}

/**
 * 리뷰 정렬 옵션
 */
export enum ReviewSort {
  LATEST = 'latest',            // 최신순
  OLDEST = 'oldest',            // 오래된순
  HIGHEST_RATING = 'highest',   // 평점 높은순
  LOWEST_RATING = 'lowest',     // 평점 낮은순
  MOST_HELPFUL = 'helpful'      // 도움됨 많은순
}

/**
 * 리뷰 필터 옵션
 */
export interface ReviewFilter {
  reviewType?: ReviewType;      // 리뷰 타입
  minRating?: number;           // 최소 평점
  maxRating?: number;           // 최대 평점
  verified?: boolean;           // 검증된 리뷰만
  hasImages?: boolean;          // 이미지 포함 리뷰만
  recommended?: boolean;        // 추천 리뷰만
}

/**
 * 기본 리뷰 인터페이스
 */
export interface Review {
  id: number;
  reviewer: {
    id: number;
    name: string;
    email?: string;
  };
  facility: {
    id: number;
    name: string;
    type: string;
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
  adminResponder?: {
    id: number;
    name: string;
  };
  verified: boolean;
  anonymous: boolean;
  imageUrls: string[];
  tags: string[];
  createdDate: string;
  modifiedDate: string;
  
  // 계산된 속성
  reviewerDisplayName?: string;
  averageDetailRating?: number;
  hasImages?: boolean;
  hasTags?: boolean;
  hasAdminResponse?: boolean;
  isEditable?: boolean;
}

/**
 * 리뷰 작성 요청
 */
export interface ReviewCreateRequest {
  title: string;
  content: string;
  overallRating: number;
  serviceQualityRating?: number;
  facilityRating?: number;
  staffRating?: number;
  priceRating?: number;
  accessibilityRating?: number;
  reviewType: ReviewType;
  recommended: boolean;
  visitDate?: string;
  serviceDurationDays?: number;
  anonymous: boolean;
  imageUrls?: string[];
  tags?: string[];
}

/**
 * 리뷰 수정 요청
 */
export interface ReviewUpdateRequest {
  title?: string;
  content?: string;
  overallRating?: number;
  serviceQualityRating?: number;
  facilityRating?: number;
  staffRating?: number;
  priceRating?: number;
  accessibilityRating?: number;
  recommended?: boolean;
  anonymous?: boolean;
  imageUrls?: string[];
  tags?: string[];
}

/**
 * 리뷰 투표 인터페이스
 */
export interface ReviewVote {
  id: number;
  reviewId: number;
  voterId: number;
  voteType: VoteType;
  createdDate: string;
}

/**
 * 리뷰 신고 인터페이스
 */
export interface ReviewReport {
  id: number;
  reviewId: number;
  reporterId: number;
  reason: ReportReason;
  description?: string;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  createdDate: string;
  resolvedDate?: string;
}

/**
 * 리뷰 통계
 */
export interface ReviewStatistics {
  totalCount: number;
  averageRating: number;
  recommendationPercentage: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  categoryRatings: {
    serviceQuality: number;
    facility: number;
    staff: number;
    price: number;
    accessibility: number;
  };
}

/**
 * 리뷰 응답 (API 응답)
 */
export interface ReviewResponse {
  content: Review[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/**
 * 관리자 응답 요청
 */
export interface AdminResponseRequest {
  response: string;
}

/**
 * 리뷰 태그 옵션
 */
export const REVIEW_TAGS = {
  positive: [
    '친절한 직원',
    '깨끗한 시설',
    '좋은 위치',
    '합리적인 가격',
    '우수한 서비스',
    '편리한 접근성',
    '다양한 프로그램',
    '전문적인 케어',
    '맛있는 식사',
    '안전한 환경'
  ],
  negative: [
    '불친절한 직원',
    '시설 노후',
    '접근성 불편',
    '비싼 가격',
    '서비스 부족',
    '위생 문제',
    '소통 부족',
    '프로그램 부족',
    '식사 불만족',
    '안전 우려'
  ]
};

/**
 * 평점 단계별 표시
 */
export const RATING_LABELS: Record<number, string> = {
  5: '매우 만족',
  4: '만족',
  3: '보통',
  2: '불만족',
  1: '매우 불만족'
};

/**
 * 리뷰 타입별 표시명
 */
export const REVIEW_TYPE_LABELS: Record<ReviewType, string> = {
  [ReviewType.FACILITY]: '시설 리뷰',
  [ReviewType.SERVICE]: '서비스 리뷰',
  [ReviewType.CAREGIVER]: '요양보호사 리뷰',
  [ReviewType.PROGRAM]: '프로그램 리뷰'
};

/**
 * 신고 사유별 표시명
 */
export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  [ReportReason.INAPPROPRIATE_CONTENT]: '부적절한 내용',
  [ReportReason.SPAM]: '스팸',
  [ReportReason.FALSE_INFORMATION]: '거짓 정보',
  [ReportReason.OFFENSIVE_LANGUAGE]: '욕설/비방',
  [ReportReason.PRIVACY_VIOLATION]: '개인정보 침해',
  [ReportReason.COPYRIGHT_VIOLATION]: '저작권 침해',
  [ReportReason.OTHER]: '기타'
};