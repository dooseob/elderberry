/**
 * 프로필 개요 컴포넌트
 * 사용자 기본 정보, 프로필 완성도, 통계 등을 표시하고 편집할 수 있는 기능 제공
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Edit3,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Award,
  Clock,
  Users,
  Star,
  Target
} from '../icons/LucideIcons';

import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { AuthUser, MemberRole } from '../../types/auth';
import { ProfileResponse } from '../../types/profile';
import ProfileEditModal from './ProfileEditModal';

interface ProfileOverviewProps {
  user: AuthUser;
  profile: ProfileResponse | null;
}

const ProfileOverview: React.FC<ProfileOverviewProps> = ({ user, profile }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 프로필 완성도 분석
  const getCompletionAnalysis = () => {
    const completionRate = user.profileCompletionRate;
    
    if (completionRate >= 90) {
      return {
        status: 'excellent',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: CheckCircle,
        message: '프로필이 거의 완성되었습니다!'
      };
    } else if (completionRate >= 70) {
      return {
        status: 'good',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: TrendingUp,
        message: '프로필을 더 완성해보세요.'
      };
    } else {
      return {
        status: 'needs-improvement',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        icon: AlertCircle,
        message: '프로필 완성도를 높여주세요.'
      };
    }
  };

  const completionAnalysis = getCompletionAnalysis();
  const CompletionIcon = completionAnalysis.icon;

  // 역할별 통계 데이터 (실제로는 API에서 가져옴)
  const getStatsForRole = (role: MemberRole) => {
    switch (role) {
      case MemberRole.CAREGIVER:
        return [
          { label: '매칭 성공', value: '12건', icon: Target, color: 'text-green-600' },
          { label: '평균 평점', value: '4.8점', icon: Star, color: 'text-yellow-500' },
          { label: '활동 기간', value: '8개월', icon: Clock, color: 'text-blue-600' },
          { label: '완료 케어', value: '5건', icon: Award, color: 'text-purple-600' }
        ];
      case MemberRole.COORDINATOR:
        return [
          { label: '매칭 성공', value: '45건', icon: Target, color: 'text-green-600' },
          { label: '고객 만족도', value: '96%', icon: Star, color: 'text-yellow-500' },
          { label: '활동 기간', value: '2년', icon: Clock, color: 'text-blue-600' },
          { label: '관리 회원', value: '23명', icon: Users, color: 'text-purple-600' }
        ];
      case MemberRole.EMPLOYER:
        return [
          { label: '등록 구인', value: '8건', icon: Target, color: 'text-green-600' },
          { label: '채용 성공', value: '6건', icon: Star, color: 'text-yellow-500' },
          { label: '활동 기간', value: '1년', icon: Clock, color: 'text-blue-600' },
          { label: '평균 평점', value: '4.7점', icon: Award, color: 'text-purple-600' }
        ];
      default:
        return [];
    }
  };

  const stats = getStatsForRole(user.role);

  // 최근 활동 데이터 (실제로는 API에서 가져옴)
  const recentActivities = [
    { date: '2025-01-25', action: '프로필 업데이트', status: 'completed' },
    { date: '2025-01-23', action: '시설 매칭 신청', status: 'pending' },
    { date: '2025-01-20', action: '리뷰 작성', status: 'completed' }
  ];

  return (
    <div className="space-y-6">
      {/* 프로필 완성도 및 액션 */}
      <Card className={`${completionAnalysis.bgColor} ${completionAnalysis.borderColor} border-2`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CompletionIcon className={`w-8 h-8 ${completionAnalysis.color}`} />
              <div>
                <h3 className={`text-lg font-semibold ${completionAnalysis.color}`}>
                  프로필 완성도 {user.profileCompletionRate}%
                </h3>
                <p className="text-gray-600">{completionAnalysis.message}</p>
              </div>
            </div>
            <Button
              variant="primary"
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center space-x-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>프로필 편집</span>
            </Button>
          </div>
          
          {/* 프로그레스 바 */}
          <div className="mt-4">
            <div className="bg-white rounded-full h-3 overflow-hidden">
              <motion.div
                className={`h-full ${
                  completionAnalysis.status === 'excellent' ? 'bg-green-500' :
                  completionAnalysis.status === 'good' ? 'bg-blue-500' : 'bg-orange-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${user.profileCompletionRate}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 기본 정보 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>기본 정보</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">이메일</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              
              {profile?.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">전화번호</p>
                    <p className="font-medium">{profile.phone}</p>
                  </div>
                </div>
              )}
              
              {profile?.address && (
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">주소</p>
                    <p className="font-medium">{profile.address}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">가입일</p>
                  <p className="font-medium">
                    {new Date(profile?.createdAt || Date.now()).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>
            </div>

            {profile?.introduction && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">자기소개</h4>
                <p className="text-gray-700 leading-relaxed">{profile.introduction}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 통계 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>활동 통계</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.map((stat, index) => {
                const StatIcon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <StatIcon className={`w-5 h-5 ${stat.color}`} />
                      <span className="text-gray-600">{stat.label}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{stat.value}</span>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 최근 활동 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>최근 활동</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    activity.status === 'completed' ? 'bg-green-400' : 'bg-yellow-400'
                  }`} />
                  <span className="text-gray-900">{activity.action}</span>
                </div>
                <span className="text-sm text-gray-500">{activity.date}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 프로필 편집 모달 */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        profile={profile}
      />
    </div>
  );
};

export default ProfileOverview;