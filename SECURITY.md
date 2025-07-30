# 🔐 엘더베리 프로젝트 보안 가이드

> **중요**: GitHub 프라이빗 저장소라도 보안은 절대적으로 중요합니다!

## 🚨 **보안 원칙**

### **1. 환경변수 사용 필수**
```bash
# ✅ 올바른 방법 - application.yml
jwt:
  secret: ${JWT_SECRET:CHANGE-THIS-SECRET-KEY-IMMEDIATELY-FOR-SECURITY}

# ❌ 잘못된 방법 - 하드코딩
jwt:
  secret: "my-secret-key-123"
```

### **2. .env 파일 관리**
```bash
# ✅ .env 파일에 실제 값 저장 (Git 제외)
JWT_SECRET=abcd1234567890xyz-your-real-secret-key-here

# ✅ .env.example에는 가이드만 제공
JWT_SECRET=PLEASE-GENERATE-STRONG-256BIT-SECRET-KEY-FOR-PRODUCTION
```

## 🛡️ **보안 체크리스트**

### **개발 시 필수 확인사항**
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는가?
- [ ] `application.yml`에 하드코딩된 비밀번호/키가 없는가?
- [ ] Docker Compose 파일에 환경변수 패턴을 사용하고 있는가?
- [ ] API 키를 코드나 문서에 직접 작성하지 않았는가?
- [ ] JWT 시크릿이 256비트 이상의 복잡한 문자열인가?

### **커밋 전 보안 체크**
```bash
# 1. 하드코딩된 비밀번호 검색
grep -r "password.*=" --include="*.yml" --include="*.properties" .

# 2. API 키 하드코딩 검색  
grep -r "api.*key.*=" --include="*.java" --include="*.js" --include="*.ts" .

# 3. JWT 시크릿 하드코딩 검색
grep -r "jwt.*secret" --include="*.yml" --include="*.properties" .

# 4. .env 파일이 추적되고 있지 않은지 확인
git status | grep ".env"
```

## 🔑 **환경변수 설정 가이드**

### **JWT 시크릿 생성**
```bash
# 256비트 랜덤 키 생성 (Linux/WSL)
openssl rand -base64 32

# 또는 Node.js로 생성
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### **Redis 비밀번호 생성**
```bash
# 강력한 Redis 비밀번호 생성
openssl rand -base64 24
```

## 🚫 **절대 금지사항**

### **1. 코드/문서에 하드코딩 금지**
```yaml
# ❌ 절대 하지 말 것
jwt:
  secret: "elderberry-secret-123"
  
redis:
  password: "redis123!"

# ❌ 문서에도 실제 값 작성 금지
# 우리 API 키: sk-abc123xyz (실제 키 예시)
```

### **2. .env 파일 커밋 금지**
```bash
# ❌ 절대 하지 말 것
git add .env
git commit -m "환경설정 추가"

# ✅ 올바른 방법
git add .env.example
git commit -m "환경설정 예제 추가"
```

### **3. Docker에 하드코딩 금지**
```yaml
# ❌ 잘못된 방법
environment:
  - JWT_SECRET=my-hardcoded-secret

# ✅ 올바른 방법  
environment:
  - JWT_SECRET=${JWT_SECRET:-fallback-for-dev}
```

## 🎯 **환경별 보안 설정**

### **개발 환경**
```bash
# .env (개발용 - Git 제외)
JWT_SECRET=dev-jwt-secret-change-for-production
REDIS_PASSWORD=dev-redis-password
PUBLIC_DATA_API_KEY=your-actual-dev-api-key
```

### **운영 환경**
```bash
# 운영서버 환경변수 설정
export JWT_SECRET="$(openssl rand -base64 32)"
export REDIS_PASSWORD="$(openssl rand -base64 24)"
export PUBLIC_DATA_API_KEY="actual-production-api-key"
```

## 🔍 **보안 감사 도구**

### **자동 보안 검사 스크립트**
```bash
#!/bin/bash
# security-check.sh

echo "🔍 보안 검사 시작..."

# 하드코딩된 비밀번호 검사
echo "1. 하드코딩된 비밀번호 검사..."
if grep -r "password.*=" --include="*.yml" --include="*.properties" src/; then
  echo "❌ 하드코딩된 비밀번호 발견!"
  exit 1
fi

# API 키 하드코딩 검사
echo "2. API 키 하드코딩 검사..."
if grep -r "api.*key.*=" --include="*.java" --include="*.js" src/; then
  echo "❌ 하드코딩된 API 키 발견!"
  exit 1
fi

# .env 파일 추적 검사
echo "3. .env 파일 추적 검사..."
if git ls-files | grep "\.env$"; then
  echo "❌ .env 파일이 Git에 추적되고 있습니다!"
  exit 1
fi

echo "✅ 보안 검사 통과!"
```

## 📞 **보안 문제 발견 시**

### **즉시 조치사항**
1. **API 키 노출**: 해당 API 키 즉시 폐기 및 재발급
2. **JWT 시크릿 노출**: 새로운 시크릿 생성 및 모든 사용자 재로그인 필요
3. **데이터베이스 비밀번호 노출**: 비밀번호 즉시 변경
4. **커밋 기록에서 제거**: `git filter-branch` 또는 새 저장소 생성

### **보안 인시던트 대응**
```bash
# 1. 노출된 커밋에서 민감정보 제거
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env' \
  --prune-empty --tag-name-filter cat -- --all

# 2. 강제 푸시 (주의: 팀원과 협의 필요)
git push origin --force --all

# 3. 새로운 시크릿 생성 및 적용
openssl rand -base64 32 > .env.new
```

## 🏆 **보안 베스트 프랙티스**

### **1. 최소 권한 원칙**
- API 키는 필요한 권한만 부여
- 데이터베이스 사용자는 최소 권한으로 생성
- Redis는 특정 명령어만 허용

### **2. 정기적인 보안 점검**
- 월 1회 API 키 만료일 확인
- 분기 1회 비밀번호 변경
- 연 2회 전체 보안 감사

### **3. 팀원 보안 교육**
- 새 팀원 온보딩 시 보안 가이드 교육
- 보안 사고 사례 공유
- 보안 도구 사용법 교육

---

## 📋 **현재 보안 상태 (2025-07-30)**

### ✅ **완료된 보안 조치**
- `application.yml`의 JWT 시크릿을 환경변수로 변경
- Docker Compose 파일의 하드코딩된 비밀번호 환경변수화
- `.env.example` 파일의 보안 가이드 강화
- `.gitignore`에 모든 보안 파일 패턴 추가

### ⚠️ **주의 필요한 항목**
- `.env` 파일의 실제 API 키들 (현재 빈 상태)
- 운영 환경 배포 시 강력한 비밀번호 설정 필요
- 팀원 추가 시 보안 가이드 공유 필요

### 🎯 **다음 단계**
1. 실제 API 키 발급 및 `.env` 파일 설정
2. 운영 환경용 강력한 JWT 시크릿 생성
3. 보안 체크 스크립트를 CI/CD에 통합
4. 정기적인 보안 감사 일정 수립

**🔒 보안은 한 번 설정하고 끝이 아닙니다. 지속적인 관리와 점검이 필요합니다!**