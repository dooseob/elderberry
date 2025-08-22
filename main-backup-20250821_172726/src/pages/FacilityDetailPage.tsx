import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Star, 
  Users, 
  Heart, 
  Clock,
  Bed,
  Shield,
  Award,
  Calendar,
  DollarSign,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useFacilitySearch } from '../hooks/useFacilitySearch';

export default function FacilityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentFacility, loading, error, getFacilityDetail, clearError } = useFacilitySearch();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      getFacilityDetail(parseInt(id));
    }
  }, [id, getFacilityDetail]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-16 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-text-muted">시설 정보를 불러오고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white pt-16 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-main mb-2">오류가 발생했습니다</h2>
          <p className="text-text-muted mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <button 
              onClick={clearError}
              className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
            >
              다시 시도
            </button>
            <button 
              onClick={() => navigate('/facilities')}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentFacility) {
    return (
      <div className="min-h-screen bg-white pt-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-main mb-2">시설을 찾을 수 없습니다</h2>
          <p className="text-text-muted mb-4">요청하신 시설 정보가 존재하지 않습니다.</p>
          <button 
            onClick={() => navigate('/facilities')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const facility = currentFacility;

  const tabs = [
    { id: 'overview', label: '개요', icon: Award },
    { id: 'services', label: '서비스', icon: Shield },
    { id: 'location', label: '위치/연락처', icon: MapPin },
    { id: 'pricing', label: '비용 정보', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button 
            onClick={() => navigate('/facilities')}
            className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            시설 목록으로 돌아가기
          </button>
          
          <div className="flex flex-col lg:flex-row gap-6">
            {/* 이미지 */}
            <div className="lg:w-96 h-64">
              <img
                src={facility.profileImageUrl || 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'}
                alt={facility.facilityName}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600';
                }}
              />
            </div>

            {/* 기본 정보 */}
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-sm font-medium">
                  {facility.facilityType}
                </span>
                {facility.facilityGrade && (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-medium">
                    {facility.facilityGrade}
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-text-main mb-4">{facility.facilityName}</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-text-muted">
                  <MapPin className="w-5 h-5" />
                  <span>{facility.address}</span>
                </div>
                {facility.contactNumber && (
                  <div className="flex items-center gap-2 text-text-muted">
                    <Phone className="w-5 h-5" />
                    <span>{facility.contactNumber}</span>
                  </div>
                )}
                {facility.email && (
                  <div className="flex items-center gap-2 text-text-muted">
                    <Mail className="w-5 h-5" />
                    <span>{facility.email}</span>
                  </div>
                )}
                {facility.website && (
                  <div className="flex items-center gap-2 text-text-muted">
                    <Globe className="w-5 h-5" />
                    <a href={facility.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      홈페이지 방문
                    </a>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-text-muted">정원 </span>
                  <span className="font-semibold">{facility.capacity}명</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  <span className="text-text-muted">입소 가능 </span>
                  <span className="font-semibold text-primary">{facility.availableSlots}명</span>
                </div>
                {facility.establishedDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="text-text-muted">개원일 </span>
                    <span className="font-semibold">{facility.establishedDate}</span>
                  </div>
                )}
                {facility.rating && (
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="font-semibold">{facility.rating.toFixed(1)}</span>
                    {facility.reviewCount && (
                      <span className="text-text-muted">({facility.reviewCount}개 리뷰)</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b sticky top-16 z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-muted hover:text-text-main'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* 시설 소개 */}
            {facility.introductionText && (
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-xl font-bold text-text-main mb-4">시설 소개</h2>
                <p className="text-text-secondary leading-relaxed">{facility.introductionText}</p>
              </div>
            )}

            {/* 시설 현황 */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-bold text-text-main mb-4">시설 현황</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-text-muted text-sm">총 정원</p>
                  <p className="text-2xl font-bold text-text-main">{facility.capacity}명</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Bed className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-text-muted text-sm">현재 입소</p>
                  <p className="text-2xl font-bold text-text-main">{facility.currentOccupancy}명</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Heart className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-text-muted text-sm">입소 가능</p>
                  <p className="text-2xl font-bold text-primary">{facility.availableSlots}명</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-bold text-text-main mb-4">제공 서비스</h2>
            {facility.serviceFeatures && facility.serviceFeatures.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {facility.serviceFeatures.map((service, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                    <Shield className="w-5 h-5 text-primary" />
                    <span className="text-text-main">{service}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-muted">서비스 정보가 등록되어 있지 않습니다.</p>
            )}
          </div>
        )}

        {activeTab === 'location' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-bold text-text-main mb-4">위치 정보</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-text-main">주소</p>
                    <p className="text-text-muted">{facility.address}</p>
                    {facility.detailAddress && (
                      <p className="text-text-muted text-sm">{facility.detailAddress}</p>
                    )}
                  </div>
                </div>
                <div className="text-text-muted text-sm">
                  {facility.region} {facility.district}
                  {facility.postalCode && ` (우편번호: ${facility.postalCode})`}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-bold text-text-main mb-4">연락처 정보</h2>
              <div className="space-y-3">
                {facility.contactNumber && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-text-main">전화번호</p>
                      <a href={`tel:${facility.contactNumber}`} className="text-primary hover:underline">
                        {facility.contactNumber}
                      </a>
                    </div>
                  </div>
                )}
                {facility.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-text-main">이메일</p>
                      <a href={`mailto:${facility.email}`} className="text-primary hover:underline">
                        {facility.email}
                      </a>
                    </div>
                  </div>
                )}
                {facility.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-text-main">홈페이지</p>
                      <a href={facility.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {facility.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-bold text-text-main mb-4">비용 정보</h2>
            {facility.basicMonthlyFee ? (
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-6 h-6 text-primary" />
                    <h3 className="text-lg font-semibold text-text-main">기본 월이용료</h3>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    월 {facility.basicMonthlyFee.toLocaleString()}만원
                  </p>
                  <p className="text-text-muted text-sm mt-2">
                    * 실제 비용은 입소자의 케어 등급 및 추가 서비스에 따라 달라질 수 있습니다.
                  </p>
                </div>
                <div className="text-text-muted text-sm space-y-1">
                  <p>• 기본 요양 서비스 포함</p>
                  <p>• 식사, 간식 제공</p>
                  <p>• 기본적인 의료 서비스</p>
                  <p>• 정확한 비용은 시설에 직접 문의해주시기 바랍니다.</p>
                </div>
              </div>
            ) : (
              <p className="text-text-muted">비용 정보가 등록되어 있지 않습니다. 자세한 내용은 시설에 직접 문의해주세요.</p>
            )}
          </div>
        )}
      </div>

      {/* 문의하기 고정 버튼 */}
      <div className="fixed bottom-6 right-6">
        <button 
          className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-full shadow-lg transition-colors flex items-center gap-2"
          onClick={() => {
            // TODO: 문의하기 모달 또는 기능
            if (facility.contactNumber) {
              window.open(`tel:${facility.contactNumber}`);
            }
          }}
        >
          <Phone className="w-5 h-5" />
          문의하기
        </button>
      </div>
    </div>
  );
}