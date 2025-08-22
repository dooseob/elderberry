/**
 * 알림 목록 페이지 컴포넌트
 * 전체 알림 목록을 표시하고 필터링 기능 제공
 */
import React, { useEffect, useState } from 'react';
import { useNotificationStore } from '../../stores/notificationStore';
import { NotificationItem } from './NotificationItem';
import { LoadingSpinner } from '../../shared/ui/LoadingSpinner';
import { Button } from '../../shared/ui/Button';
import { Card } from '../../shared/ui/Card';
import { 
  NotificationFilter, 
  NotificationType, 
  NotificationPriority 
} from '../../types/notifications';

export const NotificationList: React.FC = () => {
  const {
    notifications,
    summary,
    filter,
    isLoading,
    error,
    hasMore,
    fetchNotifications,
    markAllAsRead,
    clearAllNotifications,
    setFilter,
    clearFilter
  } = useNotificationStore();

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleLoadMore = () => {
    fetchNotifications(filter, true);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleClearAll = () => {
    if (window.confirm('모든 알림을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      clearAllNotifications();
    }
  };

  const handleFilterChange = (newFilter: Partial<NotificationFilter>) => {
    setFilter(newFilter);
    fetchNotifications({ ...filter, ...newFilter });
  };

  const handleClearFilters = () => {
    clearFilter();
    fetchNotifications();
  };

  const hasActiveFilters = Object.keys(filter).length > 0;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">알림</h1>
          <p className="text-sm text-gray-600 mt-1">
            총 {summary.total}개의 알림 중 {summary.unread}개를 읽지 않았습니다.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            size="small"
            onClick={() => setShowFilters(!showFilters)}
          >
            필터 {showFilters ? '숨기기' : '보기'}
          </Button>
          
          {summary.unread > 0 && (
            <Button
              variant="outline"
              size="small"
              onClick={handleMarkAllAsRead}
              disabled={isLoading}
            >
              모두 읽음 표시
            </Button>
          )}
          
          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="small"
              onClick={handleClearAll}
              disabled={isLoading}
              className="text-red-600 hover:text-red-800"
            >
              모두 삭제
            </Button>
          )}
        </div>
      </div>

      {/* 필터 섹션 */}
      {showFilters && (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">필터</h3>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="small"
                  onClick={handleClearFilters}
                >
                  초기화
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 읽음 상태 필터 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  읽음 상태
                </label>
                <select
                  value={filter.read === undefined ? 'all' : filter.read.toString()}
                  onChange={(e) => {
                    const value = e.target.value === 'all' ? undefined : e.target.value === 'true';
                    handleFilterChange({ read: value });
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">전체</option>
                  <option value="false">읽지 않음</option>
                  <option value="true">읽음</option>
                </select>
              </div>

              {/* 우선순위 필터 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  우선순위
                </label>
                <select
                  value={filter.priority || 'all'}
                  onChange={(e) => {
                    const value = e.target.value === 'all' ? undefined : e.target.value as NotificationPriority;
                    handleFilterChange({ priority: value });
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">전체</option>
                  <option value={NotificationPriority.URGENT}>긴급</option>
                  <option value={NotificationPriority.HIGH}>높음</option>
                  <option value={NotificationPriority.MEDIUM}>보통</option>
                  <option value={NotificationPriority.LOW}>낮음</option>
                </select>
              </div>

              {/* 날짜 필터 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  기간
                </label>
                <select
                  onChange={(e) => {
                    const value = e.target.value;
                    const now = new Date();
                    let dateFrom: string | undefined;

                    switch (value) {
                      case 'today':
                        dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
                        break;
                      case 'week':
                        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
                        break;
                      case 'month':
                        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
                        break;
                      default:
                        dateFrom = undefined;
                    }

                    handleFilterChange({ dateFrom, dateTo: undefined });
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">전체</option>
                  <option value="today">오늘</option>
                  <option value="week">최근 7일</option>
                  <option value="month">최근 30일</option>
                </select>
              </div>
            </div>

            {/* 알림 타입 필터 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                알림 타입
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.values(NotificationType).map((type) => (
                  <label key={type} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filter.types?.includes(type) || false}
                      onChange={(e) => {
                        const currentTypes = filter.types || [];
                        const newTypes = e.target.checked
                          ? [...currentTypes, type]
                          : currentTypes.filter(t => t !== type);
                        
                        handleFilterChange({ 
                          types: newTypes.length > 0 ? newTypes : undefined 
                        });
                      }}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-700">
                      {getTypeDisplayName(type)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 알림 목록 */}
      <div className="space-y-2">
        {isLoading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="medium" />
            <span className="ml-3 text-gray-600">알림을 불러오는 중...</span>
          </div>
        ) : error ? (
          <Card className="p-8 text-center">
            <p className="text-red-600 mb-4">알림을 불러오는데 실패했습니다.</p>
            <Button
              variant="outline"
              onClick={() => fetchNotifications()}
            >
              다시 시도
            </Button>
          </Card>
        ) : notifications.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">알림이 없습니다</h3>
            <p className="text-gray-600">
              {hasActiveFilters 
                ? '필터 조건에 맞는 알림이 없습니다.' 
                : '새로운 알림이 없습니다.'
              }
            </p>
          </Card>
        ) : (
          <>
            <div className="space-y-2">
              {notifications.map((notification) => (
                <Card key={notification.id} className="overflow-hidden">
                  <NotificationItem
                    notification={notification}
                    showActions={true}
                    compact={false}
                  />
                </Card>
              ))}
            </div>

            {/* 더 보기 버튼 */}
            {hasMore && (
              <div className="text-center py-6">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={isLoading}
                >
                  {isLoading ? '불러오는 중...' : '더 보기'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// 알림 타입 표시명 변환 함수
function getTypeDisplayName(type: NotificationType): string {
  const typeNames: Record<NotificationType, string> = {
    [NotificationType.FACILITY_MATCH_FOUND]: '시설 매칭',
    [NotificationType.FACILITY_MATCH_CONFIRMED]: '매칭 확정',
    [NotificationType.FACILITY_MATCH_CANCELLED]: '매칭 취소',
    [NotificationType.REVIEW_APPROVED]: '리뷰 승인',
    [NotificationType.REVIEW_REJECTED]: '리뷰 거부',
    [NotificationType.REVIEW_REPORTED]: '리뷰 신고',
    [NotificationType.JOB_APPLICATION_RECEIVED]: '지원 접수',
    [NotificationType.JOB_APPLICATION_APPROVED]: '지원 승인',
    [NotificationType.JOB_APPLICATION_REJECTED]: '지원 거부',
    [NotificationType.JOB_INTERVIEW_SCHEDULED]: '면접 일정',
    [NotificationType.SYSTEM_MAINTENANCE]: '시스템 점검',
    [NotificationType.SYSTEM_UPDATE]: '시스템 업데이트',
    [NotificationType.ACCOUNT_SECURITY]: '계정 보안',
    [NotificationType.GENERAL_INFO]: '일반 정보',
    [NotificationType.PROMOTION]: '프로모션'
  };
  
  return typeNames[type] || type;
}

export default NotificationList;