/**
 * PostEditPage - 게시글 수정 페이지
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { ArrowLeft } from 'lucide-react';
import { Button } from '../../shared/ui/Button';
import { LoadingSpinner } from '../../shared/ui/LoadingSpinner';
import { ErrorMessage } from '../../shared/ui/ErrorMessage';
import { PostEditor } from './components/PostEditor';
import { boardApi } from '../../entities/board';
import type { Board, Post, PostUpdateRequest } from '../../entities/board';
import { BOARD_METADATA } from '../../entities/board';
import { useAuthStore } from '../../stores/authStore';

export const PostEditPage: React.FC = () => {
  const { boardId, postId } = useParams<{ boardId: string; postId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  
  const [board, setBoard] = useState<Board | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // URL 파라미터 검증
  const boardIdNumber = boardId ? parseInt(boardId, 10) : null;
  const postIdNumber = postId ? parseInt(postId, 10) : null;
  
  if (!boardIdNumber || isNaN(boardIdNumber) || !postIdNumber || isNaN(postIdNumber)) {
    navigate('/boards');
    return null;
  }

  // 게시판과 게시글 정보 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [boardData, postData] = await Promise.all([
          boardApi.getBoardById(boardIdNumber),
          boardApi.getPostDetail(boardIdNumber, postIdNumber)
        ]);
        
        setBoard(boardData);
        setPost(postData);
        
        // 권한 체크 - 작성자만 수정 가능
        if (!user || user.id !== postData.author.id) {
          setError('이 게시글을 수정할 권한이 없습니다.');
          return;
        }
        
      } catch (err) {
        console.error('데이터 로드 실패:', err);
        setError('게시글 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadData();
    } else {
      navigate('/auth/signin');
    }
  }, [boardIdNumber, postIdNumber, isAuthenticated, navigate, user]);

  // 게시글 수정 제출
  const handleSubmit = async (data: PostUpdateRequest) => {
    try {
      setIsSubmitting(true);
      
      const updatedPost = await boardApi.updatePost(boardIdNumber, postIdNumber, data);
      
      // 수정 완료 후 게시글 상세 페이지로 이동
      navigate(`/boards/${boardIdNumber}/posts/${postIdNumber}`);
      
    } catch (err) {
      console.error('게시글 수정 실패:', err);
      throw new Error('게시글 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    navigate(`/boards/${boardIdNumber}/posts/${postIdNumber}`);
  };

  // 인증 확인
  if (!isAuthenticated) {
    return null; // navigate로 리디렉션되므로 null 반환
  }

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

  return (
    <>
      
        
        
      

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* 페이지 헤더 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
                  {metadata.icon}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    게시글 수정
                  </h1>
                  <p className="text-gray-600">
                    {board.name} - {post.title}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 에디터 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <PostEditor
              initialData={{
                title: post.title,
                content: post.content,
                tags: post.tags
              }}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isSubmitting}
              submitLabel="게시글 수정"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default PostEditPage;