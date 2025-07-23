/**
 * 시설 상세 정보 모달 컴포넌트
 * 시설의 상세 정보, 이미지, 서비스, 위치 등을 표시하고 사용자 행동 추적 기능 포함
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Phone,
  Users,
  Star,
  Clock,
  DollarSign,
  Award,
  Heart,
  Calendar,
  MessageCircle,
  Navigation,
  CheckCircle,
  AlertCircle,
  Camera,
  Wifi,
  Car,
  Utensils,
  Shield,
  Activity,
  Home,
  Stethoscope,
} from 'lucide-react';

import { useFacilityStore, useSelectedFacility } from '@/stores/facilityStore';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

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

  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'location' | 'reviews'>('overview');
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 모달 닫기
  const handleClose = () => {
    closeDetailModal();
    setTimeout(() => {
      clearSelectedFacility();
    }, 300);
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isDetailModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isDetailModalOpen]);

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
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
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
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 기본 정보 헤더 */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedFacility.facilityName}
                  </h1>
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
            <nav className="flex px-6">
              {[
                { key: 'overview', label: '개요', icon: Home },
                { key: 'services', label: '서비스', icon: Stethoscope },
                { key: 'location', label: '위치', icon: MapPin },
                { key: 'reviews', label: '리뷰', icon: Star },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex items-center px-4 py-3 border-b-2 font-medium text-sm ${
                    activeTab === key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
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

                  {/* 운영 시간 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">운영 정보</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span>운영시간: {selectedFacility.operatingHours || '24시간 운영'}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <span>연락처: {selectedFacility.phoneNumber}</span>
                      </div>
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
                  className="p-6"
                >
                  <h3 className="text-lg font-semibold mb-4">위치 정보</h3>
                  
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

                    <Button
                      onClick={handleViewMap}
                      variant="outline"
                      className="w-full"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      지도에서 보기
                    </Button>

                    {/* 교통 정보 (임시 데이터) */}
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
                  </div>
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-6"
                >
                  <h3 className="text-lg font-semibold mb-4">이용 후기</h3>
                  
                  {/* 평점 요약 */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-semibold">전체 평점</span>
                      <div className="flex items-center">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="ml-1 text-lg font-semibold">4.2</span>
                        <span className="ml-1 text-gray-600">(24개 리뷰)</span>
                      </div>
                    </div>
                  </div>

                  {/* 리뷰 목록 (임시 데이터) */}
                  <div className="space-y-4">
                    {[
                      {
                        id: 1,
                        author: '김**',
                        rating: 5,
                        date: '2024-01-15',
                        content: '직원분들이 정말 친절하시고 시설도 깨끗합니다. 어머니께서 만족해하세요.',
                      },
                      {
                        id: 2,
                        author: '이**',
                        rating: 4,
                        date: '2024-01-10',
                        content: '전반적으로 좋은 시설이지만 주차공간이 조금 부족한 것 같아요.',
                      },
                      {
                        id: 3,
                        author: '박**',
                        rating: 5,
                        date: '2024-01-05',
                        content: '케어 서비스가 정말 전문적이고 체계적입니다. 추천합니다.',
                      },
                    ].map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <span className="font-medium">{review.author}</span>
                              <div className="flex items-center ml-2">
                                {Array.from({ length: review.rating }).map((_, i) => (
                                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                ))}
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>
                          <p className="text-gray-700">{review.content}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FacilityDetailModal; 