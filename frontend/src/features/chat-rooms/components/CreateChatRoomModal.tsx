/**
 * CreateChatRoomModal - 새 채팅방 생성 모달
 * 채팅방 유형 선택 및 기본 정보 입력 모달
 */

import React, { useState } from 'react';
import { X, Users, MessageSquare } from 'lucide-react';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Modal } from '../../../shared/ui/Modal';
import { Badge } from '../../../shared/ui/Badge';
import { chatApi } from '../../../shared/api';
import type { ChatRoomType, ChatRoomCreateRequest } from '../../../entities/chat';
import { CHAT_ROOM_ICONS, CHAT_ROOM_LABELS } from '../../../entities/chat';

interface CreateChatRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ROOM_TYPE_OPTIONS: { type: ChatRoomType; description: string }[] = [
  {
    type: 'COORDINATOR_CONSULTATION',
    description: '전문 코디네이터와 1:1 상담을 위한 채팅방'
  },
  {
    type: 'FACILITY_INQUIRY',
    description: '시설 관련 문의 및 정보 확인'
  },
  {
    type: 'HEALTH_CONSULTATION',
    description: '건강 상태 및 케어 계획 상담'
  },
  {
    type: 'SUPPORT',
    description: '기술 지원 및 서비스 문의'
  },
  {
    type: 'GROUP_DISCUSSION',
    description: '여러 사용자와 정보 공유 및 토론'
  }
];

export const CreateChatRoomModal: React.FC<CreateChatRoomModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<ChatRoomCreateRequest>({
    roomName: '',
    roomType: 'COORDINATOR_CONSULTATION',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 폼 리셋
  const resetForm = () => {
    setFormData({
      roomName: '',
      roomType: 'COORDINATOR_CONSULTATION',
      description: ''
    });
    setError(null);
  };

  // 모달 닫기
  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.roomName.trim()) {
      setError('채팅방 이름을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await chatApi.createChatRoom({
        ...formData,
        roomName: formData.roomName.trim(),
        description: formData.description?.trim() || undefined
      });
      
      onSuccess();
      resetForm();
    } catch (err) {
      console.error('채팅방 생성 실패:', err);
      setError('채팅방 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 입력값 변경 핸들러
  const handleInputChange = (field: keyof ChatRoomCreateRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title=\"새 채팅방 만들기\">
      <form onSubmit={handleSubmit} className=\"space-y-6\">
        {/* 채팅방 이름 */}
        <div>
          <label className=\"block text-sm font-medium text-gray-700 mb-2\">
            채팅방 이름 *
          </label>
          <Input
            placeholder=\"예: 김코디네이터와의 상담\"
            value={formData.roomName}
            onChange={(e) => handleInputChange('roomName', e.target.value)}
            disabled={loading}
            className=\"w-full\"
          />
        </div>

        {/* 채팅방 유형 선택 */}
        <div>
          <label className=\"block text-sm font-medium text-gray-700 mb-3\">
            채팅방 유형 *
          </label>
          <div className=\"grid gap-3\">
            {ROOM_TYPE_OPTIONS.map((option) => (
              <div
                key={option.type}
                onClick={() => handleInputChange('roomType', option.type)}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  formData.roomType === option.type
                    ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className=\"flex items-start gap-3\">
                  <div className=\"text-2xl flex-shrink-0\">
                    {CHAT_ROOM_ICONS[option.type]}
                  </div>
                  <div className=\"flex-1 min-w-0\">
                    <div className=\"flex items-center gap-2 mb-1\">
                      <span className=\"font-medium text-gray-900\">
                        {CHAT_ROOM_LABELS[option.type]}
                      </span>
                      {formData.roomType === option.type && (
                        <Badge className=\"text-xs bg-green-100 text-green-800\">
                          선택됨
                        </Badge>
                      )}
                    </div>
                    <p className=\"text-sm text-gray-600\">{option.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 설명 (선택사항) */}
        <div>
          <label className=\"block text-sm font-medium text-gray-700 mb-2\">
            설명 (선택사항)
          </label>
          <textarea
            placeholder=\"채팅방에 대한 간단한 설명을 입력하세요...\"
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            disabled={loading}
            rows={3}
            className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none\"
          />
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className=\"bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm\">
            {error}
          </div>
        )}

        {/* 액션 버튼 */}
        <div className=\"flex items-center justify-end gap-3 pt-4 border-t border-gray-200\">
          <Button
            type=\"button\"
            variant=\"outline\"
            onClick={handleClose}
            disabled={loading}
          >
            취소
          </Button>
          <Button
            type=\"submit\"
            disabled={loading || !formData.roomName.trim()}
            className=\"flex items-center gap-2\"
          >
            {loading ? (
              <>
                <div className=\"w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin\" />
                생성 중...
              </>
            ) : (
              <>
                <MessageSquare className=\"w-4 h-4\" />
                채팅방 만들기
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateChatRoomModal;