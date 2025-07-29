# 🎨 Frontend 트러블슈팅

React TypeScript 프론트엔드 관련 문제들을 다룹니다.

## 📋 문제 목록

현재 프론트엔드 관련 독립적인 문제는 없으며, 대부분 백엔드 연동 문제입니다.

### 🔗 연관 문제들
- [AUTH-003: 로그인 시스템 연동 문제](../auth/AUTH-003-login-system-integration.md)
  - 프론트엔드 authStore와 백엔드 TokenResponse 타입 불일치

## 🔍 주요 패턴

### 자주 발생하는 문제들
1. **타입 불일치**: 백엔드 API 응답과 프론트엔드 타입 정의 불일치
2. **상태 관리**: Zustand store에서 API 응답 처리 오류
3. **빌드 호환성**: Vite 빌드 과정에서 타입 체크 실패

### 해결 패턴
1. **타입 동기화**: 백엔드 응답 구조와 프론트엔드 인터페이스 일치
2. **에러 바운더리**: 프론트엔드 에러 처리 강화
3. **통합 테스트**: API 연동 테스트 자동화

## 🏷️ 공통 태그
`react`, `typescript`, `frontend-backend-integration`, `type-compatibility`

## 🔗 관련 카테고리
- [Authentication Issues](../auth/README.md)
- [Backend Issues](../backend/README.md)
- [메인 인덱스](../README.md)