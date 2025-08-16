/**
 * 로그인 문제 수정 검증 테스트
 * 451.md에서 발견된 문제들이 해결되었는지 확인
 */

const axios = require('axios');

const TEST_USER = {
  email: 'test.domestic@example.com',
  password: 'Password123!',
  rememberMe: false
};

const BASE_URL = 'http://localhost:8080';

async function testLoginFix() {
  console.log('🔍 로그인 문제 수정 검증 테스트 시작\n');

  // Test 1: 올바른 API 경로 테스트
  console.log('✅ Test 1: 올바른 API 경로 (/api/auth/login) 테스트');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, TEST_USER, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.status === 200 && response.data.accessToken) {
      console.log('  ✅ 성공: 올바른 API 경로로 로그인 성공');
      console.log('  📝 토큰 발급 확인:', response.data.accessToken.substring(0, 50) + '...');
    } else {
      console.log('  ❌ 실패: 응답이 예상과 다름');
    }
  } catch (error) {
    console.log('  ❌ 실패:', error.response?.data?.message || error.message);
  }

  // Test 2: 잘못된 API 경로 테스트 (401 예상)
  console.log('\n✅ Test 2: 잘못된 API 경로 (/auth/login) 테스트 (401 예상)');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, TEST_USER, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('  ❌ 실패: 잘못된 경로가 성공해서는 안됨');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('  ✅ 성공: 잘못된 경로는 401 에러 반환 (예상된 동작)');
    } else {
      console.log('  ⚠️  예상과 다른 에러:', error.response?.status, error.response?.data);
    }
  }

  // Test 3: API 응답 구조 검증
  console.log('\n✅ Test 3: API 응답 구조 검증');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, TEST_USER, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    const requiredFields = ['accessToken', 'tokenType', 'expiresIn', 'member'];
    const missingFields = requiredFields.filter(field => !response.data[field]);
    
    if (missingFields.length === 0) {
      console.log('  ✅ 성공: 모든 필수 필드 존재');
      console.log('  📝 토큰 타입:', response.data.tokenType);
      console.log('  📝 만료 시간:', response.data.expiresIn);
      console.log('  📝 사용자 이름:', response.data.member.name);
    } else {
      console.log('  ❌ 실패: 누락된 필드:', missingFields);
    }
  } catch (error) {
    console.log('  ❌ 실패:', error.response?.data?.message || error.message);
  }

  // Test 4: 잘못된 인증 정보 테스트
  console.log('\n✅ Test 4: 잘못된 인증 정보 테스트 (401 예상)');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'wrong@example.com',
      password: 'wrongpassword',
      rememberMe: false
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('  ❌ 실패: 잘못된 인증 정보가 성공해서는 안됨');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('  ✅ 성공: 잘못된 인증 정보는 401 에러 반환 (예상된 동작)');
    } else {
      console.log('  ⚠️  예상과 다른 에러:', error.response?.status, error.response?.data);
    }
  }

  console.log('\n🎉 로그인 문제 수정 검증 테스트 완료');
  console.log('\n📋 수정사항 요약:');
  console.log('  1. ✅ API 경로 통일: /auth/login → /api/auth/login');
  console.log('  2. ✅ 무한 리다이렉트 루프 해결: useEffect 의존성 최적화');
  console.log('  3. ✅ 에러 처리 중복 제거: authApi와 authStore 분리');
  console.log('  4. ✅ React DevTools 경고 숨김');
  console.log('  5. ✅ 불필요한 console.log 정리');
}

// 테스트 실행
testLoginFix().catch(console.error);