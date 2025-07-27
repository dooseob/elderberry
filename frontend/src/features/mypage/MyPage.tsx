/**
 * 마이페이지 메인 컴포넌트
 * 사용자의 모든 정보와 활동을 종합적으로 관리하는 페이지
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Star,
  MapPin,
  Briefcase,
  Settings,
  Activity,
  Edit3,
  Shield,
  Award,
  Calendar,
  TrendingUp
} from '../../components/icons/LucideIcons';
import { useAuthStore } from '../../stores/authStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ProfileOverview } from './components/ProfileOverview';
import { MyReviews } from './components/MyReviews';
import { MatchingHistory } from './components/MatchingHistory';
import { JobApplications } from './components/JobApplications';
import { AccountSettings } from './components/AccountSettings';
import { ActivityHistory } from './components/ActivityHistory';

/**
 * 마이페이지 탭 타입
 */
type MyPageTab = 'overview' | 'reviews' | 'matching' | 'jobs' | 'settings' | 'activity';

/**
 * 탭 정보 인터페이스
 */
interface TabInfo {
  key: MyPageTab;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  badge?: number;
  roles?: string[]; // 특정 역할에만 표시
}

/**
 * 마이페이지 메인 컴포넌트
 */
export const MyPage: React.FC = () => {
  // 상태 관리
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<MyPageTab>('overview');
  const [profileCompletion, setProfileCompletion] = useState(0);

  // 탭 설정
  const tabs: TabInfo[] = [
    {
      key: 'overview',
      label: '프로필 개요',
      icon: User,
      description: '기본 정보 및 프로필 현황'
    },
    {
      key: 'reviews',
      label: '내 리뷰',
      icon: Star,
      description: '작성한 리뷰 및 평점 관리',
      badge: 0 // 실제 리뷰 수로 업데이트 예정
    },
    {
      key: 'matching',
      label: '매칭 이력',
      icon: MapPin,
      description: '시설 매칭 신청 및 결과',
      roles: ['CAREGIVER', 'COORDINATOR']
    },
    {
      key: 'jobs',
      label: '지원 현황',
      icon: Briefcase,
      description: '구직/구인 활동 현황',
      roles: ['CAREGIVER', 'EMPLOYER']
    },
    {
      key: 'settings',
      label: '계정 설정',
      icon: Settings,
      description: '비밀번호 변경 및 알림 설정'
    },
    {
      key: 'activity',
      label: '활동 내역',
      icon: Activity,
      description: '로그인 및 활동 기록'
    }
  ];

  // 사용자 역할에 따른 탭 필터링
  const visibleTabs = tabs.filter(tab => {
    if (!tab.roles) return true;
    return user?.role && tab.roles.includes(user.role);
  });

  // 프로필 완성도 계산
  useEffect(() => {
    if (user) {
      let completed = 0;
      const totalFields = 10;

      if (user.name) completed++;
      if (user.email) completed++;
      if (user.phone) completed++;
      if (user.profileImageUrl) completed++;
      if (user.bio) completed++;
      // 추가 필드들에 대한 검증 로직
      
      setProfileCompletion(Math.round((completed / totalFields) * 100));
    }
  }, [user]);

  // 인증되지 않은 사용자 처리
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            로그인이 필요합니다
          </h2>
          <p className="text-gray-600 mb-4">
            마이페이지를 이용하려면 로그인을 해주세요.
          </p>
          <Button href="/login">로그인하기</Button>
        </Card>
      </div>
    );
  }

  // 역할별 배지 색상
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'CAREGIVER':
        return 'bg-blue-100 text-blue-800';
      case 'COORDINATOR':
        return 'bg-green-100 text-green-800';
      case 'EMPLOYER':
        return 'bg-purple-100 text-purple-800';
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 역할별 표시명
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'CAREGIVER':
        return '요양보호사';
      case 'COORDINATOR':
        return '코디네이터';
      case 'EMPLOYER':
        return '구인업체';
      case 'ADMIN':
        return '관리자';
      default:
        return '일반회원';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center space-x-6">
              {/* 프로필 이미지 */}
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                
                {/* 프로필 완성도 링 */}
                <div className="absolute -top-1 -right-1">
                  <div className="relative h-6 w-6">
                    <svg className="h-6 w-6 transform -rotate-90">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        className="text-gray-200"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 10}`}
                        strokeDashoffset={`${2 * Math.PI * 10 * (1 - profileCompletion / 100)}`}
                        className="text-blue-500 transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">
                        {profileCompletion}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 사용자 정보 */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.name || '사용자'}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(user.role)}`}>
                    {getRoleDisplayName(user.role)}
                  </span>
                  {user.verified && (
                    <div className="flex items-center space-x-1">
                      <Award className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">인증됨</span>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-600 mb-2">{user.email}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>가입일: {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                  {user.lastLoginAt && (
                    <div className="flex items-center space-x-1">
                      <Activity className="h-4 w-4" />
                      <span>최근 접속: {new Date(user.lastLoginAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 프로필 완성도 표시 */}
              <div className="text-right">
                <div className="text-sm text-gray-600 mb-1">프로필 완성도</div>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {profileCompletion}%
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${profileCompletion}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {profileCompletion < 100 ? '프로필을 완성해보세요!' : '프로필 완성!'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto" aria-label="마이페이지 탭">
            {visibleTabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.key;
              
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`group flex items-center py-4 px-1 border-b-2 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`tabpanel-${tab.key}`}
                  id={`tab-${tab.key}`}
                >
                  <IconComponent className={`mr-2 h-5 w-5 ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                  <span className="whitespace-nowrap">{tab.label}</span>
                  {tab.badge && tab.badge > 0 && (
                    <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            role="tabpanel"
            id={`tabpanel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
          >
            {activeTab === 'overview' && <ProfileOverview user={user} />}
            {activeTab === 'reviews' && <MyReviews />}
            {activeTab === 'matching' && <MatchingHistory />}
            {activeTab === 'jobs' && <JobApplications />}
            {activeTab === 'settings' && <AccountSettings />}
            {activeTab === 'activity' && <ActivityHistory />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};