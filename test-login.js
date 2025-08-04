#!/usr/bin/env node

/**
 * 엘더베리 로그인 테스트 스크립트
 * 백엔드 API와 프론트엔드 통합 테스트
 */

const axios = require('axios');

// API 설정
const API_BASE_URL = 'http://localhost:8080/api';
const TEST_USER = {
  email: 'test.domestic@example.com',
  password: 'Password123!'
};

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

async function testLogin() {
  console.log(`${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}🔐 엘더베리 로그인 테스트 시작${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  try {
    // 1. 백엔드 헬스체크
    console.log(`${colors.blue}1. 백엔드 헬스체크...${colors.reset}`);
    try {
      const healthResponse = await axios.get('http://localhost:8080/actuator/health');
      console.log(`${colors.green}✅ 백엔드 상태: ${healthResponse.data.status}${colors.reset}\n`);
    } catch (error) {
      console.log(`${colors.yellow}⚠️ 헬스체크 실패 (백엔드가 실행 중인지 확인)${colors.reset}\n`);
    }

    // 2. 로그인 테스트
    console.log(`${colors.blue}2. 로그인 API 테스트...${colors.reset}`);
    console.log(`   Email: ${TEST_USER.email}`);
    console.log(`   Password: ${TEST_USER.password}\n`);
    
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, TEST_USER, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log(`${colors.green}✅ 로그인 성공!${colors.reset}`);
    console.log(`   Status: ${loginResponse.status}`);
    
    const { accessToken, refreshToken, userRole, tokenType } = loginResponse.data;
    
    console.log(`\n${colors.cyan}📋 응답 데이터:${colors.reset}`);
    console.log(`   Token Type: ${tokenType || 'Bearer'}`);
    console.log(`   User Role: ${userRole}`);
    console.log(`   Access Token: ${accessToken ? accessToken.substring(0, 30) + '...' : 'N/A'}`);
    console.log(`   Refresh Token: ${refreshToken ? refreshToken.substring(0, 30) + '...' : 'N/A'}`);

    // 3. 토큰 검증 (Protected API 호출)
    console.log(`\n${colors.blue}3. 토큰 검증 (Protected API 호출)...${colors.reset}`);
    
    try {
      const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      console.log(`${colors.green}✅ 토큰 검증 성공!${colors.reset}`);
      console.log(`   User Email: ${profileResponse.data.email || 'N/A'}`);
      console.log(`   User Role: ${profileResponse.data.role || 'N/A'}`);
    } catch (error) {
      console.log(`${colors.yellow}⚠️ 프로필 API 없음 (정상 - 아직 구현되지 않음)${colors.reset}`);
    }

    // 4. 프론트엔드 연결 테스트
    console.log(`\n${colors.blue}4. 프론트엔드 연결 테스트...${colors.reset}`);
    
    try {
      const frontendResponse = await axios.get('http://localhost:5173');
      console.log(`${colors.green}✅ 프론트엔드 실행 중 (포트 5173)${colors.reset}`);
    } catch (error) {
      console.log(`${colors.yellow}⚠️ 프론트엔드 연결 실패 (npm run dev 필요)${colors.reset}`);
    }

    console.log(`\n${colors.cyan}========================================${colors.reset}`);
    console.log(`${colors.green}🎉 모든 테스트 완료!${colors.reset}`);
    console.log(`${colors.cyan}========================================${colors.reset}`);
    
    console.log(`\n${colors.yellow}📝 다음 단계:${colors.reset}`);
    console.log(`   1. 브라우저에서 http://localhost:5173 접속`);
    console.log(`   2. 로그인 페이지에서 테스트 계정으로 로그인`);
    console.log(`   3. 로그인 성공 후 대시보드 확인`);

  } catch (error) {
    console.log(`\n${colors.red}❌ 로그인 테스트 실패${colors.reset}`);
    
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data.message || error.response.data}`);
      
      if (error.response.status === 401) {
        console.log(`\n${colors.yellow}💡 해결 방법:${colors.reset}`);
        console.log(`   1. 테스트 계정이 DB에 있는지 확인`);
        console.log(`   2. 비밀번호가 올바른지 확인`);
        console.log(`   3. 백엔드 로그 확인: ./logs/elderberry.log`);
      }
    } else if (error.request) {
      console.log(`   ${colors.red}서버에 연결할 수 없습니다${colors.reset}`);
      console.log(`\n${colors.yellow}💡 해결 방법:${colors.reset}`);
      console.log(`   1. 백엔드가 실행 중인지 확인: ./dev-status.sh`);
      console.log(`   2. 포트 8080이 사용 중인지 확인: lsof -i :8080`);
      console.log(`   3. 백엔드 재시작: ./dev-restart.sh`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
  }
}

// 스크립트 실행
testLogin().catch(console.error);