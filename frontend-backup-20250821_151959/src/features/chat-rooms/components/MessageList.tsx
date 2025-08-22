/**
 * MessageList - 메시지 목록 컴포넌트
 * 무한 스크롤과 실시간 메시지 업데이트 지원
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowDown, RefreshCw } from 'lucide-react';
import { Button } from '../../../shared/ui/Button';
import { LoadingSpinner } from '../../../shared/ui/LoadingSpinner';
import { MessageItem } from './MessageItem';
import { chatApi } from '../../../shared/api';
import type { ChatMessage } from '../../../entities/chat';

interface MessageListProps {
  roomId: number;
  currentUserId: string;
  onFileDownload?: (url: string, fileName: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  roomId,
  currentUserId,
  onFileDownload
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);

  // 메시지 로드
  const loadMessages = useCallback(async (beforeMessageId?: number, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await chatApi.getChatMessages({
        roomId,
        beforeMessageId,
        limit: 50
      });

      const newMessages = response.content;
      
      if (append) {
        // 이전 메시지를 앞에 추가
        setMessages(prev => [...newMessages.reverse(), ...prev]);
        setHasMore(newMessages.length === 50);
      } else {
        // 초기 로드 또는 새로고침
        setMessages(newMessages.reverse());
        setHasMore(newMessages.length === 50);
      }
    } catch (err) {
      console.error('메시지 로드 실패:', err);
      setError('메시지를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [roomId]);

  // 초기 메시지 로드
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // 스크롤 이벤트 처리
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;

    const container = messagesContainerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;
    
    // 상단 근처에서 이전 메시지 로드
    if (scrollTop < 100 && hasMore && !loadingMore && messages.length > 0) {
      const oldScrollHeight = scrollHeight;
      loadMessages(messages[0]?.messageId, true).then(() => {
        // 스크롤 위치 유지
        if (messagesContainerRef.current) {
          const newScrollHeight = messagesContainerRef.current.scrollHeight;
          messagesContainerRef.current.scrollTop = newScrollHeight - oldScrollHeight + scrollTop;
        }
      });
    }

    // 하단 스크롤 버튼 표시/숨김
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
    
    lastScrollTop.current = scrollTop;
  }, [hasMore, loadingMore, messages, loadMessages]);

  // 스크롤 이벤트 등록
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // 하단으로 스크롤
  const scrollToBottom = useCallback((smooth: boolean = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? 'smooth' : 'auto' 
      });
    }
  }, []);

  // 새 메시지가 추가될 때 자동 스크롤 (하단에 있을 때만)
  useEffect(() => {
    if (messages.length > 0 && !showScrollButton) {
      scrollToBottom(false);
    }
  }, [messages.length, showScrollButton, scrollToBottom]);

  // 새 메시지 추가 (외부에서 호출)
  const addMessage = useCallback((newMessage: ChatMessage) => {
    setMessages(prev => [...prev, newMessage]);
  }, []);

  // 메시지 읽음 처리
  const markMessageAsRead = useCallback(async (messageId: number) => {
    try {
      await chatApi.markMessageAsRead(messageId);
      
      // 로컬 상태 업데이트
      setMessages(prev => prev.map(msg => 
        msg.messageId === messageId 
          ? { ...msg, readBy: [...msg.readBy, currentUserId], deliveryStatus: 'READ' }
          : msg
      ));
    } catch (err) {
      console.error('메시지 읽음 처리 실패:', err);
    }
  }, [currentUserId]);

  // 파일 다운로드 핸들러
  const handleFileDownload = useCallback((url: string, fileName: string) => {
    if (onFileDownload) {
      onFileDownload(url, fileName);
    } else {
      // 기본 다운로드 동작
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [onFileDownload]);

  // 새로고침
  const handleRefresh = () => {
    loadMessages();
  };

  if (loading && messages.length === 0) {
    return (
      <div className=\"flex items-center justify-center h-full\">
        <LoadingSpinner size=\"lg\" />
      </div>
    );
  }

  return (
    <div className=\"relative h-full flex flex-col\">
      {/* 에러 메시지 */}
      {error && (
        <div className=\"p-4 bg-red-50 border-b border-red-200 text-red-700 text-sm flex items-center justify-between\">
          <span>{error}</span>
          <Button
            variant=\"ghost\"
            size=\"sm\"
            onClick={handleRefresh}
            className=\"text-red-700 hover:text-red-800\"
          >
            <RefreshCw className=\"w-4 h-4\" />
          </Button>
        </div>
      )}

      {/* 메시지 목록 */}
      <div
        ref={messagesContainerRef}
        className=\"flex-1 overflow-y-auto px-4 py-4 space-y-4\"
        style={{ scrollBehavior: 'auto' }}
      >
        {/* 이전 메시지 로딩 인디케이터 */}
        {loadingMore && (
          <div className=\"flex justify-center py-4\">
            <LoadingSpinner size=\"sm\" />
          </div>
        )}

        {/* 메시지 없음 */}
        {messages.length === 0 && !loading && (
          <div className=\"flex flex-col items-center justify-center h-full text-center\">
            <div className=\"w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4\">
              <span className=\"text-2xl\">💬</span>
            </div>
            <h3 className=\"text-lg font-medium text-gray-900 mb-2\">
              대화를 시작해보세요
            </h3>
            <p className=\"text-gray-500\">
              첫 메시지를 보내서 대화를 시작해보세요.
            </p>
          </div>
        )}

        {/* 메시지 목록 */}
        {messages.map((message, index) => {
          const isOwn = message.senderId === currentUserId;
          const isLastMessage = index === messages.length - 1;
          
          return (
            <MessageItem
              key={`${message.messageId}-${message.sentAt}`}
              message={message}
              isOwn={isOwn}
              showTimestamp={true}
              onFileDownload={handleFileDownload}
            />
          );
        })}

        {/* 스크롤 하단 앵커 */}
        <div ref={messagesEndRef} />
      </div>

      {/* 하단으로 스크롤 버튼 */}
      {showScrollButton && (
        <div className=\"absolute bottom-4 right-4 z-10\">
          <Button
            onClick={() => scrollToBottom(true)}
            className=\"w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg\"
          >
            <ArrowDown className=\"w-5 h-5\" />
          </Button>
        </div>
      )}
    </div>
  );
};

// MessageList에 메시지 추가를 위한 imperative handle
export const MessageListRef = React.forwardRef<
  { addMessage: (message: ChatMessage) => void },
  MessageListProps
>((props, ref) => {
  const [messageListKey, setMessageListKey] = useState(0);
  const messageListRef = useRef<{ addMessage: (message: ChatMessage) => void } | null>(null);

  React.useImperativeHandle(ref, () => ({
    addMessage: (message: ChatMessage) => {
      messageListRef.current?.addMessage(message);
    }
  }));

  return <MessageList {...props} key={messageListKey} />;
});

MessageListRef.displayName = 'MessageListRef';

export default MessageList;