# 공공데이터 API 설정 가이드

> **엘더베리 프로젝트** - 한국 공공데이터포털 API 연동 완벽 가이드

## 📋 목차

1. [API 키 발급 방법](#api-키-발급-방법)
2. [인증 방식 이해하기](#인증-방식-이해하기)
3. [환경변수 설정](#환경변수-설정)
4. [API 테스트 방법](#api-테스트-방법)
5. [디버깅 및 문제해결](#디버깅-및-문제해결)
6. [실제 API 엔드포인트](#실제-api-엔드포인트)

## 🔑 API 키 발급 방법

### 1. 공공데이터포털 회원가입
1. [공공데이터포털(data.go.kr)](https://www.data.go.kr) 접속
2. 회원가입 진행 (개인/법인/기관 선택)
3. 이메일 인증 및 본인인증 완료

### 2. API 사용 신청
```bash
# 주요 API 서비스
1. 건강보험심사평가원_의료기관별상세정보서비스
   URL: https://www.data.go.kr/data/15001699/openapi.do
   
2. 국민건강보험공단_검진기관별정보제공
   URL: https://www.data.go.kr/data/15001672/openapi.do
   
3. 건강보험심사평가원_병원정보서비스  
   URL: https://www.data.go.kr/data/15001698/openapi.do
```

### 3. API 키 발급받기
1. 원하는 API 서비스 페이지 접속
2. "활용신청" 버튼 클릭
3. 사용 목적 및 시스템 정보 입력
4. 승인 완료 후 "내 서비스" → "개발계정" 에서 API 키 확인

## 🔐 인증 방식 이해하기

공공데이터 API는 **2가지 인증 방식**을 지원합니다:

### 1. serviceKey (Query Parameter) 방식 ⭐ **권장**
```http
GET /api/endpoint?serviceKey=YOUR_API_KEY&numOfRows=10&pageNo=1
```

**특징:**
- ✅ 가장 널리 사용되는 방식
- ✅ 설정이 간단함
- ✅ 대부분의 공공데이터 API에서 지원
- ⚠️ URL에 키가 노출됨 (로그 주의)

### 2. Authorization Header 방식
```http
GET /api/endpoint?numOfRows=10&pageNo=1
Authorization: Bearer YOUR_API_KEY
```

**특징:**
- ✅ 보안성이 더 좋음
- ✅ URL에 키가 노출되지 않음
- ❌ 일부 API에서만 지원
- ❌ 설정이 복잡할 수 있음

## 🛠️ 환경변수 설정

### 1. .env 파일 생성
```bash
# main/.env 파일 생성 (main/.env.example 복사)
cp main/.env.example main/.env
```

### 2. API 키 설정
```bash
# main/.env 파일 편집
VITE_USE_PUBLIC_API=true

# 공공데이터포털 통합 API 키 (권장)
VITE_DATA_GO_KR_API_KEY=여기에_실제_API_키_입력

# 개별 기관 API 키 (선택사항)
VITE_HIRA_API_KEY=건강보험심사평가원_개별_키
VITE_NHIS_API_KEY=국민건강보험공단_개별_키

# 인증 방식 설정
VITE_API_AUTH_TYPE=query  # 또는 'header'
```

### 3. API 키 우선순위
```typescript
// 시스템이 자동으로 선택하는 순서
1. VITE_HIRA_API_KEY (HIRA API 전용)
2. VITE_DATA_GO_KR_API_KEY (통합 키로 fallback)
3. 오류 발생 (키가 없음)
```

## 🧪 API 테스트 방법

### 1. 자동 테스트 스크립트 실행
```bash
# Node.js 테스트 스크립트 실행
cd elderberry
node test/api-test-example.js

# 또는 npm 스크립트로 실행 (향후 추가 예정)
npm run test:api
```

### 2. 브라우저에서 테스트
```typescript
// 브라우저 개발자 도구에서 실행
import { checkPublicApiStatus, testApiAuthentication } from './src/services/publicDataApiService';

// 전체 API 상태 확인
const status = await checkPublicApiStatus();
console.log('API 상태:', status);

// 특정 API 인증 방식 테스트
const hiraTest = await testApiAuthentication('hira', 'query');
console.log('HIRA API 테스트:', hiraTest);
```

### 3. curl로 직접 테스트
```bash
# serviceKey 방식 테스트
curl "https://openapi.hira.or.kr/openapi/service/getLtcInsuranceInfo?serviceKey=YOUR_API_KEY&numOfRows=1&pageNo=1&_type=json"

# Authorization 헤더 방식 테스트
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://openapi.hira.or.kr/openapi/service/getLtcInsuranceInfo?numOfRows=1&pageNo=1&_type=json"
```

## 🔍 디버깅 및 문제해결

### 자주 발생하는 오류와 해결 방법

#### 1. "인증키가 유효하지 않습니다" 오류
```bash
원인: API 키가 잘못되었거나 승인되지 않음
해결:
1. 공공데이터포털에서 API 사용 승인 상태 확인
2. API 키 복사 시 공백/특수문자 확인
3. 개발계정과 운영계정 키 구분 확인
```

#### 2. "SERVICE_KEY_IS_NOT_REGISTERED_ERROR" 오류
```bash
원인: 해당 API 서비스에 키가 등록되지 않음
해결:
1. 공공데이터포털에서 해당 API 서비스 사용 신청
2. 승인 완료까지 대기 (보통 1-2일)
3. 올바른 API 엔드포인트 사용 확인
```

#### 3. "CORS" 오류
```bash
원인: 브라우저에서 직접 API 호출 시 CORS 정책 위반
해결:
1. 백엔드를 통한 프록시 설정
2. 개발 시 CORS 브라우저 확장 프로그램 사용
3. Vite 개발 서버 proxy 설정
```

#### 4. 인증 방식 관련 오류
```bash
# 자동 인증 방식 감지 및 재시도
const result = await testApiAuthentication('hira', 'query');
if (!result.success) {
  // header 방식으로 재시도
  const headerResult = await testApiAuthentication('hira', 'header');
}
```

### 디버깅 도구 활용

#### 1. 내장 디버깅 함수
```typescript
import { testApiAuthentication, checkPublicApiStatus } from './src/services/publicDataApiService';

// 1. 전체 API 상태 확인
const status = await checkPublicApiStatus();
console.log('API 설정 정보:', status.config);
console.log('HIRA API 상태:', status.hira);
console.log('NHIS API 상태:', status.nhis);

// 2. 특정 API 인증 방식 테스트
const testResult = await testApiAuthentication('hira', 'query');
console.log('인증 테스트 결과:', testResult);
```

#### 2. 네트워크 탭 활용
```bash
1. 브라우저 개발자 도구 → Network 탭 열기
2. API 호출 실행
3. 요청/응답 헤더 및 본문 확인
4. 상태 코드 및 오류 메시지 분석
```

## 🌐 실제 API 엔드포인트

### 건강보험심사평가원 (HIRA)
```typescript
// 기본 정보
기관명: 건강보험심사평가원
API 기본 URL: https://openapi.hira.or.kr/openapi/service
인증 방식: serviceKey (query parameter)

// 주요 엔드포인트
1. 요양기관 정보 조회
   GET /getLtcInsuranceInfo
   파라미터: serviceKey, numOfRows, pageNo, sidoCdNm

2. 병원 정보 조회  
   GET /getMedicalEquipInfo
   파라미터: serviceKey, numOfRows, pageNo, sidoCdNm

// 응답 구조
{
  "response": {
    "header": {
      "resultCode": "00",
      "resultMsg": "NORMAL_SERVICE"
    },
    "body": {
      "items": {
        "item": [
          {
            "ykiho": "요양기관기호",
            "yadmNm": "요양기관명",
            "addr": "주소",
            "telno": "전화번호",
            "XPos": "X좌표",
            "YPos": "Y좌표"
          }
        ]
      },
      "numOfRows": 10,
      "pageNo": 1,
      "totalCount": 1234
    }
  }
}
```

### 국민건강보험공단 (NHIS)
```typescript
// 기본 정보
기관명: 국민건강보험공단
API 기본 URL: http://openapi1.nhis.or.kr/openapi/service/rest
인증 방식: serviceKey (query parameter)

// 주요 엔드포인트
1. 검진기관 정보 조회
   GET /HmcSpecificInfoService/getHchkItemResveInfoDetail
   파라미터: serviceKey, numOfRows, pageNo

// 트래픽 제한
개발계정: 1,000건/일
운영계정: 신청 시 협의 (사용 사례 등록 필요)
```

### API 응답 코드
```bash
# 성공 코드
00: 정상 서비스
  
# 오류 코드  
01: APPLICATION_ERROR (어플리케이션 에러)
02: DB_ERROR (데이터베이스 에러)
03: NODATA_ERROR (데이터없음 에러)
04: HTTP_ERROR (HTTP 에러)
05: SERVICETIME_OUT (서비스 연결실패 에러)
10: INVALID_REQUEST_PARAMETER_ERROR (잘못된 요청 파라메터 에러)
11: NO_MANDATORY_REQUEST_PARAMETERS_ERROR (필수요청 파라메터가 없음)
12: NO_OPENAPI_SERVICE_ERROR (해당 오픈API서비스가 없거나 폐기됨)
20: SERVICE_ACCESS_DENIED_ERROR (서비스 접근거부)
21: TEMPORARILY_DISABLE_THE_SERVICEKEY_ERROR (일시적으로 사용할 수 없는 서비스 키)
22: LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR (서비스 요청제한횟수 초과에러)
30: SERVICE_KEY_IS_NOT_REGISTERED_ERROR (등록되지 않은 서비스키)
31: DEADLINE_HAS_EXPIRED_ERROR (기한만료된 서비스키)
32: UNREGISTERED_IP_ERROR (등록되지 않은 IP)
33: UNSIGNED_CALL_ERROR (서명되지 않은 호출)
99: UNKNOWN_ERROR (기타에러)
```

## 📊 성능 및 제한사항

### API 호출 제한
```bash
HIRA API:
- 개발계정: 1일 1,000건
- 운영계정: 협의 후 결정

NHIS API:  
- 개발계정: 1일 1,000건
- 운영계정: 사용 사례 등록 후 협의

공통 제한사항:
- 초당 최대 10건 (권장)
- 동시 연결 5개 이하 권장
- 타임아웃: 30초
```

### 최적화 권장사항
```typescript
// 1. 캐싱 활용
const cache = new Map();
const cacheKey = `${region}-${facilityType}-${pageNo}`;
if (cache.has(cacheKey)) {
  return cache.get(cacheKey);
}

// 2. 배치 처리
const batchSize = 100; // 한 번에 최대 100개
const params = { numOfRows: batchSize.toString() };

// 3. 에러 재시도 로직
let retryCount = 0;
const maxRetries = 3;
while (retryCount < maxRetries) {
  try {
    const result = await callPublicApi(config);
    break;
  } catch (error) {
    retryCount++;
    await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
  }
}
```

## 🔒 보안 고려사항

### API 키 보안
```bash
✅ 좋은 관례:
- .env 파일에 저장하고 .gitignore에 추가
- 프로덕션에서는 환경변수나 시크릿 관리 도구 사용
- API 키를 로그에 기록하지 않음
- 정기적으로 키 재발급

❌ 피해야 할 것:
- 소스코드에 하드코딩
- 클라이언트 사이드에 노출
- 공개 저장소에 커밋
- 로그 파일에 기록
```

### CORS 및 프록시 설정
```typescript
// Vite 개발 서버 프록시 설정 (vite.config.ts)
export default defineConfig({
  server: {
    proxy: {
      '/api/public': {
        target: 'https://openapi.hira.or.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/public/, '/openapi/service')
      }
    }
  }
});
```

---

## 📞 지원 및 문의

### 공식 문의처
- **공공데이터포털**: https://www.data.go.kr/
- **고객센터**: 02-2100-1500
- **이메일**: help@data.go.kr

### 엘더베리 프로젝트 관련
- **GitHub Issues**: 프로젝트 저장소의 Issues 탭 활용
- **개발 문서**: `/docs/guides/` 디렉토리 참조

---

**📝 마지막 업데이트**: 2025-08-17  
**🏆 버전**: v1.0.0 (공공데이터 API 연동 완성)  
**📏 문서 길이**: 400줄 (완전한 설정 가이드)