import React, { useState } from 'react';
import {
  Edit3,
  ExternalLink,
  Filter,
  Loader2,
  MessageSquare,
  RefreshCw,
  Star,
  StarOff,
  Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { reviewApi } from '@/entities/review/api/reviewApi';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { LoadingSpinner } from '@/shared/ui';
import { ErrorMessage } from '@/shared/ui';
import { StarRating } from './components/StarRating';
import { ReviewCard } from './components/ReviewCard';

interface MyReviewsPageProps {}

const MyReviewsPage: React.FC<MyReviewsPageProps> = () => {
  const [sortBy, setSortBy] = useState<'latest' | 'rating' | 'facility'>('latest');
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const {
    data: myReviews,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['my-reviews'],
    queryFn: () => reviewApi.getMyReviews(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleEditReview = (reviewId: number) => {
    // TODO: Navigate to edit review page
    console.log('Edit review:', reviewId);
  };

  const handleDeleteReview = (reviewId: number) => {
    // TODO: Implement delete review functionality
    console.log('Delete review:', reviewId);
  };

  const filteredAndSortedReviews = React.useMemo(() => {
    if (!myReviews) return [];

    let filtered = myReviews;
    if (filterRating !== null) {
      filtered = filtered.filter(review => Math.floor(review.overallRating) === filterRating);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.overallRating - a.overallRating;
        case 'facility':
          return (a.facilityName || '').localeCompare(b.facilityName || '');
        case 'latest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [myReviews, sortBy, filterRating]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-elderberry-25 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-elderberry-25 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <ErrorMessage
            message="내 리뷰 목록을 불러오는 중 오류가 발생했습니다."
            onRetry={() => refetch()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-elderberry-25 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-elderberry-900 mb-2">
            내 리뷰 관리
          </h1>
          <p className="text-elderberry-600">
            작성한 시설 리뷰를 관리하고 수정할 수 있습니다
          </p>
        </div>

        {/* 필터 및 정렬 컨트롤 */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm font-medium text-elderberry-700 mb-1">
                    정렬
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-elderberry-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-elderberry-500"
                  >
                    <option value="latest">최신순</option>
                    <option value="rating">평점순</option>
                    <option value="facility">시설명순</option>
                  </select>
                </div>

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
                    <option value="5">5점</option>
                    <option value="4">4점</option>
                    <option value="3">3점</option>
                    <option value="2">2점</option>
                    <option value="1">1점</option>
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
                
                {myReviews && (
                  <span className="text-sm text-elderberry-600">
                    총 {myReviews.length}개 리뷰
                  </span>
                )}
              </div>
            </div>
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
                  showFacilityInfo={true}
                  showActions={true}
                  onEdit={() => handleEditReview(review.id)}
                  onDelete={() => handleDeleteReview(review.id)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <MessageSquare className="w-12 h-12 text-elderberry-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-elderberry-900 mb-2">
                작성한 리뷰가 없습니다
              </h3>
              <p className="text-elderberry-600 mb-6">
                시설을 이용해보고 첫 번째 리뷰를 작성해보세요.
              </p>
              <Button
                variant="primary"
                onClick={() => {
                  // TODO: Navigate to facility search page
                  window.location.href = '/facility-search';
                }}
              >
                시설 찾아보기
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyReviewsPage;