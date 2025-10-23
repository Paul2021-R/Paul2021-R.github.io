---
layout: post 
title: TIL - NextJS 무중단 배포 적용
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

## 25-10-23 Jenkins 무중단 배포 적용

### 1. 오늘의 목표

기존에 수동으로 배포되던 Next.js 애플리케이션(`project-mini-frontend`)을 위해, 독립적으로 운영되는 Jenkins 서버를 활용하여 GitHub `main` 브랜치 변경 시 자동으로 빌드, GHCR 푸시, 타겟 서버 SSH 접속 및 Blue/Green 무중단 배포를 수행하는 CI/CD 파이프라인을 완성하는 것이 목표였다.

---
### Jenkins 무중단 배포 파이프라인 구축 절차
**1단계: 젠킨스 환경 최종 준비 (도구 챙기기)**
- **목표:** 젠킨스 컨테이너가 배포에 필요한 '도구'(`ssh`, `git`, `docker`)를 모두 갖추고, '비밀번호'(`Credentials`)를 발급받도록 합니다.
- **주요 작업:**
    1. `jenkins/Dockerfile`에 `openssh-client` 설치 코드 추가 및 젠킨스 재시작
	    - 설치: `RUN apt-get update && apt-get install -y openssh-client`
	    - 빌드 및 실행(터미널에서) : `docker exec jenkins-server ssh` > 입력 시 ssh 정상 설치 되면 매뉴얼이 뜸
    2. 젠킨스 Credential 등록 (GitHub PAT, GHCR PAT)
		- **1. GitHub 리포지토리 접근용 (Git Checkout)**
		    - **Kind:** `Username with password`
		    - **Username:** (본인의 GitHub ID)
		    - **Password:** (GitHub PAT - `repo` 스코프 권한 필요)
		    - **ID:** `github-creds` (또는 식별 가능한 이름)
		- **2. GHCR 이미지 푸시용 (Docker Push)**
		    - **Kind:** `Username with password`
		    - **Username:** (본인의 GitHub ID)
		    - **Password:** (GitHub PAT - `write:packages` 스코프 권한 필요)
		    - **ID:** `ghcr-creds` (또는 식별 가능한 이름)
    3. 호스트 서버 `sshd` 서비스 실행 상태 최종 확인

**2단계: `project-mini-frontend` 리포지토리 설정 (명령서 작성)**
- **목표:** Next.js 리포지토리에 젠킨스가 수행할 모든 작업을 정의한 '명령서'(`Jenkinsfile`)를 추가하고, GitHub가 젠킨스를 호출할 '연락망'(Webhook)을 설정합니다.
- **주요 작업:**
    1. `Jenkinsfile` (파이프라인 스크립트) 신규 작성
    2. GitHub 리포지토리 Webhook 설정 (젠킨스 URL 연동)
- **작업하면서 궁금했던 사항 정리**
	- env 변수에 쓸수  있는 유용한 내장 환경 변수들
		- `env.BUILD_NUMBER`: 현재 빌드의 순차 번호 (예: "57")
		- `env.JOB_NAME`: 현재 실행 중인 젠킨스 잡(Job)의 이름
		- `env.BUILD_URL`: 현재 빌드 로그를 볼 수 있는 젠킨스의 URL (실패 알림에 필수)
		- `env.BRANCH_NAME`: 빌드를 트리거한 브랜치 이름 (예: "main")
		- `env.GIT_COMMIT`: 빌드에 사용된 Git 커밋 해시(ID)
		- `env.WORKSPACE`: 젠킨스 에이전트가 코드를 Checkout 받은 경로
	- `ssh -o StrictHostKeyChecking=no` 란? 
		- SSH 접속시 일반적으로 설정하는 것 질문 절차가 있는데, 젠킨스는 여기서 yes 라고 입력 안됨. 파이프라인 멈춤게 됨. 이에 그 질문을 강제로 무시하고, 무조건 신뢰하여 자동화 시키는 역할을 함. 

**3단계: 젠킨스 파이프라인(Job) 생성 (프로젝트 연결)**
- **목표:** 젠킨스 UI에서 "이 GitHub 리포지토리의 `Jenkinsfile`을 읽어서 실행해"라고 설정하는 새 작업을 만듭니다.
- **주요 작업:**
    1. 젠킨스 대시보드에서 "New Item" > "Pipeline" 생성
    2. "Pipeline script from SCM" 옵션으로 GitHub 리포지토리 및 `Jenkinsfile` 경로 연결
- Jenkins Credential 등록 (GitHub PAT `github-creds`, GHCR PAT `ghcr-creds`, SSH Private Key `a5-localhost-jenkins`).
- **Blue/Green 전환 로직 (`Deploy to Server` SSH 스크립트):**
	1. `set -ex`: 명령어 추적 및 오류 시 즉시 종료 설정.
	2. `docker login ghcr.io ...`: 타겟 서버에서 GHCR 로그인.
	3. `docker pull [imageTag]`: 새 이미지 다운로드.
	4. `cd [TARGET_PROJECT_PATH]`: 프로젝트 폴더 이동.
	5. `docker compose --env-file .env.[deployService] up -d --no-deps --force-recreate [deployService]`: 임시 `.env` 파일을 사용하여 대기조 컨테이너 강제 재생성.
	6. `sed -i "s|...|..." [nginx.conf 경로]`: Nginx 설정 파일의 `upstream` 변경.
	7. `docker compose --env-file init.env exec -T nginx nginx -s reload`: Nginx 리로드 (기본 `init.env` 참조).
	8. `docker logout ghcr.io`: 타겟 서버 로그아웃.

**4단계: 최초 빌드 실행 및 트러블슈팅**
- **목표:** `main` 브랜치에 코드를 푸시(Push)하여 1~3단계의 모든 설정이 올바르게 작동하는지 확인하고, 첫 배포를 성공시킵니다.
- **주요 작업:**
    1. `Jenkinsfile`을 `main` 브랜치에 푸시하여 Webhook 트리거 실행 (또는 "Build Now" 수동 클릭)
    2. 젠킨스 "Blue Ocean" UI에서 빌드 과정 실시간 모니터링
    3. 오류 발생 시(예: 권한 문제, 경로 오류) 로그 확인 및 수정


---

### 진행 시 메모 

#### Jenkins 서버 쪽 작업
- jenkins 서버 내에서가 아닌 host 서버에서 build 해야 함 
	- Jenkins 의 Dockerfile에 이를 위한 패키지를 추가했다.
	- 컨트롤을 할 클라이언트, Docker 를 호스트에서 수행하도록 만들어야 했다. : DooD 가 필요했고, 이를 위한 내용을 Jenkins 의 Dockerfile 에 기록했다. 
	```yaml
	services:
	  jenkins:
	    build:
	      context: jenkins
	    container_name: jenkins-server
	    ports:
	      - "12345:8080"
	    volumes:
	      - ./jenkins_home:/var/jenkins_home
	      # Docker CLI 사용을 위해 호스트로 마운트
	      - /var/run/docker.sock:/var/run/docker.sock
	      - /usr/bin/docker:/usr/bin/docker
	      - /usr/bin/docker-compose:/usr/bin/docker-compose
	    # user: root
	    environment:
	      - CASC_JENKINS_CONFIG=/var/jenkins_home/casc.yaml
	    entrypoint: >
	      bash -c "
	        cp /usr/share/jenkins/ref/casc.yaml /var/jenkins_home/casc.yaml &&
	        /usr/bin/tini -- /usr/local/bin/jenkins.sh
	      "
	```
- 이때 가장 편한 방법은 `DooD` 시 Jenkins 컨테이너 내부 User를 `Root` 로 설정해야 바로 젠킨스 서버 컨테이너가, Host 서버의 Docker 를 수정할 수 있음 
	- 이는 보안의 위협이 됨. 이에 UID 와 GID 를 수정해줌으로써 권한 문제 없이 호스트를 제어 하도록 만들어 주었다.
	```Dockerfile
		# 전략
		# DooD 구조를 위함. Docker 그룹에 jenkins 유저 추가
		ARG DOCKER_GID=1001
		RUN groupadd -g ${DOCKER_GID} docker
		RUN usermod -aG docker jenkins
		# 후략
	```

#### NextJS 서버
- NextJS 이미지를 app-blue, app-green 으로 스위칭 되며 동작하게 만드는게 핵심이었고, docker-compose.yml 이를 위한 변수를 읽기 위해 `init.env` 파일을 설정하였다.
- Jenkinsfile 의 경우 `environment`, `stages`, `post` 로 간단한 구조다. 이때 핵심은 환경은 변수와 전역으로 필요한 것들만 지정해주었다. 
	- stages 에는 각 스테이지들이 설정되고 스테이지들에서 유의사항은 다음과 같다. 
		- Jenkins 는 workspace 라는 공간에서 설정에 따라 github을 설정하면 자동으로 바라보는 브랜치의 최신 상태를 다운로드 받는다. 
		- 그리고 그 상단을 기준으로 하면, 이미 파일은 올라가있기 때문에 `Build Image` 스테이지에서는 빌드를 빠르게 가능하다. 
		- Stages는 아래와 같은 단계를 소유한다
			- Checkout
			- Build Image
			- Push to GHCR
			- Deploy to GHCR
	- post 는 사후 단계로 향후에는 여러 로깅이나, 이런 것들이 가능하나, 현재는 웹 훅을 통한 알림을 추가했다. 
	  ![](/assets/images/posts/2025-10/2025-10-23-052.png)
    > 알림은 아주 잘 온다. 향후엔 디테일하게 붙이는 방법이나, 모듈화를 고민해보자..
	- 참고로 logging은 깔끔하게 보기 위하여 `블루오션` 플러그인을 활용했다
	  ![](/assets/images/posts/2025-10/2025-10-23-053.png)
    > 처음엔 어떻게 쓰는지 몰라서 한참 기본 로그만 봤다...

### 주요 트러블슈팅 및 해결 과정 (파이프라인 실행 중)

1. **Jenkinsfile 문법 오류 (`MultipleCompilationErrorsException`):**
    - **원인:** `stages` 블록 누락, `post` 블록 내 `script` 누락.
    - **해결:** 파이프라인 구조 수정.
        
2. **`sshagent` DSL 찾기 실패 (`NoSuchMethodError`):**
    - **원인:** "SSH Agent" 플러그인 미설치.
    - **해결:** 젠킨스 플러그인 관리자에서 설치.
        
3. **GHCR 푸시 실패 (`denied`, `insufficient_scope`):**
    - **원인:** 젠킨스 Credential의 PAT 정보 오류 또는 스코프 부족(`repo` 누락), `docker build` 시 이미지 태그 주소 누락 등 복합적 요인.
    - **해결:** Credential 재확인 했으나 문제 없었음. 핵심은 보안에 취약하다며 AI 가 추천한 방식으로 수정했을 때 문제 발생. `Jenkinsfile`의 `docker login` 방식 수정 (`echo | docker login --password-stdin`) 원래 형태로 수정하여 파이프를 통해 credential 전달로 해결 완료. 
    
4. **타겟 서버 `docker pull` 실패 (`unauthorized`):**
    - **원인:** SSH로 접속한 타겟 서버(`hansol` 유저)가 GHCR에 로그인되어 있지 않음.
    - **해결:** `Deploy to Server` 스테이지 SSH 스크립트 내부에 `docker login ghcr.io ...` 명령어 추가. 너무 기본적인 거였는데... 호스트에선 보안, 그리고 클리어한 상태 유지를 위해 로직 내부에 login / logout 을 넣어줬어야 했다. 
        
5. **Blue/Green 컨테이너 미교체 (`up-to-date`):**
    - **원인:** `docker compose up` 실행 시 `--env-file`로 전달된 새 이미지 태그를 인식하지 못하는 건지, 아니면 레이어가 바뀌지 않는 건지 동작하지 않았다. 
    - **해결:** `docker compose up` 명령어에 `--force-recreate` 플래그 추가하여 무조건 교체가 되도록 하였음. 그리고 정확한 타게팅을 위해, 환경 변수가 필요했고 이에 `docker compose exec` 명령어에 `--env-file init.env` 옵션 추가로 환경변수를 명시해줌으로써 완전히 해결되었다. 
        

---

### 배운 점 (Key Learnings)

- 젠킨스 파이프라인 문법 및 구조 (`stages`, `environment`, `Credentials`, `post`)를 제대로 공부했다. 아직 외운게 아니고 AI 를 통해 맡겨서 하면서, 뭔지 파악한 거라 향후엔 제대로 문서를 보든 해야 할 것 같다.
- SSH 기반 원격 서버 자동화 시 `sshagent`와 `StrictHostKeyChecking=no` 옵션, 명령어 실패 처리(`set -ex`)의 중요성.. 이라고 하지만 실상 필요한거면 당연히 안 들어있다고 생각했어야 한다. 🤣
- `docker compose` 명령어 실행 시 환경 변수 처리 방식 (`--env-file`, 기본 `.env`) 및 `--force-recreate` 플래그의 유용성.. 이라고 AI 가 정리해줬지만, 실질 이제는 --force-recreate 가 필요 없을지도..?
- Blue/Green 배포 시 `sed`를 이용한 Nginx `upstream` 동적 변경 및 `nginx -s reload`를 통한 무중단 트래픽 전환 방법은 되고 나니 너무 훌륭하고 짜릿하다...😍
- GHCR 인증 및 이미지 태그 지정 방식의 정확성 필요.
- CI/CD 파이프라인 구축 시 단계별 로그 확인(`docker logs`, `ssh -v`, Jenkins Console Output)을 통한 체계적인 트러블슈팅 방법. 아직 완벽하지도 않고, 보니 단계별로 명확한 로그가 남지 않는 다는 건 아쉽다. SSH 기반과 로그를 더 많이 기록하게 하는 방법이나 블루오션 플러그인 활용법 정리가 필요해 보인다. 
- GitHub Webhook 연동을 위해서는 Jenkins 서버의 HTTPS 노출이 필요하며, 이는 **향후 과제**로 남겨두었다. 우선 프론트엔드 작업들 하면서 감 익히고 난 후엔 수행해볼 예정

![](/assets/images/posts/2025-10/2025-10-23-054.png)
> 캬 ... 먼저 배포부터 만들어버렸다... AI 덕이긴 한데 많이 늘었구나 나도... 