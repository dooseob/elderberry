/**
 * PostCreatePage - 게시글 작성 페이지
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { ArrowLeft } from 'lucide-react';
import { Button } from '../../shared/ui/Button';
import { LoadingSpinner } from '../../shared/ui/LoadingSpinner';
import { ErrorMessage } from '../../shared/ui/ErrorMessage';
import { PostEditor } from './components/PostEditor';
import { boardApi } from '../../entities/board';
import type { Board, PostCreateRequest } from '../../entities/board';
import { BOARD_METADATA } from '../../entities/board';
import { useAuthStore } from '../../stores/authStore';

export const PostCreatePage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // URL 파라미터 검증
  const boardIdNumber = boardId ? parseInt(boardId, 10) : null;
  
  if (!boardIdNumber || isNaN(boardIdNumber)) {
    navigate('/boards');
    return null;
  }

  // 게시판 정보 로드
  useEffect(() => {
    const loadBoard = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const boardData = await boardApi.getBoardById(boardIdNumber);
        setBoard(boardData);
        
        // 권한 체크
        if (boardData.adminOnly && (!user || (user.role !== 'ADMIN' && user.role !== 'FACILITY'))) {
          setError('이 게시판에 글을 작성할 권한이 없습니다.');
          return;
        }
        
      } catch (err) {
        console.error('게시판 정보 로드 실패:', err);
        setError('게시판 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadBoard();
    } else {
      navigate('/auth/signin');
    }
  }, [boardIdNumber, isAuthenticated, navigate, user]);

  // 게시글 작성 제출
  const handleSubmit = async (data: PostCreateRequest) => {
    try {
      setIsSubmitting(true);
      
      const createdPost = await boardApi.createPost(boardIdNumber, data);
      
      // 작성 완료 후 게시글 상세 페이지로 이동
      navigate(`/boards/${boardIdNumber}/posts/${createdPost.id}`);
      
    } catch (err) {
      console.error('게시글 작성 실패:', err);
      throw new Error('게시글 작성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    navigate(`/boards/${boardIdNumber}`);
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
  if (error || !board) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage 
          message={error || '게시판을 찾을 수 없습니다.'}
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
                    글쓰기
                  </h1>
                  <p className="text-gray-600">
                    {board.name}에 새로운 글을 작성하세요
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 에디터 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <PostEditor
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isSubmitting}
              submitLabel="게시글 작성"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default PostCreatePage;