/**
 * SEO 프리셋 및 유틸리티
 * 페이지별 미리 정의된 SEO 설정
 */

interface SEOPreset {
  title: string;
  description: string;
  keywords?: string[];
  type?: 'website' | 'article' | 'profile' | 'business.business';
  image?: string;
  breadcrumbs?: Array<{ name: string; url?: string }>;
  faqData?: Array<{ question: string; answer: string }>;
}

/**
 * 페이지별 SEO 프리셋
 */
export const SEOPresets: Record<string, SEOPreset> = {
  home: {
    title: '엘더베리 - 재외동포 요양원 검색 및 건강 평가 서비스',
    description: '재외동포를 위한 전문 요양원 검색과 건강 상태 평가를 제공하는 글로벌 플랫폼입니다.',
    keywords: ['요양원', '재외동포', '건강평가', '돌봄서비스', '케어등급', 'KB라이프생명'],
    type: 'website'
  },
  
  healthAssessment: {
    title: '건강 상태 평가 - KB라이프생명 기반 돌봄지수 체크',
    description: '전문적인 ADL 평가를 통해 개인별 케어 등급을 산출하고 맞춤형 요양 시설을 추천받으세요.',
    keywords: ['건강평가', 'ADL평가', '돌봄지수', '케어등급', '장기요양보험', 'KB라이프생명', '요양등급'],
    type: 'article',
    breadcrumbs: [
      { name: '홈', url: '/' },
      { name: '건강 평가', url: '/health-assessment' }
    ],
    faqData: [
      {
        question: 'ADL 평가는 무엇인가요?',
        answer: 'ADL(Activities of Daily Living) 평가는 일상생활 수행능력을 측정하는 평가로, 걷기, 식사, 배변, 의사소통 능력을 종합적으로 평가합니다.'
      },
      {
        question: '평가 결과는 얼마나 정확한가요?',
        answer: 'KB라이프생명의 돌봄지수 체크 시스템을 기반으로 하여 높은 정확도를 자랑하며, 전문 코디네이터의 검토를 통해 신뢰성을 보장합니다.'
      },
      {
        question: '평가에 걸리는 시간은?',
        answer: '단계별 질문에 응답하는 방식으로 약 10-15분 정도 소요됩니다. 정확한 평가를 위해 충분한 시간을 두고 신중히 답변해 주세요.'
      }
    ]
  },
  
  facilitySearch: {
    title: '요양원 검색 - 지역별 시설 찾기',
    description: '전국 요양원 및 돌봄 시설을 검색하고 상세 정보를 확인하세요. AI 기반 맞춤형 추천 서비스 제공.',
    keywords: ['요양원검색', '돌봄시설', '시설찾기', '요양시설', '재외동포'],
    type: 'website',
    breadcrumbs: [
      { name: '홈', url: '/' },
      { name: '요양원 검색', url: '/facility-search' }
    ]
  },
  
  dashboard: {
    title: '내 대시보드 - 건강 상태 및 추천 현황',
    description: '개인별 건강 평가 결과와 맞춤형 요양원 추천, 코디네이터 매칭 현황을 한눈에 확인하세요.',
    keywords: ['대시보드', '건강현황', '추천현황', '개인화서비스'],
    type: 'profile'
  },
  
  about: {
    title: '엘더베리 소개 - 재외동포를 위한 돌봄 서비스',
    description: '엘더베리는 재외동포의 고령화 문제 해결을 위해 설립된 전문 돌봄 서비스 플랫폼입니다.',
    keywords: ['엘더베리소개', '재외동포', '돌봄서비스', '회사소개', '미션'],
    type: 'article',
    breadcrumbs: [
      { name: '홈', url: '/' },
      { name: '회사소개', url: '/about' }
    ]
  },
  
  contact: {
    title: '문의하기 - 엘더베리 고객 지원',
    description: '서비스 이용 중 궁금한 사항이나 문의사항이 있으시면 언제든 연락주세요.',
    keywords: ['문의하기', '고객지원', '연락처', '도움말'],
    type: 'business.business',
    breadcrumbs: [
      { name: '홈', url: '/' },
      { name: '문의하기', url: '/contact' }
    ]
  },
  
  login: {
    title: '로그인 - 엘더베리 서비스 이용',
    description: '엘더베리 계정으로 로그인하여 개인화된 돌봄 서비스를 이용하세요.',
    keywords: ['로그인', '계정', '회원'],
    type: 'website'
  },
  
  register: {
    title: '회원가입 - 엘더베리 서비스 시작',
    description: '간단한 회원가입으로 전문적인 건강 평가와 요양원 추천 서비스를 시작하세요.',
    keywords: ['회원가입', '가입하기', '계정생성'],
    type: 'website'
  }
};

/**
 * 구조화 데이터 추가 유틸리티
 */
export const addStructuredData = (data: any, id: string) => {
  // 기존 동일 ID 스크립트 제거
  const existing = document.querySelector(`script[data-structured-data-id="${id}"]`);
  if (existing) {
    existing.remove();
  }

  // 새 구조화 데이터 스크립트 추가
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-structured-data-id', id);
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

/**
 * 메타 태그 직접 업데이트 (응급용)
 */
export const updateMetaTag = (name: string, content: string, attribute: 'name' | 'property' = 'name') => {
  let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, name);
    document.head.appendChild(meta);
  }
  
  meta.content = content;
};

/**
 * 페이지 제목 업데이트
 */
export const updatePageTitle = (title: string, siteName: string = 'Elderberry') => {
  document.title = `${title} | ${siteName}`;
};

export default SEOPresets;