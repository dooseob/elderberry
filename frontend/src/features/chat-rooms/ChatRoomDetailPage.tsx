/**
 * ChatRoomDetailPage - 채팅방 상세 페이지
 * 실시간 메시지 송수신 인터페이스
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Settings, Users, MoreVertical, Phone, Video } from 'lucide-react';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import { LoadingSpinner } from '../../shared/ui/LoadingSpinner';
import { MessageList } from './components/MessageList';
import { MessageInput } from './components/MessageInput';
import { chatApi } from '../../shared/api';
import type { ChatRoomDetail, MessageSendRequest, ChatMessage } from '../../entities/chat';
import { CHAT_ROOM_ICONS, CHAT_ROOM_LABELS } from '../../entities/chat';

export const ChatRoomDetailPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  
  const [roomDetail, setRoomDetail] = useState<ChatRoomDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('current-user'); // 실제로는 인증 상태에서 가져옴
  
  // URL 파라미터 검증
  const roomIdNumber = roomId ? parseInt(roomId, 10) : null;
  
  if (!roomIdNumber || isNaN(roomIdNumber)) {
    navigate('/chat-rooms');
    return null;
  }

  // 채팅방 상세 정보 로드
  useEffect(() => {
    const loadRoomDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const detail = await chatApi.getChatRoomDetail(roomIdNumber);
        setRoomDetail(detail);
      } catch (err) {
        console.error('채팅방 상세 정보 로드 실패:', err);
        setError('채팅방 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadRoomDetail();
  }, [roomIdNumber]);

  // 메시지 전송 핸들러
  const handleSendMessage = useCallback(async (message: MessageSendRequest): Promise<void> => {
    try {
      const sentMessage = await chatApi.sendMessage({
        roomId: roomIdNumber,
        message
      });
      
      // MessageList에 새 메시지 추가 (실제로는 실시간 업데이트가 필요)
      console.log('메시지 전송 완료:', sentMessage);
    } catch (err) {
      console.error('메시지 전송 실패:', err);
      throw err;
    }
  }, [roomIdNumber]);

  // 파일 다운로드 핸들러
  const handleFileDownload = useCallback((url: string, fileName: string) => {
    // 실제 다운로드 로직
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // 뒤로 가기
  const handleGoBack = () => {
    navigate('/chat-rooms');
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className=\"min-h-screen bg-gray-50 flex items-center justify-center\">
        <LoadingSpinner size=\"lg\" />
      </div>
    );
  }

  // 에러 상태
  if (error || !roomDetail) {
    return (
      <div className=\"min-h-screen bg-gray-50 flex items-center justify-center\">
        <div className=\"text-center\">
          <div className=\"w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4\">
            <span className=\"text-2xl\">❌</span>
          </div>
          <h3 className=\"text-lg font-medium text-gray-900 mb-2\">
            채팅방을 찾을 수 없습니다
          </h3>
          <p className=\"text-gray-500 mb-6\">
            {error || '요청하신 채팅방이 존재하지 않거나 접근할 수 없습니다.'}
          </p>
          <Button onClick={handleGoBack}>
            채팅방 목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{roomDetail.roomName} - 엘더베리 채팅</title>
        <meta name=\"description\" content={`${roomDetail.roomName}에서 실시간 대화를 나누세요. ${roomDetail.description}`} />
      </Helmet>

      <div className=\"min-h-screen bg-gray-50 flex flex-col\">
        {/* 채팅방 헤더 */}
        <div className=\"bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10\">
          <div className=\"flex items-center gap-3\">
            {/* 뒤로 가기 버튼 */}
            <Button
              variant=\"ghost\"
              size=\"sm\"
              onClick={handleGoBack}
              className=\"p-2\"
            >
              <ArrowLeft className=\"w-5 h-5\" />
            </Button>

            {/* 채팅방 정보 */}
            <div className=\"flex items-center gap-3\">
              <div className=\"w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl\">
                {CHAT_ROOM_ICONS[roomDetail.roomType]}
              </div>
              <div>
                <h1 className=\"font-semibold text-gray-900\">{roomDetail.roomName}</h1>
                <div className=\"flex items-center gap-2 text-sm text-gray-500\">
                  <Badge variant=\"secondary\" className=\"text-xs px-2 py-0.5\">
                    {CHAT_ROOM_LABELS[roomDetail.roomType]}
                  </Badge>
                  <span>👥 {roomDetail.participants.length}명</span>
                  {roomDetail.status === 'ACTIVE' && (
                    <div className=\"w-2 h-2 bg-green-400 rounded-full\" title=\"활성\" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 채팅방 액션 */}
          <div className=\"flex items-center gap-2\">
            {/* 통화 버튼들 (향후 구현) */}
            {roomDetail.roomType === 'COORDINATOR_CONSULTATION' && (
              <>
                <Button variant=\"ghost\" size=\"sm\" className=\"p-2\" disabled>
                  <Phone className=\"w-5 h-5\" />
                </Button>
                <Button variant=\"ghost\" size=\"sm\" className=\"p-2\" disabled>
                  <Video className=\"w-5 h-5\" />
                </Button>
              </>
            )}

            {/* 참여자 목록 */}
            <Button variant=\"ghost\" size=\"sm\" className=\"p-2\" disabled>
              <Users className=\"w-5 h-5\" />
            </Button>

            {/* 설정 메뉴 */}
            <Button variant=\"ghost\" size=\"sm\" className=\"p-2\" disabled>
              <MoreVertical className=\"w-5 h-5\" />
            </Button>
          </div>
        </div>

        {/* 메시지 영역 */}
        <div className=\"flex-1 flex flex-col min-h-0\">
          <div className=\"flex-1 relative\">
            <MessageList
              roomId={roomIdNumber}
              currentUserId={currentUserId}
              onFileDownload={handleFileDownload}
            />
          </div>

          {/* 메시지 입력 */}
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={roomDetail.status !== 'ACTIVE'}
            placeholder={
              roomDetail.status === 'ACTIVE'
                ? '메시지를 입력하세요...'
                : '이 채팅방은 비활성 상태입니다.'
            }
            allowFileUpload={roomDetail.settings.allowFileShare}
          />
        </div>

        {/* 채팅방 설명 (하단에 고정) */}
        {roomDetail.description && (
          <div className=\"bg-gray-50 border-t border-gray-200 px-4 py-2\">
            <p className=\"text-sm text-gray-600 text-center\">
              💡 {roomDetail.description}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatRoomDetailPage;