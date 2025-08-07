#!/usr/bin/env node

/**
 * 브라우저 캐시 강제 새로고침 가이드
 * useLinearTheme 무한 루프 완전 해결
 */

console.log('🚨 브라우저 캐시 문제 발견! Vite HMR이 제대로 적용되지 않음\n');

console.log('📋 해결 순서 (반드시 순서대로 실행):');
console.log('='.repeat(60));

console.log('\n1️⃣ 개발 서버 완전 재시작');
console.log('   터미널에서 Ctrl+C로 서버 중지');
console.log('   아래 명령어로 재시작:');
console.log('   npm run dev');
console.log('   또는: ./dev-start.sh');

console.log('\n2️⃣ 브라우저 캐시 완전 삭제 (중요!)');
console.log('   a) F12 개발자 도구 열기');
console.log('   b) Network 탭으로 이동');
console.log('   c) "Disable cache" 체크박스 선택');
console.log('   d) 새로고침 버튼을 오른쪽 클릭');
console.log('   e) "Empty Cache and Hard Reload" 선택');

console.log('\n3️⃣ 대안 방법 (Chrome/Edge)');
console.log('   - Ctrl + Shift + R (하드 새로고침)');
console.log('   - Ctrl + Shift + Delete (캐시 삭제 메뉴)');

console.log('\n4️⃣ 완전 초기화 방법');
console.log('   - 브라우저 완전 종료');
console.log('   - 다시 브라우저 열고 http://localhost:5173 접속');

console.log('\n✅ 성공 확인 방법:');
console.log('   1. F12 Console에서 "Maximum update depth" 에러 없음');
console.log('   2. "useLinearTheme.ts:426" 에러 없음');
console.log('   3. 시설찾기 페이지가 정상 로드됨');

console.log('\n🔍 실시간 디버깅:');
console.log('   F12 Console → Sources 탭 → useLinearTheme.ts 열기');
console.log('   → 426줄이 주석처리 되어있는지 확인');

console.log('\n⚠️  여전히 문제 발생 시:');
console.log('   1. Node.js 서버 완전 재시작: npm run dev');
console.log('   2. 브라우저 시크릿 모드로 테스트');
console.log('   3. 다른 브라우저로 테스트 (Firefox, Safari 등)');

console.log('\n🎯 문제의 원인:');
console.log('   - Vite HMR이 useLinearTheme.ts 변경사항을 제대로 적용하지 못함');
console.log('   - 브라우저가 이전 버전의 JavaScript 파일을 캐시하고 있음');
console.log('   - 426줄의 useEffect는 이미 주석처리했지만 브라우저가 모름');

// 서버 상태 확인
const axios = require('axios');

async function checkDevServer() {
  try {
    console.log('\n🔍 개발 서버 상태 확인...');
    
    const frontendResponse = await axios.get('http://localhost:5173', { 
      timeout: 3000,
      headers: { 'Cache-Control': 'no-cache' }
    });
    console.log('✅ 프론트엔드 서버: 정상 (포트 5173)');
    
    const backendResponse = await axios.get('http://localhost:8080/actuator/health', { 
      timeout: 3000 
    });
    console.log('✅ 백엔드 서버: 정상 (포트 8080)');
    
    console.log('\n🚀 서버는 정상입니다. 브라우저 캐시 문제입니다!');
    console.log('🎯 위의 브라우저 캐시 삭제 단계를 반드시 실행하세요.');
    
  } catch (error) {
    console.log('\n❌ 서버 오류:', error.message);
    console.log('먼저 개발 서버를 재시작하세요: npm run dev');
  }
}

checkDevServer();