/**
 * FacilityDetailModal 메인 컨테이너 - 시설 상세 정보 모달
 * 분할된 6개 컴포넌트를 통합하여 관리하는 메인 컨테이너
 */
import React, { useState, useEffect } from 'react';
import {
  Home,
  Image,
  MapPin,
  Star,
  Stethoscope,
  X,
  Building2
} from '../../../../components/icons/LucideIcons';
import { motion, AnimatePresence } from 'framer-motion';
import { useFacilityStore, useSelectedFacility } from '@/stores/facilityStore';
import { useReviewStore } from '@/stores/reviewStore';
import { useFocusTrap } from '../../../../hooks/useFocusTrap';
import { ReviewSort } from '@/types/review';

// 분할된 컴포넌트들 import
import FacilityInfo from './FacilityInfo';
import FacilityMap from './FacilityMap';
import FacilityReviews from './FacilityReviews';
import FacilityPhotos from './FacilityPhotos';
import NearbyFacilities from './NearbyFacilities';

type TabType = 'overview' | 'location' | 'reviews' | 'photos' | 'nearby';

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
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nearbyFacilities] = useState<any[]>([]);

  // 포커스 트랩 설정
  const modalRef = useFocusTrap({
    isActive: isDetailModalOpen,
    initialFocus: 'button[data-close]',
    returnFocus: true,
  });

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

  // 월 비용 포맷팅
  const formatCost = (cost: number | null) => {
    if (!cost) return '문의';
    return `${(cost / 10000).toFixed(0)}만원`;
  };

  // 시설 이미지 (임시 데이터)
  const facilityImages = selectedFacility?.imageUrl 
    ? [selectedFacility.imageUrl]
    : [
        '/images/facility-placeholder-1.jpg',
        '/images/facility-placeholder-2.jpg',
        '/images/facility-placeholder-3.jpg',
      ];

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

  // 리뷰 정렬 변경
  const handleSortChange = async (sort: ReviewSort) => {
    if (selectedFacility) {
      await changeSort(sort);
    }
  };

  // 리뷰 필터 적용
  const handleFilterApply = async (filter: any) => {
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

  // 이미지 관련 핸들러
  const handleImageIndexChange = (index: number) => {
    setCurrentImageIndex(index);
  };

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

  // 입소 가능 여부 계산
  const availableSlots = selectedFacility.totalCapacity - selectedFacility.currentOccupancy;
  const occupancyRate = (selectedFacility.currentOccupancy / selectedFacility.totalCapacity) * 100;

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
            {/* 시설 이미지 헤더 */}
            <div className="relative h-48 bg-gray-200">
              <img
                src={facilityImages[0]}
                alt={selectedFacility.facilityName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/images/facility-default.jpg';
                }}
              />

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
            <div className="p-4 border-b bg-white">
              <h1 id="modal-title" className="text-xl font-bold text-gray-900 mb-1">
                {selectedFacility.facilityName}
              </h1>
              <p className="text-gray-600 text-sm mb-2">{selectedFacility.facilityType}</p>
              
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="text-gray-600">월 기본료</div>
                  <div className="font-semibold text-blue-600">
                    {formatCost(selectedFacility.monthlyBasicFee)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">입소 현황</div>
                  <div className="font-semibold">
                    {selectedFacility.currentOccupancy}/{selectedFacility.totalCapacity}명
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">입소 가능</div>
                  <div className={`font-semibold ${availableSlots > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {availableSlots > 0 ? `${availableSlots}명` : '대기'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 탭 네비게이션 */}
          <div className="border-b bg-white">
            <nav className="flex px-4 overflow-x-auto" role="tablist" aria-label="시설 정보 탭">
              {[
                { key: 'overview', label: '개요', icon: Home },
                { key: 'location', label: '위치', icon: MapPin },
                { key: 'reviews', label: '리뷰', icon: Star, badge: reviewStatistics?.totalCount },
                { key: 'photos', label: '사진', icon: Image, badge: facilityImages.length },
                { key: 'nearby', label: '주변시설', icon: Building2 },
              ].map(({ key, label, icon: Icon, badge }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as TabType)}
                  className={`flex items-center px-4 py-3 border-b-2 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
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
                <FacilityInfo
                  facility={selectedFacility}
                  isActionLoading={isActionLoading}
                  onContact={handleContact}
                  onVisit={handleVisit}
                  onMatching={handleMatching}
                />
              )}

              {activeTab === 'location' && (
                <FacilityMap
                  facility={selectedFacility}
                  nearbyFacilities={nearbyFacilities}
                />
              )}

              {activeTab === 'reviews' && (
                <FacilityReviews
                  reviews={reviews}
                  reviewStatistics={reviewStatistics}
                  loading={reviewLoading}
                  pagination={pagination}
                  currentSort={currentSort}
                  currentFilter={currentFilter}
                  onSortChange={handleSortChange}
                  onFilterApply={handleFilterApply}
                  onVote={handleReviewVote}
                  onPageChange={goToPage}
                />
              )}

              {activeTab === 'photos' && (
                <FacilityPhotos
                  facility={selectedFacility}
                  facilityImages={facilityImages}
                  currentImageIndex={currentImageIndex}
                  onImageIndexChange={handleImageIndexChange}
                  onPreviousImage={handlePreviousImage}
                  onNextImage={handleNextImage}
                />
              )}

              {activeTab === 'nearby' && (
                <NearbyFacilities
                  facility={selectedFacility}
                  nearbyFacilities={nearbyFacilities}
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FacilityDetailModal;