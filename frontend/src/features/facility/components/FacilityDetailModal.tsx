/**
 * 시설 상세 정보 모달 컴포넌트 (통합 업데이트)
 * 시설의 상세 정보, 카카오 지도, 리뷰 시스템, 주변 편의시설 등을 포함한 종합 시설 정보 제공
 */
import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertCircle,
  Award,
  Calendar,
  Camera,
  Car,
  CheckCircle,
  Clock,
  DollarSign,
  Heart,
  Home,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Shield,
  Star,
  Stethoscope,
  Users,
  Utensils,
  Wifi,
  X,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Image as ImageIcon,
  Filter,
  SortDesc,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Info
} from '../../../components/icons/LucideIcons';
import { motion, AnimatePresence } from 'framer-motion';
import { useFacilityStore, useSelectedFacility } from '@/stores/facilityStore';
import { useReviewStore } from '@/stores/reviewStore';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { KakaoMap } from '@/components/map/KakaoMap';
import { useFocusTrap } from '../../../hooks/useFocusTrap';
import { 
  Review, 
  ReviewSort, 
  ReviewFilter, 
  ReviewType, 
  RATING_LABELS,
  REVIEW_TAGS
} from '@/types/review';

const FacilityDetailModal: React.FC = () => {
  const selectedFacility = useSelectedFacility();
  const {
    isDetailModalOpen,
    closeDetailModal,
    clearSelectedFacility,
    trackFacilityContact,
    trackFacilityVisit,
    openMatchingForm,
  } = useFacilityStore();

  // 리뷰 스토어 연동
  const {
    reviews,
    reviewStatistics,
    loading: reviewLoading,
    pagination,
    currentSort,
    currentFilter,
    loadReviews,
    loadReviewStatistics,
    changeSort,
    applyFilter,
    voteHelpful,
    voteNotHelpful,
    goToPage
  } = useReviewStore();

  // 로컬 상태
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'location' | 'reviews' | 'photos'>('overview');
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviewSort, setReviewSort] = useState<ReviewSort>(ReviewSort.LATEST);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>({});
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [nearbyFacilities] = useState<any[]>([]); // 주변 시설 데이터 (추후 구현)
  
  // 포커스 트랩 설정
  const modalRef = useFocusTrap({
    isActive: isDetailModalOpen,
    initialFocus: 'button[data-close]',
    returnFocus: true,
  });

  // 모달 닫기
  const handleClose = () => {
    closeDetailModal();
    setTimeout(() => {
      clearSelectedFacility();
    }, 300);
  };

  // ESC 키로 모달 닫기 및 리뷰 데이터 로드
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isDetailModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';

      // 시설 선택 시 리뷰 데이터 로드
      if (selectedFacility) {
        loadReviews(selectedFacility.id);
        loadReviewStatistics(selectedFacility.id);
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isDetailModalOpen, selectedFacility, loadReviews, loadReviewStatistics]);

  // 시설 연락 추적
  const handleContact = async () => {
    if (!selectedFacility) return;
    
    setIsActionLoading('contact');
    try {
      await trackFacilityContact(selectedFacility.id);
      window.open(`tel:${selectedFacility.phoneNumber}`);
    } catch (error) {
      console.error('연락 추적 실패:', error);
    } finally {
      setIsActionLoading(null);
    }
  };

  // 시설 방문 예약
  const handleVisit = async () => {
    if (!selectedFacility) return;
    
    setIsActionLoading('visit');
    try {
      await trackFacilityVisit(selectedFacility.id);
      alert('방문 예약이 접수되었습니다. 시설에서 연락드리겠습니다.');
    } catch (error) {
      console.error('방문 추적 실패:', error);
    } finally {
      setIsActionLoading(null);
    }
  };

  // 매칭 신청
  const handleMatching = () => {
    openMatchingForm();
  };

  // 지도로 위치 보기
  const handleViewMap = () => {
    if (selectedFacility?.latitude && selectedFacility?.longitude) {
      const url = `https://map.kakao.com/link/map/${selectedFacility.facilityName},${selectedFacility.latitude},${selectedFacility.longitude}`;
      window.open(url, '_blank');
    }
  };

  // 리뷰 정렬 변경
  const handleSortChange = async (sort: ReviewSort) => {
    setReviewSort(sort);
    if (selectedFacility) {
      await changeSort(sort);
    }
  };

  // 리뷰 필터 적용
  const handleFilterApply = async (filter: ReviewFilter) => {
    setReviewFilter(filter);
    if (selectedFacility) {
      await applyFilter(filter);
    }
  };

  // 리뷰 투표 처리
  const handleReviewVote = async (reviewId: number, isHelpful: boolean) => {
    try {
      if (isHelpful) {
        await voteHelpful(reviewId);
      } else {
        await voteNotHelpful(reviewId);
      }
    } catch (error) {
      console.error('리뷰 투표 실패:', error);
    }
  };

  // 이미지 갤러리 이전/다음
  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? facilityImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === facilityImages.length - 1 ? 0 : prev + 1
    );
  };

  if (!isDetailModalOpen || !selectedFacility) {
    return null;
  }

  // 시설 등급 색상 매핑
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'E': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // 입소 가능 여부 계산
  const availableSlots = selectedFacility.totalCapacity - selectedFacility.currentOccupancy;
  const occupancyRate = (selectedFacility.currentOccupancy / selectedFacility.totalCapacity) * 100;

  // 월 비용 포맷팅
  const formatCost = (cost: number | null) => {
    if (!cost) return '문의';
    return `${(cost / 10000).toFixed(0)}만원`;
  };

  // 시설 이미지 (임시 데이터)
  const facilityImages = selectedFacility.imageUrl 
    ? [selectedFacility.imageUrl]
    : [
        '/images/facility-placeholder-1.jpg',
        '/images/facility-placeholder-2.jpg',
        '/images/facility-placeholder-3.jpg',
      ];

  // 시설 편의시설 (임시 데이터)
  const amenities = [
    { icon: Wifi, label: '무료 WiFi', available: true },
    { icon: Car, label: '주차장', available: true },
    { icon: Utensils, label: '식당', available: true },
    { icon: Activity, label: '운동시설', available: false },
    { icon: Camera, label: 'CCTV', available: true },
    { icon: Shield, label: '24시간 보안', available: true },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        {/* 배경 오버레이 */}
        <div className="absolute inset-0 bg-black bg-opacity-50" />

        {/* 모달 콘텐츠 */}
        <motion.div
          ref={modalRef}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          {/* 모달 헤더 */}
          <div className="relative">
            {/* 시설 이미지 슬라이더 */}
            <div className="relative h-64 bg-gray-200">
              <img
                src={facilityImages[currentImageIndex]}
                alt={selectedFacility.facilityName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/images/facility-default.jpg';
                }}
              />
              
              {/* 이미지 네비게이션 */}
              {facilityImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {facilityImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* 등급 배지 */}
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(selectedFacility.facilityGrade)}`}>
                  {selectedFacility.facilityGrade}등급
                </span>
              </div>

              {/* 닫기 버튼 */}
              <button
                data-close
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                aria-label="모달 닫기"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* 기본 정보 헤더 */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 id="modal-title" className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedFacility.facilityName}
                  </h1>
                  <p id="modal-description" className="sr-only">
                    {selectedFacility.facilityType} 시설의 상세 정보를 확인하고 연락, 방문 예약, 매칭 신청을 할 수 있습니다.
                  </p>
                  <p className="text-gray-600 mb-2">{selectedFacility.facilityType}</p>
                  <div className="flex items-center text-gray-500">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{selectedFacility.address}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-1">월 기본료</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCost(selectedFacility.monthlyBasicFee)}
                  </div>
                </div>
              </div>

              {/* 입소 현황 */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600">총 정원</div>
                  <div className="text-lg font-semibold">{selectedFacility.totalCapacity}명</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">현재 입소</div>
                  <div className="text-lg font-semibold">{selectedFacility.currentOccupancy}명</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">입소 가능</div>
                  <div className={`text-lg font-semibold ${availableSlots > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {availableSlots > 0 ? `${availableSlots}명` : '대기'}
                  </div>
                </div>
              </div>

              {/* 입소율 프로그레스 바 */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>입소율</span>
                  <span>{Math.round(occupancyRate)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      occupancyRate >= 90 ? 'bg-red-500' : 
                      occupancyRate >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                  />
                </div>
              </div>

              {/* 액션 버튼들 */}
              <div className="flex space-x-3">
                <Button
                  onClick={handleContact}
                  disabled={isActionLoading === 'contact'}
                  className="flex-1"
                >
                  {isActionLoading === 'contact' ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <Phone className="w-4 h-4 mr-2" />
                    </motion.div>
                  ) : (
                    <Phone className="w-4 h-4 mr-2" />
                  )}
                  연락하기
                </Button>

                <Button
                  variant="outline"
                  onClick={handleVisit}
                  disabled={isActionLoading === 'visit'}
                  className="flex-1"
                >
                  {isActionLoading === 'visit' ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <Calendar className="w-4 h-4 mr-2" />
                    </motion.div>
                  ) : (
                    <Calendar className="w-4 h-4 mr-2" />
                  )}
                  방문 예약
                </Button>

                <Button
                  variant="outline"
                  onClick={handleMatching}
                  className="flex-1"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  매칭 신청
                </Button>
              </div>
            </div>
          </div>

          {/* 탭 네비게이션 */}
          <div className="border-b">
            <nav className="flex px-6 overflow-x-auto" role="tablist" aria-label="시설 정보 탭">
              {[
                { key: 'overview', label: '개요', icon: Home },
                { key: 'services', label: '서비스', icon: Stethoscope },
                { key: 'location', label: '위치', icon: MapPin },
                { key: 'reviews', label: '리뷰', icon: Star, badge: reviewStatistics?.totalCount },
                { key: 'photos', label: '사진', icon: ImageIcon, badge: facilityImages.length },
              ].map(({ key, label, icon: Icon, badge }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex items-center px-4 py-3 border-b-2 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-elderberry-500 focus:ring-offset-2 ${
                    activeTab === key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  role="tab"
                  aria-selected={activeTab === key}
                  aria-controls={`tabpanel-${key}`}
                  id={`tab-${key}`}
                >
                  <Icon className="w-4 h-4 mr-2" aria-hidden="true" />
                  <span>{label}</span>
                  {badge && badge > 0 && (
                    <span className="ml-1 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                      {badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* 탭 콘텐츠 */}
          <div className="flex-1 overflow-y-auto max-h-96">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-6"
                  role="tabpanel"
                  id="tabpanel-overview"
                  aria-labelledby="tab-overview"
                >
                  {/* 시설 설명 */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">시설 소개</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedFacility.description || 
                        `${selectedFacility.facilityName}은(는) ${selectedFacility.facilityType}로서 전문적인 돌봄 서비스를 제공합니다. 
                        숙련된 전문 인력과 체계적인 케어 프로그램을 통해 입소자분들의 건강하고 안전한 생활을 지원하고 있습니다.`
                      }
                    </p>
                  </div>

                  {/* 전문 서비스 */}
                  {selectedFacility.specialties && selectedFacility.specialties.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">전문 서비스</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedFacility.specialties.map((specialty) => (
                          <span
                            key={specialty}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 편의시설 */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">편의시설</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {amenities.map(({ icon: Icon, label, available }) => (
                        <div
                          key={label}
                          className={`flex items-center space-x-2 ${
                            available ? 'text-gray-900' : 'text-gray-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-sm">{label}</span>
                          {available ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <X className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 운영 정보 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">운영 정보</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          <span>운영시간: {selectedFacility.operatingHours || '24시간 운영'}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          <span>연락처: {selectedFacility.phoneNumber}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2 text-gray-400" />
                          <span>정원: {selectedFacility.totalCapacity}명</span>
                        </div>
                        <div className="flex items-center">
                          <Award className="w-4 h-4 mr-2 text-gray-400" />
                          <span>등급: {selectedFacility.facilityGrade}등급</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">비용 정보</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">월 기본료</span>
                          <span className="font-semibold">{formatCost(selectedFacility.monthlyBasicFee)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">식비</span>
                          <span className="text-gray-500">별도 문의</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">간병비</span>
                          <span className="text-gray-500">등급별 상이</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          * 정확한 비용은 상담을 통해 확인하실 수 있습니다.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 빠른 연락 섹션 */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">빠른 연락 및 예약</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Button
                        onClick={handleContact}
                        disabled={isActionLoading === 'contact'}
                        className="flex items-center justify-center space-x-2"
                      >
                        <Phone className="w-4 h-4" />
                        <span>전화 상담</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={handleVisit}
                        disabled={isActionLoading === 'visit'}
                        className="flex items-center justify-center space-x-2"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>방문 예약</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={handleMatching}
                        className="flex items-center justify-center space-x-2"
                      >
                        <Heart className="w-4 h-4" />
                        <span>매칭 신청</span>
                      </Button>
                    </div>
                    
                    <div className="mt-3 text-sm text-gray-600 text-center">
                      <p>📞 상담 가능 시간: 평일 09:00 ~ 18:00</p>
                      <p>🏥 방문 상담 시 사전 예약을 권장합니다.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'services' && (
                <motion.div
                  key="services"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-6"
                >
                  <h3 className="text-lg font-semibold mb-4">제공 서비스</h3>
                  
                  {/* 케어 등급별 서비스 */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">케어 등급별 서비스</h4>
                    <div className="space-y-2">
                      {selectedFacility.availableCareGrades.map((grade) => (
                        <div key={grade} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                          <span>{grade}등급 케어</span>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 추가 서비스 정보 */}
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="p-4">
                        <h5 className="font-medium mb-2">일상생활 지원</h5>
                        <p className="text-sm text-gray-600">식사, 목욕, 배설, 이동 등 일상생활 전반에 대한 전문적인 돌봄 서비스</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <h5 className="font-medium mb-2">건강 관리</h5>
                        <p className="text-sm text-gray-600">정기 건강검진, 투약 관리, 응급상황 대응 등 체계적인 건강 관리</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <h5 className="font-medium mb-2">여가 활동</h5>
                        <p className="text-sm text-gray-600">다양한 프로그램과 여가 활동을 통한 정서적 지원 및 사회적 교류</p>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              )}

              {activeTab === 'location' && (
                <motion.div
                  key="location"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-6 space-y-6"
                >
                  <h3 className="text-lg font-semibold mb-4">위치 정보</h3>
                  
                  {/* 카카오 지도 컴포넌트 */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-3 flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                      지도
                    </h4>
                    <KakaoMap
                      facility={{
                        id: selectedFacility.id,
                        name: selectedFacility.facilityName,
                        address: selectedFacility.address,
                        latitude: selectedFacility.latitude || undefined,
                        longitude: selectedFacility.longitude || undefined,
                        phone: selectedFacility.phoneNumber
                      }}
                      height="350px"
                      showNearbyPlaces={true}
                      showControls={true}
                      className="rounded-lg overflow-hidden"
                    />
                  </div>

                  {/* 주소 정보 */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">주소</span>
                      </div>
                      <p className="text-gray-700 ml-6">{selectedFacility.address}</p>
                    </div>

                    {selectedFacility.latitude && selectedFacility.longitude && (
                      <div>
                        <div className="flex items-center mb-2">
                          <Navigation className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="font-medium">좌표</span>
                        </div>
                        <p className="text-gray-700 ml-6">
                          위도: {selectedFacility.latitude}, 경도: {selectedFacility.longitude}
                        </p>
                      </div>
                    )}

                    {/* 외부 지도 링크 */}
                    <div className="flex space-x-3">
                      <Button
                        onClick={handleViewMap}
                        variant="outline"
                        className="flex-1"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        카카오맵에서 보기
                      </Button>
                      <Button
                        onClick={() => {
                          const url = `https://map.naver.com/v5/search/${encodeURIComponent(selectedFacility.address)}`;
                          window.open(url, '_blank');
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        네이버지도에서 보기
                      </Button>
                    </div>

                    {/* 교통 정보 */}
                    <div>
                      <h4 className="font-medium mb-3">교통 정보</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <Car className="w-4 h-4 mr-2 text-gray-400" />
                          <span>주차장 이용 가능</span>
                        </div>
                        <div className="text-gray-600 ml-6">
                          대중교통 이용 시 가장 가까운 지하철역에서 도보 10분 거리
                        </div>
                      </div>
                    </div>

                    {/* 주변 시설 정보 */}
                    {nearbyFacilities.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">주변 편의시설</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {nearbyFacilities.slice(0, 6).map((facility, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-gray-700">{facility.name}</span>
                              <span className="text-gray-500 text-xs">({facility.distance}m)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-6 space-y-6"
                >
                  {/* 리뷰 헤더 */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">이용 후기</h3>
                    <div className="flex items-center space-x-2">
                      {/* 필터 버튼 */}
                      <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-1" />
                        필터
                      </Button>
                      
                      {/* 정렬 드롭다운 */}
                      <select
                        value={reviewSort}
                        onChange={(e) => handleSortChange(e.target.value as ReviewSort)}
                        className="px-3 py-1 border rounded text-sm"
                      >
                        <option value={ReviewSort.LATEST}>최신순</option>
                        <option value={ReviewSort.HIGHEST_RATING}>평점 높은순</option>
                        <option value={ReviewSort.LOWEST_RATING}>평점 낮은순</option>
                        <option value={ReviewSort.MOST_HELPFUL}>도움됨순</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* 평점 요약 */}
                  {reviewStatistics && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 전체 평점 */}
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600 mb-2">
                            {reviewStatistics.averageRating.toFixed(1)}
                          </div>
                          <div className="flex items-center justify-center mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-5 h-5 ${
                                  i < Math.round(reviewStatistics.averageRating) 
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-gray-300'
                                }`} 
                              />
                            ))}
                          </div>
                          <div className="text-sm text-gray-600">
                            {reviewStatistics.totalCount}개의 리뷰
                          </div>
                          <div className="text-sm text-blue-600 font-medium mt-2">
                            추천률 {reviewStatistics.recommendationPercentage}%
                          </div>
                        </div>

                        {/* 평점 분포 */}
                        <div className="space-y-2">
                          {Object.entries(reviewStatistics.ratingDistribution)
                            .sort(([a], [b]) => Number(b) - Number(a))
                            .map(([rating, count]) => (
                              <div key={rating} className="flex items-center space-x-2">
                                <span className="text-sm w-4">{rating}점</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-yellow-400 h-2 rounded-full"
                                    style={{ 
                                      width: `${reviewStatistics.totalCount > 0 ? (count / reviewStatistics.totalCount) * 100 : 0}%` 
                                    }}
                                  />
                                </div>
                                <span className="text-sm text-gray-600 w-8">{count}</span>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* 카테고리별 평점 */}
                      <div className="mt-4 pt-4 border-t border-blue-100">
                        <h4 className="font-medium mb-3 text-gray-700">카테고리별 평점</h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {Object.entries(reviewStatistics.categoryRatings).map(([category, rating]) => (
                            <div key={category} className="text-center">
                              <div className="text-sm font-medium text-gray-600 mb-1">
                                {category === 'serviceQuality' ? '서비스' :
                                 category === 'facility' ? '시설' :
                                 category === 'staff' ? '직원' :
                                 category === 'price' ? '가격' :
                                 category === 'accessibility' ? '접근성' : category}
                              </div>
                              <div className="text-lg font-semibold text-blue-600">
                                {rating > 0 ? rating.toFixed(1) : '-'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 리뷰 목록 */}
                  <div className="space-y-4">
                    {reviewLoading.reviews ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">리뷰를 불러오는 중...</p>
                      </div>
                    ) : reviews.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>아직 등록된 리뷰가 없습니다.</p>
                        <p className="text-sm mt-1">첫 번째 리뷰를 작성해보세요!</p>
                      </div>
                    ) : (
                      reviews.map((review) => (
                        <Card key={review.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            {/* 리뷰 헤더 */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-blue-600">
                                    {review.reviewer.name.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-gray-900">
                                      {review.anonymous ? '익명' : review.reviewer.name}
                                    </span>
                                    {review.verified && (
                                      <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                        인증됨
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <div className="flex items-center">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <Star 
                                          key={i} 
                                          className={`w-4 h-4 ${
                                            i < review.overallRating 
                                              ? 'text-yellow-400 fill-current' 
                                              : 'text-gray-300'
                                          }`} 
                                        />
                                      ))}
                                    </div>
                                    <span className="text-sm text-gray-500">
                                      {new Date(review.createdDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* 리뷰 제목 */}
                            {review.title && (
                              <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                            )}

                            {/* 리뷰 내용 */}
                            <p className="text-gray-700 mb-3 leading-relaxed">{review.content}</p>

                            {/* 리뷰 태그 */}
                            {review.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {review.tags.map((tag, index) => (
                                  <span 
                                    key={index}
                                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* 리뷰 이미지 */}
                            {review.imageUrls.length > 0 && (
                              <div className="flex space-x-2 mb-3">
                                {review.imageUrls.slice(0, 3).map((imageUrl, index) => (
                                  <img
                                    key={index}
                                    src={imageUrl}
                                    alt={`리뷰 이미지 ${index + 1}`}
                                    className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80"
                                    onClick={() => {
                                      // 이미지 확대 보기 구현
                                    }}
                                  />
                                ))}
                                {review.imageUrls.length > 3 && (
                                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-xs">
                                    +{review.imageUrls.length - 3}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* 리뷰 액션 */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <div className="flex items-center space-x-4">
                                <button
                                  onClick={() => handleReviewVote(review.id, true)}
                                  className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600"
                                  disabled={reviewLoading.vote}
                                >
                                  <ThumbsUp className="w-4 h-4" />
                                  <span>도움됨 {review.helpfulCount}</span>
                                </button>
                                
                                <button
                                  onClick={() => handleReviewVote(review.id, false)}
                                  className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-600"
                                  disabled={reviewLoading.vote}
                                >
                                  <ThumbsDown className="w-4 h-4" />
                                  <span>{review.notHelpfulCount}</span>
                                </button>

                                <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-600">
                                  <Flag className="w-4 h-4" />
                                  <span>신고</span>
                                </button>
                              </div>

                              {review.recommended && (
                                <span className="text-sm text-green-600 font-medium">
                                  추천합니다
                                </span>
                              )}
                            </div>

                            {/* 관리자 답변 */}
                            {review.adminResponse && (
                              <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                <div className="flex items-center mb-2">
                                  <Info className="w-4 h-4 text-blue-600 mr-2" />
                                  <span className="text-sm font-medium text-blue-900">시설 관리자 답변</span>
                                  {review.adminResponseDate && (
                                    <span className="text-xs text-blue-600 ml-auto">
                                      {new Date(review.adminResponseDate).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-blue-800">{review.adminResponse}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>

                  {/* 페이지네이션 */}
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(pagination.page - 1)}
                        disabled={!pagination.hasPrevious}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      
                      <span className="text-sm text-gray-600">
                        {pagination.page + 1} / {pagination.totalPages}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(pagination.page + 1)}
                        disabled={!pagination.hasNext}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {/* 리뷰 작성 버튼 */}
                  <div className="text-center pt-4 border-t">
                    <Button className="px-6">
                      <Star className="w-4 h-4 mr-2" />
                      리뷰 작성하기
                    </Button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'photos' && (
                <motion.div
                  key="photos"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">시설 사진</h3>
                    <span className="text-sm text-gray-600">
                      총 {facilityImages.length}장
                    </span>
                  </div>

                  {/* 메인 이미지 표시 */}
                  <div className="relative mb-6">
                    <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={facilityImages[currentImageIndex]}
                        alt={`${selectedFacility.facilityName} 사진 ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/images/facility-default.jpg';
                        }}
                      />
                    </div>

                    {/* 이미지 내비게이션 버튼 */}
                    {facilityImages.length > 1 && (
                      <>
                        <button
                          onClick={handlePreviousImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full flex items-center justify-center shadow-lg transition-all"
                        >
                          <ChevronLeft className="w-5 h-5 text-gray-700" />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full flex items-center justify-center shadow-lg transition-all"
                        >
                          <ChevronRight className="w-5 h-5 text-gray-700" />
                        </button>

                        {/* 이미지 카운터 */}
                        <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {facilityImages.length}
                        </div>
                      </>
                    )}

                    {/* 전체화면 보기 버튼 */}
                    <button
                      onClick={() => setShowImageGallery(true)}
                      className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {/* 썸네일 그리드 */}
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                    {facilityImages.map((image, index) => (
                      <div
                        key={index}
                        className={`aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer transition-all ${
                          index === currentImageIndex 
                            ? 'ring-2 ring-blue-500 ring-offset-2' 
                            : 'hover:opacity-80'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <img
                          src={image}
                          alt={`${selectedFacility.facilityName} 썸네일 ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/images/facility-default.jpg';
                          }}
                        />
                      </div>
                    ))}

                    {/* 더 많은 사진 플레이스홀더 */}
                    {Array.from({ length: Math.max(0, 12 - facilityImages.length) }).map((_, index) => (
                      <div
                        key={`placeholder-${index}`}
                        className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center"
                      >
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    ))}
                  </div>

                  {/* 사진 카테고리 */}
                  <div className="mt-6 space-y-4">
                    <h4 className="font-medium text-gray-900">사진 카테고리</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { name: '외관', count: 3, icon: Home },
                        { name: '내부시설', count: 5, icon: Activity },
                        { name: '객실', count: 4, icon: Users },
                        { name: '편의시설', count: 2, icon: Wifi }
                      ].map((category) => (
                        <Card key={category.name} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-4 text-center">
                            <category.icon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                            <h5 className="font-medium text-gray-900">{category.name}</h5>
                            <p className="text-sm text-gray-600">{category.count}장</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* 사진 정보 */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">사진 정보</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• 모든 사진은 실제 시설을 촬영한 것입니다.</p>
                      <p>• 사진은 정기적으로 업데이트됩니다.</p>
                      <p>• 궁금한 부분이 있으시면 시설에 직접 문의해주세요.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
      {/* 이미지 갤러리 모달 */}
      {showImageGallery && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-90"
          onClick={() => setShowImageGallery(false)}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={facilityImages[currentImageIndex]}
              alt={`${selectedFacility.facilityName} 사진 ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* 닫기 버튼 */}
            <button
              onClick={() => setShowImageGallery(false)}
              className="absolute top-4 right-4 w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full flex items-center justify-center"
            >
              <X className="w-6 h-6" />
            </button>

            {/* 이미지 내비게이션 */}
            {facilityImages.length > 1 && (
              <>
                <button
                  onClick={handlePreviousImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full flex items-center justify-center"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full flex items-center justify-center"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* 이미지 카운터 */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm">
                  {currentImageIndex + 1} / {facilityImages.length}
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FacilityDetailModal; 