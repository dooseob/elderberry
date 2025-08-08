/**
 * 프로필 수정 페이지
 * Pages 레이어 - 프로필 수정 전용 페이지
 */
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  useCurrentUser,
  useUserActions,
  useUserState 
} from '../../entities/user';
import { 
  ProfileEditForm,
  JobSeekerToggle 
} from '../../features/profile/components';
import { 
  Button,
  Card,
  LoadingSpinner 
} from '../../shared/ui';
import { Header } from '../../widgets/header';
import { Footer } from '../../widgets/footer';
import { PageContainer } from '../../widgets/layout';

const ProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  
  // 상태 관리
  const currentUser = useCurrentUser();
  const { fetchCurrentUser } = useUserActions();
  const { loading, error } = useUserState();

  // 초기 데이터 로드
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // 성공 시 마이페이지로 이동
  const handleSuccess = () => {
    // 잠시 후 마이페이지로 이동 (사용자가 성공 메시지를 볼 수 있도록)
    setTimeout(() => {
      navigate('/mypage', { replace: true });
    }, 2000);
  };

  // 취소 시 마이페이지로 이동
  const handleCancel = () => {
    navigate('/mypage');
  };

  // 뒤로 가기
  const handleBack = () => {
    navigate(-1);
  };

  // 로딩 중
  if (loading.profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <PageContainer>
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <LoadingSpinner size="large" />
              <p className="mt-4 text-lg text-gray-600">
                프로필 정보를 불러오는 중...
              </p>
            </div>
          </div>
        </PageContainer>
        <Footer />
      </div>
    );
  }

  // 에러 상태
  if (error && error.status === 404) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <PageContainer>
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <svg 
                  className="w-20 h-20 mx-auto text-gray-400" 
                  fill="none" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                사용자 정보를 찾을 수 없습니다
              </h1>
              <p className="text-gray-600 mb-6">
                로그인 상태를 확인하고 다시 시도해주세요.
              </p>
              <div className="space-x-4">
                <Button
                  variant="primary"
                  onClick={() => navigate('/login')}
                >
                  로그인
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                >
                  홈으로
                </Button>
              </div>
            </div>
          </div>
        </PageContainer>
        <Footer />
      </div>
    );
  }

  // 기타 에러
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <PageContainer>
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <svg 
                  className="w-20 h-20 mx-auto text-red-400" 
                  fill="none" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                오류가 발생했습니다
              </h1>
              <p className="text-gray-600 mb-6">
                {error.message}
              </p>
              <div className="space-x-4">
                <Button
                  variant="primary"
                  onClick={() => fetchCurrentUser()}
                >
                  다시 시도
                </Button>
                <Button
                  variant="outline"
                  onClick={handleBack}
                >
                  뒤로 가기
                </Button>
              </div>
            </div>
          </div>
        </PageContainer>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <PageContainer className="py-8">
        <div className="max-w-4xl mx-auto">
          {/* 페이지 헤더 */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  프로필 관리
                </h1>
                <p className="mt-2 text-gray-600">
                  개인정보와 구직자 상태를 관리하세요.
                </p>
              </div>
              
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex items-center"
              >
                <svg 
                  className="w-4 h-4 mr-2" 
                  fill="none" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path d="M15 19l-7-7 7-7" />
                </svg>
                뒤로 가기
              </Button>
            </div>
          </div>

          {/* 콘텐츠 영역 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 프로필 수정 폼 (메인 콘텐츠) */}
            <div className="lg:col-span-2">
              <ProfileEditForm
                onSuccess={handleSuccess}
                onCancel={handleCancel}
                showCancelButton={true}
              />
            </div>

            {/* 사이드바 */}
            <div className="space-y-6">
              {/* 구직자 상태 토글 */}
              <JobSeekerToggle />

              {/* 계정 정보 카드 */}
              {currentUser && (
                <Card className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    계정 정보
                  </h3>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="font-medium text-gray-700">가입일</dt>
                      <dd className="mt-1 text-gray-600">
                        {new Date(currentUser.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-700">최근 업데이트</dt>
                      <dd className="mt-1 text-gray-600">
                        {new Date(currentUser.updatedAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-700">회원 ID</dt>
                      <dd className="mt-1 text-gray-600 font-mono text-xs">
                        {currentUser.id}
                      </dd>
                    </div>
                  </dl>
                </Card>
              )}

              {/* 도움말 카드 */}
              <Card className="p-6 bg-blue-50 border-blue-200">
                <h3 className="text-lg font-medium text-blue-900 mb-3">
                  💡 도움말
                </h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>• 이름은 반드시 입력해야 합니다</li>
                  <li>• 전화번호는 010-1234-5678 형식으로 입력하세요</li>
                  <li>• 구직자 상태 활성화 시 매칭 서비스를 받을 수 있습니다</li>
                  <li>• 정보 변경 후 반드시 저장 버튼을 클릭하세요</li>
                </ul>
              </Card>

              {/* 보안 관련 안내 */}
              <Card className="p-6 bg-amber-50 border-amber-200">
                <h3 className="text-lg font-medium text-amber-900 mb-3">
                  🔒 보안 안내
                </h3>
                <p className="text-sm text-amber-800">
                  개인정보 보호를 위해 비밀번호는 별도 페이지에서 변경하실 수 있습니다.
                  이메일 주소 변경은 고객센터에 문의해주세요.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </PageContainer>
      
      <Footer />
    </div>
  );
};

export default ProfileEditPage;