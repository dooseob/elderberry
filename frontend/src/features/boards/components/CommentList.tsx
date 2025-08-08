/**
 * CommentList - 댓글 목록 컴포넌트
 */

import React, { useState } from 'react';
import { 
  MessageSquare,
  Edit,
  Trash2,
  Reply,
  MoreVertical,
  Clock,
  User
} from 'lucide-react';
import { Button } from '../../../shared/ui/Button';
import { Badge } from '../../../shared/ui/Badge';
import { ConfirmDialog } from '../../../shared/ui/ConfirmDialog';
import { CommentForm } from './CommentForm';
import { boardApi } from '../../../entities/board';
import type { Comment, Page } from '../../../entities/board';
import { useAuthStore } from '../../../shared/stores/authStore';

interface CommentListProps {
  boardId: number;
  postId: number;
  comments: Page<Comment> | null;
  onCommentUpdated: () => void;
}

interface CommentItemProps {
  comment: Comment;
  boardId: number;
  postId: number;
  onCommentUpdated: () => void;
  level?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  boardId,
  postId,
  onCommentUpdated,
  level = 0
}) => {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAuthor = user && user.id === comment.author.id;
  const canEdit = isAuthor;
  const canDelete = isAuthor || (user && (user.role === 'ADMIN' || user.role === 'FACILITY'));

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await boardApi.deleteComment(boardId, postId, comment.id);
      onCommentUpdated();
    } catch (err) {
      console.error('댓글 삭제 실패:', err);
      alert('댓글 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleEditComplete = () => {
    setIsEditing(false);
    onCommentUpdated();
  };

  const handleReplyComplete = () => {
    setIsReplying(false);
    onCommentUpdated();
  };

  return (
    <>
      <div className={`${level > 0 ? 'ml-8 pl-4 border-l-2 border-gray-200' : ''}`}>
        <div className="py-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">
                {comment.author.name}
              </span>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{new Date(comment.createdDate).toLocaleString()}</span>
              </div>
              {comment.lastModifiedDate && comment.lastModifiedDate !== comment.createdDate && (
                <span className="text-xs text-gray-400">(수정됨)</span>
              )}
            </div>

            {(canEdit || canDelete) && (
              <div className="flex items-center gap-1">
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="p-1"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                )}
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    className="p-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="mb-3">
              <CommentForm
                boardId={boardId}
                postId={postId}
                initialContent={comment.content}
                onCommentAdded={handleEditComplete}
                onCancel={() => setIsEditing(false)}
                placeholder="댓글을 수정하세요..."
              />
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-900 mb-2 whitespace-pre-wrap">
                {comment.status === 'DELETED' ? (
                  <span className="text-gray-500 italic">삭제된 댓글입니다.</span>
                ) : (
                  comment.content
                )}
              </div>

              {comment.status === 'ACTIVE' && level < 2 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsReplying(!isReplying)}
                    className="text-xs p-1"
                  >
                    <Reply className="w-3 h-3 mr-1" />
                    답글
                  </Button>
                </div>
              )}

              {isReplying && (
                <div className="mt-3 ml-4">
                  <CommentForm
                    boardId={boardId}
                    postId={postId}
                    parentId={comment.id}
                    onCommentAdded={handleReplyComplete}
                    onCancel={() => setIsReplying(false)}
                    placeholder="답글을 입력하세요..."
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* 대댓글 표시 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-0">
            {comment.replies.map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                boardId={boardId}
                postId={postId}
                onCommentUpdated={onCommentUpdated}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="댓글 삭제"
        message="정말로 이 댓글을 삭제하시겠습니까?"
        confirmLabel="삭제"
        isLoading={isDeleting}
        variant="danger"
      />
    </>
  );
};

export const CommentList: React.FC<CommentListProps> = ({
  boardId,
  postId,
  comments,
  onCommentUpdated
}) => {
  if (!comments || comments.content.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p>아직 댓글이 없습니다.</p>
        <p className="text-sm">첫 번째 댓글을 작성해보세요!</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {comments.content.map(comment => (
        <CommentItem
          key={comment.id}
          comment={comment}
          boardId={boardId}
          postId={postId}
          onCommentUpdated={onCommentUpdated}
        />
      ))}
    </div>
  );
};