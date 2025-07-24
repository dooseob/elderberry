# 🤖 Claude 가이드 시스템

> **엘더베리 프로젝트를 위한 통합 AI 개발 가이드**  
> 814줄 원본 지침 + 실시간 지원 + 엘더베리 특화 = 완벽한 개발 경험

---

## ⚡ 30초 빠른 시작

```bash
# 1. 즉시 사용
npm run guide

# 2. 빠른 상태 체크 (30초)
npm run quick-check

# 3. Spring Boot 에러 해결
npm run spring-boot-help

# 4. AI 챗봇 연동 준비
npm run chatbot-help
```

---

## 📋 주요 명령어

| 명령어 | 설명 | 소요시간 |
|--------|------|----------|
| `npm run guide` | 대화형 가이드 시스템 | 즉시 |
| `npm run quick-check` | 프로젝트 상태 30초 체크 | 30초 |
| `npm run spring-boot-help` | Spring Boot 67개 에러 해결 | 5분 |
| `npm run chatbot-help` | AI 챗봇 연동 가이드 | 3분 |
| `npm run help` | 도움말 및 사용법 | 즉시 |

---

## 🎯 사용 예시

### 💬 대화형 가이드
```bash
$ npm run guide
작업 내용을 입력하세요: FacilityService 리팩토링 필요

📋 service_implementation 가이드
==================================================

🔥 즉시 체크리스트:
   🔥 CLAUDE.md 프로젝트 가이드 확인
   🔥 현재 Phase 상황 파악
   🔥 Spring Boot 에러 상태 확인
   🔥 단일 책임 원칙 확인
   🔥 의존성 주입 설계
   📋 비즈니스 로직 분리
   📋 한국어 주석 작성

📋 다음 단계:
   1. 🔥 요구사항 분석 (1시간)
   2. 📋 설계 및 구현 (TBD)
   3. 🔥 테스트 및 검증 (30분)
```

### 🔧 프로그래밍 방식
```javascript
const ClaudeGuide = require('./claude-guide.js');
const system = new ClaudeGuide();

// 가이드 생성
const guide = await system.getGuide("API 성능 최적화 필요");

console.log(guide.quickChecklist);  // 30초 체크리스트
console.log(guide.nextSteps);       // 다음 단계
console.log(guide.elderberryInfo);  // 엘더베리 특화 정보
```

---

## 🍇 엘더베리 특화 기능

### 📊 현재 프로젝트 상황 자동 반영
- **Phase 6-B → Phase 7**: 공공데이터 API 연동 완료 후 AI 챗봇 연동
- **Spring Boot 상태**: 67개 컴파일 에러 (점진적 해결 중)
- **서버 상태**: Plain Java (포트 8080), React (포트 5173) 정상 동작

### 🤖 AI 챗봇팀 협업 지원
- 주 2회 미팅 (화, 금 오후 2시) 일정 관리
- API 스펙 협의 체크리스트
- WebSocket 연결 및 메시지 프로토콜 가이드

### 🇰🇷 한국어 개발 표준
- 모든 주석 한국어 필수
- 비즈니스 도메인 용어 일관성
- 테스트 커버리지 90% 목표

---

## 📁 폴더 구조

```
claude-guides/
├── claude-guide.js           # 🔥 메인 통합 시스템
├── CLAUDE_GUIDELINES.md      # 📚 814줄 핵심 가이드라인
├── package.json             # ⚙️ 설정 및 스크립트
├── README.md                # 📖 이 파일
├── helpers/                 # 🛠️ 도움 도구들
│   ├── quick-check.js       #   30초 빠른 체크
│   ├── spring-boot-helper.js #   Spring Boot 에러 해결
│   └── chatbot-helper.js    #   AI 챗봇 연동 가이드
├── cache/                   # 💾 캐시 데이터 (자동 생성)
├── logs/                    # 📝 시스템 로그 (자동 생성)
└── sessions/                # 👤 사용자 세션 (자동 생성)
```

---

## 🚀 고급 활용법

### 🔄 실시간 업데이트
시스템은 사용할수록 더 똑똑해집니다:
- **세션 학습**: 개인별 패턴 분석 및 맞춤 가이드
- **캐시 최적화**: 자주 사용하는 가이드 빠른 제공
- **오류 예측**: 과거 경험 기반 위험 요소 미리 알림

### 📊 성과 추적
```bash
# 시스템 성능 확인
node claude-guide.js --version

# 상세 분석 (프로그래밍 방식)
const system = new ClaudeGuide();
console.log(system.projectConfig);
```

---

## 💡 팁 & 모범 사례

### ✅ 효과적인 사용법
```bash
# 👍 구체적인 요청
"FacilityService가 1500줄이라 SRP 원칙에 따라 리팩토링"

# 👎 모호한 요청  
"코드 좀 고쳐주세요"
```

### 🔧 정기적인 활용
```bash
# 매일 시작 시
npm run quick-check

# 에러 발생 시
npm run spring-boot-help

# 새로운 Phase 시작 시  
npm run chatbot-help
```

---

## 📞 지원

- **버그 신고**: GitHub Issues
- **기능 제안**: Feature Requests  
- **사용법 문의**: 엘더베리 개발팀

---

**🍇 엘더베리 프로젝트의 성공적인 개발을 위해 Claude 가이드 시스템을 적극 활용하세요!**

*v3.0.0-unified | 단일 통합 시스템으로 간소화 완료*