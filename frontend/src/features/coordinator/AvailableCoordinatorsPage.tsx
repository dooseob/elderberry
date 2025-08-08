import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  Loader2,
  RefreshCw,
  Users
} from '../../components/icons/LucideIcons';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { coordinatorMatchingApi } from '@/services/coordinatorApi';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui';
import { Button } from '@/shared/ui';

interface AvailableCoordinatorsPageProps {
  onCoordinatorSelect?: (coordinatorId: string) => void;
}

const AvailableCoordinatorsPage: React.FC<AvailableCoordinatorsPageProps> = ({
  onCoordinatorSelect,
}) => {
  const [selectedCoordinators, setSelectedCoordinators] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minCases: 0,
    maxCases: 100,
    minSatisfaction: 0,
    specialtyFilter: '',
  });

  const {
    data: availableCoordinators,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['available-coordinators'],
    queryFn: () => coordinatorMatchingApi.getAvailableCoordinators(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const handleCoordinatorToggle = (coordinatorId: string) => {
    setSelectedCoordinators(prev => 
      prev.includes(coordinatorId)
        ? prev.filter(id => id !== coordinatorId)
        : [...prev, coordinatorId]
    );
  };

  const handleBulkSelect = () => {
    if (selectedCoordinators.length === availableCoordinators?.length) {
      setSelectedCoordinators([]);
    } else {
      setSelectedCoordinators(availableCoordinators?.map(c => c.id) || []);
    }
  };

  const getWorkloadStatus = (currentCases: number, maxCases: number) => {
    const ratio = currentCases / maxCases;
    if (ratio >= 0.9) return { text: '포화', color: 'text-red-600', bg: 'bg-red-50' };
    if (ratio >= 0.7) return { text: '높음', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (ratio >= 0.4) return { text: '보통', color: 'text-blue-600', bg: 'bg-blue-50' };
    return { text: '여유', color: 'text-green-600', bg: 'bg-green-50' };
  };

  if (error) {
    return (
      <div className="min-h-screen bg-elderberry-25 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Card className="border-red-200 bg-red-50">
            <CardContent>
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span>가용 코디네이터 조회 중 오류가 발생했습니다: {error.message}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-3"
              >
                다시 시도
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-elderberry-25 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-elderberry-900 mb-2">
            가용 코디네이터 관리
          </h1>
          <p className="text-elderberry-600">
            현재 새로운 케이스를 담당할 수 있는 코디네이터 목록
          </p>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              필터
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              새로고침
            </Button>
            
            {availableCoordinators && availableCoordinators.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkSelect}
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {selectedCoordinators.length === availableCoordinators.length ? '전체 해제' : '전체 선택'}
              </Button>
            )}
          </div>

          {availableCoordinators && (
            <div className="text-sm text-elderberry-600">
              총 {availableCoordinators.length}명 가용 
              {selectedCoordinators.length > 0 && ` · ${selectedCoordinators.length}명 선택됨`}
            </div>
          )}
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>필터 설정</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-elderberry-700 mb-1">
                        최소 케이스 수
                      </label>
                      <input
                        type="number"
                        value={filters.minCases}
                        onChange={(e) => setFilters(prev => ({ ...prev, minCases: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-elderberry-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-elderberry-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-elderberry-700 mb-1">
                        최대 케이스 수
                      </label>
                      <input
                        type="number"
                        value={filters.maxCases}
                        onChange={(e) => setFilters(prev => ({ ...prev, maxCases: parseInt(e.target.value) || 100 }))}
                        className="w-full px-3 py-2 border border-elderberry-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-elderberry-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-elderberry-700 mb-1">
                        최소 만족도
                      </label>
                      <select
                        value={filters.minSatisfaction}
                        onChange={(e) => setFilters(prev => ({ ...prev, minSatisfaction: parseFloat(e.target.value) }))}
                        className="w-full px-3 py-2 border border-elderberry-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-elderberry-500"
                      >
                        <option value={0}>전체</option>
                        <option value={3.0}>3.0점 이상</option>
                        <option value={4.0}>4.0점 이상</option>
                        <option value={4.5}>4.5점 이상</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-elderberry-700 mb-1">
                        전문분야
                      </label>
                      <select
                        value={filters.specialtyFilter}
                        onChange={(e) => setFilters(prev => ({ ...prev, specialtyFilter: e.target.value }))}
                        className="w-full px-3 py-2 border border-elderberry-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-elderberry-500"
                      >
                        <option value="">전체</option>
                        <option value="dementia">치매 케어</option>
                        <option value="medical">의료 케어</option>
                        <option value="rehabilitation">재활 치료</option>
                        <option value="palliative">완화 케어</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-elderberry-600 mx-auto mb-4" />
              <p className="text-elderberry-600">가용 코디네이터를 조회하고 있습니다...</p>
            </div>
          </div>
        ) : availableCoordinators && availableCoordinators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {availableCoordinators.map((coordinator: any) => {
              const isSelected = selectedCoordinators.includes(coordinator.id);
              const workloadStatus = getWorkloadStatus(
                coordinator.currentActiveCases || 0, 
                coordinator.maxSimultaneousCases || 10
              );

              return (
                <motion.div
                  key={coordinator.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected ? 'transform scale-105' : ''
                  }`}
                  onClick={() => handleCoordinatorToggle(coordinator.id)}
                >
                  <Card 
                    className={`relative ${
                      isSelected 
                        ? 'ring-2 ring-elderberry-500 border-elderberry-300' 
                        : 'hover:shadow-lg hover:border-elderberry-200'
                    }`}
                    hover={!isSelected}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-elderberry-900 mb-1">
                            {coordinator.name || `코디네이터 ${coordinator.id}`}
                          </h3>
                          <div className="text-xs text-elderberry-600">
                            {coordinator.experienceYears || 0}년 경력
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${workloadStatus.bg} ${workloadStatus.color}`}>
                          {workloadStatus.text}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-elderberry-500">현재 케이스:</span>
                            <div className="font-medium">
                              {coordinator.currentActiveCases || 0}/{coordinator.maxSimultaneousCases || 10}
                            </div>
                          </div>
                          <div>
                            <span className="text-elderberry-500">만족도:</span>
                            <div className="font-medium flex items-center gap-1">
                              ⭐ {(coordinator.customerSatisfaction || 4.0).toFixed(1)}
                            </div>
                          </div>
                        </div>

                        {coordinator.specialtyAreas && coordinator.specialtyAreas.length > 0 && (
                          <div>
                            <div className="text-xs text-elderberry-500 mb-1">전문분야</div>
                            <div className="flex flex-wrap gap-1">
                              {coordinator.specialtyAreas.slice(0, 2).map((area: string, index: number) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full"
                                >
                                  {area}
                                </span>
                              ))}
                              {coordinator.specialtyAreas.length > 2 && (
                                <span className="px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded-full">
                                  +{coordinator.specialtyAreas.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-elderberry-600">
                          {coordinator.availableWeekends && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              주말가능
                            </div>
                          )}
                          {coordinator.availableEmergency && (
                            <div className="flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              응급대응
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>

                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 className="w-5 h-5 text-elderberry-600" />
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-12 h-12 text-elderberry-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-elderberry-900 mb-2">
                가용한 코디네이터가 없습니다
              </h3>
              <p className="text-elderberry-600 mb-4">
                현재 새로운 케이스를 담당할 수 있는 코디네이터가 없습니다.
              </p>
              <Button
                variant="primary"
                onClick={() => refetch()}
              >
                다시 조회
              </Button>
            </CardContent>
          </Card>
        )}

        {selectedCoordinators.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-elderberry-200 p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-elderberry-900">
                  {selectedCoordinators.length}명의 코디네이터를 선택했습니다
                </span>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedCoordinators([])}
                >
                  선택 해제
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    selectedCoordinators.forEach(id => onCoordinatorSelect?.(id));
                  }}
                >
                  선택 완료
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableCoordinatorsPage;