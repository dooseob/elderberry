import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ChevronDown,
  Filter,
  Loader2,
  MessageSquare,
  RefreshCw,
  Star,
  ThumbsUp,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { reviewApi } from '@/entities/review/api/reviewApi';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { LoadingSpinner } from '@/shared/ui';
import { ErrorMessage } from '@/shared/ui';
import { StarRating } from './components/StarRating';
import { ReviewCard } from './components/ReviewCard';

interface FacilityReviewsPageProps {}

const FacilityReviewsPage: React.FC<FacilityReviewsPageProps> = () => {
  const { facilityId } = useParams<{ facilityId: string }>();
  const [sortBy, setSortBy] = useState<'latest' | 'rating' | 'helpful'>('latest');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const {
    data: facilityReviews,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['facility-reviews', facilityId],
    queryFn: () => reviewApi.getFacilityReviews(parseInt(facilityId!)),
    enabled: !!facilityId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const handleWriteReview = () => {
    // TODO: Navigate to review create page
    window.location.href = `/reviews/create?facilityId=${facilityId}`;
  };

  // 리뷰 통계 계산
  const reviewStats = React.useMemo(() => {
    if (!facilityReviews || facilityReviews.length === 0) {
      return null;
    }

    const totalReviews = facilityReviews.length;
    const averageRating = facilityReviews.reduce((sum, review) => sum + review.overallRating, 0) / totalReviews;
    
    const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
      const count = facilityReviews.filter(review => Math.floor(review.overallRating) === rating).length;
      const percentage = (count / totalReviews) * 100;
      return { rating, count, percentage };
    });

    return {
      totalReviews,
      averageRating,
      ratingDistribution,
    };
  }, [facilityReviews]);

  const filteredAndSortedReviews = React.useMemo(() => {
    if (!facilityReviews) return [];

    let filtered = facilityReviews;
    if (filterRating !== null) {
      filtered = filtered.filter(review => Math.floor(review.overallRating) === filterRating);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.overallRating - a.overallRating;
        case 'helpful':
          return (b.helpfulCount || 0) - (a.helpfulCount || 0);
        case 'latest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [facilityReviews, sortBy, filterRating]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-elderberry-25 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-elderberry-25 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <ErrorMessage
            message="시설 리뷰를 불러오는 중 오류가 발생했습니다."
            onRetry={() => refetch()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-elderberry-25 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-elderberry-900 mb-2">
            시설 리뷰
          </h1>
          <p className="text-elderberry-600">
            실제 이용자들의 솔직한 시설 후기를 확인해보세요
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 리뷰 통계 사이드바 */}
          <div className="lg:col-span-1">
            {reviewStats && (
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-elderberry-600" />
                    리뷰 통계
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* 전체 평점 */}
                    <div className="text-center">
                      <div className="text-4xl font-bold text-elderberry-900 mb-2">
                        {reviewStats.averageRating.toFixed(1)}
                      </div>
                      <StarRating
                        value={reviewStats.averageRating}
                        readonly
                        size="sm"
                      />
                      <div className="text-sm text-elderberry-600 mt-2">
                        총 {reviewStats.totalReviews}개 리뷰
                      </div>
                    </div>

                    {/* 평점 분포 */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-elderberry-900">평점 분포</h4>
                      {reviewStats.ratingDistribution.map(({ rating, count, percentage }) => (
                        <div key={rating} className="flex items-center gap-2">
                          <div className="flex items-center gap-1 w-12">
                            <span className="text-sm">{rating}</span>
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-elderberry-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-elderberry-600 w-8 text-right">
                            {count}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* 리뷰 작성 버튼 */}
                    <Button
                      variant="primary"
                      onClick={handleWriteReview}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      리뷰 작성하기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 리뷰 목록 */}
          <div className="lg:col-span-3">
            {/* 필터 및 정렬 컨트롤 */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center gap-2"
                    >
                      <Filter className="w-4 h-4" />
                      필터
                      <ChevronDown 
                        className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} 
                      />
                    </Button>

                    <div>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-3 py-2 border border-elderberry-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-elderberry-500"
                      >
                        <option value="latest">최신순</option>
                        <option value="rating">평점 높은순</option>
                        <option value="helpful">도움순</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetch()}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      새로고침
                    </Button>
                    
                    {facilityReviews && (
                      <span className="text-sm text-elderberry-600">
                        {filteredAndSortedReviews.length}개 리뷰
                      </span>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-elderberry-200"
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <label className="block text-sm font-medium text-elderberry-700 mb-1">
                            평점 필터
                          </label>
                          <select
                            value={filterRating || ''}
                            onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
                            className="px-3 py-2 border border-elderberry-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-elderberry-500"
                          >
                            <option value="">전체</option>
                            <option value="5">5점만</option>
                            <option value="4">4점만</option>
                            <option value="3">3점만</option>
                            <option value="2">2점만</option>
                            <option value="1">1점만</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* 리뷰 목록 */}
            {filteredAndSortedReviews.length > 0 ? (
              <div className="space-y-4">
                {filteredAndSortedReviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ReviewCard
                      review={review}
                      showFacilityInfo={false}
                      showActions={false}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <MessageSquare className="w-12 h-12 text-elderberry-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-elderberry-900 mb-2">
                    {filterRating ? `${filterRating}점 리뷰가 없습니다` : '작성된 리뷰가 없습니다'}
                  </h3>
                  <p className="text-elderberry-600 mb-6">
                    {filterRating 
                      ? '다른 평점의 리뷰를 확인해보세요.' 
                      : '이 시설에 대한 첫 번째 리뷰를 작성해보세요.'
                    }
                  </p>
                  <Button
                    variant="primary"
                    onClick={filterRating ? () => setFilterRating(null) : handleWriteReview}
                  >
                    {filterRating ? '전체 리뷰 보기' : '첫 리뷰 작성하기'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityReviewsPage;