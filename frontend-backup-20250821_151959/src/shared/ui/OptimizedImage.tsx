/**
 * 최적화된 이미지 컴포넌트
 * LCP 개선을 위한 이미지 로딩 최적화
 */
import React, { useState, useRef, useEffect, memo } from 'react';
import { cn } from '../../lib/utils';

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'loading'> {
  // 기본 이미지 소스
  src: string;
  // WebP 대체 이미지 (선택사항)
  webpSrc?: string;
  // AVIF 대체 이미지 (선택사항)
  avifSrc?: string;
  // 저품질 placeholder (블러 효과용)
  placeholder?: string;
  // 지연 로딩 여부
  lazy?: boolean;
  // 우선순위 (LCP 요소일 때 true)
  priority?: boolean;
  // 이미지 비율 유지 (CLS 방지)
  aspectRatio?: string;
  // 이미지 크기 (responsive)
  sizes?: string;
  // 에러 시 대체 이미지
  fallback?: string;
  // 로딩 중 표시할 컴포넌트
  loader?: React.ReactNode;
  // 로딩 완료 콜백
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  // 에러 콜백
  onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  // 컨테이너 추가 클래스
  containerClassName?: string;
}

interface ImageState {
  isLoading: boolean;
  isLoaded: boolean;
  hasError: boolean;
  currentSrc: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = memo(({
  src,
  webpSrc,
  avifSrc,
  placeholder,
  lazy = true,
  priority = false,
  aspectRatio,
  sizes,
  fallback,
  loader,
  alt = '',
  className = '',
  containerClassName = '',
  onLoad,
  onError,
  ...props
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<ImageState>({
    isLoading: true,
    isLoaded: false,
    hasError: false,
    currentSrc: placeholder || src
  });

  // Intersection Observer를 사용한 지연 로딩
  const [isInView, setIsInView] = useState(!lazy || priority);

  useEffect(() => {
    if (!lazy || priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // 50px 전에 로딩 시작
        threshold: 0.1
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, priority]);

  // 이미지 로딩 처리
  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    let imageToLoad = src;

    // 브라우저 지원 형식 감지
    if (avifSrc && supportsFormat('avif')) {
      imageToLoad = avifSrc;
    } else if (webpSrc && supportsFormat('webp')) {
      imageToLoad = webpSrc;
    }

    img.onload = () => {
      setState({
        isLoading: false,
        isLoaded: true,
        hasError: false,
        currentSrc: imageToLoad
      });
    };

    img.onerror = () => {
      // 대체 이미지가 있으면 시도
      if (fallback && imageToLoad !== fallback) {
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          setState({
            isLoading: false,
            isLoaded: true,
            hasError: false,
            currentSrc: fallback
          });
        };
        fallbackImg.onerror = () => {
          setState({
            isLoading: false,
            isLoaded: false,
            hasError: true,
            currentSrc: placeholder || ''
          });
        };
        fallbackImg.src = fallback;
      } else {
        setState({
          isLoading: false,
          isLoaded: false,
          hasError: true,
          currentSrc: placeholder || ''
        });
      }
    };

    img.src = imageToLoad;
  }, [isInView, src, webpSrc, avifSrc, fallback, placeholder]);

  // 이미지 로드 완료 핸들러
  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setState(prev => ({ ...prev, isLoading: false, isLoaded: true }));
    onLoad?.(event);
  };

  // 이미지 에러 핸들러
  const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setState(prev => ({ ...prev, hasError: true }));
    onError?.(event);
  };

  // 컨테이너 스타일 계산
  const containerStyle: React.CSSProperties = {
    ...(aspectRatio && { aspectRatio }),
    position: 'relative',
    overflow: 'hidden'
  };

  // 이미지 클래스 계산
  const imageClasses = cn(
    'transition-all duration-300 ease-in-out',
    'w-full h-full object-cover',
    {
      'opacity-0': state.isLoading || !state.isLoaded,
      'opacity-100': state.isLoaded && !state.hasError,
      'filter blur-sm scale-105': state.isLoading && placeholder,
      'filter-none scale-100': state.isLoaded
    },
    className
  );

  // placeholder 클래스
  const placeholderClasses = cn(
    'absolute inset-0 transition-opacity duration-300',
    'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200',
    'animate-pulse',
    {
      'opacity-100': state.isLoading,
      'opacity-0': state.isLoaded || state.hasError
    }
  );

  return (
    <div
      ref={containerRef}
      className={cn('relative', containerClassName)}
      style={containerStyle}
    >
      {/* Placeholder */}
      {!state.isLoaded && !state.hasError && (
        <div className={placeholderClasses}>
          {loader || (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* 저품질 블러 이미지 (placeholder) */}
      {placeholder && state.isLoading && (
        <img
          src={placeholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm opacity-60"
          loading={priority ? 'eager' : 'lazy'}
        />
      )}

      {/* 메인 이미지 */}
      {isInView && (
        <picture>
          {/* AVIF 지원 브라우저용 */}
          {avifSrc && (
            <source
              srcSet={avifSrc}
              type="image/avif"
              sizes={sizes}
            />
          )}
          
          {/* WebP 지원 브라우저용 */}
          {webpSrc && (
            <source
              srcSet={webpSrc}
              type="image/webp"
              sizes={sizes}
            />
          )}
          
          {/* 기본 이미지 */}
          <img
            ref={imgRef}
            src={state.currentSrc}
            alt={alt}
            className={imageClasses}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding={priority ? 'sync' : 'async'}
            sizes={sizes}
            onLoad={handleLoad}
            onError={handleError}
            {...props}
          />
        </picture>
      )}

      {/* 에러 상태 */}
      {state.hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <div className="text-center">
            <svg
              className="w-12 h-12 mx-auto mb-2 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">이미지를 불러올 수 없습니다</p>
          </div>
        </div>
      )}
    </div>
  );
});

// 브라우저 이미지 포맷 지원 확인
const supportsFormat = (format: 'webp' | 'avif'): boolean => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  try {
    const dataURL = canvas.toDataURL(`image/${format}`);
    return dataURL.indexOf(`image/${format}`) === 5;
  } catch {
    return false;
  }
};

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;

// 편의를 위한 props 타입 export
export type { OptimizedImageProps };

// 사용 예시를 위한 JSDoc
/**
 * @example
 * // 기본 사용법
 * <OptimizedImage
 *   src="/image.jpg"
 *   alt="설명"
 *   aspectRatio="16/9"
 * />
 * 
 * // 고성능 이미지 (LCP 최적화)
 * <OptimizedImage
 *   src="/hero.jpg"
 *   webpSrc="/hero.webp"
 *   avifSrc="/hero.avif"
 *   placeholder="/hero-placeholder.jpg"
 *   priority={true}
 *   lazy={false}
 *   sizes="(max-width: 768px) 100vw, 50vw"
 *   alt="메인 이미지"
 * />
 * 
 * // 반응형 이미지
 * <OptimizedImage
 *   src="/gallery.jpg"
 *   aspectRatio="1/1"
 *   containerClassName="rounded-lg shadow-lg"
 *   sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
 * />
 */