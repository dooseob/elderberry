/**
 * 엘더베리 백엔드 API 완전성 검증 도구
 * 모든 API 엔드포인트 테스트 및 상태 확인
 * 
 * 사용법:
 * node api-test-suite.js
 * 
 * @version 1.0.0
 * @author MaxModeAgent
 */

import axios from 'axios';
import chalk from 'chalk';

const BASE_URL = 'http://localhost:8080';
const API_BASE = `${BASE_URL}/api`;

// 테스트용 사용자 계정
const TEST_USER = {
  email: 'test.domestic@example.com',
  password: 'Password123!'
};

// 전역 인증 토큰
let authToken = null;
let refreshToken = null;

/**
 * API 엔드포인트 정의
 */
const API_ENDPOINTS = {
  // 헬스체크
  health: [
    { method: 'GET', path: '/actuator/health', auth: false, description: '서버 상태 확인' }
  ],
  
  // 인증 관련
  auth: [
    { method: 'POST', path: '/api/auth/register', auth: false, description: '회원가입', 
      data: { email: 'test@example.com', password: 'Test123!', name: '테스트', phoneNumber: '010-1234-5678' } },
    { method: 'POST', path: '/api/auth/login', auth: false, description: '로그인', 
      data: { email: TEST_USER.email, password: TEST_USER.password } },
    { method: 'POST', path: '/api/auth/refresh', auth: true, description: '토큰 갱신' },
    { method: 'POST', path: '/api/auth/logout', auth: true, description: '로그아웃' },
    { method: 'GET', path: '/api/auth/me', auth: true, description: '내 정보 조회' }
  ],
  
  // 회원 관리
  members: [
    { method: 'GET', path: '/api/members/profile', auth: true, description: '프로필 조회' },
    { method: 'PUT', path: '/api/members/profile', auth: true, description: '프로필 수정' },
    { method: 'DELETE', path: '/api/members/account', auth: true, description: '회원 탈퇴' }
  ],
  
  // 시설 관련
  facilities: [
    { method: 'GET', path: '/api/facilities', auth: false, description: '시설 목록 조회' },
    { method: 'GET', path: '/api/facilities/search', auth: false, description: '시설 검색',
      params: { keyword: '요양원', region: '서울' } },
    { method: 'POST', path: '/api/facilities/recommendations', auth: true, description: 'AI 추천' },
    { method: 'GET', path: '/api/facilities/1', auth: false, description: '시설 상세 조회' }
  ],
  
  // 건강평가
  health_assessment: [
    { method: 'POST', path: '/api/health/assessments', auth: true, description: '건강평가 생성' },
    { method: 'GET', path: '/api/health/assessments', auth: true, description: '건강평가 목록' },
    { method: 'GET', path: '/api/health/assessments/1', auth: true, description: '건강평가 상세' }
  ],
  
  // 게시판
  boards: [
    { method: 'GET', path: '/api/boards', auth: false, description: '게시판 목록' },
    { method: 'GET', path: '/api/boards/1/posts', auth: false, description: '게시글 목록' },
    { method: 'POST', path: '/api/boards/1/posts', auth: true, description: '게시글 작성' }
  ],
  
  // 구인구직
  jobs: [
    { method: 'GET', path: '/api/jobs', auth: false, description: '구인구직 목록' },
    { method: 'POST', path: '/api/jobs', auth: true, description: '구인구직 등록' },
    { method: 'GET', path: '/api/jobs/1', auth: false, description: '구인구직 상세' }
  ],
  
  // 알림
  notifications: [
    { method: 'GET', path: '/api/notifications', auth: true, description: '알림 목록' },
    { method: 'PUT', path: '/api/notifications/1/read', auth: true, description: '알림 읽음 처리' }
  ],
  
  // 채팅
  chat: [
    { method: 'GET', path: '/api/chat/rooms', auth: true, description: '채팅방 목록' },
    { method: 'POST', path: '/api/chat/rooms', auth: true, description: '채팅방 생성' }
  ],
  
  // 챗봇
  chatbot: [
    { method: 'POST', path: '/api/chatbot/chat', auth: false, description: '챗봇 대화' }
  ]
};

/**
 * HTTP 요청 보내기
 */
async function makeRequest(endpoint) {
  try {
    const config = {
      method: endpoint.method,
      url: endpoint.path.startsWith('/api') ? `${BASE_URL}${endpoint.path}` : `${BASE_URL}${endpoint.path}`,
      timeout: 5000,
      headers: {}
    };

    // 인증이 필요한 경우 토큰 추가
    if (endpoint.auth && authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }

    // POST/PUT 요청에 데이터 추가
    if (endpoint.data && (endpoint.method === 'POST' || endpoint.method === 'PUT')) {
      config.data = endpoint.data;
      config.headers['Content-Type'] = 'application/json';
    }

    // GET 요청에 쿼리 파라미터 추가
    if (endpoint.params && endpoint.method === 'GET') {
      config.params = endpoint.params;
    }

    const response = await axios(config);
    return {
      success: true,
      status: response.status,
      data: response.data,
      headers: response.headers
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status || 0,
      error: error.message,
      details: error.response?.data
    };
  }
}

/**
 * 로그인 실행
 */
async function login() {
  console.log(chalk.yellow('🔐 로그인 시도...'));
  
  const loginEndpoint = {
    method: 'POST',
    path: '/api/auth/login',
    data: TEST_USER
  };
  
  const result = await makeRequest(loginEndpoint);
  
  if (result.success) {
    authToken = result.data.accessToken || result.data.token;
    refreshToken = result.data.refreshToken;
    console.log(chalk.green('✅ 로그인 성공'));
    return true;
  } else {
    console.log(chalk.red('❌ 로그인 실패:'), result.error);
    return false;
  }
}

/**
 * 단일 엔드포인트 테스트
 */
async function testEndpoint(category, endpoint) {
  const result = await makeRequest(endpoint);
  
  const statusColor = result.success ? 
    (result.status < 300 ? chalk.green : chalk.yellow) : 
    chalk.red;
  
  const statusText = result.success ? `${result.status}` : `${result.status || 'ERR'}`;
  const methodText = endpoint.method.padEnd(6);
  const pathText = endpoint.path.padEnd(40);
  
  console.log(
    `  ${methodText} ${pathText} ${statusColor(statusText.padEnd(3))} ${endpoint.description}`
  );
  
  // 에러 상세 정보 (400번대, 500번대 에러만)
  if (!result.success && result.status >= 400) {
    if (result.details) {
      console.log(chalk.gray(`    └─ ${JSON.stringify(result.details)}`));
    }
  }
  
  return result;
}

/**
 * 카테고리별 API 테스트
 */
async function testCategory(categoryName, endpoints) {
  console.log(chalk.blue(`\n📁 ${categoryName.toUpperCase()} APIs`));
  console.log('─'.repeat(80));
  
  let successCount = 0;
  let totalCount = endpoints.length;
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(categoryName, endpoint);
    if (result.success) successCount++;
    
    // 로그인 성공 시 토큰 저장
    if (endpoint.path === '/api/auth/login' && result.success) {
      authToken = result.data.accessToken || result.data.token;
      refreshToken = result.data.refreshToken;
    }
    
    // 요청 간격 (서버 부하 방지)
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  const successRate = (successCount / totalCount * 100).toFixed(1);
  const rateColor = successRate >= 80 ? chalk.green : successRate >= 60 ? chalk.yellow : chalk.red;
  
  console.log(rateColor(`\n  📊 성공률: ${successCount}/${totalCount} (${successRate}%)`));
  
  return { successCount, totalCount, successRate: parseFloat(successRate) };
}

/**
 * 전체 API 테스트 실행
 */
async function runAllTests() {
  console.log(chalk.cyan.bold('🚀 엘더베리 백엔드 API 완전성 검증 시작'));
  console.log(chalk.gray(`🔗 Base URL: ${BASE_URL}`));
  console.log('='.repeat(80));
  
  const startTime = Date.now();
  const results = {};
  let totalSuccess = 0;
  let totalRequests = 0;
  
  // 1. 헬스체크부터 시작
  for (const [categoryName, endpoints] of Object.entries(API_ENDPOINTS)) {
    const result = await testCategory(categoryName, endpoints);
    results[categoryName] = result;
    totalSuccess += result.successCount;
    totalRequests += result.totalCount;
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  const overallSuccessRate = (totalSuccess / totalRequests * 100).toFixed(1);
  
  // 전체 결과 요약
  console.log(chalk.cyan.bold('\n📈 전체 테스트 결과 요약'));
  console.log('='.repeat(80));
  
  for (const [category, result] of Object.entries(results)) {
    const rateColor = result.successRate >= 80 ? chalk.green : result.successRate >= 60 ? chalk.yellow : chalk.red;
    console.log(`${category.padEnd(20)} ${rateColor(`${result.successCount.toString().padStart(2)}/${result.totalCount} (${result.successRate.toString().padStart(5)}%)`)}`);
  }
  
  console.log('─'.repeat(80));
  const overallColor = parseFloat(overallSuccessRate) >= 80 ? chalk.green : parseFloat(overallSuccessRate) >= 60 ? chalk.yellow : chalk.red;
  console.log(overallColor.bold(`전체 성공률: ${totalSuccess}/${totalRequests} (${overallSuccessRate}%)`));
  console.log(chalk.gray(`소요 시간: ${duration}초`));
  
  // 권장사항
  console.log(chalk.cyan.bold('\n💡 권장사항'));
  console.log('─'.repeat(50));
  
  if (parseFloat(overallSuccessRate) >= 90) {
    console.log(chalk.green('✅ 모든 핵심 API가 정상 작동하고 있습니다!'));
  } else if (parseFloat(overallSuccessRate) >= 70) {
    console.log(chalk.yellow('⚠️  일부 API에서 문제가 발견되었습니다. 상세 로그를 확인하세요.'));
  } else {
    console.log(chalk.red('❌ 다수의 API에서 문제가 발견되었습니다. 백엔드 서버 상태를 점검하세요.'));
  }
  
  console.log('\n🔧 문제 해결 방법:');
  console.log('  1. 백엔드 서버가 실행 중인지 확인: http://localhost:8080/actuator/health');
  console.log('  2. 데이터베이스 연결 상태 확인');
  console.log('  3. 테스트 계정 생성: POST /api/auth/register');
  console.log('  4. JWT 토큰 유효성 확인');
  
  return results;
}

/**
 * 개별 API 테스트 도구
 */
async function testSingleAPI(method, path, auth = false, data = null) {
  console.log(chalk.cyan(`🧪 단일 API 테스트: ${method} ${path}`));
  
  if (auth && !authToken) {
    const loginSuccess = await login();
    if (!loginSuccess) {
      console.log(chalk.red('❌ 인증이 필요하지만 로그인에 실패했습니다.'));
      return;
    }
  }
  
  const endpoint = { method, path, auth, data };
  const result = await makeRequest(endpoint);
  
  console.log(chalk.gray('─'.repeat(50)));
  console.log(`상태: ${result.success ? chalk.green('성공') : chalk.red('실패')}`);
  console.log(`HTTP 상태 코드: ${result.status}`);
  
  if (result.success && result.data) {
    console.log('응답 데이터:');
    console.log(JSON.stringify(result.data, null, 2));
  } else if (result.error) {
    console.log(chalk.red('에러:'), result.error);
    if (result.details) {
      console.log(chalk.red('상세:'), JSON.stringify(result.details, null, 2));
    }
  }
}

// CLI 실행부
const args = process.argv.slice(2);

if (args.length === 0) {
  // 전체 테스트 실행
  runAllTests().catch(console.error);
} else if (args[0] === 'single' && args.length >= 3) {
  // 단일 API 테스트: node api-test-suite.js single GET /api/auth/me true
  const [, method, path, authRequired] = args;
  testSingleAPI(method.toUpperCase(), path, authRequired === 'true').catch(console.error);
} else {
  console.log(chalk.yellow('사용법:'));
  console.log('  전체 테스트: node api-test-suite.js');
  console.log('  단일 테스트: node api-test-suite.js single GET /api/auth/me true');
}

export { testSingleAPI, runAllTests, API_ENDPOINTS };