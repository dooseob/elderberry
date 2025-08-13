/**
 * 알림 벨 위젯 컴포넌트
 * FSD 구조: widgets/notification/ui
 * 헤더에 표시되는 알림 아이콘 + 배지
 */
import React, { useEffect } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { 
  useNotificationStore, 
  useUnreadCount, 
  useNotificationDropdown,
  useRealtimeNotifications,
  NOTIFICATION_MAX_DISPLAY_COUNT 
} from '../../../entities/notification';
import { Badge } from '../../../shared/ui';

interface NotificationBellProps {
  className?: string;
  showBadge?: boolean;
  autoStartPolling?: boolean;
  onBellClick?: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  className = '',
  showBadge = true,
  autoStartPolling = true,
  onBellClick
}) => {
  const unreadCount = useUnreadCount();
  const { isOpen, toggle } = useNotificationDropdown();
  const { isPolling, startPolling, stopPolling } = useRealtimeNotifications();

  // 컴포넌트 마운트 시 실시간 폴링 시작 (무한 루프 방지)
  useEffect(() => {
    if (autoStartPolling && !isPolling) {
      startPolling();
    }

    // 컴포넌트 언마운트 시 폴링 중지
    return () => {
      if (autoStartPolling) {
        stopPolling();
      }
    };
  }, [autoStartPolling]); // autoStartPolling만 의존성으로 사용하여 무한 루프 방지

  const handleClick = () => {
    if (onBellClick) {
      onBellClick();
    } else {
      toggle();
    }
  };

  // 배지 표시 숫자 계산
  const displayCount = unreadCount > NOTIFICATION_MAX_DISPLAY_COUNT 
    ? `${NOTIFICATION_MAX_DISPLAY_COUNT}+` 
    : unreadCount.toString();

  // 애니메이션 클래스
  const bellClass = unreadCount > 0 
    ? 'animate-pulse text-blue-600' 
    : 'text-gray-500 hover:text-gray-700';

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleClick}
        className={`
          p-2 rounded-full transition-colors duration-200 
          hover:bg-gray-100 focus:outline-none focus:ring-2 
          focus:ring-blue-500 focus:ring-offset-2
          ${isOpen ? 'bg-gray-100' : ''}
        `}
        aria-label={`알림 ${unreadCount}개`}
        aria-expanded={isOpen}
      >
        {unreadCount > 0 ? (
          <BellRing className={`h-6 w-6 ${bellClass}`} />
        ) : (
          <Bell className={`h-6 w-6 ${bellClass}`} />
        )}
      </button>

      {/* 읽지 않은 알림 배지 */}
      {showBadge && unreadCount > 0 && (
        <Badge 
          variant="destructive"
          className="
            absolute -top-1 -right-1 
            min-w-[1.2rem] h-5 px-1
            text-xs font-semibold
            flex items-center justify-center
            animate-bounce
          "
        >
          {displayCount}
        </Badge>
      )}

      {/* 폴링 상태 표시 (개발 모드에서만) */}
      {process.env.NODE_ENV === 'development' && isPolling && (
        <div className="
          absolute -bottom-1 -right-1 
          w-2 h-2 bg-green-500 rounded-full
          animate-ping
        " />
      )}
    </div>
  );
};

export default NotificationBell;