/**
 * SEO 최적화 훅
 * 동적 메타데이터 관리 및 검색엔진 최적화
 */
import { useEffect } from 'react';

interface SEOData {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile' | 'business.business';
  siteName?: string;
  locale?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  breadcrumbs?: Array<{ name: string; url?: string }>;
  faqData?: Array<{ question: string; answer: string }>;
  businessInfo?: {
    name: string;
    type: string;
    address?: string;
    telephone?: string;
    email?: string;
    website?: string;
    openingHours?: string[];
    priceRange?: string;
  };
}

interface UseSEOOptions {
  // 기본값으로 사용할 사이트 정보
  defaultSite?: {
    name: string;
    description: string;
    url: string;
    image: string;
    locale: string;
  };
}

/**
 * SEO 메타데이터를 동적으로 관리하는 훅
 */
export const useSEO = (seoData: SEOData, options?: UseSEOOptions) => {
  const defaultSite = options?.defaultSite || {
    name: 'Elderberry - 글로벌 요양원 구인구직 서비스',
    description: '전문적인 요양원 검색과 건강 평가를 제공하는 글로벌 플랫폼',
    url: 'https://www.elderberry-ai.com',
    image: 'https://www.elderberry-ai.com/images/og-image.jpg',
    locale: 'ko_KR'
  };

  useEffect(() => {
    // 페이지 제목 설정
    if (seoData.title) {
      document.title = `${seoData.title} | ${defaultSite.name}`;
    } else {
      document.title = defaultSite.name;
    }

    // 메타 태그 업데이트
    updateMetaTags(seoData, defaultSite);
    
    // Open Graph 태그 업데이트
    updateOpenGraphTags(seoData, defaultSite);
    
    // Twitter Card 태그 업데이트
    updateTwitterCardTags(seoData, defaultSite);
    
    // 구조화 데이터 업데이트
    updateStructuredData(seoData, defaultSite);

  }, [seoData, defaultSite]);

  return {
    updateSEO: (newSeoData: Partial<SEOData>) => {
      updateMetaTags({ ...seoData, ...newSeoData }, defaultSite);
    }
  };
};

/**
 * 기본 메타 태그 업데이트
 */
const updateMetaTags = (seoData: SEOData, defaultSite: UseSEOOptions['defaultSite']) => {
  // Description
  updateOrCreateMeta('description', seoData.description || defaultSite?.description);
  
  // Keywords
  if (seoData.keywords?.length) {
    updateOrCreateMeta('keywords', seoData.keywords.join(', '));
  }
  
  // Author
  if (seoData.author) {
    updateOrCreateMeta('author', seoData.author);
  }
  
  // Robots
  updateOrCreateMeta('robots', 'index, follow, max-snippet:-1, max-image-preview:large');
  
  // Viewport (반응형 디자인)
  updateOrCreateMeta('viewport', 'width=device-width, initial-scale=1.0');
  
  // 언어 설정
  document.documentElement.lang = seoData.locale?.split('_')[0] || 'ko';
};

/**
 * Open Graph 태그 업데이트
 */
const updateOpenGraphTags = (seoData: SEOData, defaultSite: UseSEOOptions['defaultSite']) => {
  updateOrCreateMeta('og:title', seoData.title || defaultSite?.name, 'property');
  updateOrCreateMeta('og:description', seoData.description || defaultSite?.description, 'property');
  updateOrCreateMeta('og:image', seoData.image || defaultSite?.image, 'property');
  updateOrCreateMeta('og:url', seoData.url || defaultSite?.url, 'property');
  updateOrCreateMeta('og:type', seoData.type || 'website', 'property');
  updateOrCreateMeta('og:site_name', seoData.siteName || defaultSite?.name, 'property');
  updateOrCreateMeta('og:locale', seoData.locale || defaultSite?.locale, 'property');
  
  // 이미지 추가 정보
  if (seoData.image || defaultSite?.image) {
    updateOrCreateMeta('og:image:width', '1200', 'property');
    updateOrCreateMeta('og:image:height', '630', 'property');
    updateOrCreateMeta('og:image:alt', seoData.title || defaultSite?.name, 'property');
  }
  
  // 글 정보 (article 타입일 때)
  if (seoData.type === 'article') {
    if (seoData.author) {
      updateOrCreateMeta('article:author', seoData.author, 'property');
    }
    if (seoData.publishedTime) {
      updateOrCreateMeta('article:published_time', seoData.publishedTime, 'property');
    }
    if (seoData.modifiedTime) {
      updateOrCreateMeta('article:modified_time', seoData.modifiedTime, 'property');
    }
    if (seoData.section) {
      updateOrCreateMeta('article:section', seoData.section, 'property');
    }
    if (seoData.tags?.length) {
      // 여러 태그는 각각 별도 메타태그로
      seoData.tags.forEach(tag => {
        const tagMeta = document.createElement('meta');
        tagMeta.property = 'article:tag';
        tagMeta.content = tag;
        document.head.appendChild(tagMeta);
      });
    }
  }
};

/**
 * Twitter Card 태그 업데이트
 */
const updateTwitterCardTags = (seoData: SEOData, defaultSite: UseSEOOptions['defaultSite']) => {
  updateOrCreateMeta('twitter:card', 'summary_large_image', 'name');
  updateOrCreateMeta('twitter:title', seoData.title || defaultSite?.name, 'name');
  updateOrCreateMeta('twitter:description', seoData.description || defaultSite?.description, 'name');
  updateOrCreateMeta('twitter:image', seoData.image || defaultSite?.image, 'name');
  updateOrCreateMeta('twitter:site', '@elderberry_ai', 'name');
  updateOrCreateMeta('twitter:creator', '@elderberry_ai', 'name');
};

/**
 * 구조화 데이터 업데이트 (JSON-LD)
 */
const updateStructuredData = (seoData: SEOData, defaultSite: UseSEOOptions['defaultSite']) => {
  // 기존 구조화 데이터 스크립트 제거
  const existingScript = document.querySelector('script[data-structured-data]');
  if (existingScript) {
    existingScript.remove();
  }

  const structuredData: any = {
    '@context': 'https://schema.org',
    '@graph': []
  };

  // 웹사이트 정보
  structuredData['@graph'].push({
    '@type': 'WebSite',
    '@id': `${defaultSite?.url}#website`,
    url: defaultSite?.url,
    name: defaultSite?.name,
    description: defaultSite?.description,
    potentialAction: [{
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${defaultSite?.url}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }]
  });

  // 조직 정보
  structuredData['@graph'].push({
    '@type': 'Organization',
    '@id': `${defaultSite?.url}#organization`,
    name: 'Elderberry Inc.',
    url: defaultSite?.url,
    logo: {
      '@type': 'ImageObject',
      '@id': `${defaultSite?.url}#logo`,
      url: `${defaultSite?.url}/images/logo.png`,
      width: 512,
      height: 512,
      caption: 'Elderberry Logo'
    },
    sameAs: [
      'https://www.facebook.com/elderberry.ai',
      'https://www.instagram.com/elderberry.ai',
      'https://www.linkedin.com/company/elderberry-ai'
    ]
  });

  // 페이지별 구조화 데이터
  if (seoData.type === 'article' || seoData.breadcrumbs) {
    structuredData['@graph'].push({
      '@type': 'WebPage',
      '@id': `${seoData.url || defaultSite?.url}#webpage`,
      url: seoData.url,
      name: seoData.title,
      description: seoData.description,
      isPartOf: {
        '@id': `${defaultSite?.url}#website`
      },
      about: {
        '@id': `${defaultSite?.url}#organization`
      }
    });
  }

  // 빵부스러기 네비게이션
  if (seoData.breadcrumbs?.length) {
    structuredData['@graph'].push({
      '@type': 'BreadcrumbList',
      itemListElement: seoData.breadcrumbs.map((breadcrumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: breadcrumb.name,
        item: breadcrumb.url
      }))
    });
  }

  // FAQ 데이터
  if (seoData.faqData?.length) {
    structuredData['@graph'].push({
      '@type': 'FAQPage',
      mainEntity: seoData.faqData.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    });
  }

  // 비즈니스 정보
  if (seoData.businessInfo) {
    const business = seoData.businessInfo;
    structuredData['@graph'].push({
      '@type': 'LocalBusiness',
      '@id': `${defaultSite?.url}#business`,
      name: business.name,
      '@subtype': business.type,
      address: business.address ? {
        '@type': 'PostalAddress',
        streetAddress: business.address
      } : undefined,
      telephone: business.telephone,
      email: business.email,
      website: business.website,
      openingHoursSpecification: business.openingHours?.map(hours => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: hours.split(':')[0],
        opens: hours.split(':')[1]?.split('-')[0],
        closes: hours.split(':')[1]?.split('-')[1]
      })),
      priceRange: business.priceRange
    });
  }

  // 구조화 데이터 스크립트 추가
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-structured-data', 'true');
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
};

/**
 * 메타 태그 업데이트 또는 생성 헬퍼 함수
 */
const updateOrCreateMeta = (name: string, content: string, attribute: 'name' | 'property' = 'name') => {
  if (!content) return;

  let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, name);
    document.head.appendChild(meta);
  }
  
  meta.content = content;
};

/**
 * 사이트맵 생성을 위한 페이지 등록 (개발 도구)
 */
export const registerPageForSitemap = (path: string, priority: number = 0.5, changefreq: string = 'monthly') => {
  if (typeof window !== 'undefined' && import.meta.env.MODE === 'development') {
    // 개발 환경에서 사이트맵 정보 수집
    const sitemapData = JSON.parse(localStorage.getItem('elderberry-sitemap') || '[]');
    
    const pageData = {
      path,
      priority,
      changefreq,
      lastmod: new Date().toISOString()
    };
    
    const existingIndex = sitemapData.findIndex((page: any) => page.path === path);
    if (existingIndex >= 0) {
      sitemapData[existingIndex] = pageData;
    } else {
      sitemapData.push(pageData);
    }
    
    localStorage.setItem('elderberry-sitemap', JSON.stringify(sitemapData));
  }
};

/**
 * 기본 SEO 설정
 */
export const DEFAULT_SEO: SEOData = {
  siteName: 'Elderberry',
  locale: 'ko_KR',
  type: 'website',
  image: 'https://www.elderberry-ai.com/images/og-default.jpg'
};

export default useSEO;