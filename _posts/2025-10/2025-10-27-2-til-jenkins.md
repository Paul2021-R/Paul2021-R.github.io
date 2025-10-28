---
layout: post 
title: TIL - Jenkins 프로젝트 전체 내용 정리 (2)
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

### Jenkins 파이프라인
#### 개념 
- 파이프라인은 소프트웨어의 빌드, 테스트, 배포 과정을 자동화하는 일련의 단계를 코드로 정의한 것이다. 
- Jenkins Pipeline은 `Jenkinsfile`이라는 텍스트 파일에 정의되며, 이 파일은 프로젝트의 소스 코드 저장소에 함께 저장된다. 이를 통해 파이프라인 자체도 코드로서 관리(Pipeline as Code)되어, 소프트웨어 개발의 다른 부분과 마찬가지로 버전 관리, 코드 리뷰, 변경 이력 추적 등의 이점을 얻을 수 있다.

#### Declarative Pipeline vs Scripted Pipeline
*   **Declarative Pipeline (선언형 파이프라인)**:
    *   **특징**: 구조화된 블록(`pipeline`, `agent`, `stages`, `stage`, `steps` 등)을 사용하여 파이프라인을 정의한다. 미리 정의된 구조와 키워드를 사용하여 파이프라인의 흐름을 명확하고 간결하게 선언하는 방식이다. Groovy 스크립팅에 대한 깊은 지식 없이도 쉽게 작성하고 이해할 수 있는 편이다.
    *   **장점**: 가독성이 높고, 배우기 쉬우며, Jenkins UI에서 시각적으로 파이프라인을 쉽게 이해할 수 있다. 복잡한 로직보다는 표준화된 CI/CD 흐름에 적합하다.
    *   **예시**: `project-mini-frontend/jenkinsfile`은 Declarative Pipeline의 대표적인 예시다.

    ```groovy
    // project-mini-frontend/jenkinsfile (Declarative Pipeline 예시)
    pipeline {
        agent any // 에이전트를 지정
        environment { /* ... */ } // 전역 환경을 설정 역할을 한다
        stages { // 각 단계를 지정한다
            stage('Checkout') { /* ... */ } // checkout
            stage('Build Image') { /* ... */ } // 이미지 빌드
            // ...
        }
        post { /* ... */ } // 모든 절차가 종료 후 작업
    }
    ```

*   **Scripted Pipeline (스크립트형 파이프라인)**:
    *   **특징**: Groovy 스크립트 언어를 사용하여 파이프라인의 모든 로직을 직접 작성한다. `node` 블록 내에서 자유로운 Groovy 문법과 Jenkins DSL(Domain Specific Language)을 활용하여 복잡하고 동적인 파이프라인을 구현할 수 있다.
    *   **장점**: 매우 유연하고 강력하며, 복잡한 조건부 로직, 루프, 예외 처리 등 고급 프로그래밍 기능을 활용할 수 있다. 특정 요구사항에 맞춰 파이프라인을 세밀하게 제어해야 할 때 유용하다.(실질 빌드 작업을 프로그래밍 하듯이 다 만드는 구조니깐)
    *   **단점**: Groovy 언어에 대한 이해가 필요하며, 가독성이 Declarative Pipeline보다 낮을 수 있다.

현대 Jenkins Pipeline 개발에서는 Declarative Pipeline이 더 권장한다. 대부분의 CI/CD 요구사항을 충족하며, 유지보수가 용이하고 팀원 간의 협업에 더 적합하기 때문이다. Scripted Pipeline은 Declarative Pipeline으로 구현하기 어려운 특정 고급 시나리오에서 보조적으로 사용될 수 있다. (빌드 절차 과정에서 유동성이 필요한 작업이 포함된다면 특히나 스크립트형으로 작성이 실질 더 편할 수 있으니까)

#### Jenkinsfile 의 역할과 중요성 

`Jenkinsfile`은 Jenkins Pipeline의 핵심이며, CI/CD 파이프라인의 모든 단계를 코드로 정의한 파일이다. 이 파일은 프로젝트의 소스 코드 저장소의 루트 디렉토리(또는 지정된 경로)에 위치하며, Jenkins는 이 파일을 읽고 파이프라인을 실행한다.

`Jenkinsfile`의 역할과 중요성은 다음과 같다.

*   **Pipeline as Code (코드형 파이프라인)**: 파이프라인 정의가 코드화되어 Git과 같은 버전 관리 시스템에 저장하는게 낫다. 이는 파이프라인의 변경 이력을 추적하고, 코드 리뷰를 통해 품질을 관리하며, 필요한 경우 이전 버전으로 롤백할 수 있도록 한다.
*   **재현 가능한 CI/CD 환경**: `Jenkinsfile` 하나만 있으면 어떤 Jenkins 인스턴스에서도 동일한 CI/CD 파이프라인을 구축하고 실행할 수 있다. 이는 환경 간의 일관성을 보장하고, 새로운 프로젝트 온보딩(onboarding)을 간소화한다.
*   **개발자와 운영자의 협업**: 개발자는 코드와 함께 `Jenkinsfile`을 관리하며, 운영자는 이 파일을 통해 배포 프로세스를 이해하고 개선할 수 있다. 이는 개발(Dev)과 운영(Ops) 간의 경계를 허물고 협업을 강화한다.
*   **유연성과 확장성**: `Jenkinsfile`은 Groovy 언어의 강력한 기능을 활용하여 복잡한 로직과 다양한 도구 통합을 지원한다. 이를 통해 프로젝트의 특정 요구사항에 맞춰 파이프라인을 유연하게 확장하고 커스터마이징(customizing)할 수 있다.

`project-mini-frontend/jenkinsfile`은 실제 프로젝트에서 코드 체크아웃, Docker 이미지 빌드, GHCR(GitHub Container Registry) 푸시, 그리고 Blue/Green 배포 전략을 포함한 서버 배포 단계를 명확하게 정의하고 있고, 이를 통해 수동 빌드와 배포의 과정을 읽고 모사한다.

```groovy
// project-mini-frontend/jenkinsfile (일부 발췌)
pipeline {
    agent any
    
    environment { /* ... */ }

    stages {
        stage('Checkout') { /* ... */ }
        stage('Build Image') { /* ... */ }
        stage('Push to GHCR') { /* ... */ }
        stage('Deploy to Server') { /* ... */ }
    }
   
    post { /* ... */ }
}
```

이처럼 `Jenkinsfile`은 CI/CD 파이프라인의 '설계도'이자 '실행 스크립트'로서, 현대 소프트웨어 개발에서 자동화된 배포 프로세스를 구축하는 데 필수적인 역할을 수행한다.

### Pipeline 문법 및 구조 간단 정리

Jenkins Declarative Pipeline은 구조화된 블록과 지시어(Directive)를 사용하여 CI/CD 파이프라인을 정의한다. `project-mini-frontend/jenkinsfile`을 예시로 각 주요 블록과 지시어의 역할에 대해 설명한다.

#### `pipeline` 블록

`pipeline` 블록은 Declarative Pipeline의 최상위 요소이며, 모든 파이프라인 정의를 감싸는 컨테이너다. 이 블록 내부에 `agent`, `stages`, `post` 등 파이프라인의 모든 구성 요소가 포함된다.

*   **역할**: 파이프라인의 시작과 끝을 정의하며, 전체 파이프라인의 구조를 명시한다.
*   **예시**: `project-mini-frontend/jenkinsfile`의 시작 부분은 `pipeline { ... }`으로 구성된다.

```groovy
// project-mini-frontend/jenkinsfile
pipeline { // 문서 시작을 알리는 부분
    agent any
    
    environment { /* ... */ }

    stages { /* ... */ }
   
    post { /* ... */ }
}
```

#### `agent` 지시어 (Directive)

`agent` 지시어는 파이프라인 또는 특정 `stage`가 실행될 Jenkins Agent(노드)를 지정한다. 이는 빌드 작업을 수행할 환경을 정의하는 데 사용된다.

*   **역할**: 파이프라인의 각 단계가 실행될 물리적 또는 가상 환경을 선언한다.
*   **유형**: 
    *   `any`: 사용 가능한 모든 Agent에서 파이프라인을 실행한다.
    *   `none`: 파이프라인 레벨에서는 Agent를 지정하지 않고, 각 `stage`에서 개별적으로 `agent`를 지정한다.
    *   `label 'your-label'`: 특정 라벨이 지정된 Agent에서 실행 (예: `agent { label 'docker-node-with-host-docker' }`)
    *   `docker { image '...' }`: Docker 이미지를 사용하여 임시 컨테이너에서 `stage`를 실행
*   **예시**: `project-mini-frontend/jenkinsfile`에서는 `agent any`를 사용하여 파이프라인의 모든 단계가 사용 가능한 Agent에서 실행되도록 했다

```groovy
// project-mini-frontend/jenkinsfile (agent 지시어 예시)
pipeline {
    agent any // 파이프라인의 모든 단계가 사용 가능한 Agent에서 실행됩니다.
    // ...
}
```

#### `environment` 블록 (환경 변수 관리)

`environment` 블록은 파이프라인 전체 또는 특정 `stage`에서 사용할 환경 변수를 정의한다. 이는 빌드 스크립트 내에서 재사용 가능한 값이나 민감한 정보를 안전하게 관리하는 데 유용한 역할을 한다.

*   **역할**: 파이프라인 실행 중에 접근할 수 있는 환경 변수를 선언
*   **예시**: `project-mini-frontend/jenkinsfile`에서는 GHCR 자격 증명 ID, GitHub 자격 증명 ID, SSH 자격 증명 ID, 배포 서버 정보, Discord 웹훅 URL, 이미지 이름, SSH 호스트 및 포트, 프로젝트 경로 등 다양한 환경 변수를 정의

```groovy
// project-mini-frontend/jenkinsfile (environment 블록 예시)
pipeline {
    agent any
    
    environment {
        GHCR_CREDS_ID = 'ghcr-creds'
        GITHUB_CREDS_ID = 'github-creds'
        TARGET_SSH_CREDS_ID = 'a5-localhost-jenkins'

        TARGET_DEPLOY_SERVER = 'GEEKOM-A5-Server'

        DISCORD_CREDS_ID = 'discord-webhook-url'

        IMAGE_NAME = 'ghcr.io/paul2021-r/project-mini-frontend'

        TARGET_HOST = credentials('ssh-host-creds') // Jenkins Credentials에서 가져옴 => 보안을 위함
        TARGET_PORT = credentials('ssh-port-creds') // Jenkins Credentials에서 가져옴
        TARGET_PROJECT_PATH = '/home/hansol/workspace/project-mini-frontend'
    }
    // ...
}
```

여기서 `credentials()` 함수는 Jenkins Credentials 플러그인을 통해 Jenkins에 저장된 자격 증명(예: 비밀번호, SSH 키)을 안전하게 가져와 환경 변수로 사용할 수 있도록 한다. 이렇게 한 이유는 스크립트로 노출 되어도 문제가 없는 영역과, 그렇지 않은 영역을 구분하기 위함이다.

#### `stages` 및 `stage` 블록 (파이프라인 단계 정의)

`stages` 블록은 파이프라인의 모든 `stage` 블록을 포함하는 컨테이너다. 각 `stage` 블록은 파이프라인의 논리적인 단계를 정의하며, 일반적으로 빌드, 테스트, 배포와 같은 주요 작업을 나타내고 또한 격리한다. 

*   **역할**: 파이프라인의 전체 흐름을 구성하는 개별적인 작업 단위를 정의
*   **예시**: `project-mini-frontend/jenkinsfile`은 `Checkout`, `Build Image`, `Push to GHCR`, `Deploy to Server`와 같은 여러 `stage`를 정의하여 CI/CD 파이프라인의 각 단계를 명확히 구분

```groovy
// project-mini-frontend/jenkinsfile (stages 및 stage 블록 예시)
pipeline {
    // ...
    stages {
    // code pull
        stage('Checkout') {
            steps {
                echo "1. Get the latest code from GitHub"
                git credentialsId: GITHUB_CREDS_ID, url: 'https://github.com/paul2021-r/project-mini-frontend.git', branch: 'main'
            }
        }

        // build image
        stage('Build Image') { /* ... */ }

        // push image
        stage('Push to GHCR') { /* ... */ }

        // deploy to server
        stage('Deploy to Server') { /* ... */ }
    }
    // ...
}
```

#### `steps` 블록 (단계별 실행 명령어)

각 `stage` 블록 내에는 `steps` 블록이 포함되며, 이 블록은 해당 `stage`에서 실제로 실행될 하나 이상의 명령어를 정의한다. `steps` 블록 내에서는 쉘(shell) 명령어(`sh`), Groovy 스크립트(`script { ... }`), Jenkins 플러그인이 제공하는 DSL(Domain Specific Language) 등을 사용할 수 있다.

*   **역할**: `stage` 내에서 수행될 구체적인 작업들을 순차적으로 실행한다.
*   **예시**: `Checkout` 단계에서는 `echo` 명령어로 메시지를 출력하고, `git` 명령어로 소스 코드를 가져온다.

```groovy
// project-mini-frontend/jenkinsfile (steps 블록 예시)
        stage('Checkout') {
            steps {
                echo "1. Get the latest code from GitHub"
                git credentialsId: GITHUB_CREDS_ID, url: 'https://github.com/paul2021-r/project-mini-frontend.git', branch: 'main'
            }
        }
```

#### `post` 블록 (빌드 후 처리)

`post` 블록은 파이프라인 실행이 완료된 후(성공, 실패, 항상 등 조건에 따라) 특정 작업을 수행하도록 정의한다. 주로 알림 전송, 리소스 정리, 로그아웃 등의 후처리 작업에 사용된다.

*   **역할**: 파이프라인의 최종 상태에 따라 실행될 작업을 정의
*   **조건**: `always`, `success`, `failure`, `unstable`, `changed` 등 다양한 조건에 따라 `post` 액션을 실행할 수 있다.
*   **예시**: `project-mini-frontend/jenkinsfile`에서는 빌드 성공 시와 실패 시 Discord 알림을 보내고, 항상 GHCR에서 로그아웃하도록 `post` 블록을 사용.

```groovy
// project-mini-frontend/jenkinsfile (post 블록 예시)
    post {
        success {
            echo "Deployment succeeded. Now send a discord notification."
            script { /* ... Discord 성공 알림 ... */ }
        }
        failure {
            echo "Deployment failed! Now send a discord notification."
            script { /* ... Discord 실패 알림 ... */ }
        }
        always {
            echo "Logout from GHCR"
            sh "docker logout ghcr.io"
        }
    }
}
```

### Groovy 언어의 기본 문법 (Basic Groovy Syntax)

Jenkins Pipeline은 Groovy 언어를 기반으로 한다. Groovy는 Java 플랫폼에서 실행되는 동적 언어로, Java와 유사한 문법을 가지면서도 스크립팅에 더 적합한 유연성을 제공한다. 이전에 정리를 한 적이 있으나, 까먹은 관계로(...) 무식하게 복습한 번 하고 간다. Jenkins Pipeline에서 Groovy의 기본 문법을 이해하는 것은 파이프라인을 효과적으로 작성하고 디버깅하는 데 필수적인 역할을 수행한다. 

#### 변수 선언 및 사용 (Variable Declaration & Usage)

Groovy에서 변수는 `def` 키워드를 사용하여 선언할 수 있으며, 타입을 명시하지 않아도 됩니다. 변수는 문자열, 숫자, 리스트, 맵 등 다양한 데이터 타입을 저장할 수 있습니다.

*   **`def` 키워드**: 변수를 선언할 때 사용합니다. 타입을 명시하지 않으면 Groovy가 자동으로 타입을 추론합니다.
    ```groovy
    def myString = "Hello, Jenkins!"
    def myNumber = 123
    def myList = ["apple", "banana"]
    ```
*   **타입 명시**: 필요에 따라 타입을 명시할 수도 있습니다.
    ```groovy
    String anotherString = "Hello, Groovy!"
    int anotherNumber = 456
    ```
*   **변수 사용**: 선언된 변수는 스크립트 내에서 직접 참조하여 사용할 수 있습니다.
    ```groovy
    echo "${myString} The number is ${myNumber}"
    ```

`project-mini-frontend/jenkinsfile`에서는 `environment` 블록 내에서 환경 변수를 정의하거나, `script` 블록 내에서 `def` 키워드를 사용하여 로컬 변수를 선언하고 활용하는 것을 볼 수 있다. 당연히 스크립트 작성 시 전역용과, 지역용에 맞춰서 스코프가 있는 만큼 그에 맞춰 동작하도록 만드는게 중요. 

```groovy
// project-mini-frontend/jenkinsfile (변수 선언 및 사용 예시)
pipeline {
    // ...
    environment {
        IMAGE_NAME = 'ghcr.io/paul2021-r/project-mini-frontend' // 환경 변수
    }
    stages {
        stage('Build Image') {
            steps {
                script {
                    def imageTag = "${IMAGE_NAME}:${env.BUILD_NUMBER}" // def를 사용한 로컬 변수 선언
                    sh "docker build -t ${imageTag} ./app"
                }
            }
        }
        // ...
    }
    // ...
}
```

#### 조건문 (Conditional Statements)

Groovy는 `if`, `else if`, `else`와 같은 표준 조건문을 지원한다.

*   **`if-else` 구조**: 조건이 참(true)일 때 특정 코드 블록을 실행하고, 거짓(false)일 때 다른 코드 블록을 실행.
    ```groovy
    def status = "success"
    if (status == "success") {
        echo "Operation succeeded."
    } else {
        echo "Operation failed."
    }
    ```
*   **삼항 연산자**: 간단한 조건에 따라 값을 할당할 때 유용
    ```groovy
    def result = (score >= 60) ? "Pass" : "Fail"
    echo "Result: ${result}"
    ```

`project-mini-frontend/jenkinsfile`에서는 `BUILD_NUMBER`의 홀짝 여부를 판단하여 배포할 서비스를 결정하는 데 조건문을 활용한다.

```groovy
// project-mini-frontend/jenkinsfile (조건문 예시)
stage('Deploy to Server') {
    steps {
        script {
            // 어떤 컨테이너를 업데이트 및 업스트림 대상을 지정
            def deployService = (env.BUILD_NUMBER.toInteger() % 2 == 0) ? "app-green" : "app-blue" 
            def upstreamService = (deployService == "app-green") ? "app-blue" : "app-green"
            // ...
        }
    }
}
```

여기서 `env.BUILD_NUMBER.toInteger() % 2 == 0`은 현재 빌드 번호가 짝수인지 홀수인지 확인하는 조건이다. 짝수이면 `app-green`을 `deployService`로, 홀수이면 `app-blue`를 `deployService`로 할당하게 했다. 이는 Blue/Green 배포 전략에서 트래픽을 전환할 대상을 동적으로 결정하는 핵심 로직으로, 더 복잡한 방식을 써볼까 했지만, 결과적으로 심플함, 예측 가능성 등을 고려하여 일단 프론트엔드서버는 간단한 방식을 차용하였다. 

### Jenkins Pipeline에서 Groovy 활용 (e.g., `script { ... }` 블록)

Declarative Pipeline은 구조화된 형태를 가지지만, 복잡한 로직이나 동적인 처리가 필요할 때는 `script { ... }` 블록을 사용하여 Groovy 스크립트를 직접 실행할 수 있다. 이 블록은 Declarative Pipeline 내에서 Scripted Pipeline의 유연성을 제공하는 '탈출구' 역할을 한다.

#### `script { ... }` 블록의 역할

*   **복잡한 로직 구현**: Declarative Pipeline의 제한된 표현력으로는 어려운 복잡한 조건부 로직, 반복문, 예외 처리 등을 Groovy 스크립트로 직접 구현할 수 있다.
*   **동적 처리**: 빌드 번호, 환경 변수, 외부 API 호출 결과 등 동적인 값에 따라 파이프라인의 동작을 변경해야 할 때 유용.
*   **Jenkins DSL 확장**: Jenkins Pipeline이 제공하는 내장 DSL(Domain Specific Language) 외에, Groovy의 강력한 기능을 활용하여 사용자 정의 함수나 라이브러리를 호출할 수 있다.

`project-mini-frontend/jenkinsfile`의 `Build Image`, `Push to GHCR`, `Deploy to Server`, `post` 블록 내에서 `script { ... }` 블록이 광범위하게 사용했다. 

```groovy
// project-mini-frontend/jenkinsfile (script 블록 활용 예시)
stage('Build Image') {
    steps {
        echo "2. Build New Docker Image"
        script {
            def imageTag = "${IMAGE_NAME}:${env.BUILD_NUMBER}" // 빌드할 이미지 명을 가변적으로 지정하도록 사용함.
            sh "docker build -t ${imageTag} ./app" 
        }
    }
}

stage('Push to GHCR') {
    steps {
        echo "3. Push the Docker Image to GHCR"
        script {
            def imageTag = "${IMAGE_NAME}:${env.BUILD_NUMBER}"
            withCredentials([usernamePassword(credentialsId: GHCR_CREDS_ID, usernameVariable: 'USER', passwordVariable: 'TOKEN')]) {
                sh "echo ${TOKEN} | docker login ghcr.io -u ${USER} --password-stdin"
                sh "docker push ${imageTag}"
            } // withCredentials 로 주요내용을 함께 가져가서 명령어에 적용시킨다. 
        }
    }
}
```

위 예시에서 `script { ... }` 블록은 `imageTag` 변수를 선언하고, `sh` 명령어를 사용하여 Docker 빌드 및 푸시 작업을 수행하는 Groovy 코드를 포함한다. 특히 `withCredentials`와 같은 Jenkins DSL은 `script` 블록 내에서 더욱 유연하게 활용될 수 있다.

Jenkins Pipeline 스크립트 언어인 Groovy를 이해하고 활용하는 것은 복잡한 CI/CD 파이프라인을 구축하고 유지보수하는 데 필수적인 역량이다. Groovy의 기본 문법과 `script { ... }` 블록의 활용법을 숙지함으로써, Jenkins 파이프라인의 잠재력을 최대한 발휘할 수 있다.

### 소스 코드 관리 (Source Code Management - SCM)

CI/CD 파이프라인의 첫 번째이자 가장 기본적인 단계는 소스 코드를 관리하고 변경 사항을 감지하는 것이다. 소스 코드 관리(SCM) 시스템은 개발자들이 작성한 코드를 저장하고, 변경 이력을 추적하며, 여러 개발자 간의 협업을 지원하는 도구다. Jenkins는 다양한 SCM 시스템과 연동하여 코드 변경을 감지하고 파이프라인을 트리거(trigger)해준다. 이 프로젝트에서는 Git을 SCM을 기반으로 만들었다.

#### Git 연동 (`git credentialsId: GITHUB_CREDS_ID, url: '...', branch: 'main'`)

Jenkins는 Git 플러그인을 통해 Git 저장소와 쉽게 연동할 수 있게 되어있다. `Jenkinsfile` 내에서 `git` 스텝(step)을 사용하여 특정 Git 저장소에서 소스 코드를 체크아웃(checkout)할 수 있고 특별히 요청하는 단계 없이 자연스럽게 해당 저장소에서 파일을 가져와준다.

*   **`git` 스텝**: Jenkins Pipeline에서 Git 저장소에서 코드를 가져오는 데 사용되는 내장 스텝이다.
*   **`credentialsId`**: Jenkins에 미리 등록된 자격 증명(Credentials)의 ID를 지정한다. 이 자격 증명은 비공개(private) 저장소에 접근하거나, 특정 작업을 수행할 권한이 필요할 때 사용된다. `project-mini-frontend/jenkinsfile`에서는 `GITHUB_CREDS_ID`를 사용하여 GitHub 저장소에 접근하도록 세팅했다.
*   **`url`**: 소스 코드를 가져올 Git 저장소의 URL을 지정한다. HTTPS 또는 SSH URL을 사용할 수 있다.
*   **`branch`**: 체크아웃할 브랜치(branch)를 지정한다. 일반적으로 `main` 또는 `master` 브랜치를 지정하여 최신 코드를 가져오도록 설정했다.

```groovy
// project-mini-frontend/jenkinsfile (Checkout stage)
        stage('Checkout') {
            steps {
                echo "1. Get the latest code from GitHub"
                git credentialsId: GITHUB_CREDS_ID, url: 'https://github.com/paul2021-r/project-mini-frontend.git', branch: 'main'
            }
        }
```

이 스텝은 `GITHUB_CREDS_ID`에 해당하는 자격 증명을 사용하여 `https://github.com/paul2021-r/project-mini-frontend.git` 저장소의 `main` 브랜치에서 최신 코드를 Jenkins 작업 공간(workspace)으로 가져온다. `credentialsId`를 사용하는 것은 민감한 정보(예: GitHub Personal Access Token)를 `Jenkinsfile`에 직접 노출하지 않고 안전하게 관리하는 구조다.

#### `git pull origin main`, `git checkout main` 명령의 이해

`Jenkinsfile`의 `Deploy to Server` 단계 내에서 SSH를 통해 원격 서버에 접속한 후 `git pull origin main` 및 `git checkout main` 명령어를 실행한다. 이는 배포 서버 자체의 프로젝트 디렉토리에서 최신 코드를 유지하기 위한 목적으로 제공된다. 즉, 기존 젠킨스 빌드 서버는 workspace 에서 자동으로 최신화되지만, 시크릿을 제외한 환경 파일이나 설정 등, 깃을 통해 공유되는 영역을 위해, SSH 접속 후에도 최신화를 시키는 세심한 단계를 추가했다. 

```groovy
// project-mini-frontend/jenkinsfile (Deploy to Server stage 일부)
                                ssh -o StrictHostKeyChecking=no -p ${TARGET_PORT} ${TARGET_HOST} '
                                set -ex
                                
                                // ...

                                echo "--- Refresh main repository ---"
                                cd ${TARGET_PROJECT_PATH}
                                git pull origin main
                                git checkout main
                                
                                // ...
                                '
```

*   **`cd ${TARGET_PROJECT_PATH}`**: 먼저 배포 서버의 프로젝트 루트 디렉토리로 이동.
*   **`git pull origin main`**: 원격 저장소(`origin`)의 `main` 브랜치에서 최신 변경 사항을 가져와 현재 로컬 브랜치에 병합(merge)한다. 이는 배포 서버에 항상 최신 버전의 코드가 존재하도록 보장
*   **`git checkout main`**: 현재 작업 중인 브랜치를 `main` 브랜치로 전환한다. 이는 혹시 다른 브랜치에 머물러 있을 경우를 대비하여 `main` 브랜치에서 작업을 수행하도록 명확히 하는 역할을 한다.

