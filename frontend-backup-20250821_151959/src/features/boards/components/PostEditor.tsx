/**
 * PostEditor - 게시글 작성/수정 컴포넌트
 * 리치 텍스트 에디터와 폼 유효성 검사 포함
 */

import React, { useState, useRef } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Link, 
  Image, 
  List, 
  ListOrdered,
  Quote,
  Code,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Badge } from '../../../shared/ui/Badge';
import type { PostCreateRequest, PostUpdateRequest } from '../../../entities/board';
import { BOARD_DEFAULT_CONFIG } from '../../../entities/board';

interface PostEditorProps {
  initialData?: {
    title?: string;
    content?: string;
    tags?: string[];
  };
  onSubmit: (data: PostCreateRequest | PostUpdateRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export const PostEditor: React.FC<PostEditorProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = '게시글 작성'
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    } else if (title.length > BOARD_DEFAULT_CONFIG.maxTitleLength) {
      newErrors.title = `제목은 ${BOARD_DEFAULT_CONFIG.maxTitleLength}자 이하로 작성해주세요.`;
    }
    
    if (!content.trim()) {
      newErrors.content = '내용을 입력해주세요.';
    } else if (content.length > BOARD_DEFAULT_CONFIG.maxContentLength) {
      newErrors.content = `내용은 ${BOARD_DEFAULT_CONFIG.maxContentLength}자 이하로 작성해주세요.`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        tags: tags.filter(tag => tag.trim())
      });
    } catch (error) {
      console.error('게시글 저장 실패:', error);
    }
  };

  // 텍스트 포맷팅 함수들
  const insertTextAtCursor = (beforeText: string, afterText: string = '') => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newText = 
      content.substring(0, start) + 
      beforeText + 
      selectedText + 
      afterText + 
      content.substring(end);
    
    setContent(newText);
    
    // 커서 위치 조정
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + beforeText.length,
        start + beforeText.length + selectedText.length
      );
    }, 0);
  };

  // 포맷팅 버튼 핸들러들
  const formatBold = () => insertTextAtCursor('**', '**');
  const formatItalic = () => insertTextAtCursor('*', '*');
  const formatUnderline = () => insertTextAtCursor('<u>', '</u>');
  const formatLink = () => insertTextAtCursor('[링크 텍스트](', ')');
  const formatImage = () => insertTextAtCursor('![이미지 설명](', ')');
  const formatList = () => insertTextAtCursor('- ');
  const formatOrderedList = () => insertTextAtCursor('1. ');
  const formatQuote = () => insertTextAtCursor('> ');
  const formatCode = () => insertTextAtCursor('`', '`');

  // 태그 추가
  const addTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !tags.includes(newTag) && tags.length < 10) {
      setTags([...tags, newTag]);
      setTagInput('');
    }
  };

  // 태그 제거
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // 태그 입력 핸들러
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 제목 입력 */}
        <div>
          <Input
            type="text"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`text-lg font-medium ${errors.title ? 'border-red-500' : ''}`}
            maxLength={BOARD_DEFAULT_CONFIG.maxTitleLength}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {title.length} / {BOARD_DEFAULT_CONFIG.maxTitleLength}
          </p>
        </div>

        {/* 에디터 툴바 */}
        <div className="border border-gray-300 rounded-lg">
          <div className="flex items-center gap-2 p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={formatBold}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded"
                title="굵게"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={formatItalic}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded"
                title="기울임"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={formatUnderline}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded"
                title="밑줄"
              >
                <Underline className="w-4 h-4" />
              </button>
            </div>
            
            <div className="w-px h-6 bg-gray-300" />
            
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={formatLink}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded"
                title="링크"
              >
                <Link className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={formatImage}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded"
                title="이미지"
              >
                <Image className="w-4 h-4" />
              </button>
            </div>
            
            <div className="w-px h-6 bg-gray-300" />
            
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={formatList}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded"
                title="목록"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={formatOrderedList}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded"
                title="번호 목록"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={formatQuote}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded"
                title="인용"
              >
                <Quote className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={formatCode}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded"
                title="코드"
              >
                <Code className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1" />
            
            <button
              type="button"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-white rounded"
            >
              {isPreviewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isPreviewMode ? '편집' : '미리보기'}
            </button>
          </div>

          {/* 에디터/미리보기 영역 */}
          <div className="p-4">
            {isPreviewMode ? (
              <div 
                className="min-h-[400px] prose max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: content
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/`(.*?)`/g, '<code>$1</code>')
                    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
                    .replace(/^- (.+)$/gm, '<li>$1</li>')
                    .replace(/\n/g, '<br>')
                }}
              />
            ) : (
              <textarea
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용을 입력하세요..."
                className={`w-full min-h-[400px] resize-y border-0 outline-none ${
                  errors.content ? 'text-red-600' : ''
                }`}
                maxLength={BOARD_DEFAULT_CONFIG.maxContentLength}
              />
            )}
          </div>
          
          {errors.content && (
            <div className="px-4 pb-3">
              <p className="text-sm text-red-600">{errors.content}</p>
            </div>
          )}
          
          <div className="px-4 pb-3">
            <p className="text-sm text-gray-500">
              {content.length} / {BOARD_DEFAULT_CONFIG.maxContentLength}
            </p>
          </div>
        </div>

        {/* 태그 입력 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            태그 (최대 10개)
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map(tag => (
              <Badge
                key={tag}
                variant="secondary"
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => removeTag(tag)}
              >
                #{tag}
                <span className="text-xs">×</span>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="태그를 입력하고 Enter 또는 쉼표를 누르세요"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              disabled={tags.length >= 10}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addTag}
              disabled={!tagInput.trim() || tags.length >= 10}
            >
              추가
            </Button>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
          >
            {isLoading ? '저장 중...' : submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PostEditor;