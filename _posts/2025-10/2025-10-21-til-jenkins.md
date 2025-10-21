---
layout: post 
title: TIL - Jenkins 서버 배포 및 무중단 배포 준비 프로세스
subtitle: nextjs 기반 앱을 무중단 배포 구성하기
categories: 학습
tags: 학습 NextJS DevOps Jenkins Docker
thumb: /assets/images/posts/2025-10/2025-10-17-025.png
custom-excerpt: 2025년 10월 21일 개발 내용 요약 및 학습 정리
banner:
  # video: https://vjs.zencdn.net/v/oceans.mp4
  loop: true
  volume: 0.8
  muted: true                 # For mobile device background music play 
  start_at: 8.5
  image: /assets/images/posts/2025-10/2025-10-17-026.png
  opacity: 0.318
  background: "#000"
  height: "100vh"
  min_height: "38vh"
  heading_style: "font-size: 4.25em; font-weight: bold; text-decoration: underline"
  subheading_style: "color: gold"
---

알겠습니다, 한솔. "다음 단계(Next Steps)" 섹션을 삭제하고, 오늘 완료한 작업의 세부 명령어와 코드 블럭을 보강하여 최종 TIL 문서를 다시 정리했습니다.

-----

## 2025년 10월 21일: 젠킨스(Jenkins) 서버 구축 및 무중단 배포 아키텍처 설계

### 1. 오늘의 목표

'실무형 CI/CD 파이프라인' 구축의 첫 단계로, JCasC(Jenkins Configuration as Code)를 활용해 젠킨스 서버를 독립적으로 설치하고, SSH 기반의 Blue/Green 무중단 배포 아키텍처를 설계 및 확정했다.

### 2. 핵심 아키텍처 설계 

젠킨스 서버의 독립성과 이식성을 최우선으로 하며, 실제 상용 서비스의 빌드/배포 환경을 정확히 모사하는 것을 목표로 한다.

#### 1. 핵심 원칙

  * **젠킨스 독립성 (이식성):** `project-mini-jenkins`라는 별도 리포지토리에서 `Dockerfile`, `casc.yaml` 등으로 젠킨스 서버 자체를 코드화(Codefied)하여 관리한다. 이는 백업 및 재설정을 매우 용이하게 한다.
  * **실무 환경 모사 (역할 분리):**
      * **빌드 서버 (Jenkins):** 젠킨스 컨테이너가 이 역할을 맡는다.
      * **타겟 서버 (Host):** 젠킨스가 설치된 호스트 머신(`localhost`)이 이 역할을 맡는다.
  * **배포 방식 (SSH):** 빌드 서버는 **DooD 방식을 사용하지 않고**, 오직 **SSH**를 통해서만 타겟 서버에 접속하여 배포 명령(`docker pull`, `docker compose up`, `nginx reload` 등)을 전달한다.

#### 2. 자동화 프로세스

1.  **Trigger:** GitHub `main` 브랜치로 PR이 병합되면 Webhook을 통해 젠킨스가 이를 감지한다.
2.  **Build:** 젠킨스가 `project-mini-frontend`의 `Dockerfile`을 사용해 새 이미지를 클린 빌드한다.
3.  **Push:** 젠킨스가 빌드된 이미지를 \*\*GHCR(GitHub Container Registry)\*\*로 푸시한다.
4.  **Deploy (via SSH):** 젠킨스가 Credential에 등록된 SSH 키를 사용해 타겟 서버(`localhost`)에 접속한다.
5.  **Target Server Actions:** SSH 세션 내에서 다음의 셸 스크립트가 순차적으로 실행된다:
    ```bash
    # (예시) 젠킨스가 SSH를 통해 실행할 명령어들
    docker pull ghcr.io/hansol/project-mini-frontend:build-123
    docker compose up -d --no-deps app-green
    sed -i 's/server app-blue:3000;/server app-green:3000;/' /path/to/nginx.conf
    docker compose exec nginx nginx -s reload
    ```

#### 3. 이미지 및 롤백 전략

  * **이미지 명명:** 젠킨스가 `BUILD_NUMBER` (빌드 번호), `GIT_COMMIT` (커밋 해시) 등 강력한 메타데이터를 이미 관리하므로, 이미지 태그는 `ghcr.io/hansol/repo:${env.BUILD_NUMBER}`처럼 젠킨스의 **빌드 번호**를 사용하는 것이 가장 효율적이다.
  * **롤백 전략:** `docker image`를 이용한 롤백이 아닌, Git에서 `revert` 커밋을 푸시하여 새로운 파이프라인을 트리거하는 **'Roll-Forward'** 방식을 채택한다. 이는 배포의 유일한 진입점을 CI/CD 파이프라인으로 통일시켜 안정성을 높인다.

-----

### 3. 젠킨스 서버 설치 과정

독립된 `project-mini-jenkins` 프로젝트를 통해 젠킨스 서버를 컨테이너로 실행했다.

#### 1. JCasC 템플릿 구성

`project-mini-jenkins` 폴더를 다음과 같이 구성하여 젠킨스 서버 자체를 코드로 관리했다.

  * **`docker-compose.yml` (서비스 정의)**

    ```yaml
    services:
      jenkins:
        build:
          context: jenkins
        container_name: jenkins-server
        ports: ["12345:8080"] # 8080 대신 12345 포트 사용
        volumes:
          - ./jenkins_home:/var/jenkins_home # Bind Mount
        entrypoint: > # casc.yaml을 jenkins_home으로 복사
          bash -c "
            cp /usr/share/jenkins/ref/casc.yaml /var/jenkins_home/casc.yaml &&
            /usr/bin/tini -- /usr/local/bin/jenkins.sh
          "
    volumes:
      jenkins_home: {} # Bind Mount를 사용하기로 했으므로 이 부분은 삭제됨
    ```

    *최종적으로 `volumes: [jenkins_home: {}]`는 삭제하고, `volumes: [./jenkins_home:/var/jenkins_home]`로 수정하여 Bind Mount를 사용하기로 결정했다.*

  * **`jenkins/Dockerfile` (커스텀 이미지)**

    ```dockerfile
    FROM jenkins/jenkins:lts-jdk21
    USER root
    COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
    RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt
    COPY casc.yaml /usr/share/jenkins/ref/casc.yaml
    USER jenkins
    ```

  * **`jenkins/plugins.txt` (플러그인 목록)**

    ```
    configuration-as-code
    git
    workflow-aggregator
    blueocean
    ```

  * **`jenkins/casc.yaml` (젠킨스 설정)**

    ```yaml
    jenkins:
      systemMessage: "Welcome to My Jenkins Server! This instance is managed by Code. 🚀"
      numExecutors: 2
    ```

#### 2. Bind Mount와 UID 1000 권한 분석

`Dockerfile`로 빌드된 젠킨스 컨테이너는 보안을 위해 `root`가 아닌 UID `1000`번(`jenkins` 유저)으로 실행된다. `volumes: [./jenkins_home:/var/jenkins_home]` (Bind Mount) 사용 시, 호스트 폴더의 소유자 UID와 컨테이너 유저의 UID가 다르면 'Permission denied' 오류가 발생한다.

  * **일반적인 해결책:** 호스트에서 `sudo chown -R 1000:1000 jenkins_home` 명령어로 소유권을 강제로 맞춰야 한다.
  * **나의 상황 (오늘의 발견):** 내 호스트 서버(Ubuntu 22.04)의 `hansol` 계정 ID를 확인해보니, 젠킨스 컨테이너와 동일한 `1000`번이었다.
    ```bash
    id hansol
    # uid=1000(hansol) gid=1000(hansol) groups=1000(hansol)...
    ```
  * **결론:** 나의 `hansol` 계정은 우분투 설치 시 생성된 첫 번째 표준 계정 ID(`1000`)를 사용하고 있어, 젠킨스 컨테이너의 UID(`1000`)와 완벽하게 일치한다. 이로 인해 나는 'Permission denied' 문제가 원천적으로 발생하지 않는 이상적인 상태이며, 별도의 `chown` 명령어가 필요 없음을 확인했다.

#### 3. 젠킨스 실행 및 설정 마법사

1.  프로젝트 폴더에 `jenkins_home` 디렉터리를 생성했다. (나의 경우 `chown`은 불필요했다.)
    ```bash
    mkdir jenkins_home
    ```
2.  `docker compose up --build -d` 명령어로 젠킨스 빌드 및 실행.
3.  `docker logs jenkins-server`로 초기 관리자 비밀번호 확인.
4.  `http://paulryu9309.ddns.net:12345` (서버 IP와 변경된 포트)로 접속하여 설정 마법사(플러그인 설치, 관리자 계정 생성)를 완료했다.
5.  젠킨스 대시보드에서 `casc.yaml`에 정의한 "Welcome to My Jenkins Server\!..." 환영 메시지를 확인하며 JCasC 적용을 최종 검증했다.

#### 4. SSH Credential 등록 (핵심 준비)

젠킨스가 타겟 서버(`localhost`)에 접속할 수 있도록 `ssh-keygen`을 통해 젠킨스 전용 키 페어(`jenkins_key`, `jenkins_key.pub`)를 생성했다.

1.  **서버(호스트)에 '자물쇠' 설치:** 생성한 공개키(`jenkins_key.pub`)의 내용을 `cat`을 이용해 `~/.ssh/authorized_keys` 파일에 추가했다.
2.  **젠킨스에 '열쇠' 등록:** 젠킨스 UI의 [Manage Jenkins] \> [Credentials]에서 `Kind`를 `SSH Username with Private Key`로 선택하고, `Username`에 `hansol`, `Private Key`에 개인키(`jenkins_key`)의 내용을 복사하여 글로벌 Credential을 성공적으로 등록했다.

![](/assets/images/posts/2025-10/2025-10-21-051.png)
> WSL 만 아니었으면 무중단까지 간건데... 아쉽다...