# 프로젝트 중복 파일 및 정리 분석 보고서

**분석 날짜**: 2025-01-26  
**분석 대상**: Elderberry 프로젝트 전체  
**분석 도구**: 구축된 에이전트 시스템 + Context7 모범사례  

## 📋 주요 발견사항

### 1. 중복 설정 파일들 (High Priority)

#### AsyncConfig.java - 3개 중복
- `/src/main/java/com/globalcarelink/common/config/AsyncConfig.java` (가장 완전함)
- `/src/main/java/com/globalcarelink/external/config/AsyncConfig.java` (external 전용)  
- `/src/main/java/com/globalcarelink/config/AsyncConfig.java` (Context7 모범사례)

**문제점**: Spring Bean 이름 충돌 가능성, 설정 혼란
**권장 해결책**: common/config/AsyncConfig.java를 기본으로 사용, 나머지는 통합

#### CLAUDE.md - 2개 중복
- `/CLAUDE.md` (프로젝트 메인)
- `/claude-guides/CLAUDE.md` (하위 시스템)

**문제점**: 설정 분산, 유지보수 복잡성
**권장 해결책**: 프로젝트 루트의 CLAUDE.md를 메인으로 사용

#### README.md - 3개 중복
- `/README.md` (프로젝트 메인)
- `/claude-guides/README.md` (하위 시스템)
- `/claude-guides/docs/README.md` (문서)

### 2. 기능 중복 시스템들 (High Priority)

#### 에이전트 시스템 중복
**JavaScript 기반 서비스들**:
- `/claude-guides/services/PortfolioTroubleshootingService.js`
- `/claude-guides/services/ClaudeGuideAnalysisAgent.js`
- `/claude-guides/services/ApiDocumentationAnalysisAgent.js`

**Java 기반 에이전트들**:
- `/src/main/java/com/globalcarelink/agents/PortfolioTroubleshootAgent.java`
- `/src/main/java/com/globalcarelink/agents/ClaudeGuideAgent.java`
- `/src/main/java/com/globalcarelink/agents/unified/UnifiedTroubleshootingAgent.java`

**문제점**: 같은 기능을 JS와 Java 양쪽에서 구현, 리소스 낭비
**권장 해결책**: Java 에이전트 시스템으로 통합

### 3. 불필요한 Node.js 파일들 (Medium Priority)

프로젝트 루트에 있는 Node.js 관련 파일들:
- `/package.json` 
- `/package-lock.json`
- `/node_modules/`

**문제점**: frontend/ 디렉토리에 이미 있음, 불필요한 중복
**권장 해결책**: 프로젝트 루트에서 제거

### 4. 과도한 PowerShell 스크립트들 (Medium Priority)

총 11개의 .ps1 파일들:
- `build-deploy.ps1`, `build.ps1`, `check-system.ps1`, `debug-system.ps1` 등

**문제점**: 비슷한 기능, 유지보수 부담
**권장 해결책**: 3-4개 핵심 스크립트로 통합

### 5. 중복 Dockerfile들 (Low Priority)

- `/Dockerfile` (메인)
- `/Dockerfile.plain` (간소화 버전)

**권장 해결책**: Dockerfile.plain 제거 또는 .dev로 리네임

## 🎯 단계별 정리 계획

### Phase 2: 중복 설정 파일 정리
1. AsyncConfig 통합
2. CLAUDE.md 정리
3. README.md 정리

### Phase 3: 기능 중복 시스템 통합
1. JS 기반 서비스들 제거
2. Java 에이전트 시스템으로 일원화
3. 누락된 기능 확인 및 보완

### Phase 4: 불필요한 파일 제거
1. 프로젝트 루트 Node.js 파일들 제거
2. PowerShell 스크립트 통합
3. 중복 Dockerfile 정리

### Phase 5: 프로젝트 구조 최적화
1. 디렉토리 구조 정리
2. 문서 통합 및 정리
3. 최종 검증

## 📊 예상 효과

- **파일 수 감소**: 약 30-40개 파일 제거/통합
- **유지보수성 향상**: 중복 제거로 유지보수 포인트 감소
- **빌드 속도 향상**: 불필요한 파일 제거로 성능 향상
- **개발자 경험 개선**: 명확한 프로젝트 구조

## 🚨 주의사항

1. **기능 손실 방지**: 제거 전 기능 확인 필수
2. **설정 충돌 해결**: Bean 이름 충돌 등 사전 해결
3. **테스트 수행**: 정리 후 전체 시스템 테스트
4. **커밋 단위 분리**: 각 단계별 별도 커밋

---

**다음 단계**: Phase 2 - 중복 설정 파일 정리 시작