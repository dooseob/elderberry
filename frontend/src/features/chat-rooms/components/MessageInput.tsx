/**
 * MessageInput - 메시지 입력 컴포넌트
 * 텍스트 입력, 파일 첨부, 전송 기능 지원
 */

import React, { useState, useRef, useCallback } from 'react';
import { Send, Paperclip, X, FileText, Image } from 'lucide-react';
import { Button } from '../../../shared/ui/Button';
import { Badge } from '../../../shared/ui/Badge';
import type { MessageSendRequest, FileUploadRequest } from '../../../entities/chat';

interface MessageInputProps {
  onSendMessage: (message: MessageSendRequest) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  allowFileUpload?: boolean;
  maxFileSize?: number; // MB
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = '메시지를 입력하세요...',
  allowFileUpload = true,
  maxFileSize = 10 // 10MB
}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // 파일 유형 확인
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image;
    return FileText;
  };

  // 파일 선택 핸들러
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles: File[] = [];
    let errorMessages: string[] = [];

    files.forEach(file => {
      // 파일 크기 체크
      if (file.size > maxFileSize * 1024 * 1024) {
        errorMessages.push(`${file.name}: 파일 크기가 ${maxFileSize}MB를 초과합니다.`);
        return;
      }

      // 파일 유형 체크 (기본적인 검증)
      const allowedTypes = [
        'image/', 'text/', 'application/pdf', 
        'application/msword', 'application/vnd.openxmlformats-officedocument',
        'application/zip', 'application/x-zip-compressed'
      ];
      
      const isAllowed = allowedTypes.some(type => file.type.startsWith(type));
      if (!isAllowed) {
        errorMessages.push(`${file.name}: 지원되지 않는 파일 형식입니다.`);
        return;
      }

      validFiles.push(file);
    });

    if (errorMessages.length > 0) {
      setError(errorMessages.join('\\n'));
    } else {
      setError(null);
    }

    setAttachments(prev => [...prev, ...validFiles]);
    
    // input 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [maxFileSize]);

  // 첨부파일 제거
  const removeAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  // 텍스트 자동 높이 조절
  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, []);

  // 메시지 전송
  const handleSendMessage = useCallback(async () => {
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage && attachments.length === 0) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 텍스트 메시지 전송
      if (trimmedMessage) {
        await onSendMessage({
          messageType: 'TEXT',
          content: trimmedMessage
        });
      }

      // 파일 메시지 전송 (각 파일마다 별도 메시지)
      for (const file of attachments) {
        await onSendMessage({
          messageType: 'FILE',
          content: `파일: ${file.name}`,
          fileInfo: {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
          }
        });
      }

      // 상태 리셋
      setMessage('');
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      setError('메시지 전송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  }, [message, attachments, onSendMessage]);

  // Enter 키 처리
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // 메시지 입력 변경
  const handleMessageChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustTextareaHeight();
  }, [adjustTextareaHeight]);

  const canSend = (message.trim() || attachments.length > 0) && !isLoading && !disabled;

  return (
    <div className=\"border-t border-gray-200 bg-white p-4\">
      {/* 에러 메시지 */}
      {error && (
        <div className=\"mb-3 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md\">
          {error.split('\\n').map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </div>
      )}

      {/* 첨부파일 미리보기 */}
      {attachments.length > 0 && (
        <div className=\"mb-3 space-y-2\">
          {attachments.map((file, index) => {
            const FileIcon = getFileIcon(file);
            return (
              <div key={index} className=\"flex items-center gap-3 p-2 bg-gray-50 border border-gray-200 rounded-lg\">
                <div className=\"w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0\">
                  <FileIcon className=\"w-4 h-4 text-gray-600\" />
                </div>
                <div className=\"flex-1 min-w-0\">
                  <p className=\"text-sm font-medium text-gray-900 truncate\">{file.name}</p>
                  <p className=\"text-xs text-gray-500\">{formatFileSize(file.size)}</p>
                </div>
                <Button
                  variant=\"ghost\"
                  size=\"sm\"
                  onClick={() => removeAttachment(index)}
                  className=\"text-gray-400 hover:text-red-500 p-1 h-auto\"
                >
                  <X className=\"w-4 h-4\" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* 메시지 입력 영역 */}
      <div className=\"flex items-end gap-3\">
        {/* 파일 첨부 버튼 */}
        {allowFileUpload && (
          <Button
            type=\"button\"
            variant=\"outline\"
            size=\"sm\"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isLoading}
            className=\"flex-shrink-0 p-2\"
          >
            <Paperclip className=\"w-4 h-4\" />
          </Button>
        )}

        {/* 텍스트 입력 */}
        <div className=\"flex-1 relative\">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleMessageChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            rows={1}
            className=\"w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent\"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
        </div>

        {/* 전송 버튼 */}
        <Button
          onClick={handleSendMessage}
          disabled={!canSend}
          className={`flex-shrink-0 w-12 h-12 rounded-full p-0 ${
            canSend 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <div className=\"w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin\" />
          ) : (
            <Send className=\"w-5 h-5\" />
          )}
        </Button>
      </div>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type=\"file\"
        multiple
        onChange={handleFileSelect}
        className=\"hidden\"
        accept=\"image/*,text/*,.pdf,.doc,.docx,.zip\"
      />
    </div>
  );
};

export default MessageInput;