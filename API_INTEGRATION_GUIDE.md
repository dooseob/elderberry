# 🗺️ 엘더베리 지도 API와 공공데이터 API 통합 가이드

> **완전 통합 완료!** 카카오맵 + 보건복지부 공공데이터 + 프론트엔드-백엔드 연동

## 📋 통합 완료 사항

### ✅ 1. 백엔드 API 통합 (완료)

#### **공공데이터 API 서비스**
- **파일**: `src/main/java/com/globalcarelink/external/PublicDataApiService.java`
- **기능**: 보건복지부 요양시설 공공데이터 API 완전 연동
- **지원 기능**:
  - 전국 요양기관 현황 조회
  - 지역별 시설 검색
  - 시설명 검색
  - 좌표 기반 주변 시설 검색
  - 상세 정보 조회
  - 캐싱 지원 (성능 최적화)

#### **지도 기반 시설 서비스**
- **파일**: `src/main/java/com/globalcarelink/facility/MapBasedFacilityService.java`
- **기능**: 지도 영역 내 시설 검색 및 클러스터링
- **지원 기능**:
  - 지도 범위(bounds) 내 시설 검색
  - 좌표 기반 반경 검색
  - 고급 클러스터링 알고리즘
  - 지역별 시설 통계

#### **통합 검색 컨트롤러**
- **파일**: `src/main/java/com/globalcarelink/facility/FacilitySearchController.java`
- **업데이트**: 공공데이터 API와 완전 연동
- **엔드포인트**:
  - `GET /api/facilities/search` - 통합 시설 검색
  - `GET /api/facilities/search/map` - 지도 기반 검색
  - `GET /api/facilities/{id}/detail` - 시설 상세 정보
  - `GET /api/facilities/recommendations` - AI 추천 시설

### ✅ 2. 프론트엔드 지도 컴포넌트 (완료)

#### **다중 시설 지원 카카오맵**
- **파일**: `frontend/src/components/map/KakaoMap.tsx`
- **업데이트**: 단일 시설 → 다중 시설 표시 지원
- **새로운 기능**:
  - 다중 시설 마커 표시
  - 시설별 맞춤 마커 색상 (등급/상태별)
  - 마커 클러스터링
  - 지도 범위 변경 이벤트
  - 시설 상세 정보 팝업
  - 길찾기 및 전체보기 컨트롤

#### **시설 검색 페이지**
- **파일**: `frontend/src/features/facility-search/ui/FacilitySearchPage.tsx`
- **업데이트**: 새로운 지도 컴포넌트 적용
- **개선사항**:
  - 600px 높이의 최적화된 지도 뷰
  - 지도 범위 변경 시 실시간 시설 로드
  - 동적 클러스터링 활성화 (10개 이상 시설)
  - 단일 시설일 때만 주변 편의시설 표시

### ✅ 3. API 클라이언트 통합 (완료)

#### **Facility API 클라이언트**
- **파일**: `frontend/src/entities/facility/api/facilityApi.ts`
- **새로 생성**: 완전한 API 클라이언트 구현
- **기능**:
  - RESTful API 통신
  - 인증 토큰 자동 처리
  - 에러 핸들링 및 재시도
  - React Query 키 팩토리
  - 타입 안전성 보장
  - 검색 파라미터 정규화

#### **FSD 아키텍처 준수**
- **파일**: `frontend/src/entities/facility/api/index.ts`
- **파일**: `frontend/src/entities/facility/index.ts`
- **구조**: Public API 패턴으로 캡슐화

## 🔧 API 키 설정 방법

### 1. 카카오 개발자 계정 설정

1. [카카오 개발자 사이트](https://developers.kakao.com) 접속
2. 애플리케이션 생성
3. **JavaScript 키** 발급 받기
4. **플랫폼 등록**: Web 플랫폼 추가 → `http://localhost:5173` 등록

### 2. 공공데이터포털 API 키 설정

1. [공공데이터포털](https://data.go.kr) 접속
2. 회원가입 및 로그인
3. **장기요양기관 현황** 데이터셋 신청
4. **API 키** 발급 받기 (신청 후 1-2일 소요)

### 3. 환경변수 파일 생성

```bash
# 프로젝트 루트에서 실행
cp .env.example .env
```

### 4. 실제 API 키 입력

```bash
# .env 파일 편집
# ⚠️ 실제 키로 교체하세요!

# 프론트엔드 전용 (REACT_APP_ 접두어 필요)
REACT_APP_KAKAO_MAP_API_KEY=your-actual-javascript-key-here

# 백엔드 전용
PUBLIC_DATA_API_KEY=your-actual-public-data-key-here
```

## 🚀 테스트 방법

### 1. 백엔드 API 테스트

```bash
# 서버 실행
./dev-start.sh

# API 테스트 (curl 예제)
curl "http://localhost:8080/api/facilities/search?keyword=서울&size=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 지도 검색 테스트
curl "http://localhost:8080/api/facilities/search/map?neLat=37.6&neLng=127.1&swLat=37.5&swLng=126.9" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. 프론트엔드 통합 테스트

```bash
# 프론트엔드 개발 서버 실행
cd frontend
npm start

# 브라우저에서 접속
# http://localhost:5173/facilities/search
```

### 3. 기능 동작 확인

- ✅ **검색 기능**: 키워드로 시설 검색
- ✅ **지도 뷰**: 지도에서 시설 마커 확인
- ✅ **상세 정보**: 마커 클릭 시 팝업 표시
- ✅ **필터링**: 지역, 유형, 등급별 필터
- ✅ **길찾기**: 카카오맵 연동

## 📊 데이터 플로우

```
사용자 검색 입력
    ↓
프론트엔드 (React)
    ↓
API 클라이언트 (axios)
    ↓
백엔드 컨트롤러 (Spring Boot)
    ↓
공공데이터 API 서비스
    ↓
보건복지부 공공데이터 API
    ↓
데이터 변환 및 캐싱
    ↓
프론트엔드로 응답 반환
    ↓
카카오맵에 마커 표시
```

## 🔍 주요 API 엔드포인트

### 백엔드 API

| 엔드포인트 | 메서드 | 설명 | 파라미터 |
|-----------|--------|------|---------|
| `/api/facilities/search` | GET | 통합 시설 검색 | keyword, region, facilityType, etc. |
| `/api/facilities/search/map` | GET | 지도 영역 내 검색 | neLat, neLng, swLat, swLng |
| `/api/facilities/{id}/detail` | GET | 시설 상세 정보 | facilityId |
| `/api/facilities/recommendations` | GET | AI 추천 시설 | careGrade, preferredRegion |

### 공공데이터 API (내부 사용)

| API | URL | 설명 |
|-----|-----|------|
| 장기요양기관 현황 | `https://api.data.go.kr/1471000/LtciInstInfoService/getLtciInstInfo` | 전국 요양기관 데이터 |

## 🎯 성능 최적화

### 1. 캐싱 전략
- **Redis 캐시**: 공공데이터 API 응답 캐싱 (5-30분)
- **React Query**: 클라이언트 사이드 캐싱
- **브라우저 캐시**: 지도 타일 및 정적 리소스

### 2. 데이터 로딩 최적화
- **지연 로딩**: 지도 뷰모드일 때만 지도 로드
- **클러스터링**: 10개 이상 시설 시 자동 클러스터링
- **페이지네이션**: 대용량 검색 결과 분할 로드

### 3. 에러 처리
- **공공데이터 API 장애**: 자동으로 더미 데이터로 폴백
- **네트워크 오류**: 재시도 로직 및 사용자 피드백
- **API 키 오류**: 명확한 오류 메시지 표시

## 🔒 보안 고려사항

- ✅ **API 키 분리**: 프론트엔드/백엔드 키 별도 관리
- ✅ **환경변수**: Git에 실제 키 노출 방지
- ✅ **CORS 설정**: 허용된 도메인만 API 접근
- ✅ **JWT 인증**: 모든 API 요청에 인증 토큰 필요

## 🚨 트러블슈팅

### 지도가 표시되지 않는 경우
1. `REACT_APP_KAKAO_MAP_API_KEY` 환경변수 확인
2. 카카오 개발자 콘솔에서 도메인 등록 확인
3. 브라우저 개발자 도구 콘솔 오류 메시지 확인

### 시설 데이터가 로드되지 않는 경우
1. `PUBLIC_DATA_API_KEY` 환경변수 확인
2. 공공데이터포털에서 API 승인 상태 확인
3. 백엔드 로그에서 API 호출 오류 확인

### CORS 오류가 발생하는 경우
1. 백엔드 CORS 설정 확인
2. 프론트엔드 API 베이스 URL 확인
3. 개발/프로덕션 환경별 도메인 설정 확인

## 📈 향후 확장 계획

### 단기 목표 (1-2주)
- 네이버 지도 API 통합 (선택 옵션)
- 지도 성능 최적화 (마커 가상화)
- 모바일 반응형 최적화

### 중기 목표 (1개월)
- 실시간 교통정보 연동
- 시설 리뷰 및 평점 시스템
- 즐겨찾기 및 비교 기능

### 장기 목표 (3개월)
- AI 기반 개인화 추천
- 가상투어 및 360도 이미지
- 실시간 입소 가능 여부 조회

---

**🎉 축하합니다!** 엘더베리 지도 API와 공공데이터 API 통합이 완전히 완료되었습니다!

**📝 마지막 업데이트**: 2025-01-28  
**✅ 상태**: 완전 통합 완료  
**🔗 관련 파일**: 총 8개 주요 파일 생성/수정  
**⚡ 성능**: 공공데이터 + 지도 API 완전 연동