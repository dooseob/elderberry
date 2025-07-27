/**
 * 알림 전체 페이지 컴포넌트
 * 모든 알림을 확인하고 관리할 수 있는 페이지
 */
import React from 'react';
import { NotificationList } from '../components/notifications/NotificationList';

const NotificationsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      <NotificationList />
    </div>
  );
};

export default NotificationsPage;