/**
 * 리뷰 API 서비스
 * 백엔드 ReviewService와 완전 동기화된 API 클라이언트
 */
import { apiClient } from '../shared/api/client';
import {
  Review,
  ReviewCreateRequest,
  ReviewUpdateRequest,
  ReviewResponse,
  ReviewStatistics,
  ReviewFilter,
  ReviewSort,
  ReportReason,
  AdminResponseRequest
} from '../types/review';

/**
 * 시설별 리뷰 조회 (기본)
 */
export const getFacilityReviews = async (
  facilityId: number,
  page: number = 0,
  size: number = 10
): Promise<ReviewResponse> => {
  const response = await apiClient.get(
    `/reviews/facility/${facilityId}?page=${page}&size=${size}`
  );
  return response.data;
};

/**
 * 최신 리뷰 조회
 */
export const getLatestReviews = async (
  facilityId: number,
  page: number = 0,
  size: number = 10
): Promise<ReviewResponse> => {
  const response = await apiClient.get(
    `/reviews/facility/${facilityId}/latest?page=${page}&size=${size}`
  );
  return response.data;
};

/**
 * 베스트 리뷰 조회 (도움됨 투표 기준)
 */
export const getBestReviews = async (
  facilityId: number,
  page: number = 0,
  size: number = 10
): Promise<ReviewResponse> => {
  const response = await apiClient.get(
    `/reviews/facility/${facilityId}/best?page=${page}&size=${size}`
  );
  return response.data;
};

/**
 * 리뷰 상세 조회
 */
export const getReviewById = async (reviewId: number): Promise<Review> => {
  const response = await apiClient.get(`/reviews/${reviewId}`);
  return response.data;
};

/**
 * 새 리뷰 작성
 */
export const createReview = async (
  facilityId: number,
  request: ReviewCreateRequest
): Promise<Review> => {
  const response = await apiClient.post(`/reviews/facility/${facilityId}`, request);
  return response.data;
};

/**
 * 리뷰 수정
 */
export const updateReview = async (
  reviewId: number,
  request: ReviewUpdateRequest
): Promise<Review> => {
  const response = await apiClient.put(`/reviews/${reviewId}`, request);
  return response.data;
};

/**
 * 리뷰 삭제
 */
export const deleteReview = async (reviewId: number): Promise<void> => {
  await apiClient.delete(`/reviews/${reviewId}`);
};

/**
 * 도움됨 투표
 */
export const voteHelpful = async (reviewId: number): Promise<void> => {
  await apiClient.post(`/reviews/${reviewId}/vote/helpful`);
};

/**
 * 도움안됨 투표
 */
export const voteNotHelpful = async (reviewId: number): Promise<void> => {
  await apiClient.post(`/reviews/${reviewId}/vote/not-helpful`);
};

/**
 * 리뷰 신고
 */
export const reportReview = async (
  reviewId: number,
  reason: ReportReason,
  description?: string
): Promise<void> => {
  await apiClient.post(`/reviews/${reviewId}/report`, {
    reason,
    description
  });
};

/**
 * 시설 평균 평점 조회
 */
export const getFacilityAverageRating = async (facilityId: number): Promise<number> => {
  const response = await apiClient.get(`/reviews/facility/${facilityId}/rating`);
  return response.data;
};

/**
 * 시설 리뷰 수 조회
 */
export const getFacilityReviewCount = async (facilityId: number): Promise<number> => {
  const response = await apiClient.get(`/reviews/facility/${facilityId}/count`);
  return response.data;
};

/**
 * 시설 추천 비율 조회
 */
export const getFacilityRecommendationPercentage = async (facilityId: number): Promise<number> => {
  const response = await apiClient.get(`/reviews/facility/${facilityId}/recommendation-percentage`);
  return response.data;
};

/**
 * 평점 범위로 리뷰 검색
 */
export const getReviewsByRating = async (
  facilityId: number,
  minRating: number,
  maxRating: number,
  page: number = 0,
  size: number = 10
): Promise<ReviewResponse> => {
  const response = await apiClient.get(
    `/reviews/facility/${facilityId}/rating-range?minRating=${minRating}&maxRating=${maxRating}&page=${page}&size=${size}`
  );
  return response.data;
};

/**
 * 검증된 리뷰만 조회
 */
export const getVerifiedReviews = async (
  facilityId: number,
  page: number = 0,
  size: number = 10
): Promise<ReviewResponse> => {
  const response = await apiClient.get(
    `/reviews/facility/${facilityId}/verified?page=${page}&size=${size}`
  );
  return response.data;
};

/**
 * 이미지 포함 리뷰 조회
 */
export const getReviewsWithImages = async (
  facilityId: number,
  page: number = 0,
  size: number = 10
): Promise<ReviewResponse> => {
  const response = await apiClient.get(
    `/reviews/facility/${facilityId}/with-images?page=${page}&size=${size}`
  );
  return response.data;
};

/**
 * 리뷰 필터링 및 정렬 조회
 */
export const getFilteredReviews = async (
  facilityId: number,
  filter: ReviewFilter,
  sort: ReviewSort = ReviewSort.LATEST,
  page: number = 0,
  size: number = 10
): Promise<ReviewResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sort: sort
  });

  // 필터 조건 추가
  if (filter.reviewType) params.append('reviewType', filter.reviewType);
  if (filter.minRating) params.append('minRating', filter.minRating.toString());
  if (filter.maxRating) params.append('maxRating', filter.maxRating.toString());
  if (filter.verified !== undefined) params.append('verified', filter.verified.toString());
  if (filter.hasImages !== undefined) params.append('hasImages', filter.hasImages.toString());
  if (filter.recommended !== undefined) params.append('recommended', filter.recommended.toString());

  const response = await apiClient.get(
    `/reviews/facility/${facilityId}/filtered?${params.toString()}`
  );
  return response.data;
};

/**
 * 시설 리뷰 통계 조회
 */
export const getFacilityReviewStatistics = async (facilityId: number): Promise<ReviewStatistics> => {
  const response = await apiClient.get(`/reviews/facility/${facilityId}/statistics`);
  return response.data;
};

/**
 * 관리자용 - 신고된 리뷰 조회
 */
export const getReportedReviews = async (
  page: number = 0,
  size: number = 10
): Promise<ReviewResponse> => {
  const response = await apiClient.get(`/admin/reviews/reported?page=${page}&size=${size}`);
  return response.data;
};

/**
 * 관리자용 - 리뷰에 관리자 응답 추가
 */
export const addAdminResponse = async (
  reviewId: number,
  request: AdminResponseRequest
): Promise<Review> => {
  const response = await apiClient.post(`/admin/reviews/${reviewId}/response`, request);
  return response.data;
};

/**
 * 관리자용 - 리뷰 차단
 */
export const blockReview = async (reviewId: number): Promise<Review> => {
  const response = await apiClient.post(`/admin/reviews/${reviewId}/block`);
  return response.data;
};

/**
 * 관리자용 - 리뷰 활성화
 */
export const activateReview = async (reviewId: number): Promise<Review> => {
  const response = await apiClient.post(`/admin/reviews/${reviewId}/activate`);
  return response.data;
};

/**
 * 관리자용 - 리뷰 검증 상태 변경
 */
export const setReviewVerified = async (
  reviewId: number,
  verified: boolean
): Promise<Review> => {
  const response = await apiClient.patch(`/admin/reviews/${reviewId}/verified`, { verified });
  return response.data;
};

/**
 * 내가 작성한 리뷰 목록 조회
 */
export const getMyReviews = async (
  page: number = 0,
  size: number = 10
): Promise<ReviewResponse> => {
  const response = await apiClient.get(`/reviews/my?page=${page}&size=${size}`);
  return response.data;
};

/**
 * 리뷰 이미지 업로드
 */
export const uploadReviewImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post('/reviews/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data.imageUrl;
};

/**
 * 리뷰 이미지 삭제
 */
export const deleteReviewImage = async (imageUrl: string): Promise<void> => {
  await apiClient.delete(`/reviews/delete-image?imageUrl=${encodeURIComponent(imageUrl)}`);
};

/**
 * 리뷰 작성 가능 여부 확인
 */
export const canWriteReview = async (facilityId: number): Promise<boolean> => {
  try {
    const response = await apiClient.get(`/reviews/facility/${facilityId}/can-write`);
    return response.data.canWrite;
  } catch (error) {
    return false;
  }
};

/**
 * 리뷰 API 에러 처리 헬퍼
 */
export const handleReviewApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  switch (error.response?.status) {
    case 400:
      return '잘못된 요청입니다. 입력 정보를 확인해주세요.';
    case 401:
      return '로그인이 필요합니다.';
    case 403:
      return '권한이 없습니다.';
    case 404:
      return '리뷰를 찾을 수 없습니다.';
    case 409:
      return '이미 리뷰를 작성하셨거나 중복된 요청입니다.';
    case 500:
      return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    default:
      return '알 수 없는 오류가 발생했습니다.';
  }
};