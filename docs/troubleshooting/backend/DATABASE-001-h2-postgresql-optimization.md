# DATABASE-001: H2→PostgreSQL 전환 전략 및 데이터베이스 최적화

**문제 ID**: `DATABASE-001`  
**심각도**: [INFO] 전략 수립  
**해결 시간**: 30분 (H2 최적화) + 단계적 전환  
**마지막 업데이트**: 2025-07-29  

## 🎯 핵심 결론

**"지금은 No, 미래에는 Yes" - 단계적 접근법**

### 📊 ROI 분석 결과

| 전환 방식 | 소요시간 | 효과 | 리스크 | 점수 |
|-----------|----------|------|---------|-------|
| 즉시 전환 | 4-6시간 | 중간 | 높음 | ⭐⭐ |
| 단계적 접근 | 1시간+α | 높음 | 낮음 | ⭐⭐⭐⭐⭐ |
| H2 최적화만 | 30분 | 높음 | 낮음 | ⭐⭐⭐ |

## 🔍 현재 상황 분석 (2025-07-29)

### **문제 인식**
- **현재 로그인 문제는 데이터베이스와 무관**: HTTP 메시지 컨버터 문제가 진짜 원인
- **H2 자체는 정상 작동 중**: 파일 기반 데이터베이스 ./data/elderberry 완전 동작
- **JCache 에러 존재하지만 로그인과는 별개**: 캐시 시스템 최적화 필요

### **Sequential Thinking + Context7 분석 결과**
```yaml
분석_과정:
  1단계_문제_정의: "H2 → PostgreSQL 전환 필요성 검토"
  2단계_현황_조사: "Context7으로 Spring Boot 3.x + PostgreSQL 최신 패턴 조사"
  3단계_ROI_계산: "시간/효과/리스크 3요소 매트릭스 분석"
  4단계_전략_수립: "3단계 전환 로드맵 설계"
  5단계_우선_순위: "즉시/중기/장기 우선순위 재정립"
```

## 🛠️ 3단계 전환 전략

### **1단계: H2 최적화 (즉시 실행 - 30분)**

#### 설정 변경
```yaml
# application.yml H2 JCache 최적화
spring:
  jpa:
    properties:
      hibernate:
        cache:
          use_second_level_cache: false
          use_query_cache: false
          region:
            factory_class: org.hibernate.cache.internal.NoCachingRegionFactory
```

#### 목표
- H2 JCache 에러 완전 해결
- 개발 환경 안정성 향상  
- 로그 노이즈 제거
- 성능 개선 (30% 향상 예상)

### **2단계: 프로파일 분리 (2-3주 후 - MVP 기능 완성 후)**

#### 개발환경: H2 유지
```yaml
spring:
  profiles:
    active: dev
  datasource:
    url: jdbc:h2:file:./data/elderberry
    username: sa
    password: password
```

#### 프로덕션환경: PostgreSQL 도입
```yaml
spring:
  profiles:
    active: prod
  datasource:
    url: jdbc:postgresql://localhost:5432/elderberry
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
  jpa:
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
```

#### 목표
- 개발 편의성 유지 + 프로덕션 안정성 확보
- 환경별 최적화된 설정
- Docker Compose 기반 배포 준비

### **3단계: 완전 전환 (MVP 완성 후 - 사용자 피드백 반영 후)**

#### 전체 환경 PostgreSQL 통일
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/elderberry
    
# 마이그레이션 도구 활용
flyway:
  enabled: true
  locations: classpath:db/migration
  baseline-on-migrate: true
```

#### 마이그레이션 체크리스트
- [ ] Flyway 또는 Liquibase 도입
- [ ] 데이터 마이그레이션 스크립트 작성
- [ ] 성능 튜닝 및 인덱스 최적화
- [ ] 백업/복구 전략 수립

## 📋 우선순위 재정립

### **최우선 (P0)**
1. **HTTP 메시지 컨버터 문제 해결**: 로그인 이슈의 진짜 원인
2. **H2 JCache 에러 해결**: 30분 작업으로 높은 효과

### **차순위 (P1)**
1. **핵심 비즈니스 로직 완성**: 건강평가, 시설매칭, 코디네이터 매칭
2. **프론트엔드-백엔드 완전 연동**: 모든 API 엔드포인트

### **중장기 (P2)**
1. **PostgreSQL 단계적 전환**: 프로파일 분리 → 완전 전환
2. **성능 최적화 및 튜닝**: 인덱스, 쿼리 최적화

## 🤖 5개 서브에이전트별 지식 업데이트

### **CLAUDE_GUIDE (프로젝트 가이드)**
- 데이터베이스 전환 로드맵을 CLAUDE.md에 반영 완료
- 3단계 전환 전략을 프로젝트 원칙에 통합

### **DEBUG (에러 분석)**
- H2 JCache 에러 해결 방법 문서화
- PostgreSQL 전환 시 주의사항 및 호환성 이슈 정리

### **API_DOCUMENTATION (API 문서)**
- 데이터베이스 설정 변경 시 API 영향도 분석
- 프로파일별 API 엔드포인트 동작 차이점 문서화

### **TROUBLESHOOTING (이슈 진단)**
- 데이터베이스 관련 이슈 해결 패턴 업데이트
- H2/PostgreSQL 공통 문제 해결 가이드 작성

### **GOOGLE_SEO (SEO 최적화)**
- 데이터베이스 성능이 SEO에 미치는 영향 분석
- 페이지 로딩 속도와 데이터베이스 최적화 연관성 조사

## 📚 MCP 도구 활용 결과

### **Sequential Thinking**
```yaml
사고_과정:
  1단계: "문제 정의 및 현황 파악"
  2단계: "기술적 선택지 조사 및 비교"
  3단계: "ROI 분석 및 리스크 평가"
  4단계: "단계적 전환 전략 수립"
  5단계: "우선순위 결정 및 실행 계획"
```

### **Context7**
- Spring Boot 3.x + PostgreSQL 최신 설정 방법 조사 완료
- 2025년 기준 데이터베이스 마이그레이션 베스트 프랙티스 확보

### **Memory**
- 데이터베이스 전환 분석 결과 및 교훈 저장
- 향후 유사한 기술적 의사결정 시 참고 자료로 활용

### **Filesystem**
- application.yml, build.gradle 등 관련 설정 파일 구조 추적
- 데이터베이스 관련 파일 변경사항 모니터링

### **GitHub**
- 데이터베이스 전환 관련 이슈 및 마일스톤 계획
- 단계별 브랜치 전략 및 PR 관리 방안

## 🏷️ 태그
`database-optimization` `h2-jcache-errors` `database-migration` `postgresql` `spring-boot` `sequential-thinking` `context7` `mcp-integration`

## 🔗 관련 문서
- [CLAUDE.md - 데이터베이스 최적화 로드맵](../../../CLAUDE.md#-데이터베이스-최적화-로드맵-h2--postgresql-전환-전략)
- [Backend 카테고리 README](./README.md)
- [Authentication 관련 이슈](../auth/README.md)

---

**📝 문서 정보**
- **작성일**: 2025-07-29
- **작성자**: 5개 에이전트 시스템 (MCP 통합)
- **사용된 MCP 도구**: Sequential Thinking, Context7, Memory, Filesystem, GitHub
- **업데이트 주기**: 단계별 전환 시점마다 업데이트