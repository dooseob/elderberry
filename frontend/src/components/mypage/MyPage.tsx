/**
 * 마이페이지 컴포넌트
 * 사용자 프로필 개요, 리뷰, 매칭 이력, 지원서, 계정 설정 등을 관리하는 종합 대시보드
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Settings, 
  Heart, 
  MapPin, 
  Briefcase, 
  Activity, 
  Bell,
  Shield,
  Star,
  Calendar,
  FileText,
  ChevronRight,
  Edit,
  Camera
} from '../icons/LucideIcons';

// 컴포넌트 imports
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { useProfileStore } from '../../stores/profileStore';
import { useReviewStore } from '../../stores/reviewStore';
import { useJobStore } from '../../stores/jobStore';

// 서브 컴포넌트 imports
import ProfileOverview from './ProfileOverview';
import MyReviews from './MyReviews';
import MatchingHistory from './MatchingHistory';
import JobApplications from './JobApplications';
import AccountSettings from './AccountSettings';
import ActivityHistory from './ActivityHistory';

// 탭 정의
type TabType = 'overview' | 'reviews' | 'matching' | 'jobs' | 'settings' | 'activity';

interface TabInfo {
  id: TabType;
  label: string;
  icon: React.ElementType;
  description: string;
  badge?: number;
}

const MyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const { user, isLoading: authLoading } = useAuthStore();
  const { currentProfile, getProfile } = useProfileStore();
  const { myReviews, loadMyReviews } = useReviewStore();
  const { applications, loadMyApplications } = useJobStore();

  // 사용자 정보가 있을 때 프로필과 관련 데이터 로드
  useEffect(() => {
    if (user?.id) {
      getProfile(user.id);
      loadMyReviews();
      loadMyApplications();
    }
  }, [user?.id, getProfile, loadMyReviews, loadMyApplications]);

  // 탭 정보 배열
  const tabs: TabInfo[] = [
    {
      id: 'overview',
      label: '프로필 개요',
      icon: User,
      description: '기본 정보 및 완성도'
    },
    {
      id: 'reviews',
      label: '내 리뷰',
      icon: Star,
      description: '작성한 리뷰 및 평점',
      badge: myReviews.length
    },
    {
      id: 'matching',
      label: '매칭 이력',
      icon: Heart,
      description: '시설 매칭 기록'
    },
    {
      id: 'jobs',
      label: '지원 현황',
      icon: Briefcase,
      description: '구직 지원서 관리',
      badge: applications.length
    },
    {
      id: 'settings',
      label: '계정 설정',
      icon: Settings,
      description: '비밀번호 및 알림 설정'
    },
    {
      id: 'activity',
      label: '활동 내역',
      icon: Activity,
      description: '최근 활동 기록'
    }
  ];

  // 로딩 상태
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-elderberry-600 mx-auto mb-4"></div>
          <p className="text-gray-600">프로필 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 탭 렌더링 함수
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ProfileOverview user={user} profile={currentProfile} />;
      case 'reviews':
        return <MyReviews reviews={myReviews} />;
      case 'matching':
        return <MatchingHistory userId={user.id} />;
      case 'jobs':
        return <JobApplications applications={applications} />;
      case 'settings':
        return <AccountSettings user={user} />;
      case 'activity':
        return <ActivityHistory userId={user.id} />;
      default:
        return <ProfileOverview user={user} profile={currentProfile} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 영역 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center space-x-6">
              {/* 프로필 이미지 */}
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-elderberry-400 to-elderberry-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* 사용자 정보 */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.role === 'CAREGIVER' ? 'bg-green-100 text-green-800' :
                    user.role === 'COORDINATOR' ? 'bg-blue-100 text-blue-800' :
                    user.role === 'EMPLOYER' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role === 'CAREGIVER' ? '요양보호사' :
                     user.role === 'COORDINATOR' ? '코디네이터' :
                     user.role === 'EMPLOYER' ? '구인업체' : '관리자'}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{user.email}</p>
                
                {/* 프로필 완성도 */}
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">프로필 완성도</span>
                  <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-elderberry-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${user.profileCompletionRate}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-elderberry-600">
                    {user.profileCompletionRate}%
                  </span>
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('overview')}
                  className="flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>프로필 편집</span>
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setActiveTab('settings')}
                  className="flex items-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>설정</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 사이드바 - 탭 네비게이션 */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">메뉴</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    
                    return (
                      <motion.button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center justify-between px-6 py-4 text-left transition-colors ${
                          isActive 
                            ? 'bg-elderberry-50 text-elderberry-700 border-r-2 border-elderberry-600' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-5 h-5 ${isActive ? 'text-elderberry-600' : 'text-gray-400'}`} />
                          <div>
                            <div className="font-medium">{tab.label}</div>
                            <div className="text-xs text-gray-500">{tab.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {tab.badge !== undefined && tab.badge > 0 && (
                            <span className="bg-elderberry-100 text-elderberry-700 text-xs font-medium px-2 py-1 rounded-full">
                              {tab.badge}
                            </span>
                          )}
                          <ChevronRight className={`w-4 h-4 transition-transform ${
                            isActive ? 'rotate-90 text-elderberry-600' : 'text-gray-400'
                          }`} />
                        </div>
                      </motion.button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* 메인 컨텐츠 영역 */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;