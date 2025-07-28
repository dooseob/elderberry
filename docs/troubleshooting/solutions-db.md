# 🔧 Elderberry 트러블슈팅 솔루션 데이터베이스

**자동 생성 문서** - Elderberry-Intellect 시스템이 실시간으로 감지한 이슈들을 자동으로 문서화합니다.

## 📋 사용 가이드

- 🤖 **자동 생성 항목**: AI가 시스템 이벤트를 기반으로 초안을 생성합니다
- ✏️ **개발자 작성 필요**: '해결 방안' 섹션을 개발자가 직접 완성해주세요
- 🏷️ **AI 학습 태그**: 유사한 문제 발생 시 AI가 더 나은 제안을 할 수 있도록 도움을 줍니다
- 📊 **통계**: 총 처리된 이벤트 수: 0개, 생성된 문서 수: 0개

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

