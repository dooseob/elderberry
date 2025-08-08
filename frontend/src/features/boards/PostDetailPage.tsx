/**
 * PostDetailPage - 게시글 상세 조회 페이지
 * 게시글 내용, 댓글 시스템, 작성자 액션 포함
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Edit,
  Trash2,
  MessageSquare,
  Eye,
  Clock,
  User,
  Heart,
  Share2,
  Flag,
  Pin,
  MoreVertical
} from 'lucide-react';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import { LoadingSpinner } from '../../shared/ui/LoadingSpinner';
import { ErrorMessage } from '../../shared/ui/ErrorMessage';
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog';
import { CommentList } from './components/CommentList';
import { CommentForm } from './components/CommentForm';
import { boardApi } from '../../entities/board';
import type { Board, Post, Comment, Page } from '../../entities/board';
import { BOARD_METADATA } from '../../entities/board';
import { useAuthStore } from '../../shared/stores/authStore';

export const PostDetailPage: React.FC = () => {
  const { boardId, postId } = useParams<{ boardId: string; postId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  
  const [board, setBoard] = useState<Board | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Page<Comment> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // URL 파라미터 검증
  const boardIdNumber = boardId ? parseInt(boardId, 10) : null;
  const postIdNumber = postId ? parseInt(postId, 10) : null;
  
  if (!boardIdNumber || isNaN(boardIdNumber) || !postIdNumber || isNaN(postIdNumber)) {
    navigate('/boards');
    return null;
  }

  // 게시판과 게시글 정보 로드
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [boardData, postData] = await Promise.all([
        boardApi.getBoardById(boardIdNumber),
        boardApi.getPostDetail(boardIdNumber, postIdNumber)
      ]);
      
      setBoard(boardData);
      setPost(postData);
      
      // 댓글 로드
      const commentsData = await boardApi.getComments(boardIdNumber, postIdNumber);
      setComments(commentsData);
      
    } catch (err) {
      console.error('게시글 데이터 로드 실패:', err);
      setError('게시글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [boardIdNumber, postIdNumber]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 게시글 삭제
  const handleDeletePost = async () => {
    try {
      setIsDeleting(true);
      await boardApi.deletePost(boardIdNumber, postIdNumber);
      navigate(`/boards/${boardIdNumber}`);
    } catch (err) {
      console.error('게시글 삭제 실패:', err);
      alert('게시글 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // 댓글 추가 후 새로고침
  const handleCommentAdded = useCallback(() => {
    // 댓글 목록 새로고침
    boardApi.getComments(boardIdNumber, postIdNumber)
      .then(setComments)
      .catch(console.error);
  }, [boardIdNumber, postIdNumber]);

  // 작성자 권한 체크
  const isAuthor = user && post && user.id === post.author.id;
  const canEdit = isAuthor;
  const canDelete = isAuthor || (user && (user.role === 'ADMIN' || user.role === 'FACILITY'));

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // 에러 상태
  if (error || !board || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage 
          message={error || '게시글을 찾을 수 없습니다.'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const metadata = BOARD_METADATA[board.type];

  // Set document title
  React.useEffect(() => {
    if (post && board) {
      document.title = `${post.title} - ${board.name} - 엘더베리 커뮤니티`;
    }
    return () => {
      document.title = '엘더베리';
    };
  }, [post, board]);

  return (
    <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* 상단 네비게이션 */}
          <div className="flex items-center gap-2 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/boards/${board.id}`)}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>커뮤니티</span>
              <span>&gt;</span>
              <span>{board.name}</span>
              <span>&gt;</span>
              <span className="text-gray-900 truncate max-w-xs">
                {post.title}
              </span>
            </div>
          </div>

          {/* 게시글 콘텐츠 */}
          <article className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            {/* 게시글 헤더 */}
            <header className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {post.pinned && (
                      <Pin className="w-5 h-5 text-orange-500" />
                    )}
                    <h1 className="text-2xl font-bold text-gray-900">
                      {post.title}
                    </h1>
                    {post.status !== 'ACTIVE' && (
                      <Badge variant="secondary">
                        {post.status === 'INACTIVE' ? '비활성' : '삭제됨'}
                      </Badge>
                    )}
                  </div>
                  
                  {/* 태그 */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-sm">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* 액션 메뉴 */}
                {(canEdit || canDelete) && (
                  <div className="flex items-center gap-2">
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/boards/${board.id}/posts/${post.id}/edit`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* 작성자 정보 및 메타데이터 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{post.author.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {new Date(post.createdDate).toLocaleString()}
                    </span>
                  </div>
                  {post.lastModifiedDate && post.lastModifiedDate !== post.createdDate && (
                    <span className="text-sm text-gray-500">
                      (수정됨: {new Date(post.lastModifiedDate).toLocaleString()})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Eye className="w-4 h-4" />
                    <span>{post.viewCount}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.commentCount}</span>
                  </div>
                  {post.likeCount !== undefined && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Heart className="w-4 h-4" />
                      <span>{post.likeCount}</span>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* 게시글 내용 */}
            <div className="p-6">
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: post.content
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/`(.*?)`/g, '<code>$1</code>')
                    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
                    .replace(/^- (.+)$/gm, '<li>$1</li>')
                    .replace(/\n/g, '<br>')
                }}
              />
            </div>

            {/* 게시글 액션 */}
            <footer className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" disabled>
                    <Heart className="w-4 h-4 mr-1" />
                    좋아요
                  </Button>
                  <Button variant="ghost" size="sm" disabled>
                    <Share2 className="w-4 h-4 mr-1" />
                    공유
                  </Button>
                </div>
                
                <Button variant="ghost" size="sm" disabled>
                  <Flag className="w-4 h-4 mr-1" />
                  신고
                </Button>
              </div>
            </footer>
          </article>

          {/* 댓글 섹션 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                댓글 {comments?.totalElements || 0}개
              </h2>
              
              {/* 댓글 작성 폼 */}
              {isAuthenticated ? (
                <CommentForm
                  boardId={boardIdNumber}
                  postId={postIdNumber}
                  onCommentAdded={handleCommentAdded}
                />
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-4">댓글을 작성하려면 로그인이 필요합니다.</p>
                  <Button
                    variant="primary"
                    onClick={() => navigate('/auth/signin')}
                  >
                    로그인하기
                  </Button>
                </div>
              )}
            </div>

            {/* 댓글 목록 */}
            <CommentList
              boardId={boardIdNumber}
              postId={postIdNumber}
              comments={comments}
              onCommentUpdated={handleCommentAdded}
            />
          </div>
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeletePost}
        title="게시글 삭제"
        message="정말로 이 게시글을 삭제하시겠습니까? 삭제된 게시글은 복구할 수 없습니다."
        confirmLabel="삭제"
        isLoading={isDeleting}
        variant="danger"
      />
    </>
  );
};

export default PostDetailPage;