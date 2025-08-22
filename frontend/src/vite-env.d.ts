/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Clerk Configuration
  readonly VITE_CLERK_PUBLISHABLE_KEY: string
  readonly VITE_USE_CLERK_AUTH: string
  
  // API Configuration
  readonly VITE_API_BASE_URL: string
  readonly VITE_BACKEND_URL: string
  
  // Environment & Features
  readonly VITE_ENV: string
  readonly VITE_USE_MOCK: string
  readonly VITE_DEBUG_MODE: string
  
  // Public Data API Configuration
  readonly VITE_USE_PUBLIC_API: string
  readonly VITE_HIRA_API_KEY: string
  readonly VITE_NHIS_API_KEY: string
  readonly VITE_DATA_GO_KR_API_KEY: string
  readonly VITE_API_AUTH_TYPE: string
  
  // Clerk Organization IDs
  readonly VITE_CLERK_ORG_DOMESTIC_USERS: string
  readonly VITE_CLERK_ORG_OVERSEAS_USERS: string
  readonly VITE_CLERK_ORG_JOB_SEEKERS: string
  readonly VITE_CLERK_ORG_FACILITIES: string
  readonly VITE_CLERK_ORG_COORDINATORS: string
  readonly VITE_CLERK_ORG_ADMINS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}