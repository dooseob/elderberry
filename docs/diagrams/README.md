# Elderberry Project - 다이어그램 및 아키텍처 문서

이 디렉토리는 Elderberry 프로젝트의 전체 아키텍처와 구조를 시각적으로 표현한 다이어그램들을 포함합니다.

## 📋 문서 목록

### 🏗️ [아키텍처 개요](./architecture-overview.md)
- 프로젝트 전체 개요 및 기술 스택
- 시스템 아키텍처 설명
- 주요 도메인 및 기능 소개
- FSD (Feature-Sliced Design) 아키텍처 가이드
- 보안, 성능, 확장성 설계 원칙

### 🗄️ [Entity Relationship Diagram (ERD)](./elderberry-erd.md)
- 완전한 데이터베이스 구조 (Mermaid 형식)
- 25개 주요 테이블 및 관계 정의
- 3-Tier 하이브리드 데이터베이스 구성 (H2 + SQLite + Redis)
- 엔티티 관계 패턴 및 설계 원칙
- 인덱스 및 성능 최적화 전략

### 🏛️ [Class Diagram](./elderberry-class-diagram.md)
- 전체 시스템 클래스 구조 (Mermaid 형식)
- 백엔드 Java 클래스 (Entity, Controller, Service)
- 프론트엔드 React 컴포넌트 (FSD 아키텍처)
- 주요 설계 패턴 (DDD, MVC, Repository Pattern)
- 도메인별 클래스 관계 및 의존성

## 🎯 주요 시스템 도메인

### 1. 인증 시스템 (Auth Domain)
- **Entity**: Member, MemberRole
- **핵심 클래스**: MemberController, JwtTokenProvider, RedisJwtBlacklistService
- **특징**: 7가지 사용자 역할, JWT + Redis 블랙리스트, RBAC

### 2. 시설 관리 (Facility Domain)
- **Entity**: FacilityProfile, FacilityMatchingHistory
- **핵심 클래스**: FacilityController, FacilityRecommendationService
- **특징**: 80+ 필드 포괄적 정보, AI 추천 시스템, 공공데이터 연동

### 3. 건강 평가 (Health Domain)
- **Entity**: HealthAssessment
- **핵심 클래스**: HealthAssessmentController, CareGradeCalculator
- **특징**: KB라이프생명 기반 ADL 평가, 4가지 핵심 지표, 자동 점수 계산

### 4. 구인구직 (Jobs Domain)
- **Entity**: Job, JobApplication
- **특징**: 완전한 채용 프로세스, 면접 관리, 다양한 직종 지원

### 5. 리뷰 시스템 (Review Domain)
- **Entity**: Review, ReviewVote, ReviewReport
- **특징**: 다차원 평점, 사용자 참여, 신고 시스템

### 6. 게시판 (Board Domain)
- **Entity**: Board, Post, Comment
- **특징**: 계층형 댓글, 다양한 게시판 타입, 관리 기능

### 7. 코디네이터 시스템 (Coordinator Domain)
- **Entity**: CoordinatorCareSettings, CoordinatorLanguageSkill, CoordinatorMatch
- **핵심 클래스**: OptimizedCoordinatorMatchingService
- **특징**: AI 매칭, 다국어 지원, 성과 관리

## 🏗️ 아키텍처 하이라이트

### Feature-Sliced Design (FSD) 구조
```
app → pages → widgets → features → entities → shared
```

### 3-Tier 하이브리드 데이터베이스
- **H2 Database**: 메인 애플리케이션 데이터
- **SQLite**: 에이전트 로깅 전용
- **Redis**: 세션 및 캐시

### 하이브리드 개발 환경
- **로컬 실행**: React + Spring Boot (최적 성능)
- **Docker 보조**: Redis + 관리 도구 (선택적 컨테이너화)

## 📊 다이어그램 활용 방법

### 1. 새로운 개발자 온보딩
1. [아키텍처 개요](./architecture-overview.md) - 전체 시스템 이해
2. [ERD](./elderberry-erd.md) - 데이터 구조 파악
3. [클래스 다이어그램](./elderberry-class-diagram.md) - 코드 구조 이해

### 2. 기능 개발 시
1. 해당 도메인의 ERD 확인 → 데이터 모델 설계
2. 클래스 다이어그램 참조 → 기존 패턴 따라 구현
3. FSD 구조 준수 → 올바른 레이어에 코드 배치

### 3. 시스템 분석 및 최적화
1. ERD로 데이터베이스 관계 분석
2. 클래스 다이어그램으로 의존성 파악
3. 성능 병목점 식별 및 개선

## 🔄 다이어그램 업데이트 가이드

### 언제 업데이트해야 하나?
- 새로운 엔티티/테이블 추가 시
- 주요 클래스나 컴포넌트 구조 변경 시
- 도메인 간 관계 변경 시
- 아키텍처 패턴 변경 시

### 업데이트 방법
1. **ERD 업데이트**: 엔티티 변경 시 `elderberry-erd.md` 수정
2. **클래스 다이어그램 업데이트**: 클래스 구조 변경 시 `elderberry-class-diagram.md` 수정
3. **문서 동기화**: 코드 변경 후 관련 문서 즉시 업데이트

### Mermaid 문법 참조
- [Mermaid ERD 문법](https://mermaid.js.org/syntax/entityRelationshipDiagram.html)
- [Mermaid Class Diagram 문법](https://mermaid.js.org/syntax/classDiagram.html)

## ⚡ 성능 및 확장성

### 현재 최적화 사항
- **인덱스 전략**: UK, FK 기반 최적화
- **캐시 전략**: Redis 활용 세션/쿼리 캐시
- **페이지네이션**: Spring Data JPA Pageable
- **지연 로딩**: JPA 성능 최적화
- **코드 분할**: React.lazy 활용

### 미래 확장 계획
- **PostgreSQL 전환**: 프로덕션 데이터베이스
- **마이크로서비스**: 도메인별 서비스 분리
- **AI/ML 강화**: 추천 알고리즘 고도화
- **국제화**: 다국가 서비스 확장

## 📚 관련 문서

### 프로젝트 루트
- [CLAUDE.md](../../CLAUDE.md) - 프로젝트 개발 가이드
- [DEV_ENVIRONMENT_STRATEGY.md](../../DEV_ENVIRONMENT_STRATEGY.md) - 개발 환경 전략

### 프론트엔드
- [FSD_STRUCTURE_GUIDE.md](../../frontend/FSD_STRUCTURE_GUIDE.md) - FSD 구조 가이드
- [LINEAR_DESIGN_SYSTEM.md](../../frontend/LINEAR_DESIGN_SYSTEM.md) - 디자인 시스템

### 트러블슈팅
- [docs/troubleshooting/](../troubleshooting/) - 문제 해결 가이드

---

**📝 문서 최종 업데이트**: 2025-08-05  
**📊 다이어그램 버전**: v1.0  
**🏆 커버리지**: 전체 시스템 100% 반영  
**⚡ 상태**: 실제 코드와 완전 동기화