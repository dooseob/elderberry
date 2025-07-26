/**
 * 프로필 상세 페이지
 * 프로필 정보 조회, 완성도 추적, 문서 만료 알림 등 제공
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Globe,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Heart,
  Shield,
  CreditCard,
  Users,
  Edit,
  Trash2,
  ArrowLeft,
  Download,
  Share2,
  Loader2,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  Info
} from 'lucide-react';
import {
  useProfileStore,
  useCurrentProfile,
  useProfileLoading,
  useProfileError,
  useCompletionStatus,
  useDocumentValidity,
  useImprovementSuggestions
} from '../../stores/profileStore';
import {
  ProfileType,
  DomesticProfileResponse,
  OverseasProfileResponse,
  LtciGradeInfo,
  LTCI_GRADE_INFO
} from '../../types/profile';
import { useAuth } from '../../stores/authStore';
import { formatDate, calculateAge } from '../../utils/profileUtils';

// ===== 메인 컴포넌트 =====

const ProfileDetailPage: React.FC = () => {
  const { profileType, profileId } = useParams<{ profileType: string; profileId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // 스토어 상태
  const currentProfile = useCurrentProfile();
  const loading = useProfileLoading();
  const error = useProfileError();
  const completionStatus = useCompletionStatus();
  const documentValidity = useDocumentValidity();
  const improvementSuggestions = useImprovementSuggestions();
  
  const {
    getProfileById,
    getProfileCompletion,
    getDocumentValidity,
    getImprovementSuggestions,
    getActivityLog,
    deleteProfile,
    clearError
  } = useProfileStore();

  // 로컬 상태
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'completion' | 'documents' | 'activity'>('details');

  // ===== 초기 데이터 로드 =====

  useEffect(() => {
    if (profileId && profileType) {
      loadProfileData();
    }
  }, [profileId, profileType]);

  const loadProfileData = async () => {
    if (!profileId || !profileType) return;
    
    const type = profileType.toUpperCase() as ProfileType;
    const id = parseInt(profileId);
    
    try {
      await getProfileById(id, type);
      
      // 추가 데이터 로드
      await Promise.all([
        getProfileCompletion(id, type),
        type === ProfileType.OVERSEAS ? getDocumentValidity(id) : Promise.resolve(),
        getImprovementSuggestions(id),
        getActivityLog(id)
      ]);
    } catch (error) {
      console.error('프로필 데이터 로드 실패:', error);
    }
  };

  // ===== 이벤트 핸들러 =====

  const handleEdit = () => {
    navigate(`/profiles/${profileType}/${profileId}/edit`);
  };

  const handleDelete = async () => {
    if (!profileId) return;
    
    try {
      await deleteProfile(parseInt(profileId));
      navigate('/profiles');
    } catch (error) {
      console.error('프로필 삭제 실패:', error);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.share({
        title: '프로필 상세',
        url: url
      });
    } catch (error) {
      // Fallback: 클립보드에 복사
      navigator.clipboard.writeText(url);
      alert('링크가 클립보드에 복사되었습니다.');
    }
  };

  // ===== 유틸리티 함수들 =====

  const getProfileTypeName = (type: ProfileType) => {
    return type === ProfileType.DOMESTIC ? '국내 프로필' : '해외 프로필';
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const maskSensitiveData = (data: string, visible: boolean) => {
    if (visible) return data;
    if (data.length <= 4) return '****';
    return data.substring(0, 2) + '*'.repeat(data.length - 4) + data.substring(data.length - 2);
  };

  // ===== 렌더링 =====

  if (loading.profile) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">프로필을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-red-800">오류 발생</h3>
              <p className="text-red-700 mt-1">{error.message}</p>
              <button
                onClick={() => navigate('/profiles')}
                className="mt-4 btn-secondary"
              >
                목록으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">프로필을 찾을 수 없습니다</h3>
          <button
            onClick={() => navigate('/profiles')}
            className="btn-primary"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const isOverseas = currentProfile.profileType === ProfileType.OVERSEAS;
  const overseasProfile = currentProfile as OverseasProfileResponse;
  const domesticProfile = currentProfile as DomesticProfileResponse;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/profiles')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  프로필 상세
                </h1>
                <p className="text-gray-600 mt-1">
                  {getProfileTypeName(currentProfile.profileType)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
                className="btn-secondary"
              >
                {showSensitiveInfo ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    민감정보 숨기기
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    민감정보 보기
                  </>
                )}
              </button>
              
              <button
                onClick={handleShare}
                className="btn-secondary"
              >
                <Share2 className="w-4 h-4 mr-2" />
                공유
              </button>
              
              <button
                onClick={loadProfileData}
                className="btn-secondary"
                disabled={loading.profile}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleEdit}
                className="btn-primary"
              >
                <Edit className="w-4 h-4 mr-2" />
                수정
              </button>
              
              {user?.role.includes('ADMIN') && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn-danger"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  삭제
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽 컬럼 - 기본 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 프로필 헤더 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {(currentProfile as any).memberName || '이름 없음'}
                    </h2>
                    <p className="text-gray-600">{(currentProfile as any).memberEmail}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                        isOverseas ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {getProfileTypeName(currentProfile.profileType)}
                      </span>
                      {currentProfile.birthDate && (
                        <span className="text-sm text-gray-600">
                          {calculateAge(currentProfile.birthDate)}세
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className={`px-4 py-2 rounded-lg border ${getCompletionColor(currentProfile.profileCompletionPercentage)}`}>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {currentProfile.profileCompletionPercentage}%
                    </div>
                    <div className="text-xs">완성도</div>
                  </div>
                </div>
              </div>

              {/* 경고 알림 */}
              {isOverseas && documentValidity?.overall.hasExpiringDocuments && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">문서 만료 경고</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        만료 예정인 문서가 있습니다. 갱신이 필요합니다.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 탭 네비게이션 */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: 'details', label: '기본 정보', icon: User },
                    { id: 'completion', label: '완성도', icon: CheckCircle },
                    ...(isOverseas ? [{ id: 'documents', label: '문서', icon: FileText }] : []),
                    { id: 'activity', label: '활동 이력', icon: Clock }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <tab.icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* 탭 콘텐츠 */}
              <div className="mt-6">
                {activeTab === 'details' && (
                  <ProfileDetailsTab
                    profile={currentProfile}
                    showSensitive={showSensitiveInfo}
                  />
                )}
                
                {activeTab === 'completion' && (
                  <CompletionTab
                    profile={currentProfile}
                    completionStatus={completionStatus}
                    suggestions={improvementSuggestions}
                  />
                )}
                
                {activeTab === 'documents' && isOverseas && (
                  <DocumentsTab
                    profile={overseasProfile}
                    documentValidity={documentValidity}
                    showSensitive={showSensitiveInfo}
                  />
                )}
                
                {activeTab === 'activity' && (
                  <ActivityTab profileId={currentProfile.id!} />
                )}
              </div>
            </div>
          </div>

          {/* 오른쪽 컬럼 - 사이드바 */}
          <div className="space-y-6">
            {/* 요약 정보 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">요약 정보</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">생성일</span>
                  <span className="text-sm font-medium">
                    {formatDate(currentProfile.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">수정일</span>
                  <span className="text-sm font-medium">
                    {formatDate(currentProfile.updatedAt)}
                  </span>
                </div>
                {currentProfile.careLevel && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">케어 레벨</span>
                    <span className="text-sm font-medium">
                      {currentProfile.careLevel}
                    </span>
                  </div>
                )}
                {currentProfile.budgetRange && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">예산 범위</span>
                    <span className="text-sm font-medium">
                      {currentProfile.budgetRange}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* LTCI 정보 (국내 프로필만) */}
            {!isOverseas && domesticProfile.ltciGrade && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">장기요양등급</h3>
                <LtciGradeCard ltciGrade={domesticProfile.ltciGrade} />
              </div>
            )}

            {/* 개선 제안 */}
            {improvementSuggestions.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">개선 제안</h3>
                <div className="space-y-3">
                  {improvementSuggestions.slice(0, 3).map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <h4 className="text-sm font-medium text-blue-900">
                        {suggestion.title}
                      </h4>
                      <p className="text-xs text-blue-700 mt-1">
                        {suggestion.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          loading={loading.delete}
        />
      )}
    </div>
  );
};

// ===== 하위 컴포넌트들 =====

interface ProfileDetailsTabProps {
  profile: DomesticProfileResponse | OverseasProfileResponse;
  showSensitive: boolean;
}

const ProfileDetailsTab: React.FC<ProfileDetailsTabProps> = ({ profile, showSensitive }) => {
  const isOverseas = profile.profileType === ProfileType.OVERSEAS;
  const overseasProfile = profile as OverseasProfileResponse;
  const domesticProfile = profile as DomesticProfileResponse;

  const maskSensitiveData = (data: string, visible: boolean) => {
    if (visible) return data;
    if (data.length <= 4) return '****';
    return data.substring(0, 2) + '*'.repeat(data.length - 4) + data.substring(data.length - 2);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 기본 정보 */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900 flex items-center">
          <User className="w-5 h-5 mr-2 text-blue-600" />
          기본 정보
        </h4>
        
        {profile.birthDate && (
          <div>
            <label className="block text-sm font-medium text-gray-700">생년월일</label>
            <p className="mt-1 text-sm text-gray-900">{profile.birthDate}</p>
          </div>
        )}
        
        {profile.gender && (
          <div>
            <label className="block text-sm font-medium text-gray-700">성별</label>
            <p className="mt-1 text-sm text-gray-900">{profile.gender}</p>
          </div>
        )}
        
        {profile.address && (
          <div>
            <label className="block text-sm font-medium text-gray-700">주소</label>
            <p className="mt-1 text-sm text-gray-900">
              {profile.address}
              {profile.detailedAddress && ` ${profile.detailedAddress}`}
            </p>
            {profile.postalCode && (
              <p className="mt-1 text-xs text-gray-600">우편번호: {profile.postalCode}</p>
            )}
          </div>
        )}
      </div>

      {/* 연락처 정보 */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900 flex items-center">
          <Phone className="w-5 h-5 mr-2 text-green-600" />
          연락처 정보
        </h4>
        
        {profile.emergencyContactName && (
          <div>
            <label className="block text-sm font-medium text-gray-700">비상 연락처</label>
            <p className="mt-1 text-sm text-gray-900">{profile.emergencyContactName}</p>
            {profile.emergencyContactPhone && (
              <p className="mt-1 text-sm text-gray-600">
                {maskSensitiveData(profile.emergencyContactPhone, showSensitive)}
              </p>
            )}
            {profile.emergencyContactRelation && (
              <p className="mt-1 text-xs text-gray-600">관계: {profile.emergencyContactRelation}</p>
            )}
          </div>
        )}
        
        {isOverseas && overseasProfile.overseasContactName && (
          <div>
            <label className="block text-sm font-medium text-gray-700">해외 연락처</label>
            <p className="mt-1 text-sm text-gray-900">{overseasProfile.overseasContactName}</p>
            {overseasProfile.overseasContactPhone && (
              <p className="mt-1 text-sm text-gray-600">
                {maskSensitiveData(overseasProfile.overseasContactPhone, showSensitive)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 케어 정보 */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900 flex items-center">
          <Heart className="w-5 h-5 mr-2 text-red-600" />
          케어 정보
        </h4>
        
        {profile.careLevel && (
          <div>
            <label className="block text-sm font-medium text-gray-700">케어 레벨</label>
            <p className="mt-1 text-sm text-gray-900">{profile.careLevel}</p>
          </div>
        )}
        
        {profile.specialNeeds && (
          <div>
            <label className="block text-sm font-medium text-gray-700">특별 요구사항</label>
            <p className="mt-1 text-sm text-gray-900">{profile.specialNeeds}</p>
          </div>
        )}
        
        {profile.budgetRange && (
          <div>
            <label className="block text-sm font-medium text-gray-700">예산 범위</label>
            <p className="mt-1 text-sm text-gray-900">{profile.budgetRange}</p>
          </div>
        )}
      </div>

      {/* 국내 전용 정보 */}
      {!isOverseas && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-purple-600" />
            국내 전용 정보
          </h4>
          
          {domesticProfile.healthInsuranceNumber && (
            <div>
              <label className="block text-sm font-medium text-gray-700">건강보험번호</label>
              <p className="mt-1 text-sm text-gray-900">
                {maskSensitiveData(domesticProfile.healthInsuranceNumber, showSensitive)}
              </p>
            </div>
          )}
          
          {domesticProfile.ltciCertificateNumber && (
            <div>
              <label className="block text-sm font-medium text-gray-700">장기요양인정서번호</label>
              <p className="mt-1 text-sm text-gray-900">
                {maskSensitiveData(domesticProfile.ltciCertificateNumber, showSensitive)}
              </p>
            </div>
          )}
          
          {domesticProfile.preferredRegion && (
            <div>
              <label className="block text-sm font-medium text-gray-700">선호 지역</label>
              <p className="mt-1 text-sm text-gray-900">{domesticProfile.preferredRegion}</p>
            </div>
          )}
        </div>
      )}

      {/* 해외 전용 정보 */}
      {isOverseas && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-indigo-600" />
            해외 전용 정보
          </h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">거주 국가</label>
            <p className="mt-1 text-sm text-gray-900">{overseasProfile.residenceCountry}</p>
            {overseasProfile.residenceCity && (
              <p className="mt-1 text-xs text-gray-600">도시: {overseasProfile.residenceCity}</p>
            )}
          </div>
          
          {overseasProfile.languagePreference && (
            <div>
              <label className="block text-sm font-medium text-gray-700">언어 선호도</label>
              <p className="mt-1 text-sm text-gray-900">{overseasProfile.languagePreference}</p>
            </div>
          )}
          
          {overseasProfile.culturalDietaryRequirements && (
            <div>
              <label className="block text-sm font-medium text-gray-700">문화적/식이 요구사항</label>
              <p className="mt-1 text-sm text-gray-900">{overseasProfile.culturalDietaryRequirements}</p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">코디네이터 필요</label>
            <p className="mt-1 text-sm text-gray-900">
              {overseasProfile.coordinatorRequired ? '예' : '아니오'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// 나머지 탭 컴포넌트들과 모달은 다음 파일에서 계속...

export default ProfileDetailPage;