# 🚀 Claude AI 최적화 지침 (누락 제로 버전)

> **814줄 → 100줄로 압축!** 핵심만 담아 누락 방지 극대화

---

## ⚡ **30초 시작 체크**
- [ ] TODO 리스트 생성
- [ ] 날짜 확인: **2025-07-24**
- [ ] 한국어 응답 설정
- [ ] Context7 사용 여부 확인

---

## 🔥 **절대 원칙 5가지**
1. **보안 우선**: JWT + BCrypt + 권한 체크
2. **성능 우선**: 캐시 + 비동기 + N+1 방지
3. **테스트 우선**: 90% 커버리지 + 비즈니스 로직 검증
4. **한국어 우선**: 모든 주석 및 문서 한국어
5. **문서 우선**: 복잡한 로직 반드시 설명

---

## 🚫 **절대 금지 3가지**
❌ 하드코딩 설정 (모든 설정은 application.yml)  
❌ 테스트 없는 배포  
❌ 문서화 누락  

---

## 🎯 **완료 전 필수 5단계** (⏰ 누락시 즉시 중단!)
- [ ] **1단계**: 기능 테스트 (`./gradlew test`)
- [ ] **2단계**: 성능 검증 (응답시간 200ms 이하)
- [ ] **3단계**: 보안 점검 (취약점 스캔)
- [ ] **4단계**: 코드 품질 (린터 오류 제거)
- [ ] **5단계**: 커밋 (`git add . && git commit`)

---

## 📝 **자동 문서 생성** (⏰ 작업 완료 후 즉시!)
- [ ] 작업 보고서 (`docs/work-reports/`)
- [ ] 이슈 해결 기록 (`docs/troubleshooting/`)
- [ ] TODO 상태 업데이트
- [ ] Git 커밋 + 푸시

---

## 🚨 **알림 시스템**
- ⏰ **30분**: "테스트 작성했나요?"
- ⏰ **1시간**: "문서 업데이트했나요?"
- ⏰ **완료시**: "5단계 검증했나요?"

---

## 🛠️ **코딩 표준** (즉시 적용)

### **아키텍처**
```java
// Service 분리 (SRP 원칙)
@Service FacilityManagementService    // CRUD만
@Service FacilityRecommendationService // 추천 로직만
@Service FacilityUserActionService     // 사용자 행동만

// Strategy 패턴 (확장성)
interface MatchingStrategy {
  double calculateScore(요청, 시설);
}
```

### **비동기 처리**
```java
// 전용 스레드 풀 사용
@Async("schedulerTaskExecutor")  // 스케줄러용
@Async("dbTaskExecutor")         // DB 작업용
@Async("apiTaskExecutor")        // API 호출용
```

### **캐싱**
```java
// 필수 캐시 적용
@Cacheable("facilitySearch")
@Cacheable("publicDataApi")
@Retryable(maxAttempts = 3)
```

---

## 🧪 **테스트 표준**

### **필수 테스트 시나리오**
```java
// 1. 비즈니스 로직 검증
@Test void 시설_매칭_점수_계산_정확성()
@Test void 건강평가_등급_산출_로직()

// 2. 예외 상황 처리
@Test void API_호출_실패시_재시도()
@Test void 잘못된_입력값_검증()

// 3. 성능 검증  
@Test void 응답시간_200ms_이하()
@Test void 동시_요청_처리()
```

---

## 🔒 **보안 체크리스트**
- [ ] JWT 토큰 만료 시간 설정
- [ ] BCrypt 강도 12 이상
- [ ] API 엔드포인트 권한 검증
- [ ] SQL Injection 방지
- [ ] XSS 방지 헤더 설정

---

## ⚡ **성능 체크리스트**  
- [ ] 응답시간 200ms 이하
- [ ] 캐시 히트율 80% 이상
- [ ] N+1 쿼리 방지 (@EntityGraph)
- [ ] 비동기 처리 적용
- [ ] 스레드 풀 분리

---

## 📊 **품질 측정**
```markdown
✅ 일일 목표
- 테스트 커버리지: 90% 이상
- 응답시간: 200ms 이하  
- 에러율: 0.1% 이하
- 문서화율: 100%
- 지침 준수율: 100%
```

---

## 🔧 **자동화 명령어**

### **개발 시작**
```bash
# 1. 환경 확인
java -version
./gradlew --version

# 2. 테스트 실행
./gradlew test

# 3. 서버 시작  
./gradlew bootRun
```

### **품질 검증**
```bash
# 코드 품질
./gradlew spotlessCheck
./gradlew check

# 보안 스캔
./gradlew dependencyCheckAnalyze
```

### **배포 준비**
```bash
# 전체 검증
./gradlew clean build
./gradlew test

# 커밋
git add .
git commit -m "🔧 [작업유형] 작업내용

✅ 검증완료:
- 기능테스트: ✅
- 성능검증: ✅  
- 보안점검: ✅
- 코드품질: ✅"
```

---

## 🚀 **즉시 적용 워크플로우**

### **단계 1: 시작 (1분)**
1. `QUICK_CHECKLIST.md` 열기
2. TODO 리스트 생성
3. 날짜/언어 확인

### **단계 2: 개발 (진행 중)**
1. 30분마다 체크포인트 확인
2. 테스트 우선 작성
3. 한국어 주석 필수

### **단계 3: 완료 (5분)**
1. 5단계 검증 실행
2. 문서 자동 생성
3. Git 커밋 수행

---

## 📞 **긴급 상황 대응**

### **🔴 Critical Error**
```bash
# 즉시 중단 → 롤백 → 재검토
git reset --hard HEAD~1
./gradlew clean build
```

### **🟡 Warning**
```bash
# 누락 발견시 즉시 보완
./gradlew test  # 테스트 누락
git add docs/   # 문서 누락
```

---

**📌 이 지침으로 814줄을 100줄로 압축하여 누락 제로를 달성합니다!**

**🎯 성공 공식**: `간단한 체크리스트` + `자동 알림` + `즉시 검증` = `누락 제로` 