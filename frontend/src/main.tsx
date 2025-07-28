/**
 * React 앱 진입점
 * Vite + React 18 기반
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

// 전역 스타일 불러오기
import './App.css'
import './styles/animations.css'

// React 18 루트 생성 및 렌더링
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)