---
layout: post 
title: TIL - Jenkins 프로젝트 전체 내용 정리 (3)
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

## Jenkins
### Docker 이미지 빌드 및 관리 (Docker Image Build & Management)

CI/CD 파이프라인에서 애플리케이션을 컨테이너화하는 것은 환경 일관성을 보장하고 배포를 간소화하는 핵심적인 단계다. Jenkins는 Docker CLI와 연동하여 Docker 이미지를 빌드하고, 컨테이너 레지스트리(Registry)에 푸시(push)하며, 배포 서버에서 이미지를 풀(pull)하는 일련의 과정을 자동화한다. 이 섹션에서는 `project-mini-frontend`의 `app/Dockerfile`과 `project-mini-frontend/jenkinsfile`을 기반으로 Docker 이미지 빌드 및 관리의 주요 개념을 정리하였다. 

#### `docker build` 명령어 및 `--build-arg` 활용

`docker build` 명령어는 `Dockerfile`에 정의된 지침에 따라 Docker 이미지를 생성한다. 이 과정에서 `--build-arg` 옵션을 사용하여 빌드 시점에 환경 변수를 주입할 수 있다.

*   **`docker build -t <image_name>:<tag> <path_to_dockerfile_context>`**: 이미지를 빌드하는 기본 명령어.
    *   `-t <image_name>:<tag>`: 빌드된 이미지에 이름과 태그를 부여한다. 태그는 이미지의 버전을 식별하는 데 사용된다.
    *   `<path_to_dockerfile_context>`: `Dockerfile`이 위치한 디렉토리의 경로를 지정합한다. Docker 빌드 컨텍스트(context)가 된다.
*   **`--build-arg <VAR_NAME>=<value>`**: `Dockerfile` 내에서 `ARG` 지시어로 선언된 변수에 값을 전달한다. 이는 빌드 시점에 동적으로 환경을 구성할 때 유용하다.

`project-mini-frontend/jenkinsfile`의 `Build Image` 단계에서는 `docker build` 명령어를 사용하여 Next.js 애플리케이션 이미지를 빌드한다.

```groovy
// project-mini-frontend/jenkinsfile (Build Image stage)
        stage('Build Image') {
            steps {
                echo "2. Build New Docker Image"
                script {
                    def imageTag = "${IMAGE_NAME}:${env.BUILD_NUMBER}" 
                    sh "docker build -t ${imageTag} ./app" 
                }
            }
        }
```

여기서 `sh "docker build -t ${imageTag} ./app"` 명령은 `project-mini-frontend/app` 디렉토리를 빌드 컨텍스트로 사용하여 이미지를 빌드하고, `IMAGE_NAME`과 Jenkins의 `BUILD_NUMBER`를 조합한 태그를 부여한다. 만약 `Dockerfile` 내에서 `ARG`를 통해 `NEXT_PUBLIC_API_URL`과 같은 환경 변수를 받도록 설정되어 있다면, `sh "docker build -t ${imageTag} --build-arg NEXT_PUBLIC_API_URL=${env.API_URL} ./app"`와 같이 `--build-arg`를 추가하여 빌드 시점에 값을 주입해서 다이나믹한 대응이 가능하다.

#### Docker 이미지 태깅 전략 (e.g., `latest`, `BUILD_NUMBER`)

Docker 이미지 태깅은 이미지의 버전을 관리하고 식별하는 데 매우 중요하다. 일관된 태깅 전략은 CI/CD 파이프라인의 안정성과 효율성을 높이기에 구조를 이해할 필요가 있다.

*   **`latest` 태그**: 일반적으로 가장 최신 버전의 안정적인 이미지에 부여된다. 하지만 `latest` 태그는 항상 최신을 의미하므로, 특정 버전을 명확히 식별하기 어렵다는 단점이 있다. 프로덕션 환경에서는 `latest` 태그만 사용하는 것을 지양하고, 특정 버전 태그와 함께 사용하는 것이 권장된다.(아니면 편의성, 이식성을 위해 이미지를 두개로 tag를 나눠, latest 인 경우, 빌드넘버 두가지를 함께 병용하는 것도 괜찮다.)
*   **`BUILD_NUMBER` 태그**: Jenkins의 `BUILD_NUMBER`와 같이 CI/CD 시스템에서 생성되는 고유한 빌드 번호를 태그로 사용하는 것은 매우 효과적인 전략이다. 

`project-mini-frontend/jenkinsfile`에서는 `BUILD_NUMBER`를 활용한 태깅 전략을 사용했다.

```groovy
// project-mini-frontend/jenkinsfile (이미지 태깅 예시)
                    def imageTag = "${IMAGE_NAME}:${env.BUILD_NUMBER}" 
                    sh "docker build -t ${imageTag} ./app" 
                    // ...
                    sh "docker push ${imageTag}"
```

이처럼 `ghcr.io/paul2021-r/project-mini-frontend:123`과 같이 빌드 번호가 포함된 태그를 사용함으로써, 어떤 빌드에서 생성된 이미지인지 명확하게 식별할 수 있다.

#### GitHub Container Registry (GHCR) 사용법

GitHub Container Registry (GHCR)는 GitHub에서 제공하는 Docker 이미지 저장소 서비스다. Docker Hub와 유사하게 Docker 이미지를 저장하고 공유할 수 있으며, GitHub 저장소와 긴밀하게 통합된다.

*   **장점**: GitHub 저장소와 연동되어 접근 제어 및 권한 관리가 용이하며, GitHub Actions와 같은 CI/CD 도구와 함께 사용하기 편리하다.
* **사용 이유**: 다른 서비스들은 무료로 제공해주긴 해도 제한사항이 있고, default 값이 아니라는 점만 제외하면 모든 기능이 동일하다. EKS 와 같은 AWS 의 상용 서비스도 고려는 했지만, 굳이 비용을 들일 필요가 없기 때문에, 가장 널널하게 쓰기좋은 GHCR 을 적용했다.
*   **사용법**: `docker login`, `docker push`, `docker pull` 명령어를 사용하여 GHCR에 이미지를 푸시하고 풀할 수 있다. 인증은 GitHub Personal Access Token(PAT)을 통해 이루어진다. 단, PAT 발급 시 package 에 대한 write 권한을 제공해야 한다.

`project-mini-frontend/jenkinsfile`의 `Push to GHCR` 단계는 GHCR 사용법을 보여준다.

```groovy
// project-mini-frontend/jenkinsfile (Push to GHCR stage)
        stage('Push to GHCR') {
            steps {
                echo "3. Push the Docker Image to GHCR"
                script {
                    def imageTag = "${IMAGE_NAME}:${env.BUILD_NUMBER}"
                    withCredentials([usernamePassword(credentialsId: GHCR_CREDS_ID, usernameVariable: 'USER', passwordVariable: 'TOKEN')]) {
                        sh "echo ${TOKEN} | docker login ghcr.io -u ${USER} --password-stdin"
                        sh "docker push ${imageTag}"
                    }
                }
            }
        }
```

`withCredentials` 블록을 사용하여 Jenkins에 저장된 `GHCR_CREDS_ID` 자격 증명(GitHub 사용자 이름과 PAT)을 `USER`와 `TOKEN` 환경 변수로 주입한다. 이 정보를 사용하여 `docker login ghcr.io` 명령으로 GHCR에 로그인한 후, `docker push ${imageTag}` 명령으로 빌드된 이미지를 GHCR에 푸시한다.

#### `docker login`, `docker push`, `docker pull`, `docker logout` 명령어

*   **`docker login <registry_url>`**: Docker 레지스트리에 로그인한다. 사용자 이름과 비밀번호(또는 PAT)를 입력하며, url을 기준으로 사용하는 서비스 주체 플랫폼을 결정할 수 있다. `project-mini-frontend/jenkinsfile`에서는 `echo ${TOKEN} | docker login ghcr.io -u ${USER} --password-stdin`와 같이 표준 입력을 통해 비밀번호를 전달하여 자동화된 로그인 과정을 구현한다.(보안이 약하다고 하여, 대안이 되는 다른 방법도 있다지만, 아직 구현에 성공하진 못했다.)
*   **`docker push <image_name>:<tag>`**: 로컬에 빌드된 Docker 이미지를 원격 레지스트리에 업로드(푸시)한다.
*   **`docker pull <image_name>:<tag>`**: 원격 레지스트리에서 Docker 이미지를 로컬로 다운로드(풀)한다. `project-mini-frontend/jenkinsfile`의 `Deploy to Server` 단계에서 배포 서버가 GHCR로부터 이미지를 풀하는 데 사용된다.
    ```groovy
    // project-mini-frontend/jenkinsfile (Deploy to Server stage 일부)
                                echo "--- (1/4) Pull the new image : ${imageTag} ---"
                                docker pull ${imageTag}
    ```
*   **`docker logout <registry_url>`**: Docker 레지스트리에서 로그아웃합니다. 보안을 위해 파이프라인의 `post` 블록에서 항상 로그아웃하는 것이 권장되고, 그렇게 적용해두었다. 이로써 빌드 하나의 사이클에서 모든 내용이 종결되고 빌드 프로세스는 격리된다. 
    ```groovy
    // project-mini-frontend/jenkinsfile (post block)
        always {
            echo "Logout from GHCR"
            sh "docker logout ghcr.io"
        }
    ```

### Docker-out-of-Docker (DooD) 패턴 (Docker-out-of-Docker Pattern)

Docker-out-of-Docker (DooD) 패턴은 Docker 컨테이너 내부에서 Docker 명령어를 실행하여 호스트(Host)의 Docker 데몬(Daemon)과 상호작용하는 전략이다. `project-mini-jenkins` 프로젝트는 Jenkins 컨테이너 내부에서 호스트의 Docker 데몬을 제어하기 위해 DooD 패턴을 활용하고 있다.

#### Jenkins 컨테이너에서 호스트 Docker 데몬 제어 원리

일반적으로 Docker 컨테이너는 호스트 시스템과 격리된 환경에서 실행된다. 하지만 DooD 패턴을 사용하면 컨테이너 내부에서 호스트의 Docker 데몬에 접근하여 Docker 명령어를 실행할 수 있다.

1.  **Docker 소켓 마운트**: 호스트의 Docker 데몬은 `/var/run/docker.sock`이라는 유닉스 소켓(Unix socket)을 통해 외부와 통신한다. DooD 패턴은 Jenkins 컨테이너를 실행할 때 이 호스트의 `docker.sock` 파일을 컨테이너 내부로 마운트한다.
    *   **예시**: `project-mini-jenkins/docker-compose.yml`의 `volumes` 설정
    ```yaml
    # project-mini-jenkins/docker-compose.yml (일부)
    services:
      jenkins:
        # ...
        volumes:
          - ./jenkins_home:/var/jenkins_home
          - /var/run/docker.sock:/var/run/docker.sock # 이 부분이 핵심
          - /usr/bin/docker:/usr/bin/docker
          - /usr/bin/docker-compose:/usr/bin/docker-compose
        # ...
    ```
    위 설정은 호스트의 `/var/run/docker.sock`을 Jenkins 컨테이너의 `/var/run/docker.sock` 경로로 마운트한다. 이로써 Jenkins 컨테이너 내부의 Docker CLI는 호스트의 Docker 데몬과 통신할 수 있게 된 것이다.

2.  **Docker CLI 설치**: Jenkins 컨테이너 내부에 Docker CLI가 설치되어 있어야 한다. `project-mini-jenkins/jenkins/Dockerfile`은 `apt-get install -y docker-ce-cli` 명령을 통해 Docker CLI를 설치하여 제어 도구들을 컨테이너 내부에 소지하게 되는 것이다.
    *   **예시**: `project-mini-jenkins/jenkins/Dockerfile`의 Docker CLI 설치 부분
    ```dockerfile
    # project-mini-jenkins/jenkins/Dockerfile (일부)
    # ...
    # 4. 패키지 목록 다시 업데이트 및 Docker CLI 설치 (서버 데몬 제외)
    RUN apt-get update && apt-get install -y docker-ce-cli
    # ...
    ```

3.  **권한 설정**: Jenkins 컨테이너 내부에서 Docker 명령어를 실행하는 사용자(일반적으로 `jenkins` 사용자)가 호스트의 `docker.sock`에 접근할 수 있는 권한을 가져야 한다. 이는 해당 사용자를 `docker` 그룹에 추가함으로써 해결된다. `project-mini-jenkins/jenkins/Dockerfile`은 `usermod -aG docker jenkins` 명령을 통해 이 권한을 부여한다.
    *   **예시**: `project-mini-jenkins/jenkins/Dockerfile`의 권한 설정 부분
    ```dockerfile
    # project-mini-jenkins/jenkins/Dockerfile (일부)
    # ...
    # DooD 구조를 위함. Docker 그룹에 jenkins 유저 추가
    ARG DOCKER_GID=1001
    RUN groupadd -g ${DOCKER_GID} docker
    RUN usermod -aG docker jenkins
    # ...
    ```

#### `jenkins` 사용자를 `docker` 그룹에 추가하는 이유

리눅스(Linux) 시스템에서 `/var/run/docker.sock` 파일은 일반적으로 `root` 사용자 또는 `docker` 그룹에 속한 사용자만 접근할 수 있도록 권한이 설정되어 있ㅊ다. Jenkins 컨테이너 내부에서 `jenkins` 사용자가 Docker 명령어를 실행하려면 이 소켓 파일에 대한 접근 권한이 필요하다.

`project-mini-jenkins/jenkins/Dockerfile`에서 `usermod -aG docker jenkins` 명령을 통해 `jenkins` 사용자를 `docker` 그룹에 추가하는 것은 바로 이 접근 권한을 부여하기 위함이다. `jenkins` 사용자가 `docker` 그룹에 속하게 되면, `/var/run/docker.sock` 파일에 대한 읽기/쓰기 권한을 얻게 되어 호스트의 Docker 데몬과 통신할 수 있게 된다.

### Blue/Green 배포 개념 (Concept of Blue/Green Deployment)

Blue/Green 배포는 무중단 배포(Zero-Downtime Deployment)를 실현하기 위한 효과적인 전략 중 하나다. 이 방식은 프로덕션 환경에 두 개의 동일한 환경을 구축하고, 한 번에 하나의 환경만 활성화하여 사용자 트래픽을 처리한다. 일반적으로 'Blue' 환경과 'Green' 환경으로 명명되며, 한 환경이 현재 운영 중인(Active) 상태일 때 다른 환경은 새로운 버전의 애플리케이션을 배포하고 테스트하는 데 사용된다.

#### 무중단 배포 (Zero-Downtime Deployment)의 중요성

무중단 배포는 서비스 중단 없이 새로운 버전의 애플리케이션을 배포하는 것을 의미한다. 이는 현대 비즈니스 환경에서 다음과 같은 이유로 매우 중요합니다.

*   **사용자 경험 유지**: 서비스 중단은 사용자에게 부정적인 경험을 제공하고, 이는 고객 이탈로 이어질 수 있다. 무중단 배포는 사용자가 서비스 중단을 인지하지 못하도록 하여 긍정적인 사용자 경험을 유지한다.
*   **비즈니스 연속성 보장**: 24시간 365일 운영되어야 하는 서비스의 경우, 배포로 인한 짧은 중단조차도 큰 비즈니스 손실로 이어질 수 있다. 무중단 배포는 이러한 비즈니스 연속성을 보장한다.
*   **경쟁력 확보**: 빠르게 변화하는 시장에서 새로운 기능을 신속하게 배포하고 사용자 피드백을 반영하는 능력은 기업의 경쟁력을 좌우한다. 무중단 배포는 이러한 빠른 릴리스 주기를 가능하게 한다.
*   **안정성 향상**: 배포 과정에서 발생할 수 있는 위험을 최소화하고, 문제가 발생하더라도 신속하게 이전 버전으로 롤백할 수 있는 안전망을 제공하여 서비스의 전반적인 안정성을 향상시킨다.

#### Blue/Green 환경 구성 원리

Blue/Green 배포는 다음과 같은 원리로 구성된다.

1.  **두 개의 동일한 환경**: 'Blue'와 'Green'이라는 두 개의 완전히 동일한 프로덕션 환경을 준비한다. 이 두 환경은 하드웨어, 소프트웨어, 네트워크 구성 등 모든 면에서 동일해야한다. 이번 프로젝트의 경우, 가능한 실무를 모사하고, 목표로하는 AI서비스를 위해 프론트드는 다소 작게 준비하였기에, 한 호스트 서버에 작게 분할하여 집어넣는 것을 모색했다.
2.  **트래픽 라우팅 (Traffic Routing)**: 사용자 트래픽은 로드 밸런서(Load Balancer) 또는 리버스 프록시(Reverse Proxy)를 통해 현재 활성화된 환경으로 라우팅된다. `project-mini-frontend` 프로젝트에서는 Nginx가 이 역할을 수행하게된다.
3.  **새로운 버전 배포**: 현재 비활성화된 환경(예: Green)에 새로운 버전의 애플리케이션을 배포하고, 필요한 테스트를 수행할 수 있게 한다. 단, 지금은 로컬 개발환경이 존재하여, 그러한 접근을 만들진 않았음. 그러나 Ngnix 의 가상 서버 기능을 도입하여, 접근 가능한 도메인 URL 단위로 접근하도록 할 것이다. 
4.  **트래픽 전환**: 새로운 버전의 애플리케이션이 안정적으로 동작하는 것이 확인되면, 로드 밸런서/리버스 프록시의 설정을 변경하여 사용자 트래픽을 Blue 환경에서 Green 환경으로 전환한다. 이 전환은 매우 빠르게 이루어지므로 사용자 입장에서는 서비스 중단을 느끼지 못하며, stateless 서버이므로 트래픽의 전환이 아무 문제가 없다. 
5.  **이전 환경 유지 또는 폐기**: 트래픽 전환 후, 이전 버전이 실행되던 환경(예: Blue)은 잠시 동안 유지하여 문제가 발생할 경우 즉시 롤백할 수 있도록 한다. 안정성이 확인되면 이전 환경은 폐기하거나 다음 배포를 위한 대기 환경으로 재활용될 수 있다. 이 부분에 대해도 현재는 롤백을 위한 백업처럼 되어있고, 테스트를 위해선 수동 최신화가 필요하다. 하만, 향후 서비스의 문제 없을 시 이용 가능한 예비 서버의 업데이트 배포 방식도 작업으로추가할 예정이다. 

### `Jenkinsfile` 내 Blue/Green 로직 분석 (`project-mini-frontend/jenkinsfile` 참고)

`project-mini-frontend/jenkinsfile`은 Blue/Green 배포 전략을 Jenkins 파이프라인 내에서 직접 구현해보았다. 특히 `Deploy to Server` 단계에서 이 로직이 핵심적으로 동작한다.

#### `BUILD_NUMBER`를 이용한 배포 서비스 결정 (`deployService`, `upstreamService`)

```groovy
// project-mini-frontend/jenkinsfile (Deploy to Server stage 일부)
                    // 어떤 컨테이너를 업데이트 및 업스트림 대상을 지정
                    def deployService = (env.BUILD_NUMBER.toInteger() % 2 == 0) ? "app-green" : "app-blue" 
                    def upstreamService = (deployService == "app-green") ? "app-blue" : "app-green"
```

*   `deployService`: 현재 빌드된 새로운 버전의 애플리케이션이 배포될 대상 서비스(컨테이너)의 이름을 결정한다. `BUILD_NUMBER`가 짝수이면 `app-green`, 홀수이면 `app-blue`로 결정된다.
*   `upstreamService`: 현재 사용자 트래픽을 처리하고 있는 이전 버전의 애플리케이션 서비스 이름이다. `deployService`와 반대되는 서비스로 설정된다.

#### `docker compose up -d --no-deps --force-recreate` 명령의 역할

```groovy
// project-mini-frontend/jenkinsfile (Deploy to Server stage 일부)
                                cd ${TARGET_PROJECT_PATH}
                                // ...
                                docker compose --env-file init.env up -d --no-deps --force-recreate ${deployService}
```

*   **`docker compose up -d`**: Docker Compose 파일에 정의된 서비스를 백그라운드(`-d`)에서 실행 및 업데이트 역할
*   **`--env-file init.env`**: `init.env` 파일에 정의된 환경 변수(예: `APP_BLUE_IMAGE`, `APP_GREEN_IMAGE`)를 Docker Compose 명령에 적용한다. 이 변수들은 `docker-compose.yml`에서 이미지 이름을 동적으로 설정하는 데 사용된다.
    ```yaml
    # project-mini-frontend/docker-compose.yml (일부)
    app-blue:
      image: ${APP_BLUE_IMAGE}
      # ...
    app-green:
      image: ${APP_GREEN_IMAGE}
      # ...
    ```
    Jenkins 파이프라인은 `init.env` 파일을 업데이트하여 `APP_BLUE_IMAGE` 또는 `APP_GREEN_IMAGE` 변수가 새로 빌드된 이미지 태그를 가리키도록 할 수 있다. (현재 `Jenkinsfile`에서는 `init.env`를 직접 수정하는 로직은 없지만, 이러한 방식으로 연동될 수 있다.)
*   **`--no-deps`**: 지정된 서비스(`deployService`)만 업데이트하고, 해당 서비스가 의존하는 다른 서비스(예: Nginx)는 다시 시작하지 않도록 하는 설정. 불필요한 서비스 중단을 방지하여 무중단 배포에 기여한다.
*   **`--force-recreate`**: 서비스 컨테이너를 강제로 다시 생성합니다. 이는 새로운 이미지로 컨테이너를 업데이트할 때 필수적이다. 레이어가 중복되는 걸로 인식하여, 실제 변경 사항이 제대로 바뀌지 않는 것을 막기 위함이다.
*   **`${deployService}`**: `app-blue` 또는 `app-green` 중 현재 배포 대상이 되는 서비스 이름이다.

#### `sed` 명령어를 이용한 Nginx 설정 동적 변경 (`nginx/nginx.conf` 업데이트)

새로운 버전의 애플리케이션이 성공적으로 배포되면, Nginx 리버스 프록시의 설정을 변경하여 사용자 트래픽을 새로운 환경으로 전환해야 하고 `Jenkinsfile`에서는 `sed` 명령어를 사용하여 `nginx/nginx.conf` 파일을 동적으로 수정하고 있다.

```groovy
// project-mini-frontend/jenkinsfile (Deploy to Server stage 일부)
                                echo "--- (3/4) Switch Nginx Configuration to change traffic ---"
                                sed -i "s|server ${upstreamService}:3000;|server ${deployService}:3000;|" ${TARGET_PROJECT_PATH}/nginx/nginx.conf
```

*   **`sed -i`**: `sed` 명령어는 텍스트 스트림 편집기(Stream Editor)로, 파일의 내용을 변경하는 데 사용된다. `-i` 옵션은 변경 사항을 원본 파일에 직접 적용(in-place)하도록 하는 옵션이다.
*   **`"s|server ${upstreamService}:3000;|server ${deployService}:3000;|"`**: `s`는 'substitute'를 의미하며, 특정 패턴을 찾아 다른 문자열로 대체한다. 여기서는 `server ${upstreamService}:3000;` 패턴을 찾아 `server ${deployService}:3000;`으로 변경한다. 즉, Nginx가 현재 트래픽을 보내고 있는 이전 서비스(`upstreamService`)를 새로운 서비스(`deployService`)로 변경하도록 설정 파일의 해당 URL 구문만 수정하는 역할을 한다.
*   **`${TARGET_PROJECT_PATH}/nginx/nginx.conf`**: 수정할 Nginx 설정 파일의 경로

**`nginx/nginx.conf` 예시**: 

```nginx
# project-mini-frontend/nginx/nginx.conf (일부)
upstream nextjs_app {
    server app-blue:3000; # 이 부분이 동적으로 변경됩니다.
}

server {
    # ...
    location / {
        proxy_pass http://nextjs_app;
        # ...
    }
}
```

#### `docker compose exec nginx nginx -s reload`를 통한 Nginx 재로드

`nginx.conf` 파일이 수정된 후, Nginx가 변경된 설정을 적용하도록 재로드해야 한다. 이때 Nginx 서비스를 중단하지 않고 설정을 재로드하는 것이 무중단 배포의 핵심이 된다.

```groovy
// project-mini-frontend/jenkinsfile (Deploy to Server stage 일부)
                                echo "--- (4/4) Reload Nginx Configuration ---"
                                docker compose --env-file init.env -f docker-compose.yml exec -T nginx nginx -s reload
```

*   **`docker compose exec nginx`**: `nginx` 서비스 컨테이너 내부에서 명령어를 실행한다.
*   **`nginx -s reload`**: Nginx에게 현재 실행 중인 서비스를 중단하지 않고 설정 파일을 다시 읽어들이도록 지시한다. 이는 새로운 연결은 변경된 설정으로 처리하고, 기존 연결은 현재 설정으로 계속 처리하도록 하여 서비스 중단 없이 설정을 적용할 수 있게 만든다.

이 과정을 통해 사용자 트래픽은 새로운 버전의 애플리케이션이 실행되는 환경으로 즉시 전환되며, 이전 버전의 애플리케이션은 여전히 실행 중인 상태로 유지된다. 이는 문제가 발생할 경우 빠른 롤백을 가능하게 하는 안전망 역할을 한다.

### 롤백 전략 (Rollback Strategy)

Blue/Green 배포는 롤백이 매우 용이하다는 강력한 장점을 가지기에 무중단 배포의 여러 전략 중 이번 프로젝트의 CICD 의 핵심이라고 할 수 있다. 새로운 버전 배포 후 심각한 문제가 발견될 경우, 즉시 이전 버전으로 트래픽을 되돌릴 수 있다.

#### Blue/Green 배포에서의 롤백 용이성

*   **즉각적인 전환**: 새로운 환경(Green)으로 트래픽을 전환한 후 문제가 발생하면, Nginx 설정을 다시 변경하여 이전 환경(Blue)으로 트래픽을 즉시 되돌릴 수 있다. 이 과정은 `sed` 명령어를 반대로 실행하거나, conf 를 직접 수정 후 Nginx를 재로드하는 것만으로 가능해진다.
*   **이전 환경 유지**: 이전 버전의 애플리케이션이 실행되던 환경은 트래픽 전환 후에도 현재는 유지되도록 해두었다. 이는 롤백 시 별도의 배포 과정 없이 즉시 서비스를 복구할 수 있도록 한다.

#### 명시적인 롤백 단계 또는 스크립트의 필요성

`project-mini-frontend/jenkinsfile`은, 현재는 명시적인 롤백 단계를 포함하고 있지 않다. 프로젝트의 진행, 기존 Jenkins 의 작업을 그대로 활용해서 만들면 되기 때문이다. 향후에 적용이 될 예정이다.

*   **자동 롤백**: `post { failure { ... } }` 블록 내에서 배포 실패 시 자동으로 Nginx 설정을 이전 상태로 되돌리고 Nginx를 재로드하는 스크립트를 추가할 수 있다.
*   **수동 롤백 스크립트**: Jenkins Job으로 별도의 롤백 스크립트를 생성하여, 특정 빌드 번호로 Nginx 트래픽을 전환할 수 있도록 할 수 있다. 이는 긴급 상황 발생 시 운영자가 빠르게 대응할 수 있도록 한다.

### Discord 알림 (Discord Notification)

CI/CD 파이프라인에서 빌드 및 배포 과정의 성공 또는 실패 여부를 실시간으로 파악하는 것은 매우 중요하기에 현재는 아주 기본적인 로깅 체계를 구축했다. Jenkins는 다양한 알림 채널을 지원하지만, 현재 개발 중에 가장 많이 사용하는 Discord 를 활용한 실시간 알림 체계를 구축했고, `project-mini-frontend/jenkinsfile`은 빌드 결과에 따라 Discord 채널에 알림을 보내는 기능이 동작한다.

#### `curl -X POST -H 'Content-Type: application/json' --data '${message}' ${DISCORD_URL}` 명령어 분석

`Jenkinsfile`의 `post` 블록 내에서 `curl` 명령어를 사용하여 Discord 웹훅(Webhook)으로 알림 메시지를 전송한다. 이 명령어는 HTTP POST 요청을 통해 JSON 형식의 데이터를 Discord 웹훅 URL로 보낸다.

```groovy
// project-mini-frontend/jenkinsfile (post success 블록 일부)
        success {
            echo "Deployment succeeded. Now send a discord notification."
            script {
                withCredentials([string(credentialsId: DISCORD_CREDS_ID, variable: 'DISCORD_URL')]) {
                    def message = "{\"content\": \"🚀 Build Process is successfully finished : **[${env.JOB_NAME}]** - **#${env.BUILD_NUMBER}**\"}"

                    sh "curl -X POST -H 'Content-Type: application/json' --data '${message}' ${DISCORD_URL}"
                }

            }

        }
```

*   **`curl -X POST`**: HTTP POST 메서드를 사용하여 요청을 보낸다.
*   **`-H 'Content-Type: application/json'`**: 요청 헤더(Header)에 `Content-Type`을 `application/json`으로 지정하여, 보내는 데이터가 JSON 형식임을 명시.
*   **`--data '${message}'`**: 요청 본문(Body)에 전송할 데이터를 지정한다. 여기서는 `message` 변수에 저장된 JSON 문자열을 보낸다.
*   **`${DISCORD_URL}`**: Discord 웹훅 URL입니다. 이 URL은 Jenkins Credentials에 `Secret text` 타입으로 저장된 `DISCORD_CREDS_ID` 자격 증명을 `withCredentials` 블록을 통해 `DISCORD_URL` 환경 변수로 주입받아 사용한다. 이는 웹훅 URL과 같은 민감한 정보가 `Jenkinsfile`에 직접 노출되는 것을 방지하여 보안을 강화하는 역할이다.

#### 향후 목표

Jenkins 의 빌드 과정에 대한 report 를 포함, 빌드 과정에서 문제가 발생하지 않고, 하더라도 빠른 대응이 되기 위해 메시지를 단순히 discord로 보내는 것만으로는 한계가 있다. 이에 전문적인 로깅 툴을 연결, 그 툴에 메시지를 보내는 기능을 단계별로 넣어서, 수행하는 작업이나, 향후 들어갈 테스트 등의 항목의 결과들을 공유하도록 수정해볼 생각이다.

