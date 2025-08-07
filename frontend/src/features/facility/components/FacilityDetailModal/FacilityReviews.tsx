/**
 * FacilityReviews 컴포넌트 - 시설 리뷰 시스템
 * 리뷰 목록, 평점 통계, 필터링, 정렬, 투표 기능 등을 포함
 */
import React, { memo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Flag,
  Info,
  MessageCircle,
  MoreVertical,
  Star,
  ThumbsDown,
  ThumbsUp
} from '../../../../components/icons/LucideIcons';
import { motion } from 'framer-motion';
import { Button } from '@/shared/ui';
import { Card, CardContent } from '@/shared/ui';
import {
  Review,
  ReviewSort,
  ReviewFilter,
  ReviewStatistics,
  ReviewPagination
} from '@/types/review';

interface FacilityReviewsProps {
  reviews: Review[];
  reviewStatistics: ReviewStatistics | null;
  loading: {
    reviews: boolean;
    vote: boolean;
  };
  pagination: ReviewPagination;
  currentSort: ReviewSort;
  currentFilter: ReviewFilter;
  onSortChange: (sort: ReviewSort) => void;
  onFilterApply: (filter: ReviewFilter) => void;
  onVote: (reviewId: number, isHelpful: boolean) => void;
  onPageChange: (page: number) => void;
}

const FacilityReviews: React.FC<FacilityReviewsProps> = memo(({
  reviews,
  reviewStatistics,
  loading,
  pagination,
  currentSort,
  currentFilter,
  onSortChange,
  onFilterApply,
  onVote,
  onPageChange
}) => {
  return (
    <motion.div
      key="reviews"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 space-y-6"
    >
      {/* 리뷰 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">이용 후기</h3>
        <div className="flex items-center space-x-2">
          {/* 필터 버튼 */}
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-1" />
            필터
          </Button>
          
          {/* 정렬 드롭다운 */}
          <select
            value={currentSort}
            onChange={(e) => onSortChange(e.target.value as ReviewSort)}
            className="px-3 py-1 border rounded text-sm"
          >
            <option value={ReviewSort.LATEST}>최신순</option>
            <option value={ReviewSort.HIGHEST_RATING}>평점 높은순</option>
            <option value={ReviewSort.LOWEST_RATING}>평점 낮은순</option>
            <option value={ReviewSort.MOST_HELPFUL}>도움됨순</option>
          </select>
        </div>
      </div>
      
      {/* 평점 요약 */}
      {reviewStatistics && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 전체 평점 */}
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {reviewStatistics.averageRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${
                      i < Math.round(reviewStatistics.averageRating) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`} 
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600">
                {reviewStatistics.totalCount}개의 리뷰
              </div>
              <div className="text-sm text-blue-600 font-medium mt-2">
                추천률 {reviewStatistics.recommendationPercentage}%
              </div>
            </div>

            {/* 평점 분포 */}
            <div className="space-y-2">
              {Object.entries(reviewStatistics.ratingDistribution)
                .sort(([a], [b]) => Number(b) - Number(a))
                .map(([rating, count]) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <span className="text-sm w-4">{rating}점</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ 
                          width: `${reviewStatistics.totalCount > 0 ? (count / reviewStatistics.totalCount) * 100 : 0}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8">{count}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* 카테고리별 평점 */}
          <div className="mt-4 pt-4 border-t border-blue-100">
            <h4 className="font-medium mb-3 text-gray-700">카테고리별 평점</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(reviewStatistics.categoryRatings).map(([category, rating]) => (
                <div key={category} className="text-center">
                  <div className="text-sm font-medium text-gray-600 mb-1">
                    {category === 'serviceQuality' ? '서비스' :
                     category === 'facility' ? '시설' :
                     category === 'staff' ? '직원' :
                     category === 'price' ? '가격' :
                     category === 'accessibility' ? '접근성' : category}
                  </div>
                  <div className="text-lg font-semibold text-blue-600">
                    {rating > 0 ? rating.toFixed(1) : '-'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 리뷰 목록 */}
      <div className="space-y-4">
        {loading.reviews ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">리뷰를 불러오는 중...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>아직 등록된 리뷰가 없습니다.</p>
            <p className="text-sm mt-1">첫 번째 리뷰를 작성해보세요!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                {/* 리뷰 헤더 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {review.reviewer.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {review.anonymous ? '익명' : review.reviewer.name}
                        </span>
                        {review.verified && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                            인증됨
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${
                                i < review.overallRating 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>

                {/* 리뷰 제목 */}
                {review.title && (
                  <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                )}

                {/* 리뷰 내용 */}
                <p className="text-gray-700 mb-3 leading-relaxed">{review.content}</p>

                {/* 리뷰 태그 */}
                {review.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {review.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 리뷰 이미지 */}
                {review.imageUrls.length > 0 && (
                  <div className="flex space-x-2 mb-3">
                    {review.imageUrls.slice(0, 3).map((imageUrl, index) => (
                      <img
                        key={index}
                        src={imageUrl}
                        alt={`리뷰 이미지 ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80"
                        onClick={() => {
                          // 이미지 확대 보기 구현
                        }}
                      />
                    ))}
                    {review.imageUrls.length > 3 && (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-xs">
                        +{review.imageUrls.length - 3}
                      </div>
                    )}
                  </div>
                )}

                {/* 리뷰 액션 */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => onVote(review.id, true)}
                      className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600"
                      disabled={loading.vote}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>도움됨 {review.helpfulCount}</span>
                    </button>
                    
                    <button
                      onClick={() => onVote(review.id, false)}
                      className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-600"
                      disabled={loading.vote}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span>{review.notHelpfulCount}</span>
                    </button>

                    <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-600">
                      <Flag className="w-4 h-4" />
                      <span>신고</span>
                    </button>
                  </div>

                  {review.recommended && (
                    <span className="text-sm text-green-600 font-medium">
                      추천합니다
                    </span>
                  )}
                </div>

                {/* 관리자 답변 */}
                {review.adminResponse && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <div className="flex items-center mb-2">
                      <Info className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-900">시설 관리자 답변</span>
                      {review.adminResponseDate && (
                        <span className="text-xs text-blue-600 ml-auto">
                          {new Date(review.adminResponseDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-blue-800">{review.adminResponse}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 페이지네이션 */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={!pagination.hasPrevious}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <span className="text-sm text-gray-600">
            {pagination.page + 1} / {pagination.totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={!pagination.hasNext}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* 리뷰 작성 버튼 */}
      <div className="text-center pt-4 border-t">
        <Button className="px-6">
          <Star className="w-4 h-4 mr-2" />
          리뷰 작성하기
        </Button>
      </div>
    </motion.div>
  );
});

FacilityReviews.displayName = 'FacilityReviews';

export default FacilityReviews;