import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  BarChart3, 
  Users, 
  Star, 
  Clock, 
  TrendingUp,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { CoordinatorMatchingStatistics } from '@/services/coordinatorApi';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface MatchingStatsDashboardProps {
  statistics: CoordinatorMatchingStatistics;
  onClose: () => void;
}

const MatchingStatsDashboard: React.FC<MatchingStatsDashboardProps> = ({
  statistics,
  onClose,
}) => {
  const {
    totalActiveCoordinators,
    averageCustomerSatisfaction,
    availableCoordinators,
    totalSuccessfulMatches,
    overallMatchingSuccessRate,
    averageResponseTime,
  } = statistics;

  const getSatisfactionLevel = (score: number) => {
    if (score >= 4.5) return { text: '최우수', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 4.0) return { text: '우수', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (score >= 3.5) return { text: '양호', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { text: '보통', color: 'text-gray-600', bg: 'bg-gray-50' };
  };

  const getSuccessRateLevel = (rate: number) => {
    if (rate >= 90) return { text: '매우 높음', color: 'text-green-600' };
    if (rate >= 80) return { text: '높음', color: 'text-blue-600' };
    if (rate >= 70) return { text: '보통', color: 'text-yellow-600' };
    return { text: '낮음', color: 'text-red-600' };
  };

  const getResponseTimeLevel = (time: number) => {
    if (time <= 5) return { text: '매우 빠름', color: 'text-green-600' };
    if (time <= 15) return { text: '빠름', color: 'text-blue-600' };
    if (time <= 30) return { text: '보통', color: 'text-yellow-600' };
    return { text: '느림', color: 'text-red-600' };
  };

  const availabilityRate = totalActiveCoordinators > 0 
    ? (availableCoordinators / totalActiveCoordinators) * 100 
    : 0;

  const satisfactionLevel = getSatisfactionLevel(averageCustomerSatisfaction);
  const successRateLevel = getSuccessRateLevel(overallMatchingSuccessRate);
  const responseTimeLevel = getResponseTimeLevel(averageResponseTime);

  const statsCards = [
    {
      title: '전체 코디네이터',
      value: totalActiveCoordinators.toLocaleString(),
      subtitle: '명',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: '가용 코디네이터',
      value: availableCoordinators.toLocaleString(),
      subtitle: `${availabilityRate.toFixed(1)}% 가용`,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: '평균 만족도',
      value: averageCustomerSatisfaction.toFixed(1),
      subtitle: satisfactionLevel.text,
      icon: Star,
      color: satisfactionLevel.color,
      bgColor: satisfactionLevel.bg,
    },
    {
      title: '성공한 매칭',
      value: totalSuccessfulMatches.toLocaleString(),
      subtitle: '건',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: '매칭 성공률',
      value: `${overallMatchingSuccessRate.toFixed(1)}%`,
      subtitle: successRateLevel.text,
      icon: BarChart3,
      color: successRateLevel.color,
      bgColor: 'bg-indigo-50',
    },
    {
      title: '평균 응답시간',
      value: `${averageResponseTime.toFixed(1)}`,
      subtitle: `분 (${responseTimeLevel.text})`,
      icon: Clock,
      color: responseTimeLevel.color,
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="border-elderberry-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-elderberry-600" />
              매칭 시스템 통계
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statsCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg ${stat.bgColor} border border-opacity-20`}
              >
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-600">
                      {stat.subtitle}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {stat.title}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-elderberry-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-elderberry-900 mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                시스템 상태
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-elderberry-700">가용성</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-elderberry-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{ width: `${availabilityRate}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-elderberry-900">
                      {availabilityRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-elderberry-700">성공률</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-elderberry-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${overallMatchingSuccessRate}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-elderberry-900">
                      {overallMatchingSuccessRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-elderberry-700">만족도</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-elderberry-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-500 transition-all duration-300"
                        style={{ width: `${(averageCustomerSatisfaction / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-elderberry-900">
                      {averageCustomerSatisfaction.toFixed(1)}/5.0
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-blue-900 mb-3">
                성과 요약
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-2 bg-white rounded">
                  <span className="text-gray-700">평균 매칭 시간</span>
                  <span className="font-medium text-blue-900">
                    {averageResponseTime.toFixed(1)}분
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-white rounded">
                  <span className="text-gray-700">활성 매칭률</span>
                  <span className="font-medium text-blue-900">
                    {((availableCoordinators / totalActiveCoordinators) * 100).toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-white rounded">
                  <span className="text-gray-700">고품질 매칭 비율</span>
                  <span className="font-medium text-blue-900">
                    {averageCustomerSatisfaction >= 4.0 ? '높음' : '보통'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              * 통계는 실시간으로 업데이트되며, 최근 30일 기준입니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MatchingStatsDashboard; 