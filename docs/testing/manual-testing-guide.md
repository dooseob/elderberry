# 엘더베리 프로젝트 통합 테스트 가이드

> **버전**: 2.5.0 | **업데이트**: 2025-08-12 | **적용 범위**: 웹 테스팅 대안 솔루션

## 📋 목차

1. [테스트 환경 설정](#테스트-환경-설정)
2. [Jest + RTL 자동화 테스트](#jest--rtl-자동화-테스트)
3. [API 테스트 (curl 기반)](#api-테스트-curl-기반)
4. [브라우저 수동 테스트](#브라우저-수동-테스트)
5. [통합 테스트 실행](#통합-테스트-실행)
6. [결과 분석 및 리포팅](#결과-분석-및-리포팅)

## 🔧 테스트 환경 설정

### 필수 도구 설치

```bash
# Node.js 및 Jest 설치 확인
node --version  # v18.0.0+
npm --version   # 8.0.0+

# 프로젝트 의존성 설치
cd /mnt/c/Users/human-10/elderberry/frontend
npm install --legacy-peer-deps

# 테스트 도구 설치 확인
npm list @testing-library/react
npm list @testing-library/jest-dom
npm list jest
```

### 환경 변수 설정

```bash
# .env.test 파일 생성
cat > frontend/.env.test << 'EOF'
VITE_API_BASE_URL=http://localhost:8080/api
VITE_ENVIRONMENT=test
VITE_LOG_LEVEL=debug
EOF

# 백엔드 테스트 환경
export API_BASE_URL=http://localhost:8080/api
export TEST_EMAIL=test.domestic@example.com
export TEST_PASSWORD=Password123!
```

## 🧪 Jest + RTL 자동화 테스트

### 테스트 실행 명령어

```bash
# 전체 테스트 스위트 실행
npm test

# 커버리지 포함 실행
npm run test:coverage

# 특정 컴포넌트 테스트
npm test -- LoginPage.test.tsx

# watch 모드 (개발 중)
npm test -- --watch
```

### 핵심 테스트 시나리오

#### 1. 인증 컴포넌트 테스트

```typescript
// SignInPage.test.tsx
describe('로그인 페이지', () => {
  test('올바른 credentials로 로그인 성공', async () => {
    render(<SignInPage />);
    
    // 입력 필드 채우기
    fireEvent.change(screen.getByLabelText(/이메일/i), {
      target: { value: 'test.domestic@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/비밀번호/i), {
      target: { value: 'Password123!' }
    });
    
    // 로그인 버튼 클릭
    fireEvent.click(screen.getByRole('button', { name: /로그인/i }));
    
    // 성공 메시지 확인
    await waitFor(() => {
      expect(screen.getByText(/로그인 성공/i)).toBeInTheDocument();
    });
  });
});
```

#### 2. 시설 검색 컴포넌트 테스트

```typescript
// FacilitySearch.test.tsx
describe('시설 검색', () => {
  test('검색어 입력 시 API 호출 및 결과 표시', async () => {
    // MSW로 API 응답 모킹
    server.use(
      rest.get('/api/facilities/search', (req, res, ctx) => {
        return res(ctx.json({
          success: true,
          data: [{ id: 1, name: '테스트 요양원', location: '서울' }]
        }));
      })
    );
    
    render(<FacilitySearchPage />);
    
    // 검색 실행
    const searchInput = screen.getByPlaceholderText(/시설명을 입력/i);
    fireEvent.change(searchInput, { target: { value: '요양원' } });
    fireEvent.click(screen.getByRole('button', { name: /검색/i }));
    
    // 결과 확인
    await waitFor(() => {
      expect(screen.getByText('테스트 요양원')).toBeInTheDocument();
    });
  });
});
```

#### 3. 상태 관리 (Zustand) 테스트

```typescript
// authStore.test.ts
describe('인증 스토어', () => {
  test('로그인 시 사용자 정보와 토큰 저장', () => {
    const { result } = renderHook(() => useAuthStore());
    
    act(() => {
      result.current.setAuth({
        token: 'test-jwt-token',
        user: { id: 1, email: 'test@example.com', name: '테스트' }
      });
    });
    
    expect(result.current.token).toBe('test-jwt-token');
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.name).toBe('테스트');
  });
});
```

### 커버리지 목표

- **전체 커버리지**: 70% 이상
- **핵심 컴포넌트**: 85% 이상  
- **유틸리티 함수**: 90% 이상
- **API 어댑터**: 75% 이상

## 🌐 API 테스트 (curl 기반)

### 자동화 스크립트 실행

```bash
# API 테스트 스크립트 실행
chmod +x test-backend-api.sh
./test-backend-api.sh

# 환경 변수 설정하여 실행
API_BASE_URL=https://api.elderberry-ai.com/api ./test-backend-api.sh
```

### 수동 API 테스트 예제

#### 1. 인증 테스트

```bash
# 로그인 테스트
curl -X POST 'http://localhost:8080/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"email":"test.domestic@example.com","password":"Password123!"}' \
  -w '\n응답코드: %{http_code}\n응답시간: %{time_total}s\n'

# 회원가입 테스트
curl -X POST 'http://localhost:8080/api/auth/register' \
  -H 'Content-Type: application/json' \
  -d '{
    "email":"new.user@example.com",
    "password":"NewPassword123!",
    "name":"새사용자",
    "role":"domestic"
  }' \
  -w '\n응답코드: %{http_code}\n'
```

#### 2. 시설 API 테스트

```bash
# 시설 검색
curl -X GET 'http://localhost:8080/api/facilities/search?location=서울&type=nursing_home' \
  -w '\n응답코드: %{http_code}\n'

# 시설 상세 정보
curl -X GET 'http://localhost:8080/api/facilities/1' \
  -w '\n응답코드: %{http_code}\n'

# 인증이 필요한 시설 추천 (JWT 토큰 필요)
curl -X POST 'http://localhost:8080/api/facilities/recommendations' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"location":"서울","preferences":["nursing_care","medical_support"]}' \
  -w '\n응답코드: %{http_code}\n'
```

#### 3. 건강평가 API 테스트

```bash
# 건강평가 생성 (인증 필요)
curl -X POST 'http://localhost:8080/api/health/assessments' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "age": 75,
    "gender": "female",
    "conditions": ["diabetes", "hypertension"],
    "mobility": "limited"
  }' \
  -w '\n응답코드: %{http_code}\n'

# 건강평가 목록 조회
curl -X GET 'http://localhost:8080/api/health/assessments' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -w '\n응답코드: %{http_code}\n'
```

### API 테스트 검증 포인트

- **응답 코드**: 200 (성공), 201 (생성), 400 (잘못된 요청), 401 (인증 실패), 404 (찾을 수 없음)
- **응답 시간**: 200ms 이하 (우수), 500ms 이하 (양호), 1초 이하 (보통)
- **응답 구조**: JSON 형식, success/error 필드 존재
- **보안**: 인증 토큰 검증, SQL 인젝션/XSS 방어

## 🖱️ 브라우저 수동 테스트

### 테스트 체크리스트 활용

1. **HTML 파일 열기**:
   ```bash
   # 브라우저에서 체크리스트 열기
   open manual-testing-checklist.html
   # 또는 직접 브라우저에서 파일 열기
   ```

2. **테스트 시나리오 실행**:
   - 각 항목을 체크하며 진행
   - 문제 발견 시 상세 내용 기록
   - 스크린샷 첨부 (필요시)

### 핵심 수동 테스트 시나리오

#### 1. 사용자 인증 플로우

```
시나리오: 새 사용자 가입 및 로그인
1. 회원가입 페이지 접근 (/register)
2. 필수 정보 입력 (이메일, 비밀번호, 이름, 역할)
3. "회원가입" 버튼 클릭
4. 성공 메시지 확인
5. 로그인 페이지로 자동 이동 확인
6. 생성한 계정으로 로그인 시도
7. 대시보드 페이지 정상 접근 확인

검증 포인트:
- 유효성 검사 메시지 표시
- 로딩 상태 표시
- 에러 메시지 사용자 친화적
- 토큰 저장 및 자동 로그인 상태 유지
```

#### 2. 시설 검색 및 상세보기

```
시나리오: 시설 검색부터 상세보기까지
1. 메인 페이지에서 시설 검색 (/facilities)
2. 지역 선택 (드롭다운): "서울"
3. 시설 유형 선택: "요양원"
4. "검색" 버튼 클릭
5. 검색 결과 목록 확인 (최소 3개 이상)
6. 첫 번째 시설 클릭하여 상세보기
7. 시설 정보, 리뷰, 위치 정보 확인
8. "즐겨찾기" 버튼 동작 확인
9. 뒤로 가기로 검색 결과로 복귀

검증 포인트:
- 로딩 스피너 표시
- 검색 결과 없을 때 적절한 메시지
- 이미지 로딩 오류 처리
- 반응형 디자인 (모바일/태블릿)
```

#### 3. 건강평가 작성

```
시나리오: 건강평가 전체 플로우
1. 로그인 후 "건강평가" 메뉴 클릭
2. "새 평가 작성" 버튼 클릭
3. 기본 정보 입력 (나이, 성별)
4. 기존 질환 선택 (체크박스)
5. 거동 능력 선택 (라디오 버튼)
6. 추가 요구사항 텍스트 입력
7. "평가 완료" 버튼 클릭
8. 결과 페이지에서 추천 시설 확인
9. PDF 다운로드 버튼 동작 확인
10. 이력에서 평가 결과 재확인

검증 포인트:
- 단계별 진행 표시기
- 필수 항목 유효성 검사
- 이전/다음 버튼 정상 동작
- 임시저장 기능 (새로고침 시)
```

### 접근성 테스트

#### 키보드 네비게이션

```
테스트 항목:
1. Tab 키로 모든 상호작용 요소 접근 가능
2. Enter/Space 키로 버튼 활성화
3. Escape 키로 모달 닫기
4. 화살표 키로 드롭다운 네비게이션
5. 포커스 표시기 명확하게 보임

도구: 키보드만 사용하여 전체 사이트 네비게이션
```

#### 스크린 리더 호환성

```
테스트 도구: NVDA (Windows), VoiceOver (Mac), JAWS
테스트 항목:
1. 페이지 제목 읽기
2. 헤딩 구조 논리적 순서
3. 폼 레이블 적절히 연결
4. 에러 메시지 음성으로 전달
5. 이미지 alt 텍스트 의미 있음
```

### 성능 테스트

#### Core Web Vitals 측정

```bash
# Chrome DevTools 사용
1. F12 → Lighthouse 탭
2. "Performance" 카테고리 선택
3. "Generate report" 실행

목표 지표:
- Largest Contentful Paint (LCP): < 2.5s
- First Input Delay (FID): < 100ms  
- Cumulative Layout Shift (CLS): < 0.1
```

#### 네트워크 시뮬레이션

```
테스트 환경:
1. Fast 3G (1.6 Mbps)
2. Slow 3G (500 Kbps)
3. Offline 모드

검증 포인트:
- 로딩 상태 적절히 표시
- 오프라인 메시지 표시
- 이미지 지연 로딩 동작
- 캐시 활용 확인
```

## 🔄 통합 테스트 실행

### 전체 테스트 파이프라인

```bash
#!/bin/bash
# 통합 테스트 실행 스크립트

echo "🚀 엘더베리 통합 테스트 시작..."

# 1. 서버 상태 확인
echo "📡 서버 연결 확인..."
curl -s --connect-timeout 5 http://localhost:8080 > /dev/null
if [ $? -ne 0 ]; then
    echo "❌ 백엔드 서버가 실행되지 않았습니다."
    exit 1
fi

curl -s --connect-timeout 5 http://localhost:5173 > /dev/null
if [ $? -ne 0 ]; then
    echo "❌ 프론트엔드 서버가 실행되지 않았습니다."
    exit 1
fi

# 2. Jest 테스트 실행
echo "🧪 Jest 자동화 테스트 실행..."
cd frontend
npm test -- --coverage --watchAll=false
if [ $? -ne 0 ]; then
    echo "❌ Jest 테스트 실패"
    exit 1
fi

# 3. API 테스트 실행
echo "🌐 API 테스트 실행..."
cd ..
./test-backend-api.sh
if [ $? -ne 0 ]; then
    echo "❌ API 테스트 실패"
    exit 1
fi

# 4. 수동 테스트 가이드 출력
echo "📋 수동 테스트 체크리스트:"
echo "1. 브라우저에서 manual-testing-checklist.html 열기"
echo "2. 모든 시나리오 테스트 실행"
echo "3. 발견된 이슈 기록"

echo "✅ 자동화 테스트 완료! 수동 테스트를 진행하세요."
```

### 에이전트 시스템 명령어

```bash
# 커스텀 명령어로 통합 테스트 실행
/test "전체 시스템 테스트"        # 통합 테스트 스위트 실행
/test "API 연결 상태 확인"        # API 테스트만 실행
/test "프론트엔드 컴포넌트"       # Jest 테스트만 실행

# 고급 명령어 조합
/max "전체 품질 검증"            # 코드 품질 + 성능 + 보안 테스트
/auto "CI/CD 파이프라인 시뮬레이션" # 배포 전 전체 검증
```

## 📊 결과 분석 및 리포팅

### 테스트 결과 수집

1. **Jest 커버리지 리포트**: `frontend/coverage/lcov-report/index.html`
2. **API 테스트 로그**: `api-test-[timestamp].log`
3. **수동 테스트 리포트**: 체크리스트에서 생성된 HTML 리포트
4. **성능 측정**: Chrome DevTools Lighthouse 결과

### 통합 리포트 생성

```bash
# 자동 리포트 생성 스크립트
cat > generate-test-report.sh << 'EOF'
#!/bin/bash

REPORT_DATE=$(date +"%Y-%m-%d_%H-%M-%S")
REPORT_FILE="test-report-${REPORT_DATE}.html"

cat > "$REPORT_FILE" << HTML
<!DOCTYPE html>
<html>
<head>
    <title>엘더베리 테스트 리포트 - $REPORT_DATE</title>
    <style>
        body { font-family: -apple-system, sans-serif; margin: 40px; }
        .success { color: #22c55e; }
        .warning { color: #f59e0b; }
        .error { color: #ef4444; }
        .section { margin: 20px 0; padding: 20px; border: 1px solid #e5e7eb; }
    </style>
</head>
<body>
    <h1>🧪 엘더베리 테스트 리포트</h1>
    <p><strong>생성일:</strong> $REPORT_DATE</p>
    
    <div class="section">
        <h2>📊 테스트 결과 요약</h2>
        <ul>
            <li>Jest 테스트: $([ -f frontend/coverage/coverage-summary.json ] && echo "✅ 실행됨" || echo "❌ 미실행")</li>
            <li>API 테스트: $(ls api-test-*.log 2>/dev/null | wc -l | xargs echo)개 로그 파일</li>
            <li>수동 테스트: 체크리스트 활용 필요</li>
        </ul>
    </div>
    
    <div class="section">
        <h2>📈 코드 커버리지</h2>
        $([ -f frontend/coverage/coverage-summary.json ] && node -e "
            const fs = require('fs');
            const coverage = JSON.parse(fs.readFileSync('frontend/coverage/coverage-summary.json'));
            const total = coverage.total;
            console.log('<ul>');
            console.log('<li>라인 커버리지: ' + total.lines.pct + '%</li>');
            console.log('<li>함수 커버리지: ' + total.functions.pct + '%</li>');
            console.log('<li>브랜치 커버리지: ' + total.branches.pct + '%</li>');
            console.log('</ul>');
        " || echo "<p>커버리지 데이터 없음</p>")
    </div>
    
    <div class="section">
        <h2>🔗 상세 리포트</h2>
        <ul>
            <li><a href="frontend/coverage/lcov-report/index.html">Jest 커버리지 상세</a></li>
            <li><a href="manual-testing-checklist.html">수동 테스트 체크리스트</a></li>
        </ul>
    </div>
    
    <div class="section">
        <h2>💡 권장사항</h2>
        <ul>
            <li>커버리지 70% 이상 유지</li>
            <li>API 응답 시간 500ms 이하</li>
            <li>수동 테스트 100% 완료</li>
            <li>접근성 테스트 정기 실행</li>
        </ul>
    </div>
</body>
</html>
HTML

echo "📄 테스트 리포트 생성 완료: $REPORT_FILE"
open "$REPORT_FILE" 2>/dev/null || echo "브라우저에서 $REPORT_FILE을 열어보세요."
EOF

chmod +x generate-test-report.sh
```

### 품질 게이트 기준

| 구분 | 최소 기준 | 권장 기준 | 측정 도구 |
|------|-----------|-----------|----------|
| **단위 테스트 커버리지** | 60% | 70%+ | Jest Coverage |
| **API 응답 시간** | 1초 이하 | 200ms 이하 | curl 측정 |
| **Core Web Vitals** | 모든 지표 Yellow | 모든 지표 Green | Lighthouse |
| **접근성 점수** | 80점 이상 | 90점 이상 | Lighthouse |
| **보안 테스트** | 모든 항목 통과 | - | 수동 검증 |

## 🚀 다음 단계

### 지속적 개선

1. **자동화 확장**: GitHub Actions CI/CD 파이프라인 구축
2. **E2E 테스트**: Playwright 대신 Cypress 도입 검토
3. **성능 모니터링**: 프로덕션 환경 실시간 모니터링
4. **사용자 테스트**: 실제 사용자 피드백 수집

### 도구 업그레이드

```bash
# 향후 도입 검토 도구들
npm install --save-dev @storybook/react     # 컴포넌트 독립 테스트
npm install --save-dev axe-core             # 접근성 자동 테스트
npm install --save-dev lighthouse-ci        # 성능 자동 측정
```

---

**📝 문서 업데이트**: 2025-08-12  
**✨ 핵심 성과**: WebTestingMasterAgent 제거 → 안정적인 하이브리드 테스트 시스템 구축  
**🎯 다음 목표**: CI/CD 파이프라인 통합 및 프로덕션 배포 준비