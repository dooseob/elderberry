/**
 * 시설 목록 표시 컴포넌트
 * 리스트 뷰와 그리드 뷰를 지원하고, 로딩 상태와 빈 상태 처리
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, RefreshCw } from 'lucide-react';

import { FacilityProfile } from '@/stores/facilityStore';
import FacilityCard from './FacilityCard';
import Card, { CardContent } from '@/components/ui/Card';

interface FacilityListProps {
  facilities: FacilityProfile[];
  viewMode?: 'list' | 'grid';
  isLoading?: boolean;
  emptyMessage?: string;
  onFacilitySelect?: (facility: FacilityProfile) => void;
  showActions?: boolean;
}

const FacilityList: React.FC<FacilityListProps> = ({
  facilities,
  viewMode = 'list',
  isLoading = false,
  emptyMessage = '시설이 없습니다.',
  onFacilitySelect,
  showActions = true,
}) => {
  // 로딩 스켈레톤 컴포넌트
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              {/* 이미지 스켈레톤 */}
              <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0"></div>
              
              {/* 콘텐츠 스켈레톤 */}
              <div className="flex-1 space-y-3">
                {/* 제목 */}
                <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                
                {/* 부제목 */}
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                
                {/* 설명 라인들 */}
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
                
                {/* 버튼들 */}
                <div className="flex space-x-2 pt-2">
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
              
              {/* 우측 정보 */}
              <div className="text-right space-y-2">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // 빈 상태 컴포넌트
  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="text-center py-12"
    >
      <Card>
        <CardContent className="p-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                검색 결과가 없습니다
              </h3>
              <p className="text-gray-500 max-w-md">
                {emptyMessage}
              </p>
            </div>
            
            <div className="text-sm text-gray-400 mt-4">
              <p>검색 조건을 변경하거나 필터를 조정해보세요.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2 text-gray-500">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>시설을 검색하고 있습니다...</span>
          </div>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  // 빈 상태일 때
  if (facilities.length === 0) {
    return <EmptyState />;
  }

  // 그리드 뷰 레이아웃
  if (viewMode === 'grid') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {facilities.map((facility, index) => (
            <motion.div
              key={facility.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <FacilityCard
                facility={facility}
                viewMode="grid"
                onSelect={onFacilitySelect}
                showActions={showActions}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    );
  }

  // 리스트 뷰 레이아웃 (기본)
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <AnimatePresence>
        {facilities.map((facility, index) => (
          <motion.div
            key={facility.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <FacilityCard
              facility={facility}
              viewMode="list"
              onSelect={onFacilitySelect}
              showActions={showActions}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default FacilityList; 