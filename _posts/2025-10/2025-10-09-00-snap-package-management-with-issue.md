---
layout: post 
title: Ubuntu 서버 설정 할 때 snap 사용 시 주의해야하는 이유는?
subtitle: snap 패키지를 써봤더니...
categories: 문제해결
tags: DevOps Docker Linux
thumb: /assets/images/posts/2025-09/2025-09-04-002.png
custom-excerpt: 서버 구축 중에 ubuntu gui 를 활용해서 설치를 해보았더니...? 
banner:
  # video: https://vjs.zencdn.net/v/oceans.mp4
  video: /assets/images/posts/2025-09/2025-09-04-002.png
  loop: true
  volume: 0.8
  muted: true                 # For mobile device background music play 
  start_at: 8.5
  image: /assets/images/posts/2025-09/2025-09-04-002.png
  opacity: 0.618
  background: "#000"
  height: "100vh"
  min_height: "38vh"
  heading_style: "font-size: 4.25em; font-weight: bold; text-decoration: underline"
  subheading_style: "color: gold"
---

## Ubuntu에서 Docker를 sudo 없이 사용하려다 발견한 snap 설치의 함정

### 문제 상황

Project 를 위하여 Ubuntu 서버 머신을 한대 구했다. Geekom의 A5 7530U 칩셋 탑재 제품으로 윈도우 데스크탑은 나쁘지 않으나, 전성비나, 항시 켜놓고 사용 하기 위함, WSL의 번거로움 등을 고려할 때, 온전한 리눅스 전용 머신의 필요성으로 미니 PC 를 한대 구매했다. 

Ubuntu 22.04 LTS 기반으로 설치 후, 개발환경 설정, 컨테이너 활용을 위해 Docker 설정까지 끝냈었다. 그리하여 Docker 명령어를 실행할 때마다 `sudo`를 입력하는 것이 번거로워, 일반 사용자 계정을 docker 그룹에 추가하려고 했다. 그런데 예상치 못한 문제들이 연쇄적으로 발생했는데...

### 발견한 문제들

#### 1. docker 그룹이 존재하지 않음

일반적으로 Docker를 설치하면 자동으로 생성되는 `docker` 그룹이 시스템에 존재하지 않았다.

```bash
cat /etc/group | grep docker
# 결과: 아무것도 출력되지 않음
```

#### 2. systemctl로 Docker 서비스를 찾을 수 없음

Docker가 분명 설치되어 있고 실행도 되는데, `systemctl status docker` 명령이 작동하지 않았다.

```bash
docker --version
# Docker version 24.x.x 등 정상 출력

systemctl status docker
# Unit docker.service could not be found.
```

#### 3. 원인: snap으로 설치된 Docker

Docker 그룹이 설정이 안되는 경우는 공식 가이드 문서에서 볼 때 수동 설치만 해주면 되는 것이었다. [링크](https://docs.docker.com/engine/install/linux-postinstall/)
단, 다른 문제들에 대해서는 찾아본 결과 snap 패키지였던 것이 문제의 근본 원인이었다. (이번엔 편한게 해보겠다고 스토어로 GUI 로 설치했더니만...)

```bash
snap list | grep docker
# docker    xx.x.x    xxxx    latest/stable    canonical    -
```

### snap vs apt: 무엇이 다른가?

#### snap의 특징

snap은 Ubuntu에서 개발한 독립적인 패키지 시스템으로, 다음과 같은 특징이 있다:

- **완전한 격리(confinement)**: 앱을 샌드박스 환경에서 실행
- **자체 포함(self-contained)**: 모든 의존성을 패키지 내부에 포함
- **보안 우선**: 시스템 리소스 접근이 제한적
- **자동 업데이트**: 백그라운드에서 자동으로 업데이트

#### apt의 특징

전통적인 패키지 관리 시스템으로:

- **시스템 통합**: 시스템 라이브러리를 직접 공유
- **완전한 접근**: 시스템 리소스에 제약 없이 접근
- **가벼움**: 공유 라이브러리 사용으로 용량 절약
- **수동 관리**: 사용자가 직접 업데이트 제어

---
#### Docker에는 왜 apt가 적합한가?

결과적으로 차이점을 고려해본 결과  Docker는 시스템 레벨에서 동작하는 도구이므로:

- 호스트 파일시스템에 광범위하게 접근 필요
- 네트워크, 프로세스, 저장소 등 시스템 리소스 제어 필요
- snap의 격리 정책이 오히려 제약으로 작용

일반 사용자에게는 snap이 편리하고 안전하지만, **서버 개발 도구로는 apt 방식이 훨씬 적합하다는 결론을 내릴 수 있었다**.

### 해결 방법: snap 제거 후 apt로 재설치

#### 1. 기존 snap Docker 제거

```bash
sudo snap remove docker
```

#### 2. 기존 apt Docker 패키지 제거 (있을 경우 대비)

```bash
sudo apt remove docker docker-engine docker.io containerd runc
```

#### 3. Docker 공식 저장소에서 설치

**필수 패키지 설치:**

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release
```

**Docker 공식 GPG 키 추가:**

```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
```

**Docker 저장소 추가:**

```bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

**Docker 설치:**

```bash
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

#### 4. 일반 사용자로 Docker 사용 설정

**docker 그룹에 사용자 추가:**

```bash
sudo usermod -aG docker $USER
```

**변경사항 적용:**

```bash
newgrp docker
# 또는 로그아웃 후 재로그인
```

**설치 확인:**

```bash
docker --version
docker run hello-world
```

### 주의사항

#### 보안 고려사항

docker 그룹에 속한 사용자는 **root 권한과 동등한 접근**이 가능하다. 이는 다음을 의미한다:

- 컨테이너를 통해 호스트 시스템의 모든 파일에 접근 가능
- 권한 상승(privilege escalation) 위험 존재
- 보안이 중요한 환경에서는 신중히 고려 필요

#### 데이터 백업

snap에서 apt로 전환 시 기존 데이터가 삭제된다:

- snap Docker 컨테이너 및 이미지: 모두 삭제됨
- 볼륨 데이터 경로: `/var/snap/docker/`에서 `/var/lib/docker/`로 변경
- 중요한 데이터가 있다면 사전에 `docker save`, `docker export` 등으로 백업 필요

### 참고 자료

- [Docker 공식 문서 - Linux 설치 후 설정](https://docs.docker.com/engine/install/linux-postinstall/)
- [Docker 공식 문서 - Ubuntu 설치](https://docs.docker.com/engine/install/ubuntu/)
- [Docker 공식 문서 - Rootless 모드](https://docs.docker.com/engine/security/rootless/)

### 결론

GUI를 통한 편리한 설치가 항상 최선은 아니네 싶다. 특히 개발 도구의 경우, 패키지 관리 방식에 따라 동작 방식과 시스템 통합 수준이 크게 달라진다. Docker처럼 시스템 레벨 접근이 필요한 도구는 snap보다 전통적인 apt 방식이 더 적합하며, 이를 통해 불필요한 제약 없이, 최적화된 개발 환경을 구축할 수 있다. 

물론 일반 사용에선 전혀 그렇지 않다고 생각도 든다. 왜냐면 리눅스 시스템의 라이브러리의 의존성 문제로 업데이트를 잘못하면 큰일나는 경우를 몇 번 경험했고(...) 무지성하게 구글에서 명령어 긁어다가, install 박아버리는 순간 지옥이 펼쳐지는 경우를 생각한다면(...). 의존성을 확실하게 관리하고 마치 Docker 처럼 정확하게 컨테이너화 시키는게 확실히 이유가 있어 보였다. 이러한 지점에서 Ubuntu 가 일반 소비자용의 철학을 가진 OS 라는 점을, 새삼 느끼게 만든다. (근데 프로세스까지 독립적으로 관리하게 하는 건 좀...)