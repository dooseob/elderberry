import { BaseEntity } from 'shared/types';
import type { Member } from 'entities/auth';
import type { FacilityProfile } from 'entities/facility';

/**
 * 리뷰 타입
 */
export enum ReviewType {
  FACILITY = 'FACILITY',
  SERVICE = 'SERVICE',
  CAREGIVER = 'CAREGIVER',
  PROGRAM = 'PROGRAM'
}

/**
 * 리뷰 상태
 */
export enum ReviewStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  BLOCKED = 'BLOCKED',
  DELETED = 'DELETED'
}

/**
 * 투표 유형
 */
export enum VoteType {
  HELPFUL = 'HELPFUL',
  NOT_HELPFUL = 'NOT_HELPFUL'
}

/**
 * 신고 사유
 */
export enum ReportCategory {
  SPAM = 'SPAM',
  INAPPROPRIATE = 'INAPPROPRIATE',
  FAKE = 'FAKE',
  OFFENSIVE = 'OFFENSIVE',
  COPYRIGHT = 'COPYRIGHT',
  OTHER = 'OTHER'
}

/**
 * 리뷰 엔티티
 */
export interface Review extends BaseEntity {
  id: number;
  reviewer: Member;
  facility: FacilityProfile;
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
  visitDate?: string; // ISO date string
  serviceDurationDays?: number;
  helpfulCount: number;
  notHelpfulCount: number;
  reportCount: number;
  adminResponse?: string;
  adminResponseDate?: string; // ISO date string
  adminResponder?: Member;
  verified: boolean;
  anonymous: boolean;
  imageUrls: string[];
  tags: string[];
  
  // Computed properties
  reviewerDisplayName: string;
  facilityName: string;
  averageDetailRating: number;
  hasImages: boolean;
  hasTags: boolean;
  hasAdminResponse: boolean;
  isActive: boolean;
  isEditable: boolean;
}

/**
 * 리뷰 투표 엔티티
 */
export interface ReviewVote extends BaseEntity {
  id: number;
  review: Review;
  voter: Member;
  voteType: VoteType;
}

/**
 * 리뷰 신고 엔티티
 */
export interface ReviewReport extends BaseEntity {
  id: number;
  review: Review;
  reporter: Member;
  category: ReportCategory;
  reason: string;
  status: 'PENDING' | 'REVIEWED' | 'DISMISSED';
  reviewedBy?: Member;
  reviewedAt?: string; // ISO date string
  adminNotes?: string;
}

/**
 * 리뷰 생성 요청
 */
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
  reviewType: ReviewType;
  recommended: boolean;
  visitDate?: string;
  serviceDurationDays?: number;
  anonymous?: boolean;
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
  visitDate?: string;
  serviceDurationDays?: number;
  imageUrls?: string[];
  tags?: string[];
}

/**
 * 리뷰 투표 요청
 */
export interface ReviewVoteRequest {
  reviewId: number;
  voteType: VoteType;
}

/**
 * 리뷰 신고 요청
 */
export interface ReviewReportRequest {
  reviewId: number;
  category: ReportCategory;
  reason: string;
}

/**
 * 관리자 응답 요청
 */
export interface AdminResponseRequest {
  response: string;
}

/**
 * 리뷰 검색 필터
 */
export interface ReviewSearchFilters {
  facilityId?: number;
  reviewType?: ReviewType;
  status?: ReviewStatus;
  minRating?: number;
  maxRating?: number;
  verified?: boolean;
  hasImages?: boolean;
  sortBy?: 'createdAt' | 'rating' | 'helpful' | 'visitDate';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

/**
 * 리뷰 목록 응답
 */
export interface ReviewResponse {
  content: Review[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

/**
 * 리뷰 통계
 */
export interface ReviewStatistics {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<number, number>; // 1-5점별 리뷰 수
  verifiedReviewsCount: number;
  totalHelpfulVotes: number;
  averageServiceQuality: number;
  averageFacilityRating: number;
  averageStaffRating: number;
  averagePriceRating: number;
  averageAccessibilityRating: number;
  recommendationRate: number; // 추천 비율 (0-100)
  mostCommonTags: Array<{ tag: string; count: number }>;
}

/**
 * 리뷰 타입별 디스플레이 명
 */
export const REVIEW_TYPE_LABELS: Record<ReviewType, string> = {
  [ReviewType.FACILITY]: '시설 리뷰',
  [ReviewType.SERVICE]: '서비스 리뷰',
  [ReviewType.CAREGIVER]: '요양보호사 리뷰',
  [ReviewType.PROGRAM]: '프로그램 리뷰'
};

/**
 * 리뷰 상태별 디스플레이 명
 */
export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  [ReviewStatus.ACTIVE]: '활성',
  [ReviewStatus.PENDING]: '검토중',
  [ReviewStatus.BLOCKED]: '차단됨',
  [ReviewStatus.DELETED]: '삭제됨'
};

/**
 * 신고 사유별 디스플레이 명
 */
export const REPORT_CATEGORY_LABELS: Record<ReportCategory, string> = {
  [ReportCategory.SPAM]: '스팸',
  [ReportCategory.INAPPROPRIATE]: '부적절한 내용',
  [ReportCategory.FAKE]: '가짜 리뷰',
  [ReportCategory.OFFENSIVE]: '모욕적 내용',
  [ReportCategory.COPYRIGHT]: '저작권 침해',
  [ReportCategory.OTHER]: '기타'
};

/**
 * 평점 색상 매핑
 */
export const RATING_COLORS = {
  1: '#ef4444', // red-500
  2: '#f97316', // orange-500
  3: '#eab308', // yellow-500
  4: '#22c55e', // green-500
  5: '#10b981'  // emerald-500
};

/**
 * 평점별 라벨
 */
export const RATING_LABELS = {
  1: '매우 불만',
  2: '불만',
  3: '보통',
  4: '만족',
  5: '매우 만족'
};
