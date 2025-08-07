/**
 * Route Wrappers - 동적 사용자 정보 기반 라우팅
 * Phase 2: 하드코딩된 값 제거를 위한 래퍼 컴포넌트들
 * 
 * @version 1.0.0
 * @description 인증된 사용자 정보를 기반으로 동적 props 전달
 */
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { lazy } from 'react';

// Hooks
import { useAuthStore } from '../stores/authStore';

// Lazy loaded components
const FacilitySearchPage = lazy(() => import('../features/facility/FacilitySearchPage'));
const HealthAssessmentWizard = lazy(() => import('../features/health/HealthAssessmentWizard'));

// Temporary admin components (향후 실제 컴포넌트로 교체)
const AdminMembersPage: React.FC = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">회원 관리</h1>
    <p className="text-gray-600 mt-2">관리자만 접근 가능한 회원 관리 페이지입니다.</p>
    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
      <p className="text-blue-800">🚧 개발 중인 기능입니다.</p>
    </div>
  </div>
);

const AdminFacilitiesPage: React.FC = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">시설 관리</h1>
    <p className="text-gray-600 mt-2">관리자만 접근 가능한 시설 관리 페이지입니다.</p>
    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
      <p className="text-blue-800">🚧 개발 중인 기능입니다.</p>
    </div>
  </div>
);

const CoordinatorMembersPage: React.FC = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">회원 관리</h1>
    <p className="text-gray-600 mt-2">코디네이터만 접근 가능한 회원 관리 페이지입니다.</p>
    <div className="mt-4 p-4 bg-purple-50 rounded-lg">
      <p className="text-purple-800">🚧 개발 중인 기능입니다.</p>
    </div>
  </div>
);

/**
 * 시설 검색 페이지 래퍼
 * 인증된 사용자 정보를 기반으로 동적 props 전달
 */
export const FacilitySearchPageWrapper: React.FC = () => {
  const { user } = useAuthStore();
  
  // 사용자 정보 기반 props 계산
  const facilitySearchProps = useMemo(() => ({
    memberId: user?.id || undefined,
    coordinatorId: user?.role === 'COORDINATOR' ? `coordinator-${user.id}` : undefined,
    showRecommendations: true,
  }), [user]);

  // 사용자가 로그인하지 않은 경우 처리
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <p className="text-gray-600">사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return <FacilitySearchPage {...facilitySearchProps} />;
};

/**
 * 건강 평가 위저드 래퍼
 * 인증된 사용자 정보와 네비게이션 로직 통합
 */
export const HealthAssessmentWizardWrapper: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // 건강 평가 완료 핸들러
  const handleComplete = (assessmentId: string) => {
    console.log('건강 평가 완료', { assessmentId, userId: user?.id });
    
    // 완료 후 시설 검색 페이지로 이동
    navigate('/facility-search', { 
      state: { 
        fromHealthAssessment: true, 
        assessmentId 
      }
    });
  };

  // 건강 평가 취소 핸들러
  const handleCancel = () => {
    console.log('건강 평가 취소', { userId: user?.id });
    
    // 취소 시 대시보드로 이동
    navigate('/dashboard');
  };

  // 사용자가 로그인하지 않은 경우 처리
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <p className="text-gray-600">사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <HealthAssessmentWizard 
      memberId={user.id.toString()}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  );
};

/**
 * 관리자 회원 관리 페이지 래퍼
 */
export const AdminMembersPageWrapper: React.FC = () => {
  const { user } = useAuthStore();

  // 관리자 권한 확인
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <p className="text-red-600">관리자 권한이 필요합니다.</p>
        </div>
      </div>
    );
  }

  return <AdminMembersPage />;
};

/**
 * 관리자 시설 관리 페이지 래퍼
 */
export const AdminFacilitiesPageWrapper: React.FC = () => {
  const { user } = useAuthStore();

  // 관리자 권한 확인
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <p className="text-red-600">관리자 권한이 필요합니다.</p>
        </div>
      </div>
    );
  }

  return <AdminFacilitiesPage />;
};

/**
 * 코디네이터 회원 관리 페이지 래퍼
 */
export const CoordinatorMembersPageWrapper: React.FC = () => {
  const { user } = useAuthStore();

  // 코디네이터 권한 확인
  if (!user || !['COORDINATOR', 'ADMIN'].includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <p className="text-red-600">코디네이터 권한이 필요합니다.</p>
        </div>
      </div>
    );
  }

  return <CoordinatorMembersPage />;
};

/**
 * 라우트 래퍼 메타데이터
 * 디버깅과 모니터링을 위한 정보
 */
export const ROUTE_WRAPPER_METADATA = {
  FacilitySearchPageWrapper: {
    description: '시설 검색 페이지 - 사용자 정보 기반 동적 props',
    requiredAuth: true,
    dynamicProps: ['memberId', 'coordinatorId'],
  },
  HealthAssessmentWizardWrapper: {
    description: '건강 평가 위저드 - 사용자 정보와 네비게이션 통합',
    requiredAuth: true,
    dynamicProps: ['memberId'],
    navigationLogic: ['onComplete', 'onCancel'],
  },
  AdminMembersPageWrapper: {
    description: '관리자 회원 관리 - 관리자 권한 필요',
    requiredAuth: true,
    requiredRole: 'ADMIN',
  },
  AdminFacilitiesPageWrapper: {
    description: '관리자 시설 관리 - 관리자 권한 필요',
    requiredAuth: true,
    requiredRole: 'ADMIN',
  },
  CoordinatorMembersPageWrapper: {
    description: '코디네이터 회원 관리 - 코디네이터 권한 필요',
    requiredAuth: true,
    requiredRole: ['COORDINATOR', 'ADMIN'],
  },
} as const;

export default {
  FacilitySearchPageWrapper,
  HealthAssessmentWizardWrapper,
  AdminMembersPageWrapper,
  AdminFacilitiesPageWrapper,
  CoordinatorMembersPageWrapper,
};