/**
 * 알림 드롭다운 컴포넌트
 * MainLayout의 알림 버튼에서 사용되는 드롭다운 메뉴
 */
import React, { useEffect, useRef } from 'react';
import { useNotificationStore } from '../../stores/notificationStore';
import { NotificationItem } from './NotificationItem';
import { LoadingSpinner } from '../../shared/ui/LoadingSpinner';
import { Button } from '../../shared/ui/Button';
import { ConditionalMotion } from '../../shared/ui/ConditionalMotion';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  className = ''
}) => {
  const {
    notifications,
    summary,
    isLoading,
    error,
    fetchNotifications,
    markAllAsRead,
    clearAllNotifications
  } = useNotificationStore();

  const dropdownRef = useRef<HTMLDivElement>(null);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // 드롭다운이 열릴 때 알림 새로고침
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      return () => document.removeEventListener('keydown', handleEscKey);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleClearAll = () => {
    if (window.confirm('모든 알림을 삭제하시겠습니까?')) {
      clearAllNotifications();
    }
  };

  const handleNotificationClick = (notification: any) => {
    onClose();
    // 알림 클릭 시 해당 페이지로 이동하는 로직은 NotificationItem에서 처리
  };

  return (
    <ConditionalMotion
      animation={{
        initial: { opacity: 0, scale: 0.95, y: -10 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: -10 },
        transition: { duration: 0.15 }
      }}
    >
      <div
        ref={dropdownRef}
        className={`
          absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50
          max-h-96 overflow-hidden
          ${className}
        `}
        role="dialog"
        aria-label="알림 목록"
        aria-modal="false"
      >
        {/* 헤더 */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              알림 
              {summary.unread > 0 && (
                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {summary.unread}개 읽지 않음
                </span>
              )}
            </h2>
            
            <div className="flex gap-2">
              {summary.unread > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 focus:outline-none focus:underline"
                  aria-label="모든 알림을 읽음으로 표시"
                >
                  모두 읽음
                </button>
              )}
              
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-red-600 hover:text-red-800 focus:outline-none focus:underline"
                  aria-label="모든 알림 삭제"
                >
                  모두 삭제
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 내용 */}
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="small" />
              <span className="ml-2 text-sm text-gray-600">알림을 불러오는 중...</span>
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <p className="text-sm text-red-600 mb-2">알림을 불러오는데 실패했습니다.</p>
              <Button
                variant="outline"
                size="small"
                onClick={() => fetchNotifications()}
              >
                다시 시도
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-3">🔔</div>
              <p className="text-sm text-gray-600">새로운 알림이 없습니다.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.slice(0, 10).map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={handleNotificationClick}
                  showActions={false}
                  compact={true}
                />
              ))}
              
              {notifications.length > 10 && (
                <div className="p-3 text-center border-t border-gray-200">
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => {
                      onClose();
                      // 전체 알림 페이지로 이동
                      window.location.href = '/notifications';
                    }}
                  >
                    모든 알림 보기 ({notifications.length})
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ConditionalMotion>
  );
};

export default NotificationDropdown;