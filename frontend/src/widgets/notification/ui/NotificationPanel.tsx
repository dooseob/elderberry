/**
 * 알림 패널 위젯 컴포넌트  
 * FSD 구조: widgets/notification/ui
 * 드롭다운으로 표시되는 알림 목록 패널
 */
import React, { useEffect, useRef, useState } from 'react';
import { X, MoreHorizontal, Check, CheckCheck, Trash2, Settings, Filter } from 'lucide-react';
import {
  useNotificationStore,
  useNotificationDropdown,
  useNotificationFilter,
  Notification,
  NotificationType,
  NotificationReadStatus,
  NOTIFICATION_DISPLAY_CONFIGS,
  formatNotificationTime,
  isUnreadNotification,
  isHighPriorityNotification
} from '../../../entities/notification';
import { Button, Card, Badge } from '../../../shared/ui';

interface NotificationPanelProps {
  className?: string;
  maxHeight?: string;
  onSettingsClick?: () => void;
  onNotificationClick?: (notification: Notification) => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  className = '',
  maxHeight = 'max-h-96',
  onSettingsClick,
  onNotificationClick
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState<NotificationReadStatus>(NotificationReadStatus.ALL);
  
  const { isOpen, close } = useNotificationDropdown();
  const { filter, setFilter } = useNotificationFilter();
  
  const {
    notifications,
    isLoading,
    error,
    hasMore,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification
  } = useNotificationStore();

  // 패널이 열릴 때 알림 목록 로드
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(filter);
    }
  }, [isOpen, fetchNotifications, filter]);

  // 외부 클릭 시 패널 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, close]);

  // 필터 변경 핸들러
  const handleFilterChange = (newFilter: NotificationReadStatus) => {
    setActiveFilter(newFilter);
    setFilter({ readStatus: newFilter, page: 0 });
    fetchNotifications({ readStatus: newFilter, page: 0 });
  };

  // 알림 클릭 핸들러
  const handleNotificationClick = async (notification: Notification) => {
    // 읽지 않은 알림이면 읽음 처리
    if (isUnreadNotification(notification)) {
      await markAsRead(notification.notificationId);
    }

    // 외부 핸들러 호출
    if (onNotificationClick) {
      onNotificationClick(notification);
    }

    // 액션 URL이 있으면 이동
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }

    close();
  };

  // 알림 삭제 핸들러
  const handleRemoveNotification = async (notificationId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // 클릭 이벤트 전파 방지
    await removeNotification(notificationId);
  };

  // 더 많은 알림 로드
  const loadMore = () => {
    if (hasMore && !isLoading) {
      fetchNotifications(filter, true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`
      absolute right-0 top-full mt-2 w-96 z-50
      ${className}
    `}>
      <Card 
        ref={panelRef}
        className="shadow-lg border-0 ring-1 ring-black/5"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">알림</h3>
          <div className="flex items-center space-x-2">
            {onSettingsClick && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSettingsClick}
                className="p-1"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={close}
              className="p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 필터 탭 */}
        <div className="flex border-b">
          {[
            { key: NotificationReadStatus.ALL, label: '전체' },
            { key: NotificationReadStatus.UNREAD, label: '읽지 않음' },
            { key: NotificationReadStatus.read, label: '읽음' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleFilterChange(key)}
              className={`
                flex-1 px-3 py-2 text-sm font-medium transition-colors
                ${activeFilter === key
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 액션 버튼들 */}
        {notifications.some(isUnreadNotification) && (
          <div className="p-3 border-b bg-gray-50">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="w-full"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              모두 읽음으로 표시
            </Button>
          </div>
        )}

        {/* 알림 목록 */}
        <div className={`${maxHeight} overflow-y-auto`}>
          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-50">
              {error}
            </div>
          )}

          {isLoading && notifications.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              알림을 불러오는 중...
            </div>
          )}

          {!isLoading && notifications.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>알림이 없습니다.</p>
            </div>
          )}

          {notifications.map((notification) => {
            const config = NOTIFICATION_DISPLAY_CONFIGS[notification.type] || NOTIFICATION_DISPLAY_CONFIGS[NotificationType.SYSTEM];
            const isUnread = isUnreadNotification(notification);
            const isHighPriority = isHighPriorityNotification(notification);

            return (
              <div
                key={notification.notificationId}
                className={`
                  group relative p-4 border-b cursor-pointer transition-colors
                  hover:bg-gray-50
                  ${isUnread ? 'bg-blue-50/50' : ''}
                `}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-3">
                  {/* 아이콘 */}
                  <div className={`
                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg
                    ${config.bgColor} ${config.textColor}
                    ${isHighPriority ? 'ring-2 ring-red-200' : ''}
                  `}>
                    {config.icon}
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`
                        text-sm font-medium truncate
                        ${isUnread ? 'text-gray-900' : 'text-gray-700'}
                      `}>
                        {notification.title}
                      </h4>
                      
                      {/* 우선순위 배지 */}
                      {isHighPriority && (
                        <Badge variant="destructive" className="ml-2 text-xs">
                          중요
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {notification.content}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">
                        {formatNotificationTime(notification.createdAt)}
                      </span>
                      
                      {/* 읽지 않음 표시 */}
                      {isUnread && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  </div>

                  {/* 액션 버튼들 */}
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-1">
                      {isUnread && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.notificationId);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="읽음으로 표시"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleRemoveNotification(notification.notificationId, e)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="삭제"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* 더 보기 버튼 */}
          {hasMore && (
            <div className="p-4 text-center border-b">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadMore}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? '불러오는 중...' : '더 보기'}
              </Button>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="p-3 bg-gray-50 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              close();
              // 전체 알림 페이지로 이동
              window.location.href = '/notifications';
            }}
            className="text-blue-600 hover:text-blue-800"
          >
            모든 알림 보기
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default NotificationPanel;