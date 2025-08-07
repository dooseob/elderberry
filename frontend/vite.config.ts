import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 개발 서버 설정 (프론트엔드-백엔드 분리 개발)
  server: {
    port: 5173,
    host: true,
    strictPort: false, // 포트 충돌 시 자동으로 다음 포트 사용
    // API 프록시 설정 (CORS 문제 해결)
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        ws: true, // WebSocket 지원
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.error('프록시 에러:', err);
          });
          // API 요청 로그는 너무 많아서 제거 (필요시 주석 해제)
          // proxy.on('proxyReq', (proxyReq, req, _res) => {
          //   console.log('API 요청:', req.method, req.url);
          // });
        }
      }
    }
  },

  // 빌드 설정 (JAR 통합 배포용)
  build: {
    outDir: '../src/main/resources/static',
    emptyOutDir: true,
    sourcemap: false, // 운영환경에서는 소스맵 제거
    target: 'es2015', // 최신 브라우저 지원
    minify: 'terser', // 더 나은 압축
    chunkSizeWarningLimit: 1000, // 청크 크기 경고 임계값 (KB)
    // 프로덕션 배포를 위한 base URL 설정
    base: process.env.NODE_ENV === 'production' ? '/' : '/',
    
    // 청크 최적화 - 지연 로딩과 연계한 번들 분리
    rollupOptions: {
      output: {
        // 수동 청크 분리 - 의존성별 그룹화
        manualChunks: (id) => {
          // 핵심 라이브러리 청크
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }
          
          // 라우팅 관련
          if (id.includes('react-router')) {
            return 'router';
          }
          
          // 상태 관리 및 데이터 페칭
          if (id.includes('@tanstack/react-query') || id.includes('zustand')) {
            return 'state-management';
          }
          
          // UI 라이브러리
          if (id.includes('framer-motion') || id.includes('lucide-react')) {
            return 'ui-libs';
          }
          
          // 유틸리티 라이브러리
          if (id.includes('axios') || id.includes('zod') || id.includes('clsx')) {
            return 'utils';
          }
          
          // 인증 관련 페이지
          if (id.includes('/features/auth/')) {
            return 'auth-pages';
          }
          
          // 게시판 관련 페이지
          if (id.includes('/features/boards/')) {
            return 'board-pages';
          }
          
          // 프로필 관련 페이지
          if (id.includes('/features/profile/')) {
            return 'profile-pages';
          }
          
          // 구직/구인 관련 페이지
          if (id.includes('/features/jobs/')) {
            return 'job-pages';
          }
          
          // 건강 평가 관련 페이지
          if (id.includes('/features/health/')) {
            return 'health-pages';
          }
          
          // 시설 검색 관련 페이지
          if (id.includes('/features/facility/')) {
            return 'facility-pages';
          }
          
          // 채팅 관련 페이지
          if (id.includes('/features/chat/')) {
            return 'chat-pages';
          }
          
          // node_modules의 기타 라이브러리
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        
        // 파일명 패턴 최적화
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `assets/[name]-[hash].js`;
        },
        
        // 에셋 파일명 최적화
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext || '')) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    
    // Terser 압축 옵션
    terserOptions: {
      compress: {
        drop_console: true, // console.log 제거
        drop_debugger: true, // debugger 제거
        pure_funcs: ['console.log', 'console.info'], // 특정 함수 제거
      },
      mangle: {
        safari10: true // Safari 10 호환성
      }
    }
  },

  // 절대 경로 설정
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },

  // 환경변수 설정
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __API_BASE_URL__: JSON.stringify(
      process.env.NODE_ENV === 'development' 
        ? process.env.LOCAL_API_BASE_URL || 'http://localhost:8080/api'
        : process.env.API_BASE_URL || '/api'
    ),
    __FRONTEND_URL__: JSON.stringify(
      process.env.NODE_ENV === 'development'
        ? process.env.LOCAL_FRONTEND_URL || 'http://localhost:5173'
        : process.env.FRONTEND_URL || 'https://www.elderberry-ai.com'
    ),
    __BACKEND_URL__: JSON.stringify(
      process.env.NODE_ENV === 'development'
        ? process.env.LOCAL_BACKEND_URL || 'http://localhost:8080'
        : process.env.BACKEND_URL || 'https://api.elderberry-ai.com'
    )
  }
})