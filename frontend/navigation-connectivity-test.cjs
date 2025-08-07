/**
 * Navigation Connectivity Test
 * 프론트엔드 네비게이션 연결성 테스트 스크립트
 * 
 * @version 1.0.0
 * @description 생성된 모든 페이지와 네비게이션 연결 상태를 검증
 */

const fs = require('fs');
const path = require('path');

// 색상 출력 함수
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

console.log(colors.bold(colors.cyan('\n🔍 프론트엔드 네비게이션 연결성 테스트')));
console.log(colors.cyan('================================================\n'));

// 테스트 결과 저장
const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
};

// 파일 존재 확인 함수
function checkFileExists(filePath, description) {
  const fullPath = path.resolve(__dirname, filePath);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    console.log(colors.green('✅'), description);
    testResults.passed++;
  } else {
    console.log(colors.red('❌'), description);
    testResults.failed++;
  }
  
  testResults.details.push({ description, status: exists ? 'passed' : 'failed', path: filePath });
  return exists;
}

// 파일 내용 확인 함수
function checkFileContent(filePath, searchText, description) {
  const fullPath = path.resolve(__dirname, filePath);
  
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const found = content.includes(searchText);
    
    if (found) {
      console.log(colors.green('✅'), description);
      testResults.passed++;
    } else {
      console.log(colors.red('❌'), description);
      testResults.failed++;
    }
    
    testResults.details.push({ description, status: found ? 'passed' : 'failed', path: filePath });
    return found;
  } catch (error) {
    console.log(colors.red('❌'), `${description} (파일 읽기 오류)`);
    testResults.failed++;
    testResults.details.push({ description, status: 'failed', path: filePath, error: error.message });
    return false;
  }
}

// 라우트 구성 확인 함수
function checkRouteConfiguration() {
  console.log(colors.bold('\n📍 라우트 구성 확인'));
  console.log('------------------');
  
  // App.tsx에서 새로 추가된 라우트 확인
  checkFileContent(
    'src/App.tsx',
    '/about',
    'About 페이지 라우트 설정됨'
  );
  
  checkFileContent(
    'src/App.tsx',
    '/contact',
    'Contact 페이지 라우트 설정됨'
  );
  
  checkFileContent(
    'src/App.tsx',
    '/settings',
    'Settings 페이지 라우트 설정됨'
  );
  
  checkFileContent(
    'src/App.tsx',
    'NotFoundPage',
    '404 페이지 라우트 설정됨'
  );
}

// 페이지 파일 존재 확인
function checkPageFiles() {
  console.log(colors.bold('\n📄 페이지 파일 존재 확인'));
  console.log('----------------------');
  
  checkFileExists(
    'src/pages/AboutPage.tsx',
    'About 페이지 파일 존재'
  );
  
  checkFileExists(
    'src/pages/ContactPage.tsx',
    'Contact 페이지 파일 존재'
  );
  
  checkFileExists(
    'src/pages/SettingsPage.tsx',
    'Settings 페이지 파일 존재'
  );
  
  checkFileExists(
    'src/pages/NotFoundPage.tsx',
    '404 페이지 파일 존재'
  );
}

// 네비게이션 메뉴 연결성 확인
function checkNavigationMenus() {
  console.log(colors.bold('\n🧭 네비게이션 메뉴 연결성 확인'));
  console.log('------------------------------');
  
  // Header 컴포넌트의 네비게이션 메뉴 확인
  checkFileContent(
    'src/widgets/header/ui/Header.tsx',
    '/about',
    'Header에 About 링크 존재'
  );
  
  checkFileContent(
    'src/widgets/header/ui/Header.tsx',
    '/contact',
    'Header에 Contact 링크 존재'
  );
  
  checkFileContent(
    'src/widgets/header/ui/Header.tsx',
    '/settings',
    'Header 사용자 메뉴에 Settings 링크 존재'
  );
  
  // Sidebar 컴포넌트의 React Router 사용 확인
  checkFileContent(
    'src/widgets/sidebar/ui/Sidebar.tsx',
    'useNavigate',
    'Sidebar에서 React Router useNavigate 사용'
  );
  
  checkFileContent(
    'src/widgets/sidebar/ui/Sidebar.tsx',
    'navigate(item.href)',
    'Sidebar에서 navigate 함수 사용'
  );
}

// 중복 파일 정리 확인
function checkDuplicateCleanup() {
  console.log(colors.bold('\n🧹 중복 파일 정리 확인'));
  console.log('--------------------');
  
  // 중복 파일들이 제거되었는지 확인 (파일이 없어야 성공)
  const duplicatePaths = [
    'src/components/mypage/MyPage.tsx',
    'src/features/dashboard/ui/DashboardPage.tsx',
    'src/features/facility-search'
  ];
  
  duplicatePaths.forEach(dupPath => {
    const exists = fs.existsSync(path.resolve(__dirname, dupPath));
    if (!exists) {
      console.log(colors.green('✅'), `중복 파일/폴더 제거됨: ${dupPath}`);
      testResults.passed++;
    } else {
      console.log(colors.yellow('⚠️'), `중복 파일/폴더가 아직 존재: ${dupPath}`);
      testResults.warnings++;
    }
  });
  
  // lazyImports.ts에서 올바른 경로 사용 확인
  checkFileContent(
    'src/utils/lazyImports.ts',
    'features/mypage/MyPage',
    'LazyMyPage가 올바른 경로 사용'
  );
}

// 브레드크럼 및 active state 확인
function checkBreadcrumbAndActiveState() {
  console.log(colors.bold('\n🍞 브레드크럼 및 Active State 확인'));
  console.log('------------------------------------');
  
  checkFileExists(
    'src/hooks/useBreadcrumb.ts',
    'useBreadcrumb 훅 파일 존재'
  );
  
  checkFileContent(
    'src/widgets/layout/ui/MainLayout.tsx',
    'useBreadcrumb',
    'MainLayout에서 useBreadcrumb 훅 사용'
  );
  
  checkFileContent(
    'src/widgets/layout/ui/MainLayout.tsx',
    'Breadcrumb',
    'MainLayout에 Breadcrumb 컴포넌트 포함'
  );
  
  checkFileContent(
    'src/widgets/sidebar/ui/Sidebar.tsx',
    'addActiveState',
    'Sidebar에 active state 로직 포함'
  );
  
  checkFileContent(
    'src/widgets/header/ui/Header.tsx',
    'navItemsWithActive',
    'Header에 active state 로직 포함'
  );
}

// 컴포넌트 임포트 확인
function checkComponentImports() {
  console.log(colors.bold('\n📦 컴포넌트 임포트 확인'));
  console.log('----------------------');
  
  // App.tsx에서 새로운 페이지들이 올바르게 임포트되었는지 확인
  checkFileContent(
    'src/App.tsx',
    'import AboutPage',
    'App.tsx에서 AboutPage 임포트'
  );
  
  checkFileContent(
    'src/App.tsx',
    'import ContactPage',
    'App.tsx에서 ContactPage 임포트'
  );
  
  checkFileContent(
    'src/App.tsx',
    'import SettingsPage',
    'App.tsx에서 SettingsPage 임포트'
  );
  
  checkFileContent(
    'src/App.tsx',
    'import NotFoundPage',
    'App.tsx에서 NotFoundPage 임포트'
  );
}

// UI/UX 최적화 확인
function checkUIOptimizations() {
  console.log(colors.bold('\n🎨 UI/UX 최적화 확인'));
  console.log('---------------------');
  
  // NotFoundPage에 적절한 사용자 경험 요소들이 있는지 확인
  checkFileContent(
    'src/pages/NotFoundPage.tsx',
    'getSuggestedPages',
    '404 페이지에 추천 페이지 기능 포함'
  );
  
  checkFileContent(
    'src/pages/NotFoundPage.tsx',
    'countdown',
    '404 페이지에 자동 리디렉션 기능 포함'
  );
  
  // ContactPage에 폼 및 연락처 정보가 있는지 확인
  checkFileContent(
    'src/pages/ContactPage.tsx',
    'ContactFormData',
    'Contact 페이지에 문의 폼 포함'
  );
  
  checkFileContent(
    'src/pages/ContactPage.tsx',
    'ContactMethod',
    'Contact 페이지에 연락 방법 정보 포함'
  );
  
  // SettingsPage에 테마 설정 등이 있는지 확인
  checkFileContent(
    'src/pages/SettingsPage.tsx',
    'useLinearTheme',
    'Settings 페이지에 테마 설정 포함'
  );
  
  checkFileContent(
    'src/pages/SettingsPage.tsx',
    'ToggleSetting',
    'Settings 페이지에 설정 토글 컴포넌트 포함'
  );
}

// 메인 테스트 실행
async function runTests() {
  console.log('테스트 시작 시간:', new Date().toLocaleString());
  
  // 각 테스트 카테고리 실행
  checkPageFiles();
  checkRouteConfiguration();
  checkNavigationMenus();
  checkDuplicateCleanup();
  checkBreadcrumbAndActiveState();
  checkComponentImports();
  checkUIOptimizations();
  
  // 결과 요약 출력
  console.log(colors.bold('\n📊 테스트 결과 요약'));
  console.log('==================');
  console.log(colors.green(`✅ 통과: ${testResults.passed}개`));
  console.log(colors.red(`❌ 실패: ${testResults.failed}개`));
  console.log(colors.yellow(`⚠️ 경고: ${testResults.warnings}개`));
  
  const totalTests = testResults.passed + testResults.failed + testResults.warnings;
  const successRate = totalTests > 0 ? ((testResults.passed / totalTests) * 100).toFixed(1) : 0;
  
  console.log(colors.bold(`\n성공률: ${successRate}%`));
  
  // 결과에 따른 메시지 출력
  if (testResults.failed === 0) {
    console.log(colors.bold(colors.green('\n🎉 모든 네비게이션 연결성 테스트 통과!')));
    console.log(colors.green('프론트엔드 네비게이션이 성공적으로 개선되었습니다.'));
  } else {
    console.log(colors.bold(colors.red('\n⚠️ 일부 테스트 실패')));
    console.log(colors.red('실패한 테스트들을 확인하고 수정이 필요합니다.'));
  }
  
  // 세부 결과를 파일로 저장
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      passed: testResults.passed,
      failed: testResults.failed,
      warnings: testResults.warnings,
      successRate: `${successRate}%`
    },
    details: testResults.details
  };
  
  fs.writeFileSync(
    path.resolve(__dirname, 'navigation-test-report.json'),
    JSON.stringify(reportData, null, 2)
  );
  
  console.log(colors.cyan('\n📋 상세 테스트 리포트가 navigation-test-report.json에 저장되었습니다.'));
  
  // 개선사항 제안
  console.log(colors.bold(colors.blue('\n💡 추가 개선사항 제안')));
  console.log('======================');
  console.log('• 모바일 반응형 네비게이션 테스트 추가');
  console.log('• E2E 테스트로 실제 사용자 플로우 검증');
  console.log('• 접근성(a11y) 테스트 추가');
  console.log('• 성능 최적화를 위한 코드 스플리팅 검증');
  console.log('• SEO 최적화를 위한 메타 태그 검증\n');
}

// 테스트 실행
runTests().catch(console.error);