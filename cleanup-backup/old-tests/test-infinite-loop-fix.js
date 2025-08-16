#!/usr/bin/env node

/**
 * useLinearTheme 무한 루프 수정 검증
 */

console.log('🔧 useLinearTheme 무한 루프 수정 검증\n');

console.log('✅ 적용된 수정사항:');
console.log('   - useEffect에서 세션 통계 업데이트 완전 비활성화');
console.log('   - 무한 루프 발생 코드 주석 처리');
console.log('   - 안전한 기본값으로 대체');

console.log('\n📱 브라우저 테스트 가이드:');
console.log('='.repeat(50));

console.log('\n1️⃣ 브라우저 접속');
console.log('   URL: http://localhost:5173');

console.log('\n2️⃣ 개발자 도구 열기 (F12)');
console.log('   - Console 탭으로 이동');
console.log('   - 기존 로그 Clear 버튼 클릭');

console.log('\n3️⃣ 테스트 실행');
console.log('   a) 메인 페이지 새로고침 (Ctrl+F5)');
console.log('   b) 로그인: test.domestic@example.com / Password123!');
console.log('   c) 시설찾기 메뉴 클릭');
console.log('   d) 3초간 콘솔 에러 모니터링');

console.log('\n✅ 성공 조건:');
console.log('   - "Maximum update depth exceeded" 에러 없음');
console.log('   - "useLinearTheme.ts:426" 에러 없음');
console.log('   - 페이지가 정상적으로 렌더링됨');
console.log('   - CPU 사용률이 급증하지 않음');

console.log('\n❌ 여전히 문제 발생 시:');
console.log('   1. 하드 새로고침: Ctrl+Shift+R');
console.log('   2. 브라우저 캐시 완전 삭제');
console.log('   3. 개발 서버 재시작: ./dev-restart.sh');
console.log('   4. 브라우저 완전 재시작');

// 서버 상태 확인
const axios = require('axios');

async function checkStatus() {
  try {
    const response = await axios.get('http://localhost:5173', { timeout: 3000 });
    console.log('\n🚀 프론트엔드 서버: 정상 동작');
    
    const backendResponse = await axios.get('http://localhost:8080/actuator/health', { timeout: 3000 });
    console.log('🚀 백엔드 서버: 정상 동작');
    
    console.log('\n🎯 모든 서버가 정상입니다. 브라우저에서 테스트해보세요!');
    
  } catch (error) {
    console.log('\n❌ 서버 연결 실패:', error.message);
  }
}

checkStatus();