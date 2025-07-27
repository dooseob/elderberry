/**
 * 활동 내역 컴포넌트
 * 사용자의 최근 활동, 로그인 기록, 시스템 알림 등을 시간순으로 표시
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Clock,
  Calendar,
  User,
  Heart,
  Briefcase,
  Star,
  MessageSquare,
  Settings,
  LogIn,
  LogOut,
  Eye,
  Edit,
  Trash2,
  Filter,
  Search,
  ChevronDown,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from '../icons/LucideIcons';

import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

// 활동 타입 정의
interface ActivityItem {
  id: number;
  type: 'login' | 'logout' | 'profile_update' | 'review_created' | 'review_updated' | 'review_deleted' | 
        'job_application' | 'job_application_withdrawn' | 'matching_request' | 'matching_completed' | 
        'settings_changed' | 'notification' | 'system_alert';
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    facilityName?: string;
    jobTitle?: string;
    rating?: number;
    [key: string]: any;
  };
  status?: 'success' | 'warning' | 'error' | 'info';
}

interface ActivityHistoryProps {
  userId: number;
}

const ActivityHistory: React.FC<ActivityHistoryProps> = ({ userId }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('7d'); // 7d, 30d, 90d, all
  const [showFilters, setShowFilters] = useState(false);

  // 모의 데이터 (실제로는 API에서 가져옴)
  useEffect(() => {
    const mockActivities: ActivityItem[] = [
      {
        id: 1,
        type: 'login',
        title: '로그인',
        description: '계정에 로그인했습니다',
        timestamp: '2025-01-27T09:15:00',
        metadata: {
          ipAddress: '192.168.1.100',
          userAgent: 'Chrome/120.0.0.0',
          location: '서울시 강남구'
        },
        status: 'success'
      },
      {
        id: 2,
        type: 'review_created',
        title: '리뷰 작성',
        description: '서울실버케어센터에 리뷰를 작성했습니다',
        timestamp: '2025-01-27T08:30:00',
        metadata: {
          facilityName: '서울실버케어센터',
          rating: 5
        },
        status: 'success'
      },
      {
        id: 3,
        type: 'job_application',
        title: '구직 지원',
        description: '요양보호사 채용공고에 지원했습니다',
        timestamp: '2025-01-26T16:45:00',
        metadata: {
          jobTitle: '요양보호사',
          company: '부산노인요양원'
        },
        status: 'info'
      },
      {
        id: 4,
        type: 'matching_completed',
        title: '매칭 완료',
        description: '시설 매칭이 성공적으로 완료되었습니다',
        timestamp: '2025-01-26T14:20:00',
        metadata: {
          facilityName: '대구돌봄센터',
          matchScore: 92
        },
        status: 'success'
      },
      {
        id: 5,
        type: 'profile_update',
        title: '프로필 수정',
        description: '연락처 정보를 업데이트했습니다',
        timestamp: '2025-01-25T11:10:00',
        status: 'info'
      },
      {
        id: 6,
        type: 'settings_changed',
        title: '설정 변경',
        description: '알림 설정을 변경했습니다',
        timestamp: '2025-01-25T10:05:00',
        status: 'info'
      },
      {
        id: 7,
        type: 'system_alert',
        title: '시스템 알림',
        description: '프로필 완성도가 85%에 도달했습니다',
        timestamp: '2025-01-24T18:30:00',
        status: 'warning'
      },
      {
        id: 8,
        type: 'logout',
        title: '로그아웃',
        description: '계정에서 로그아웃했습니다',
        timestamp: '2025-01-24T17:45:00',
        metadata: {
          sessionDuration: '2시간 15분'
        },
        status: 'info'
      }
    ];

    setTimeout(() => {
      setActivities(mockActivities);
      setLoading(false);
    }, 1000);
  }, [userId]);

  // 필터링된 활동 목록
  const filteredActivities = React.useMemo(() => {
    let filtered = activities;

    // 검색어 필터
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 타입 필터
    if (typeFilter) {
      filtered = filtered.filter(activity => activity.type === typeFilter);
    }

    // 날짜 필터
    if (dateFilter !== 'all') {
      const now = new Date();
      const days = dateFilter === '7d' ? 7 : dateFilter === '30d' ? 30 : 90;
      const cutoff = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
      
      filtered = filtered.filter(activity => 
        new Date(activity.timestamp) >= cutoff
      );
    }

    return filtered.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [activities, searchTerm, typeFilter, dateFilter]);

  // 활동 타입별 아이콘과 스타일
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return { icon: LogIn, color: 'text-green-600', bg: 'bg-green-100' };
      case 'logout':
        return { icon: LogOut, color: 'text-gray-600', bg: 'bg-gray-100' };
      case 'profile_update':
        return { icon: User, color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'review_created':
      case 'review_updated':
        return { icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-100' };
      case 'review_deleted':
        return { icon: Trash2, color: 'text-red-600', bg: 'bg-red-100' };
      case 'job_application':
        return { icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-100' };
      case 'job_application_withdrawn':
        return { icon: Briefcase, color: 'text-red-600', bg: 'bg-red-100' };
      case 'matching_request':
      case 'matching_completed':
        return { icon: Heart, color: 'text-pink-600', bg: 'bg-pink-100' };
      case 'settings_changed':
        return { icon: Settings, color: 'text-gray-600', bg: 'bg-gray-100' };
      case 'notification':
        return { icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'system_alert':
        return { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-100' };
      default:
        return { icon: Activity, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  // 상태별 스타일
  const getStatusStyle = (status?: string) => {
    switch (status) {
      case 'success':
        return 'border-l-green-400';
      case 'warning':
        return 'border-l-yellow-400';
      case 'error':
        return 'border-l-red-400';
      case 'info':
      default:
        return 'border-l-blue-400';
    }
  };

  // 시간 포맷팅
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}시간 전`;
    } else if (diffInHours < 168) { // 7일
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR');
    }
  };

  // 통계 계산
  const stats = React.useMemo(() => {
    const today = new Date();
    const todayActivities = activities.filter(activity => {
      const activityDate = new Date(activity.timestamp);
      return activityDate.toDateString() === today.toDateString();
    });

    const thisWeek = activities.filter(activity => {
      const activityDate = new Date(activity.timestamp);
      const weekAgo = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
      return activityDate >= weekAgo;
    });

    return {
      today: todayActivities.length,
      thisWeek: thisWeek.length,
      total: activities.length
    };
  }, [activities]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">오늘 활동</p>
                <p className="text-2xl font-bold text-gray-900">{stats.today}건</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">이번 주</p>
                <p className="text-2xl font-bold text-gray-900">{stats.thisWeek}건</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">전체 활동</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}건</p>
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
                  placeholder="활동 내역 검색..."
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

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center space-x-4 pt-4 border-t border-gray-200"
              >
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">전체 유형</option>
                  <option value="login">로그인/로그아웃</option>
                  <option value="profile_update">프로필 관리</option>
                  <option value="review_created">리뷰 활동</option>
                  <option value="job_application">구직 활동</option>
                  <option value="matching_request">매칭 활동</option>
                  <option value="settings_changed">설정 변경</option>
                  <option value="system_alert">시스템 알림</option>
                </select>

                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2"
                >
                  <option value="7d">최근 7일</option>
                  <option value="30d">최근 30일</option>
                  <option value="90d">최근 90일</option>
                  <option value="all">전체</option>
                </select>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 활동 내역 목록 */}
      <div className="space-y-3">
        {filteredActivities.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || typeFilter !== '' || dateFilter !== 'all' ? '검색 결과가 없습니다' : '활동 내역이 없습니다'}
              </h3>
              <p className="text-gray-600">
                {searchTerm || typeFilter !== '' || dateFilter !== 'all' 
                  ? '다른 검색어나 필터를 시도해보세요.'
                  : '서비스를 이용하시면 활동 내역이 표시됩니다.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredActivities.map((activity, index) => {
            const { icon: Icon, color, bg } = getActivityIcon(activity.type);
            const statusStyle = getStatusStyle(activity.status);

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`border-l-4 ${statusStyle}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      {/* 아이콘 */}
                      <div className={`w-10 h-10 ${bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>

                      {/* 내용 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {activity.title}
                          </h4>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {formatTimestamp(activity.timestamp)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {activity.description}
                        </p>

                        {/* 메타데이터 */}
                        {activity.metadata && (
                          <div className="space-y-1">
                            {activity.metadata.facilityName && (
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <MapPin className="w-3 h-3" />
                                <span>시설: {activity.metadata.facilityName}</span>
                              </div>
                            )}
                            
                            {activity.metadata.jobTitle && (
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <Briefcase className="w-3 h-3" />
                                <span>직책: {activity.metadata.jobTitle}</span>
                              </div>
                            )}
                            
                            {activity.metadata.rating && (
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <Star className="w-3 h-3" />
                                <span>평점: {activity.metadata.rating}점</span>
                              </div>
                            )}
                            
                            {activity.metadata.matchScore && (
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <CheckCircle className="w-3 h-3" />
                                <span>매칭 점수: {activity.metadata.matchScore}점</span>
                              </div>
                            )}
                            
                            {activity.metadata.ipAddress && (
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <ExternalLink className="w-3 h-3" />
                                <span>IP: {activity.metadata.ipAddress}</span>
                                {activity.metadata.location && (
                                  <span>({activity.metadata.location})</span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* 더 보기 버튼 (페이징 구현 시) */}
      {filteredActivities.length > 0 && (
        <div className="text-center">
          <Button variant="outline">
            더 많은 활동 내역 보기
          </Button>
        </div>
      )}
    </div>
  );
};

export default ActivityHistory;