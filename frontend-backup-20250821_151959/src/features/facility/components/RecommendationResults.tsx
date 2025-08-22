/**
 * 맞춤형 추천 결과 UI 컴포넌트
 * AI 기반 추천 시설들을 매칭 점수와 함께 표시하고, 추천 이유 설명
 */
import React, { useState } from 'react';
import {
  AlertCircle,
  Award,
  Brain,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Filter,
  Heart,
  Info,
  Lightbulb,
  RefreshCw,
  Settings,
  Sparkles,
  Star,
  Target,
  TrendingUp
} from '../../../components/icons/LucideIcons';
import { motion, AnimatePresence } from 'framer-motion';
import { FacilityRecommendation, useFacilityStore } from '@/stores/facilityStore';
import { Button } from '@/shared/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui';
import FacilityCard from './FacilityCard';

interface RecommendationResultsProps {
  recommendations: FacilityRecommendation[];
  isLoading?: boolean;
  onRefresh?: () => void;
  memberId?: number;
  showPreferences?: boolean;
}

const RecommendationResults: React.FC<RecommendationResultsProps> = ({
  recommendations,
  isLoading = false,
  onRefresh,
  memberId,
  showPreferences = true,
}) => {
  const { matchingPreference, updateMatchingPreference } = useFacilityStore();
  const [showPreferenceSettings, setShowPreferenceSettings] = useState(false);
  const [showRecommendationInsights, setShowRecommendationInsights] = useState(false);

  // 추천 통계 계산
  const recommendationStats = {
    averageScore: recommendations.length > 0 
      ? Math.round(recommendations.reduce((sum, rec) => sum + rec.matchScore, 0) / recommendations.length)
      : 0,
    highScoreCount: recommendations.filter(rec => rec.matchScore >= 80).length,
    mediumScoreCount: recommendations.filter(rec => rec.matchScore >= 60 && rec.matchScore < 80).length,
    lowScoreCount: recommendations.filter(rec => rec.matchScore < 60).length,
  };

  // 추천 인사이트 생성
  const generateInsights = () => {
    const insights = [];
    
    if (recommendationStats.averageScore >= 80) {
      insights.push({
        type: 'success',
        icon: CheckCircle,
        title: '우수한 매칭 결과',
        description: '회원님의 요구사항에 잘 맞는 시설들이 많이 찾아졌습니다.',
      });
    } else if (recommendationStats.averageScore >= 60) {
      insights.push({
        type: 'warning',
        icon: AlertCircle,
        title: '양호한 매칭 결과',
        description: '일부 조건을 조정하면 더 적합한 시설을 찾을 수 있습니다.',
      });
    } else {
      insights.push({
        type: 'info',
        icon: Info,
        title: '매칭 조건 검토 필요',
        description: '선호 조건을 조정하여 더 나은 추천 결과를 받아보세요.',
      });
    }

    if (recommendationStats.highScoreCount === 0) {
      insights.push({
        type: 'tip',
        icon: Lightbulb,
        title: '추천 팁',
        description: '지역 범위를 넓히거나 비용 조건을 조정해보세요.',
      });
    }

    return insights;
  };

  const insights = generateInsights();

  // 선호도 업데이트 핸들러
  const handlePreferenceUpdate = (key: string, value: any) => {
    updateMatchingPreference({ [key]: value });
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* 로딩 헤더 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Brain className="w-6 h-6 text-purple-600" />
              </motion.div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">AI가 맞춤형 시설을 분석 중입니다</h3>
                <p className="text-gray-600">회원님의 건강 상태와 선호도를 종합적으로 분석하고 있어요...</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 로딩 스켈레톤 */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // 빈 상태
  if (recommendations.length === 0) {
    return (
      <div className="text-center py-12">
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  추천 결과가 없습니다
                </h3>
                <p className="text-gray-500 max-w-md">
                  현재 조건에 맞는 시설을 찾지 못했습니다. 선호 조건을 조정하거나 다시 시도해보세요.
                </p>
              </div>
              
              {onRefresh && (
                <Button onClick={onRefresh} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  다시 추천받기
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 추천 결과 헤더 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-xl">맞춤형 추천 결과</CardTitle>
                <p className="text-gray-600">AI가 분석한 회원님께 최적의 시설 {recommendations.length}곳</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {onRefresh && (
                <Button variant="outline" size="sm" onClick={onRefresh}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  새로고침
                </Button>
              )}
              
              {showPreferences && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreferenceSettings(!showPreferenceSettings)}
                >
                  <Settings className="w-4 h-4 mr-1" />
                  선호도 설정
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* 추천 통계 */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{recommendationStats.averageScore}%</div>
              <div className="text-sm text-gray-600">평균 매칭도</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{recommendationStats.highScoreCount}</div>
              <div className="text-sm text-gray-600">우수 매칭 (80%+)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{recommendationStats.mediumScoreCount}</div>
              <div className="text-sm text-gray-600">양호 매칭 (60-79%)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{recommendationStats.lowScoreCount}</div>
              <div className="text-sm text-gray-600">보통 매칭 (60% 미만)</div>
            </div>
          </div>

          {/* 추천 인사이트 토글 */}
          <button
            onClick={() => setShowRecommendationInsights(!showRecommendationInsights)}
            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <span className="font-medium">AI 추천 분석 결과</span>
            </div>
            {showRecommendationInsights ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {/* 추천 인사이트 */}
          <AnimatePresence>
            {showRecommendationInsights && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-3">
                  {insights.map((insight, index) => {
                    const Icon = insight.icon;
                    const colorClass = {
                      success: 'text-green-600 bg-green-50',
                      warning: 'text-yellow-600 bg-yellow-50',
                      info: 'text-blue-600 bg-blue-50',
                      tip: 'text-purple-600 bg-purple-50',
                    }[insight.type];

                    return (
                      <div key={index} className={`p-3 rounded-lg ${colorClass}`}>
                        <div className="flex items-start space-x-2">
                          <Icon className="w-5 h-5 mt-0.5" />
                          <div>
                            <div className="font-medium">{insight.title}</div>
                            <div className="text-sm opacity-90">{insight.description}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* 선호도 설정 */}
      <AnimatePresence>
        {showPreferenceSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  추천 선호도 설정
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 우선순위 설정 */}
                  <div className="space-y-3">
                    <h4 className="font-medium">우선순위</h4>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={matchingPreference.prioritizeQuality}
                        onChange={(e) => handlePreferenceUpdate('prioritizeQuality', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">품질 우선</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={matchingPreference.prioritizeCost}
                        onChange={(e) => handlePreferenceUpdate('prioritizeCost', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">비용 우선</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={matchingPreference.prioritizeAvailability}
                        onChange={(e) => handlePreferenceUpdate('prioritizeAvailability', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">입소 가능성 우선</span>
                    </label>
                  </div>

                  {/* 최대 비용 설정 */}
                  <div className="space-y-3">
                    <h4 className="font-medium">최대 월 비용</h4>
                    <select
                      value={matchingPreference.maxMonthlyFee || ''}
                      onChange={(e) => handlePreferenceUpdate('maxMonthlyFee', e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">제한 없음</option>
                      <option value="1500000">150만원</option>
                      <option value="2000000">200만원</option>
                      <option value="2500000">250만원</option>
                      <option value="3000000">300만원</option>
                      <option value="4000000">400만원</option>
                      <option value="5000000">500만원</option>
                    </select>
                  </div>

                  {/* 최소 등급 설정 */}
                  <div className="space-y-3">
                    <h4 className="font-medium">최소 시설 등급</h4>
                    <select
                      value={matchingPreference.minFacilityGrade}
                      onChange={(e) => handlePreferenceUpdate('minFacilityGrade', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="E">E등급 이상</option>
                      <option value="D">D등급 이상</option>
                      <option value="C">C등급 이상</option>
                      <option value="B">B등급 이상</option>
                      <option value="A">A등급만</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Button
                    onClick={onRefresh}
                    className="w-full"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    새로운 조건으로 다시 추천받기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 추천 시설 목록 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            추천 시설 목록
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <TrendingUp className="w-4 h-4" />
            <span>매칭도 순으로 정렬됨</span>
          </div>
        </div>

        <AnimatePresence>
          {recommendations.map((recommendation, index) => (
            <motion.div
              key={recommendation.facility.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="relative">
                {/* 순위 배지 */}
                <div className="absolute -left-4 top-4 z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-amber-600' :
                    'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                </div>

                <FacilityCard
                  facility={recommendation.facility}
                  viewMode="list"
                  isRecommendation={true}
                  matchScore={recommendation.matchScore}
                  recommendationReason={recommendation.recommendationReason}
                  showActions={true}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 추천 개선 제안 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 mb-2">추천 결과를 개선하려면?</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 선호 지역 범위를 조정해보세요</li>
                <li>• 예산 조건을 다시 검토해보세요</li>
                <li>• 필수 서비스 조건을 명확히 해보세요</li>
                <li>• 시설 방문 후 피드백을 남겨주시면 더 정확한 추천이 가능합니다</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecommendationResults; 