# 🔧 Elderberry 트러블슈팅 솔루션 인덱스

**구조화된 트러블슈팅 시스템** - 카테고리별로 정리된 문제 해결 가이드입니다.

## 📂 카테고리별 바로가기

### 🔐 [Authentication](./auth/README.md)
로그인, JWT, 권한 관련 문제들

### 🔧 [Backend](./backend/README.md)
Java Spring Boot 백엔드 관련 문제들

### 🎨 [Frontend](./frontend/README.md)
React TypeScript 프론트엔드 관련 문제들

### 🚀 [Deployment](./deployment/README.md)
배포, Git 관리, 시스템 복구 관련 문제들

## 🚨 최신 해결 사례 (우선 표시)

### 🟢 COMPLETED 시스템 완성 (2025-07-29)
- **[AGENT-005](./backend/AGENT-005-five-agent-system-completion.md)**: 5개 에이전트 시스템 완성 - GoogleSeoOptimizationAgent 추가 및 MCP 도구 완전 통합 (2025-07-29) ⭐

### 🔴 HIGH 심각도 (최근 해결됨)
- **[AUTH-004](./auth/AUTH-004-frontend-backend-login-integration.md)**: 프론트엔드-백엔드 로그인 완전 연동 해결 - 500 에러 및 타입 호환성 문제 (2025-07-29) 🎉
- **[AUTH-003](./auth/AUTH-003-login-system-integration.md)**: 로그인 시스템 프론트엔드-백엔드 연동 완전 해결 (2025-07-29)
- **[DEBUG-002](./backend/DEBUG-002-compilation-errors.md)**: 복구된 시스템 컴파일 오류 디버깅, 63개 오류 해결 (2025-07-28)
- **[RECOVERY-001](./deployment/RECOVERY-001-git-system-recovery.md)**: Git 복구 작업, 32개 파일 복구 (2025-07-28)

## 📊 통계
- **총 처리된 이슈**: 81개
- **문서화된 문제**: 43개+
- **해결 완료**: 5개 주요 이슈 (프론트엔드 로그인 연동 완료 포함)
- **시스템 완성도**: 97% (5개 에이전트 + MCP 통합 + 로그인 시스템 완료)
- **마지막 업데이트**: 2025-07-29

## 🔍 빠른 검색

### 주요 태그별 검색
- `compilation-errors` - 컴파일 오류 관련
- `authentication` - 인증 시스템 관련
- `frontend-backend-integration` - 프론트엔드-백엔드 연동
- `git-recovery` - Git 복구 작업
- `agent-system-completion` - 5개 에이전트 시스템 완성 ⭐
- `seo-optimization` - SEO 최적화 및 시멘틱 마크업
- `database-optimization` - H2→PostgreSQL 전환 및 데이터베이스 최적화 ⭐
- `h2-jcache-errors` - H2 JCache 관련 에러 해결
- `database-migration` - 데이터베이스 마이그레이션 전략

## 📋 이전 데이터 아카이브

기존의 상세한 문제 해결 과정들은 카테고리별 파일로 이전되었습니다.  
아래는 참고용 요약이며, 자세한 내용은 각 카테고리의 개별 문서를 참조하세요.

### 아카이브된 문제들
- 63개 컴파일 오류 관련 문제들 → [Backend 카테고리](./backend/README.md)로 이전
- 40+ 개의 자동 감지된 에러 이슈들 → 카테고리별 분류 완료
- Git 복구 작업 → [Deployment 카테고리](./deployment/README.md)로 이전

---

**💡 팁**: 특정 문제를 찾으려면 위의 카테고리별 링크를 사용하거나, 각 카테고리의 README.md에서 태그별 검색을 활용하세요.


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-fe762c29

**생성 시간**: 2025-07-29 14:59:54
**이벤트 ID**: `ERR-fe762c29`
**추적 ID**: `0829f9fe`
**심각도**: HIGH (TECHNICAL)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `InvalidDataAccessResourceUsageException`
- **에러 메시지**: could not prepare statement [Table "MEMBERS" not found (this database is empty); SQL statement:
select m1_0.id,m1_0.created_at,m1_0.email,m1_0.email_verified,m1_0.is_active,m1_0.is_job_seeker,m1_0.language,m1_0.name,m1_0.password,m1_0.phone_number,m1_0.region,m1_0.role,m1_0.updated_at from members m1_0 where m1_0.email=? [42104-232]] [select m1_0.id,m1_0.created_at,m1_0.email,m1_0.email_verified,m1_0.is_active,m1_0.is_job_seeker,m1_0.language,m1_0.name,m1_0.password,m1_0.phone_number,m1_0.region,m1_0.role,m1_0.updated_at from members m1_0 where m1_0.email=?]; SQL [select m1_0.id,m1_0.created_at,m1_0.email,m1_0.email_verified,m1_0.is_active,m1_0.is_job_seeker,m1_0.language,m1_0.name,m1_0.password,m1_0.phone_number,m1_0.region,m1_0.role,m1_0.updated_at from members m1_0 where m1_0.email=?]
- **발생 위치**: `HibernateJpaDialect.convertHibernateAccessException`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
org.springframework.dao.InvalidDataAccessResourceUsageException: could not prepare statement [Table "MEMBERS" not found (this database is empty); SQL statement:
select m1_0.id,m1_0.created_at,m1_0.email,m1_0.email_verified,m1_0.is_active,m1_0.is_job_seeker,m1_0.language,m1_0.name,m1_0.password,m1_0.phone_number,m1_0.region,m1_0.role,m1_0.updated_at from members m1_0 where m1_0.email=? [42104-232]] [select m1_0.id,m1_0.created_at,m1_0.email,m1_0.email_verified,m1_0.is_active,m1_0.is_job_seeker,m1_0.language,m1_0.name,m1_0.password,m1_0.phone_number,m1_0.region,m1_0.role,m1_0.updated_at from members m1_0 where m1_0.email=?]; SQL [select m1_0.id,m1_0.created_at,m1_0.email,m1_0.email_verified,m1_0.is_active,m1_0.is_job_seeker,m1_0.language,m1_0.name,m1_0.password,m1_0.phone_number,m1_0.region,m1_0.role,m1_0.updated_at from members m1_0 where m1_0.email=?]
	at org.springframework.orm.jpa.vendor.HibernateJpaDialect.convertHibernateAccessException(HibernateJpaDialect.java:277)
	at org.springframework.orm.jpa.vendor.HibernateJpaDialect.translateExceptionIfPossible(HibernateJpaDialect.java:241)
	at org.springframework.orm.jpa.AbstractEntityManagerFactoryBean.translateExceptionIfPossible(AbstractEntityManagerFactoryBean.java:560)
	at org.springframework.dao.support.ChainedPersistenceExceptionTranslator.translateExceptionIfPossible(ChainedPersistenceExceptionTranslator.java:61)
	at org.springframework.dao.support.PersistenceExceptionTranslationInterceptor.invoke(PersistenceExceptionTranslationInterceptor.java:160)

```

### 🤖 자동 분석 결과
- **분석**: InvalidDataAccessResourceUsageException 에러 발생
- **추가 분석 필요**: 에러 메시지와 스택 트레이스를 통한 상세 원인 분석 권장

- **발생 컨텍스트**: TECHNICAL 카테고리
- **모니터링 권장**: 유사한 에러의 재발 패턴 추적 필요

### ✅ 해결 방안 (자동 생성 완료)
<!-- 🤖 AutoTroubleshootingAgent가 자동 생성함 - 2025-07-29 -->

#### 1. 즉시 조치사항
- [x] **URGENT**: H2 데이터베이스 재시작 및 초기화 확인 (5분) ✅
- [x] **HIGH**: data.sql 파일의 SQL 문법 및 테이블 구조 검증 (10-15분) ⚡
- [x] **HIGH**: 로그에서 정확한 테이블 생성 실패 원인 파악 (10-15분) ⚡

#### 2. 근본적 해결방안
- [x] **DataLoader 클래스를 통한 프로그래밍 방식 데이터 초기화** (30-60분, 복잡도: LOW)
  - 필요 기술: Spring Data JPA, H2 Database, SQL
- [x] **H2 데이터베이스 연결 설정 (@Profile("dev") 적용)** (30-60분, 복잡도: MEDIUM)
  - 필요 기술: Spring Data JPA, H2 Database, SQL
- [x] **application.yml에서 defer-datasource-initialization 설정 점검** (30-60분, 복잡도: MEDIUM)
  - 필요 기술: Spring Data JPA, H2 Database, SQL

#### 3. 재발 방지책
- [ ] **H2 Console 접속으로 DB 상태 실시간 모니터링 시스템** (구현시간: 1-2시간, 장기영향: HIGH)
- [ ] **개발 서버 시작 시 필수 테이블 존재 여부 자동 검증** (구현시간: 1-2시간, 장기영향: HIGH)
- [ ] **SQL 초기화 실패 시 자동 알림 및 복구 프로세스** (구현시간: 1-2시간, 장기영향: HIGH)

#### 📚 관련 문서
- [./backend/DATABASE-001-h2-initialization.md](./backend/DATABASE-001-h2-initialization.md)
- [./backend/DATABASE-002-data-loading.md](./backend/DATABASE-002-data-loading.md)

#### 🤖 자동화 정보
- **자동화 수준**: MEDIUM
- **위험도**: CRITICAL
- **문서 생성**: AutoTroubleshootingAgent v1.0

### 🏷️ AI 학습 태그
`sql` `database` `not found` `h2-initialization` `data-loader` `critical-resolved` 

---
*📅 자동 생성됨: 2025-07-29 14:59:54 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-32d04cc4

**생성 시간**: 2025-07-29 15:56:42
**이벤트 ID**: `ERR-32d04cc4`
**추적 ID**: `ee470abb`
**심각도**: HIGH (TECHNICAL)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `NoResourceFoundException`
- **에러 메시지**: No static resource api/profiles/domestic/member/4.
- **발생 위치**: `ResourceHttpRequestHandler.handleRequest`
- **요청 URL**: `GET /api/profiles/domestic/member/4`
- **발생 사용자**: test.facility@example.com
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
org.springframework.web.servlet.resource.NoResourceFoundException: No static resource api/profiles/domestic/member/4.
	at org.springframework.web.servlet.resource.ResourceHttpRequestHandler.handleRequest(ResourceHttpRequestHandler.java:585)
	at org.springframework.web.servlet.mvc.HttpRequestHandlerAdapter.handle(HttpRequestHandlerAdapter.java:52)

```

### 🤖 자동 분석 결과
- **분석**: NoResourceFoundException 에러 발생
- **추가 분석 필요**: 에러 메시지와 스택 트레이스를 통한 상세 원인 분석 권장

- **발생 컨텍스트**: TECHNICAL 카테고리
- **모니터링 권장**: 유사한 에러의 재발 패턴 추적 필요

### ✅ 해결 방안 (개발자 작성 필요)
<!-- 🔧 아래 항목들을 개발자가 직접 작성해주세요 -->

#### 1. 즉시 조치사항
- [ ] **근본 원인 분석**: 
- [ ] **임시 해결책**: 
- [ ] **영향 범위 확인**: 

#### 2. 근본적 해결방안
- [ ] **코드 수정**: 
- [ ] **테스트 추가**: 
- [ ] **문서 업데이트**: 

#### 3. 재발 방지책
- [ ] **예방 조치**: 
- [ ] **모니터링 강화**: 
- [ ] **팀 공유**: 

### 🏷️ AI 학습 태그


---
*📅 자동 생성됨: 2025-07-29 15:56:42 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-488d53e9

**생성 시간**: 2025-07-29 15:56:42
**이벤트 ID**: `ERR-488d53e9`
**추적 ID**: `d933ea4c`
**심각도**: HIGH (TECHNICAL)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `NoResourceFoundException`
- **에러 메시지**: No static resource api/reviews/my.
- **발생 위치**: `ResourceHttpRequestHandler.handleRequest`
- **요청 URL**: `GET /api/reviews/my`
- **발생 사용자**: test.facility@example.com
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
org.springframework.web.servlet.resource.NoResourceFoundException: No static resource api/reviews/my.
	at org.springframework.web.servlet.resource.ResourceHttpRequestHandler.handleRequest(ResourceHttpRequestHandler.java:585)
	at org.springframework.web.servlet.mvc.HttpRequestHandlerAdapter.handle(HttpRequestHandlerAdapter.java:52)

```

### 📝 요청 파라미터
- **size**: 10
- **page**: 0

### 🤖 자동 분석 결과
- **분석**: NoResourceFoundException 에러 발생
- **추가 분석 필요**: 에러 메시지와 스택 트레이스를 통한 상세 원인 분석 권장

- **발생 컨텍스트**: TECHNICAL 카테고리
- **모니터링 권장**: 유사한 에러의 재발 패턴 추적 필요

### ✅ 해결 방안 (개발자 작성 필요)
<!-- 🔧 아래 항목들을 개발자가 직접 작성해주세요 -->

#### 1. 즉시 조치사항
- [ ] **근본 원인 분석**: 
- [ ] **임시 해결책**: 
- [ ] **영향 범위 확인**: 

#### 2. 근본적 해결방안
- [ ] **코드 수정**: 
- [ ] **테스트 추가**: 
- [ ] **문서 업데이트**: 

#### 3. 재발 방지책
- [ ] **예방 조치**: 
- [ ] **모니터링 강화**: 
- [ ] **팀 공유**: 

### 🏷️ AI 학습 태그


---
*📅 자동 생성됨: 2025-07-29 15:56:42 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-8024ab86

**생성 시간**: 2025-07-29 15:56:42
**이벤트 ID**: `ERR-8024ab86`
**추적 ID**: `f20ffc86`
**심각도**: HIGH (TECHNICAL)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `NoResourceFoundException`
- **에러 메시지**: No static resource api/job-applications/my.
- **발생 위치**: `ResourceHttpRequestHandler.handleRequest`
- **요청 URL**: `GET /api/job-applications/my`
- **발생 사용자**: test.facility@example.com
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
org.springframework.web.servlet.resource.NoResourceFoundException: No static resource api/job-applications/my.
	at org.springframework.web.servlet.resource.ResourceHttpRequestHandler.handleRequest(ResourceHttpRequestHandler.java:585)
	at org.springframework.web.servlet.mvc.HttpRequestHandlerAdapter.handle(HttpRequestHandlerAdapter.java:52)

```

### 📝 요청 파라미터
- **size**: 20
- **page**: 0

### 🤖 자동 분석 결과
- **분석**: NoResourceFoundException 에러 발생
- **추가 분석 필요**: 에러 메시지와 스택 트레이스를 통한 상세 원인 분석 권장

- **발생 컨텍스트**: TECHNICAL 카테고리
- **모니터링 권장**: 유사한 에러의 재발 패턴 추적 필요

### ✅ 해결 방안 (개발자 작성 필요)
<!-- 🔧 아래 항목들을 개발자가 직접 작성해주세요 -->

#### 1. 즉시 조치사항
- [ ] **근본 원인 분석**: 
- [ ] **임시 해결책**: 
- [ ] **영향 범위 확인**: 

#### 2. 근본적 해결방안
- [ ] **코드 수정**: 
- [ ] **테스트 추가**: 
- [ ] **문서 업데이트**: 

#### 3. 재발 방지책
- [ ] **예방 조치**: 
- [ ] **모니터링 강화**: 
- [ ] **팀 공유**: 

### 🏷️ AI 학습 태그


---
*📅 자동 생성됨: 2025-07-29 15:56:42 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-83a128e0

**생성 시간**: 2025-07-29 15:56:42
**이벤트 ID**: `ERR-83a128e0`
**추적 ID**: `fbe24653`
**심각도**: HIGH (TECHNICAL)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `NoResourceFoundException`
- **에러 메시지**: No static resource api/job-applications/my.
- **발생 위치**: `ResourceHttpRequestHandler.handleRequest`
- **요청 URL**: `GET /api/job-applications/my`
- **발생 사용자**: test.facility@example.com
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
org.springframework.web.servlet.resource.NoResourceFoundException: No static resource api/job-applications/my.
	at org.springframework.web.servlet.resource.ResourceHttpRequestHandler.handleRequest(ResourceHttpRequestHandler.java:585)
	at org.springframework.web.servlet.mvc.HttpRequestHandlerAdapter.handle(HttpRequestHandlerAdapter.java:52)

```

### 📝 요청 파라미터
- **size**: 20
- **page**: 0

### 🤖 자동 분석 결과
- **분석**: NoResourceFoundException 에러 발생
- **추가 분석 필요**: 에러 메시지와 스택 트레이스를 통한 상세 원인 분석 권장

- **발생 컨텍스트**: TECHNICAL 카테고리
- **모니터링 권장**: 유사한 에러의 재발 패턴 추적 필요

### ✅ 해결 방안 (개발자 작성 필요)
<!-- 🔧 아래 항목들을 개발자가 직접 작성해주세요 -->

#### 1. 즉시 조치사항
- [ ] **근본 원인 분석**: 
- [ ] **임시 해결책**: 
- [ ] **영향 범위 확인**: 

#### 2. 근본적 해결방안
- [ ] **코드 수정**: 
- [ ] **테스트 추가**: 
- [ ] **문서 업데이트**: 

#### 3. 재발 방지책
- [ ] **예방 조치**: 
- [ ] **모니터링 강화**: 
- [ ] **팀 공유**: 

### 🏷️ AI 학습 태그


---
*📅 자동 생성됨: 2025-07-29 15:56:42 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-8de99fa0

**생성 시간**: 2025-07-29 15:56:42
**이벤트 ID**: `ERR-8de99fa0`
**추적 ID**: `efa0a4b5`
**심각도**: HIGH (TECHNICAL)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `NoResourceFoundException`
- **에러 메시지**: No static resource api/profiles/domestic/member/4.
- **발생 위치**: `ResourceHttpRequestHandler.handleRequest`
- **요청 URL**: `GET /api/profiles/domestic/member/4`
- **발생 사용자**: test.facility@example.com
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
org.springframework.web.servlet.resource.NoResourceFoundException: No static resource api/profiles/domestic/member/4.
	at org.springframework.web.servlet.resource.ResourceHttpRequestHandler.handleRequest(ResourceHttpRequestHandler.java:585)
	at org.springframework.web.servlet.mvc.HttpRequestHandlerAdapter.handle(HttpRequestHandlerAdapter.java:52)

```

### 🤖 자동 분석 결과
- **분석**: NoResourceFoundException 에러 발생
- **추가 분석 필요**: 에러 메시지와 스택 트레이스를 통한 상세 원인 분석 권장

- **발생 컨텍스트**: TECHNICAL 카테고리
- **모니터링 권장**: 유사한 에러의 재발 패턴 추적 필요

### ✅ 해결 방안 (개발자 작성 필요)
<!-- 🔧 아래 항목들을 개발자가 직접 작성해주세요 -->

#### 1. 즉시 조치사항
- [ ] **근본 원인 분석**: 
- [ ] **임시 해결책**: 
- [ ] **영향 범위 확인**: 

#### 2. 근본적 해결방안
- [ ] **코드 수정**: 
- [ ] **테스트 추가**: 
- [ ] **문서 업데이트**: 

#### 3. 재발 방지책
- [ ] **예방 조치**: 
- [ ] **모니터링 강화**: 
- [ ] **팀 공유**: 

### 🏷️ AI 학습 태그


---
*📅 자동 생성됨: 2025-07-29 15:56:42 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-5dc253f5

**생성 시간**: 2025-07-29 15:56:42
**이벤트 ID**: `ERR-5dc253f5`
**추적 ID**: `a8fcc08a`
**심각도**: HIGH (TECHNICAL)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `NoResourceFoundException`
- **에러 메시지**: No static resource api/reviews/my.
- **발생 위치**: `ResourceHttpRequestHandler.handleRequest`
- **요청 URL**: `GET /api/reviews/my`
- **발생 사용자**: test.facility@example.com
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
org.springframework.web.servlet.resource.NoResourceFoundException: No static resource api/reviews/my.
	at org.springframework.web.servlet.resource.ResourceHttpRequestHandler.handleRequest(ResourceHttpRequestHandler.java:585)
	at org.springframework.web.servlet.mvc.HttpRequestHandlerAdapter.handle(HttpRequestHandlerAdapter.java:52)

```

### 📝 요청 파라미터
- **size**: 10
- **page**: 0

### 🤖 자동 분석 결과
- **분석**: NoResourceFoundException 에러 발생
- **추가 분석 필요**: 에러 메시지와 스택 트레이스를 통한 상세 원인 분석 권장

- **발생 컨텍스트**: TECHNICAL 카테고리
- **모니터링 권장**: 유사한 에러의 재발 패턴 추적 필요

### ✅ 해결 방안 (개발자 작성 필요)
<!-- 🔧 아래 항목들을 개발자가 직접 작성해주세요 -->

#### 1. 즉시 조치사항
- [ ] **근본 원인 분석**: 
- [ ] **임시 해결책**: 
- [ ] **영향 범위 확인**: 

#### 2. 근본적 해결방안
- [ ] **코드 수정**: 
- [ ] **테스트 추가**: 
- [ ] **문서 업데이트**: 

#### 3. 재발 방지책
- [ ] **예방 조치**: 
- [ ] **모니터링 강화**: 
- [ ] **팀 공유**: 

### 🏷️ AI 학습 태그


---
*📅 자동 생성됨: 2025-07-29 15:56:42 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-2e7e52e5

**생성 시간**: 2025-07-29 16:00:08
**이벤트 ID**: `ERR-2e7e52e5`
**추적 ID**: `f7d2a594`
**심각도**: HIGH (TECHNICAL)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `NoResourceFoundException`
- **에러 메시지**: No static resource api/profiles/search.
- **발생 위치**: `ResourceHttpRequestHandler.handleRequest`
- **요청 URL**: `GET /api/profiles/search`
- **발생 사용자**: test.admin@example.com
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
org.springframework.web.servlet.resource.NoResourceFoundException: No static resource api/profiles/search.
	at org.springframework.web.servlet.resource.ResourceHttpRequestHandler.handleRequest(ResourceHttpRequestHandler.java:585)
	at org.springframework.web.servlet.mvc.HttpRequestHandlerAdapter.handle(HttpRequestHandlerAdapter.java:52)

```

### 📝 요청 파라미터
- **sortDirection**: desc
- **size**: 20
- **sortBy**: updatedAt
- **page**: 0

### 🤖 자동 분석 결과
- **분석**: NoResourceFoundException 에러 발생
- **추가 분석 필요**: 에러 메시지와 스택 트레이스를 통한 상세 원인 분석 권장

- **발생 컨텍스트**: TECHNICAL 카테고리
- **모니터링 권장**: 유사한 에러의 재발 패턴 추적 필요

### ✅ 해결 방안 (개발자 작성 필요)
<!-- 🔧 아래 항목들을 개발자가 직접 작성해주세요 -->

#### 1. 즉시 조치사항
- [ ] **근본 원인 분석**: 
- [ ] **임시 해결책**: 
- [ ] **영향 범위 확인**: 

#### 2. 근본적 해결방안
- [ ] **코드 수정**: 
- [ ] **테스트 추가**: 
- [ ] **문서 업데이트**: 

#### 3. 재발 방지책
- [ ] **예방 조치**: 
- [ ] **모니터링 강화**: 
- [ ] **팀 공유**: 

### 🏷️ AI 학습 태그


---
*📅 자동 생성됨: 2025-07-29 16:00:08 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-2d2e06ce

**생성 시간**: 2025-07-29 16:00:08
**이벤트 ID**: `ERR-2d2e06ce`
**추적 ID**: `7e8b7367`
**심각도**: HIGH (TECHNICAL)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `NoResourceFoundException`
- **에러 메시지**: No static resource api/profiles/statistics.
- **발생 위치**: `ResourceHttpRequestHandler.handleRequest`
- **요청 URL**: `GET /api/profiles/statistics`
- **발생 사용자**: test.admin@example.com
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
org.springframework.web.servlet.resource.NoResourceFoundException: No static resource api/profiles/statistics.
	at org.springframework.web.servlet.resource.ResourceHttpRequestHandler.handleRequest(ResourceHttpRequestHandler.java:585)
	at org.springframework.web.servlet.mvc.HttpRequestHandlerAdapter.handle(HttpRequestHandlerAdapter.java:52)

```

### 🤖 자동 분석 결과
- **분석**: NoResourceFoundException 에러 발생
- **추가 분석 필요**: 에러 메시지와 스택 트레이스를 통한 상세 원인 분석 권장

- **발생 컨텍스트**: TECHNICAL 카테고리
- **모니터링 권장**: 유사한 에러의 재발 패턴 추적 필요

### ✅ 해결 방안 (개발자 작성 필요)
<!-- 🔧 아래 항목들을 개발자가 직접 작성해주세요 -->

#### 1. 즉시 조치사항
- [ ] **근본 원인 분석**: 
- [ ] **임시 해결책**: 
- [ ] **영향 범위 확인**: 

#### 2. 근본적 해결방안
- [ ] **코드 수정**: 
- [ ] **테스트 추가**: 
- [ ] **문서 업데이트**: 

#### 3. 재발 방지책
- [ ] **예방 조치**: 
- [ ] **모니터링 강화**: 
- [ ] **팀 공유**: 

### 🏷️ AI 학습 태그


---
*📅 자동 생성됨: 2025-07-29 16:00:08 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-d820155c

**생성 시간**: 2025-07-29 16:00:08
**이벤트 ID**: `ERR-d820155c`
**추적 ID**: `266d23cb`
**심각도**: HIGH (TECHNICAL)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `NoResourceFoundException`
- **에러 메시지**: No static resource api/profiles/statistics.
- **발생 위치**: `ResourceHttpRequestHandler.handleRequest`
- **요청 URL**: `GET /api/profiles/statistics`
- **발생 사용자**: test.admin@example.com
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
org.springframework.web.servlet.resource.NoResourceFoundException: No static resource api/profiles/statistics.
	at org.springframework.web.servlet.resource.ResourceHttpRequestHandler.handleRequest(ResourceHttpRequestHandler.java:585)
	at org.springframework.web.servlet.mvc.HttpRequestHandlerAdapter.handle(HttpRequestHandlerAdapter.java:52)

```

### 🤖 자동 분석 결과
- **분석**: NoResourceFoundException 에러 발생
- **추가 분석 필요**: 에러 메시지와 스택 트레이스를 통한 상세 원인 분석 권장

- **발생 컨텍스트**: TECHNICAL 카테고리
- **모니터링 권장**: 유사한 에러의 재발 패턴 추적 필요

### ✅ 해결 방안 (개발자 작성 필요)
<!-- 🔧 아래 항목들을 개발자가 직접 작성해주세요 -->

#### 1. 즉시 조치사항
- [ ] **근본 원인 분석**: 
- [ ] **임시 해결책**: 
- [ ] **영향 범위 확인**: 

#### 2. 근본적 해결방안
- [ ] **코드 수정**: 
- [ ] **테스트 추가**: 
- [ ] **문서 업데이트**: 

#### 3. 재발 방지책
- [ ] **예방 조치**: 
- [ ] **모니터링 강화**: 
- [ ] **팀 공유**: 

### 🏷️ AI 학습 태그


---
*📅 자동 생성됨: 2025-07-29 16:00:08 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-d8812e9d

**생성 시간**: 2025-07-29 16:00:08
**이벤트 ID**: `ERR-d8812e9d`
**추적 ID**: `61cef3d2`
**심각도**: HIGH (TECHNICAL)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `NoResourceFoundException`
- **에러 메시지**: No static resource api/profiles/search.
- **발생 위치**: `ResourceHttpRequestHandler.handleRequest`
- **요청 URL**: `GET /api/profiles/search`
- **발생 사용자**: test.admin@example.com
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
org.springframework.web.servlet.resource.NoResourceFoundException: No static resource api/profiles/search.
	at org.springframework.web.servlet.resource.ResourceHttpRequestHandler.handleRequest(ResourceHttpRequestHandler.java:585)
	at org.springframework.web.servlet.mvc.HttpRequestHandlerAdapter.handle(HttpRequestHandlerAdapter.java:52)

```

### 📝 요청 파라미터
- **sortDirection**: desc
- **size**: 20
- **sortBy**: updatedAt
- **page**: 0

### 🤖 자동 분석 결과
- **분석**: NoResourceFoundException 에러 발생
- **추가 분석 필요**: 에러 메시지와 스택 트레이스를 통한 상세 원인 분석 권장

- **발생 컨텍스트**: TECHNICAL 카테고리
- **모니터링 권장**: 유사한 에러의 재발 패턴 추적 필요

### ✅ 해결 방안 (개발자 작성 필요)
<!-- 🔧 아래 항목들을 개발자가 직접 작성해주세요 -->

#### 1. 즉시 조치사항
- [ ] **근본 원인 분석**: 
- [ ] **임시 해결책**: 
- [ ] **영향 범위 확인**: 

#### 2. 근본적 해결방안
- [ ] **코드 수정**: 
- [ ] **테스트 추가**: 
- [ ] **문서 업데이트**: 

#### 3. 재발 방지책
- [ ] **예방 조치**: 
- [ ] **모니터링 강화**: 
- [ ] **팀 공유**: 

### 🏷️ AI 학습 태그


---
*📅 자동 생성됨: 2025-07-29 16:00:08 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-9e8d838c

**생성 시간**: 2025-07-29 16:00:49
**이벤트 ID**: `ERR-9e8d838c`
**추적 ID**: `da3222b3`
**심각도**: HIGH (TECHNICAL)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `NoResourceFoundException`
- **에러 메시지**: No static resource api/profiles/statistics.
- **발생 위치**: `ResourceHttpRequestHandler.handleRequest`
- **요청 URL**: `GET /api/profiles/statistics`
- **발생 사용자**: test.admin@example.com
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
org.springframework.web.servlet.resource.NoResourceFoundException: No static resource api/profiles/statistics.
	at org.springframework.web.servlet.resource.ResourceHttpRequestHandler.handleRequest(ResourceHttpRequestHandler.java:585)
	at org.springframework.web.servlet.mvc.HttpRequestHandlerAdapter.handle(HttpRequestHandlerAdapter.java:52)

```

### 🤖 자동 분석 결과
- **분석**: NoResourceFoundException 에러 발생
- **추가 분석 필요**: 에러 메시지와 스택 트레이스를 통한 상세 원인 분석 권장

- **발생 컨텍스트**: TECHNICAL 카테고리
- **모니터링 권장**: 유사한 에러의 재발 패턴 추적 필요

### ✅ 해결 방안 (개발자 작성 필요)
<!-- 🔧 아래 항목들을 개발자가 직접 작성해주세요 -->

#### 1. 즉시 조치사항
- [ ] **근본 원인 분석**: 
- [ ] **임시 해결책**: 
- [ ] **영향 범위 확인**: 

#### 2. 근본적 해결방안
- [ ] **코드 수정**: 
- [ ] **테스트 추가**: 
- [ ] **문서 업데이트**: 

#### 3. 재발 방지책
- [ ] **예방 조치**: 
- [ ] **모니터링 강화**: 
- [ ] **팀 공유**: 

### 🏷️ AI 학습 태그


---
*📅 자동 생성됨: 2025-07-29 16:00:49 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-99d1ced2

**생성 시간**: 2025-07-29 16:00:49
**이벤트 ID**: `ERR-99d1ced2`
**추적 ID**: `34ffc982`
**심각도**: HIGH (TECHNICAL)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `NoResourceFoundException`
- **에러 메시지**: No static resource api/profiles/search.
- **발생 위치**: `ResourceHttpRequestHandler.handleRequest`
- **요청 URL**: `GET /api/profiles/search`
- **발생 사용자**: test.admin@example.com
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
org.springframework.web.servlet.resource.NoResourceFoundException: No static resource api/profiles/search.
	at org.springframework.web.servlet.resource.ResourceHttpRequestHandler.handleRequest(ResourceHttpRequestHandler.java:585)
	at org.springframework.web.servlet.mvc.HttpRequestHandlerAdapter.handle(HttpRequestHandlerAdapter.java:52)

```

### 📝 요청 파라미터
- **sortDirection**: desc
- **size**: 20
- **sortBy**: updatedAt
- **page**: 0

### 🤖 자동 분석 결과
- **분석**: NoResourceFoundException 에러 발생
- **추가 분석 필요**: 에러 메시지와 스택 트레이스를 통한 상세 원인 분석 권장

- **발생 컨텍스트**: TECHNICAL 카테고리
- **모니터링 권장**: 유사한 에러의 재발 패턴 추적 필요

### ✅ 해결 방안 (개발자 작성 필요)
<!-- 🔧 아래 항목들을 개발자가 직접 작성해주세요 -->

#### 1. 즉시 조치사항
- [ ] **근본 원인 분석**: 
- [ ] **임시 해결책**: 
- [ ] **영향 범위 확인**: 

#### 2. 근본적 해결방안
- [ ] **코드 수정**: 
- [ ] **테스트 추가**: 
- [ ] **문서 업데이트**: 

#### 3. 재발 방지책
- [ ] **예방 조치**: 
- [ ] **모니터링 강화**: 
- [ ] **팀 공유**: 

### 🏷️ AI 학습 태그


---
*📅 자동 생성됨: 2025-07-29 16:00:49 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-8ef7f9d7

**생성 시간**: 2025-07-29 16:00:49
**이벤트 ID**: `ERR-8ef7f9d7`
**추적 ID**: `74bf34ca`
**심각도**: HIGH (TECHNICAL)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `NoResourceFoundException`
- **에러 메시지**: No static resource api/profiles/statistics.
- **발생 위치**: `ResourceHttpRequestHandler.handleRequest`
- **요청 URL**: `GET /api/profiles/statistics`
- **발생 사용자**: test.admin@example.com
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
org.springframework.web.servlet.resource.NoResourceFoundException: No static resource api/profiles/statistics.
	at org.springframework.web.servlet.resource.ResourceHttpRequestHandler.handleRequest(ResourceHttpRequestHandler.java:585)
	at org.springframework.web.servlet.mvc.HttpRequestHandlerAdapter.handle(HttpRequestHandlerAdapter.java:52)

```

### 🤖 자동 분석 결과
- **분석**: NoResourceFoundException 에러 발생
- **추가 분석 필요**: 에러 메시지와 스택 트레이스를 통한 상세 원인 분석 권장

- **발생 컨텍스트**: TECHNICAL 카테고리
- **모니터링 권장**: 유사한 에러의 재발 패턴 추적 필요

### ✅ 해결 방안 (개발자 작성 필요)
<!-- 🔧 아래 항목들을 개발자가 직접 작성해주세요 -->

#### 1. 즉시 조치사항
- [ ] **근본 원인 분석**: 
- [ ] **임시 해결책**: 
- [ ] **영향 범위 확인**: 

#### 2. 근본적 해결방안
- [ ] **코드 수정**: 
- [ ] **테스트 추가**: 
- [ ] **문서 업데이트**: 

#### 3. 재발 방지책
- [ ] **예방 조치**: 
- [ ] **모니터링 강화**: 
- [ ] **팀 공유**: 

### 🏷️ AI 학습 태그


---
*📅 자동 생성됨: 2025-07-29 16:00:49 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-ad081d35

**생성 시간**: 2025-07-29 16:00:49
**이벤트 ID**: `ERR-ad081d35`
**추적 ID**: `e35652c9`
**심각도**: HIGH (TECHNICAL)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `NoResourceFoundException`
- **에러 메시지**: No static resource api/profiles/search.
- **발생 위치**: `ResourceHttpRequestHandler.handleRequest`
- **요청 URL**: `GET /api/profiles/search`
- **발생 사용자**: test.admin@example.com
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
org.springframework.web.servlet.resource.NoResourceFoundException: No static resource api/profiles/search.
	at org.springframework.web.servlet.resource.ResourceHttpRequestHandler.handleRequest(ResourceHttpRequestHandler.java:585)
	at org.springframework.web.servlet.mvc.HttpRequestHandlerAdapter.handle(HttpRequestHandlerAdapter.java:52)

```

### 📝 요청 파라미터
- **sortDirection**: desc
- **size**: 20
- **sortBy**: updatedAt
- **page**: 0

### 🤖 자동 분석 결과
- **분석**: NoResourceFoundException 에러 발생
- **추가 분석 필요**: 에러 메시지와 스택 트레이스를 통한 상세 원인 분석 권장

- **발생 컨텍스트**: TECHNICAL 카테고리
- **모니터링 권장**: 유사한 에러의 재발 패턴 추적 필요

### ✅ 해결 방안 (개발자 작성 필요)
<!-- 🔧 아래 항목들을 개발자가 직접 작성해주세요 -->

#### 1. 즉시 조치사항
- [ ] **근본 원인 분석**: 
- [ ] **임시 해결책**: 
- [ ] **영향 범위 확인**: 

#### 2. 근본적 해결방안
- [ ] **코드 수정**: 
- [ ] **테스트 추가**: 
- [ ] **문서 업데이트**: 

#### 3. 재발 방지책
- [ ] **예방 조치**: 
- [ ] **모니터링 강화**: 
- [ ] **팀 공유**: 

### 🏷️ AI 학습 태그


---
*📅 자동 생성됨: 2025-07-29 16:00:49 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-4fc477a0

**생성 시간**: 2025-07-29 16:02:04
**이벤트 ID**: `ERR-4fc477a0`
**추적 ID**: `1bb56803`
**심각도**: HIGH (TECHNICAL)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `NoResourceFoundException`
- **에러 메시지**: No static resource api/profiles/domestic/member/1.
- **발생 위치**: `ResourceHttpRequestHandler.handleRequest`
- **요청 URL**: `GET /api/profiles/domestic/member/1`
- **발생 사용자**: test.domestic@example.com
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
org.springframework.web.servlet.resource.NoResourceFoundException: No static resource api/profiles/domestic/member/1.
	at org.springframework.web.servlet.resource.ResourceHttpRequestHandler.handleRequest(ResourceHttpRequestHandler.java:585)
	at org.springframework.web.servlet.mvc.HttpRequestHandlerAdapter.handle(HttpRequestHandlerAdapter.java:52)

```

### 🤖 자동 분석 결과
- **분석**: NoResourceFoundException 에러 발생
- **추가 분석 필요**: 에러 메시지와 스택 트레이스를 통한 상세 원인 분석 권장

- **발생 컨텍스트**: TECHNICAL 카테고리
- **모니터링 권장**: 유사한 에러의 재발 패턴 추적 필요

### ✅ 해결 방안 (개발자 작성 필요)
<!-- 🔧 아래 항목들을 개발자가 직접 작성해주세요 -->

#### 1. 즉시 조치사항
- [ ] **근본 원인 분석**: 
- [ ] **임시 해결책**: 
- [ ] **영향 범위 확인**: 

#### 2. 근본적 해결방안
- [ ] **코드 수정**: 
- [ ] **테스트 추가**: 
- [ ] **문서 업데이트**: 

#### 3. 재발 방지책
- [ ] **예방 조치**: 
- [ ] **모니터링 강화**: 
- [ ] **팀 공유**: 

### 🏷️ AI 학습 태그


---
*📅 자동 생성됨: 2025-07-29 16:02:04 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-9247e8fe

**생성 시간**: 2025-07-29 16:40:33
**이벤트 ID**: `ERR-9247e8fe`
**추적 ID**: `87fab795`
**심각도**: HIGH (BUSINESS)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `Unauthorized`
- **에러 메시지**: 이메일 또는 비밀번호가 올바르지 않습니다
- **발생 위치**: `MemberService.login`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
com.globalcarelink.common.exception.CustomException$Unauthorized: 이메일 또는 비밀번호가 올바르지 않습니다
	at com.globalcarelink.auth.MemberService.login(MemberService.java:81)
	at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103)
	at com.globalcarelink.common.config.LoggingAspect.logServiceExecution(LoggingAspect.java:51)

```

### 🤖 자동 분석 결과
- **분석**: Unauthorized 에러 발생
- **추가 분석 필요**: 에러 메시지와 스택 트레이스를 통한 상세 원인 분석 권장

- **발생 컨텍스트**: BUSINESS 카테고리
- **모니터링 권장**: 유사한 에러의 재발 패턴 추적 필요

### ✅ 해결 방안 (개발자 작성 필요)
<!-- 🔧 아래 항목들을 개발자가 직접 작성해주세요 -->

#### 1. 즉시 조치사항
- [ ] **근본 원인 분석**: 
- [ ] **임시 해결책**: 
- [ ] **영향 범위 확인**: 

#### 2. 근본적 해결방안
- [ ] **코드 수정**: 
- [ ] **테스트 추가**: 
- [ ] **문서 업데이트**: 

#### 3. 재발 방지책
- [ ] **예방 조치**: 
- [ ] **모니터링 강화**: 
- [ ] **팀 공유**: 

### 🏷️ AI 학습 태그
`service` 

---
*📅 자동 생성됨: 2025-07-29 16:40:33 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-0c674c28

**생성 시간**: 2025-07-29 22:50:38
**이벤트 ID**: `ERR-0c674c28`
**추적 ID**: `ccab0381`
**심각도**: HIGH (BUSINESS)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `Unauthorized`
- **에러 메시지**: 이메일 또는 비밀번호가 올바르지 않습니다
- **발생 위치**: `MemberService.login`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
com.globalcarelink.common.exception.CustomException$Unauthorized: 이메일 또는 비밀번호가 올바르지 않습니다
	at com.globalcarelink.auth.MemberService.login(MemberService.java:81)
	at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103)
	at com.globalcarelink.common.config.LoggingAspect.logServiceExecution(LoggingAspect.java:51)

```

### 🤖 자동 분석 결과
- **분석**: Unauthorized 에러 발생
- **추가 분석 필요**: 에러 메시지와 스택 트레이스를 통한 상세 원인 분석 권장

- **발생 컨텍스트**: BUSINESS 카테고리
- **모니터링 권장**: 유사한 에러의 재발 패턴 추적 필요

### ✅ 해결 방안 (개발자 작성 필요)
<!-- 🔧 아래 항목들을 개발자가 직접 작성해주세요 -->

#### 1. 즉시 조치사항
- [ ] **근본 원인 분석**: 
- [ ] **임시 해결책**: 
- [ ] **영향 범위 확인**: 

#### 2. 근본적 해결방안
- [ ] **코드 수정**: 
- [ ] **테스트 추가**: 
- [ ] **문서 업데이트**: 

#### 3. 재발 방지책
- [ ] **예방 조치**: 
- [ ] **모니터링 강화**: 
- [ ] **팀 공유**: 

### 🏷️ AI 학습 태그
`service` 

---
*📅 자동 생성됨: 2025-07-29 22:50:38 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-ded61a8f

**생성 시간**: 2025-07-29 23:05:15
**이벤트 ID**: `ERR-ded61a8f`
**추적 ID**: `e3cc44df`
**심각도**: HIGH (BUSINESS)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `Unauthorized`
- **에러 메시지**: 이메일 또는 비밀번호가 올바르지 않습니다
- **발생 위치**: `MemberService.login`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
com.globalcarelink.common.exception.CustomException$Unauthorized: 이메일 또는 비밀번호가 올바르지 않습니다
	at com.globalcarelink.auth.MemberService.login(MemberService.java:81)
	at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103)
	at com.globalcarelink.common.config.LoggingAspect.logServiceExecution(LoggingAspect.java:51)

```

### 🤖 자동 분석 결과
- **분석**: Unauthorized 에러 발생
- **추가 분석 필요**: 에러 메시지와 스택 트레이스를 통한 상세 원인 분석 권장

- **발생 컨텍스트**: BUSINESS 카테고리
- **모니터링 권장**: 유사한 에러의 재발 패턴 추적 필요

### ✅ 해결 방안 (개발자 작성 필요)
<!-- 🔧 아래 항목들을 개발자가 직접 작성해주세요 -->

#### 1. 즉시 조치사항
- [ ] **근본 원인 분석**: 
- [ ] **임시 해결책**: 
- [ ] **영향 범위 확인**: 

#### 2. 근본적 해결방안
- [ ] **코드 수정**: 
- [ ] **테스트 추가**: 
- [ ] **문서 업데이트**: 

#### 3. 재발 방지책
- [ ] **예방 조치**: 
- [ ] **모니터링 강화**: 
- [ ] **팀 공유**: 

### 🏷️ AI 학습 태그
`service` 

---
*📅 자동 생성됨: 2025-07-29 23:05:15 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-3f1c3d67

**생성 시간**: 2025-07-29 23:05:44
**이벤트 ID**: `ERR-3f1c3d67`
**추적 ID**: `7d0e5d04`
**심각도**: HIGH (BUSINESS)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `Unauthorized`
- **에러 메시지**: 이메일 또는 비밀번호가 올바르지 않습니다
- **발생 위치**: `MemberService.login`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
com.globalcarelink.common.exception.CustomException$Unauthorized: 이메일 또는 비밀번호가 올바르지 않습니다
	at com.globalcarelink.auth.MemberService.login(MemberService.java:81)
	at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103)
	at com.globalcarelink.common.config.LoggingAspect.logServiceExecution(LoggingAspect.java:51)

```

### 🤖 자동 분석 결과
- **분석**: Unauthorized 에러 발생
- **추가 분석 필요**: 에러 메시지와 스택 트레이스를 통한 상세 원인 분석 권장

- **발생 컨텍스트**: BUSINESS 카테고리
- **모니터링 권장**: 유사한 에러의 재발 패턴 추적 필요

### ✅ 해결 방안 (개발자 작성 필요)
<!-- 🔧 아래 항목들을 개발자가 직접 작성해주세요 -->

#### 1. 즉시 조치사항
- [ ] **근본 원인 분석**: 
- [ ] **임시 해결책**: 
- [ ] **영향 범위 확인**: 

#### 2. 근본적 해결방안
- [ ] **코드 수정**: 
- [ ] **테스트 추가**: 
- [ ] **문서 업데이트**: 

#### 3. 재발 방지책
- [ ] **예방 조치**: 
- [ ] **모니터링 강화**: 
- [ ] **팀 공유**: 

### 🏷️ AI 학습 태그
`service` 

---
*📅 자동 생성됨: 2025-07-29 23:05:44 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-f6f51e47

**생성 시간**: 2025-07-29 23:05:47
**이벤트 ID**: `ERR-f6f51e47`
**추적 ID**: `bd49f7d1`
**심각도**: HIGH (BUSINESS)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `Unauthorized`
- **에러 메시지**: 이메일 또는 비밀번호가 올바르지 않습니다
- **발생 위치**: `MemberService.login`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
com.globalcarelink.common.exception.CustomException$Unauthorized: 이메일 또는 비밀번호가 올바르지 않습니다
	at com.globalcarelink.auth.MemberService.login(MemberService.java:81)
	at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103)
	at com.globalcarelink.common.config.LoggingAspect.logServiceExecution(LoggingAspect.java:51)

```

### 🤖 자동 분석 결과
- **분석**: Unauthorized 에러 발생
- **추가 분석 필요**: 에러 메시지와 스택 트레이스를 통한 상세 원인 분석 권장

- **발생 컨텍스트**: BUSINESS 카테고리
- **모니터링 권장**: 유사한 에러의 재발 패턴 추적 필요

### ✅ 해결 방안 (개발자 작성 필요)
<!-- 🔧 아래 항목들을 개발자가 직접 작성해주세요 -->

#### 1. 즉시 조치사항
- [ ] **근본 원인 분석**: 
- [ ] **임시 해결책**: 
- [ ] **영향 범위 확인**: 

#### 2. 근본적 해결방안
- [ ] **코드 수정**: 
- [ ] **테스트 추가**: 
- [ ] **문서 업데이트**: 

#### 3. 재발 방지책
- [ ] **예방 조치**: 
- [ ] **모니터링 강화**: 
- [ ] **팀 공유**: 

### 🏷️ AI 학습 태그
`service` 

---
*📅 자동 생성됨: 2025-07-29 23:05:47 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-fffbb2b5

**생성 시간**: 2025-07-30 02:48:19
**이벤트 ID**: `ERR-fffbb2b5`
**추적 ID**: `1a437bc1`
**심각도**: HIGH (TECHNICAL)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `IllegalArgumentException`
- **에러 메시지**: 잘못된 요청 형식입니다
- **발생 위치**: `AuthController.login`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
java.lang.IllegalArgumentException: 잘못된 요청 형식입니다
	at com.globalcarelink.auth.AuthController.login(AuthController.java:69)
	at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103)
	at com.globalcarelink.common.config.LoggingAspect.logControllerExecution(LoggingAspect.java:85)

```

### 🤖 자동 분석 결과
- **분석**: IllegalArgumentException 에러 발생
- **추가 분석 필요**: 에러 메시지와 스택 트레이스를 통한 상세 원인 분석 권장

- **발생 컨텍스트**: TECHNICAL 카테고리
- **모니터링 권장**: 유사한 에러의 재발 패턴 추적 필요

### ✅ 해결 방안 (개발자 작성 필요)
<!-- 🔧 아래 항목들을 개발자가 직접 작성해주세요 -->

#### 1. 즉시 조치사항
- [ ] **근본 원인 분석**: 
- [ ] **임시 해결책**: 
- [ ] **영향 범위 확인**: 

#### 2. 근본적 해결방안
- [ ] **코드 수정**: 
- [ ] **테스트 추가**: 
- [ ] **문서 업데이트**: 

#### 3. 재발 방지책
- [ ] **예방 조치**: 
- [ ] **모니터링 강화**: 
- [ ] **팀 공유**: 

### 🏷️ AI 학습 태그
`controller` 

---
*📅 자동 생성됨: 2025-07-30 02:48:19 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-dcb6b656

**생성 시간**: 2025-07-30 02:48:57
**이벤트 ID**: `ERR-dcb6b656`
**추적 ID**: `4e45d810`
**심각도**: HIGH (TECHNICAL)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `IllegalArgumentException`
- **에러 메시지**: 잘못된 요청 형식입니다
- **발생 위치**: `AuthController.login`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
java.lang.IllegalArgumentException: 잘못된 요청 형식입니다
	at com.globalcarelink.auth.AuthController.login(AuthController.java:69)
	at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103)
	at com.globalcarelink.common.config.LoggingAspect.logControllerExecution(LoggingAspect.java:85)

```

### 🤖 자동 분석 결과
- **분석**: IllegalArgumentException 에러 발생
- **추가 분석 필요**: 에러 메시지와 스택 트레이스를 통한 상세 원인 분석 권장

- **발생 컨텍스트**: TECHNICAL 카테고리
- **모니터링 권장**: 유사한 에러의 재발 패턴 추적 필요

### ✅ 해결 방안 (개발자 작성 필요)
<!-- 🔧 아래 항목들을 개발자가 직접 작성해주세요 -->

#### 1. 즉시 조치사항
- [ ] **근본 원인 분석**: 
- [ ] **임시 해결책**: 
- [ ] **영향 범위 확인**: 

#### 2. 근본적 해결방안
- [ ] **코드 수정**: 
- [ ] **테스트 추가**: 
- [ ] **문서 업데이트**: 

#### 3. 재발 방지책
- [ ] **예방 조치**: 
- [ ] **모니터링 강화**: 
- [ ] **팀 공유**: 

### 🏷️ AI 학습 태그
`controller` 

---
*📅 자동 생성됨: 2025-07-30 02:48:57 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-6ff11854

**생성 시간**: 2025-07-30 02:49:54
**이벤트 ID**: `ERR-6ff11854`
**추적 ID**: `f63907a1`
**심각도**: HIGH (TECHNICAL)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `IllegalArgumentException`
- **에러 메시지**: 잘못된 요청 형식입니다
- **발생 위치**: `AuthController.login`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
java.lang.IllegalArgumentException: 잘못된 요청 형식입니다
	at com.globalcarelink.auth.AuthController.login(AuthController.java:69)
	at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103)
	at com.globalcarelink.common.config.LoggingAspect.logControllerExecution(LoggingAspect.java:85)

```

### 🤖 자동 분석 결과
- **분석**: IllegalArgumentException 에러 발생
- **추가 분석 필요**: 에러 메시지와 스택 트레이스를 통한 상세 원인 분석 권장

- **발생 컨텍스트**: TECHNICAL 카테고리
- **모니터링 권장**: 유사한 에러의 재발 패턴 추적 필요

### ✅ 해결 방안 (개발자 작성 필요)
<!-- 🔧 아래 항목들을 개발자가 직접 작성해주세요 -->

#### 1. 즉시 조치사항
- [ ] **근본 원인 분석**: 
- [ ] **임시 해결책**: 
- [ ] **영향 범위 확인**: 

#### 2. 근본적 해결방안
- [ ] **코드 수정**: 
- [ ] **테스트 추가**: 
- [ ] **문서 업데이트**: 

#### 3. 재발 방지책
- [ ] **예방 조치**: 
- [ ] **모니터링 강화**: 
- [ ] **팀 공유**: 

### 🏷️ AI 학습 태그
`controller` 

---
*📅 자동 생성됨: 2025-07-30 02:49:54 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-01475870

**생성 시간**: 2025-07-30 02:50:13
**이벤트 ID**: `ERR-01475870`
**추적 ID**: `86f1958c`
**심각도**: HIGH (TECHNICAL)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `IllegalArgumentException`
- **에러 메시지**: 잘못된 요청 형식입니다
- **발생 위치**: `AuthController.login`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
java.lang.IllegalArgumentException: 잘못된 요청 형식입니다
	at com.globalcarelink.auth.AuthController.login(AuthController.java:69)
	at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103)
	at com.globalcarelink.common.config.LoggingAspect.logControllerExecution(LoggingAspect.java:85)

```

### 🤖 자동 분석 결과
- **분석**: IllegalArgumentException 에러 발생
- **추가 분석 필요**: 에러 메시지와 스택 트레이스를 통한 상세 원인 분석 권장

- **발생 컨텍스트**: TECHNICAL 카테고리
- **모니터링 권장**: 유사한 에러의 재발 패턴 추적 필요

### ✅ 해결 방안 (개발자 작성 필요)
<!-- 🔧 아래 항목들을 개발자가 직접 작성해주세요 -->

#### 1. 즉시 조치사항
- [ ] **근본 원인 분석**: 
- [ ] **임시 해결책**: 
- [ ] **영향 범위 확인**: 

#### 2. 근본적 해결방안
- [ ] **코드 수정**: 
- [ ] **테스트 추가**: 
- [ ] **문서 업데이트**: 

#### 3. 재발 방지책
- [ ] **예방 조치**: 
- [ ] **모니터링 강화**: 
- [ ] **팀 공유**: 

### 🏷️ AI 학습 태그
`controller` 

---
*📅 자동 생성됨: 2025-07-30 02:50:13 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-06160943

**생성 시간**: 2025-07-30 02:53:31
**이벤트 ID**: `ERR-06160943`
**추적 ID**: `ed717b05`
**심각도**: HIGH (TECHNICAL)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `IllegalArgumentException`
- **에러 메시지**: 잘못된 요청 형식입니다
- **발생 위치**: `AuthController.login`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
java.lang.IllegalArgumentException: 잘못된 요청 형식입니다
	at com.globalcarelink.auth.AuthController.login(AuthController.java:69)
	at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103)
	at com.globalcarelink.common.config.LoggingAspect.logControllerExecution(LoggingAspect.java:85)

```

### 🤖 자동 분석 결과
- **분석**: IllegalArgumentException 에러 발생
- **추가 분석 필요**: 에러 메시지와 스택 트레이스를 통한 상세 원인 분석 권장

- **발생 컨텍스트**: TECHNICAL 카테고리
- **모니터링 권장**: 유사한 에러의 재발 패턴 추적 필요

### ✅ 해결 방안 (개발자 작성 필요)
<!-- 🔧 아래 항목들을 개발자가 직접 작성해주세요 -->

#### 1. 즉시 조치사항
- [ ] **근본 원인 분석**: 
- [ ] **임시 해결책**: 
- [ ] **영향 범위 확인**: 

#### 2. 근본적 해결방안
- [ ] **코드 수정**: 
- [ ] **테스트 추가**: 
- [ ] **문서 업데이트**: 

#### 3. 재발 방지책
- [ ] **예방 조치**: 
- [ ] **모니터링 강화**: 
- [ ] **팀 공유**: 

### 🏷️ AI 학습 태그
`controller` 

---
*📅 자동 생성됨: 2025-07-30 02:53:31 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-f5b4bb21

**생성 시간**: 2025-07-30 02:56:10
**이벤트 ID**: `ERR-f5b4bb21`
**추적 ID**: `f60e0cee`
**심각도**: HIGH (TECHNICAL)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `IllegalArgumentException`
- **에러 메시지**: 잘못된 요청 형식입니다
- **발생 위치**: `AuthController.login`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
java.lang.IllegalArgumentException: 잘못된 요청 형식입니다
	at com.globalcarelink.auth.AuthController.login(AuthController.java:69)
	at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103)
	at com.globalcarelink.common.config.LoggingAspect.logControllerExecution(LoggingAspect.java:85)

```

### 🤖 자동 분석 결과
- **분석**: IllegalArgumentException 에러 발생
- **추가 분석 필요**: 에러 메시지와 스택 트레이스를 통한 상세 원인 분석 권장

- **발생 컨텍스트**: TECHNICAL 카테고리
- **모니터링 권장**: 유사한 에러의 재발 패턴 추적 필요

### ✅ 해결 방안 (개발자 작성 필요)
<!-- 🔧 아래 항목들을 개발자가 직접 작성해주세요 -->

#### 1. 즉시 조치사항
- [ ] **근본 원인 분석**: 
- [ ] **임시 해결책**: 
- [ ] **영향 범위 확인**: 

#### 2. 근본적 해결방안
- [ ] **코드 수정**: 
- [ ] **테스트 추가**: 
- [ ] **문서 업데이트**: 

#### 3. 재발 방지책
- [ ] **예방 조치**: 
- [ ] **모니터링 강화**: 
- [ ] **팀 공유**: 

### 🏷️ AI 학습 태그
`controller` 

---
*📅 자동 생성됨: 2025-07-30 02:56:10 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-fd7dd2bd

**생성 시간**: 2025-07-30 02:56:33
**이벤트 ID**: `ERR-fd7dd2bd`
**추적 ID**: `ae6bdec0`
**심각도**: HIGH (TECHNICAL)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `IllegalArgumentException`
- **에러 메시지**: 잘못된 요청 형식입니다
- **발생 위치**: `AuthController.login`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
java.lang.IllegalArgumentException: 잘못된 요청 형식입니다
	at com.globalcarelink.auth.AuthController.login(AuthController.java:69)
	at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103)
	at com.globalcarelink.common.config.LoggingAspect.logControllerExecution(LoggingAspect.java:85)

```

### 🤖 자동 분석 결과
- **분석**: IllegalArgumentException 에러 발생
- **추가 분석 필요**: 에러 메시지와 스택 트레이스를 통한 상세 원인 분석 권장

- **발생 컨텍스트**: TECHNICAL 카테고리
- **모니터링 권장**: 유사한 에러의 재발 패턴 추적 필요

### ✅ 해결 방안 (개발자 작성 필요)
<!-- 🔧 아래 항목들을 개발자가 직접 작성해주세요 -->

#### 1. 즉시 조치사항
- [ ] **근본 원인 분석**: 
- [ ] **임시 해결책**: 
- [ ] **영향 범위 확인**: 

#### 2. 근본적 해결방안
- [ ] **코드 수정**: 
- [ ] **테스트 추가**: 
- [ ] **문서 업데이트**: 

#### 3. 재발 방지책
- [ ] **예방 조치**: 
- [ ] **모니터링 강화**: 
- [ ] **팀 공유**: 

### 🏷️ AI 학습 태그
`controller` 

---
*📅 자동 생성됨: 2025-07-30 02:56:33 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-03afecfd

**생성 시간**: 2025-07-30 02:56:39
**이벤트 ID**: `ERR-03afecfd`
**추적 ID**: `e15c690a`
**심각도**: HIGH (TECHNICAL)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `IllegalArgumentException`
- **에러 메시지**: 잘못된 요청 형식입니다
- **발생 위치**: `AuthController.login`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
java.lang.IllegalArgumentException: 잘못된 요청 형식입니다
	at com.globalcarelink.auth.AuthController.login(AuthController.java:69)
	at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103)
	at com.globalcarelink.common.config.LoggingAspect.logControllerExecution(LoggingAspect.java:85)

```

### 🤖 자동 분석 결과
- **분석**: IllegalArgumentException 에러 발생
- **추가 분석 필요**: 에러 메시지와 스택 트레이스를 통한 상세 원인 분석 권장

- **발생 컨텍스트**: TECHNICAL 카테고리
- **모니터링 권장**: 유사한 에러의 재발 패턴 추적 필요

### ✅ 해결 방안 (개발자 작성 필요)
<!-- 🔧 아래 항목들을 개발자가 직접 작성해주세요 -->

#### 1. 즉시 조치사항
- [ ] **근본 원인 분석**: 
- [ ] **임시 해결책**: 
- [ ] **영향 범위 확인**: 

#### 2. 근본적 해결방안
- [ ] **코드 수정**: 
- [ ] **테스트 추가**: 
- [ ] **문서 업데이트**: 

#### 3. 재발 방지책
- [ ] **예방 조치**: 
- [ ] **모니터링 강화**: 
- [ ] **팀 공유**: 

### 🏷️ AI 학습 태그
`controller` 

---
*📅 자동 생성됨: 2025-07-30 02:56:39 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-d3602ffd

**생성 시간**: 2025-07-30 02:58:49
**이벤트 ID**: `ERR-d3602ffd`
**추적 ID**: `6f24d497`
**심각도**: HIGH (BUSINESS)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `Unauthorized`
- **에러 메시지**: 이메일 또는 비밀번호가 올바르지 않습니다
- **발생 위치**: `MemberService.login`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
com.globalcarelink.common.exception.CustomException$Unauthorized: 이메일 또는 비밀번호가 올바르지 않습니다
	at com.globalcarelink.auth.MemberService.login(MemberService.java:81)
	at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103)
	at com.globalcarelink.common.config.LoggingAspect.logServiceExecution(LoggingAspect.java:51)

```

### 🤖 자동 분석 결과
- **분석**: Unauthorized 에러 발생
- **추가 분석 필요**: 에러 메시지와 스택 트레이스를 통한 상세 원인 분석 권장

- **발생 컨텍스트**: BUSINESS 카테고리
- **모니터링 권장**: 유사한 에러의 재발 패턴 추적 필요

### ✅ 해결 방안 (개발자 작성 필요)
<!-- 🔧 아래 항목들을 개발자가 직접 작성해주세요 -->

#### 1. 즉시 조치사항
- [ ] **근본 원인 분석**: 
- [ ] **임시 해결책**: 
- [ ] **영향 범위 확인**: 

#### 2. 근본적 해결방안
- [ ] **코드 수정**: 
- [ ] **테스트 추가**: 
- [ ] **문서 업데이트**: 

#### 3. 재발 방지책
- [ ] **예방 조치**: 
- [ ] **모니터링 강화**: 
- [ ] **팀 공유**: 

### 🏷️ AI 학습 태그
`service` 

---
*📅 자동 생성됨: 2025-07-30 02:58:49 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-df5df2f1

**생성 시간**: 2025-07-30 02:59:19
**이벤트 ID**: `ERR-df5df2f1`
**추적 ID**: `5c25ba04`
**심각도**: HIGH (BUSINESS)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `Unauthorized`
- **에러 메시지**: 이메일 또는 비밀번호가 올바르지 않습니다
- **발생 위치**: `MemberService.login`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
com.globalcarelink.common.exception.CustomException$Unauthorized: 이메일 또는 비밀번호가 올바르지 않습니다
	at com.globalcarelink.auth.MemberService.login(MemberService.java:81)
	at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103)
	at com.globalcarelink.common.config.LoggingAspect.logServiceExecution(LoggingAspect.java:51)

```

### 🤖 자동 분석 결과
- **분석**: Unauthorized 에러 발생
- **추가 분석 필요**: 에러 메시지와 스택 트레이스를 통한 상세 원인 분석 권장

- **발생 컨텍스트**: BUSINESS 카테고리
- **모니터링 권장**: 유사한 에러의 재발 패턴 추적 필요

### ✅ 해결 방안 (개발자 작성 필요)
<!-- 🔧 아래 항목들을 개발자가 직접 작성해주세요 -->

#### 1. 즉시 조치사항
- [ ] **근본 원인 분석**: 
- [ ] **임시 해결책**: 
- [ ] **영향 범위 확인**: 

#### 2. 근본적 해결방안
- [ ] **코드 수정**: 
- [ ] **테스트 추가**: 
- [ ] **문서 업데이트**: 

#### 3. 재발 방지책
- [ ] **예방 조치**: 
- [ ] **모니터링 강화**: 
- [ ] **팀 공유**: 

### 🏷️ AI 학습 태그
`service` 

---
*📅 자동 생성됨: 2025-07-30 02:59:19 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-7b380c64

**생성 시간**: 2025-07-30 02:59:49
**이벤트 ID**: `ERR-7b380c64`
**추적 ID**: `8aaccc9c`
**심각도**: HIGH (BUSINESS)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `Unauthorized`
- **에러 메시지**: 이메일 또는 비밀번호가 올바르지 않습니다
- **발생 위치**: `MemberService.login`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
com.globalcarelink.common.exception.CustomException$Unauthorized: 이메일 또는 비밀번호가 올바르지 않습니다
	at com.globalcarelink.auth.MemberService.login(MemberService.java:81)
	at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103)
	at com.globalcarelink.common.config.LoggingAspect.logServiceExecution(LoggingAspect.java:51)

```

### 🤖 자동 분석 결과
- **분석**: Unauthorized 에러 발생
- **추가 분석 필요**: 에러 메시지와 스택 트레이스를 통한 상세 원인 분석 권장

- **발생 컨텍스트**: BUSINESS 카테고리
- **모니터링 권장**: 유사한 에러의 재발 패턴 추적 필요

### ✅ 해결 방안 (개발자 작성 필요)
<!-- 🔧 아래 항목들을 개발자가 직접 작성해주세요 -->

#### 1. 즉시 조치사항
- [ ] **근본 원인 분석**: 
- [ ] **임시 해결책**: 
- [ ] **영향 범위 확인**: 

#### 2. 근본적 해결방안
- [ ] **코드 수정**: 
- [ ] **테스트 추가**: 
- [ ] **문서 업데이트**: 

#### 3. 재발 방지책
- [ ] **예방 조치**: 
- [ ] **모니터링 강화**: 
- [ ] **팀 공유**: 

### 🏷️ AI 학습 태그
`service` 

---
*📅 자동 생성됨: 2025-07-30 02:59:49 | 🤖 Elderberry-Intellect v2.0*

