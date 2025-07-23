import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  BarChart3, 
  Users, 
  Star,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { coordinatorMatchingApi, CoordinatorMatch, MatchingPreference, CoordinatorMatchingStatistics } from '@/services/coordinatorApi';
import { HealthAssessment } from '@/types/health';
import CoordinatorCard from '@/components/coordinator/CoordinatorCard';
import MatchingPreferencePanel from '@/components/coordinator/MatchingPreferencePanel';
import MatchingStatsDashboard from '@/components/coordinator/MatchingStatsDashboard';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface CoordinatorMatchingWizardProps {
  assessmentId: number;
  assessment?: HealthAssessment;
  onMatchingComplete?: (selectedCoordinatorId: string) => void;
  onCancel?: () => void;
}

const CoordinatorMatchingWizard: React.FC<CoordinatorMatchingWizardProps> = ({
  assessmentId,
  assessment,
  onMatchingComplete,
  onCancel,
}) => {
  const [selectedCoordinatorId, setSelectedCoordinatorId] = useState<string | null>(null);
  const [preference, setPreference] = useState<MatchingPreference>({
    maxResults: 20,
    minCustomerSatisfaction: 3.0,
  });
  const [showPreferences, setShowPreferences] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);

  const {
    data: matches,
    isLoading: isMatchingLoading,
    error: matchingError,
    refetch: refetchMatches,
  } = useQuery({
    queryKey: ['coordinator-matches', assessmentId, preference],
    queryFn: () => coordinatorMatchingApi.findMatches(assessmentId, preference),
    enabled: !!assessmentId,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: statistics,
    isLoading: isStatsLoading,
  } = useQuery({
    queryKey: ['coordinator-statistics'],
    queryFn: () => coordinatorMatchingApi.getStatistics(),
    staleTime: 10 * 60 * 1000,
  });

  const handlePreferenceChange = (newPreference: MatchingPreference) => {
    setPreference(prev => ({ ...prev, ...newPreference }));
  };

  const handleCoordinatorSelect = (coordinatorId: string) => {
    setSelectedCoordinatorId(coordinatorId);
  };

  const handleMatchingComplete = () => {
    if (selectedCoordinatorId) {
      onMatchingComplete?.(selectedCoordinatorId);
    }
  };

  const getMatchQualityStats = (matches?: CoordinatorMatch[]) => {
    if (!matches || matches.length === 0) return null;

    const excellent = matches.filter(m => m.matchScore >= 4.5).length;
    const good = matches.filter(m => m.matchScore >= 4.0 && m.matchScore < 4.5).length;
    const fair = matches.filter(m => m.matchScore >= 3.5 && m.matchScore < 4.0).length;
    const poor = matches.filter(m => m.matchScore < 3.5).length;

    return { excellent, good, fair, poor, total: matches.length };
  };

  const matchQuality = getMatchQualityStats(matches);

  return (
    <div className="min-h-screen bg-elderberry-25 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-elderberry-900 mb-2">
            코디네이터 매칭
          </h1>
          <p className="text-elderberry-600">
            AI 기반 최적 코디네이터 추천 시스템
          </p>
        </div>

        <div className="flex gap-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreferences(!showPreferences)}
                  className="flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  매칭 설정
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStatistics(!showStatistics)}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  통계 보기
                </Button>
              </div>

              {matches && (
                <div className="text-sm text-elderberry-600">
                  총 {matches.length}명의 코디네이터를 찾았습니다
                </div>
              )}
            </div>

            <AnimatePresence>
              {showPreferences && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6"
                >
                  <MatchingPreferencePanel
                    preference={preference}
                    onChange={handlePreferenceChange}
                    onClose={() => setShowPreferences(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showStatistics && statistics && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6"
                >
                  <MatchingStatsDashboard
                    statistics={statistics}
                    onClose={() => setShowStatistics(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {matchingError && (
              <Card className="mb-6 border-red-200 bg-red-50">
                <CardContent>
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="w-5 h-5" />
                    <span>매칭 조회 중 오류가 발생했습니다: {matchingError.message}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchMatches()}
                    className="mt-3"
                  >
                    다시 시도
                  </Button>
                </CardContent>
              </Card>
            )}

            {isMatchingLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-elderberry-600 mx-auto mb-4" />
                  <p className="text-elderberry-600">최적의 코디네이터를 찾고 있습니다...</p>
                </div>
              </div>
            ) : matches && matches.length > 0 ? (
              <div className="space-y-6">
                {matchQuality && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        매칭 품질 분석
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{matchQuality.excellent}</div>
                          <div className="text-sm text-gray-600">최우수 (4.5+)</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{matchQuality.good}</div>
                          <div className="text-sm text-gray-600">우수 (4.0+)</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">{matchQuality.fair}</div>
                          <div className="text-sm text-gray-600">양호 (3.5+)</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-600">{matchQuality.poor}</div>
                          <div className="text-sm text-gray-600">보통 (3.5 미만)</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {matches.map((coordinator) => (
                    <CoordinatorCard
                      key={coordinator.coordinatorId}
                      coordinator={coordinator}
                      isSelected={selectedCoordinatorId === coordinator.coordinatorId}
                      onSelect={handleCoordinatorSelect}
                      onViewDetails={(id) => {
                        console.log('코디네이터 상세 보기:', id);
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="w-12 h-12 text-elderberry-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-elderberry-900 mb-2">
                    매칭되는 코디네이터가 없습니다
                  </h3>
                  <p className="text-elderberry-600 mb-4">
                    조건을 조정하여 다시 검색해보세요
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setShowPreferences(true)}
                  >
                    매칭 조건 변경
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {selectedCoordinatorId && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-elderberry-200 p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-elderberry-900">
                  코디네이터를 선택했습니다
                </span>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedCoordinatorId(null)}
                >
                  선택 취소
                </Button>
                <Button
                  variant="primary"
                  onClick={handleMatchingComplete}
                >
                  매칭 완료
                </Button>
              </div>
            </div>
          </div>
        )}

        {onCancel && (
          <div className="text-center mt-8">
            <Button
              variant="ghost"
              onClick={onCancel}
            >
              취소
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoordinatorMatchingWizard; 