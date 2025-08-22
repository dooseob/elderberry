#!/usr/bin/env node

/**
 * 공공데이터 API 테스트 예제 스크립트
 * 
 * 사용법:
 * 1. Node.js 환경에서 실행
 * 2. .env 파일에 API 키 설정 필요
 * 3. npm run test:api 또는 node test/api-test-example.js
 */

import { config } from 'dotenv';
import fetch from 'node-fetch';

// 환경변수 로드
config({ path: '../main/.env' });

const API_CONFIG = {
  DATA_GO_KR_API_KEY: process.env.VITE_DATA_GO_KR_API_KEY || '',
  HIRA_API_KEY: process.env.VITE_HIRA_API_KEY || '',
  NHIS_API_KEY: process.env.VITE_NHIS_API_KEY || '',
  AUTH_TYPE: process.env.VITE_API_AUTH_TYPE || 'query'
};

// 색상 출력을 위한 유틸리티
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.cyan}=== ${msg} ===${colors.reset}`)
};

/**
 * API 호출 테스트 함수
 */
async function testApiCall(config) {
  const { baseUrl, endpoint, params, authConfig, description } = config;
  
  log.info(`테스트: ${description}`);
  
  try {
    // URL 파라미터 설정
    const urlParams = new URLSearchParams(params);
    
    // 인증 설정
    let headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    if (authConfig.authType === 'header') {
      headers['Authorization'] = authConfig.apiKey.startsWith('Bearer ') 
        ? authConfig.apiKey 
        : `Bearer ${authConfig.apiKey}`;
    } else {
      urlParams.set('serviceKey', authConfig.apiKey);
    }
    
    const url = `${baseUrl}${endpoint}?${urlParams.toString()}`;
    const maskedUrl = url.replace(authConfig.apiKey, '[API_KEY]');
    
    log.info(`요청 URL: ${maskedUrl}`);
    log.info(`인증 방식: ${authConfig.authType}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
      timeout: 10000 // 10초 타임아웃
    });
    
    log.info(`응답 상태: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      log.error(`HTTP 오류: ${response.status}`);
      log.error(`응답 내용: ${errorText.substring(0, 500)}...`);
      return { success: false, error: `HTTP ${response.status}` };
    }
    
    const data = await response.json();
    
    // 응답 구조 분석
    if (data.response) {
      if (data.response.header) {
        log.info(`결과 코드: ${data.response.header.resultCode}`);
        log.info(`결과 메시지: ${data.response.header.resultMsg}`);
        
        if (data.response.header.resultCode === '00') {
          const itemCount = data.response.body?.items?.item?.length || 0;
          log.success(`성공: ${itemCount}개 항목 조회됨`);
          
          // 샘플 데이터 출력
          if (itemCount > 0) {
            const firstItem = data.response.body.items.item[0];
            log.info(`샘플 데이터: ${JSON.stringify(firstItem, null, 2).substring(0, 300)}...`);
          }
          
          return { success: true, data, itemCount };
        } else {
          log.error(`API 오류: ${data.response.header.resultMsg}`);
          return { success: false, error: data.response.header.resultMsg };
        }
      }
    }
    
    log.warning('예상과 다른 응답 구조');
    log.info(`응답: ${JSON.stringify(data, null, 2).substring(0, 500)}...`);
    return { success: true, data };
    
  } catch (error) {
    log.error(`네트워크 오류: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * HIRA API 테스트
 */
async function testHIRAApi(authType = 'query') {
  log.header('건강보험심사평가원 (HIRA) API 테스트');
  
  const apiKey = API_CONFIG.HIRA_API_KEY || API_CONFIG.DATA_GO_KR_API_KEY;
  
  if (!apiKey) {
    log.error('HIRA API 키가 설정되지 않았습니다.');
    return false;
  }
  
  const config = {
    baseUrl: 'https://openapi.hira.or.kr/openapi/service',
    endpoint: '/getLtcInsuranceInfo',
    params: {
      numOfRows: '5',
      pageNo: '1',
      _type: 'json',
      sidoCdNm: '서울시'
    },
    authConfig: {
      authType,
      apiKey
    },
    description: 'HIRA 요양기관 정보 조회 테스트'
  };
  
  const result = await testApiCall(config);
  
  if (!result.success && authType === 'query') {
    log.warning('Query 방식 실패, Header 방식으로 재시도...');
    return await testHIRAApi('header');
  }
  
  return result.success;
}

/**
 * NHIS API 테스트
 */
async function testNHISApi(authType = 'query') {
  log.header('국민건강보험공단 (NHIS) API 테스트');
  
  const apiKey = API_CONFIG.NHIS_API_KEY || API_CONFIG.DATA_GO_KR_API_KEY;
  
  if (!apiKey) {
    log.error('NHIS API 키가 설정되지 않았습니다.');
    return false;
  }
  
  const config = {
    baseUrl: 'http://openapi1.nhis.or.kr/openapi/service/rest',
    endpoint: '/HmcSpecificInfoService/getHchkItemResveInfoDetail',
    params: {
      numOfRows: '5',
      pageNo: '1',
      _type: 'json'
    },
    authConfig: {
      authType,
      apiKey
    },
    description: 'NHIS 검진기관 정보 조회 테스트'
  };
  
  const result = await testApiCall(config);
  
  if (!result.success && authType === 'query') {
    log.warning('Query 방식 실패, Header 방식으로 재시도...');
    return await testNHISApi('header');
  }
  
  return result.success;
}

/**
 * 공공데이터포털 API 키 유효성 검사
 */
async function validateApiKeys() {
  log.header('API 키 유효성 검사');
  
  const keys = {
    'DATA.GO.KR 통합': API_CONFIG.DATA_GO_KR_API_KEY,
    'HIRA 개별': API_CONFIG.HIRA_API_KEY,
    'NHIS 개별': API_CONFIG.NHIS_API_KEY
  };
  
  for (const [name, key] of Object.entries(keys)) {
    if (key) {
      // API 키 패턴 검증
      if (key.length < 20) {
        log.warning(`${name} 키가 너무 짧습니다 (${key.length}자)`);
      } else if (key.includes('YOUR_') || key.includes('EXAMPLE')) {
        log.warning(`${name} 키가 예제 값으로 보입니다`);
      } else {
        log.success(`${name} 키 형식 OK (${key.length}자)`);
      }
      
      // 마스킹된 키 출력
      const maskedKey = key.substring(0, 8) + '...' + key.substring(key.length - 4);
      log.info(`${name}: ${maskedKey}`);
    } else {
      log.warning(`${name} 키가 설정되지 않음`);
    }
  }
}

/**
 * 환경 설정 상태 확인
 */
async function checkEnvironmentSetup() {
  log.header('환경 설정 상태 확인');
  
  log.info(`인증 방식: ${API_CONFIG.AUTH_TYPE}`);
  log.info(`Node.js 버전: ${process.version}`);
  
  // .env 파일 존재 확인
  try {
    const fs = await import('fs');
    const envExists = fs.existsSync('../main/.env');
    if (envExists) {
      log.success('.env 파일 존재');
    } else {
      log.warning('.env 파일이 없습니다. .env.example을 복사하여 설정하세요.');
    }
  } catch (error) {
    log.warning('파일 시스템 접근 오류');
  }
}

/**
 * 종합 테스트 실행
 */
async function runAllTests() {
  console.log(`${colors.magenta}
╔══════════════════════════════════════════════════════════════╗
║                   공공데이터 API 테스트 도구                     ║
║                                                              ║
║  엘더베리 프로젝트 - 공공데이터 API 연동 테스트                    ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);
  
  await checkEnvironmentSetup();
  await validateApiKeys();
  
  const results = {
    hira: false,
    nhis: false
  };
  
  // HIRA API 테스트
  results.hira = await testHIRAApi(API_CONFIG.AUTH_TYPE);
  
  // NHIS API 테스트  
  results.nhis = await testNHISApi(API_CONFIG.AUTH_TYPE);
  
  // 결과 요약
  log.header('테스트 결과 요약');
  
  const successCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;
  
  log.info(`성공: ${successCount}/${totalCount} API`);
  
  for (const [api, success] of Object.entries(results)) {
    if (success) {
      log.success(`${api.toUpperCase()} API: 연결 성공`);
    } else {
      log.error(`${api.toUpperCase()} API: 연결 실패`);
    }
  }
  
  if (successCount === 0) {
    log.error('\n모든 API 연결이 실패했습니다.');
    log.info('문제 해결 방법:');
    log.info('1. .env 파일에서 API 키 확인');
    log.info('2. 공공데이터포털에서 API 사용 승인 상태 확인');
    log.info('3. API 서버 상태 확인');
    log.info('4. 네트워크 연결 상태 확인');
  } else if (successCount === totalCount) {
    log.success('\n🎉 모든 API 연결이 성공했습니다!');
  } else {
    log.warning('\n일부 API 연결이 실패했습니다. 설정을 확인하세요.');
  }
  
  return results;
}

// 메인 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(error => {
    log.error(`테스트 실행 중 오류 발생: ${error.message}`);
    process.exit(1);
  });
}

export { runAllTests, testHIRAApi, testNHISApi, validateApiKeys };