/// <reference types="vite/client" />

// Vite 환경 변수 타입 정의
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_KAKAO_API_KEY: string
  readonly VITE_USE_FREE_MAP: string
  readonly VITE_GITHUB_REPO_OWNER: string
  readonly VITE_GITHUB_REPO_NAME: string
  readonly VITE_DEV_MODE: string
  readonly VITE_LOG_LEVEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}