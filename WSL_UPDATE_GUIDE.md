# 🔧 WSL 업데이트 문제 해결 가이드

## 📋 현재 상황
- **WSL2 커널**: 5.10.16.3 (2021년 버전)
- **Docker Desktop**: 설치되어 있음
- **문제**: WSL 업데이트 안됨

## 🚀 해결 방법 (순서대로 시도)

### **방법 1: PowerShell 관리자 권한으로 실행**

#### 1. Windows PowerShell 관리자 권한 실행
```powershell
# Windows 키 → PowerShell 검색 → 관리자 권한으로 실행
```

#### 2. WSL 업데이트 명령 실행
```powershell
# WSL 업데이트
wsl --update

# 강제 업데이트 (권장)
wsl --update --web-download
```

#### 3. WSL 종료 후 재시작
```powershell
# 모든 WSL 인스턴스 종료
wsl --shutdown

# 버전 확인
wsl --version

# WSL 재시작
wsl
```

### **방법 2: 수동 WSL2 커널 업데이트**

#### 1. 최신 WSL2 커널 다운로드
```
https://aka.ms/wsl2kernel
```
- 위 링크에서 `wsl_update_x64.msi` 다운로드
- 다운로드한 파일 실행하여 설치

#### 2. Windows 재시작
- 커널 업데이트 후 Windows 재시작 필수

### **방법 3: Windows 업데이트 확인**

#### 1. Windows 설정 열기
```
Windows 설정 → 업데이트 및 보안 → Windows Update
```

#### 2. 업데이트 확인
- "업데이트 확인" 클릭
- KB5020030 또는 최신 WSL 관련 업데이트 설치

### **방법 4: WSL 재설치 (최후 수단)**

#### 1. 현재 WSL 백업
```powershell
# PowerShell 관리자 권한
wsl --export Ubuntu backup.tar
```

#### 2. WSL 기능 재설정
```powershell
# Windows 기능 끄기
dism.exe /online /disable-feature /featurename:Microsoft-Windows-Subsystem-Linux /norestart
dism.exe /online /disable-feature /featurename:VirtualMachinePlatform /norestart

# Windows 재시작

# Windows 기능 다시 켜기
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# WSL2를 기본으로 설정
wsl --set-default-version 2
```

## 🐳 Docker Desktop WSL 통합 확인

### 1. Docker Desktop 설정 확인
- Docker Desktop 실행
- Settings → Resources → WSL Integration
- "Enable integration with my default WSL distro" 체크
- Ubuntu 토글 활성화

### 2. WSL에서 Docker 확인
```bash
# WSL 터미널에서
docker --version
docker-compose --version
```

## ⚡ 빠른 해결책 (즉시 시도)

### PowerShell 관리자 권한으로:
```powershell
# 한 번에 실행 (복사하여 붙여넣기)
wsl --shutdown
wsl --update --web-download
wsl --set-default-version 2
```

### 재시작 후 WSL에서:
```bash
# Docker 작동 확인
docker run hello-world
```

## 🔍 문제 지속 시

### 1. 오류 메시지 확인
```powershell
# 상세 오류 확인
wsl --status
wsl --list --verbose
```

### 2. Windows 버전 확인
```powershell
# Windows 버전 (Win10 버전 2004 이상 또는 Win11 필요)
winver
```

### 3. 가상화 활성화 확인
- BIOS에서 가상화(VT-x/AMD-V) 활성화 필요
- Hyper-V 활성화 필요

## 💡 임시 해결책 (업데이트 전)

### 기존 방식으로 개발 계속:
```bash
# WSL에서 로컬 개발
./dev-start.sh

# Docker 없이도 작동
# 프론트엔드: http://localhost:5173
# 백엔드: http://localhost:8080
```

## 📊 예상 결과

### 업데이트 성공 시:
- WSL2 커널: 5.15.x 이상
- Docker 명령어 정상 작동
- docker-compose 사용 가능

### 현재 개발 환경:
- 기존 ./dev-start.sh는 계속 사용 가능
- Docker 업데이트는 팀 협업 시 유용
- 당장 급하지 않으면 나중에 해결해도 무방