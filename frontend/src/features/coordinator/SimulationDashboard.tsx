import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Loader2,
  Play,
  Settings,
  TrendingUp
} from '../../components/icons/LucideIcons';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { coordinatorMatchingApi, MatchingSimulationRequest, MatchingSimulationResult } from '@/services/coordinatorApi';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui';
import { Button } from '@/shared/ui';

const SimulationDashboard: React.FC = () => {
  const [simulationRequest, setSimulationRequest] = useState<MatchingSimulationRequest>({
    healthAssessmentCount: 100,
    coordinatorCount: 50,
    simulationType: 'REALISTIC',
    includeLanguageMatching: true,
    includeSpecialtyMatching: true,
    includeWorkloadOptimization: true,
  });
  
  const [simulationHistory, setSimulationHistory] = useState<(MatchingSimulationResult & { timestamp: string })[]>([]);

  const simulationMutation = useMutation({
    mutationFn: (request: MatchingSimulationRequest) => coordinatorMatchingApi.runSimulation(request),
    onSuccess: (result) => {
      const timestampedResult = {
        ...result,
        timestamp: new Date().toISOString(),
      };
      setSimulationHistory(prev => [timestampedResult, ...prev.slice(0, 9)]); // Keep last 10 results
    },
  });

  const handleSimulationRun = () => {
    simulationMutation.mutate(simulationRequest);
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 80) return 'text-blue-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceLevel = (executionTime: number) => {
    if (executionTime <= 1000) return { text: '매우 빠름', color: 'text-green-600' };
    if (executionTime <= 3000) return { text: '빠름', color: 'text-blue-600' };
    if (executionTime <= 5000) return { text: '보통', color: 'text-yellow-600' };
    return { text: '느림', color: 'text-red-600' };
  };

  const latestResult = simulationHistory[0];

  return (
    <div className="min-h-screen bg-elderberry-25 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-elderberry-900 mb-2">
            매칭 시뮬레이션 대시보드
          </h1>
          <p className="text-elderberry-600">
            대량 매칭 테스트 및 시스템 성능 분석
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Simulation Configuration */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-elderberry-600" />
                  시뮬레이션 설정
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-elderberry-700 mb-2">
                      건강평가 수
                    </label>
                    <input
                      type="number"
                      value={simulationRequest.healthAssessmentCount}
                      onChange={(e) => setSimulationRequest(prev => ({
                        ...prev,
                        healthAssessmentCount: parseInt(e.target.value) || 0
                      }))}
                      className="w-full px-3 py-2 border border-elderberry-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-elderberry-500"
                      min="1"
                      max="1000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-elderberry-700 mb-2">
                      코디네이터 수
                    </label>
                    <input
                      type="number"
                      value={simulationRequest.coordinatorCount}
                      onChange={(e) => setSimulationRequest(prev => ({
                        ...prev,
                        coordinatorCount: parseInt(e.target.value) || 0
                      }))}
                      className="w-full px-3 py-2 border border-elderberry-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-elderberry-500"
                      min="1"
                      max="500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-elderberry-700 mb-2">
                      시뮬레이션 유형
                    </label>
                    <select
                      value={simulationRequest.simulationType}
                      onChange={(e) => setSimulationRequest(prev => ({
                        ...prev,
                        simulationType: e.target.value as any
                      }))}
                      className="w-full px-3 py-2 border border-elderberry-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-elderberry-500"
                    >
                      <option value="RANDOM">랜덤 테스트</option>
                      <option value="REALISTIC">현실적 시나리오</option>
                      <option value="STRESS_TEST">스트레스 테스트</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="languageMatching"
                        checked={simulationRequest.includeLanguageMatching || false}
                        onChange={(e) => setSimulationRequest(prev => ({
                          ...prev,
                          includeLanguageMatching: e.target.checked
                        }))}
                        className="mr-2 text-elderberry-600 focus:ring-elderberry-500"
                      />
                      <label htmlFor="languageMatching" className="text-sm text-elderberry-700">
                        언어 매칭 포함
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="specialtyMatching"
                        checked={simulationRequest.includeSpecialtyMatching || false}
                        onChange={(e) => setSimulationRequest(prev => ({
                          ...prev,
                          includeSpecialtyMatching: e.target.checked
                        }))}
                        className="mr-2 text-elderberry-600 focus:ring-elderberry-500"
                      />
                      <label htmlFor="specialtyMatching" className="text-sm text-elderberry-700">
                        전문분야 매칭 포함
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="workloadOptimization"
                        checked={simulationRequest.includeWorkloadOptimization || false}
                        onChange={(e) => setSimulationRequest(prev => ({
                          ...prev,
                          includeWorkloadOptimization: e.target.checked
                        }))}
                        className="mr-2 text-elderberry-600 focus:ring-elderberry-500"
                      />
                      <label htmlFor="workloadOptimization" className="text-sm text-elderberry-700">
                        워크로드 최적화 포함
                      </label>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    onClick={handleSimulationRun}
                    disabled={simulationMutation.isPending}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    {simulationMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        시뮬레이션 실행 중...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        시뮬레이션 시작
                      </>
                    )}
                  </Button>

                  {simulationMutation.error && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-800 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        시뮬레이션 실행 중 오류가 발생했습니다.
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results and Charts */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Latest Results */}
              {latestResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-elderberry-600" />
                      최신 시뮬레이션 결과
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-elderberry-900">
                          {latestResult.totalHealthAssessments.toLocaleString()}
                        </div>
                        <div className="text-sm text-elderberry-600">총 평가</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {latestResult.successfulMatches.toLocaleString()}
                        </div>
                        <div className="text-sm text-elderberry-600">성공 매칭</div>
                      </div>
                      
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getSuccessRateColor(latestResult.matchingSuccessRate)}`}>
                          {latestResult.matchingSuccessRate.toFixed(1)}%
                        </div>
                        <div className="text-sm text-elderberry-600">성공률</div>
                      </div>
                      
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getPerformanceLevel(latestResult.executionTimeMs).color}`}>
                          {(latestResult.executionTimeMs / 1000).toFixed(1)}초
                        </div>
                        <div className="text-sm text-elderberry-600">실행 시간</div>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-elderberry-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-elderberry-900 mb-2">매칭 품질</h4>
                        <div className="text-lg font-bold text-blue-600">
                          {latestResult.averageMatchingScore.toFixed(2)}/5.0
                        </div>
                        <div className="text-sm text-elderberry-600">평균 매칭 점수</div>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-2">시스템 성능</h4>
                        <div className="text-lg font-bold text-green-600">
                          {getPerformanceLevel(latestResult.executionTimeMs).text}
                        </div>
                        <div className="text-sm text-green-600">
                          {latestResult.executionTimeMs}ms 실행
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Simulation History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-elderberry-600" />
                    시뮬레이션 기록
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {simulationHistory.length > 0 ? (
                    <div className="space-y-3">
                      {simulationHistory.map((result, index) => (
                        <motion.div
                          key={result.timestamp}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-elderberry-600" />
                              <span className="text-sm text-elderberry-600">
                                {new Date(result.timestamp).toLocaleString()}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-3 text-sm">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {result.totalHealthAssessments}개 평가
                              </span>
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                {result.successfulMatches}개 성공
                              </span>
                              <span className={`px-2 py-1 rounded ${
                                result.matchingSuccessRate >= 90 
                                  ? 'bg-green-100 text-green-800'
                                  : result.matchingSuccessRate >= 80
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {result.matchingSuccessRate.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-elderberry-600" />
                            <span className="text-sm font-medium text-elderberry-900">
                              {(result.executionTimeMs / 1000).toFixed(1)}s
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BarChart3 className="w-12 h-12 text-elderberry-300 mx-auto mb-4" />
                      <p className="text-elderberry-600">
                        아직 실행된 시뮬레이션이 없습니다.
                      </p>
                      <p className="text-sm text-elderberry-500 mt-2">
                        왼쪽에서 시뮬레이션을 설정하고 실행해보세요.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationDashboard;