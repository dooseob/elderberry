/**
 * 게시글 상세 페이지
 */
import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Bookmark,
  Calendar,
  Download,
  Edit,
  Eye,
  Flag,
  MessageSquare,
  MoreVertical,
  Pin,
  Reply,
  Send,
  Share2,
  Tag,
  ThumbsUp,
  Trash2,
  User
} from '../../components/icons/LucideIcons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBoardStore } from '../../stores/boardStore';
import { useAuthStore } from '../../stores/authStore';
import { Post, Comment, CommentCreateRequest } from '../../types/board';
import { MemberRole } from '../../types/auth';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

// 날짜 포맷팅 함수
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 댓글 컴포넌트
interface CommentItemProps {
  comment: Comment;
  level: number;
  onReply: (parentId: number) => void;
  onEdit: (comment: Comment) => void;
  onDelete: (id: number) => void;
  onLike: (id: number) => void;
  isLiked: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  level, 
  onReply, 
  onEdit, 
  onDelete, 
  onLike, 
  isLiked 
}) => {
  const { user } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const isAuthor = user?.id === comment.authorId;
  const canModerate = user?.role === MemberRole.ADMIN || user?.role === MemberRole.COORDINATOR;

  return (
    <div className={`${level > 0 ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg p-4 mb-4 border border-gray-200"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-elderberry-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-elderberry-600">
                {comment.isAnonymous ? '익' : comment.authorName.charAt(0)}
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">
                  {comment.isAnonymous ? '익명' : comment.authorName}
                </span>
                <span className="text-xs text-gray-500">
                  {comment.authorRole}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {formatDate(comment.createdAt)}
              </span>
            </div>
          </div>

          {(isAuthor || canModerate) && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-10"
                  >
                    {isAuthor && (
                      <button
                        onClick={() => {
                          onEdit(comment);
                          setShowMenu(false);
                        }}
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Edit className="w-3 h-3 mr-2" />
                        수정
                      </button>
                    )}
                    {(isAuthor || canModerate) && (
                      <button
                        onClick={() => {
                          onDelete(comment.id);
                          setShowMenu(false);
                        }}
                        className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3 mr-2" />
                        삭제
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="prose prose-sm max-w-none mb-4">
          <div className="whitespace-pre-wrap text-gray-700">
            {comment.content}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => onLike(comment.id)}
            className={`flex items-center space-x-1 text-sm transition-colors ${
              isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{comment.likeCount}</span>
          </button>

          <button
            onClick={() => onReply(comment.id)}
            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-elderberry-600"
          >
            <Reply className="w-4 h-4" />
            <span>답글</span>
          </button>
        </div>

        {/* 대댓글 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                level={level + 1}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onLike={onLike}
                isLiked={false} // TODO: 대댓글 좋아요 상태 확인
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

// 댓글 작성 폼
interface CommentFormProps {
  onSubmit: (request: CommentCreateRequest) => Promise<void>;
  parentId?: number;
  onCancel?: () => void;
  placeholder?: string;
}

const CommentForm: React.FC<CommentFormProps> = ({ 
  onSubmit, 
  parentId, 
  onCancel, 
  placeholder = "댓글을 작성하세요..." 
}) => {
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        postId: 0, // 부모에서 설정
        parentId,
        content: content.trim(),
        isAnonymous
      });
      setContent('');
      setIsAnonymous(false);
      if (onCancel) onCancel();
    } catch (error) {
      console.error('댓글 작성 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit}
      className="bg-gray-50 rounded-lg p-4 space-y-4"
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-elderberry-500 focus:border-elderberry-500 resize-none"
        required
      />
      
      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="w-4 h-4 text-elderberry-600 border-gray-300 rounded focus:ring-elderberry-500"
          />
          <span className="ml-2 text-sm text-gray-700">익명으로 작성</span>
        </label>

        <div className="flex space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              취소
            </Button>
          )}
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {isSubmitting ? '작성 중...' : '댓글 작성'}
            <Send className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </motion.form>
  );
};

export default function PostDetailPage() {
  const { boardId, postId } = useParams<{ boardId: string; postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    currentPost: post,
    comments,
    postsLoading,
    commentsLoading,
    postsError,
    commentsError,
    likedPosts,
    likedComments,
    loadPost,
    loadComments,
    createComment,
    deletePost,
    togglePostLike,
    toggleCommentLike,
    clearPostsError,
    clearCommentsError
  } = useBoardStore();

  const [showCommentForm, setShowCommentForm] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const postIdNum = parseInt(postId || '0');
  const isAuthor = post && user?.id === post.authorId;
  const canModerate = user?.role === MemberRole.ADMIN || user?.role === MemberRole.COORDINATOR;
  const canComment = user && [MemberRole.CAREGIVER, MemberRole.EMPLOYER, MemberRole.COORDINATOR, MemberRole.ADMIN].includes(user.role);
  const isLiked = likedPosts.has(postIdNum);

  // 게시글 로드
  useEffect(() => {
    if (postIdNum) {
      loadPost(postIdNum);
      loadComments(postIdNum);
    }
  }, [postIdNum]);

  // 게시글 삭제
  const handleDeletePost = async () => {
    if (!post) return;
    
    if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      try {
        await deletePost(post.id);
        navigate(`/boards/${boardId || ''}`);
      } catch (error) {
        console.error('게시글 삭제 실패:', error);
      }
    }
  };

  // 댓글 작성
  const handleCommentSubmit = async (request: CommentCreateRequest) => {
    if (!post) return;
    
    await createComment({ ...request, postId: post.id });
    setShowCommentForm(false);
    setReplyingTo(null);
  };

  // 공유하기
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.content,
          url: window.location.href
        });
      } catch (error) {
        console.error('공유 실패:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 클립보드에 복사되었습니다!');
    }
  };

  if (postsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
          <div className="space-y-4">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (postsError || !post) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">게시글을 찾을 수 없습니다</h3>
        <p className="text-gray-600 mb-4">
          {postsError || '요청한 게시글이 존재하지 않거나 삭제되었습니다.'}
        </p>
        <div className="space-x-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로 가기
          </Button>
          <Link to="/boards">
            <Button variant="primary">게시판 목록</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          뒤로
        </Button>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            공유
          </Button>
          
          <Button variant="outline">
            <Bookmark className="w-4 h-4 mr-2" />
            북마크
          </Button>
          
          {(isAuthor || canModerate) && (
            <>
              <Link to={`/boards/${boardId}/posts/${post.id}/edit`}>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  수정
                </Button>
              </Link>
              <Button variant="outline" onClick={handleDeletePost}>
                <Trash2 className="w-4 h-4 mr-2" />
                삭제
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 게시글 내용 */}
      <Card>
        <CardContent className="p-6">
          {/* 게시글 헤더 */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-3">
                  {post.isPinned && (
                    <Pin className="w-4 h-4 text-elderberry-600" />
                  )}
                  {post.isNotice && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      공지
                    </span>
                  )}
                  <span className="text-sm text-gray-500">{post.boardName}</span>
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  {post.title}
                </h1>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-elderberry-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-elderberry-600">
                        {post.isAnonymous ? '익' : post.authorName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">
                        {post.isAnonymous ? '익명' : post.authorName}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {post.authorRole}
                      </span>
                    </div>
                  </div>
                  
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(post.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* 통계 */}
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                조회 {post.viewCount}
              </span>
              <button
                onClick={() => togglePostLike(post.id)}
                className={`flex items-center transition-colors ${
                  isLiked ? 'text-red-500' : 'hover:text-red-500'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                좋아요 {post.likeCount}
              </button>
              <span className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-1" />
                댓글 {post.commentCount}
              </span>
            </div>
          </div>

          {/* 게시글 본문 */}
          <div className="prose max-w-none mb-6">
            <div className="whitespace-pre-wrap text-gray-700">
              {post.content}
            </div>
          </div>

          {/* 첨부파일 */}
          {post.attachments && post.attachments.length > 0 && (
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">첨부파일</h3>
              <div className="space-y-2">
                {post.attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.downloadUrl}
                    download={attachment.originalFileName}
                    className="flex items-center space-x-2 text-sm text-elderberry-600 hover:text-elderberry-800"
                  >
                    <Download className="w-4 h-4" />
                    <span>{attachment.originalFileName}</span>
                    <span className="text-xs text-gray-500">
                      ({(attachment.fileSize / 1024 / 1024).toFixed(1)}MB)
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* 태그 */}
          {post.tags && post.tags.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-elderberry-100 text-elderberry-700"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 댓글 섹션 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>댓글 {post.commentCount}개</CardTitle>
            {canComment && (
              <Button
                variant="outline"
                onClick={() => setShowCommentForm(!showCommentForm)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                댓글 작성
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* 댓글 작성 폼 */}
          <AnimatePresence>
            {showCommentForm && canComment && (
              <div className="mb-6">
                <CommentForm
                  onSubmit={handleCommentSubmit}
                  onCancel={() => setShowCommentForm(false)}
                />
              </div>
            )}
          </AnimatePresence>

          {/* 댓글 목록 */}
          {commentsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  level={0}
                  onReply={(parentId) => setReplyingTo(parentId)}
                  onEdit={(comment) => {
                    // TODO: 댓글 수정 모달 구현
                    console.log('Edit comment:', comment);
                  }}
                  onDelete={async (id) => {
                    if (window.confirm('댓글을 삭제하시겠습니까?')) {
                      // TODO: 댓글 삭제 구현
                      console.log('Delete comment:', id);
                    }
                  }}
                  onLike={(id) => toggleCommentLike(id)}
                  isLiked={likedComments.has(comment.id)}
                />
              ))}

              {/* 답글 작성 폼 */}
              <AnimatePresence>
                {replyingTo && canComment && (
                  <div className="ml-8">
                    <CommentForm
                      onSubmit={(request) => handleCommentSubmit({ ...request, parentId: replyingTo })}
                      parentId={replyingTo}
                      onCancel={() => setReplyingTo(null)}
                      placeholder="답글을 작성하세요..."
                    />
                  </div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">아직 댓글이 없습니다</p>
              {canComment && (
                <Button variant="outline" onClick={() => setShowCommentForm(true)}>
                  첫 댓글을 작성해보세요
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}