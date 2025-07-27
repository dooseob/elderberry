/**
 * 리뷰 상태 관리 스토어 (Zustand)
 * 리뷰 CRUD, 투표, 신고, 필터링 등 모든 리뷰 관련 상태 관리
 */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
  Review,
  ReviewCreateRequest,
  ReviewUpdateRequest,
  ReviewResponse,
  ReviewStatistics,
  ReviewFilter,
  ReviewSort,
  ReportReason
} from '../types/review';
import * as reviewApi from '../services/reviewApi';

/**
 * 리뷰 스토어 상태 인터페이스
 */
interface ReviewState {
  // 리뷰 데이터
  reviews: Review[];
  currentReview: Review | null;
  reviewStatistics: ReviewStatistics | null;
  
  // 페이징 정보
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  
  // 필터 및 정렬
  currentFilter: ReviewFilter;
  currentSort: ReviewSort;
  
  // 로딩 상태
  loading: {
    reviews: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    vote: boolean;
    report: boolean;
    statistics: boolean;
  };
  
  // 에러 상태
  error: string | null;
  
  // 선택된 시설
  selectedFacilityId: number | null;
  
  // 내 리뷰 관련
  myReviews: Review[];
  myReviewsPagination: {
    page: number;
    totalElements: number;
    totalPages: number;
  };
}

/**
 * 리뷰 스토어 액션 인터페이스
 */
interface ReviewActions {
  // 기본 CRUD 작업
  loadReviews: (facilityId: number, page?: number, size?: number) => Promise<void>;
  loadReviewById: (reviewId: number) => Promise<void>;
  createReview: (facilityId: number, request: ReviewCreateRequest) => Promise<Review>;
  updateReview: (reviewId: number, request: ReviewUpdateRequest) => Promise<Review>;
  deleteReview: (reviewId: number) => Promise<void>;
  
  // 특별한 리뷰 조회
  loadLatestReviews: (facilityId: number, page?: number) => Promise<void>;
  loadBestReviews: (facilityId: number, page?: number) => Promise<void>;
  loadVerifiedReviews: (facilityId: number, page?: number) => Promise<void>;
  loadReviewsWithImages: (facilityId: number, page?: number) => Promise<void>;
  
  // 필터링 및 정렬
  applyFilter: (filter: ReviewFilter) => Promise<void>;
  changeSort: (sort: ReviewSort) => Promise<void>;
  loadFilteredReviews: (facilityId: number, filter: ReviewFilter, sort: ReviewSort, page?: number) => Promise<void>;
  clearFilter: () => void;
  
  // 투표 기능
  voteHelpful: (reviewId: number) => Promise<void>;
  voteNotHelpful: (reviewId: number) => Promise<void>;
  
  // 신고 기능
  reportReview: (reviewId: number, reason: ReportReason, description?: string) => Promise<void>;
  
  // 통계 조회
  loadReviewStatistics: (facilityId: number) => Promise<void>;
  
  // 내 리뷰 관리
  loadMyReviews: (page?: number) => Promise<void>;
  
  // 관리자 기능
  addAdminResponse: (reviewId: number, response: string) => Promise<void>;
  blockReview: (reviewId: number) => Promise<void>;
  activateReview: (reviewId: number) => Promise<void>;
  setReviewVerified: (reviewId: number, verified: boolean) => Promise<void>;
  
  // 유틸리티 함수
  setSelectedFacility: (facilityId: number | null) => void;
  clearCurrentReview: () => void;
  clearError: () => void;
  resetStore: () => void;
  
  // 페이징
  goToPage: (page: number) => Promise<void>;
  goToNextPage: () => Promise<void>;
  goToPreviousPage: () => Promise<void>;
}

/**
 * 초기 상태
 */
const initialState: ReviewState = {
  reviews: [],
  currentReview: null,
  reviewStatistics: null,
  pagination: {
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false
  },
  currentFilter: {},
  currentSort: ReviewSort.LATEST,
  loading: {
    reviews: false,
    create: false,
    update: false,
    delete: false,
    vote: false,
    report: false,
    statistics: false
  },
  error: null,
  selectedFacilityId: null,
  myReviews: [],
  myReviewsPagination: {
    page: 0,
    totalElements: 0,
    totalPages: 0
  }
};

/**
 * 리뷰 스토어 생성
 */
export const useReviewStore = create<ReviewState & ReviewActions>()(
  immer((set, get) => ({
    ...initialState,

    // 기본 CRUD 작업
    loadReviews: async (facilityId: number, page = 0, size = 10) => {
      set((state) => {
        state.loading.reviews = true;
        state.error = null;
        state.selectedFacilityId = facilityId;
      });

      try {
        const response = await reviewApi.getFacilityReviews(facilityId, page, size);
        
        set((state) => {
          state.reviews = response.content;
          state.pagination = {
            page: response.number,
            size: response.size,
            totalElements: response.totalElements,
            totalPages: response.totalPages,
            hasNext: !response.last,
            hasPrevious: !response.first
          };
          state.loading.reviews = false;
        });
      } catch (error: any) {
        set((state) => {
          state.error = reviewApi.handleReviewApiError(error);
          state.loading.reviews = false;
        });
      }
    },

    loadReviewById: async (reviewId: number) => {
      set((state) => {
        state.loading.reviews = true;
        state.error = null;
      });

      try {
        const review = await reviewApi.getReviewById(reviewId);
        
        set((state) => {
          state.currentReview = review;
          state.loading.reviews = false;
        });
      } catch (error: any) {
        set((state) => {
          state.error = reviewApi.handleReviewApiError(error);
          state.loading.reviews = false;
        });
      }
    },

    createReview: async (facilityId: number, request: ReviewCreateRequest) => {
      set((state) => {
        state.loading.create = true;
        state.error = null;
      });

      try {
        const newReview = await reviewApi.createReview(facilityId, request);
        
        set((state) => {
          state.reviews.unshift(newReview);
          state.loading.create = false;
        });

        return newReview;
      } catch (error: any) {
        set((state) => {
          state.error = reviewApi.handleReviewApiError(error);
          state.loading.create = false;
        });
        throw error;
      }
    },

    updateReview: async (reviewId: number, request: ReviewUpdateRequest) => {
      set((state) => {
        state.loading.update = true;
        state.error = null;
      });

      try {
        const updatedReview = await reviewApi.updateReview(reviewId, request);
        
        set((state) => {
          const index = state.reviews.findIndex(review => review.id === reviewId);
          if (index !== -1) {
            state.reviews[index] = updatedReview;
          }
          if (state.currentReview?.id === reviewId) {
            state.currentReview = updatedReview;
          }
          state.loading.update = false;
        });

        return updatedReview;
      } catch (error: any) {
        set((state) => {
          state.error = reviewApi.handleReviewApiError(error);
          state.loading.update = false;
        });
        throw error;
      }
    },

    deleteReview: async (reviewId: number) => {
      set((state) => {
        state.loading.delete = true;
        state.error = null;
      });

      try {
        await reviewApi.deleteReview(reviewId);
        
        set((state) => {
          state.reviews = state.reviews.filter(review => review.id !== reviewId);
          if (state.currentReview?.id === reviewId) {
            state.currentReview = null;
          }
          state.loading.delete = false;
        });
      } catch (error: any) {
        set((state) => {
          state.error = reviewApi.handleReviewApiError(error);
          state.loading.delete = false;
        });
        throw error;
      }
    },

    // 특별한 리뷰 조회
    loadLatestReviews: async (facilityId: number, page = 0) => {
      set((state) => {
        state.loading.reviews = true;
        state.error = null;
        state.selectedFacilityId = facilityId;
        state.currentSort = ReviewSort.LATEST;
      });

      try {
        const response = await reviewApi.getLatestReviews(facilityId, page, get().pagination.size);
        
        set((state) => {
          state.reviews = response.content;
          state.pagination.page = response.number;
          state.pagination.totalElements = response.totalElements;
          state.pagination.totalPages = response.totalPages;
          state.pagination.hasNext = !response.last;
          state.pagination.hasPrevious = !response.first;
          state.loading.reviews = false;
        });
      } catch (error: any) {
        set((state) => {
          state.error = reviewApi.handleReviewApiError(error);
          state.loading.reviews = false;
        });
      }
    },

    loadBestReviews: async (facilityId: number, page = 0) => {
      set((state) => {
        state.loading.reviews = true;
        state.error = null;
        state.selectedFacilityId = facilityId;
        state.currentSort = ReviewSort.MOST_HELPFUL;
      });

      try {
        const response = await reviewApi.getBestReviews(facilityId, page, get().pagination.size);
        
        set((state) => {
          state.reviews = response.content;
          state.pagination.page = response.number;
          state.pagination.totalElements = response.totalElements;
          state.pagination.totalPages = response.totalPages;
          state.pagination.hasNext = !response.last;
          state.pagination.hasPrevious = !response.first;
          state.loading.reviews = false;
        });
      } catch (error: any) {
        set((state) => {
          state.error = reviewApi.handleReviewApiError(error);
          state.loading.reviews = false;
        });
      }
    },

    loadVerifiedReviews: async (facilityId: number, page = 0) => {
      set((state) => {
        state.loading.reviews = true;
        state.error = null;
        state.selectedFacilityId = facilityId;
        state.currentFilter = { ...state.currentFilter, verified: true };
      });

      try {
        const response = await reviewApi.getVerifiedReviews(facilityId, page, get().pagination.size);
        
        set((state) => {
          state.reviews = response.content;
          state.pagination.page = response.number;
          state.pagination.totalElements = response.totalElements;
          state.pagination.totalPages = response.totalPages;
          state.pagination.hasNext = !response.last;
          state.pagination.hasPrevious = !response.first;
          state.loading.reviews = false;
        });
      } catch (error: any) {
        set((state) => {
          state.error = reviewApi.handleReviewApiError(error);
          state.loading.reviews = false;
        });
      }
    },

    loadReviewsWithImages: async (facilityId: number, page = 0) => {
      set((state) => {
        state.loading.reviews = true;
        state.error = null;
        state.selectedFacilityId = facilityId;
        state.currentFilter = { ...state.currentFilter, hasImages: true };
      });

      try {
        const response = await reviewApi.getReviewsWithImages(facilityId, page, get().pagination.size);
        
        set((state) => {
          state.reviews = response.content;
          state.pagination.page = response.number;
          state.pagination.totalElements = response.totalElements;
          state.pagination.totalPages = response.totalPages;
          state.pagination.hasNext = !response.last;
          state.pagination.hasPrevious = !response.first;
          state.loading.reviews = false;
        });
      } catch (error: any) {
        set((state) => {
          state.error = reviewApi.handleReviewApiError(error);
          state.loading.reviews = false;
        });
      }
    },

    // 필터링 및 정렬
    applyFilter: async (filter: ReviewFilter) => {
      const { selectedFacilityId, currentSort, pagination } = get();
      if (!selectedFacilityId) return;

      set((state) => {
        state.currentFilter = filter;
      });

      await get().loadFilteredReviews(selectedFacilityId, filter, currentSort, 0);
    },

    changeSort: async (sort: ReviewSort) => {
      const { selectedFacilityId, currentFilter } = get();
      if (!selectedFacilityId) return;

      set((state) => {
        state.currentSort = sort;
      });

      await get().loadFilteredReviews(selectedFacilityId, currentFilter, sort, 0);
    },

    loadFilteredReviews: async (facilityId: number, filter: ReviewFilter, sort: ReviewSort, page = 0) => {
      set((state) => {
        state.loading.reviews = true;
        state.error = null;
        state.selectedFacilityId = facilityId;
        state.currentFilter = filter;
        state.currentSort = sort;
      });

      try {
        const response = await reviewApi.getFilteredReviews(facilityId, filter, sort, page, get().pagination.size);
        
        set((state) => {
          state.reviews = response.content;
          state.pagination.page = response.number;
          state.pagination.totalElements = response.totalElements;
          state.pagination.totalPages = response.totalPages;
          state.pagination.hasNext = !response.last;
          state.pagination.hasPrevious = !response.first;
          state.loading.reviews = false;
        });
      } catch (error: any) {
        set((state) => {
          state.error = reviewApi.handleReviewApiError(error);
          state.loading.reviews = false;
        });
      }
    },

    clearFilter: () => {
      set((state) => {
        state.currentFilter = {};
      });
    },

    // 투표 기능
    voteHelpful: async (reviewId: number) => {
      set((state) => {
        state.loading.vote = true;
        state.error = null;
      });

      try {
        await reviewApi.voteHelpful(reviewId);
        
        set((state) => {
          const review = state.reviews.find(r => r.id === reviewId);
          if (review) {
            review.helpfulCount += 1;
          }
          if (state.currentReview?.id === reviewId) {
            state.currentReview.helpfulCount += 1;
          }
          state.loading.vote = false;
        });
      } catch (error: any) {
        set((state) => {
          state.error = reviewApi.handleReviewApiError(error);
          state.loading.vote = false;
        });
        throw error;
      }
    },

    voteNotHelpful: async (reviewId: number) => {
      set((state) => {
        state.loading.vote = true;
        state.error = null;
      });

      try {
        await reviewApi.voteNotHelpful(reviewId);
        
        set((state) => {
          const review = state.reviews.find(r => r.id === reviewId);
          if (review) {
            review.notHelpfulCount += 1;
          }
          if (state.currentReview?.id === reviewId) {
            state.currentReview.notHelpfulCount += 1;
          }
          state.loading.vote = false;
        });
      } catch (error: any) {
        set((state) => {
          state.error = reviewApi.handleReviewApiError(error);
          state.loading.vote = false;
        });
        throw error;
      }
    },

    // 신고 기능
    reportReview: async (reviewId: number, reason: ReportReason, description?: string) => {
      set((state) => {
        state.loading.report = true;
        state.error = null;
      });

      try {
        await reviewApi.reportReview(reviewId, reason, description);
        
        set((state) => {
          const review = state.reviews.find(r => r.id === reviewId);
          if (review) {
            review.reportCount += 1;
          }
          if (state.currentReview?.id === reviewId) {
            state.currentReview.reportCount += 1;
          }
          state.loading.report = false;
        });
      } catch (error: any) {
        set((state) => {
          state.error = reviewApi.handleReviewApiError(error);
          state.loading.report = false;
        });
        throw error;
      }
    },

    // 통계 조회
    loadReviewStatistics: async (facilityId: number) => {
      set((state) => {
        state.loading.statistics = true;
        state.error = null;
      });

      try {
        const statistics = await reviewApi.getFacilityReviewStatistics(facilityId);
        
        set((state) => {
          state.reviewStatistics = statistics;
          state.loading.statistics = false;
        });
      } catch (error: any) {
        set((state) => {
          state.error = reviewApi.handleReviewApiError(error);
          state.loading.statistics = false;
        });
      }
    },

    // 내 리뷰 관리
    loadMyReviews: async (page = 0) => {
      set((state) => {
        state.loading.reviews = true;
        state.error = null;
      });

      try {
        const response = await reviewApi.getMyReviews(page, 10);
        
        set((state) => {
          state.myReviews = response.content;
          state.myReviewsPagination = {
            page: response.number,
            totalElements: response.totalElements,
            totalPages: response.totalPages
          };
          state.loading.reviews = false;
        });
      } catch (error: any) {
        set((state) => {
          state.error = reviewApi.handleReviewApiError(error);
          state.loading.reviews = false;
        });
      }
    },

    // 관리자 기능
    addAdminResponse: async (reviewId: number, response: string) => {
      set((state) => {
        state.loading.update = true;
        state.error = null;
      });

      try {
        const updatedReview = await reviewApi.addAdminResponse(reviewId, { response });
        
        set((state) => {
          const index = state.reviews.findIndex(review => review.id === reviewId);
          if (index !== -1) {
            state.reviews[index] = updatedReview;
          }
          if (state.currentReview?.id === reviewId) {
            state.currentReview = updatedReview;
          }
          state.loading.update = false;
        });
      } catch (error: any) {
        set((state) => {
          state.error = reviewApi.handleReviewApiError(error);
          state.loading.update = false;
        });
        throw error;
      }
    },

    blockReview: async (reviewId: number) => {
      try {
        const updatedReview = await reviewApi.blockReview(reviewId);
        
        set((state) => {
          const index = state.reviews.findIndex(review => review.id === reviewId);
          if (index !== -1) {
            state.reviews[index] = updatedReview;
          }
          if (state.currentReview?.id === reviewId) {
            state.currentReview = updatedReview;
          }
        });
      } catch (error: any) {
        set((state) => {
          state.error = reviewApi.handleReviewApiError(error);
        });
        throw error;
      }
    },

    activateReview: async (reviewId: number) => {
      try {
        const updatedReview = await reviewApi.activateReview(reviewId);
        
        set((state) => {
          const index = state.reviews.findIndex(review => review.id === reviewId);
          if (index !== -1) {
            state.reviews[index] = updatedReview;
          }
          if (state.currentReview?.id === reviewId) {
            state.currentReview = updatedReview;
          }
        });
      } catch (error: any) {
        set((state) => {
          state.error = reviewApi.handleReviewApiError(error);
        });
        throw error;
      }
    },

    setReviewVerified: async (reviewId: number, verified: boolean) => {
      try {
        const updatedReview = await reviewApi.setReviewVerified(reviewId, verified);
        
        set((state) => {
          const index = state.reviews.findIndex(review => review.id === reviewId);
          if (index !== -1) {
            state.reviews[index] = updatedReview;
          }
          if (state.currentReview?.id === reviewId) {
            state.currentReview = updatedReview;
          }
        });
      } catch (error: any) {
        set((state) => {
          state.error = reviewApi.handleReviewApiError(error);
        });
        throw error;
      }
    },

    // 유틸리티 함수
    setSelectedFacility: (facilityId: number | null) => {
      set((state) => {
        state.selectedFacilityId = facilityId;
      });
    },

    clearCurrentReview: () => {
      set((state) => {
        state.currentReview = null;
      });
    },

    clearError: () => {
      set((state) => {
        state.error = null;
      });
    },

    resetStore: () => {
      set((state) => {
        Object.assign(state, initialState);
      });
    },

    // 페이징
    goToPage: async (page: number) => {
      const { selectedFacilityId, currentFilter, currentSort } = get();
      if (!selectedFacilityId) return;

      if (Object.keys(currentFilter).length > 0) {
        await get().loadFilteredReviews(selectedFacilityId, currentFilter, currentSort, page);
      } else {
        await get().loadReviews(selectedFacilityId, page);
      }
    },

    goToNextPage: async () => {
      const { pagination } = get();
      if (pagination.hasNext) {
        await get().goToPage(pagination.page + 1);
      }
    },

    goToPreviousPage: async () => {
      const { pagination } = get();
      if (pagination.hasPrevious) {
        await get().goToPage(pagination.page - 1);
      }
    }
  }))
);