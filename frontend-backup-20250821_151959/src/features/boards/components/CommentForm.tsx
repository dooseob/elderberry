/**
 * CommentForm - 댓글 작성/수정 폼 컴포넌트
 */

import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../../../shared/ui/Button';
import { boardApi } from '../../../entities/board';
import type { CommentCreateRequest } from '../../../entities/board';
import { BOARD_DEFAULT_CONFIG } from '../../../entities/board';

interface CommentFormProps {
  boardId: number;
  postId: number;
  parentId?: number;
  initialContent?: string;
  onCommentAdded: () => void;
  onCancel?: () => void;
  placeholder?: string;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  boardId,
  postId,
  parentId,
  initialContent = '',
  onCommentAdded,
  onCancel,
  placeholder = '댓글을 입력하세요...'
}) => {
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('댓글 내용을 입력해주세요.');
      return;
    }
    
    if (content.length > BOARD_DEFAULT_CONFIG.maxCommentLength) {
      setError(`댓글은 ${BOARD_DEFAULT_CONFIG.maxCommentLength}자 이하로 작성해주세요.`);
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const request: CommentCreateRequest = {
        content: content.trim(),
        ...(parentId && { parentId })
      };
      
      await boardApi.createComment(boardId, postId, request);
      
      setContent('');
      onCommentAdded();
      
    } catch (err) {
      console.error('댓글 작성 실패:', err);
      setError('댓글 작성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          maxLength={BOARD_DEFAULT_CONFIG.maxCommentLength}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-gray-500">
            {content.length} / {BOARD_DEFAULT_CONFIG.maxCommentLength}
          </p>
          <div className="flex gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCancel}
              >
                취소
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting || !content.trim()}
            >
              {isSubmitting ? (
                '작성 중...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1" />
                  {parentId ? '답글 작성' : '댓글 작성'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};