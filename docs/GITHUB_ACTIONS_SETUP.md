# GitHub Actions 설정 가이드

## 📋 개요

이 문서는 Elderberry 프로젝트의 GitHub Actions CI/CD 파이프라인 설정 방법을 설명합니다.

## 🔐 필수 시크릿 설정

GitHub 저장소의 Settings → Secrets and variables → Actions에서 다음 시크릿을 추가해야 합니다:

### 1. 배포 관련 시크릿

#### Staging 환경
- `STAGING_HOST`: 스테이징 서버 호스트 (예: staging.elderberry.example.com)
- `STAGING_USER`: SSH 사용자명
- `STAGING_SSH_KEY`: SSH 개인키 (전체 내용 복사)
- `STAGING_PORT`: SSH 포트 (기본값: 22)

#### Production 환경
- `PROD_HOST`: 프로덕션 서버 호스트
- `PROD_USER`: SSH 사용자명
- `PROD_SSH_KEY`: SSH 개인키
- `PROD_PORT`: SSH 포트

### 2. 외부 서비스 연동

#### Snyk (보안 스캔)
- `SNYK_TOKEN`: Snyk API 토큰
  1. https://app.snyk.io 접속
  2. Account Settings → Auth Token
  3. 토큰 복사하여 시크릿에 추가

#### Slack 알림
- `SLACK_WEBHOOK`: Slack Webhook URL
  1. Slack 워크스페이스에서 앱 추가
  2. Incoming Webhooks 설정
  3. Webhook URL 복사

### 3. Docker Registry (GitHub Container Registry 사용 시)
- 별도 설정 불필요 (GITHUB_TOKEN 자동 사용)

## 🔧 워크플로우 파일 구조

```
.github/
├── workflows/
│   ├── ci-backend.yml      # 백엔드 CI
│   ├── ci-frontend.yml     # 프론트엔드 CI
│   ├── docker-build.yml    # Docker 이미지 빌드
│   ├── deploy.yml          # 배포 자동화
│   ├── pr-check.yml        # PR 검증
│   └── codeql.yml          # 보안 분석
├── dependabot.yml          # 의존성 자동 업데이트
├── labeler.yml             # PR 자동 라벨링
├── auto-assign.yml         # 리뷰어 자동 할당
├── PULL_REQUEST_TEMPLATE.md
└── ISSUE_TEMPLATE/
    ├── bug_report.md
    └── feature_request.md
```

## 🚀 워크플로우 활성화

### 1. 기본 브랜치 설정
```bash
# master 브랜치를 기본으로 사용
git checkout master
git push origin master
```

### 2. 브랜치 보호 규칙 설정
Settings → Branches → Add rule:
- Branch name pattern: `master`
- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
  - Backend CI
  - Frontend CI
  - CodeQL Analysis
- ✅ Require branches to be up to date before merging
- ✅ Include administrators

### 3. 환경(Environment) 설정
Settings → Environments:

#### staging 환경
- Name: `staging`
- Environment URL: `https://staging.elderberry.example.com`
- Required reviewers: (선택사항)

#### production 환경
- Name: `production`
- Environment URL: `https://elderberry.example.com`
- Required reviewers: 1명 이상 추가
- Deployment branches: `master` 브랜치만

## 📊 모니터링

### GitHub Actions 대시보드
- Actions 탭에서 워크플로우 실행 상태 확인
- 각 워크플로우 클릭하여 상세 로그 확인

### 상태 배지
README.md에 추가된 배지로 빌드 상태 실시간 확인:
- Backend CI
- Frontend CI
- Docker Build
- CodeQL Analysis

## 🔄 로컬 테스트

### act를 사용한 로컬 테스트
```bash
# act 설치 (Windows)
choco install act-cli

# 워크플로우 테스트
act -W .github/workflows/ci-backend.yml
act -W .github/workflows/ci-frontend.yml
```

## 📝 주의사항

1. **시크릿 보안**
   - 시크릿을 코드에 직접 작성하지 마세요
   - 로그에 시크릿이 노출되지 않도록 주의

2. **비용 관리**
   - GitHub Actions는 public 저장소는 무료
   - private 저장소는 월 2,000분 무료 (이후 유료)

3. **캐시 활용**
   - Gradle, npm 캐시 적극 활용하여 빌드 시간 단축
   - Docker 레이어 캐시 활용

## 🆘 문제 해결

### 워크플로우가 실행되지 않을 때
1. 브랜치 이름 확인 (master/main)
2. 워크플로우 파일 문법 검증
3. 시크릿 설정 확인

### 빌드 실패 시
1. 로그 상세 확인
2. 로컬에서 동일 명령어 테스트
3. 의존성 버전 확인

### 배포 실패 시
1. SSH 연결 테스트
2. 서버 디스크 공간 확인
3. Docker 상태 확인

## 📚 참고 자료
- [GitHub Actions 공식 문서](https://docs.github.com/en/actions)
- [Docker Build Action](https://github.com/docker/build-push-action)
- [CodeQL 문서](https://codeql.github.com/docs/)