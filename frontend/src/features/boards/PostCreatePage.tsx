/**
 * 게시글 작성 페이지
 */
import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  FileText,
  Image,
  Megaphone,
  Pin,
  Save,
  Tag,
  Upload,
  X
} from '../../components/icons/LucideIcons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBoardStore } from '../../stores/boardStore';
import { useAuthStore } from '../../stores/authStore';
import { Board, PostCreateRequest } from '../../types/board';
import { MemberRole } from '../../types/auth';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { boardFileService } from '../../services/boardApi';

// 파일 정보 인터페이스
interface AttachmentFile {
  id?: number;
  file?: File;
  name: string;
  size: number;
  type: string;
  uploading?: boolean;
  uploaded?: boolean;
  url?: string;
}

export default function PostCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const {
    boards,
    boardsLoading,
    postsLoading,
    boardsError,
    postsError,
    loadBoards,
    createPost,
    clearBoardsError,
    clearPostsError
  } = useBoardStore();

  // 폼 상태
  const [selectedBoardId, setSelectedBoardId] = useState<number>(
    parseInt(searchParams.get('boardId') || '0') || 0
  );
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isNotice, setIsNotice] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);

  // 권한 확인
  const canCreateNotice = user?.role === MemberRole.ADMIN || user?.role === MemberRole.COORDINATOR;
  const canPin = user?.role === MemberRole.ADMIN || user?.role === MemberRole.COORDINATOR;
  const canUploadFiles = true; // 모든 사용자 파일 업로드 가능

  // 초기 데이터 로드
  useEffect(() => {
    loadBoards();
  }, []);

  // 게시판 선택 시 유효성 검사
  useEffect(() => {
    if (boards.length > 0 && selectedBoardId === 0) {
      setSelectedBoardId(boards[0].id);
    }
  }, [boards, selectedBoardId]);

  // 태그 추가
  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  // 태그 제거
  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // 파일 선택
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach((file) => {
      // 파일 크기 제한 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`파일 크기가 너무 큽니다: ${file.name} (최대 10MB)`);
        return;
      }

      const newAttachment: AttachmentFile = {
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        uploading: false,
        uploaded: false
      };

      setAttachments(prev => [...prev, newAttachment]);
    });

    // 입력 초기화
    event.target.value = '';
  };

  // 첨부파일 제거
  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // 파일 업로드
  const uploadFile = async (attachment: AttachmentFile, index: number): Promise<number | null> => {
    if (!attachment.file) return null;

    try {
      // 업로드 상태 표시
      setAttachments(prev => prev.map((item, i) => 
        i === index ? { ...item, uploading: true } : item
      ));

      const result = await boardFileService.uploadFile(attachment.file);

      // 업로드 완료 상태 업데이트
      setAttachments(prev => prev.map((item, i) => 
        i === index ? { 
          ...item, 
          id: result.id,
          uploading: false, 
          uploaded: true,
          url: result.downloadUrl
        } : item
      ));

      return result.id;
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      
      // 업로드 실패 상태 업데이트
      setAttachments(prev => prev.map((item, i) => 
        i === index ? { ...item, uploading: false, uploaded: false } : item
      ));

      alert(`파일 업로드에 실패했습니다: ${attachment.name}`);
      return null;
    }
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!selectedBoardId) {
      alert('게시판을 선택해주세요.');
      return;
    }

    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    try {
      // 첨부파일 업로드
      const attachmentIds: number[] = [];
      for (let i = 0; i < attachments.length; i++) {
        const attachment = attachments[i];
        if (attachment.file && !attachment.uploaded) {
          const id = await uploadFile(attachment, i);
          if (id) {
            attachmentIds.push(id);
          }
        } else if (attachment.id) {
          attachmentIds.push(attachment.id);
        }
      }

      // 게시글 생성 요청
      const request: PostCreateRequest = {
        boardId: selectedBoardId,
        title: title.trim(),
        content: content.trim(),
        isAnonymous,
        isNotice: canCreateNotice ? isNotice : false,
        isPinned: canPin ? isPinned : false,
        tags: tags.length > 0 ? tags : undefined,
        attachmentIds: attachmentIds.length > 0 ? attachmentIds : undefined
      };

      const createdPost = await createPost(request);
      
      // 성공 시 상세 페이지로 이동
      navigate(`/boards/${selectedBoardId}/posts/${createdPost.id}`);
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      alert('게시글 작성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (boardsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">게시글 작성</h1>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              // 미리보기 기능 (추후 구현)
              console.log('미리보기');
            }}
          >
            <Eye className="w-4 h-4 mr-2" />
            미리보기
          </Button>
        </div>
      </div>

      {/* 에러 메시지 */}
      {(boardsError || postsError) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{boardsError || postsError}</span>
          <button
            onClick={() => {
              clearBoardsError();
              clearPostsError();
            }}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            ✕
          </button>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 게시판 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                게시판 <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedBoardId}
                onChange={(e) => setSelectedBoardId(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-elderberry-500 focus:border-elderberry-500"
                required
              >
                <option value={0}>게시판을 선택해주세요</option>
                {boards.map((board) => (
                  <option key={board.id} value={board.id}>
                    {board.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 제목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-elderberry-500 focus:border-elderberry-500"
                maxLength={200}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {title.length}/200자
              </p>
            </div>

            {/* 내용 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용을 입력하세요"
                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-elderberry-500 focus:border-elderberry-500 resize-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {content.length}자
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 옵션 설정 */}
        <Card>
          <CardHeader>
            <CardTitle>게시 옵션</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 익명 작성 */}
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 text-elderberry-600 border-gray-300 rounded focus:ring-elderberry-500"
              />
              <span className="ml-2 text-sm text-gray-700">익명으로 작성</span>
            </label>

            {/* 공지사항 (관리자만) */}
            {canCreateNotice && (
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isNotice}
                  onChange={(e) => setIsNotice(e.target.checked)}
                  className="w-4 h-4 text-elderberry-600 border-gray-300 rounded focus:ring-elderberry-500"
                />
                <div className="ml-2 flex items-center">
                  <Megaphone className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-sm text-gray-700">공지사항으로 등록</span>
                </div>
              </label>
            )}

            {/* 고정 (관리자만) */}
            {canPin && (
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 text-elderberry-600 border-gray-300 rounded focus:ring-elderberry-500"
                />
                <div className="ml-2 flex items-center">
                  <Pin className="w-4 h-4 text-elderberry-500 mr-1" />
                  <span className="text-sm text-gray-700">상단 고정</span>
                </div>
              </label>
            )}
          </CardContent>
        </Card>

        {/* 태그 */}
        <Card>
          <CardHeader>
            <CardTitle>태그</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="태그를 입력하고 Enter를 누르세요"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-elderberry-500 focus:border-elderberry-500"
                maxLength={20}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                <Tag className="w-4 h-4 mr-2" />
                추가
              </Button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-elderberry-100 text-elderberry-700"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(index)}
                      className="ml-1 text-elderberry-500 hover:text-elderberry-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-500">
              최대 10개까지 추가할 수 있습니다. ({tags.length}/10)
            </p>
          </CardContent>
        </Card>

        {/* 첨부파일 */}
        {canUploadFiles && (
          <Card>
            <CardHeader>
              <CardTitle>첨부파일</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  파일 선택
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  최대 10MB까지 업로드 가능합니다. (이미지, PDF, 문서, 압축파일)
                </p>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-elderberry-100 rounded-lg flex items-center justify-center">
                          {attachment.type.startsWith('image/') ? (
                            <Image className="w-4 h-4 text-elderberry-600" />
                          ) : (
                            <FileText className="w-4 h-4 text-elderberry-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {attachment.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(attachment.size)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {attachment.uploading && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-elderberry-600"></div>
                        )}
                        {attachment.uploaded && (
                          <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-xs text-green-600">✓</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(index)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 제출 버튼 */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            취소
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={postsLoading}
            disabled={!selectedBoardId || !title.trim() || !content.trim()}
          >
            <Save className="w-4 h-4 mr-2" />
            {postsLoading ? '작성 중...' : '게시글 작성'}
          </Button>
        </div>
      </form>
    </div>
  );
}