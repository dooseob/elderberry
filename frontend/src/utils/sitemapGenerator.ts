/**
 * 사이트맵 자동 생성 시스템
 * 동적 라우트와 정적 페이지를 포함한 XML 사이트맵 생성
 */

interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

// 정적 페이지 경로
const STATIC_ROUTES: SitemapEntry[] = [
  {
    url: '/',
    changefreq: 'daily',
    priority: 1.0
  },
  {
    url: '/health-assessment',
    changefreq: 'weekly',
    priority: 0.9
  },
  {
    url: '/facility-search',
    changefreq: 'daily',
    priority: 0.9
  },
  {
    url: '/boards',
    changefreq: 'daily',
    priority: 0.8
  },
  {
    url: '/jobs',
    changefreq: 'daily',
    priority: 0.8
  },
  {
    url: '/login',
    changefreq: 'monthly',
    priority: 0.5
  },
  {
    url: '/register',
    changefreq: 'monthly',
    priority: 0.6
  },
  {
    url: '/chat-home',
    changefreq: 'weekly',
    priority: 0.7
  },
  {
    url: '/profiles',
    changefreq: 'weekly',
    priority: 0.6
  },
  {
    url: '/reviews',
    changefreq: 'weekly',
    priority: 0.6
  }
];

// 동적 라우트 데이터 가져오는 함수들
interface DynamicRouteData {
  boards?: Array<{ id: string; slug: string; updatedAt: string }>;
  posts?: Array<{ id: string; boardId: string; slug: string; updatedAt: string }>;
  jobs?: Array<{ id: string; slug: string; updatedAt: string }>;
  facilities?: Array<{ id: string; slug: string; updatedAt: string }>;
  profiles?: Array<{ id: string; type: string; slug: string; updatedAt: string }>;
}

/**
 * 동적 라우트 데이터를 가져오는 함수 (실제 API 연동)
 */
export const fetchDynamicRouteData = async (): Promise<DynamicRouteData> => {
  try {
    // 실제 환경에서는 API 호출
    const [boards, posts, jobs, facilities, profiles] = await Promise.all([
      fetch('/api/boards').then(res => res.ok ? res.json() : []).catch(() => []),
      fetch('/api/posts').then(res => res.ok ? res.json() : []).catch(() => []),
      fetch('/api/jobs').then(res => res.ok ? res.json() : []).catch(() => []),
      fetch('/api/facilities').then(res => res.ok ? res.json() : []).catch(() => []),
      fetch('/api/profiles').then(res => res.ok ? res.json() : []).catch(() => [])
    ]);

    return {
      boards: boards || [],
      posts: posts || [],
      jobs: jobs || [],
      facilities: facilities || [],
      profiles: profiles || []
    };
  } catch (error) {
    console.error('동적 라우트 데이터 가져오기 실패:', error);
    return {};
  }
};

/**
 * 동적 라우트를 사이트맵 항목으로 변환
 */
const generateDynamicRoutes = (data: DynamicRouteData): SitemapEntry[] => {
  const routes: SitemapEntry[] = [];
  const baseUrl = 'https://elderberry.co.kr';

  // 게시판 라우트
  if (data.boards) {
    data.boards.forEach(board => {
      routes.push({
        url: `/boards/${board.id}`,
        lastmod: board.updatedAt,
        changefreq: 'daily',
        priority: 0.7
      });
    });
  }

  // 게시글 라우트
  if (data.posts) {
    data.posts.forEach(post => {
      routes.push({
        url: `/boards/${post.boardId}/posts/${post.id}`,
        lastmod: post.updatedAt,
        changefreq: 'weekly',
        priority: 0.6
      });
    });
  }

  // 구인구직 라우트
  if (data.jobs) {
    data.jobs.forEach(job => {
      routes.push({
        url: `/jobs/${job.id}`,
        lastmod: job.updatedAt,
        changefreq: 'daily',
        priority: 0.8
      });
    });
  }

  // 시설 라우트
  if (data.facilities) {
    data.facilities.forEach(facility => {
      routes.push({
        url: `/facilities/${facility.id}`,
        lastmod: facility.updatedAt,
        changefreq: 'weekly',
        priority: 0.7
      });
    });
  }

  // 프로필 라우트
  if (data.profiles) {
    data.profiles.forEach(profile => {
      routes.push({
        url: `/profiles/${profile.type}/${profile.id}`,
        lastmod: profile.updatedAt,
        changefreq: 'weekly',
        priority: 0.6
      });
    });
  }

  return routes;
};

/**
 * XML 사이트맵 생성
 */
export const generateSitemapXML = async (): Promise<string> => {
  const baseUrl = 'https://elderberry.co.kr';
  const currentDate = new Date().toISOString().split('T')[0];
  
  // 동적 라우트 데이터 가져오기
  const dynamicData = await fetchDynamicRouteData();
  const dynamicRoutes = generateDynamicRoutes(dynamicData);
  
  // 모든 라우트 합치기
  const allRoutes = [...STATIC_ROUTES, ...dynamicRoutes];
  
  // XML 헤더
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // 각 URL 추가
  allRoutes.forEach(route => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${route.url}</loc>\n`;
    xml += `    <lastmod>${route.lastmod || currentDate}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority.toFixed(1)}</priority>\n`;
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  
  return xml;
};

/**
 * 사이트맵 인덱스 생성 (대규모 사이트용)
 */
export const generateSitemapIndex = (): string => {
  const baseUrl = 'https://elderberry.co.kr';
  const currentDate = new Date().toISOString().split('T')[0];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // 메인 사이트맵
  xml += '  <sitemap>\n';
  xml += `    <loc>${baseUrl}/sitemap.xml</loc>\n`;
  xml += `    <lastmod>${currentDate}</lastmod>\n`;
  xml += '  </sitemap>\n';
  
  // 게시판 전용 사이트맵
  xml += '  <sitemap>\n';
  xml += `    <loc>${baseUrl}/sitemap-boards.xml</loc>\n`;
  xml += `    <lastmod>${currentDate}</lastmod>\n`;
  xml += '  </sitemap>\n';
  
  // 구인구직 전용 사이트맵
  xml += '  <sitemap>\n';
  xml += `    <loc>${baseUrl}/sitemap-jobs.xml</loc>\n`;
  xml += `    <lastmod>${currentDate}</lastmod>\n`;
  xml += '  </sitemap>\n';
  
  // 시설 전용 사이트맵
  xml += '  <sitemap>\n';
  xml += `    <loc>${baseUrl}/sitemap-facilities.xml</loc>\n`;
  xml += `    <lastmod>${currentDate}</lastmod>\n`;
  xml += '  </sitemap>\n';
  
  xml += '</sitemapindex>';
  
  return xml;
};

/**
 * robots.txt 생성
 */
export const generateRobotsTxt = (): string => {
  const baseUrl = 'https://elderberry.co.kr';
  
  let robots = 'User-agent: *\n';
  robots += 'Allow: /\n\n';
  
  // 차단할 경로들
  robots += '# Private areas\n';
  robots += 'Disallow: /dashboard\n';
  robots += 'Disallow: /mypage\n';
  robots += 'Disallow: /settings\n';
  robots += 'Disallow: /admin/\n';
  robots += 'Disallow: /api/\n';
  robots += 'Disallow: /notifications\n\n';
  
  // 임시 또는 개발 파일들
  robots += '# Development files\n';
  robots += 'Disallow: /*.json$\n';
  robots += 'Disallow: /*.xml$\n';
  robots += 'Disallow: /src/\n';
  robots += 'Disallow: /temp/\n\n';
  
  // 사이트맵 위치
  robots += `Sitemap: ${baseUrl}/sitemap.xml\n`;
  robots += `Sitemap: ${baseUrl}/sitemap-index.xml\n`;
  
  return robots;
};

/**
 * 브라우저에서 사이트맵 다운로드
 */
export const downloadSitemap = async () => {
  try {
    const xml = await generateSitemapXML();
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sitemap.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('사이트맵 다운로드 실패:', error);
  }
};

/**
 * robots.txt 다운로드
 */
export const downloadRobotsTxt = () => {
  try {
    const robots = generateRobotsTxt();
    const blob = new Blob([robots], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'robots.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('robots.txt 다운로드 실패:', error);
  }
};

/**
 * 실시간 사이트맵 업데이트 (새 콘텐츠 생성 시 호출)
 */
export const updateSitemap = async (newEntry: {
  type: 'board' | 'post' | 'job' | 'facility' | 'profile';
  id: string;
  slug?: string;
  boardId?: string;
  profileType?: string;
}) => {
  // 실제 환경에서는 서버 API 호출하여 사이트맵 업데이트
  console.log('사이트맵 업데이트:', newEntry);
  
  // 예시: 서버에 새로운 URL 추가 요청
  try {
    await fetch('/api/sitemap/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newEntry)
    });
  } catch (error) {
    console.error('사이트맵 업데이트 실패:', error);
  }
};

// 개발 환경에서 사이트맵 미리보기
if (process.env.NODE_ENV === 'development') {
  (window as any).sitemapUtils = {
    generateSitemapXML,
    generateSitemapIndex,
    generateRobotsTxt,
    downloadSitemap,
    downloadRobotsTxt,
    updateSitemap
  };
}