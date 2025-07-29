# 🔧 Backend 트러블슈팅

Java Spring Boot 백엔드 관련 문제들을 다룹니다.

## 📋 문제 목록

### 🔴 HIGH 심각도
- [DEBUG-002: 복구된 시스템 컴파일 오류 디버깅](./DEBUG-002-compilation-errors.md)
  - 63개 컴파일 오류 완전 해결
  - Repository-Service 메서드 시그니처 불일치
  - **해결됨** (2025-07-28)

## 🔍 주요 패턴

### 자주 발생하는 문제들
1. **컴파일 오류**: Repository-Service 계층간 메서드 시그니처 불일치
2. **엔티티 메서드 누락**: BaseEntity, CustomException 호환성 문제
3. **Spring Boot 호환성**: 버전 업그레이드 시 API 변경사항

### 해결 패턴
1. **메서드 시그니처 통일**: Repository와 Service 간 일관성 유지
2. **엔티티 호환성**: getCreatedDate(), getLastModifiedDate() 메서드 추가
3. **예외 처리 표준화**: CustomException.NotFound/BadRequest 사용

## 🏷️ 공통 태그
`compilation-errors`, `spring-boot-3`, `repository-service`, `entity-methods`

## 🔗 관련 카테고리
- [Authentication Issues](../auth/README.md)
- [Deployment Issues](../deployment/README.md)
- [메인 인덱스](../README.md)