/**
 * 프로필 개요 및 완성도 현황 컴포넌트
 * 사용자의 기본 정보, 프로필 완성도, 빠른 액션 등을 제공
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Edit3,
  Shield,
  Award,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Star,
  Activity,
  Users
} from '../../../components/icons/LucideIcons';
import { Card } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { AuthUser } from '../../../types/auth';
import { useProfileStore } from '../../../stores/profileStore';
import { useReviewStore } from '../../../stores/reviewStore';

interface ProfileOverviewProps {
  user: AuthUser;
}

interface ProfileItem {
  key: string;
  label: string;
  value: any;
  required: boolean;
  weight: number;
}

interface QuickAction {
  label: string;
  icon: React.ComponentType<any>;
  href?: string;
  onClick?: () => void;
  color: string;
  description: string;
}

/**
 * 프로필 개요 컴포넌트
 */
export const ProfileOverview: React.FC<ProfileOverviewProps> = ({ user }) => {
  // 상태 관리
  const { profile, loading, fetchProfile } = useProfileStore();
  const { reviews, fetchMyReviews } = useReviewStore();
  const [profileItems, setProfileItems] = useState<ProfileItem[]>([]);
  const [completionDetails, setCompletionDetails] = useState({
    completed: 0,
    total: 0,
    percentage: 0
  });

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchProfile();
    fetchMyReviews();
  }, [fetchProfile, fetchMyReviews]);

  // 프로필 완성도 계산
  useEffect(() => {
    if (profile) {
      const items: ProfileItem[] = [
        { key: 'name', label: '이름', value: profile.name, required: true, weight: 10 },
        { key: 'email', label: '이메일', value: profile.email, required: true, weight: 10 },
        { key: 'phone', label: '전화번호', value: profile.phone, required: true, weight: 10 },
        { key: 'profileImage', label: '프로필 사진', value: profile.profileImageUrl, required: false, weight: 5 },
        { key: 'bio', label: '자기소개', value: profile.bio, required: false, weight: 10 },
        { key: 'address', label: '주소', value: profile.address, required: false, weight: 10 },
        { key: 'birthDate', label: '생년월일', value: profile.birthDate, required: false, weight: 5 },
        { key: 'gender', label: '성별', value: profile.gender, required: false, weight: 5 },
        { key: 'emergencyContact', label: '비상연락처', value: profile.emergencyContact, required: false, weight: 10 },
        { key: 'experience', label: '경력', value: profile.experience, required: false, weight: 15 }
      ];

      const completed = items.filter(item => item.value).length;
      const total = items.length;
      const percentage = Math.round((completed / total) * 100);

      setProfileItems(items);
      setCompletionDetails({ completed, total, percentage });
    }
  }, [profile]);

  // 역할별 퀵 액션
  const getQuickActions = (): QuickAction[] => {
    const baseActions: QuickAction[] = [
      {
        label: '프로필 수정',
        icon: Edit3,
        href: '/profile/edit',
        color: 'blue',
        description: '기본 정보를 수정합니다'
      },
      {
        label: '계정 설정',
        icon: Shield,
        onClick: () => {}, // 탭 변경 로직
        color: 'gray',
        description: '보안 및 알림 설정을 관리합니다'
      }
    ];

    if (user.role === 'CAREGIVER') {
      baseActions.push(
        {
          label: '자격증 관리',
          icon: Award,
          href: '/profile/certificates',
          color: 'green',
          description: '자격증 정보를 등록하고 관리합니다'
        },
        {
          label: '경력 관리',
          icon: TrendingUp,
          href: '/profile/experience',
          color: 'purple',
          description: '경력 사항을 등록하고 관리합니다'
        }
      );
    }

    if (user.role === 'EMPLOYER') {
      baseActions.push({
        label: '시설 정보',
        icon: MapPin,
        href: '/facility/manage',
        color: 'orange',
        description: '시설 정보를 관리합니다'
      });
    }

    return baseActions;
  };

  // 통계 정보
  const getStatistics = () => {
    return [
      {
        label: '가입일',
        value: new Date(user.createdAt || Date.now()).toLocaleDateString(),
        icon: Calendar,
        color: 'text-gray-600'
      },
      {
        label: '프로필 완성도',
        value: `${completionDetails.percentage}%`,
        icon: TrendingUp,
        color: completionDetails.percentage >= 80 ? 'text-green-600' : 'text-orange-600'
      },
      {
        label: '작성한 리뷰',
        value: reviews.length,
        icon: Star,
        color: 'text-yellow-600'
      },
      {
        label: '활동 점수',
        value: calculateActivityScore(),
        icon: Activity,
        color: 'text-blue-600'
      }
    ];
  };

  // 활동 점수 계산
  const calculateActivityScore = (): number => {
    let score = 0;
    score += completionDetails.percentage * 0.5; // 프로필 완성도
    score += reviews.length * 5; // 리뷰 작성
    score += user.verified ? 20 : 0; // 인증 여부
    return Math.round(score);
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 프로필 완성도 카드 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">프로필 완성도</h2>
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${
            completionDetails.percentage >= 80 
              ? 'bg-green-100 text-green-800' 
              : completionDetails.percentage >= 50 
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
          }`}>
            {completionDetails.completed}/{completionDetails.total} 완료
          </span>
        </div>

        {/* 진행률 표시 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">전체 진행률</span>
            <span className="text-sm font-bold text-blue-600">{completionDetails.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className="bg-blue-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionDetails.percentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* 프로필 항목 체크리스트 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profileItems.map((item) => (
            <motion.div
              key={item.key}
              className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.02 }}
            >
              {item.value ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className={`h-5 w-5 ${item.required ? 'text-red-500' : 'text-gray-400'}`} />
              )}
              <div className="flex-1">
                <span className={`text-sm font-medium ${
                  item.value ? 'text-gray-900' : 'text-gray-600'
                }`}>
                  {item.label}
                  {item.required && !item.value && <span className="text-red-500 ml-1">*</span>}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {completionDetails.percentage < 100 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 프로필을 완성하면 더 많은 매칭 기회를 얻을 수 있습니다!
            </p>
          </div>
        )}
      </Card>

      {/* 통계 정보 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {getStatistics().map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 text-center">
              <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
              <div className="text-lg font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* 퀵 액션 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 작업</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {getQuickActions().map((action, index) => (
            <motion.div
              key={action.label}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                size="lg"
                className="w-full h-auto p-4 flex flex-col items-center space-y-2"
                href={action.href}
                onClick={action.onClick}
              >
                <action.icon className={`h-6 w-6 text-${action.color}-500`} />
                <div className="text-center">
                  <div className="font-medium">{action.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{action.description}</div>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* 최근 활동 요약 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 활동</h3>
        <div className="space-y-3">
          {user.lastLoginAt && (
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Activity className="h-4 w-4" />
              <span>마지막 로그인: {new Date(user.lastLoginAt).toLocaleString()}</span>
            </div>
          )}
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <Star className="h-4 w-4" />
            <span>작성한 리뷰: {reviews.length}개</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>활동 점수: {calculateActivityScore()}점</span>
          </div>
        </div>
      </Card>
    </div>
  );
};