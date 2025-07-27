/**
 * 아키텍처 규칙을 위한 ESLint 설정
 * Feature-Sliced Design 규칙 적용
 */
module.exports = {
  extends: ['./.eslintrc.js'],
  plugins: ['import'],
  rules: {
    // 순환 의존성 방지
    'import/no-cycle': ['error', { maxDepth: 10 }],
    
    // 계층 간 의존성 규칙
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          // app은 모든 계층에 접근 가능
          
          // pages는 widgets, features, entities, shared에만 접근 가능
          {
            target: './src/pages/**/*',
            from: './src/app/**/*',
            message: 'Pages cannot import from app layer',
          },
          
          // widgets는 features, entities, shared에만 접근 가능
          {
            target: './src/widgets/**/*',
            from: './src/app/**/*',
            message: 'Widgets cannot import from app layer',
          },
          {
            target: './src/widgets/**/*',
            from: './src/pages/**/*',
            message: 'Widgets cannot import from pages layer',
          },
          
          // features는 entities, shared에만 접근 가능
          {
            target: './src/features/**/*',
            from: './src/app/**/*',
            message: 'Features cannot import from app layer',
          },
          {
            target: './src/features/**/*',
            from: './src/pages/**/*',
            message: 'Features cannot import from pages layer',
          },
          {
            target: './src/features/**/*',
            from: './src/widgets/**/*',
            message: 'Features cannot import from widgets layer',
          },
          
          // entities는 shared에만 접근 가능
          {
            target: './src/entities/**/*',
            from: './src/app/**/*',
            message: 'Entities cannot import from app layer',
          },
          {
            target: './src/entities/**/*',
            from: './src/pages/**/*',
            message: 'Entities cannot import from pages layer',
          },
          {
            target: './src/entities/**/*',
            from: './src/widgets/**/*',
            message: 'Entities cannot import from widgets layer',
          },
          {
            target: './src/entities/**/*',
            from: './src/features/**/*',
            message: 'Entities cannot import from features layer',
          },
          
          // shared는 다른 계층에 접근할 수 없음
          {
            target: './src/shared/**/*',
            from: './src/app/**/*',
            message: 'Shared cannot import from app layer',
          },
          {
            target: './src/shared/**/*',
            from: './src/pages/**/*',
            message: 'Shared cannot import from pages layer',
          },
          {
            target: './src/shared/**/*',
            from: './src/widgets/**/*',
            message: 'Shared cannot import from widgets layer',
          },
          {
            target: './src/shared/**/*',
            from: './src/features/**/*',
            message: 'Shared cannot import from features layer',
          },
          {
            target: './src/shared/**/*',
            from: './src/entities/**/*',
            message: 'Shared cannot import from entities layer',
          },
          
          // 같은 계층 내 slice 간 의존성 제한
          {
            target: './src/entities/*/!(index.ts)',
            from: './src/entities/*/!(index.ts)',
            message: 'Entities should only import through public API (index.ts)',
          },
          {
            target: './src/features/*/!(index.ts)',
            from: './src/features/*/!(index.ts)',
            message: 'Features should only import through public API (index.ts)',
          },
        ],
      },
    ],
    
    // Public API 규칙
    'import/no-internal-modules': [
      'error',
      {
        allow: [
          // shared 내부 모듈은 자유롭게 접근 가능
          'shared/**/*',
          // 같은 slice 내부는 접근 가능
          '**/model/**',
          '**/ui/**',
          '**/api/**',
          '**/lib/**',
        ],
      },
    ],
    
    // 절대 경로 사용 강제
    'import/no-relative-packages': 'error',
    
    // 중복 import 방지
    'import/no-duplicates': 'error',
    
    // 사용하지 않는 import 제거
    'import/no-unused-modules': [
      'error',
      {
        unusedExports: true,
        src: ['./src/**/*'],
        ignoreExports: ['./src/**/*.d.ts', './src/**/index.ts'],
      },
    ],
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
    },
  },
};