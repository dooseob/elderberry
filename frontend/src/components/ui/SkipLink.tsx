/**
 * 스킵 링크 컴포넌트
 * 키보드 사용자가 반복적인 네비게이션을 건너뛰고 메인 콘텐츠로 바로 이동할 수 있도록 함
 */
import React from 'react';
import { useSkipLink } from '../../hooks/useFocusTrap';

const SkipLink: React.FC = () => {
  const { skipToContent } = useSkipLink();

  return (
    <button
      onClick={skipToContent}
      className="
        sr-only focus:not-sr-only
        fixed top-4 left-4 z-[9999]
        bg-elderberry-600 text-white px-4 py-2 rounded-md
        focus:ring-2 focus:ring-elderberry-300 focus:ring-offset-2
        transition-all duration-200
        text-sm font-medium
      "
      aria-label="메인 콘텐츠로 건너뛰기"
    >
      메인 콘텐츠로 건너뛰기
    </button>
  );
};

export default SkipLink;