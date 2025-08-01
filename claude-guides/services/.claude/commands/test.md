# /test - 웹 테스팅 마스터 에이전트 자동화 명령어

## 🎭 개요
WebTestingMasterAgent를 활용한 엘더베리 프로젝트 전용 웹 애플리케이션 종합 테스팅 자동화 명령어입니다.

## 🚀 사용법

```bash
/test [테스트_유형] [추가_옵션]
```

## 📋 지원하는 테스트 유형

### 1. **종합 테스트** (기본값)
```bash
/test
/test comprehensive
```
- E2E 테스트 (인증, 시설검색, 건강평가)
- Linear Design System 컴포넌트 테스트  
- 웹 성능 측정 (Core Web Vitals)
- 접근성 검증 (WCAG 2.1 AA)
- 시각적 회귀 테스트
- 보안 테스팅

### 2. **E2E 테스트**
```bash
/test e2e
/test e2e --browsers=chromium,firefox
/test e2e --scenarios=login,search,health
```

### 3. **성능 테스트**
```bash
/test performance
/test perf --url=http://localhost:5173
/test performance --thresholds=lcp:2500,fid:100,cls:0.1
```

### 4. **접근성 테스트**
```bash
/test accessibility
/test a11y --level=AA
/test accessibility --report=detailed
```

### 5. **컴포넌트 테스트**
```bash
/test components
/test design-system
/test components --include=Button,Card,Input,Modal
```

### 6. **시각적 회귀 테스트**
```bash
/test visual
/test regression
/test visual --capture=all --compare=baseline
```

## ⚙️ 고급 옵션

### 브라우저 선택
```bash
--browsers=chromium,firefox,webkit
--mobile-browsers=chrome,safari
```

### 테스트 범위
```bash
--include-auth=true          # 인증 시스템 테스트
--include-facilities=true    # 시설 검색 테스트  
--include-health=true        # 건강 평가 테스트
--include-linear=true        # Linear Design System 테스트
```

### 리포트 옵션
```bash
--report=html,json,xml       # 리포트 형식
--detailed-report=true       # 상세 리포트 생성
--github-issue=true          # Critical 이슈 시 GitHub 이슈 자동 생성
```

### 성능 임계값
```bash
--lcp=2500                   # Largest Contentful Paint (ms)  
--fid=100                    # First Input Delay (ms)
--cls=0.1                    # Cumulative Layout Shift
--accessibility=90           # 접근성 점수 임계값
```

## 🎯 실사용 예시

### 1. 엘더베리 전체 시스템 테스트
```bash
/test comprehensive --browsers=chromium,firefox --detailed-report=true --github-issue=true
```

### 2. 로그인 시스템 집중 테스트
```bash
/test e2e --scenarios=login,register,logout --include-auth=true --report=html
```

### 3. Linear Design System 품질 검증
```bash
/test design-system --include=Button,Card,Input,Modal,Badge --themes=light,dark --report=detailed
```

### 4. 모바일 성능 최적화 검증
```bash
/test performance --mobile-browsers=chrome,safari --thresholds=lcp:2000,fid:50,cls:0.05
```

### 5. 접근성 완전 검증
```bash
/test accessibility --level=AA --include=color-contrast,keyboard-nav,screen-reader --report=wcag
```

## 📊 결과 및 리포트

### 자동 생성되는 파일
- `./frontend/playwright-report/elderberry-comprehensive-report-[timestamp].html`
- `./frontend/test-results/screenshots/[browser]-[viewport]-[timestamp].png`
- `./frontend/test-results.json` (CI/CD 통합용)

### Memory 저장 데이터
- 테스트 패턴 학습 데이터
- 성능 베이스라인 데이터  
- 성공/실패 패턴 분석
- 에이전트 간 지식 공유 데이터

## 🔄 CI/CD 통합

### GitHub Actions 워크플로우 예시
```yaml
- name: Run Elderberry Web Tests
  run: /test comprehensive --browsers=chromium --report=json,xml --github-issue=true
```

### 성공 기준
- E2E 테스트: 95% 이상 통과
- Core Web Vitals: 모든 지표 'Good' 등급
- 접근성: WCAG 2.1 AA 등급 달성
- 시각적 회귀: 0건
- 보안: Critical 취약점 0건

## 🧠 WebTestingMasterAgent 특화 기능

### 1. **엘더베리 도메인 특화 테스트**
- 노인 케어 플랫폼 특화 사용자 시나리오
- 국내/해외 거주자 구분 테스트
- 코디네이터 역할별 권한 테스트
- 다국어 (한국어/영어/일본어) 호환성

### 2. **Linear Design System 완전 검증**
- React+TypeScript 컴포넌트 안정성
- 다크/라이트 테마 일관성
- 반응형 디자인 다중 해상도
- 컴포넌트 간 상호작용 검증

### 3. **MCP 도구 통합 활용**
- **Playwright MCP**: 브라우저 자동화 및 테스팅
- **Sequential Thinking**: 체계적 테스트 전략 수립
- **Memory**: 테스트 결과 학습 및 패턴 분석
- **Filesystem**: 테스트 아티팩트 관리
- **GitHub**: Critical 이슈 자동 리포팅

## 🚨 주의사항

### 실행 전 확인사항
1. 엘더베리 서버 실행 상태 확인 (http://localhost:5173, http://localhost:8080)
2. 테스트 데이터베이스 준비 (H2 + Redis)
3. 충분한 디스크 공간 (스크린샷 및 리포트용)

### 권장 실행 환경
- **메모리**: 최소 8GB (16GB 권장)
- **CPU**: 멀티코어 (브라우저 병렬 실행)
- **네트워크**: 안정적인 연결 (외부 리소스 로딩)

## 📈 성능 최적화 팁

### 빠른 테스트 실행
```bash
/test e2e --browsers=chromium --scenarios=login --report=json
```

### 완전한 품질 검증
```bash
/test comprehensive --browsers=chromium,firefox,webkit --detailed-report=true --visual=true --a11y=true
```

### CI/CD 최적화
```bash
/test performance --headless=true --browsers=chromium --report=xml --thresholds=strict
```

## 🎉 성공 사례

### 전형적인 성공 결과
```
✅ E2E 테스트: 47/50 통과 (94%)
✅ Core Web Vitals: LCP 2.1s, FID 65ms, CLS 0.08 (모두 Good)
✅ 접근성: WCAG 2.1 AA 달성 (92점)
✅ Linear Design System: 98% 안정성
✅ 시각적 회귀: 0건 발견
✅ 보안: Critical 취약점 없음

총 소요시간: 8분 32초
종합 점수: A등급 (91.5점)
```

---

**💡 Pro Tip**: `/test`를 정기적으로 실행하여 코드 품질을 지속적으로 모니터링하고, Critical 이슈는 즉시 수정하여 사용자 경험을 최적화하세요!

**🔗 관련 에이전트**: WebTestingMasterAgent, PlaywrightMCPAgent
**📚 참고 문서**: [웹 테스팅 가이드](../guides/web-testing-guide.md), [성능 최적화](../guides/performance-optimization.md)