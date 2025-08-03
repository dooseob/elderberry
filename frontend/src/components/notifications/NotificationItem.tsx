/**
 * 개별 알림 아이템 컴포넌트
 * 접근성과 사용성을 고려한 알림 표시
 */
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { 
  Notification, 
  NotificationDisplayConfigs, 
  NotificationPriority 
} from '../../types/notifications';
import { useNotificationStore } from '../../stores/notificationStore';
import { ConditionalMotion } from '../../shared/ui/ConditionalMotion';

interface NotificationItemProps {
  notification: Notification;
  onClick?: (notification: Notification) => void;
  showActions?: boolean;
  compact?: boolean;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClick,
  showActions = true,
  compact = false
}) => {
  const { markAsRead, deleteNotification } = useNotificationStore();
  
  const config = NotificationDisplayConfigs[notification.type];
  
  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (onClick) {
      onClick(notification);
    } else if (notification.actionUrl) {
      // 페이지 이동 처리
      window.location.href = notification.actionUrl;
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(notification.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(notification.id);
  };

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: ko
  });

  const priorityClasses = {
    [NotificationPriority.LOW]: 'border-l-gray-300',
    [NotificationPriority.MEDIUM]: 'border-l-blue-400',
    [NotificationPriority.HIGH]: 'border-l-orange-400',
    [NotificationPriority.URGENT]: 'border-l-red-500'
  };

  return (
    <ConditionalMotion
      animation={{
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 },
        transition: { duration: 0.2 }
      }}
    >
      <div
        className={`
          relative p-4 border-l-4 cursor-pointer transition-all duration-200
          ${priorityClasses[notification.priority]}
          ${notification.read 
            ? 'bg-gray-50 opacity-75' 
            : `${config.bgColor} hover:shadow-md`
          }
          ${compact ? 'p-3' : 'p-4'}
          hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500
        `}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`알림: ${notification.title}. ${notification.read ? '읽음' : '읽지 않음'}`}
      >
        {/* 읽지 않음 표시 */}
        {!notification.read && (
          <div
            className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"
            aria-label="읽지 않은 알림"
          />
        )}

        <div className="flex items-start gap-3">
          {/* 아이콘 */}
          <div className={`text-lg ${config.textColor} flex-shrink-0`}>
            {config.icon}
          </div>

          {/* 내용 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className={`
                font-medium text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900'}
                ${compact ? 'text-xs' : 'text-sm'}
                truncate
              `}>
                {notification.title}
              </h3>
              
              {!compact && (
                <span className={`
                  text-xs ${notification.read ? 'text-gray-400' : 'text-gray-500'}
                  flex-shrink-0 ml-2
                `}>
                  {timeAgo}
                </span>
              )}
            </div>

            <p className={`
              text-sm ${notification.read ? 'text-gray-500' : 'text-gray-700'}
              ${compact ? 'text-xs line-clamp-1' : 'line-clamp-2'}
            `}>
              {notification.message}
            </p>

            {/* 우선순위 표시 (긴급한 경우만) */}
            {notification.priority === NotificationPriority.URGENT && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                  🚨 긴급
                </span>
              </div>
            )}

            {/* 액션 버튼들 */}
            {showActions && !compact && (
              <div className="mt-3 flex gap-2">
                {!notification.read && (
                  <button
                    onClick={handleMarkAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800 focus:outline-none focus:underline"
                    aria-label="읽음으로 표시"
                  >
                    읽음 표시
                  </button>
                )}
                
                <button
                  onClick={handleDelete}
                  className="text-xs text-red-600 hover:text-red-800 focus:outline-none focus:underline"
                  aria-label="알림 삭제"
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ConditionalMotion>
  );
};

export default NotificationItem;