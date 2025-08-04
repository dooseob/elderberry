/**
 * 로그인 시스템 500 에러 수정 검증 테스트
 * 
 * 문제: 프론트엔드에서 만료된 JWT 토큰이 로그인 요청에 포함되어 500 에러 발생
 * 해결: JWT 필터에서 공개 엔드포인트(/api/auth/login)를 올바르게 인식하도록 수정
 */

const axios = require('axios');

// 테스트 설정
const OLD_SERVER = 'http://localhost:8080';
const NEW_SERVER = 'http://localhost:8082';
const TEST_USER = {
  email: 'test.domestic@example.com',
  password: 'Password123!',
  rememberMe: false
};

async function testServer(serverUrl, serverName) {
  console.log(`\n🔍 ${serverName} 테스트 시작...`);
  
  try {
    // 1. 정상 로그인 (토큰 없음)
    const normalLogin = await axios.post(`${serverUrl}/api/auth/login`, TEST_USER, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log(`✅ 정상 로그인: ${normalLogin.status}`);
    
    // 2. 잘못된 토큰과 함께 로그인
    const tokenLogin = await axios.post(`${serverUrl}/api/auth/login`, TEST_USER, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token-example'
      }
    });
    console.log(`✅ 토큰 포함 로그인: ${tokenLogin.status}`);
    
    return { success: true, server: serverName };
    
  } catch (error) {
    const status = error.response?.status;
    const errorType = status === 500 ? '500 Internal Server Error' : `${status} Error`;
    console.log(`❌ ${serverName} 실패: ${errorType}`);
    return { success: false, server: serverName, error: errorType };
  }
}

async function runTests() {
  console.log('🚀 엘더베리 로그인 시스템 500 에러 수정 검증');
  console.log('=' .repeat(60));
  
  const results = [];
  
  // 구버전 서버 테스트 (8080)
  const oldResult = await testServer(OLD_SERVER, '구버전 서버 (8080)');
  results.push(oldResult);
  
  // 신버전 서버 테스트 (8082)  
  const newResult = await testServer(NEW_SERVER, '신버전 서버 (8082)');
  results.push(newResult);
  
  // 결과 분석
  console.log('\n📊 테스트 결과 분석');
  console.log('=' .repeat(60));
  
  results.forEach(result => {
    if (result.success) {
      console.log(`✅ ${result.server}: JWT 필터가 올바르게 작동`);
    } else {
      console.log(`❌ ${result.server}: ${result.error} (JWT 필터 문제)`);
    }
  });
  
  // 최종 결론
  const fixedServers = results.filter(r => r.success).length;
  console.log('\n🎯 최종 결론');
  console.log('=' .repeat(60));
  
  if (fixedServers > 0) {
    console.log('✅ JWT 필터 수정이 성공적으로 적용되었습니다!');
    console.log('✅ 만료된 토큰이 포함된 로그인 요청도 정상 처리됩니다.');
    
    if (fixedServers === 1) {
      console.log('⚠️  구버전 서버(8080)를 종료하고 신버전(8082)으로 전환하세요.');
    }
  } else {
    console.log('❌ JWT 필터 수정이 적용되지 않았습니다.');
    console.log('❌ 추가 디버깅이 필요합니다.');
  }
}

// 테스트 실행
runTests().catch(console.error);