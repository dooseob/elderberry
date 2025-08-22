/**
 * 배치로 console 로그를 최적화하는 스크립트
 * 개발용 console.log를 devLogger로, console.error를 errorLogger로 변경
 */

const fs = require('fs');
const path = require('path');

// 파일 목록
const filesToProcess = [
  'src/stores/boardStore.ts',
  'src/stores/facilityStore.ts', 
  'src/stores/healthAssessmentStore.ts',
  'src/stores/jobStore.ts',
  'src/stores/profileStore.ts',
  'src/stores/authStore.ts',
  'src/features/boards/PostDetailPage.tsx',
  'src/features/boards/PostCreatePage.tsx',
  'src/features/facility/FacilitySearchPage.tsx',
  'src/features/facility/components/FacilityCard.tsx',
  'src/features/facility/components/FacilityDetailModal/index.tsx',
  'src/features/facility/components/MatchingCompletionForm.tsx',
  'src/features/health/steps/ReviewStep.tsx',
  'src/features/jobs/JobDetailPage.tsx',
  'src/features/profile/ProfileListPage.tsx',
  'src/features/profile/ProfileDetailPage.tsx',
  'src/components/layout/MainLayout.tsx',
  'src/utils/preloadRoutes.ts'
];

// devLogger import 추가가 필요한 패턴들
const devLoggerImportPattern = /^import.*from\s+['"][^'"]*['"];?\s*$/gm;

// console 로그 교체 규칙
const replaceRules = [
  // 개발용 로그
  {
    pattern: /console\.log\('([^']+)'(?:,\s*([^)]+))?\);/g,
    replacement: "devLogger.action('$1'$2);"
  },
  {
    pattern: /console\.log\(`([^`]+)`(?:,\s*([^)]+))?\);/g,
    replacement: "devLogger.log(`$1`$2);"
  },
  {
    pattern: /console\.log\(([^)]+)\);/g,
    replacement: "devLogger.log($1);"
  },
  
  // 에러 로그
  {
    pattern: /console\.error\('([^']+)'(?:,\s*([^)]+))?\);/g,
    replacement: "errorLogger.error('$1'$2);"
  },
  {
    pattern: /console\.error\(`([^`]+)`(?:,\s*([^)]+))?\);/g,
    replacement: "errorLogger.error(`$1`$2);"
  },
  {
    pattern: /console\.error\(([^)]+)\);/g,
    replacement: "errorLogger.error($1);"
  },
  
  // 경고 로그
  {
    pattern: /console\.warn\('([^']+)'(?:,\s*([^)]+))?\);/g,
    replacement: "errorLogger.warn('$1'$2);"
  },
  {
    pattern: /console\.warn\(`([^`]+)`(?:,\s*([^)]+))?\);/g,
    replacement: "errorLogger.warn(`$1`$2);"
  },
  {
    pattern: /console\.warn\(([^)]+)\);/g,
    replacement: "errorLogger.warn($1);"
  }
];

function processFile(filePath) {
  try {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`파일을 찾을 수 없습니다: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // devLogger import 추가 확인
    if (content.includes('console.') && !content.includes('devLogger')) {
      // import 섹션 찾기
      const importMatches = content.match(devLoggerImportPattern);
      if (importMatches && importMatches.length > 0) {
        const lastImport = importMatches[importMatches.length - 1];
        const importIndex = content.lastIndexOf(lastImport) + lastImport.length;
        
        // devLogger import 추가
        const devLoggerImport = "\nimport { devLogger, errorLogger } from '../utils/devLogger';";
        content = content.slice(0, importIndex) + devLoggerImport + content.slice(importIndex);
        modified = true;
      }
    }

    // console 로그 교체
    for (const rule of replaceRules) {
      const originalContent = content;
      content = content.replace(rule.pattern, rule.replacement);
      if (content !== originalContent) {
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ 처리 완료: ${filePath}`);
    } else {
      console.log(`⏭️  변경 없음: ${filePath}`);
    }

  } catch (error) {
    console.error(`❌ 처리 실패: ${filePath}`, error.message);
  }
}

// 모든 파일 처리
console.log('🚀 배치 console 로그 최적화 시작...\n');

for (const file of filesToProcess) {
  processFile(file);
}

console.log('\n✨ 배치 처리 완료!');