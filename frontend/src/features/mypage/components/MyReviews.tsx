/**
 * 내가 작성한 리뷰 관리 컴포넌트
 * 사용자가 작성한 모든 리뷰를 조회, 수정, 삭제할 수 있는 기능 제공
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Edit3,
  Trash2,
  Filter,
  Search,
  ChevronDown,
  MapPin,
  Calendar,
  MessageSquare,
  TrendingUp,
  Award,
  AlertCircle,
  Eye,
  ThumbsUp
} from '../../../components/icons/LucideIcons';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { useReviewStore } from '../../../stores/reviewStore';
import { Review, ReviewStatus } from '../../../types/review';

interface ReviewFilter {
  status: ReviewStatus | 'ALL';
  rating: number | null;
  searchQuery: string;
  sortBy: 'latest' | 'oldest' | 'rating_high' | 'rating_low';
}

/**
 * 내 리뷰 관리 컴포넌트
 */
export const MyReviews: React.FC = () => {
  // 상태 관리
  const { 
    reviews, 
    loading, 
    error, 
    fetchMyReviews, 
    updateReview, 
    deleteReview 
  } = useReviewStore();
  
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<ReviewFilter>({
    status: 'ALL',
    rating: null,
    searchQuery: '',
    sortBy: 'latest'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchMyReviews();
  }, [fetchMyReviews]);

  // 필터링 및 정렬
  useEffect(() => {
    let filtered = [...reviews];

    // 상태 필터
    if (filter.status !== 'ALL') {
      filtered = filtered.filter(review => review.status === filter.status);
    }

    // 평점 필터
    if (filter.rating) {
      filtered = filtered.filter(review => review.rating === filter.rating);
    }

    // 검색어 필터
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filtered = filtered.filter(review => 
        review.facilityName?.toLowerCase().includes(query) ||
        review.content.toLowerCase().includes(query)
      );
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (filter.sortBy) {
        case 'latest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'rating_high':
          return b.rating - a.rating;
        case 'rating_low':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    setFilteredReviews(filtered);
  }, [reviews, filter]);

  // 별점 렌더링
  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // 상태별 배지 색상
  const getStatusBadgeColor = (status: ReviewStatus) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 상태별 표시명
  const getStatusDisplayName = (status: ReviewStatus) => {
    switch (status) {
      case 'APPROVED':
        return '승인됨';
      case 'PENDING':
        return '검토 중';
      case 'REJECTED':
        return '반려됨';
      default:
        return '알 수 없음';
    }
  };

  // 리뷰 삭제
  const handleDeleteReview = async (reviewId: number) => {
    try {
      await deleteReview(reviewId);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('리뷰 삭제 실패:', error);
    }
  };

  // 통계 정보
  const getStatistics = () => {
    const total = reviews.length;
    const approved = reviews.filter(r => r.status === 'APPROVED').length;
    const pending = reviews.filter(r => r.status === 'PENDING').length;
    const avgRating = total > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / total 
      : 0;

    return {
      total,
      approved,
      pending,
      avgRating: Math.round(avgRating * 10) / 10
    };
  };

  const stats = getStatistics();

  // 빈 상태
  if (!loading && reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          작성한 리뷰가 없습니다
        </h3>
        <p className="text-gray-600 mb-6">
          이용한 시설에 대한 리뷰를 작성해보세요. 다른 사용자들에게 도움이 됩니다.
        </p>
        <Button href="/facilities">시설 찾아보기</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <MessageSquare className="h-6 w-6 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">전체 리뷰</div>
        </Card>
        <Card className="p-4 text-center">
          <Award className="h-6 w-6 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.approved}</div>
          <div className="text-sm text-gray-600">승인된 리뷰</div>
        </Card>
        <Card className="p-4 text-center">
          <AlertCircle className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
          <div className="text-sm text-gray-600">검토 중</div>
        </Card>
        <Card className="p-4 text-center">
          <Star className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.avgRating}</div>
          <div className="text-sm text-gray-600">평균 평점</div>
        </Card>
      </div>

      {/* 필터 및 검색 */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          {/* 검색 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="시설명 또는 리뷰 내용으로 검색..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filter.searchQuery}
              onChange={(e) => setFilter(prev => ({ ...prev, searchQuery: e.target.value }))}
            />
          </div>

          {/* 필터 토글 */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>필터</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* 필터 옵션 */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 상태 필터 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상태
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={filter.status}
                    onChange={(e) => setFilter(prev => ({ 
                      ...prev, 
                      status: e.target.value as ReviewStatus | 'ALL' 
                    }))}
                  >
                    <option value="ALL">전체</option>
                    <option value="APPROVED">승인됨</option>
                    <option value="PENDING">검토 중</option>
                    <option value="REJECTED">반려됨</option>
                  </select>
                </div>

                {/* 평점 필터 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    평점
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={filter.rating || ''}
                    onChange={(e) => setFilter(prev => ({ 
                      ...prev, 
                      rating: e.target.value ? parseInt(e.target.value) : null 
                    }))}
                  >
                    <option value="">전체</option>
                    <option value="5">5점</option>
                    <option value="4">4점</option>
                    <option value="3">3점</option>
                    <option value="2">2점</option>
                    <option value="1">1점</option>
                  </select>
                </div>

                {/* 정렬 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    정렬
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={filter.sortBy}
                    onChange={(e) => setFilter(prev => ({ 
                      ...prev, 
                      sortBy: e.target.value as ReviewFilter['sortBy']
                    }))}
                  >
                    <option value="latest">최신순</option>
                    <option value="oldest">오래된순</option>
                    <option value="rating_high">평점 높은순</option>
                    <option value="rating_low">평점 낮은순</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* 리뷰 목록 */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredReviews.map((review) => (
              <motion.div
                key={review.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {review.facilityName || '시설명 없음'}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(review.status)}`}>
                          {getStatusDisplayName(review.status)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        {renderStars(review.rating)}
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                        {review.viewCount && (
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{review.viewCount}회 조회</span>
                          </div>
                        )}
                        {review.likeCount && (
                          <div className="flex items-center space-x-1">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{review.likeCount}개의 좋아요</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingReview(review)}
                        className="flex items-center space-x-1"
                      >
                        <Edit3 className="h-4 w-4" />
                        <span>수정</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteConfirm(review.id)}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>삭제</span>
                      </Button>
                    </div>
                  </div>

                  <p className="text-gray-700 leading-relaxed">{review.content}</p>

                  {review.status === 'REJECTED' && review.rejectionReason && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-800">
                        <strong>반려 사유:</strong> {review.rejectionReason}
                      </p>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredReviews.length === 0 && !loading && (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">
                검색 조건에 맞는 리뷰가 없습니다.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 삭제 확인 모달 */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                리뷰 삭제
              </h3>
              <p className="text-gray-600 mb-6">
                이 리뷰를 정말 삭제하시겠습니까? 삭제된 리뷰는 복구할 수 없습니다.
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDeleteReview(deleteConfirm)}
                  className="flex-1 text-red-600 hover:text-red-700 border-red-200"
                >
                  삭제
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};