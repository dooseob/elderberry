/**
 * SEO 최적화를 위한 커스텀 훅
 * 페이지별 동적 메타 태그 관리
 */
import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

/**
 * 페이지별 SEO 메타 태그를 동적으로 관리하는 훅
 */
export const useSEO = ({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage = '/og-image.jpg',
  canonicalUrl,
  noIndex = false
}: SEOProps) => {
  useEffect(() => {
    // 기본 사이트 정보
    const siteName = '엘더베리';
    const defaultTitle = '재외동포를 위한 한국 요양원 구인구직 매칭 서비스';
    const defaultDescription = '해외 거주 재외동포와 한국 요양원을 연결하는 전문 매칭 플랫폼. 건강평가부터 시설매칭, 코디네이터 연결까지 원스톱 서비스 제공.';

    // Title 업데이트
    if (title) {
      document.title = `${title} | ${siteName}`;
    } else {
      document.title = `${siteName} - ${defaultTitle}`;
    }

    // Meta description 업데이트
    updateMetaTag('description', description || defaultDescription);

    // Keywords 업데이트
    if (keywords) {
      updateMetaTag('keywords', keywords);
    }

    // Robots 메타 태그
    updateMetaTag('robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph 태그들
    updateMetaProperty('og:title', ogTitle || title || defaultTitle);
    updateMetaProperty('og:description', ogDescription || description || defaultDescription);
    updateMetaProperty('og:image', ogImage);
    updateMetaProperty('og:url', canonicalUrl || window.location.href);

    // Twitter Cards
    updateMetaTag('twitter:title', ogTitle || title || defaultTitle);
    updateMetaTag('twitter:description', ogDescription || description || defaultDescription);
    updateMetaTag('twitter:image', ogImage);

    // Canonical URL
    if (canonicalUrl) {
      updateCanonicalUrl(canonicalUrl);
    }

    // 정리 함수 (컴포넌트 언마운트 시 기본값으로 복원)
    return () => {
      document.title = `${siteName} - ${defaultTitle}`;
      updateMetaTag('description', defaultDescription);
      updateMetaTag('robots', 'index, follow');
    };
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, canonicalUrl, noIndex]);
};

/**
 * 메타 태그 업데이트 헬퍼 함수
 */
const updateMetaTag = (name: string, content: string) => {
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
  
  if (meta) {
    meta.content = content;
  } else {
    meta = document.createElement('meta');
    meta.name = name;
    meta.content = content;
    document.head.appendChild(meta);
  }
};

/**
 * Open Graph 프로퍼티 업데이트 헬퍼 함수
 */
const updateMetaProperty = (property: string, content: string) => {
  let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
  
  if (meta) {
    meta.content = content;
  } else {
    meta = document.createElement('meta');
    meta.setAttribute('property', property);
    meta.content = content;
    document.head.appendChild(meta);
  }
};

/**
 * Canonical URL 업데이트 헬퍼 함수
 */
const updateCanonicalUrl = (url: string) => {
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  
  if (canonical) {
    canonical.href = url;
  } else {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = url;
    document.head.appendChild(canonical);
  }
};

/**
 * 구조화 데이터 추가 헬퍼 함수
 */
export const addStructuredData = (data: object, id?: string) => {
  const scriptId = id || 'structured-data';
  
  // 기존 구조화 데이터 제거
  const existingScript = document.getElementById(scriptId);
  if (existingScript) {
    existingScript.remove();
  }

  // 새로운 구조화 데이터 추가
  const script = document.createElement('script');
  script.id = scriptId;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

/**
 * 페이지별 SEO 설정 프리셋
 */
export const SEOPresets = {
  healthAssessment: {
    title: '건강 평가',
    description: '재외동포를 위한 전문 건강 평가 서비스. ADL 평가부터 장기요양등급까지 체계적 건강 상태 진단.',
    keywords: '건강평가, ADL평가, 장기요양등급, 요양원, 재외동포',
    ogTitle: '건강 평가 - 엘더베리',
    canonicalUrl: 'https://elderberry.co.kr/health-assessment'
  },
  
  facilitySearch: {
    title: '시설 검색',
    description: '전국 요양원 시설 검색 및 매칭 서비스. 지역별, 서비스별 맞춤 시설 추천.',
    keywords: '요양원검색, 시설매칭, 요양시설, 노인요양원, 재외동포',
    ogTitle: '시설 검색 - 엘더베리',
    canonicalUrl: 'https://elderberry.co.kr/facility-search'
  },
  
  coordinatorMatching: {
    title: '코디네이터 매칭',
    description: '전문 케어 코디네이터 매칭 서비스. 언어별, 지역별 맞춤 코디네이터 연결.',
    keywords: '코디네이터매칭, 케어코디네이터, 요양상담, 재외동포지원',
    ogTitle: '코디네이터 매칭 - 엘더베리',
    canonicalUrl: 'https://elderberry.co.kr/coordinator-matching'
  },
  
  jobBoard: {
    title: '구인구직',
    description: '요양원 구인구직 전문 게시판. 간병인, 요양보호사, 간호사 채용 정보.',
    keywords: '요양원구인, 요양원구직, 간병인채용, 요양보호사, 간호사',
    ogTitle: '구인구직 - 엘더베리',
    canonicalUrl: 'https://elderberry.co.kr/jobs'
  },
  
  login: {
    title: '로그인',
    description: '엘더베리 회원 로그인 페이지. 안전하고 편리한 로그인으로 맞춤 서비스를 이용하세요.',
    keywords: '로그인, 회원가입, 엘더베리',
    ogTitle: '로그인 - 엘더베리',
    canonicalUrl: 'https://elderberry.co.kr/login',
    noIndex: true // 로그인 페이지는 검색 노출 안함
  },
  
  register: {
    title: '회원가입',
    description: '엘더베리 회원가입 페이지. 무료 가입으로 전문 요양원 매칭 서비스를 이용하세요.',
    keywords: '회원가입, 무료가입, 엘더베리',
    ogTitle: '회원가입 - 엘더베리',
    canonicalUrl: 'https://elderberry.co.kr/register'
  }
};