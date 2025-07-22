# Phase 1: 핵심 인프라 구축

## 🎯 개요
**소요기간**: 1-2일  
**예상 토큰**: ~14,000 토큰  
**목표**: Spring Boot 3.3.5 + JDK 21 기반 프로젝트 인프라 완성

---

## 📌 Phase 1-A: 프로젝트 초기 설정

### 구현 대상
- ✅ Gradle 멀티모듈 프로젝트 구조 생성
- ✅ Spring Boot 3.3.5 기본 설정  
- ✅ SQLite 데이터베이스 연결
- ✅ 기본 패키지 구조 생성

### 핵심 파일
```
build.gradle.kts
settings.gradle.kts  
src/main/resources/application.yml
src/main/java/com/globalcarelink/GlobalCareLinkApplication.java
```

### 기술 스택
- **언어**: Java 21 LTS
- **프레임워크**: Spring Boot 3.3.5  
- **빌드**: Gradle 8.x + Kotlin DSL
- **데이터베이스**: SQLite (무료)
- **패키지 구조**: 기능별 단일 모듈

---

## 📌 Phase 1-B: 기본 보안 설정

### 구현 대상  
- ✅ Spring Security 6.x 설정
- ✅ JWT 토큰 기반 인증
- ✅ CORS 설정
- ✅ 기본 예외 처리

### 핵심 파일
```
SecurityConfig.java
JwtTokenProvider.java
GlobalExceptionHandler.java
CustomException.java
```

### 보안 기능
- **인증**: JWT 토큰 기반
- **인가**: 역할별 접근 제어 (5가지 역할)
- **CORS**: React 프론트엔드 연동
- **예외처리**: 통합 에러 응답

---

## 🛠 개발 명령어

### 빌드 및 실행
```bash
# JDK 21 확인
java -version

# 프로젝트 빌드  
./gradlew build

# 개발 서버 실행
./gradlew bootRun --args='--spring.profiles.active=dev'

# 테스트 실행
./gradlew test
```

### 데이터베이스 설정
```bash
# SQLite 데이터베이스 디렉토리 생성
mkdir data

# JPA 자동 DDL로 스키마 생성
# application.yml: spring.jpa.hibernate.ddl-auto=create-drop
```

---

## 📋 확인 사항

### Phase 1-A 완료 체크리스트
- [ ] `./gradlew build` 성공
- [ ] `./gradlew bootRun` 성공  
- [ ] Swagger UI 접속 가능 (`http://localhost:8080/swagger-ui.html`)
- [ ] SQLite 데이터베이스 파일 생성 확인

### Phase 1-B 완료 체크리스트  
- [ ] JWT 토큰 생성/검증 테스트
- [ ] CORS 헤더 응답 확인
- [ ] 401/403 에러 응답 확인
- [ ] 전역 예외 처리 동작 확인

---

## 🎯 다음 단계

**Phase 2-A**: 기본 회원 기능 구현
- Member 엔티티 (5가지 역할)
- 회원가입/로그인 API  
- 비밀번호 암호화
- 기본 CRUD 기능

**체크포인트**: Phase 1 완료 후 Phase 2 진행