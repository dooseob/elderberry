/**
 * 내 리뷰 컴포넌트
 * 작성한 리뷰 목록, 평점, 관리 기능을 제공
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Edit3,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  MessageSquare,
  Filter,
  Search,
  ChevronDown,
  TrendingUp,
  Heart,
  ThumbsUp
} from '../icons/LucideIcons';

import { Card, CardHeader, CardTitle, CardContent } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { Review } from '../../types/review';
import { useReviewStore } from '../../stores/reviewStore';

interface MyReviewsProps {
  reviews: Review[];
}

const MyReviews: React.FC<MyReviewsProps> = ({ reviews }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'helpful'>('date');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { deleteReview, loading } = useReviewStore();

  // 리뷰 필터링 및 정렬
  const filteredAndSortedReviews = React.useMemo(() => {
    let filtered = reviews.filter(review => {
      const matchesSearch = review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           review.facilityName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRating = filterRating === null || review.rating === filterRating;
      return matchesSearch && matchesRating;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'helpful':
          return b.helpfulCount - a.helpfulCount;
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [reviews, searchTerm, sortBy, filterRating]);

  // 통계 계산
  const stats = React.useMemo(() => {
    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        totalHelpfulVotes: 0,
        mostRecentDate: null
      };
    }

    const totalHelpfulVotes = reviews.reduce((sum, review) => sum + review.helpfulCount, 0);
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    const mostRecentDate = reviews
      .map(review => new Date(review.createdAt))
      .sort((a, b) => b.getTime() - a.getTime())[0];

    return {
      totalReviews: reviews.length,
      averageRating: Number(averageRating.toFixed(1)),
      totalHelpfulVotes,
      mostRecentDate
    };
  }, [reviews]);

  // 별점 렌더링
  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const sizeClasses = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // 리뷰 삭제 핸들러
  const handleDeleteReview = async (reviewId: number) => {
    if (window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
      try {
        await deleteReview(reviewId);
      } catch (error) {
        console.error('리뷰 삭제 실패:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">총 리뷰</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}개</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">평균 평점</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}점</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ThumbsUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">도움됨 투표</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHelpfulVotes}개</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">최근 작성</p>
                <p className="text-sm font-medium text-gray-900">
                  {stats.mostRecentDate 
                    ? stats.mostRecentDate.toLocaleDateString('ko-KR')
                    : '-'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* 검색바 */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="리뷰 내용이나 시설명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-elderberry-500 focus:border-elderberry-500"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>필터</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {/* 필터 옵션 */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center space-x-4 pt-4 border-t border-gray-200"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">정렬:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'rating' | 'helpful')}
                    className="border border-gray-300 rounded px-3 py-1 text-sm"
                  >
                    <option value="date">작성일순</option>
                    <option value="rating">평점순</option>
                    <option value="helpful">도움됨순</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">평점:</span>
                  <select
                    value={filterRating || ''}
                    onChange={(e) => setFilterRating(e.target.value ? Number(e.target.value) : null)}
                    className="border border-gray-300 rounded px-3 py-1 text-sm"
                  >
                    <option value="">전체</option>
                    <option value="5">5점</option>
                    <option value="4">4점</option>
                    <option value="3">3점</option>
                    <option value="2">2점</option>
                    <option value="1">1점</option>
                  </select>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 리뷰 목록 */}
      <div className="space-y-4">
        {filteredAndSortedReviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterRating ? '검색 결과가 없습니다' : '작성한 리뷰가 없습니다'}
              </h3>
              <p className="text-gray-600">
                {searchTerm || filterRating 
                  ? '다른 검색어나 필터를 시도해보세요.'
                  : '이용하신 시설에 대한 리뷰를 작성해보세요.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {review.facilityName || '시설명 없음'}
                        </h3>
                        {renderStars(review.rating, 'md')}
                        <span className="text-sm text-gray-500">
                          {review.rating}점
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(review.createdAt).toLocaleDateString('ko-KR')}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <ThumbsUp className="w-4 h-4" />
                          <span>도움됨 {review.helpfulCount}</span>
                        </span>
                      </div>
                    </div>
                    
                    {/* 액션 버튼 */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>수정</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteReview(review.id)}
                        disabled={loading.delete}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>삭제</span>
                      </Button>
                    </div>
                  </div>

                  {/* 리뷰 내용 */}
                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed">
                      {review.content}
                    </p>
                  </div>

                  {/* 이미지가 있는 경우 */}
                  {review.imageUrls && review.imageUrls.length > 0 && (
                    <div className="mb-4">
                      <div className="flex space-x-2 overflow-x-auto">
                        {review.imageUrls.map((imageUrl, idx) => (
                          <img
                            key={idx}
                            src={imageUrl}
                            alt={`리뷰 이미지 ${idx + 1}`}
                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 관리자 응답이 있는 경우 */}
                  {review.adminResponse && (
                    <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                      <h4 className="font-medium text-blue-900 mb-2">시설 관리자 답변</h4>
                      <p className="text-blue-800">{review.adminResponse}</p>
                      {review.adminResponseDate && (
                        <p className="text-xs text-blue-600 mt-2">
                          {new Date(review.adminResponseDate).toLocaleDateString('ko-KR')}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyReviews;