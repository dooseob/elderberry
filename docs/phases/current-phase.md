# Phase 1-A: 프로젝트 초기 설정

**예상 토큰**: ~8,000 토큰  
**소요시간**: 반나절

## 구현 대상
- [x] 프로젝트 구조 분석 및 최적화
- [ ] Gradle 멀티모듈 프로젝트 구조 생성
- [ ] Spring Boot 3.3.5 기본 설정
- [ ] SQLite 데이터베이스 연결
- [ ] 기본 패키지 구조 생성

## 핵심 파일
```
build.gradle.kts
settings.gradle.kts
src/main/resources/application.yml
src/main/java/com/globalcarelink/GlobalCareLinkApplication.java
```

## AI 프롬프트 예시
```
"JDK 21 + Spring Boot 3.3.5 기반 멀티모듈 Gradle 프로젝트를 생성해주세요. 
모듈 구성: api-module, member-module, facility-module
SQLite 데이터베이스 설정 포함"
```

## 목표 디렉토리 구조
```
global-care-link/
├── build.gradle.kts
├── settings.gradle.kts
├── src/main/java/com/globalcarelink/
│   ├── auth/                          # 인증 기능
│   ├── profile/                       # 프로필 관리
│   ├── facility/                      # 시설 관리
│   ├── job/                           # 구인구직
│   ├── review/                        # 리뷰 시스템
│   ├── overseas/                      # 재외동포 서비스
│   ├── coordinator/                   # 코디네이터 서비스
│   ├── notification/                  # 알림 시스템
│   ├── common/                        # 공통 기능
│   └── GlobalCareLinkApplication.java
├── src/main/resources/
│   └── application.yml
└── data/
    └── lightcare.db
```

## Git 워크플로우 (이번 Phase 완료 후 설정)
- GitHub 레포지토리 연결
- 자동 커밋 설정
- 브랜치 전략 수립