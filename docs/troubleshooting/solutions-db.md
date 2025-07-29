# 🔧 Elderberry 트러블슈팅 솔루션 데이터베이스

**자동 생성 문서** - Elderberry-Intellect 시스템이 실시간으로 감지한 이슈들을 자동으로 문서화합니다.

## 📋 사용 가이드

- 🤖 **자동 생성 항목**: AI가 시스템 이벤트를 기반으로 초안을 생성합니다
- ✏️ **개발자 작성 필요**: '해결 방안' 섹션을 개발자가 직접 완성해주세요
- 🏷️ **AI 학습 태그**: 유사한 문제 발생 시 AI가 더 나은 제안을 할 수 있도록 도움을 줍니다
- 📊 **통계**: 총 처리된 이벤트 수: 63개, 생성된 문서 수: 2개

---

## 🔧 복구된 시스템 컴파일 오류 디버깅 #DEBUG-002

**작업 일시**: 2025-07-28 17:00:00  
**작업자**: Claude Code Assistant  
**해결 대상**: board, job, chatbot 시스템의 63개 컴파일 오류  
**심각도**: HIGH (시스템 전체 컴파일 실패)

### 🐛 문제 현황
- **총 컴파일 오류**: 63개 → 0개 (100% 해결)
- **주요 오류 유형**:
  1. Repository-Service 메서드 시그니처 불일치 (25개)
  2. 누락된 엔티티 메서드 (15개)
  3. Spring Boot 3.x 호환성 이슈 (12개)
  4. CustomException 생성자 불일치 (8개)
  5. BaseEntity 메서드 누락 (3개)

### 🛠️ 해결 과정

#### 1단계: Member 엔티티 호환성 수정
```java
// Member.java에 추가
public String getUsername() {
    return this.email;  // email을 username으로 사용
}

// MemberService.java에 추가
public Member findByUsername(String username) {
    return memberRepository.findByEmail(username)
            .orElseThrow(() -> new CustomException.NotFound("존재하지 않는 회원입니다"));
}
```

#### 2단계: CustomException 사용법 통일
```java
// 기존: new CustomException("메시지")
// 수정: new CustomException.NotFound("메시지")
//      new CustomException.Forbidden("메시지")
//      new CustomException.BadRequest("메시지")
```

#### 3단계: BaseEntity 호환성 메서드 추가
```java
// BaseEntity.java에 추가
public LocalDateTime getCreatedDate() {
    return this.createdAt;
}

public LocalDateTime getLastModifiedDate() {
    return this.updatedAt;
}
```

#### 4단계: JobApplication 엔티티 확장
```java
// 누락된 필드들 추가
private String interviewNotes;
private String statusNote;
private String resumeFileUrl;
private Integer experienceYears;
private String educationLevel;
private String certifications;
private LocalDate preferredStartDate;
private String additionalInfo;

// 비즈니스 메서드 추가
public boolean isEditable() {
    return this.status == ApplicationStatus.SUBMITTED || 
           this.status == ApplicationStatus.UNDER_REVIEW;
}
```

#### 5단계: Spring Boot 3.x WebClient 호환성
```java
// ChatbotProxyController.java 수정
// 기존: .timeout(Duration.ofSeconds(5))
// 수정: .retrieve().toEntity(Object.class).timeout(Duration.ofSeconds(5))
```

### ✅ 해결 결과
- **메인 컴파일**: ✅ 성공 (BUILD SUCCESSFUL)
- **프론트엔드 빌드**: ✅ 성공 (Vite 빌드 완료)
- **복구된 시스템**: board, job, chatbot 모두 정상 작동
- **API 엔드포인트**: 모든 REST API 정상 작동 확인

### 🎯 학습 포인트
1. Repository-Service 계층간 메서드 시그니처 일관성 유지 필요
2. Spring Boot 버전 업그레이드 시 WebClient API 변경사항 확인
3. 엔티티 클래스의 setter 메서드 자동 생성 (@Setter) 적극 활용
4. CustomException 계층 구조 명확한 사용 가이드라인 필요

### 🏷️ AI 학습 태그
`#spring-boot-3`, `#compile-errors`, `#repository-pattern`, `#entity-methods`, `#webclient-timeout`, `#custom-exception`

---

## 🔄 Git 복구 작업 #RECOVERY-001

**작업 일시**: 2025-07-28 14:30:00
**작업자**: Claude Code Assistant
**복구 대상**: board, job, chatbot 시스템
**심각도**: HIGH (삭제된 핵심 기능 복구)

### 📋 복구 작업 상세

#### 🎯 복구 목표
- **삭제된 시점**: 커밋 8b0430f에서 "미완성 기능"으로 분류되어 삭제
- **복구 기준점**: 커밋 ea24a3e (삭제 직전 상태)
- **복구 대상 시스템**:
  - board 시스템: 16개 파일 (엔티티, 컨트롤러, 서비스, DTO)
  - job 시스템: 15개 파일 (구인구직 관련 전체 기능)  
  - chatbot 시스템: 1개 파일 (프록시 컨트롤러)

#### 🔧 실행된 복구 명령어
```bash
# 삭제된 파일들 복구
git checkout ea24a3e -- temp-disabled/board/
git checkout ea24a3e -- temp-disabled/job/
git checkout ea24a3e -- temp-disabled/chatbot/

# 적절한 위치로 이동
mv temp-disabled/board/*.java src/main/java/com/globalcarelink/board/
mv temp-disabled/board/dto/*.java src/main/java/com/globalcarelink/board/dto/
mv temp-disabled/job/*.java src/main/java/com/globalcarelink/job/
mv temp-disabled/job/dto/*.java src/main/java/com/globalcarelink/job/dto/
mv temp-disabled/chatbot/*.java src/main/java/com/globalcarelink/chatbot/
```

#### ✅ 복구 성공 사항
1. **파일 복구 완료**: 총 32개 파일 성공적으로 복구
2. **디렉토리 구조 정리**: src/main/java/com/globalcarelink/ 하위로 이동 완료
3. **누락된 서비스 클래스 생성**: PostService, CommentService, CommentRepository 신규 생성
4. **import 문제 해결**: JobController의 DTO import 추가
5. **엔티티 메서드 추가**: Post, Comment 엔티티에 필요한 메서드들 구현

#### 🚨 남은 이슈들 (63개 kompilation 오류)
1. **ResponseEntity 메서드 이슈**: forbidden() → status(403) 변경 필요
2. **Repository 메서드 불일치**: 서비스에서 기대하는 메서드명과 실제 Repository 메서드명 상이
3. **엔티티 메서드 누락**: 다수의 엔티티에서 setter, builder 패턴 메서드 누락
4. **@Builder 기본값 경고**: @Builder.Default 어노테이션 일부 적용 완료

#### 🎯 향후 작업 권장사항
1. **우선순위 1**: Repository 인터페이스와 Service 클래스 간 메서드 시그니처 통일
2. **우선순위 2**: 모든 엔티티의 @Builder.Default 적용 완료
3. **우선순위 3**: Spring Boot 버전 호환성 확인 (ResponseEntity 메서드)
4. **우선순위 4**: 통합 테스트를 통한 전체 기능 검증

### 🏷️ AI 학습 태그
`git-recovery` `deleted-features` `compilation-errors` `entity-methods` `repository-service-mismatch`

---

================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-326f9c5c

**생성 시간**: 2025-07-28 09:19:32
**이벤트 ID**: `ERR-326f9c5c`
**추적 ID**: `2ee32423`
**심각도**: HIGH (BUSINESS)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `Unauthorized`
- **에러 메시지**: 이메일 또는 비밀번호가 올바르지 않습니다
- **발생 위치**: `MemberService.lambda$login$0`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
com.globalcarelink.common.exception.CustomException$Unauthorized: 이메일 또는 비밀번호가 올바르지 않습니다
	at com.globalcarelink.auth.MemberService.lambda$login$0(MemberService.java:74)
	at java.base/java.util.Optional.orElseThrow(Optional.java:403)
	at com.globalcarelink.auth.MemberService.login(MemberService.java:74)

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
*📅 자동 생성됨: 2025-07-28 09:19:32 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-cc06a4d0

**생성 시간**: 2025-07-28 09:20:42
**이벤트 ID**: `ERR-cc06a4d0`
**추적 ID**: `4c75541d`
**심각도**: HIGH (BUSINESS)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `BadRequest`
- **에러 메시지**: 비밀번호는 8-20자이며, 대소문자, 숫자, 특수문자(@$!%*?&)를 각각 하나 이상 포함해야 합니다.
- **발생 위치**: `MemberService.validateRegisterRequest`
- **요청 URL**: `POST /api/auth/register`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
com.globalcarelink.common.exception.CustomException$BadRequest: 비밀번호는 8-20자이며, 대소문자, 숫자, 특수문자(@$!%*?&)를 각각 하나 이상 포함해야 합니다.
	at com.globalcarelink.auth.MemberService.validateRegisterRequest(MemberService.java:183)
	at com.globalcarelink.auth.MemberService.register(MemberService.java:37)

```

### 🤖 자동 분석 결과
- **분석**: BadRequest 에러 발생
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
*📅 자동 생성됨: 2025-07-28 09:20:42 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-37c455ab

**생성 시간**: 2025-07-28 09:24:40
**이벤트 ID**: `ERR-37c455ab`
**추적 ID**: `c308fe2d`
**심각도**: HIGH (BUSINESS)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `Unauthorized`
- **에러 메시지**: 이메일 또는 비밀번호가 올바르지 않습니다
- **발생 위치**: `MemberService.lambda$login$0`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
com.globalcarelink.common.exception.CustomException$Unauthorized: 이메일 또는 비밀번호가 올바르지 않습니다
	at com.globalcarelink.auth.MemberService.lambda$login$0(MemberService.java:74)
	at java.base/java.util.Optional.orElseThrow(Optional.java:403)
	at com.globalcarelink.auth.MemberService.login(MemberService.java:74)

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
*📅 자동 생성됨: 2025-07-28 09:24:40 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-ab0f3bbc

**생성 시간**: 2025-07-28 09:35:46
**이벤트 ID**: `ERR-ab0f3bbc`
**추적 ID**: `24bbb720`
**심각도**: HIGH (BUSINESS)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `Unauthorized`
- **에러 메시지**: 이메일 또는 비밀번호가 올바르지 않습니다
- **발생 위치**: `MemberService.lambda$login$0`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
com.globalcarelink.common.exception.CustomException$Unauthorized: 이메일 또는 비밀번호가 올바르지 않습니다
	at com.globalcarelink.auth.MemberService.lambda$login$0(MemberService.java:74)
	at java.base/java.util.Optional.orElseThrow(Optional.java:403)
	at com.globalcarelink.auth.MemberService.login(MemberService.java:74)

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
*📅 자동 생성됨: 2025-07-28 09:35:46 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-8d98ad75

**생성 시간**: 2025-07-28 09:35:56
**이벤트 ID**: `ERR-8d98ad75`
**추적 ID**: `ac7a1270`
**심각도**: HIGH (BUSINESS)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `Unauthorized`
- **에러 메시지**: 이메일 또는 비밀번호가 올바르지 않습니다
- **발생 위치**: `MemberService.lambda$login$0`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
com.globalcarelink.common.exception.CustomException$Unauthorized: 이메일 또는 비밀번호가 올바르지 않습니다
	at com.globalcarelink.auth.MemberService.lambda$login$0(MemberService.java:74)
	at java.base/java.util.Optional.orElseThrow(Optional.java:403)
	at com.globalcarelink.auth.MemberService.login(MemberService.java:74)

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
*📅 자동 생성됨: 2025-07-28 09:35:56 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-2f9f7056

**생성 시간**: 2025-07-28 09:36:57
**이벤트 ID**: `ERR-2f9f7056`
**추적 ID**: `14a5098a`
**심각도**: HIGH (BUSINESS)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `Unauthorized`
- **에러 메시지**: 이메일 또는 비밀번호가 올바르지 않습니다
- **발생 위치**: `MemberService.lambda$login$0`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
com.globalcarelink.common.exception.CustomException$Unauthorized: 이메일 또는 비밀번호가 올바르지 않습니다
	at com.globalcarelink.auth.MemberService.lambda$login$0(MemberService.java:74)
	at java.base/java.util.Optional.orElseThrow(Optional.java:403)
	at com.globalcarelink.auth.MemberService.login(MemberService.java:74)

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
*📅 자동 생성됨: 2025-07-28 09:36:57 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-26c5d0d2

**생성 시간**: 2025-07-28 09:51:28
**이벤트 ID**: `ERR-26c5d0d2`
**추적 ID**: `8f6e1962`
**심각도**: HIGH (BUSINESS)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `Unauthorized`
- **에러 메시지**: 이메일 또는 비밀번호가 올바르지 않습니다
- **발생 위치**: `MemberService.lambda$login$0`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
com.globalcarelink.common.exception.CustomException$Unauthorized: 이메일 또는 비밀번호가 올바르지 않습니다
	at com.globalcarelink.auth.MemberService.lambda$login$0(MemberService.java:74)
	at java.base/java.util.Optional.orElseThrow(Optional.java:403)
	at com.globalcarelink.auth.MemberService.login(MemberService.java:74)

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
*📅 자동 생성됨: 2025-07-28 09:51:28 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-797e5a34

**생성 시간**: 2025-07-28 10:35:28
**이벤트 ID**: `ERR-797e5a34`
**추적 ID**: `6cb4d239`
**심각도**: HIGH (TECHNICAL)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `RuntimeException`
- **에러 메시지**: 로그인 요청 처리 중 오류가 발생했습니다
- **발생 위치**: `AuthController.login`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
java.lang.RuntimeException: 로그인 요청 처리 중 오류가 발생했습니다
	at com.globalcarelink.auth.AuthController.login(AuthController.java:66)
	at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103)
	at com.globalcarelink.common.config.LoggingAspect.logControllerExecution(LoggingAspect.java:85)

```

### 🤖 자동 분석 결과
- **분석**: RuntimeException 에러 발생
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
*📅 자동 생성됨: 2025-07-28 10:35:28 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-d61d79f5

**생성 시간**: 2025-07-28 10:35:39
**이벤트 ID**: `ERR-d61d79f5`
**추적 ID**: `f26e507f`
**심각도**: HIGH (TECHNICAL)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `RuntimeException`
- **에러 메시지**: 로그인 요청 처리 중 오류가 발생했습니다
- **발생 위치**: `AuthController.login`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
java.lang.RuntimeException: 로그인 요청 처리 중 오류가 발생했습니다
	at com.globalcarelink.auth.AuthController.login(AuthController.java:66)
	at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103)
	at com.globalcarelink.common.config.LoggingAspect.logControllerExecution(LoggingAspect.java:85)

```

### 🤖 자동 분석 결과
- **분석**: RuntimeException 에러 발생
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
*📅 자동 생성됨: 2025-07-28 10:35:39 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-045d3fb3

**생성 시간**: 2025-07-28 10:35:39
**이벤트 ID**: `ERR-045d3fb3`
**추적 ID**: `a6709713`
**심각도**: HIGH (TECHNICAL)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `RuntimeException`
- **에러 메시지**: 로그인 요청 처리 중 오류가 발생했습니다
- **발생 위치**: `AuthController.login`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
java.lang.RuntimeException: 로그인 요청 처리 중 오류가 발생했습니다
	at com.globalcarelink.auth.AuthController.login(AuthController.java:66)
	at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103)
	at com.globalcarelink.common.config.LoggingAspect.logControllerExecution(LoggingAspect.java:85)

```

### 🤖 자동 분석 결과
- **분석**: RuntimeException 에러 발생
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
*📅 자동 생성됨: 2025-07-28 10:35:39 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-464d991c

**생성 시간**: 2025-07-28 10:36:05
**이벤트 ID**: `ERR-464d991c`
**추적 ID**: `85751db4`
**심각도**: HIGH (TECHNICAL)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `RuntimeException`
- **에러 메시지**: 로그인 요청 처리 중 오류가 발생했습니다
- **발생 위치**: `AuthController.login`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
java.lang.RuntimeException: 로그인 요청 처리 중 오류가 발생했습니다
	at com.globalcarelink.auth.AuthController.login(AuthController.java:66)
	at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103)
	at com.globalcarelink.common.config.LoggingAspect.logControllerExecution(LoggingAspect.java:85)

```

### 🤖 자동 분석 결과
- **분석**: RuntimeException 에러 발생
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
*📅 자동 생성됨: 2025-07-28 10:36:05 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-59dd3e61

**생성 시간**: 2025-07-28 10:36:08
**이벤트 ID**: `ERR-59dd3e61`
**추적 ID**: `19d4d426`
**심각도**: HIGH (TECHNICAL)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `RuntimeException`
- **에러 메시지**: 로그인 요청 처리 중 오류가 발생했습니다
- **발생 위치**: `AuthController.login`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
java.lang.RuntimeException: 로그인 요청 처리 중 오류가 발생했습니다
	at com.globalcarelink.auth.AuthController.login(AuthController.java:66)
	at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103)
	at com.globalcarelink.common.config.LoggingAspect.logControllerExecution(LoggingAspect.java:85)

```

### 🤖 자동 분석 결과
- **분석**: RuntimeException 에러 발생
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
*📅 자동 생성됨: 2025-07-28 10:36:08 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-8081ddb2

**생성 시간**: 2025-07-28 10:40:21
**이벤트 ID**: `ERR-8081ddb2`
**추적 ID**: `a8c66b57`
**심각도**: HIGH (TECHNICAL)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `RuntimeException`
- **에러 메시지**: 로그인 요청 처리 중 오류가 발생했습니다
- **발생 위치**: `AuthController.login`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
java.lang.RuntimeException: 로그인 요청 처리 중 오류가 발생했습니다
	at com.globalcarelink.auth.AuthController.login(AuthController.java:66)
	at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103)
	at com.globalcarelink.common.config.LoggingAspect.logControllerExecution(LoggingAspect.java:85)

```

### 🤖 자동 분석 결과
- **분석**: RuntimeException 에러 발생
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
*📅 자동 생성됨: 2025-07-28 10:40:21 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-52518eaf

**생성 시간**: 2025-07-28 10:40:49
**이벤트 ID**: `ERR-52518eaf`
**추적 ID**: `811bc61c`
**심각도**: HIGH (TECHNICAL)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `RuntimeException`
- **에러 메시지**: 로그인 요청 처리 중 오류가 발생했습니다
- **발생 위치**: `AuthController.login`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
java.lang.RuntimeException: 로그인 요청 처리 중 오류가 발생했습니다
	at com.globalcarelink.auth.AuthController.login(AuthController.java:66)
	at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103)
	at com.globalcarelink.common.config.LoggingAspect.logControllerExecution(LoggingAspect.java:85)

```

### 🤖 자동 분석 결과
- **분석**: RuntimeException 에러 발생
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
*📅 자동 생성됨: 2025-07-28 10:40:49 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-7ed9fae4

**생성 시간**: 2025-07-28 10:43:43
**이벤트 ID**: `ERR-7ed9fae4`
**추적 ID**: `1c314c75`
**심각도**: HIGH (TECHNICAL)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `RuntimeException`
- **에러 메시지**: 로그인 요청 처리 중 오류가 발생했습니다
- **발생 위치**: `AuthController.login`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
java.lang.RuntimeException: 로그인 요청 처리 중 오류가 발생했습니다
	at com.globalcarelink.auth.AuthController.login(AuthController.java:66)
	at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103)
	at com.globalcarelink.common.config.LoggingAspect.logControllerExecution(LoggingAspect.java:85)

```

### 🤖 자동 분석 결과
- **분석**: RuntimeException 에러 발생
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
*📅 자동 생성됨: 2025-07-28 10:43:43 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-836112d5

**생성 시간**: 2025-07-28 10:50:53
**이벤트 ID**: `ERR-836112d5`
**추적 ID**: `9416f3ee`
**심각도**: HIGH (BUSINESS)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `Unauthorized`
- **에러 메시지**: 이메일 또는 비밀번호가 올바르지 않습니다
- **발생 위치**: `MemberService.lambda$login$0`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
com.globalcarelink.common.exception.CustomException$Unauthorized: 이메일 또는 비밀번호가 올바르지 않습니다
	at com.globalcarelink.auth.MemberService.lambda$login$0(MemberService.java:74)
	at java.base/java.util.Optional.orElseThrow(Optional.java:403)
	at com.globalcarelink.auth.MemberService.login(MemberService.java:74)

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
*📅 자동 생성됨: 2025-07-28 10:50:53 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-abc7f70d

**생성 시간**: 2025-07-29 02:57:44
**이벤트 ID**: `ERR-abc7f70d`
**추적 ID**: `951d3959`
**심각도**: HIGH (BUSINESS)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `Unauthorized`
- **에러 메시지**: 이메일 또는 비밀번호가 올바르지 않습니다
- **발생 위치**: `MemberService.lambda$login$0`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
com.globalcarelink.common.exception.CustomException$Unauthorized: 이메일 또는 비밀번호가 올바르지 않습니다
	at com.globalcarelink.auth.MemberService.lambda$login$0(MemberService.java:74)
	at java.base/java.util.Optional.orElseThrow(Optional.java:403)
	at com.globalcarelink.auth.MemberService.login(MemberService.java:74)

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
*📅 자동 생성됨: 2025-07-29 02:57:44 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-9029c805

**생성 시간**: 2025-07-29 02:57:56
**이벤트 ID**: `ERR-9029c805`
**추적 ID**: `f23e5b10`
**심각도**: MEDIUM (VALIDATION)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `MethodArgumentNotValidException`
- **에러 메시지**: Validation failed for argument [0] in public org.springframework.http.ResponseEntity<com.globalcarelink.auth.dto.MemberResponse> com.globalcarelink.auth.AuthController.register(com.globalcarelink.auth.dto.MemberRegisterRequest,jakarta.servlet.http.HttpServletRequest): [Field error in object 'memberRegisterRequest' on field 'password': rejected value [test123]; codes [Size.memberRegisterRequest.password,Size.password,Size.java.lang.String,Size]; arguments [org.springframework.context.support.DefaultMessageSourceResolvable: codes [memberRegisterRequest.password,password]; arguments []; default message [password],20,8]; default message [비밀번호는 8-20자여야 합니다]] 
- **발생 위치**: `RequestResponseBodyMethodProcessor.resolveArgument`
- **요청 URL**: `POST /api/auth/register`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
org.springframework.web.bind.MethodArgumentNotValidException: Validation failed for argument [0] in public org.springframework.http.ResponseEntity<com.globalcarelink.auth.dto.MemberResponse> com.globalcarelink.auth.AuthController.register(com.globalcarelink.auth.dto.MemberRegisterRequest,jakarta.servlet.http.HttpServletRequest): [Field error in object 'memberRegisterRequest' on field 'password': rejected value [test123]; codes [Size.memberRegisterRequest.password,Size.password,Size.java.lang.String,Size]; arguments [org.springframework.context.support.DefaultMessageSourceResolvable: codes [memberRegisterRequest.password,password]; arguments []; default message [password],20,8]; default message [비밀번호는 8-20자여야 합니다]] 
	at org.springframework.web.servlet.mvc.method.annotation.RequestResponseBodyMethodProcessor.resolveArgument(RequestResponseBodyMethodProcessor.java:159)
	at org.springframework.web.method.support.HandlerMethodArgumentResolverComposite.resolveArgument(HandlerMethodArgumentResolverComposite.java:122)

```

### 🤖 자동 분석 결과
- **분석**: 입력값 유효성 검증 실패
- **일반적 원인**: @Valid 어노테이션 누락, 잘못된 입력 데이터, 제약 조건 위반
- **권장 해결**: DTO 유효성 검증 강화, 프론트엔드 입력 검증 추가

- **발생 컨텍스트**: VALIDATION 카테고리
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
`validation` `controller` `entity` `dto` 

---
*📅 자동 생성됨: 2025-07-29 02:57:56 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-1e744113

**생성 시간**: 2025-07-29 02:58:00
**이벤트 ID**: `ERR-1e744113`
**추적 ID**: `fe5298da`
**심각도**: HIGH (BUSINESS)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `BadRequest`
- **에러 메시지**: 비밀번호는 8-20자이며, 대소문자, 숫자, 특수문자(@$!%*?&)를 각각 하나 이상 포함해야 합니다.
- **발생 위치**: `MemberService.validateRegisterRequest`
- **요청 URL**: `POST /api/auth/register`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
com.globalcarelink.common.exception.CustomException$BadRequest: 비밀번호는 8-20자이며, 대소문자, 숫자, 특수문자(@$!%*?&)를 각각 하나 이상 포함해야 합니다.
	at com.globalcarelink.auth.MemberService.validateRegisterRequest(MemberService.java:189)
	at com.globalcarelink.auth.MemberService.register(MemberService.java:37)

```

### 🤖 자동 분석 결과
- **분석**: BadRequest 에러 발생
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
*📅 자동 생성됨: 2025-07-29 02:58:00 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-053c31a3

**생성 시간**: 2025-07-29 03:00:47
**이벤트 ID**: `ERR-053c31a3`
**추적 ID**: `2c37bf70`
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
*📅 자동 생성됨: 2025-07-29 03:00:47 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-57c3f2b1

**생성 시간**: 2025-07-29 03:06:24
**이벤트 ID**: `ERR-57c3f2b1`
**추적 ID**: `10ac8b98`
**심각도**: HIGH (BUSINESS)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `Unauthorized`
- **에러 메시지**: 이메일 또는 비밀번호가 올바르지 않습니다
- **발생 위치**: `MemberService.lambda$login$0`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
com.globalcarelink.common.exception.CustomException$Unauthorized: 이메일 또는 비밀번호가 올바르지 않습니다
	at com.globalcarelink.auth.MemberService.lambda$login$0(MemberService.java:74)
	at java.base/java.util.Optional.orElseThrow(Optional.java:403)
	at com.globalcarelink.auth.MemberService.login(MemberService.java:74)

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
*📅 자동 생성됨: 2025-07-29 03:06:24 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-9d40ca52

**생성 시간**: 2025-07-29 11:06:01
**이벤트 ID**: `ERR-9d40ca52`
**추적 ID**: `ac659300`
**심각도**: HIGH (BUSINESS)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `Unauthorized`
- **에러 메시지**: 이메일 또는 비밀번호가 올바르지 않습니다
- **발생 위치**: `MemberService.lambda$login$0`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
com.globalcarelink.common.exception.CustomException$Unauthorized: 이메일 또는 비밀번호가 올바르지 않습니다
	at com.globalcarelink.auth.MemberService.lambda$login$0(MemberService.java:74)
	at java.base/java.util.Optional.orElseThrow(Optional.java:403)
	at com.globalcarelink.auth.MemberService.login(MemberService.java:74)

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
*📅 자동 생성됨: 2025-07-29 11:06:01 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-1bce051a

**생성 시간**: 2025-07-29 11:25:49
**이벤트 ID**: `ERR-1bce051a`
**추적 ID**: `a27ebeaf`
**심각도**: HIGH (BUSINESS)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `Unauthorized`
- **에러 메시지**: 이메일 또는 비밀번호가 올바르지 않습니다
- **발생 위치**: `MemberService.lambda$login$0`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
com.globalcarelink.common.exception.CustomException$Unauthorized: 이메일 또는 비밀번호가 올바르지 않습니다
	at com.globalcarelink.auth.MemberService.lambda$login$0(MemberService.java:74)
	at java.base/java.util.Optional.orElseThrow(Optional.java:403)
	at com.globalcarelink.auth.MemberService.login(MemberService.java:74)

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
*📅 자동 생성됨: 2025-07-29 11:25:49 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-a8b64a40

**생성 시간**: 2025-07-29 11:31:45
**이벤트 ID**: `ERR-a8b64a40`
**추적 ID**: `50956c25`
**심각도**: HIGH (BUSINESS)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `Unauthorized`
- **에러 메시지**: 이메일 또는 비밀번호가 올바르지 않습니다
- **발생 위치**: `MemberService.lambda$login$0`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
com.globalcarelink.common.exception.CustomException$Unauthorized: 이메일 또는 비밀번호가 올바르지 않습니다
	at com.globalcarelink.auth.MemberService.lambda$login$0(MemberService.java:74)
	at java.base/java.util.Optional.orElseThrow(Optional.java:403)
	at com.globalcarelink.auth.MemberService.login(MemberService.java:74)

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
*📅 자동 생성됨: 2025-07-29 11:31:45 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-ff81b878

**생성 시간**: 2025-07-29 11:35:00
**이벤트 ID**: `ERR-ff81b878`
**추적 ID**: `cc4e2a73`
**심각도**: HIGH (TECHNICAL)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `NoResourceFoundException`
- **에러 메시지**: No static resource api/auth/signup.
- **발생 위치**: `ResourceHttpRequestHandler.handleRequest`
- **요청 URL**: `POST /api/auth/signup`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
org.springframework.web.servlet.resource.NoResourceFoundException: No static resource api/auth/signup.
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
*📅 자동 생성됨: 2025-07-29 11:35:00 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-a76da25e

**생성 시간**: 2025-07-29 11:35:46
**이벤트 ID**: `ERR-a76da25e`
**추적 ID**: `af9aa80f`
**심각도**: HIGH (TECHNICAL)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `NoResourceFoundException`
- **에러 메시지**: No static resource api/auth/signup.
- **발생 위치**: `ResourceHttpRequestHandler.handleRequest`
- **요청 URL**: `POST /api/auth/signup`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
org.springframework.web.servlet.resource.NoResourceFoundException: No static resource api/auth/signup.
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
*📅 자동 생성됨: 2025-07-29 11:35:46 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-1e72219c

**생성 시간**: 2025-07-29 11:35:56
**이벤트 ID**: `ERR-1e72219c`
**추적 ID**: `e2c03f35`
**심각도**: MEDIUM (VALIDATION)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `MethodArgumentNotValidException`
- **에러 메시지**: Validation failed for argument [0] in public org.springframework.http.ResponseEntity<com.globalcarelink.auth.dto.MemberResponse> com.globalcarelink.auth.AuthController.register(com.globalcarelink.auth.dto.MemberRegisterRequest,jakarta.servlet.http.HttpServletRequest): [Field error in object 'memberRegisterRequest' on field 'role': rejected value [null]; codes [NotNull.memberRegisterRequest.role,NotNull.role,NotNull.com.globalcarelink.auth.MemberRole,NotNull]; arguments [org.springframework.context.support.DefaultMessageSourceResolvable: codes [memberRegisterRequest.role,role]; arguments []; default message [role]]; default message [사용자 역할은 필수입니다]] 
- **발생 위치**: `RequestResponseBodyMethodProcessor.resolveArgument`
- **요청 URL**: `POST /api/auth/register`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
org.springframework.web.bind.MethodArgumentNotValidException: Validation failed for argument [0] in public org.springframework.http.ResponseEntity<com.globalcarelink.auth.dto.MemberResponse> com.globalcarelink.auth.AuthController.register(com.globalcarelink.auth.dto.MemberRegisterRequest,jakarta.servlet.http.HttpServletRequest): [Field error in object 'memberRegisterRequest' on field 'role': rejected value [null]; codes [NotNull.memberRegisterRequest.role,NotNull.role,NotNull.com.globalcarelink.auth.MemberRole,NotNull]; arguments [org.springframework.context.support.DefaultMessageSourceResolvable: codes [memberRegisterRequest.role,role]; arguments []; default message [role]]; default message [사용자 역할은 필수입니다]] 
	at org.springframework.web.servlet.mvc.method.annotation.RequestResponseBodyMethodProcessor.resolveArgument(RequestResponseBodyMethodProcessor.java:159)
	at org.springframework.web.method.support.HandlerMethodArgumentResolverComposite.resolveArgument(HandlerMethodArgumentResolverComposite.java:122)

```

### 🤖 자동 분석 결과
- **분석**: 입력값 유효성 검증 실패
- **일반적 원인**: @Valid 어노테이션 누락, 잘못된 입력 데이터, 제약 조건 위반
- **권장 해결**: DTO 유효성 검증 강화, 프론트엔드 입력 검증 추가

- **발생 컨텍스트**: VALIDATION 카테고리
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
`validation` `controller` `entity` `dto` 

---
*📅 자동 생성됨: 2025-07-29 11:35:56 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-337e8074

**생성 시간**: 2025-07-29 11:36:17
**이벤트 ID**: `ERR-337e8074`
**추적 ID**: `369b8da4`
**심각도**: HIGH (BUSINESS)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `BadRequest`
- **에러 메시지**: 비밀번호는 8-20자이며, 대소문자, 숫자, 특수문자(@$!%*?&)를 각각 하나 이상 포함해야 합니다.
- **발생 위치**: `MemberService.validateRegisterRequest`
- **요청 URL**: `POST /api/auth/register`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
com.globalcarelink.common.exception.CustomException$BadRequest: 비밀번호는 8-20자이며, 대소문자, 숫자, 특수문자(@$!%*?&)를 각각 하나 이상 포함해야 합니다.
	at com.globalcarelink.auth.MemberService.validateRegisterRequest(MemberService.java:189)
	at com.globalcarelink.auth.MemberService.register(MemberService.java:37)

```

### 🤖 자동 분석 결과
- **분석**: BadRequest 에러 발생
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
*📅 자동 생성됨: 2025-07-29 11:36:17 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-03a8db86

**생성 시간**: 2025-07-29 11:36:31
**이벤트 ID**: `ERR-03a8db86`
**추적 ID**: `172f6f86`
**심각도**: HIGH (TECHNICAL)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `NoResourceFoundException`
- **에러 메시지**: No static resource api/test/hello.
- **발생 위치**: `ResourceHttpRequestHandler.handleRequest`
- **요청 URL**: `POST /api/test/hello`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
org.springframework.web.servlet.resource.NoResourceFoundException: No static resource api/test/hello.
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
*📅 자동 생성됨: 2025-07-29 11:36:31 | 🤖 Elderberry-Intellect v2.0*


================================================================================
## 🚨 자동 감지된 에러 이슈 #ERR-75db5fb4

**생성 시간**: 2025-07-29 11:37:01
**이벤트 ID**: `ERR-75db5fb4`
**추적 ID**: `bef4bef8`
**심각도**: HIGH (BUSINESS)
**자동 생성**: Elderberry-Intellect 시스템

### 🔍 에러 상세 정보
- **에러 타입**: `Unauthorized`
- **에러 메시지**: 이메일 또는 비밀번호가 올바르지 않습니다
- **발생 위치**: `MemberService.lambda$login$0`
- **요청 URL**: `POST /api/auth/login`
- **클라이언트 IP**: 127.0.0.1

### 📋 스택 트레이스 (핵심 부분)
```
com.globalcarelink.common.exception.CustomException$Unauthorized: 이메일 또는 비밀번호가 올바르지 않습니다
	at com.globalcarelink.auth.MemberService.lambda$login$0(MemberService.java:74)
	at java.base/java.util.Optional.orElseThrow(Optional.java:403)
	at com.globalcarelink.auth.MemberService.login(MemberService.java:74)

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
*📅 자동 생성됨: 2025-07-29 11:37:01 | 🤖 Elderberry-Intellect v2.0*

