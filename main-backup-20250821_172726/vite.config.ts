import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    host: true,
    strictPort: true, // 지정된 포트가 사용 중이면 에러 발생
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})