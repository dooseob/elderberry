# 🐳 Docker Desktop WSL2 통합 문제 해결

## 📋 현재 상황
- **WSL2**: 이미 설치됨 (Ubuntu 24.04.2 LTS)
- **Docker Desktop**: Windows에 설치됨
- **문제**: WSL2에서 docker 명령어 사용 불가

## 🔧 즉시 해결 방법

### **1단계: Docker Desktop 설정 확인 (Windows에서)**

#### 1. Docker Desktop 실행
- Windows 시스템 트레이에서 Docker 아이콘 확인
- Docker Desktop이 실행 중인지 확인

#### 2. WSL Integration 설정
```
Docker Desktop → Settings(⚙️) → Resources → WSL Integration
```

다음 항목들을 확인하고 활성화:
- ✅ "Enable integration with my default WSL distro" 체크
- ✅ Ubuntu-24.04 토글 켜기 (중요!)
- "Apply & restart" 클릭

### **2단계: WSL 재시작**

#### PowerShell(관리자)에서:
```powershell
# WSL 완전 종료
wsl --shutdown

# 10초 대기 후 재시작
wsl
```

### **3단계: WSL에서 Docker 확인**

#### WSL 터미널에서:
```bash
# Docker 버전 확인
docker --version

# Docker 실행 테스트
docker run hello-world
```

## 🚨 그래도 안될 때

### **방법 A: Docker Desktop 재설치**

1. **Docker Desktop 완전 제거**
   - 제어판 → 프로그램 제거 → Docker Desktop
   - Windows 재시작

2. **최신 버전 다운로드**
   - https://www.docker.com/products/docker-desktop/
   - "Download for Windows" 클릭

3. **설치 시 주의사항**
   - ✅ "Use WSL 2 instead of Hyper-V" 옵션 선택
   - ✅ "Add shortcut to desktop" 선택

4. **설치 후 WSL Integration 재설정**

### **방법 B: 수동 Docker 설치 (WSL 내부)**

만약 Docker Desktop 연동이 계속 안되면:

```bash
# WSL Ubuntu에서 Docker CE 직접 설치
# 1. 기존 Docker 패키지 제거
sudo apt-get remove docker docker-engine docker.io containerd runc

# 2. 필수 패키지 설치
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg lsb-release

# 3. Docker GPG 키 추가
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 4. Docker 저장소 추가
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. Docker 설치
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 6. 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER

# 7. WSL 재시작 후 테스트
exit
# Windows에서 wsl 다시 실행
docker run hello-world
```

## 💡 빠른 체크리스트

### Docker Desktop 상태 확인:
1. ✅ Docker Desktop이 실행 중인가?
2. ✅ WSL Integration이 켜져 있는가?
3. ✅ Ubuntu-24.04가 활성화되어 있는가?
4. ✅ "Apply & restart"를 클릭했는가?

### WSL에서 확인:
```bash
# PATH에 docker 경로가 있는지 확인
echo $PATH | grep docker

# Docker 소켓 확인
ls -la /var/run/docker.sock
```

## 🔄 대안: 임시 해결책

### Docker 없이 개발 계속하기:
```bash
# 현재 잘 작동하는 방식 유지
./dev-start.sh

# 프론트엔드: http://localhost:5173
# 백엔드: http://localhost:8080
```

Docker는 팀 협업 시 환경 통일용이므로, 당장은 없어도 개발 가능합니다.

## 📝 추가 디버깅

문제가 지속되면 다음 정보 확인:
```bash
# WSL 배포판 목록
wsl --list --verbose

# Docker Desktop 로그 위치 (Windows)
%LOCALAPPDATA%\Docker\log.txt

# WSL 로그
dmesg | grep -i docker
```