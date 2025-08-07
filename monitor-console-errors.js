#!/usr/bin/env node

/**
 * 브라우저 콘솔 에러 모니터링을 위한 가이드
 * 실제 사용자가 직접 브라우저에서 확인할 수 있도록 도움
 */

console.log('🔍 시설찾기 콘솔 에러 모니터링 가이드\n');

console.log('📱 브라우저에서 직접 테스트하세요:');
console.log('='.repeat(50));

console.log('\n1️⃣ 브라우저 접속');
console.log('   URL: http://localhost:5173');

console.log('\n2️⃣ 개발자 도구 열기');
console.log('   - Chrome/Edge: F12 또는 Ctrl+Shift+I');
console.log('   - Firefox: F12 또는 Ctrl+Shift+K');
console.log('   - Safari: Cmd+Option+I');

console.log('\n3️⃣ Console 탭 확인');
console.log('   - 빨간색 에러 메시지 확인');
console.log('   - "Maximum update depth exceeded" 검색');

console.log('\n4️⃣ 테스트 시나리오');
console.log('   a) 메인 페이지 로딩 (에러 없어야 함)');
console.log('   b) 로그인: test.domestic@example.com / Password123!');
console.log('   c) 시설찾기 메뉴 클릭');
console.log('   d) 콘솔에서 무한 루프 에러 확인');

console.log('\n✅ 성공 조건:');
console.log('   - "Maximum update depth exceeded" 에러 없음');
console.log('   - 시설찾기 페이지 정상 로딩');
console.log('   - 검색 기능 정상 동작');

console.log('\n❌ 실패 조건:');
console.log('   - 빨간색 React 에러 메시지');
console.log('   - 페이지가 빈 화면으로 표시');
console.log('   - 무한 렌더링으로 브라우저 느려짐');

console.log('\n🔧 에러 발견 시 해결 방법:');
console.log('   1. 페이지 새로고침 (Ctrl+F5)');
console.log('   2. 브라우저 캐시 삭제');
console.log('   3. 개발 서버 재시작: ./dev-restart.sh');

console.log('\n📊 실시간 서버 상태 확인:');

// 서버 상태 확인
const axios = require('axios');

async function checkServers() {
  try {
    // 프론트엔드 확인
    const frontendCheck = await axios.get('http://localhost:5173', { timeout: 3000 });
    console.log('   ✅ 프론트엔드: 정상 (http://localhost:5173)');
    
    // 백엔드 확인  
    const backendCheck = await axios.get('http://localhost:8080/actuator/health', { timeout: 3000 });
    console.log('   ✅ 백엔드: 정상 (http://localhost:8080)');
    
    console.log('\n🚀 모든 서버가 정상 동작 중입니다!');
    console.log('   브라우저에서 위 가이드를 따라 테스트해보세요.');
    
  } catch (error) {
    console.log('   ❌ 서버 연결 실패:', error.message);
    console.log('   ./dev-restart.sh로 서버를 재시작해보세요.');
  }
}

checkServers();