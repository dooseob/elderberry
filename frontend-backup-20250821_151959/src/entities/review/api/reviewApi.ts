/**
 * Review API Client
 * FSD 아키텍처: 리뷰 API 통신 계층
 */

import { apiClient } from '../../../shared/api';
import type {
  ReviewResponse,
  ReviewCreateRequest,
  ReviewUpdateRequest,
  ReviewPage,
  ReviewFilters,
  ReviewVote,
  ReviewReport,
  ReviewStatistics
} from '../model/types';

export class ReviewApi {
  private readonly baseUrl = '/api/reviews';

  /**
   * 내 리뷰 목록 조회
   */
  async getMyReviews(filters: ReviewFilters = {}): Promise<ReviewPage> {
    try {
      const params = new URLSearchParams();
      
      if (filters.page !== undefined) params.append('page', filters.page.toString());
      if (filters.size !== undefined) params.append('size', filters.size.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      
      const response = await apiClient.get<ReviewPage>(`${this.baseUrl}/my?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('내 리뷰 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 시설 리뷰 목록 조회
   */
  async getFacilityReviews(
    facilityId: number, 
    filters: ReviewFilters = {}
  ): Promise<ReviewPage> {
    try {
      const params = new URLSearchParams();
      
      if (filters.page !== undefined) params.append('page', filters.page.toString());
      if (filters.size !== undefined) params.append('size', filters.size.toString());
      if (filters.rating !== undefined) params.append('minRating', filters.rating.toString());
      if (filters.verified !== undefined) params.append('verified', filters.verified.toString());
      if (filters.recommended !== undefined) params.append('recommended', filters.recommended.toString());
      if (filters.hasImages !== undefined) params.append('hasImages', filters.hasImages.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      
      const response = await apiClient.get<ReviewPage>(
        `${this.baseUrl}/facility/${facilityId}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error(`시설 리뷰 목록 조회 실패 (시설 ID: ${facilityId}):`, error);
      throw error;
    }
  }

  /**
   * 리뷰 상세 조회
   */
  async getReviewById(reviewId: number): Promise<ReviewResponse> {
    try {
      const response = await apiClient.get<ReviewResponse>(`${this.baseUrl}/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error(`리뷰 상세 조회 실패 (ID: ${reviewId}):`, error);
      throw error;
    }
  }

  /**
   * 새 리뷰 작성
   */
  async createReview(request: ReviewCreateRequest): Promise<{ id: number; message: string }> {
    try {
      const response = await apiClient.post<{ id: number; message: string }>(
        this.baseUrl, 
        request
      );
      return response.data;
    } catch (error) {
      console.error('리뷰 작성 실패:', error);
      throw error;
    }
  }

  /**
   * 리뷰 수정
   */
  async updateReview(
    reviewId: number, 
    request: ReviewUpdateRequest
  ): Promise<ReviewResponse> {
    try {
      const response = await apiClient.put<ReviewResponse>(
        `${this.baseUrl}/${reviewId}`, 
        request
      );
      return response.data;
    } catch (error) {
      console.error(`리뷰 수정 실패 (ID: ${reviewId}):`, error);
      throw error;
    }
  }

  /**
   * 리뷰 삭제
   */
  async deleteReview(reviewId: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${reviewId}`);
    } catch (error) {
      console.error(`리뷰 삭제 실패 (ID: ${reviewId}):`, error);
      throw error;
    }
  }

  /**
   * 리뷰 투표 (도움됨/안됨)
   */
  async voteReview(vote: ReviewVote): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(
        `${this.baseUrl}/${vote.reviewId}/vote`, 
        { voteType: vote.voteType }
      );
      return response.data;
    } catch (error) {
      console.error('리뷰 투표 실패:', error);
      throw error;
    }
  }

  /**
   * 리뷰 신고
   */
  async reportReview(report: ReviewReport): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(
        `${this.baseUrl}/${report.reviewId}/report`, 
        { 
          reason: report.reason,
          description: report.description 
        }
      );
      return response.data;
    } catch (error) {
      console.error('리뷰 신고 실패:', error);
      throw error;
    }
  }

  /**
   * 시설 리뷰 통계 조회
   */
  async getFacilityReviewStatistics(facilityId: number): Promise<ReviewStatistics> {
    try {
      const response = await apiClient.get<ReviewStatistics>(
        `${this.baseUrl}/facility/${facilityId}/statistics`
      );
      return response.data;
    } catch (error) {
      console.error(`리뷰 통계 조회 실패 (시설 ID: ${facilityId}):`, error);
      throw error;
    }
  }

  /**
   * 이미지 업로드 (선택적 기능)
   */
  async uploadReviewImage(file: File): Promise<{ imageUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await apiClient.post<{ imageUrl: string }>(
        `${this.baseUrl}/upload-image`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('리뷰 이미지 업로드 실패:', error);
      throw error;
    }
  }

  /**
   * 추천 태그 조회
   */
  async getRecommendedTags(facilityId?: number): Promise<string[]> {
    try {
      const url = facilityId 
        ? `${this.baseUrl}/tags/recommended?facilityId=${facilityId}`
        : `${this.baseUrl}/tags/recommended`;
        
      const response = await apiClient.get<string[]>(url);
      return response.data;
    } catch (error) {
      console.error('추천 태그 조회 실패:', error);
      return [
        '친절한 직원', '청결한 시설', '전문적인 케어', '맛있는 식사',
        '편리한 위치', '다양한 프로그램', '안전한 환경', '합리적인 가격'
      ];
    }
  }

  /**
   * 리뷰 작성 가능 여부 확인
   */
  async canWriteReview(facilityId: number): Promise<{ canWrite: boolean; reason?: string }> {
    try {
      const response = await apiClient.get<{ canWrite: boolean; reason?: string }>(
        `${this.baseUrl}/facility/${facilityId}/can-write`
      );
      return response.data;
    } catch (error) {
      console.error('리뷰 작성 가능 여부 확인 실패:', error);
      return { canWrite: true }; // 기본적으로 작성 가능으로 처리
    }
  }
}

export const reviewApi = new ReviewApi();