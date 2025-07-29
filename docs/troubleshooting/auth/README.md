# 🔐 Authentication 트러블슈팅

인증 및 권한 관련 문제들을 다룹니다.

## 📋 문제 목록

### 🔴 HIGH 심각도
- [AUTH-003: 로그인 시스템 프론트엔드-백엔드 연동 완전 해결](./AUTH-003-login-system-integration.md)
  - JWT 토큰 발급 후 사용자 정보 접근 불가 문제
  - 프론트엔드-백엔드 타입 호환성 문제
  - **해결됨** (2025-07-29)

## 🔍 주요 패턴

### 자주 발생하는 문제들
1. **타입 호환성 문제**: 프론트엔드-백엔드 간 응답 구조 불일치
2. **JWT 토큰 처리**: 토큰 발급은 성공하나 사용자 정보 접근 실패
3. **테이블명 불일치**: 단수형/복수형 테이블명 혼용

### 해결 패턴
1. **API 응답 구조 통일**: TokenResponse.member 필드 표준화
2. **테이블명 규칙**: 복수형 테이블명 통일 (members, facilities)
3. **테스트 자동화**: 로그인 플로우 통합 테스트 추가

## 🏷️ 공통 태그
`authentication`, `jwt`, `frontend-backend-integration`, `type-compatibility`

## 🔗 관련 카테고리
- [Backend Issues](../backend/README.md)
- [Frontend Issues](../frontend/README.md)
- [메인 인덱스](../README.md)