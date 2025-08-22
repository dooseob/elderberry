import React, { useState } from 'react';
import {
  Calendar,
  Edit3,
  ExternalLink,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  User,
  ShieldCheck as VerifiedIcon
} from 'lucide-react';
import { Card, CardContent } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { StarRating } from './StarRating';
import { Review } from '../../../entities/review/model/types';

interface ReviewCardProps {
  review: Review;
  showFacilityInfo?: boolean;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onHelpful?: (helpful: boolean) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  showFacilityInfo = false,
  showActions = false,
  onEdit,
  onDelete,
  onHelpful,
}) => {
  const [showFullContent, setShowFullContent] = useState(false);
  const [helpfulAction, setHelpfulAction] = useState<'helpful' | 'not_helpful' | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleHelpfulClick = (helpful: boolean) => {
    if (helpfulAction === (helpful ? 'helpful' : 'not_helpful')) {
      setHelpfulAction(null);
    } else {
      setHelpfulAction(helpful ? 'helpful' : 'not_helpful');
      onHelpful?.(helpful);
    }
  };

  const shouldTruncateContent = review.content.length > 200;
  const displayContent = showFullContent || !shouldTruncateContent 
    ? review.content 
    : `${review.content.substring(0, 200)}...`;

  const detailedRatings = [
    { label: '서비스', value: review.serviceQualityRating },
    { label: '시설', value: review.facilityRating },
    { label: '직원', value: review.staffRating },
    { label: '가격', value: review.priceRating },
    { label: '접근성', value: review.accessibilityRating },
  ].filter(rating => rating.value && rating.value > 0);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* 헤더 - 사용자 정보 및 전체 평점 */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-elderberry-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-elderberry-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-elderberry-900">
                    {review.isAnonymous ? '익명' : review.authorName || '사용자'}
                  </span>
                  {review.isVerifiedPurchase && (
                    <VerifiedIcon className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-elderberry-600">
                  <Calendar className="w-3 h-3" />
                  {formatDate(review.createdAt)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <StarRating
                value={review.overallRating}
                readonly
                size="md"
                showValue
              />
            </div>
          </div>

          {/* 시설 정보 (필요한 경우) */}
          {showFacilityInfo && review.facilityName && (
            <div className="flex items-center gap-2 p-3 bg-elderberry-50 rounded-lg">
              <ExternalLink className="w-4 h-4 text-elderberry-600" />
              <span className="font-medium text-elderberry-900">{review.facilityName}</span>
            </div>
          )}

          {/* 리뷰 제목 */}
          <h3 className="text-lg font-semibold text-elderberry-900">
            {review.title}
          </h3>

          {/* 세부 평점 (있는 경우) */}
          {detailedRatings.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {detailedRatings.map((rating) => (
                <div key={rating.label} className="text-center">
                  <div className="text-xs text-elderberry-600 mb-1">{rating.label}</div>
                  <StarRating
                    value={rating.value}
                    readonly
                    size="sm"
                    className="justify-center"
                  />
                </div>
              ))}
            </div>
          )}

          {/* 리뷰 내용 */}
          <div className="space-y-2">
            <p className="text-elderberry-700 leading-relaxed whitespace-pre-wrap">
              {displayContent}
            </p>
            {shouldTruncateContent && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullContent(!showFullContent)}
                className="text-elderberry-600 hover:text-elderberry-800"
              >
                {showFullContent ? '접기' : '더보기'}
              </Button>
            )}
          </div>

          {/* 태그 */}
          {review.tags && review.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {review.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* 이미지 (있는 경우) */}
          {review.imageUrls && review.imageUrls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {review.imageUrls.slice(0, 4).map((imageUrl, index) => (
                <div
                  key={index}
                  className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
                >
                  <img
                    src={imageUrl}
                    alt={`리뷰 이미지 ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => {
                      // TODO: Implement image modal/lightbox
                      window.open(imageUrl, '_blank');
                    }}
                  />
                </div>
              ))}
              {review.imageUrls.length > 4 && (
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm text-gray-600">
                    +{review.imageUrls.length - 4}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 관리자 응답 (있는 경우) */}
          {review.adminResponse && (
            <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
              <div className="flex items-center gap-2 mb-2">
                <VerifiedIcon className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">시설 관리자</span>
                <span className="text-xs text-blue-600">
                  {formatDate(review.adminResponse.createdAt)}
                </span>
              </div>
              <p className="text-sm text-blue-800 leading-relaxed">
                {review.adminResponse.content}
              </p>
            </div>
          )}

          {/* 하단 액션 바 */}
          <div className="flex items-center justify-between pt-4 border-t border-elderberry-100">
            <div className="flex items-center gap-4">
              {/* 도움됨/안됨 버튼 */}
              {!showActions && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleHelpfulClick(true)}
                    className={`flex items-center gap-1 ${
                      helpfulAction === 'helpful' 
                        ? 'text-green-600 bg-green-50' 
                        : 'text-elderberry-600'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    도움됨 {review.helpfulCount || 0}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleHelpfulClick(false)}
                    className={`flex items-center gap-1 ${
                      helpfulAction === 'not_helpful' 
                        ? 'text-red-600 bg-red-50' 
                        : 'text-elderberry-600'
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4" />
                    {review.notHelpfulCount || 0}
                  </Button>
                </div>
              )}

              {/* 댓글 수 표시 */}
              {review.commentCount && review.commentCount > 0 && (
                <div className="flex items-center gap-1 text-sm text-elderberry-600">
                  <MessageCircle className="w-4 h-4" />
                  {review.commentCount}개 댓글
                </div>
              )}
            </div>

            {/* 내 리뷰 관리 액션 */}
            {showActions && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  className="flex items-center gap-1"
                >
                  <Edit3 className="w-4 h-4" />
                  수정
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDelete}
                  className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  삭제
                </Button>
              </div>
            )}

            {/* 추천/비추천 표시 */}
            {review.wouldRecommend !== undefined && (
              <div className={`text-xs px-2 py-1 rounded-full ${
                review.wouldRecommend 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-red-700'
              }`}>
                {review.wouldRecommend ? '추천' : '비추천'}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { ReviewCard };