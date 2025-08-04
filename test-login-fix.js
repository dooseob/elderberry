/**
 * 엘더베리 로그인 통합 테스트 스크립트
 * 백엔드 API와 프론트엔드 로그인 플로우를 모두 테스트
 */

const axios = require('axios');

// 테스트 설정
const CONFIG = {
  backendUrl: 'http://localhost:8080',
  frontendUrl: 'http://localhost:5173',
  testAccount: {
    email: 'test.domestic@example.com',
    password: 'Password123!'
  }
};

// 색상 출력 함수
const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  magenta: (text) => `\x1b[35m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`
};

// 로그 함수
const log = {
  info: (msg) => console.log(colors.blue(`ℹ️  ${msg}`)),
  success: (msg) => console.log(colors.green(`✅ ${msg}`)),
  error: (msg) => console.log(colors.red(`❌ ${msg}`)),
  warning: (msg) => console.log(colors.yellow(`⚠️  ${msg}`)),
  step: (msg) => console.log(colors.magenta(`🔄 ${msg}`))
};

// 백엔드 헬스 체크
async function checkBackendHealth() {
  try {
    const response = await axios.get(`${CONFIG.backendUrl}/actuator/health`, {
      timeout: 5000
    });
    
    if (response.data.status === 'UP') {
      log.success('백엔드 서버 정상 동작 중');
      return true;
    } else {
      log.error(`백엔드 헬스 체크 실패: ${response.data.status}`);
      return false;
    }
  } catch (error) {
    log.error(`백엔드 연결 실패: ${error.message}`);
    return false;
  }
}

// 프론트엔드 서버 체크
async function checkFrontendHealth() {
  try {
    const response = await axios.get(CONFIG.frontendUrl, {
      timeout: 5000,
      validateStatus: () => true // 모든 상태 코드 허용
    });
    
    if (response.status === 200) {
      log.success('프론트엔드 서버 정상 동작 중');
      return true;
    } else {
      log.error(`프론트엔드 서버 응답 오류: ${response.status}`);
      return false;
    }
  } catch (error) {
    log.error(`프론트엔드 연결 실패: ${error.message}`);
    return false;
  }
}

// 백엔드 로그인 API 테스트
async function testBackendLogin() {
  try {
    log.step('백엔드 로그인 API 테스트 시작...');
    
    const response = await axios.post(
      `${CONFIG.backendUrl}/api/auth/login`,
      CONFIG.testAccount,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    
    if (response.status === 200 && response.data.accessToken) {
      log.success('백엔드 로그인 성공');
      log.info(`토큰 타입: ${response.data.tokenType}`);
      log.info(`사용자: ${response.data.member.name} (${response.data.member.email})`);
      log.info(`역할: ${response.data.member.role}`);
      
      return {
        success: true,
        token: response.data.accessToken,
        user: response.data.member
      };
    } else {
      log.error('백엔드 로그인 실패: 토큰이 없습니다');
      return { success: false };
    }
  } catch (error) {
    if (error.response) {
      log.error(`백엔드 로그인 실패: ${error.response.status} - ${error.response.data.message || error.response.statusText}`);
      console.log('응답 데이터:', error.response.data);
    } else {
      log.error(`백엔드 로그인 네트워크 오류: ${error.message}`);
    }
    return { success: false };
  }
}

// JWT 토큰으로 인증된 API 테스트
async function testAuthenticatedAPI(token) {
  try {
    log.step('인증된 API 엔드포인트 테스트...');
    
    const response = await axios.get(
      `${CONFIG.backendUrl}/api/auth/me`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    
    if (response.status === 200) {
      log.success('인증된 API 호출 성공');
      log.info(`사용자 ID: ${response.data.id}`);
      log.info(`이메일: ${response.data.email}`);
      return true;
    } else {
      log.error(`인증된 API 호출 실패: ${response.status}`);
      return false;
    }
  } catch (error) {
    if (error.response) {
      log.error(`인증된 API 실패: ${error.response.status} - ${error.response.data.message || error.response.statusText}`);
    } else {
      log.error(`인증된 API 네트워크 오류: ${error.message}`);
    }
    return false;
  }
}

// CORS 테스트
async function testCORS() {
  try {
    log.step('CORS 설정 테스트...');
    
    // OPTIONS 요청으로 CORS 확인
    const response = await axios.options(
      `${CONFIG.backendUrl}/api/auth/login`,
      {},
      {
        headers: {
          'Origin': CONFIG.frontendUrl,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        },
        timeout: 5000
      }
    );
    
    const corsHeaders = response.headers;
    
    if (corsHeaders['access-control-allow-origin']) {
      log.success('CORS 설정 정상');
      log.info(`허용된 Origin: ${corsHeaders['access-control-allow-origin']}`);
      log.info(`허용된 Methods: ${corsHeaders['access-control-allow-methods']}`);
      return true;
    } else {
      log.warning('CORS 헤더가 설정되지 않았습니다');
      return false;
    }
  } catch (error) {
    log.error(`CORS 테스트 실패: ${error.message}`);
    return false;
  }
}

// 환경변수 및 설정 확인
async function checkConfiguration() {
  log.step('환경 설정 확인...');
  
  // 환경변수는 브라우저에서만 접근 가능하므로 설정 파일 확인
  const fs = require('fs');
  const path = require('path');
  
  try {
    const envPath = path.join(__dirname, 'frontend', '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const apiBaseUrl = envContent.match(/VITE_API_BASE_URL=(.+)/);
    
    if (apiBaseUrl && apiBaseUrl[1].trim() === 'http://localhost:8080') {
      log.success('프론트엔드 API Base URL 설정 정상');
      return true;
    } else {
      log.warning(`API Base URL 설정: ${apiBaseUrl ? apiBaseUrl[1] : 'undefined'}`);
      return false;
    }
  } catch (error) {
    log.error(`환경 설정 확인 실패: ${error.message}`);
    return false;
  }
}

// 메인 테스트 실행
async function runTests() {
  console.log(colors.cyan('='.repeat(60)));
  console.log(colors.cyan('🚀 엘더베리 로그인 통합 테스트 시작'));
  console.log(colors.cyan('='.repeat(60)));
  
  const results = {
    backendHealth: false,
    frontendHealth: false,
    backendLogin: false,
    authenticatedAPI: false,
    cors: false,
    configuration: false
  };
  
  // 1. 서버 헬스 체크
  console.log('\n' + colors.magenta('📊 1. 서버 상태 확인'));
  results.backendHealth = await checkBackendHealth();
  results.frontendHealth = await checkFrontendHealth();
  
  // 백엔드가 실행 중이지 않으면 종료
  if (!results.backendHealth) {
    log.error('백엔드 서버가 실행되지 않았습니다. ./dev-start.sh를 실행하세요.');
    return;
  }
  
  // 2. 환경 설정 확인
  console.log('\n' + colors.magenta('⚙️  2. 환경 설정 확인'));
  results.configuration = await checkConfiguration();
  
  // 3. CORS 테스트
  console.log('\n' + colors.magenta('🌐 3. CORS 설정 테스트'));
  results.cors = await testCORS();
  
  // 4. 백엔드 로그인 테스트
  console.log('\n' + colors.magenta('🔐 4. 백엔드 로그인 API 테스트'));
  const loginResult = await testBackendLogin();
  results.backendLogin = loginResult.success;
  
  // 5. 인증된 API 테스트
  if (loginResult.success && loginResult.token) {
    console.log('\n' + colors.magenta('🔒 5. 인증된 API 엔드포인트 테스트'));
    results.authenticatedAPI = await testAuthenticatedAPI(loginResult.token);
  }
  
  // 결과 요약
  console.log('\n' + colors.cyan('='.repeat(60)));
  console.log(colors.cyan('📋 테스트 결과 요약'));
  console.log(colors.cyan('='.repeat(60)));
  
  const testItems = [
    { name: '백엔드 서버 상태', result: results.backendHealth },
    { name: '프론트엔드 서버 상태', result: results.frontendHealth },
    { name: '환경 설정', result: results.configuration },
    { name: 'CORS 설정', result: results.cors },
    { name: '백엔드 로그인 API', result: results.backendLogin },
    { name: '인증된 API 호출', result: results.authenticatedAPI }
  ];
  
  testItems.forEach(item => {
    const status = item.result ? colors.green('✅ 통과') : colors.red('❌ 실패');
    console.log(`${item.name}: ${status}`);
  });
  
  const passedTests = testItems.filter(item => item.result).length;
  const totalTests = testItems.length;
  
  console.log(colors.cyan('-'.repeat(60)));
  console.log(`전체 테스트: ${totalTests}개 중 ${colors.green(passedTests)}개 통과`);
  
  if (passedTests === totalTests) {
    console.log(colors.green('🎉 모든 테스트가 통과했습니다!'));
    console.log(colors.green('로그인 시스템이 정상적으로 작동합니다.'));
  } else {
    console.log(colors.yellow('⚠️  일부 테스트가 실패했습니다.'));
    console.log(colors.yellow('프론트엔드에서 실제 로그인을 시도해보세요.'));
  }
  
  console.log(colors.cyan('='.repeat(60)));
  
  // 문제 해결 방법 제시
  if (!results.backendLogin) {
    console.log('\n' + colors.yellow('💡 로그인 문제 해결 방법:'));
    console.log('1. H2 데이터베이스에서 테스트 사용자 확인: http://localhost:8080/h2-console');
    console.log('2. 백엔드 로그 확인: tail -f logs/backend.log');
    console.log('3. 프론트엔드 브라우저 콘솔에서 네트워크 탭 확인');
    console.log('4. CORS 에러가 있는지 브라우저 개발자 도구 확인');
  }
}

// 스크립트 실행
if (require.main === module) {
  runTests().catch(error => {
    log.error(`테스트 실행 중 오류: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runTests };