#!/usr/bin/env node

/**
 * 로그인 후 리다이렉트 플로우 테스트
 * import 경로 수정 후 정상 작동 확인
 */

const axios = require('axios');
const colors = require('colors');

const API_BASE_URL = 'http://localhost:8080/api';
const FRONTEND_URL = 'http://localhost:5173';

// 테스트 계정
const TEST_CREDENTIALS = {
  email: 'test.domestic@example.com',
  password: 'Password123!'
};

async function testLoginAndRedirect() {
  console.log(colors.cyan('\n=== 로그인 후 리다이렉트 테스트 시작 ===\n'));

  try {
    // 1. 로그인 테스트
    console.log(colors.yellow('1. 로그인 API 테스트...'));
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, TEST_CREDENTIALS);
    
    console.log(colors.green('✓ 로그인 성공'));
    console.log(colors.gray(`  - 전체 응답: ${JSON.stringify(loginResponse.data, null, 2)}`));
    
    const accessToken = loginResponse.data.accessToken || loginResponse.data.token;
    if (accessToken) {
      console.log(colors.gray(`  - 토큰: ${accessToken.substring(0, 20)}...`));
    }
    
    if (loginResponse.data.user) {
      console.log(colors.gray(`  - 사용자: ${loginResponse.data.user.name} (${loginResponse.data.user.role})`));
    }

    // 2. 대시보드 페이지 접근 테스트
    console.log(colors.yellow('\n2. 대시보드 페이지 접근 테스트...'));
    try {
      const dashboardResponse = await axios.get(`${FRONTEND_URL}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        maxRedirects: 0, // 리다이렉트 방지
        validateStatus: (status) => status < 500 // 4xx 응답도 성공으로 처리
      });
      
      console.log(colors.green('✓ 대시보드 페이지 접근 가능'));
      console.log(colors.gray(`  - 상태 코드: ${dashboardResponse.status}`));
    } catch (error) {
      if (error.response && error.response.status === 302) {
        console.log(colors.yellow('⚠ 리다이렉트 발생'));
        console.log(colors.gray(`  - Location: ${error.response.headers.location}`));
      } else {
        console.log(colors.red('✗ 대시보드 페이지 접근 실패'));
        console.log(colors.gray(`  - 에러: ${error.message}`));
      }
    }

    // 3. 시설 검색 페이지 접근 테스트
    console.log(colors.yellow('\n3. 시설 검색 페이지 접근 테스트...'));
    try {
      const facilityResponse = await axios.get(`${FRONTEND_URL}/facility-search`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        maxRedirects: 0,
        validateStatus: (status) => status < 500
      });
      
      console.log(colors.green('✓ 시설 검색 페이지 접근 가능'));
      console.log(colors.gray(`  - 상태 코드: ${facilityResponse.status}`));
    } catch (error) {
      if (error.response && error.response.status === 302) {
        console.log(colors.yellow('⚠ 리다이렉트 발생'));
        console.log(colors.gray(`  - Location: ${error.response.headers.location}`));
      } else {
        console.log(colors.red('✗ 시설 검색 페이지 접근 실패'));
        console.log(colors.gray(`  - 에러: ${error.message}`));
      }
    }

    // 4. 프론트엔드 서버 상태 확인
    console.log(colors.yellow('\n4. 프론트엔드 서버 상태 확인...'));
    try {
      const healthResponse = await axios.get(`${FRONTEND_URL}`, {
        timeout: 5000
      });
      console.log(colors.green('✓ 프론트엔드 서버 정상 작동'));
      console.log(colors.gray(`  - 상태 코드: ${healthResponse.status}`));
    } catch (error) {
      console.log(colors.red('✗ 프론트엔드 서버 응답 없음'));
      console.log(colors.gray(`  - 에러: ${error.message}`));
    }

    console.log(colors.cyan('\n=== 테스트 완료 ===\n'));
    
    // 권장사항
    console.log(colors.magenta('권장사항:'));
    console.log(colors.gray('1. Vite 개발 서버 재시작: npm run dev'));
    console.log(colors.gray('2. 브라우저 캐시 삭제 (Ctrl+Shift+Delete)'));
    console.log(colors.gray('3. 브라우저에서 직접 로그인 테스트'));
    console.log(colors.gray('4. 개발자 도구 Network 탭에서 실패한 요청 확인'));

  } catch (error) {
    console.error(colors.red('\n✗ 테스트 중 오류 발생:'), error.message);
    if (error.response) {
      console.error(colors.gray('응답 데이터:'), error.response.data);
    }
  }
}

// 테스트 실행
testLoginAndRedirect();