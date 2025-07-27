/**
 * 로그인 및 활동 기록 컴포넌트
 * 사용자의 로그인 이력, 활동 로그, 보안 이벤트 등을 조회하는 기능 제공
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Clock,
  Monitor,
  Smartphone,
  Globe,
  MapPin,
  Eye,
  AlertTriangle,
  Shield,
  User,
  LogIn,
  LogOut,
  Settings,
  Star,
  Briefcase,
  MessageSquare,
  Filter,
  Search,
  Calendar,
  Download,
  RefreshCw,
  Trash2
} from '../../../components/icons/LucideIcons';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useAuthStore } from '../../../stores/authStore';

interface ActivityLog {
  id: number;
  type: ActivityType;
  action: string;
  description: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  device: DeviceInfo;
  metadata?: Record<string, any>;
  riskLevel: 'low' | 'medium' | 'high';
}

interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  fingerprint: string;
}

interface SecurityEvent {
  id: number;
  type: SecurityEventType;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
  ipAddress: string;
  location?: string;
}

type ActivityType = 
  | 'login'
  | 'logout'
  | 'profile_update'
  | 'password_change'
  | 'settings_change'
  | 'review_created'
  | 'job_application'
  | 'matching_request'
  | 'facility_view'
  | 'search'
  | 'download';

type SecurityEventType = 
  | 'suspicious_login'
  | 'multiple_failed_attempts'
  | 'new_device_login'
  | 'password_changed'
  | 'account_locked'
  | 'unusual_activity';

interface ActivityFilter {
  type: ActivityType | 'all';
  dateRange: 'today' | 'week' | 'month' | '3months' | 'all';
  riskLevel: 'low' | 'medium' | 'high' | 'all';
  searchQuery: string;
}

/**
 * 활동 기록 컴포넌트
 */
export const ActivityHistory: React.FC = () => {
  // 상태 관리
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'activity' | 'security' | 'devices'>('activity');
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<ActivityFilter>({
    type: 'all',
    dateRange: 'month',
    riskLevel: 'all',
    searchQuery: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // 더미 데이터
  useEffect(() => {
    const dummyActivities: ActivityLog[] = [
      {
        id: 1,
        type: 'login',
        action: '로그인',
        description: '성공적으로 로그인했습니다.',
        timestamp: '2024-01-26T09:30:00Z',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: '서울시 강남구',
        device: {
          type: 'desktop',
          os: 'Windows 10',
          browser: 'Chrome 120',
          fingerprint: 'fp_desktop_001'
        },
        riskLevel: 'low'
      },
      {
        id: 2,
        type: 'profile_update',
        action: '프로필 수정',
        description: '연락처 정보를 업데이트했습니다.',
        timestamp: '2024-01-25T14:15:00Z',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        device: {
          type: 'desktop',
          os: 'Windows 10',
          browser: 'Chrome 120',
          fingerprint: 'fp_desktop_001'
        },
        riskLevel: 'low'
      },
      {
        id: 3,
        type: 'login',
        action: '로그인',
        description: '새로운 기기에서 로그인했습니다.',
        timestamp: '2024-01-24T18:45:00Z',
        ipAddress: '192.168.1.200',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        location: '서울시 서초구',
        device: {
          type: 'mobile',
          os: 'iOS 17',
          browser: 'Safari',
          fingerprint: 'fp_mobile_001'
        },
        riskLevel: 'medium'
      },
      {
        id: 4,
        type: 'job_application',
        action: '구인 지원',
        description: '서울시립요양원 요양보호사 포지션에 지원했습니다.',
        timestamp: '2024-01-23T11:20:00Z',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        device: {
          type: 'desktop',
          os: 'Windows 10',
          browser: 'Chrome 120',
          fingerprint: 'fp_desktop_001'
        },
        riskLevel: 'low'
      }
    ];

    const dummySecurityEvents: SecurityEvent[] = [
      {
        id: 1,
        type: 'new_device_login',
        severity: 'warning',
        message: '새로운 iPhone 기기에서 로그인이 감지되었습니다.',
        timestamp: '2024-01-24T18:45:00Z',
        resolved: true,
        ipAddress: '192.168.1.200',
        location: '서울시 서초구'
      },
      {
        id: 2,
        type: 'password_changed',
        severity: 'info',
        message: '비밀번호가 성공적으로 변경되었습니다.',
        timestamp: '2024-01-20T16:30:00Z',
        resolved: true,
        ipAddress: '192.168.1.100'
      }
    ];

    setActivities(dummyActivities);
    setSecurityEvents(dummySecurityEvents);
  }, []);

  // 활동 타입별 아이콘 및 색상
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'login':
        return { icon: LogIn, color: 'text-green-500' };
      case 'logout':
        return { icon: LogOut, color: 'text-gray-500' };
      case 'profile_update':
        return { icon: User, color: 'text-blue-500' };
      case 'password_change':
        return { icon: Shield, color: 'text-orange-500' };
      case 'settings_change':
        return { icon: Settings, color: 'text-purple-500' };
      case 'review_created':
        return { icon: Star, color: 'text-yellow-500' };
      case 'job_application':
        return { icon: Briefcase, color: 'text-indigo-500' };
      case 'matching_request':
        return { icon: MapPin, color: 'text-pink-500' };
      case 'facility_view':
        return { icon: Eye, color: 'text-gray-500' };
      case 'search':
        return { icon: Search, color: 'text-gray-500' };
      case 'download':
        return { icon: Download, color: 'text-teal-500' };
      default:
        return { icon: Activity, color: 'text-gray-500' };
    }
  };

  // 기기 타입별 아이콘
  const getDeviceIcon = (type: DeviceInfo['type']) => {
    switch (type) {
      case 'desktop':
        return Monitor;
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Monitor; // 태블릿용 아이콘이 없어서 Monitor 사용
      default:
        return Globe;
    }
  };

  // 보안 이벤트 심각도별 색상
  const getSeverityColor = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'info':
        return 'text-blue-500 bg-blue-50';
      case 'warning':
        return 'text-yellow-500 bg-yellow-50';
      case 'critical':
        return 'text-red-500 bg-red-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  // 위험도별 배지 색상
  const getRiskLevelColor = (level: ActivityLog['riskLevel']) => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 필터링된 활동 목록
  const filteredActivities = activities.filter(activity => {
    // 타입 필터
    if (filter.type !== 'all' && activity.type !== filter.type) return false;
    
    // 위험도 필터
    if (filter.riskLevel !== 'all' && activity.riskLevel !== filter.riskLevel) return false;
    
    // 검색어 필터
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      return (
        activity.action.toLowerCase().includes(query) ||
        activity.description.toLowerCase().includes(query) ||
        activity.ipAddress.includes(query)
      );
    }
    
    // 날짜 필터
    const now = new Date();
    const activityDate = new Date(activity.timestamp);
    
    switch (filter.dateRange) {
      case 'today':
        return activityDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return activityDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return activityDate >= monthAgo;
      case '3months':
        const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        return activityDate >= threeMonthsAgo;
      default:
        return true;
    }
  });

  // 활동 데이터 내보내기
  const exportActivityData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "시간,활동,설명,IP주소,기기,위험도\n" +
      filteredActivities.map(activity => 
        `${new Date(activity.timestamp).toLocaleString()},${activity.action},"${activity.description}",${activity.ipAddress},${activity.device.type},${activity.riskLevel}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "activity_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'activity', label: '활동 기록', count: activities.length },
            { key: 'security', label: '보안 이벤트', count: securityEvents.length },
            { key: 'devices', label: '기기 관리', count: 3 }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* 활동 기록 탭 */}
      {activeTab === 'activity' && (
        <>
          {/* 필터 및 액션 */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="활동, IP 주소로 검색..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filter.searchQuery}
                    onChange={(e) => setFilter(prev => ({ ...prev, searchQuery: e.target.value }))}
                  />
                </div>

                <select
                  value={filter.dateRange}
                  onChange={(e) => setFilter(prev => ({ ...prev, dateRange: e.target.value as ActivityFilter['dateRange'] }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="today">오늘</option>
                  <option value="week">최근 1주일</option>
                  <option value="month">최근 1개월</option>
                  <option value="3months">최근 3개월</option>
                  <option value="all">전체</option>
                </select>

                <select
                  value={filter.type}
                  onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value as ActivityFilter['type'] }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">모든 활동</option>
                  <option value="login">로그인</option>
                  <option value="logout">로그아웃</option>
                  <option value="profile_update">프로필 수정</option>
                  <option value="password_change">비밀번호 변경</option>
                  <option value="job_application">구인 지원</option>
                  <option value="matching_request">매칭 신청</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportActivityData}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>내보내기</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLoading(true)}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>새로고침</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* 활동 목록 */}
          <div className="space-y-4">
            {filteredActivities.length === 0 ? (
              <Card className="p-8 text-center">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  활동 기록이 없습니다
                </h3>
                <p className="text-gray-600">
                  선택한 기간 또는 필터 조건에 맞는 활동이 없습니다.
                </p>
              </Card>
            ) : (
              filteredActivities.map((activity) => {
                const { icon: IconComponent, color } = getActivityIcon(activity.type);
                const DeviceIcon = getDeviceIcon(activity.device.type);

                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-lg ${color.replace('text-', 'bg-').replace('-500', '-100')}`}>
                          <IconComponent className={`h-5 w-5 ${color}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <h3 className="font-medium text-gray-900">{activity.action}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(activity.riskLevel)}`}>
                                {activity.riskLevel === 'low' && '낮음'}
                                {activity.riskLevel === 'medium' && '보통'}
                                {activity.riskLevel === 'high' && '높음'}
                              </span>
                            </div>
                            <time className="text-sm text-gray-500">
                              {new Date(activity.timestamp).toLocaleString()}
                            </time>
                          </div>

                          <p className="text-gray-700 mb-3">{activity.description}</p>

                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <DeviceIcon className="h-4 w-4" />
                              <span>{activity.device.os} • {activity.device.browser}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Globe className="h-4 w-4" />
                              <span>{activity.ipAddress}</span>
                            </div>
                            {activity.location && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{activity.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* 보안 이벤트 탭 */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          {securityEvents.length === 0 ? (
            <Card className="p-8 text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                보안 이벤트가 없습니다
              </h3>
              <p className="text-gray-600">
                계정에 대한 보안 이벤트가 기록되지 않았습니다.
              </p>
            </Card>
          ) : (
            securityEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${getSeverityColor(event.severity)}`}>
                      <AlertTriangle className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            event.severity === 'info' ? 'bg-blue-100 text-blue-800' :
                            event.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {event.severity === 'info' && '정보'}
                            {event.severity === 'warning' && '경고'}
                            {event.severity === 'critical' && '심각'}
                          </span>
                          {event.resolved && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              해결됨
                            </span>
                          )}
                        </div>
                        <time className="text-sm text-gray-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </time>
                      </div>

                      <p className="text-gray-700 mb-3">{event.message}</p>

                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Globe className="h-4 w-4" />
                          <span>{event.ipAddress}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* 기기 관리 탭 */}
      {activeTab === 'devices' && (
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">등록된 기기</h3>
              <Button variant="outline" size="sm">
                모든 기기에서 로그아웃
              </Button>
            </div>

            <div className="space-y-4">
              {/* 현재 기기 */}
              <div className="flex items-center space-x-4 p-4 border border-green-200 bg-green-50 rounded-lg">
                <Monitor className="h-8 w-8 text-green-600" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Windows PC (현재)</h4>
                  <p className="text-sm text-gray-600">Chrome 120 • 서울시 강남구</p>
                  <p className="text-xs text-gray-500">마지막 활동: 지금</p>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  활성
                </span>
              </div>

              {/* 기타 기기들 */}
              <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <Smartphone className="h-8 w-8 text-gray-600" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">iPhone</h4>
                  <p className="text-sm text-gray-600">Safari • 서울시 서초구</p>
                  <p className="text-xs text-gray-500">마지막 활동: 2일 전</p>
                </div>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  제거
                </Button>
              </div>

              <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <Monitor className="h-8 w-8 text-gray-600" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">MacBook Pro</h4>
                  <p className="text-sm text-gray-600">Safari • 부산시 해운대구</p>
                  <p className="text-xs text-gray-500">마지막 활동: 1주 전</p>
                </div>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  제거
                </Button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 의심스러운 기기나 더 이상 사용하지 않는 기기는 보안을 위해 제거하는 것이 좋습니다.
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};