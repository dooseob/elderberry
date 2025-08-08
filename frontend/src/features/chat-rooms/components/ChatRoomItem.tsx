/**
 * ChatRoomItem - 개별 채팅방 아이템 컴포넌트
 * 채팅방 목록에서 각 채팅방을 표시하는 재사용 가능한 컴포넌트
 */

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Badge } from '../../../shared/ui/Badge';
import { Card } from '../../../shared/ui/Card';
import type { ChatRoomListItem } from '../../../entities/chat';
import { CHAT_ROOM_LABELS } from '../../../entities/chat';

interface ChatRoomItemProps {
  room: ChatRoomListItem;
  isSelected?: boolean;
  onClick?: (roomId: number) => void;
}

export const ChatRoomItem: React.FC<ChatRoomItemProps> = ({
  room,
  isSelected = false,
  onClick
}) => {
  const handleClick = () => {
    onClick?.(room.roomId);
  };

  const formatLastActivity = (activityTime: string) => {
    try {
      return formatDistanceToNow(new Date(activityTime), {
        addSuffix: true,
        locale: ko
      });
    } catch {
      return '방금 전';
    }
  };

  return (
    <Card 
      className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md border-l-4 ${
        isSelected 
          ? 'bg-green-50 border-l-green-500 shadow-md' 
          : 'bg-white border-l-gray-200 hover:border-l-green-300'
      }`}
      onClick={handleClick}
    >
      <div className=\"flex items-start justify-between gap-3\">
        {/* 채팅방 정보 */}
        <div className=\"flex items-start gap-3 flex-1 min-w-0\">
          {/* 채팅방 아이콘 */}
          <div className=\"flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl\">
            {room.roomIcon}
          </div>
          
          {/* 채팅방 내용 */}
          <div className=\"flex-1 min-w-0\">
            <div className=\"flex items-center justify-between gap-2 mb-1\">
              <h3 className=\"font-semibold text-gray-900 truncate\">
                {room.roomName}
              </h3>
              <span className=\"text-xs text-gray-500 flex-shrink-0\">
                {formatLastActivity(room.lastActivity)}
              </span>
            </div>
            
            {/* 채팅방 유형 및 참여자 수 */}
            <div className=\"flex items-center gap-2 mb-2\">
              <Badge 
                variant={room.roomType === 'COORDINATOR_CONSULTATION' ? 'default' : 'secondary'}
                className=\"text-xs px-2 py-0.5\"
              >
                {CHAT_ROOM_LABELS[room.roomType]}
              </Badge>
              <span className=\"text-xs text-gray-500\">
                👥 {room.participantCount}명
              </span>
            </div>
            
            {/* 마지막 메시지 */}
            <p className=\"text-sm text-gray-600 truncate\">
              {room.lastMessage || '메시지가 없습니다.'}
            </p>
          </div>
        </div>
        
        {/* 읽지 않은 메시지 수 */}
        {room.unreadCount > 0 && (
          <Badge 
            className=\"bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[24px] h-6 flex items-center justify-center\"
          >
            {room.unreadCount > 99 ? '99+' : room.unreadCount}
          </Badge>
        )}
        
        {/* 활성 상태 인디케이터 */}
        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
          room.isActive ? 'bg-green-400' : 'bg-gray-300'
        }`} title={room.isActive ? '활성' : '비활성'} />
      </div>
    </Card>
  );
};

export default ChatRoomItem;