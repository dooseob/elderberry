/**
 * 매칭 이력 컴포넌트
 * 시설 매칭 기록, 상태 추적, 상세 정보를 표시
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  MapPin,
  Calendar,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Phone,
  ExternalLink,
  Filter,
  Search,
  TrendingUp,
  Users,
  Target,
  Award
} from '../icons/LucideIcons';

import { Card, CardHeader, CardTitle, CardContent } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';

// 매칭 이력 타입 정의 (실제로는 별도 타입 파일에서 import)
interface MatchingHistory {
  id: number;
  facilityId: number;
  facilityName: string;
  facilityType: string;
  facilityAddress: string;
  facilityGrade: string;
  matchScore: number;
  status: 'PENDING' | 'VIEWED' | 'CONTACTED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  outcome: 'NONE' | 'CONTRACT_SIGNED' | 'INTERVIEW_SCHEDULED' | 'DECLINED' | 'EXPIRED';
  matchedAt: string;
  completedAt?: string;
  userSatisfactionScore?: number;
  coordinatorId?: string;
  coordinatorName?: string;
  notes?: string;
}

interface MatchingHistoryProps {
  userId: number;
}

const MatchingHistory: React.FC<MatchingHistoryProps> = ({ userId }) => {
  const [matchingHistory, setMatchingHistory] = useState<MatchingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // 모의 데이터 (실제로는 API에서 가져옴)
  useEffect(() => {
    const mockData: MatchingHistory[] = [
      {
        id: 1,
        facilityId: 101,
        facilityName: '서울실버케어센터',
        facilityType: '요양원',
        facilityAddress: '서울시 강남구 논현동',
        facilityGrade: 'A',
        matchScore: 92,
        status: 'COMPLETED',
        outcome: 'CONTRACT_SIGNED',
        matchedAt: '2025-01-20T10:30:00',
        completedAt: '2025-01-22T14:15:00',
        userSatisfactionScore: 4.8,
        coordinatorId: 'C001',
        coordinatorName: '김코디',
        notes: '매우 만족스러운 매칭이었습니다.'
      },
      {
        id: 2,
        facilityId: 102,
        facilityName: '부산노인요양원',
        facilityType: '요양원',
        facilityAddress: '부산시 해운대구 우동',
        facilityGrade: 'B',
        matchScore: 87,
        status: 'CONTACTED',
        outcome: 'INTERVIEW_SCHEDULED',
        matchedAt: '2025-01-18T09:15:00',
        coordinatorId: 'C002',
        coordinatorName: '이매니저'
      },
      {
        id: 3,
        facilityId: 103,
        facilityName: '대구돌봄센터',
        facilityType: '주간보호센터',
        facilityAddress: '대구시 중구 동성로',
        facilityGrade: 'A',
        matchScore: 79,
        status: 'FAILED',
        outcome: 'DECLINED',
        matchedAt: '2025-01-15T16:20:00',
        completedAt: '2025-01-16T11:30:00',
        notes: '위치가 맞지 않아 거절'
      }
    ];

    setTimeout(() => {
      setMatchingHistory(mockData);
      setLoading(false);
    }, 1000);
  }, [userId]);

  // 필터링된 매칭 이력
  const filteredHistory = React.useMemo(() => {
    return matchingHistory.filter(item => {
      const matchesSearch = item.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.facilityAddress.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || item.status === statusFilter;
      const matchesOutcome = !outcomeFilter || item.outcome === outcomeFilter;
      
      return matchesSearch && matchesStatus && matchesOutcome;
    });
  }, [matchingHistory, searchTerm, statusFilter, outcomeFilter]);

  // 통계 계산
  const stats = React.useMemo(() => {
    const total = matchingHistory.length;
    const completed = matchingHistory.filter(item => item.status === 'COMPLETED').length;
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const averageScore = matchingHistory.length > 0 
      ? Math.round(matchingHistory.reduce((sum, item) => sum + item.matchScore, 0) / matchingHistory.length)
      : 0;
    const averageSatisfaction = matchingHistory
      .filter(item => item.userSatisfactionScore)
      .reduce((sum, item, _, arr) => sum + (item.userSatisfactionScore || 0) / arr.length, 0);

    return {
      total,
      completed,
      successRate,
      averageScore,
      averageSatisfaction: Math.round(averageSatisfaction * 10) / 10
    };
  }, [matchingHistory]);

  // 상태별 스타일
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          icon: CheckCircle,
          label: '완료'
        };
      case 'CONTACTED':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          icon: Phone,
          label: '연락됨'
        };
      case 'VIEWED':
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-800',
          icon: Eye,
          label: '확인됨'
        };
      case 'PENDING':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          icon: Clock,
          label: '대기중'
        };
      case 'FAILED':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          icon: XCircle,
          label: '실패'
        };
      case 'CANCELLED':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          icon: XCircle,
          label: '취소됨'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          icon: AlertCircle,
          label: '알 수 없음'
        };
    }
  };

  // 결과별 스타일
  const getOutcomeStyle = (outcome: string) => {
    switch (outcome) {
      case 'CONTRACT_SIGNED':
        return { text: 'text-green-600', label: '계약 체결' };
      case 'INTERVIEW_SCHEDULED':
        return { text: 'text-blue-600', label: '면접 예정' };
      case 'DECLINED':
        return { text: 'text-red-600', label: '거절' };
      case 'EXPIRED':
        return { text: 'text-gray-600', label: '만료' };
      default:
        return { text: 'text-gray-600', label: '-' };
    }
  };

  // 별점 렌더링
  const renderStars = (score: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= score ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">총 매칭</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}건</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">성공률</p>
                <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">평균 점수</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageScore}점</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">만족도</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageSatisfaction || '-'}
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
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="시설명이나 주소로 검색..."
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
              </Button>
            </div>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center space-x-4 pt-4 border-t border-gray-200"
              >
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">전체 상태</option>
                  <option value="PENDING">대기중</option>
                  <option value="VIEWED">확인됨</option>
                  <option value="CONTACTED">연락됨</option>
                  <option value="COMPLETED">완료</option>
                  <option value="FAILED">실패</option>
                  <option value="CANCELLED">취소됨</option>
                </select>

                <select
                  value={outcomeFilter}
                  onChange={(e) => setOutcomeFilter(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">전체 결과</option>
                  <option value="CONTRACT_SIGNED">계약 체결</option>
                  <option value="INTERVIEW_SCHEDULED">면접 예정</option>
                  <option value="DECLINED">거절</option>
                  <option value="EXPIRED">만료</option>
                </select>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 매칭 이력 목록 */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter || outcomeFilter ? '검색 결과가 없습니다' : '매칭 이력이 없습니다'}
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter || outcomeFilter 
                  ? '다른 검색어나 필터를 시도해보세요.'
                  : '시설 매칭을 신청하여 이력을 쌓아보세요.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredHistory.map((item, index) => {
            const statusStyle = getStatusStyle(item.status);
            const outcomeStyle = getOutcomeStyle(item.outcome);
            const StatusIcon = statusStyle.icon;

            return (
              <motion.div
                key={item.id}
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
                            {item.facilityName}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                            {statusStyle.label}
                          </span>
                          {item.outcome !== 'NONE' && (
                            <span className={`text-sm font-medium ${outcomeStyle.text}`}>
                              {outcomeStyle.label}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{item.facilityAddress}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Award className="w-4 h-4" />
                            <span>{item.facilityType} ({item.facilityGrade}등급)</span>
                          </span>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>매칭: {new Date(item.matchedAt).toLocaleDateString('ko-KR')}</span>
                          </span>
                          {item.completedAt && (
                            <span className="flex items-center space-x-1">
                              <CheckCircle className="w-4 h-4" />
                              <span>완료: {new Date(item.completedAt).toLocaleDateString('ko-KR')}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 매칭 점수 */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-elderberry-600 mb-1">
                          {item.matchScore}점
                        </div>
                        <div className="text-xs text-gray-500">매칭 점수</div>
                      </div>
                    </div>

                    {/* 코디네이터 정보 */}
                    {item.coordinatorName && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">담당 코디네이터:</span>
                          <span className="text-sm font-medium text-gray-900">{item.coordinatorName}</span>
                        </div>
                      </div>
                    )}

                    {/* 만족도 평가 */}
                    {item.userSatisfactionScore && (
                      <div className="bg-yellow-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Star className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm text-gray-600">만족도 평가:</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {renderStars(Math.round(item.userSatisfactionScore))}
                            <span className="text-sm font-medium text-gray-900">
                              {item.userSatisfactionScore}점
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 노트 */}
                    {item.notes && (
                      <div className="bg-blue-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-blue-900">{item.notes}</p>
                      </div>
                    )}

                    {/* 액션 버튼 */}
                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>시설 보기</span>
                      </Button>
                      
                      {item.status === 'PENDING' && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <Phone className="w-4 h-4" />
                          <span>연락하기</span>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MatchingHistory;