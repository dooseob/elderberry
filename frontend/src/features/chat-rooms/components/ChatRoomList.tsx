/**
 * ChatRoomList - 채팅방 목록 컴포넌트
 * 채팅방 목록을 표시하고 페이지네이션을 지원하는 컴포넌트
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Search, RefreshCw } from 'lucide-react';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { LoadingSpinner } from '../../../shared/ui/LoadingSpinner';
import { Badge } from '../../../shared/ui/Badge';
import { ChatRoomItem } from './ChatRoomItem';
import { CreateChatRoomModal } from './CreateChatRoomModal';
import { chatApi } from '../../../shared/api';
import type { ChatRoomListItem, ChatRoomStatus } from '../../../entities/chat';
import { CHAT_ROOM_LABELS } from '../../../entities/chat';

export const ChatRoomList: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<ChatRoomListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ChatRoomStatus | 'ALL'>('ACTIVE');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // 채팅방 목록 로드
  const loadChatRooms = async (page: number = 0, showRefreshing: boolean = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const response = await chatApi.getChatRooms({
        status: statusFilter,
        page,
        size: 20
      });

      setRooms(response.content);
      setTotalPages(response.totalPages);
      setCurrentPage(response.number);
    } catch (err) {
      console.error('채팅방 목록 로드 실패:', err);
      setError('채팅방 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    loadChatRooms(0);
  }, [statusFilter]);

  // 검색 필터링
  const filteredRooms = rooms.filter(room =>
    room.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
    CHAT_ROOM_LABELS[room.roomType].toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 채팅방 클릭 핸들러
  const handleRoomClick = (roomId: number) => {
    setSelectedRoomId(roomId);
    navigate(`/chat-rooms/${roomId}`);
  };

  // 새로고침
  const handleRefresh = () => {
    loadChatRooms(currentPage, true);
  };

  // 페이지 변경
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      loadChatRooms(newPage);
    }
  };

  // 상태 필터 변경
  const handleStatusFilterChange = (status: ChatRoomStatus | 'ALL') => {
    setStatusFilter(status);
    setCurrentPage(0);
  };

  if (loading && !refreshing) {
    return (
      <div className=\"flex items-center justify-center py-8\">
        <LoadingSpinner size=\"lg\" />
      </div>
    );
  }

  return (
    <div className=\"space-y-6\">
      {/* 헤더 */}
      <div className=\"flex items-center justify-between\">
        <div>
          <h1 className=\"text-2xl font-bold text-gray-900\">채팅방 목록</h1>
          <p className=\"text-gray-600 mt-1\">
            {rooms.length > 0 ? `${rooms.length}개의 채팅방` : '채팅방이 없습니다'}
          </p>
        </div>
        
        <div className=\"flex items-center gap-3\">
          <Button
            variant=\"outline\"
            size=\"sm\"
            onClick={handleRefresh}
            disabled={refreshing}
            className=\"flex items-center gap-2\"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
          
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className=\"flex items-center gap-2\"
          >
            <Plus className=\"w-4 h-4\" />
            새 채팅방
          </Button>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className=\"flex flex-col sm:flex-row gap-4\">
        {/* 검색 */}
        <div className=\"flex-1 relative\">
          <Search className=\"absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4\" />
          <Input
            placeholder=\"채팅방 이름, 메시지, 유형으로 검색...\"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className=\"pl-10\"
          />
        </div>
        
        {/* 상태 필터 */}
        <div className=\"flex items-center gap-2\">
          <Filter className=\"w-4 h-4 text-gray-500\" />
          <div className=\"flex gap-1\">
            {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size=\"sm\"
                onClick={() => handleStatusFilterChange(status)}
                className=\"text-xs\"
              >
                {status === 'ALL' ? '전체' : status === 'ACTIVE' ? '활성' : '비활성'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* 에러 표시 */}
      {error && (
        <div className=\"bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md\">
          {error}
        </div>
      )}

      {/* 채팅방 목록 */}
      {filteredRooms.length > 0 ? (
        <div className=\"space-y-3\">
          {filteredRooms.map((room) => (
            <ChatRoomItem
              key={room.roomId}
              room={room}
              isSelected={selectedRoomId === room.roomId}
              onClick={handleRoomClick}
            />
          ))}
        </div>
      ) : (
        <div className=\"text-center py-12\">
          <div className=\"w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4\">
            <span className=\"text-2xl\">💬</span>
          </div>
          <h3 className=\"text-lg font-medium text-gray-900 mb-2\">
            {searchQuery ? '검색 결과가 없습니다' : '채팅방이 없습니다'}
          </h3>
          <p className=\"text-gray-500 mb-6\">
            {searchQuery 
              ? `\"${searchQuery}\"에 대한 검색 결과가 없습니다.`
              : '새 채팅방을 만들어 대화를 시작해보세요.'
            }
          </p>
          {!searchQuery && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              첫 채팅방 만들기
            </Button>
          )}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className=\"flex items-center justify-center gap-2 mt-8\">
          <Button
            variant=\"outline\"
            size=\"sm\"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            이전
          </Button>
          
          <div className=\"flex items-center gap-1\">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const page = currentPage < 3 ? i : currentPage - 2 + i;
              if (page >= totalPages) return null;
              
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size=\"sm\"
                  onClick={() => handlePageChange(page)}
                  className=\"w-8 h-8 p-0\"
                >
                  {page + 1}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant=\"outline\"
            size=\"sm\"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
          >
            다음
          </Button>
        </div>
      )}

      {/* 새 채팅방 생성 모달 */}
      <CreateChatRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          handleRefresh();
        }}
      />
    </div>
  );
};

export default ChatRoomList;