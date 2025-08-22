/**
 * 리뷰 목록 페이지
 * 시설별 리뷰 조회, 필터링, 정렬 기능 제공
 */
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { LoadingSpinner } from '@/shared/ui';
import { useReviewStore } from '../../stores/reviewStore';
import { 
  ReviewFilter, 
  ReviewSort, 
  ReviewType, 
  REVIEW_TYPE_LABELS,
  RATING_LABELS
} from '../../types/review';
import { 
  Star, 
  Filter, 
  SortDesc, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare,
  Shield,
  Image as ImageIcon,
  Calendar,
  User
} from '../../components/icons/LucideIcons';

interface ReviewListPageProps {
  facilityId?: number;
  embedded?: boolean;
}

export const ReviewListPage: React.FC<ReviewListPageProps> = ({ 
  facilityId: propFacilityId, 
  embedded = false 
}) => {
  const { facilityId: paramFacilityId } = useParams<{ facilityId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const facilityId = propFacilityId || (paramFacilityId ? parseInt(paramFacilityId) : null);
  
  // Store 상태
  const {
    reviews,
    reviewStatistics,
    pagination,
    loading,
    error,
    currentFilter,
    currentSort,
    loadReviews,
    loadReviewStatistics,
    applyFilter,
    changeSort,
    goToPage,
    voteHelpful,
    voteNotHelpful,
    clearError
  } = useReviewStore();

  // 로컬 상태
  const [showFilters, setShowFilters] = useState(false);
  const [localFilter, setLocalFilter] = useState<ReviewFilter>({});

  // 초기 로딩
  useEffect(() => {
    if (!facilityId) return;

    // URL 파라미터에서 필터와 정렬 읽기
    const urlSort = searchParams.get('sort') as ReviewSort || ReviewSort.LATEST;
    const urlMinRating = searchParams.get('minRating');
    const urlType = searchParams.get('type') as ReviewType;
    const urlVerified = searchParams.get('verified');
    const urlImages = searchParams.get('hasImages');
    const page = parseInt(searchParams.get('page') || '0');

    const urlFilter: ReviewFilter = {};
    if (urlMinRating) urlFilter.minRating = parseFloat(urlMinRating);
    if (urlType) urlFilter.reviewType = urlType;
    if (urlVerified) urlFilter.verified = urlVerified === 'true';
    if (urlImages) urlFilter.hasImages = urlImages === 'true';

    setLocalFilter(urlFilter);
    
    // 데이터 로드
    loadReviews(facilityId, page);
    loadReviewStatistics(facilityId);
    
    if (Object.keys(urlFilter).length > 0) {
      applyFilter(urlFilter);
    }
    if (urlSort !== ReviewSort.LATEST) {
      changeSort(urlSort);
    }
  }, [facilityId]);

  // URL 업데이트 함수
  const updateURL = (filter: ReviewFilter, sort: ReviewSort, page: number = 0) => {
    const params = new URLSearchParams();
    
    if (sort !== ReviewSort.LATEST) params.set('sort', sort);
    if (filter.minRating) params.set('minRating', filter.minRating.toString());
    if (filter.reviewType) params.set('type', filter.reviewType);
    if (filter.verified !== undefined) params.set('verified', filter.verified.toString());
    if (filter.hasImages !== undefined) params.set('hasImages', filter.hasImages.toString());
    if (page > 0) params.set('page', page.toString());
    
    setSearchParams(params);
  };

  // 필터 적용
  const handleApplyFilter = () => {
    applyFilter(localFilter);
    updateURL(localFilter, currentSort);
    setShowFilters(false);
  };

  // 정렬 변경
  const handleSortChange = (sort: ReviewSort) => {
    changeSort(sort);
    updateURL(currentFilter, sort, pagination.page);
  };

  // 페이지 변경
  const handlePageChange = (page: number) => {
    goToPage(page);
    updateURL(currentFilter, currentSort, page);
  };

  // 투표 처리
  const handleVote = async (reviewId: number, isHelpful: boolean) => {
    try {
      if (isHelpful) {
        await voteHelpful(reviewId);
      } else {
        await voteNotHelpful(reviewId);
      }
    } catch (error) {
      // 에러는 store에서 처리됨
    }
  };

  // 별점 렌더링
  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClass = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    }[size];

    return (
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // 리뷰 카드 컴포넌트
  const ReviewCard: React.FC<{ review: any }> = ({ review }) => (
    <Card className="p-6 space-y-4">
      {/* 리뷰 헤더 */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {review.anonymous ? '익명' : review.reviewer.name}
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>{new Date(review.createdDate).toLocaleDateString()}</span>
              {review.verified && (
                <div className="flex items-center space-x-1 text-blue-600">
                  <Shield className="h-3 w-3" />
                  <span className="text-xs">검증됨</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center space-x-1">
            {renderStars(review.overallRating)}
            <span className="text-sm font-medium text-gray-900 ml-1">
              {review.overallRating}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {REVIEW_TYPE_LABELS[review.reviewType]}
          </p>
        </div>
      </div>

      {/* 리뷰 제목 */}
      <h3 className="text-lg font-semibold text-gray-900">{review.title}</h3>

      {/* 세부 평점 */}
      {(review.serviceQualityRating || review.facilityRating || review.staffRating) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-gray-50 rounded-lg">
          {review.serviceQualityRating && (
            <div className="text-center">
              <p className="text-xs text-gray-600">서비스</p>
              <p className="text-sm font-medium">{review.serviceQualityRating}</p>
            </div>
          )}
          {review.facilityRating && (
            <div className="text-center">
              <p className="text-xs text-gray-600">시설</p>
              <p className="text-sm font-medium">{review.facilityRating}</p>
            </div>
          )}
          {review.staffRating && (
            <div className="text-center">
              <p className="text-xs text-gray-600">직원</p>
              <p className="text-sm font-medium">{review.staffRating}</p>
            </div>
          )}
          {review.priceRating && (
            <div className="text-center">
              <p className="text-xs text-gray-600">가격</p>
              <p className="text-sm font-medium">{review.priceRating}</p>
            </div>
          )}
        </div>
      )}

      {/* 리뷰 내용 */}
      <p className="text-gray-700 leading-relaxed">{review.content}</p>

      {/* 태그 */}
      {review.tags && review.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {review.tags.map((tag: string, index: number) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 이미지 */}
      {review.imageUrls && review.imageUrls.length > 0 && (
        <div className="flex space-x-2 overflow-x-auto">
          {review.imageUrls.map((url: string, index: number) => (
            <img
              key={index}
              src={url}
              alt={`리뷰 이미지 ${index + 1}`}
              className="h-20 w-20 object-cover rounded-lg flex-shrink-0"
            />
          ))}
        </div>
      )}

      {/* 추천 여부 */}
      {review.recommended !== undefined && (
        <div className={`p-3 rounded-lg ${
          review.recommended ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <p className="text-sm font-medium">
            {review.recommended ? '✅ 추천합니다' : '❌ 추천하지 않습니다'}
          </p>
        </div>
      )}

      {/* 관리자 응답 */}
      {review.adminResponse && (
        <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
          <p className="text-sm font-medium text-blue-900 mb-1">관리자 응답</p>
          <p className="text-sm text-blue-800">{review.adminResponse}</p>
          {review.adminResponseDate && (
            <p className="text-xs text-blue-600 mt-1">
              {new Date(review.adminResponseDate).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* 투표 및 액션 */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleVote(review.id, true)}
            disabled={loading.vote}
            className="flex items-center space-x-1"
          >
            <ThumbsUp className="h-4 w-4" />
            <span>{review.helpfulCount}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleVote(review.id, false)}
            disabled={loading.vote}
            className="flex items-center space-x-1"
          >
            <ThumbsDown className="h-4 w-4" />
            <span>{review.notHelpfulCount}</span>
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {review.imageUrls && review.imageUrls.length > 0 && (
            <div className="flex items-center space-x-1 text-gray-500">
              <ImageIcon className="h-4 w-4" />
              <span className="text-sm">{review.imageUrls.length}</span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-1 text-gray-500"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm">답글</span>
          </Button>
        </div>
      </div>
    </Card>
  );

  if (!facilityId) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">시설 ID가 필요합니다.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${embedded ? '' : 'container mx-auto p-6'}`}>
      {/* 헤더 */}
      {!embedded && (
        <div className="border-b pb-6">
          <h1 className="text-2xl font-bold text-gray-900">시설 리뷰</h1>
          <p className="text-gray-600 mt-2">실제 이용자들의 솔직한 후기를 확인해보세요</p>
        </div>
      )}

      {/* 통계 카드 */}
      {reviewStatistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="flex items-center justify-center space-x-1 mb-2">
              {renderStars(reviewStatistics.averageRating, 'lg')}
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {reviewStatistics.averageRating.toFixed(1)}
            </p>
            <p className="text-sm text-gray-600">평균 평점</p>
          </Card>
          
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {reviewStatistics.totalCount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">총 리뷰</p>
          </Card>
          
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {reviewStatistics.recommendationPercentage.toFixed(0)}%
            </p>
            <p className="text-sm text-gray-600">추천율</p>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="space-y-1">
              {Object.entries(reviewStatistics.ratingDistribution)
                .reverse()
                .map(([rating, count]) => (
                <div key={rating} className="flex justify-between text-xs">
                  <span>{rating}★</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* 필터 및 정렬 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <Button
            variant={showFilters ? 'primary' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>필터</span>
          </Button>
          
          <select
            value={currentSort}
            onChange={(e) => handleSortChange(e.target.value as ReviewSort)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={ReviewSort.LATEST}>최신순</option>
            <option value={ReviewSort.OLDEST}>오래된순</option>
            <option value={ReviewSort.HIGHEST_RATING}>평점 높은순</option>
            <option value={ReviewSort.LOWEST_RATING}>평점 낮은순</option>
            <option value={ReviewSort.MOST_HELPFUL}>도움됨 많은순</option>
          </select>
        </div>

        <p className="text-sm text-gray-600">
          총 {pagination.totalElements.toLocaleString()}개의 리뷰
        </p>
      </div>

      {/* 필터 패널 */}
      {showFilters && (
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                최소 평점
              </label>
              <select
                value={localFilter.minRating || ''}
                onChange={(e) => setLocalFilter({
                  ...localFilter,
                  minRating: e.target.value ? parseFloat(e.target.value) : undefined
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">전체</option>
                <option value="4">4점 이상</option>
                <option value="3">3점 이상</option>
                <option value="2">2점 이상</option>
                <option value="1">1점 이상</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                리뷰 타입
              </label>
              <select
                value={localFilter.reviewType || ''}
                onChange={(e) => setLocalFilter({
                  ...localFilter,
                  reviewType: e.target.value as ReviewType || undefined
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">전체</option>
                {Object.entries(REVIEW_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                기타 필터
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localFilter.verified || false}
                    onChange={(e) => setLocalFilter({
                      ...localFilter,
                      verified: e.target.checked || undefined
                    })}
                    className="rounded border-gray-300"
                  />
                  <span className="ml-2 text-sm">검증된 리뷰만</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localFilter.hasImages || false}
                    onChange={(e) => setLocalFilter({
                      ...localFilter,
                      hasImages: e.target.checked || undefined
                    })}
                    className="rounded border-gray-300"
                  />
                  <span className="ml-2 text-sm">사진 포함</span>
                </label>
              </div>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleApplyFilter}
                className="w-full"
              >
                필터 적용
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearError}
            className="mt-2"
          >
            닫기
          </Button>
        </div>
      )}

      {/* 로딩 상태 */}
      {loading.reviews && (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" text="리뷰를 불러오는 중..." />
        </div>
      )}

      {/* 리뷰 목록 */}
      {!loading.reviews && (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">아직 작성된 리뷰가 없습니다.</p>
              <Button className="mt-4">첫 번째 리뷰 작성하기</Button>
            </Card>
          ) : (
            reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))
          )}
        </div>
      )}

      {/* 페이지네이션 */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 pt-6">
          <Button
            variant="outline"
            disabled={!pagination.hasPrevious}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            이전
          </Button>
          
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
              const page = pagination.page - 2 + i;
              if (page < 0 || page >= pagination.totalPages) return null;
              
              return (
                <Button
                  key={page}
                  variant={page === pagination.page ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                >
                  {page + 1}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            disabled={!pagination.hasNext}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
};