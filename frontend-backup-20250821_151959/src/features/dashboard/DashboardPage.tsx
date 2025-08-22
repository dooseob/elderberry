/**
 * 대시보드 페이지
 * 역할별 맞춤형 대시보드
 */
import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Heart,
  MapPin,
  MessageSquare,
  Star,
  TrendingUp,
  Users,
  Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { MemberRole } from '../../types/auth';
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/ui';
import { Button } from '../../shared/ui';
import { useSEO } from '../../hooks/useSEO';

// 통계 카드 컴포넌트
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeType = 'neutral',
  color = 'blue' 
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
            {change && (
              <p className={`text-sm mt-2 ${
                changeType === 'increase' ? 'text-green-600' : 
                changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {change}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// 최근 활동 항목
interface Activity {
  id: string;
  type: 'job' | 'message' | 'application' | 'match';
  title: string;
  description: string;
  timestamp: string;
  status?: 'pending' | 'completed' | 'failed';
}

// 빠른 액션 버튼
interface QuickAction {
  label: string;
  path: string;
  icon: React.ElementType;
  color: 'primary' | 'secondary' | 'success';
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  
  // SEO 최적화
  useSEO({
    title: '대시보드',
    description: `${user?.name}님의 개인 대시보드. 맞춤형 통계, 최근 활동, 빠른 작업을 한눈에 확인하세요.`,
    keywords: '대시보드, 개인화, 통계, 활동, 요양원, 구인구직',
    ogTitle: '개인 대시보드 - 엘더베리',
    canonicalUrl: 'https://elderberry.co.kr/dashboard',
    noIndex: true // 개인 대시보드는 검색 노출 안함
  });
  
  // 구조화된 데이터 추가
  useEffect(() => {
    if (user) {
      const breadcrumbData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "홈",
            "item": "https://elderberry.co.kr"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "대시보드",
            "item": "https://elderberry.co.kr/dashboard"
          }
        ]
      };
      
      // 구조화된 데이터를 문서에 추가
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'dashboard-breadcrumb';
      script.text = JSON.stringify(breadcrumbData);
      
      // 기존 스크립트가 있으면 제거 후 새로 추가
      const existingScript = document.getElementById('dashboard-breadcrumb');
      if (existingScript) {
        existingScript.remove();
      }
      document.head.appendChild(script);
      
      // 컴포넌트 언마운트 시 정리
      return () => {
        const scriptToRemove = document.getElementById('dashboard-breadcrumb');
        if (scriptToRemove) {
          scriptToRemove.remove();
        }
      };
    }
  }, [user]);
  const [activities] = useState<Activity[]>([
    {
      id: '1',
      type: 'job',
      title: '새로운 구인정보',
      description: '서울 강남구 요양원에서 간병인을 모집합니다',
      timestamp: '2시간 전',
      status: 'pending'
    },
    {
      id: '2',
      type: 'message',
      title: '새 메시지',
      description: '김코디네이터님으로부터 메시지가 도착했습니다',
      timestamp: '5시간 전'
    },
    {
      id: '3',
      type: 'application',
      title: '지원서 검토 완료',
      description: '한마음요양원 지원서가 검토되었습니다',
      timestamp: '1일 전',
      status: 'completed'
    }
  ]);

  // 역할별 대시보드 설정 - 실제 백엔드 역할에 맞춤
  const getDashboardConfig = () => {
    switch (user?.role) {
      case 'USER_DOMESTIC' as MemberRole:
      case 'USER_OVERSEAS' as MemberRole:
        return {
          stats: [
            { title: '건강평가', value: '1', icon: Heart, change: '최근 완료', changeType: 'neutral' as const, color: 'green' as const },
            { title: '시설 검색', value: '3', icon: Building2, change: '기록된 시설', changeType: 'neutral' as const, color: 'blue' as const },
            { title: '프로필 완성도', value: `${user?.profileCompletionRate || 0}%`, icon: Users, color: 'purple' as const },
            { title: '매칭 요청', value: '0', icon: Star, change: '대기중', changeType: 'neutral' as const, color: 'orange' as const }
          ],
          quickActions: [
            { label: '건강평가 시작', path: '/health-assessment', icon: Heart, color: 'primary' as const },
            { label: '시설 찾기', path: '/facility-search', icon: Building2, color: 'secondary' as const },
            { label: '프로필 완성', path: '/mypage', icon: Users, color: 'success' as const }
          ]
        };

      case 'JOB_SEEKER_DOMESTIC' as MemberRole:
      case 'JOB_SEEKER_OVERSEAS' as MemberRole:
        return {
          stats: [
            { title: '지원한 공고', value: '12', icon: Briefcase, change: '+2 이번 주', changeType: 'increase' as const, color: 'blue' as const },
            { title: '면접 예정', value: '3', icon: Calendar, change: '다음 주 2건', changeType: 'neutral' as const, color: 'green' as const },
            { title: '프로필 완성도', value: `${user?.profileCompletionRate || 0}%`, icon: Users, color: 'purple' as const },
            { title: '평균 평점', value: '4.8', icon: Star, change: '리뷰 24개', changeType: 'neutral' as const, color: 'orange' as const }
          ],
          quickActions: [
            { label: '구인정보 찾기', path: '/jobs', icon: Briefcase, color: 'primary' as const },
            { label: '프로필 완성', path: '/mypage', icon: Users, color: 'secondary' as const },
            { label: '건강평가 하기', path: '/health-assessment', icon: Heart, color: 'success' as const }
          ]
        };

      case 'FACILITY' as MemberRole:
        return {
          stats: [
            { title: '등록한 공고', value: '5', icon: Briefcase, change: '+1 이번 주', changeType: 'increase' as const, color: 'blue' as const },
            { title: '지원자 수', value: '23', icon: Users, change: '+7 이번 주', changeType: 'increase' as const, color: 'green' as const },
            { title: '면접 완료', value: '8', icon: CheckCircle, color: 'purple' as const },
            { title: '매칭 성공', value: '3', icon: TrendingUp, change: '성공률 60%', changeType: 'increase' as const, color: 'orange' as const }
          ],
          quickActions: [
            { label: '새 공고 등록', path: '/jobs/create', icon: Briefcase, color: 'primary' as const },
            { label: '지원자 관리', path: '/applications', icon: Users, color: 'secondary' as const },
            { label: '시설 정보 수정', path: '/facilities/edit', icon: Building2, color: 'success' as const }
          ]
        };

      case 'COORDINATOR' as MemberRole:
        return {
          stats: [
            { title: '담당 회원', value: '156', icon: Users, change: '+12 이번 달', changeType: 'increase' as const, color: 'blue' as const },
            { title: '매칭 건수', value: '28', icon: TrendingUp, change: '+5 이번 주', changeType: 'increase' as const, color: 'green' as const },
            { title: '성공률', value: '78%', icon: CheckCircle, change: '+3% 전월 대비', changeType: 'increase' as const, color: 'purple' as const },
            { title: '대기 중인 요청', value: '12', icon: Clock, color: 'orange' as const }
          ],
          quickActions: [
            { label: '매칭 관리', path: '/coordinator/matching', icon: Users, color: 'primary' as const },
            { label: '회원 관리', path: '/coordinator/members', icon: Users, color: 'secondary' as const },
            { label: '통계 보기', path: '/coordinator/statistics', icon: BarChart3, color: 'success' as const }
          ]
        };

      case 'ADMIN' as MemberRole:
        return {
          stats: [
            { title: '전체 회원', value: '1,234', icon: Users, change: '+45 이번 달', changeType: 'increase' as const, color: 'blue' as const },
            { title: '활성 공고', value: '89', icon: Briefcase, change: '+12 이번 주', changeType: 'increase' as const, color: 'green' as const },
            { title: '시스템 가동률', value: '99.8%', icon: CheckCircle, color: 'purple' as const },
            { title: '월 매칭 수', value: '156', icon: TrendingUp, change: '+23% 전월 대비', changeType: 'increase' as const, color: 'orange' as const }
          ],
          quickActions: [
            { label: '회원 관리', path: '/admin/members', icon: Users, color: 'primary' as const },
            { label: '시스템 설정', path: '/admin/settings', icon: Settings, color: 'secondary' as const },
            { label: '통계 대시보드', path: '/admin/statistics', icon: BarChart3, color: 'success' as const }
          ]
        };

      default:
        return {
          stats: [
            { title: '프로필 완성도', value: `${user?.profileCompletionRate || 0}%`, icon: Users, color: 'purple' as const }
          ],
          quickActions: [
            { label: '프로필 완성', path: '/mypage', icon: Users, color: 'primary' as const },
            { label: 'AI 챗봇 문의', path: '/chat-home', icon: MessageSquare, color: 'secondary' as const }
          ]
        };
    }
  };

  const { stats, quickActions } = getDashboardConfig();

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            안녕하세요, {user?.name}님! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            오늘도 Elderberry와 함께 성공적인 하루 되세요.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button variant="primary">
            <MessageSquare className="w-4 h-4 mr-2" />
            AI 챗봇 상담
          </Button>
        </div>
      </div>

      {/* 프로필 완성도 알림 (완성도가 100% 미만인 경우) */}
      {user && user.profileCompletionRate < 100 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
        >
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                프로필을 완성해주세요
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                프로필 완성도가 {user.profileCompletionRate}%입니다. 
                완전한 프로필은 더 많은 기회를 제공합니다.
              </p>
              <Link
              to="/mypage" 
              className="text-sm text-yellow-800 font-medium hover:text-yellow-900 mt-2 inline-flex items-center"
              >
              프로필 완성하기 <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 빠른 작업 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>빠른 작업</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.path}
                    to={action.path}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className={`
                      p-2 rounded-lg
                      ${action.color === 'primary' ? 'bg-elderberry-100 text-elderberry-600' : ''}
                      ${action.color === 'secondary' ? 'bg-gray-100 text-gray-600' : ''}
                      ${action.color === 'success' ? 'bg-green-100 text-green-600' : ''}
                    `}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-gray-900 group-hover:text-elderberry-600 transition-colors">
                      {action.label}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-elderberry-600 transition-colors" />
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* 최근 활동 */}
        <motion.div
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>최근 활동</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`
                      p-2 rounded-full
                      ${activity.type === 'job' ? 'bg-blue-100 text-blue-600' : ''}
                      ${activity.type === 'message' ? 'bg-green-100 text-green-600' : ''}
                      ${activity.type === 'application' ? 'bg-purple-100 text-purple-600' : ''}
                      ${activity.type === 'match' ? 'bg-orange-100 text-orange-600' : ''}
                    `}>
                      {activity.type === 'job' && <Briefcase className="w-4 h-4" />}
                      {activity.type === 'message' && <MessageSquare className="w-4 h-4" />}
                      {activity.type === 'application' && <FileText className="w-4 h-4" />}
                      {activity.type === 'match' && <Users className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        {activity.status && (
                          <span className={`
                            inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                            ${activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${activity.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                            ${activity.status === 'failed' ? 'bg-red-100 text-red-800' : ''}
                          `}>
                            {activity.status === 'pending' && '대기중'}
                            {activity.status === 'completed' && '완료'}
                            {activity.status === 'failed' && '실패'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link 
                  to="/activities" 
                  className="text-sm text-elderberry-600 hover:text-elderberry-800 font-medium inline-flex items-center"
                >
                  모든 활동 보기 <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}