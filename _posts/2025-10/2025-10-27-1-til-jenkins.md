---
layout: post 
title: TIL - Jenkins 프로젝트 전체 내용 정리 (1)
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

## 25-10-24 ~ 25-10-27

- 본 내용은 프로젝트에 적용한 CICD 배포 과정에서 있었던 내용 중 개념적으로 추가가 필요한 내용들을 정리한 글이다.
- 사실 KTX 를 탔는데 할 일이 없다... 공부나 하자라는 감성을 했던 내용을 복습한다.

## 01 Jenkins

### 개념
- Jenkins는 소프트웨어 개발에서 지속적인 통합(Continuous Integration, CI)과 지속적인 배포(Continuous Deployment, CD)를 자동화하는 데 사용되는 오픈 소스 자동화 서버다. 
- 개발자가 코드를 변경하고 저장소에 커밋(commit)하면, Jenkins는 자동으로 코드를 빌드(build)하고, 테스트(test)하며, 배포하는 일련의 과정을 수행한다.
- 개발 프로세스의 효율성을 높이고, 오류를 조기에 발견하며, 궁극적으로 안정적인 소프트웨어 릴리스(release)를 가능하게 하는 도구이다. 
### 왜  Jenkins 와 같은 전문 툴이 필요한가? : 지속적인 통합(Continuous Integrateion, CI)
- **오류 조기 발견**: 코드가 자주 통합되고 테스트되므로, 통합 과정에서 발생하는 오류나 버그를 개발 초기에 발견하고 수정할 수 있다. 이는 문제 해결 비용을 크게 절감한다.
- **코드 품질 향상**: 자동화된 테스트를 통해 코드의 일관성과 안정성을 유지하며, 개발자들은 더 높은 품질의 코드를 작성하는 데 집중할 수 있게 만든다.
- **개발 생산성 증대**: 수동으로 빌드하고 테스트하는 시간을 줄여 개발자들이 새로운 기능 개발에 더 많은 시간을 할애할 수 있도록 한다.
- **팀 협업 강화**: 개발자들이 서로의 코드 변경 사항을 빠르게 공유하고 통합함으로써 팀 전체의 협업 효율성을 높인다.

### 왜 Jenkins 와 같은 전문 툴이 필요한가? : 지속적인 배포(Continuous Deployment, CD)
- **빠른 릴리스 주기**: 새로운 기능이나 버그 수정 사항을 신속하게 사용자에게 제공하여 시장 변화에 빠르게 대응할 수 있다.
- **배포 프로세스 자동화**: 수동 배포 과정에서 발생할 수 있는 인적 오류를 제거하고, 배포의 일관성과 신뢰성을 확보한다.
- **위험 감소**: 작고 빈번한 배포를 통해 한 번의 배포로 인한 위험 부담을 줄이고, 문제가 발생하더라도 빠르게 롤백(rollback)하거나 수정할 수 있다.
- **피드백 루프 단축**: 사용자 피드백을 빠르게 수집하고 다음 개발 주기에 반영함으로써 제품 개선 속도를 높인다.

### Jenkins 의 역할은 
- **코드 변경 감지**: Git, SVN 등 다양한 버전 관리 시스템(VCS)과 연동하여 코드 저장소의 변경 사항을 지속적으로 감지한다.
- **자동 빌드**: 변경된 코드를 자동으로 가져와 컴파일(compile)하고, 필요한 의존성(dependency)을 설치하며, 실행 가능한 아티팩트(artifact)를 생성한다.
- **자동 테스트**: 단위 테스트(unit test), 통합 테스트(integration test), 성능 테스트(performance test) 등 다양한 유형의 테스트를 자동으로 실행하여 코드의 품질과 안정성을 검증한다.
- **자동 배포**: 테스트를 통과한 아티팩트를 개발, 스테이징(staging), 프로덕션 환경 등 지정된 서버에 자동으로 배포한다.
- **파이프라인 오케스트레이션(Orchestration)**: 빌드, 테스트, 배포 등 CI/CD의 모든 단계를 하나의 파이프라인으로 정의하고, 각 단계의 실행 순서와 조건을 관리한다.
- **알림 및 보고**: 빌드 및 배포 결과에 대한 성공/실패 알림을 이메일, Slack, Discord 등 다양한 채널로 전송하고, 상세한 보고서를 제공한다.

### Jenkins 의 장점
*   **오픈 소스 및 확장성**: 무료로 사용할 수 있는 오픈 소스이며, 수많은 플러그인을 통해 거의 모든 종류의 빌드, 테스트, 배포 도구와 연동하여 기능을 확장할 수 있다.
*   **다양한 환경 지원**: Java, Python, Node.js, .NET 등 다양한 프로그래밍 언어와 프레임워크(framework)를 지원하며, Docker, Kubernetes와 같은 컨테이너(container) 기술과도 쉽게 통합된다. 
*   **강력한 파이프라인 기능**: `Jenkinsfile`을 통해 CI/CD 파이프라인을 코드로 정의하고 버전 관리할 수 있어, 파이프라인의 재현성(reproducibility)과 유지보수성(maintainability)을 높다. (예시: `project-mini-frontend/jenkinsfile`)
```Groovy
pipeline {
    agent any
    
    environment {
        GHCR_CREDS_ID = 'ghcr-creds'
        GITHUB_CREDS_ID = 'github-creds'
        TARGET_SSH_CREDS_ID = 'a5-localhost-jenkins'

        TARGET_DEPLOY_SERVER = 'GEEKOM-A5-Server'

        DISCORD_CREDS_ID = 'discord-webhook-url'

// ... 중략

    stages {
    // code pull
        stage('Checkout') {
            steps {
                echo "1. Get the latest code from GitHub"
                git credentialsId: GITHUB_CREDS_ID, url: 'https://github.com/paul2021-r/project-mini-frontend.git', branch: 'main'
            }
        }

// ... 중략

    post {
        success {
            echo "Deployment succeeded. Now send a discord notification."
            script {
                withCredentials([string(credentialsId: DISCORD_CREDS_ID, variable: 'DISCORD_URL')]) {
                    def message = "{\"content\": \"🚀 Build Process is successfully finished : **[${env.JOB_NAME}]** - **#${env.BUILD_NUMBER}**\"}"
                    
// ... 후략

}
```

*   **활발한 커뮤니티 지원**: 전 세계적으로 많은 사용자와 개발자들이 활발하게 활동하며, 다양한 문제 해결과 기능 개선에 기여하고 있다. 이는 풍부한 자료와 지원을 받을 수 있다는 장점으로 이어진다.
*   **시각화 및 모니터링**: Blue Ocean과 같은 플러그인을 통해 파이프라인의 실행 과정을 시각적으로 확인하고, 빌드 상태를 실시간으로 모니터링할 수 있다.

### Jenkins 의 아키텍쳐 
- 단일 빌드도 가능하나, 여러 프로젝트를 동시에 처리하는 경우 분산 빌드(Distrivuted Builds) 아키텍처를 활용한다. 이러한 아키텍쳐는 컨트롤러와 노드로 구분되며 각기 역할을 분담하면 Jenkins 의 확장성, 효율성에 도움이 된다. 단, 어디까지나 시스템과 리소스의 상황에 따라 최적화 시키는것이 중요하다. 
#### Jenkins Master(컨트롤러)
   - **작업 스케줄링 및 관리**: 빌드 작업을 언제, 어떤 Agent에서 실행할지 결정하고, 전체 파이프라인의 흐름을 관리한다. 
*   **Agent 연결 관리**: 등록된 Agent들과의 연결을 유지하고, Agent의 상태를 모니터링한다.
*   **설정 및 플러그인 관리**: Jenkins의 전반적인 설정, 사용자 관리, 보안 설정, 그리고 설치된 플러그인들을 관리합니다. `project-mini-jenkins` 프로젝트의 `jenkins/casc.yaml` 파일은 Master의 설정을 코드로 관리하는 예시입니다.
*   **빌드 결과 저장**: 빌드 로그, 테스트 결과, 아티팩트 등 빌드 관련 데이터를 저장하고 관리한다.
*   **UI 제공**: 웹 인터페이스를 통해 사용자에게 Jenkins의 모든 기능과 빌드 현황을 제공합한다.

#### Jenkins Agent(노드/ 실행기)
*   **작업 실행**: Master로부터 전달받은 빌드 스크립트(예: `Jenkinsfile`에 정의된 `sh` 명령어)를 실행하여 코드 빌드, 테스트, 배포 등의 작업을 수행한다. 
*   **다양한 환경 지원**: Agent는 물리 서버, 가상 머신(VM), Docker 컨테이너 등 다양한 형태로 구성될 수 있다. 각 Agent는 특정 운영체제, 소프트웨어 버전, 라이브러리 등 특정 빌드 환경을 제공 일정하게 제공할 수 있다.
*   **확장성**: 필요한 경우 Agent를 추가하여 Jenkins 시스템의 처리 용량을 쉽게 확장할 수 있다. 이는 동시에 더 많은 빌드 작업을 처리하거나, 특정 환경이 필요한 작업을 분리하여 실행하는 데 유용하다.
*   **격리된 환경**: 각 Agent는 독립적인 환경에서 작업을 수행하므로, 한 Agent에서 실행되는 작업이 다른 Agent의 작업에 영향을 미치지 않는다. 이는 빌드 환경의 일관성과 안정성을 보장해줘, 서로의 충돌이나 호스트 OS에 영향을 주지 않을 수 있다.

#### 분산 빌드(Distributed Builds, Master-Slave)
- Jenkins 마스터와 하나 이상의 Agent를 준비하고, 빌드를 하여 여러 머신에 분산하여 처리하는 방법을 의미한다. 이 방식의 이점은 아래와 같다. 

*   **부하 분산 (Load Balancing)**: Master의 부하를 줄이고, 빌드 작업을 여러 Agent에 분산하여 동시에 더 많은 작업을 처리할 수 있다. 이는 빌드 큐(queue)를 줄이고 전체 CI/CD 파이프라인의 처리량을 증가시킨다.
*   **환경 격리 (Environment Isolation)**: 각 Agent가 독립적인 빌드 환경을 제공하므로, 서로 다른 프로젝트나 다른 버전의 소프트웨어가 필요한 빌드 작업을 충돌 없이 실행할 수 있다. 예를 들어, 한 Agent는 Java 8 환경에서 빌드하고, 다른 Agent는 Node.js 18 환경에서 빌드할 수 있다.
*   **확장성 (Scalability)**: 빌드 요구사항이 증가함에 따라 Agent를 쉽게 추가하거나 제거할 수 있어, Jenkins 시스템의 확장성을 유연하게 관리할 수 있다.
*   **안정성 (Reliability)**: 특정 Agent에 문제가 발생하더라도 다른 Agent에서 작업을 계속 수행할 수 있으므로, 전체 CI/CD 시스템의 안정성이 향상된다.

- `project-mini-frontend` 프로젝트는 jenkins 시스템을 활용하고, `Jenkinsfile`을 이용하여 Host 서버에서 Docker 컨테이너로 구성되어 있다. 또한 Jenkins 컨테이너는 DooD(Docker-out-of-Docker) 패턴을 통해 Jenkins Master 컨테이너 자체가 Agent 역할을 겸한다. 
- 그러나 여기에 다른 서버를 추가한다면, Master 와 Agent 를 분리할 수 있고, 특히 용도와 리소스에 맞게 분리한다면 서버의 역할에 따라 빌드하는 노드를 별도로 가져갈 수도 있고, 안정성을  더 강화할 수도 있다.

### Docker 를 이용한 Jenkins 설치 
- Jenkins를 Docker 컨테이너로 설치하는 것은 환경 설정의 일관성을 보장하고, 배포 및 관리를 용이하게 하는 현대적인 방법이다.
- 또한 컨테이너화 함을 통해, Jenkins 환경을 모듈화시킬 수 있어 다양한 리소스에 이식할 수 있고, 또 동일한 CICD 환경 구축을 가능케한다.
- 다양한 패턴이 있겠지만, 많지 않은 리소스 상황, 그리고 Host 의 자원을 완전하게 이용하기 위하여 Jenkins Master 컨테이너가 안에서 Host 의 도커를 조작할 수 있도록 하는 DooD 패턴을 이번 프로젝트에 활용했다. 이를 통해 환경 구축과 내용의 격리는 컨테이너 내에 이루었지만, 실제 빌드는 Host 에서 구성되는 형태를 취한다.

#### DooD 를 위한 docker-compose.yml

```yaml
# project-mini-jenkins/docker-compose.yml
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
    environment:
      - CASC_JENKINS_CONFIG=/var/jenkins_home/casc.yaml
    entrypoint: >
      bash -c "
        cp /usr/share/jenkins/ref/casc.yaml /var/jenkins_home/casc.yaml &&
        /usr/bin/tini -- /usr/local/bin/jenkins.sh
      "
```

주요 내용은 다음과 같다. 

 **`build`**: `context: jenkins`는 `jenkins` 디렉토리 내의 `Dockerfile`을 사용하여 이미지를 빌드하도록 지시한다.
*   **`container_name`**: 컨테이너 이름을 `jenkins-server`로 지정하여 쉽게 식별할 수 있도록 했다.
*   **`ports`**: 호스트의 `12345` 포트를 컨테이너의 `8080` 포트(Jenkins 기본 포트)에 매핑하여 외부에서 Jenkins에 접근할 수 있도록 하고, 자주 사용되는 포트 점유를 피한다.
*   **`volumes`**: 
    *   `./jenkins_home:/var/jenkins_home`: Jenkins의 데이터(설정, 빌드 기록, 플러그인 등)를 호스트의 `jenkins_home` 디렉토리에 영구적으로 저장하도록 마운트한다. 이는 컨테이너가 삭제되더라도 데이터가 보존되도록 하며, 명시적으로 해당 폴더에 남기에, 해당 데이터를 이동하면 다른 서버로 이식이 용이하다.
    *   `/var/run/docker.sock:/var/run/docker.sock`: 호스트의 Docker 소켓을 컨테이너 내부에 마운트한다. 이 설정은 Jenkins 컨테이너가 호스트의 Docker 데몬과 통신하여 Docker 명령어를 실행할 수 있도록 하는 DooD 패턴의 핵심으로, 공유되지 않으면 내부에서 외부로의 조종이 불가능하다.
    *   `/usr/bin/docker:/usr/bin/docker`, `/usr/bin/docker-compose:/usr/bin/docker-compose`: 호스트의 Docker 및 Docker Compose 바이너리를 컨테이너 내부에 마운트하여 Jenkins가 이들을 직접 사용할 수 있도록 했다.
*   **`environment`**: `CASC_JENKINS_CONFIG` 환경 변수를 설정하여 JCasC 설정 파일의 경로를 지정한다.
*   **`entrypoint`**: Jenkins 컨테이너가 시작될 때 `casc.yaml` 파일을 `jenkins_home`으로 복사하고 Jenkins를 실행하는 스크립트를 정의하였다. 해당 entrypoint 설정은 Dockerfile의 기본 설정이 있더라도, 이를 무시하고 덮어씌워진다.

### Jenkins 초기 설정 

#### 초기 관리자 비밀번호 확인

1.  **Jenkins 컨테이너 실행**: `docker-compose up -d` 명령으로 Jenkins 컨테이너를 실행한다.
2.  **로그 확인**: 다음 명령어를 사용하여 Jenkins 컨테이너의 로그를 확인한다.
    ```bash
    docker logs jenkins-server
    ```
    로그 출력에서 `Please use the following password to proceed to installation:` 또는 유사한 메시지 뒤에 나오는 긴 문자열이 초기 관리자 비밀번호다.

    ```
    *************************************************************
    *************************************************************
    *************************************************************

    Jenkins initial setup is required. An admin user has been created and a password generated.
    Please use the following password to proceed to installation:

    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

    This may also be found at: /var/jenkins_home/secrets/initialAdminPassword

    *************************************************************
    *************************************************************
    *************************************************************
    ```
    (여기서 `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` 부분이 실제 비밀번호다.)

#### 초기 설정 진행 절차 

1.  **Jenkins 웹 인터페이스 접속**: 웹 브라우저를 열고 `http://localhost:12345` (또는 `docker-compose.yml`에 설정된 포트)로 접속.
2.  **관리자 비밀번호 입력**: 위에서 확인한 초기 관리자 비밀번호를 입력하고 `Continue`를 클릭
3.  **플러그인 설치**: `Install suggested plugins`를 선택하여 권장 플러그인을 설치하거나, `Select plugins to install`을 선택하여 필요한 플러그인만 설치할 수 있다. `project-mini-jenkins` 프로젝트의 `jenkins/plugins.txt`와 `jenkins/casc.yaml`을 사용한다면, 플러그인과 기본 설정은 자동으로 적용된다.
4.  **관리자 계정 생성**: 초기 관리자 비밀번호를 사용한 후, 새로운 관리자 계정(사용자 이름, 비밀번호, 이름, 이메일)을 생성한다. 이 계정은 이후 Jenkins에 로그인할 때 사용된다.
5.  **Jenkins URL 설정**: Jenkins 인스턴스의 URL을 설정합니다. 기본값으로 두거나 필요에 따라 변경할 수 있다.

이 과정을 통해 Jenkins 서버의 초기 설정이 완료되며, CI/CD 파이프라인을 구축하고 관리할 준비가 된다. 단 여기서 중요한 지점으로, 

1) 실제 프로젝트를 위한 플러그인을 설치할 것이 무엇이 있는지 판단 및 밑설치를 미리 해둬야 예상외의 발생 에러를 잡을 수 있다. 최초 설치시 아주 기본적인 내용만 있고, 빌드 자체를 위한 도구 정도만 설치됨. 이에 dockerfile 을 통해 컨테이너 내부에서 조작할 도구들과, jenkins 자체를 위한 플러그인(예, ssh agent)등을 정확하게 보고 미리 설치해놓아야 한다. 
2) 외부에서 신호를 수신하여 동작하는 등의 것이 있을 경우, HTTPS 를 통한 외부 접속 통로를 확보해둔 설계가 필요할 수 있다. GitHub 의 웹훅이나, 다양한 도구들의 연결 시 HTTPS 가 필수인 경우가 많다. 이를 고려하지 않은 설계가 되면 완전 자동화를 만들기 어려울 수 있다. (수동 호출 및 빌드는 HTTP 환경으로도 충분)

### Jenkins Plugin

#### 역할 
*   **기능 확장**: Jenkins 코어(core)에 없는 새로운 기능을 추가한다. 예를 들어, 특정 버전 관리 시스템(Git, SVN), 빌드 도구(Maven, Gradle), 클라우드 플랫폼(AWS, Azure), 알림 서비스(Slack, Discord) 등과의 연동 기능을 제공한다.
*   **통합 용이성**: 다양한 개발 및 운영 도구와의 통합을 간소화하여, 복잡한 CI/CD 파이프라인을 쉽게 구축할 수 있도록 돕는다.
*   **사용자 정의**: 특정 프로젝트나 조직의 요구사항에 맞춰 Jenkins 환경을 사용자 정의할 수 있는 유연성을 제공한다.
*   **생산성 향상**: 반복적이고 수동적인 작업을 자동화하고, 개발 프로세스의 병목 현상을 제거하여 개발 생산성을 향상시킨다. 

#### 핵심 플러그인 정리 

*   **`configuration-as-code` (Jenkins Configuration as Code Plugin)**:
    *   **기능**: Jenkins의 시스템 설정, 플러그인 설정, 보안 설정 등을 YAML 파일(`casc.yaml`)로 정의하고 관리할 수 있도록 한다. 이를 통해 Jenkins 환경을 코드로서 버전 관리하고, 여러 Jenkins 인스턴스 간에 일관된 설정을 적용할 수 있다.
    *   **중요성**: Jenkins 환경의 재현성(reproducibility)과 유지보수성(maintainability)을 크게 향상시켜 DevOps 원칙을 실현하는 데 필수.

*   **`git` (Git Plugin)**:
    *   **기능**: Git 저장소와 Jenkins를 연동하여 소스 코드를 가져오고, Git 관련 작업을 수행할 수 있도록 한다. `Jenkinsfile`에서 `git credentialsId: GITHUB_CREDS_ID, url: '...', branch: 'main'`와 같은 명령을 사용할 수 있게 한다.
    *   **중요성**: 대부분의 현대 소프트웨어 개발에서 Git이 버전 관리 시스템으로 사용되므로, CI/CD 파이프라인의 시작점인 소스 코드 가져오기 기능을 제공하는 핵심 플러그인.

*   **`workflow-aggregator` (Pipeline: Aggregator Plugin)**:
    *   **기능**: Jenkins Pipeline 기능을 제공하는 여러 플러그인들의 집합체다. `Jenkinsfile`을 사용하여 파이프라인을 정의하고 실행할 수 있도록 하는 기반을 마련한다.
    *   **중요성**: `Jenkinsfile` 기반의 CI/CD 파이프라인을 구축하는 데 필수적인 플러그인으로, 복잡한 빌드, 테스트, 배포 워크플로우를 코드로 정의할 수 있게 한다.

*   **`blueocean` (Blue Ocean Plugin)**:
    *   **기능**: Jenkins 파이프라인의 실행 과정을 시각적으로 보여주는 현대적이고 사용자 친화적인 UI 플러그인. 파이프라인의 각 단계와 상태를 한눈에 파악하고, 문제 발생 시 디버깅(debugging)을 용이하게 한다.
    *   **중요성**: 파이프라인의 가시성을 높여 개발자와 운영자가 CI/CD 프로세스를 더 쉽게 이해하고 관리할 수 있도록 돕는다.

### JCasC
#### 개념
Jenkins Configuration as Code (JCasC)는 Jenkins의 설정을 YAML 파일과 같은 코드로 정의하고 관리하는 방법론이다. 전통적으로 Jenkins 설정은 웹 UI를 통해 수동으로 이루어졌으며, 이는 설정의 일관성을 유지하기 어렵고, 변경 이력을 추적하기 힘들며, 새로운 Jenkins 인스턴스를 구축할 때마다 동일한 작업을 반복해야 하는 비효율성을 초래했다. JCasC는 이러한 문제점을 해결하고, Jenkins 설정을 소프트웨어 개발의 다른 부분과 마찬가지로 코드로서 관리할 수 있도록 했다.

#### JCasC의 이유와 장점 
*   **재현성 (Reproducibility)**: 모든 Jenkins 설정이 코드 파일에 명시되어 있으므로, 언제든지 동일한 Jenkins 환경을 정확하게 재구축할 수 있다. 이는 개발, 테스트, 프로덕션 환경 간의 일관성을 보장한다.
*   **버전 관리 (Version Control)**: 설정 파일이 Git과 같은 버전 관리 시스템에 저장되므로, 설정 변경 이력을 추적하고, 필요한 경우 이전 버전으로 쉽게 롤백할 수 있다. 이는 설정 변경으로 인한 문제를 해결하는 데 큰 도움이된다.
*   **자동화 (Automation)**: Jenkins 인스턴스를 프로비저닝(provisioning)하고 설정하는 과정을 자동화할 수 있다. 이는 특히 클라우드 환경에서 Jenkins를 동적으로 생성하고 관리할 때 매우 유용하다.
*   **협업 강화 (Enhanced Collaboration)**: 여러 개발자나 DevOps 엔지니어가 Jenkins 설정을 함께 검토하고 수정할 수 있으며, 코드 리뷰(code review)를 통해 설정 변경의 투명성과 품질을 높일 수 있다.
*   **오류 감소 (Reduced Errors)**: 수동 설정 과정에서 발생할 수 있는 인적 오류를 줄이고, 일관된 방식으로 설정을 적용할 수 있다.
*   **문서화 (Documentation)**: 설정 파일 자체가 Jenkins 환경에 대한 명확하고 최신 상태의 문서 역할을 한다.

#### JCasC 로 설정할 수 있는 주요 기능 

JCasC를 사용하면 Jenkins의 거의 모든 설정을 YAML 파일로 정의하고 적용할 수 있다. 

*   **전역 설정 (Global Settings)**:
    *   시스템 메시지 (System Message)
    *   보안 설정 (Security Realm, Authorization Strategy)
    *   플러그인 관리 (Plugin Manager)
    *   UI 설정 (Theme, Appearance)
*   **도구 설정 (Tool Configurations)**:
    *   JDK, Maven, Git 등 빌드에 필요한 도구들의 설치 경로 및 설정
*   **노드 설정 (Node Configurations)**:
    *   Jenkins 에이전트 (Agent) 노드 추가, 레이블(Label) 설정, 연결 방식 등
*   **작업(Job) 관련 설정**:
    *   기본 작업 템플릿, 스케줄링 관련 설정 등 (개별 Job 설정은 주로 Jenkinsfile로 관리)
*   **연동 서비스 설정**:
    *   SCM (Source Code Management) 연동 설정
    *   알림 서비스 (Discord, Slack 등) 연동 설정

**JCasC 설정 예시 (YAML)**

아래는 JCasC를 사용하여 몇 가지 일반적인 설정을 구성하는 예시다. 실제 설정은 Jenkins 버전 및 설치된 플러그인에 따라 달라질 수 있다.

**예시 1: 시스템 메시지 및 기본 Executor 설정**

이 예시는 Jenkins의 시스템 메시지를 설정하고, 기본 빌드 실행기(Executor)의 수를 지정합니다. 이는 이전 분석 보고서에서 언급된 내용과 관련이 있습니다.

```yaml
jenkins:
  systemMessage: |
    Welcome to Jenkins! This instance is configured via Jenkins Configuration as Code.
    For any issues, please contact the DevOps team.
  numExecutors: 5 # 기본 Executor 수를 5개로 설정
```

**예시 2: Git 도구 설정**

Jenkins에서 사용할 Git 실행 파일의 경로를 지정하는 예시입니다.

```yaml
tool:
  git:
    installations:
      - name: "Default Git"
        home: "/usr/bin/git" # 시스템에 설치된 Git 경로
```

**예시 3: Jenkins 에이전트 노드 설정**

새로운 빌드 에이전트 노드를 추가하고 레이블을 지정하는 예시입니다.

```yaml
jenkins:
  slaves:
    - name: "my-agent-node"
      remoteFS: "/home/jenkins/agent"
      labels: "docker linux"
      mode: "NORMAL"
      type: "hudson.slaves.DumbSlave"
      launcher:
        ssh:
          host: "your-agent-host.example.com"
          username: "jenkins"
          privateKey:
            credentialsId: "jenkins-ssh-key" # Jenkins Credentials에 등록된 SSH 키 ID
```

**예시 4: 보안 설정 (익명 접근 비활성화)**

익명 사용자의 Jenkins 접근을 비활성화하는 설정입니다.

```yaml
jenkins:
  securityRealm:
    # Active Directory, LDAP 등 다른 보안 설정을 사용할 수도 있습니다.
    # 여기서는 Jenkins 자체 사용자 관리 (Jenkins's own user database)를 가정합니다.
    jenkinsUsers: [] # 사용자 DB를 사용하되, 초기에는 비어있음
  authorizationStrategy:
    globalMatrix:
      # 모든 권한을 가진 Admin 사용자에게만 접근 허용
      permissions:
        - "Overall/Administer:anonymous" # 익명 사용자에게 관리자 권한 부여 방지
        - "Overall/Administer:authenticated" # 인증된 사용자에게 관리자 권한 부여 방지 (필요에 따라 조정)
```

이러한 YAML 설정 파일들을 `jenkins/casc.yaml`과 같은 경로에 저장하고 Jenkins에 적용하면, 해당 설정들이 자동으로 반영된다.

#### JCasC 문법 및 구조

JCasC 설정 파일은 Jenkins의 내부 객체 모델을 YAML 형식으로 매핑한다. 기본적인 YAML 문법 규칙은 다음과 같다.

*   **키-값 쌍 (Key-Value Pairs)**: `키: 값` 형태로 데이터를 표현한다. 콜론(`:`) 뒤에는 공백이 하나 이상 있어야 한다.
    ```yaml
    key: value
    ```
*   **들여쓰기 (Indentation)**: 들여쓰기를 사용하여 계층 구조를 나타낸다. 공백만 사용하며, 탭(tab)은 사용할 수 없다. 동일한 레벨의 항목은 동일한 들여쓰기를 가져야 한다.
    ```yaml
    parent:
      child_key: child_value
    ```
*   **목록 (Lists)**: 하이픈(`-`)으로 시작하는 항목들을 사용하여 목록을 표현합니다.
    ```yaml
    fruits:
      - Apple
      - Banana
      - Orange
    ```
*   **주석 (Comments)**: `#`으로 시작하는 줄은 주석으로 처리됩니다.

JCasC 설정 파일의 복잡성은 Jenkins 환경 복잡성에 비례해서 증대되고, 그만큼 다 이해하고 작업하는 것은 난이도가 수직 상승하게 된다. 그러나 기본적인 문법과 설정 항목들이 어떻게 매핑되는지를 이해하면 효율적인 관리가 가능하다.
