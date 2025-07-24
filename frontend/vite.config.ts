import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 개발 서버 설정 (프론트엔드-백엔드 분리 개발)
  server: {
    port: 5173,
    host: true,
    // API 프록시 설정 (CORS 문제 해결)
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        ws: true, // WebSocket 지원
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('프록시 에러:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('API 요청:', req.method, req.url);
          });
        }
      }
    }
  },

  // 빌드 설정 (JAR 통합 배포용)
  build: {
    outDir: '../src/main/resources/static',
    emptyOutDir: true,
    sourcemap: false, // 운영환경에서는 소스맵 제거
    // 청크 최적화
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          utils: ['axios', 'zustand', 'zod']
        }
      }
    }
  },

  // 절대 경로 설정
  resolve: {
    alias: {
      '@': '/src',
    },
  },

  // 환경변수 설정
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __API_BASE_URL__: JSON.stringify(
      process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8080/api' 
        : '/api'
    )
  }
})