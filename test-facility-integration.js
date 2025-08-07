#!/usr/bin/env node

/**
 * 엘더베리 시설찾기 통합 테스트 스크립트
 * 지도 API + 공공데이터 API + 프론트엔드-백엔드 연동 테스트
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 설정
const config = {
  backendUrl: 'http://localhost:8080/api',
  frontendUrl: 'http://localhost:5173',
  timeout: 10000,
  testToken: null // JWT 토큰 (실제 로그인 후 설정)
};

// 테스트 결과 저장
const testResults = {
  timestamp: new Date().toISOString(),
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  results: []
};

// 테스트 유틸리티
const test = async (name, testFn) => {
  console.log(`🧪 테스트: ${name}`);
  testResults.totalTests++;
  
  try {
    const start = Date.now();
    await testFn();
    const duration = Date.now() - start;
    
    console.log(`✅ 통과 (${duration}ms)`);
    testResults.passedTests++;
    testResults.results.push({
      name,
      status: 'PASS',
      duration,
      error: null
    });
  } catch (error) {
    console.error(`❌ 실패: ${error.message}`);
    testResults.failedTests++;
    testResults.results.push({
      name,
      status: 'FAIL',
      duration: 0,
      error: error.message
    });
  }
  
  console.log('');
};

// API 클라이언트 설정
const apiClient = axios.create({
  baseURL: config.backendUrl,
  timeout: config.timeout,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 인증 토큰 설정
if (config.testToken) {
  apiClient.defaults.headers.Authorization = `Bearer ${config.testToken}`;
}

// 에러 처리
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      throw new Error(`HTTP ${error.response.status}: ${error.response.data?.message || '서버 오류'}`);
    } else if (error.request) {
      throw new Error('네트워크 연결 오류 - 백엔드 서버가 실행 중인지 확인하세요');
    } else {
      throw new Error(error.message);
    }
  }
);

// 메인 테스트 함수들
async function testBackendHealth() {
  const response = await apiClient.get('/health');
  if (response.status !== 200) {
    throw new Error('백엔드 서버 Health Check 실패');
  }
}

async function testFacilitySearch() {
  const response = await apiClient.get('/facilities/search', {
    params: {
      keyword: '서울',
      size: 5
    }
  });
  
  if (!response.data || !Array.isArray(response.data.content)) {
    throw new Error('검색 응답 형식이 올바르지 않습니다');
  }
  
  if (response.data.content.length === 0) {
    console.warn('⚠️  검색 결과가 없습니다. 공공데이터 API 키를 확인하세요.');
  }
}

async function testMapBasedSearch() {
  const response = await apiClient.get('/facilities/search/map', {
    params: {
      neLat: 37.6,
      neLng: 127.1,
      swLat: 37.5,
      swLng: 126.9
    }
  });
  
  if (!response.data || typeof response.data.totalCount !== 'number') {
    throw new Error('지도 검색 응답 형식이 올바르지 않습니다');
  }
}

async function testFacilityDetail() {
  // 임시 시설 ID로 테스트 (실제로는 검색 결과에서 ID를 가져와야 함)
  try {
    const response = await apiClient.get('/facilities/1/detail');
    
    if (!response.data || !response.data.facilityName) {
      throw new Error('시설 상세 정보 응답 형식이 올바르지 않습니다');
    }
  } catch (error) {
    if (error.message.includes('404')) {
      console.warn('⚠️  테스트용 시설 데이터가 없습니다. 실제 시설 ID가 필요합니다.');
    } else {
      throw error;
    }
  }
}

async function testRecommendations() {
  const response = await apiClient.get('/facilities/recommendations', {
    params: {
      limit: 3
    }
  });
  
  if (!response.data || !Array.isArray(response.data)) {
    throw new Error('추천 시설 응답 형식이 올바르지 않습니다');
  }
}

async function testEnvironmentVariables() {
  // 환경변수 파일 확인
  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, '.env.example');
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      throw new Error('.env 파일이 없습니다. .env.example을 복사하여 .env 파일을 생성하세요.');
    } else {
      throw new Error('.env.example 파일도 없습니다.');
    }
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // 필수 환경변수 확인
  const requiredVars = [
    'REACT_APP_KAKAO_MAP_API_KEY',
    'PUBLIC_DATA_API_KEY'
  ];
  
  const missingVars = requiredVars.filter(varName => {
    const pattern = new RegExp(`${varName}=(.+)`);
    const match = envContent.match(pattern);
    return !match || match[1].includes('your-') || match[1].includes('key-here');
  });
  
  if (missingVars.length > 0) {
    throw new Error(`다음 환경변수를 실제 값으로 설정하세요: ${missingVars.join(', ')}`);
  }
}

async function testFrontendBuild() {
  const frontendPath = path.join(__dirname, 'frontend');
  const packageJsonPath = path.join(frontendPath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('프론트엔드 package.json을 찾을 수 없습니다');
  }
  
  // 필수 의존성 확인
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const requiredDeps = ['react', '@tanstack/react-query', 'axios'];
  
  const missingDeps = requiredDeps.filter(dep => 
    !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
  );
  
  if (missingDeps.length > 0) {
    throw new Error(`필수 의존성이 없습니다: ${missingDeps.join(', ')}`);
  }
}

async function testApiIntegration() {
  // 통합 시나리오 테스트: 검색 → 상세보기 → 추천
  const searchResponse = await apiClient.get('/facilities/search', {
    params: { keyword: '요양', size: 1 }
  });
  
  if (searchResponse.data.content.length > 0) {
    const facility = searchResponse.data.content[0];
    
    // 상세 정보 조회
    try {
      await apiClient.get(`/facilities/${facility.facilityId}/detail`);
    } catch (error) {
      if (!error.message.includes('404')) {
        throw error;
      }
    }
    
    // 관련 추천 조회
    await apiClient.get('/facilities/recommendations');
  }
}

// 성능 테스트
async function testPerformance() {
  const startTime = Date.now();
  
  // 동시에 여러 요청 실행
  const promises = [
    apiClient.get('/facilities/search?size=10'),
    apiClient.get('/facilities/recommendations?limit=5'),
    apiClient.get('/facilities/search/map?neLat=37.6&neLng=127.1&swLat=37.5&swLng=126.9')
  ];
  
  await Promise.all(promises);
  
  const duration = Date.now() - startTime;
  
  if (duration > 5000) {
    throw new Error(`응답 시간이 너무 길습니다: ${duration}ms (5초 초과)`);
  }
  
  console.log(`⚡ 성능: ${duration}ms (3개 동시 요청)`);
}

// 메인 테스트 실행
async function runTests() {
  console.log('🚀 엘더베리 시설찾기 통합 테스트 시작\n');
  console.log(`백엔드 URL: ${config.backendUrl}`);
  console.log(`프론트엔드 URL: ${config.frontendUrl}\n`);
  
  // 환경 설정 테스트
  await test('환경변수 설정 확인', testEnvironmentVariables);
  await test('프론트엔드 빌드 설정 확인', testFrontendBuild);
  
  // 백엔드 API 테스트
  await test('백엔드 서버 상태 확인', testBackendHealth);
  await test('시설 통합 검색 API', testFacilitySearch);
  await test('지도 기반 검색 API', testMapBasedSearch);
  await test('시설 상세 정보 API', testFacilityDetail);
  await test('AI 추천 시설 API', testRecommendations);
  
  // 통합 테스트
  await test('API 통합 시나리오', testApiIntegration);
  await test('성능 테스트', testPerformance);
  
  // 결과 출력
  console.log('📊 테스트 결과 요약');
  console.log('='.repeat(50));
  console.log(`총 테스트: ${testResults.totalTests}`);
  console.log(`통과: ${testResults.passedTests} ✅`);
  console.log(`실패: ${testResults.failedTests} ❌`);
  console.log(`성공률: ${((testResults.passedTests / testResults.totalTests) * 100).toFixed(1)}%`);
  console.log('');
  
  // 실패한 테스트 상세 정보
  const failedTests = testResults.results.filter(r => r.status === 'FAIL');
  if (failedTests.length > 0) {
    console.log('❌ 실패한 테스트들:');
    failedTests.forEach(test => {
      console.log(`  • ${test.name}: ${test.error}`);
    });
    console.log('');
  }
  
  // 다음 단계 안내
  if (testResults.failedTests === 0) {
    console.log('🎉 모든 테스트가 통과했습니다!');
    console.log('');
    console.log('✅ 다음 단계:');
    console.log('1. 프론트엔드 서버 실행: cd frontend && npm start');
    console.log('2. 백엔드 서버 실행: ./dev-start.sh');
    console.log('3. 브라우저에서 http://localhost:5173/facilities/search 접속');
  } else {
    console.log('🔧 문제 해결이 필요합니다.');
    console.log('');
    console.log('📚 도움말:');
    console.log('- API 키 설정: API_INTEGRATION_GUIDE.md 참조');
    console.log('- 서버 실행: ./dev-start.sh 또는 docker-compose up');
    console.log('- 로그 확인: ./dev-status.sh');
  }
  
  // 결과를 파일로 저장
  const resultPath = path.join(__dirname, 'test-results.json');
  fs.writeFileSync(resultPath, JSON.stringify(testResults, null, 2));
  console.log(`\n📄 상세 결과: ${resultPath}`);
}

// 스크립트 실행
if (require.main === module) {
  runTests().catch(error => {
    console.error('💥 테스트 실행 중 오류 발생:', error.message);
    process.exit(1);
  });
}

module.exports = { runTests, testResults };