import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ImageIcon,
  Loader2,
  Save,
  Star,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from '@tanstack/react-query';
import { reviewApi } from '@/entities/review/api/reviewApi';
import { facilityApi } from '@/entities/facility/api/facilityApi';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { LoadingSpinner } from '@/shared/ui';
import { ErrorMessage } from '@/shared/ui';
import { StarRating } from './components/StarRating';

interface ReviewCreatePageProps {}

const RATING_CATEGORIES = [
  { key: 'serviceQualityRating', label: '서비스 품질', description: '직원 친절도, 서비스 질' },
  { key: 'facilityRating', label: '시설 환경', description: '시설 청결도, 편의시설' },
  { key: 'staffRating', label: '직원 전문성', description: '전문성, 케어 능력' },
  { key: 'priceRating', label: '가격 만족도', description: '비용 대비 만족도' },
  { key: 'accessibilityRating', label: '접근성', description: '교통편, 위치 접근성' },
] as const;

const PREDEFINED_TAGS = [
  '친절한 직원', '깨끗한 시설', '전문적 케어', '좋은 위치', '합리적 가격',
  '맛있는 식사', '다양한 프로그램', '편리한 교통', '안전한 환경', '개별 케어',
  '가족 같은 분위기', '의료진 우수', '최신 시설', '넓은 공간', '조용한 환경'
];

const ReviewCreatePage: React.FC<ReviewCreatePageProps> = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const facilityId = searchParams.get('facilityId');

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    overallRating: 0,
    serviceQualityRating: 0,
    facilityRating: 0,
    staffRating: 0,
    priceRating: 0,
    accessibilityRating: 0,
    tags: [] as string[],
    images: [] as string[],
    isAnonymous: false,
    wouldRecommend: true,
  });

  // 시설 정보 조회
  const {
    data: facility,
    isLoading: facilityLoading,
    error: facilityError,
  } = useQuery({
    queryKey: ['facility', facilityId],
    queryFn: () => facilityApi.getFacilityById(parseInt(facilityId!)),
    enabled: !!facilityId,
  });

  // 리뷰 생성 뮤테이션
  const createReviewMutation = useMutation({
    mutationFn: (reviewData: any) => reviewApi.createReview({
      ...reviewData,
      facilityId: parseInt(facilityId!),
    }),
    onSuccess: () => {
      navigate('/reviews/my', { 
        state: { message: '리뷰가 성공적으로 작성되었습니다.' }
      });
    },
  });

  const handleRatingChange = (key: string, value: number) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.content.trim() || formData.overallRating === 0) {
      alert('제목, 내용, 전체 평점은 필수입니다.');
      return;
    }

    createReviewMutation.mutate(formData);
  };

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1:
        return formData.overallRating > 0;
      case 2:
        return RATING_CATEGORIES.every(cat => 
          formData[cat.key as keyof typeof formData] > 0
        );
      case 3:
        return formData.title.trim() && formData.content.trim();
      default:
        return false;
    }
  };

  if (!facilityId) {
    return (
      <div className="min-h-screen bg-elderberry-25 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <ErrorMessage message="잘못된 접근입니다. 시설을 선택해주세요." />
        </div>
      </div>
    );
  }

  if (facilityLoading) {
    return (
      <div className="min-h-screen bg-elderberry-25 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (facilityError || !facility) {
    return (
      <div className="min-h-screen bg-elderberry-25 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <ErrorMessage message="시설 정보를 불러올 수 없습니다." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-elderberry-25 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* 헤더 */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </Button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-elderberry-900 mb-2">
              리뷰 작성
            </h1>
            <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
              <h2 className="font-semibold text-elderberry-900">{facility.name}</h2>
              <p className="text-sm text-elderberry-600">{facility.address}</p>
            </div>
          </div>
        </div>

        {/* 진행 단계 표시 */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step
                      ? 'bg-elderberry-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > step ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    step
                  )}
                </div>
                {step < 4 && (
                  <div
                    className={`w-12 h-0.5 ${
                      currentStep > step ? 'bg-elderberry-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2">
            <span className="text-sm text-elderberry-600">
              {currentStep === 1 && '전체 평점'}
              {currentStep === 2 && '세부 평점'}
              {currentStep === 3 && '리뷰 작성'}
              {currentStep === 4 && '추가 정보'}
            </span>
          </div>
        </div>

        {/* 단계별 컨텐츠 */}
        <Card>
          <CardContent className="p-6">
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center"
              >
                <h3 className="text-xl font-semibold text-elderberry-900 mb-6">
                  전체적으로 어떠셨나요?
                </h3>
                <StarRating
                  value={formData.overallRating}
                  onChange={(value) => handleRatingChange('overallRating', value)}
                  size="lg"
                  className="justify-center mb-4"
                />
                <p className="text-elderberry-600 mb-8">
                  별점을 클릭해서 평가해주세요
                </p>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-semibold text-elderberry-900 mb-6">
                  세부 항목별 평가
                </h3>
                {RATING_CATEGORIES.map((category) => (
                  <div key={category.key} className="border-b border-elderberry-100 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-elderberry-900">{category.label}</h4>
                        <p className="text-sm text-elderberry-600">{category.description}</p>
                      </div>
                      <StarRating
                        value={formData[category.key as keyof typeof formData] as number}
                        onChange={(value) => handleRatingChange(category.key, value)}
                        size="sm"
                      />
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-semibold text-elderberry-900 mb-6">
                  리뷰 내용 작성
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-elderberry-700 mb-2">
                    리뷰 제목 *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="리뷰 제목을 입력해주세요"
                    className="w-full px-4 py-3 border border-elderberry-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-elderberry-500"
                    maxLength={100}
                  />
                  <div className="text-right text-xs text-elderberry-500 mt-1">
                    {formData.title.length}/100
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-elderberry-700 mb-2">
                    상세 리뷰 *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="시설 이용 경험을 자세히 작성해주세요. 다른 이용자들에게 도움이 되는 정보를 포함해주시면 감사하겠습니다."
                    className="w-full px-4 py-3 border border-elderberry-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-elderberry-500"
                    rows={6}
                    maxLength={1000}
                  />
                  <div className="text-right text-xs text-elderberry-500 mt-1">
                    {formData.content.length}/1000
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-semibold text-elderberry-900 mb-6">
                  추가 정보
                </h3>

                {/* 태그 선택 */}
                <div>
                  <label className="block text-sm font-medium text-elderberry-700 mb-3">
                    태그 선택 (선택사항)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PREDEFINED_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-2 text-sm rounded-full border transition-colors ${
                          formData.tags.includes(tag)
                            ? 'bg-elderberry-100 border-elderberry-500 text-elderberry-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-elderberry-300'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 추천 여부 */}
                <div>
                  <label className="block text-sm font-medium text-elderberry-700 mb-3">
                    이 시설을 다른 분들께 추천하시겠어요?
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, wouldRecommend: true }))}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        formData.wouldRecommend
                          ? 'bg-green-50 border-green-500 text-green-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-green-300'
                      }`}
                    >
                      추천합니다
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, wouldRecommend: false }))}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        !formData.wouldRecommend
                          ? 'bg-red-50 border-red-500 text-red-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-red-300'
                      }`}
                    >
                      추천하지 않습니다
                    </button>
                  </div>
                </div>

                {/* 익명 여부 */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={formData.isAnonymous}
                    onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                    className="mr-3 text-elderberry-600 focus:ring-elderberry-500"
                  />
                  <label htmlFor="anonymous" className="text-sm text-elderberry-700">
                    익명으로 리뷰 작성하기
                  </label>
                </div>
              </motion.div>
            )}

            {/* 버튼 영역 */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                이전
              </Button>

              {currentStep < 4 ? (
                <Button
                  variant="primary"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!isStepComplete(currentStep)}
                >
                  다음
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={createReviewMutation.isPending || !formData.title.trim() || !formData.content.trim()}
                  className="flex items-center gap-2"
                >
                  {createReviewMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      작성 중...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      리뷰 작성 완료
                    </>
                  )}
                </Button>
              )}
            </div>

            {createReviewMutation.error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">
                  리뷰 작성 중 오류가 발생했습니다. 다시 시도해주세요.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReviewCreatePage;