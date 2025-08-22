/**
 * MessageItem - 개별 메시지 아이템 컴포넌트
 * 텍스트 메시지와 파일 메시지를 모두 지원
 */

import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Download, FileText, Image, Video, Music, Archive } from 'lucide-react';
import { Button } from '../../../shared/ui/Button';
import { Badge } from '../../../shared/ui/Badge';
import type { ChatMessage } from '../../../entities/chat';

interface MessageItemProps {
  message: ChatMessage;
  isOwn?: boolean;
  showTimestamp?: boolean;
  onFileDownload?: (url: string, fileName: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isOwn = false,
  showTimestamp = true,
  onFileDownload
}) => {
  // 시간 포맷팅
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return format(date, 'HH:mm', { locale: ko });
      } else if (diffInHours < 24 * 7) {
        return formatDistanceToNow(date, { addSuffix: true, locale: ko });
      } else {
        return format(date, 'MM/dd HH:mm', { locale: ko });
      }
    } catch {
      return '방금 전';
    }
  };

  // 파일 아이콘 선택
  const getFileIcon = (fileType?: string) => {
    if (!fileType) return FileText;
    
    if (fileType.startsWith('image/')) return Image;
    if (fileType.startsWith('video/')) return Video;
    if (fileType.startsWith('audio/')) return Music;
    if (fileType.includes('zip') || fileType.includes('rar')) return Archive;
    
    return FileText;
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // 파일 다운로드 핸들러
  const handleFileDownload = () => {
    if (message.fileInfo?.downloadUrl && message.fileInfo?.fileName) {
      onFileDownload?.(message.fileInfo.downloadUrl, message.fileInfo.fileName);
    }
  };

  // 읽음 상태 확인
  const isRead = message.readBy.length > 1; // 본인 포함이므로 1보다 크면 상대방이 읽음
  const deliveryStatusColor = {
    'SENT': 'text-gray-400',
    'DELIVERED': 'text-blue-400', 
    'READ': 'text-green-400'
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${isOwn ? 'ml-auto' : 'mr-auto'}`}>
        {/* 발신자 이름 (본인이 아닌 경우만) */}
        {!isOwn && (
          <div className=\"text-xs text-gray-500 mb-1 px-1\">
            {message.senderName}
          </div>
        )}
        
        {/* 메시지 버블 */}
        <div className={`rounded-2xl px-4 py-3 shadow-sm ${
          isOwn 
            ? 'bg-green-500 text-white rounded-br-md' 
            : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
        }`}>
          {/* 텍스트 메시지 */}
          {message.messageType === 'TEXT' && (
            <p className=\"text-sm leading-relaxed whitespace-pre-wrap break-words\">
              {message.content}
            </p>
          )}
          
          {/* 파일 메시지 */}
          {message.messageType === 'FILE' && message.fileInfo && (
            <div className=\"space-y-3\">
              {/* 메시지 텍스트 (있는 경우) */}
              {message.content && (
                <p className=\"text-sm leading-relaxed whitespace-pre-wrap break-words\">
                  {message.content}
                </p>
              )}
              
              {/* 파일 정보 */}
              <div className={`border rounded-lg p-3 ${
                isOwn ? 'border-green-300 bg-green-50/20' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className=\"flex items-center gap-3\">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isOwn ? 'bg-white/20' : 'bg-gray-100'
                  }`}>
                    {React.createElement(getFileIcon(message.fileInfo.fileType), {
                      className: `w-5 h-5 ${isOwn ? 'text-white' : 'text-gray-600'}`
                    })}
                  </div>
                  
                  <div className=\"flex-1 min-w-0\">
                    <p className={`font-medium text-sm truncate ${
                      isOwn ? 'text-white' : 'text-gray-900'
                    }`}>
                      {message.fileInfo.fileName}
                    </p>
                    <p className={`text-xs ${
                      isOwn ? 'text-green-100' : 'text-gray-500'
                    }`}>
                      {formatFileSize(message.fileInfo.fileSize)}
                    </p>
                  </div>
                  
                  {/* 다운로드 버튼 */}
                  {message.fileInfo.downloadUrl && (
                    <Button
                      variant={isOwn ? \"secondary\" : \"outline\"}
                      size=\"sm\"
                      onClick={handleFileDownload}
                      className={`flex items-center gap-1 ${
                        isOwn 
                          ? 'bg-white/20 text-white hover:bg-white/30 border-white/30' 
                          : ''
                      }`}
                    >
                      <Download className=\"w-3 h-3\" />
                      <span className=\"text-xs\">다운로드</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* 메시지 메타 정보 */}
        {showTimestamp && (
          <div className={`flex items-center gap-2 mt-1 px-1 ${
            isOwn ? 'justify-end' : 'justify-start'
          }`}>
            <span className=\"text-xs text-gray-500\">
              {formatTime(message.sentAt)}
            </span>
            
            {/* 읽음 상태 (본인 메시지인 경우만) */}
            {isOwn && (
              <div className=\"flex items-center gap-1\">
                <div className={`w-2 h-2 rounded-full ${deliveryStatusColor[message.deliveryStatus]}`} />
                <span className={`text-xs ${deliveryStatusColor[message.deliveryStatus]}`}>
                  {message.deliveryStatus === 'READ' ? '읽음' : 
                   message.deliveryStatus === 'DELIVERED' ? '전송됨' : '발송됨'}
                </span>
              </div>
            )}
            
            {/* 읽은 사람 수 (그룹 채팅인 경우) */}
            {message.readBy.length > 2 && (
              <Badge className=\"text-xs px-2 py-0.5 bg-gray-100 text-gray-600\">
                {message.readBy.length - 1}명 읽음
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;