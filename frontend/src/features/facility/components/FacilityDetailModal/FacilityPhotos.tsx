/**
 * FacilityPhotos 컴포넌트 - 시설 사진 갤러리
 * 이미지 슬라이더, 썸네일 그리드, 카테고리별 사진 분류 등을 포함
 */
import React, { memo, useState } from 'react';
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Home,
  Image,
  Users,
  Wifi,
  X
} from '../../../../components/icons/LucideIcons';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/shared/ui';
import { Facility } from '@/types/facility';

interface FacilityPhotosProps {
  facility: Facility;
  facilityImages: string[];
  currentImageIndex: number;
  onImageIndexChange: (index: number) => void;
  onPreviousImage: () => void;
  onNextImage: () => void;
}

const FacilityPhotos: React.FC<FacilityPhotosProps> = memo(({
  facility,
  facilityImages,
  currentImageIndex,
  onImageIndexChange,
  onPreviousImage,
  onNextImage
}) => {
  const [showImageGallery, setShowImageGallery] = useState(false);

  // 사진 카테고리 데이터
  const photoCategories = [
    { name: '외관', count: 3, icon: Home },
    { name: '내부시설', count: 5, icon: Activity },
    { name: '객실', count: 4, icon: Users },
    { name: '편의시설', count: 2, icon: Wifi }
  ];

  return (
    <>
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
              alt={`${facility.facilityName} 사진 ${currentImageIndex + 1}`}
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
                onClick={onPreviousImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full flex items-center justify-center shadow-lg transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={onNextImage}
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
            <Image className="w-5 h-5" />
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
              onClick={() => onImageIndexChange(index)}
            >
              <img
                src={image}
                alt={`${facility.facilityName} 썸네일 ${index + 1}`}
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
              <Image className="w-6 h-6 text-gray-400" />
            </div>
          ))}
        </div>

        {/* 사진 카테고리 */}
        <div className="mt-6 space-y-4">
          <h4 className="font-medium text-gray-900">사진 카테고리</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photoCategories.map((category) => (
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

        {/* 사진 촬영 날짜 */}
        <div className="mt-4 text-center">
          <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
            <Image className="w-4 h-4 mr-1" />
            최근 업데이트: 2024년 1월
          </div>
        </div>
      </motion.div>

      {/* 이미지 갤러리 모달 */}
      <AnimatePresence>
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
                alt={`${facility.facilityName} 사진 ${currentImageIndex + 1}`}
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
                    onClick={onPreviousImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full flex items-center justify-center"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={onNextImage}
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
    </>
  );
});

FacilityPhotos.displayName = 'FacilityPhotos';

export default FacilityPhotos;