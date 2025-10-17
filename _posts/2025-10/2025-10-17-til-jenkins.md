---
layout: post 
title: TIL - jenkins 로 무중단 nextjs 배포 구축하기
subtitle: nextjs 기반 앱을 무중단 배포 구성하기
categories: 학습
tags: 학습 NextJS DevOps Jenkins Docker
thumb: /assets/images/posts/2025-10/2025-10-17-025.png
custom-excerpt: 2025년 10월 14일 개발 내용 요약 및 학습 정리
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

## 2025년 10월 17일 개발 내용 요약 및 학습 정리
## 📝 Jenkins 무중단 배포 구축을 위한 추가 밑작업
### ✨ 목적 (Purpose)

Jenkins 를 활용한 무중단 배포를 구축하기 위해, 단순히 Dodcker 컨테이너화로 끝나는게 아닌, 배포 용이, 무중단성을 확보하기 위한 구조 개선이 필요하다고 느꼈다. 이에 아래의 목표를 기반으로 NextJS 의 프로젝트에 추가적인 작업 목표를 설정해보았다.

*   **CI/CD 파이프라인 통합 용이성**: Jenkins와 같은 CI/CD 도구를 통해 자동화된 빌드 및 배포를 더욱 용이하게 합니다.
*   **개발 및 운영 환경 일관성 유지**: Docker를 통해 개발 및 운영 환경 간의 차이를 최소화하고 일관성을 유지합니다.
*   **무중단 배포(Zero-downtime Deployment) 지원**: Nginx와 블루/그린 배포 전략을 통해 서비스 중단 없이 애플리케이션을 업데이트할 수 있는 기반을 마련합니다.
*   **프로젝트 가독성 및 유지보수성 향상**: 명확한 디렉토리 구조와 상세한 문서화를 통해 프로젝트의 가독성과 유지보수성을 높입니다.


### 🛠️ 주요 변경 사항 

#### 1. 프로젝트 구조 재편

*   **`app/` 디렉토리로 파일 이동**: 기존 루트 디렉토리에 있던 Next.js 관련 파일들 (`.dockerignore`, `.gitignore`, `Dockerfile`, `eslint.config.mjs`, `next.config.ts`, `package.json`, `pnpm-lock.yaml`, `postcss.config.mjs`, `public/`, `src/`, `tsconfig.json`)이 모두 `app/` 디렉토리 내부로 이동시켰다. 이는 Next.js 애플리케이션의 모듈성을 높이고, 프로젝트의 각 구성 요소(Next.js 앱, Nginx)를 명확하게 분리하기 위함이다.

#### 2. Docker 환경 구성 개선

*   **`app/Dockerfile` 다단계 빌드(Multi-stage Build) 개선**: `Dockerfile`의 스테이지 구성이 더욱 세분화 시켰다. `base`, `dev_runner`, `prod_modules_setter` 스테이지가 추가되어 개발 및 운영 환경에 맞는 의존성 설치 및 빌드 과정을 명확하게 분리했다.
    *   `dev_runner`: 개발용 의존성을 설치하여 빠른 개발 환경을 독립적으로 제공 목적으로 만듬.
    *   `prod_modules_setter`: 운영용 의존성만 설치하여 최종 이미지 크기를 최적화하고 보안을 강화한다.
*   **`app/docker-compose.yml` 추가**: `app/` 디렉토리 내부에 Next.js 앱만을 위한 `docker-compose.yml`, 이 파일은 `dev`와 `prod` 서비스를 정의하여 Next.js 앱의 개발 및 운영 환경을 독립적으로 관리하도록 만들었다.
*   **`루트 최상단의 docker-compose.yml`** : 기존 `dev` 및 `prod` 서비스 정의가 삭제되고, `nginx`, `app-blue`, `app-green` 서비스가 새로 정의되어있다. 이는 블루/그린 배포 전략을 위한 핵심적인 내용만을 담고 있어서, 빌드 시 production으로 완전히 빌드되어주는 것만을 바라본다.

#### 3. Nginx 리버스 프록시(Reverse Proxy) 및 블루/그린 배포 설정

*   **`nginx/` 디렉토리 생성 및 설정 파일 추가**: `nginx/` 디렉토리가 새로 생성되었고, 그 안에 `Dockerfile`과 `nginx.conf` 를 만들었다.
    *   `nginx/Dockerfile`: Nginx 이미지를 빌드한다. 기존 설정을 배제하는 것 까지만 포함된다.
    *   `nginx/nginx.conf`: `nextjs_app` 업스트림을 통해 Next.js 앱(`app-blue:3000`으로 초기 설정)으로 트래픽을 전달하도록 설정시키는 용이다. 이는 Jenkins와 같은 CI/CD 도구를 통한 동적 배포를 염두에 둔 구성.
*   **블루/그린 배포 전략 도입**: 루트 `docker-compose.yml`에서 `nginx` 서비스가 `app-blue`와 `app-green` 서비스에 의존하도록 설정하여, 무중단 배포를 위한 블루/그린 배포 전략의 기반을 마련하였다.

---

## 배운 것들 정리
### 멀티 스테이지 빌드(Multi-stage build) 
- 멀티스테이지 빌드는 최종 이미지를 **최대한 가볍고 안전하게** 만들기 위해, 하나의 `Dockerfile` 안에 여러 개의 독립적인 빌드 환경(스테이지)을 정의하는 기술이다.

#### 필요한 이유는? 
만약 스테이지 개념 없이 `Dockerfile`을 작성하면, 다음과 같은 문제가 발생할 수 있다.
1. **이미지 비대화 (Bloated Image)**: 코드를 빌드하기 위해 설치했던 `typescript`, `eslint` 같은 모든 개발용 도구(`devDependencies`)가 최종 실행 이미지에 불필요하게 포함된다.
2. **보안 취약점 (Security Risk)**: 사용하지 않는 도구나 라이브러리가 많을수록, 해커가 악용할 수 있는 공격 지점(Attack Surface)이 늘어난다.

---
#### 작동 원리: `FROM ... AS` 와 `COPY --from`

멀티스테이지 빌드는 이 두 가지 명령어로 동작한다.
##### 1. `FROM ... AS <스테이지_이름>`
- `Dockerfile`에서 `FROM` 명령어가 나올 때마다 새로운 스테이지가 시작됩니다. 이는 **이전 스테이지와는 완전히 격리된, 새로운 환경**에서 시작한다는 뜻이다.
- `AS <스테이지_이름>` (예: `AS builder`) 구문을 사용해, 해당 스테이지에 우리가 알아볼 수 있는 **이름표**를 붙여주는 역할을 한다.

##### 2. `COPY --from=<스테이지_이름>`
- `COPY` 명령어에 `--from` 플래그를 사용하면, 다른 스테이지에 붙여둔 이름표를 호출하여 **해당 스테이지의 결과물만** 현재 스테이지로 가져올 수 있다.

#### 실 예제로 보면?

```Dockerfile
# ======= 1. BASE 스테이지 =======
FROM node:22-alpine AS base
# 작업 위치 설정 - 해당 컨테이너 위치 
WORKDIR /app

# pnpm 설치 
RUN npm install -g pnpm

# package.json, pnpm-lock.yaml 등 의존성 관련 파일만 복사
COPY package.json pnpm-lock.yaml ./

# ======= 2. dev용 스테이지 ========
FROM base AS dev_runner
# 의존성 설치 - dev 용
RUN pnpm install

# ======= 3. 빌드 스테이지 ========
FROM dev_runner AS builder

# 나머지 소스 코드 전체 복사 
COPY . .

# 애플리케이션 빌드
RUN pnpm run build

# ======= 4. 의존성 증류 스테이지 ========
FROM base AS prod_modules_setter

# 의존성 중 production용만 받아오기
RUN pnpm install --prod

# ======= 5. prod 실행 스테이지 ========
FROM node:22-alpine AS runner

# 작업 디렉토리 설정 
WORKDIR /app

# 빌드 스테이지의 운영에 필요한 파일들만 복사 
# 1. 빌드 결과물 
COPY --from=builder /app/.next ./.next

# 2. 정적 파일
COPY --from=builder /app/public ./public

# 3. 운영용 의존성
COPY --from=prod_modules_setter /app/node_modules ./node_modules

# 4. package.json 파일
COPY --from=prod_modules_setter /app/package.json ./package.json

# 애플리케이션이 사용할 포트 노출 
EXPOSE 3000

# 컨테이너 시작 시 명령어
CMD ["node", "./node_modules/next/dist/bin/next", "start"]
```

- BASE 스테이지는 공통된 영역까지를 전제로 작성되어 레이어를 구성한다. 
- dev 개발 환경은 모든 의존성을 설치 및 HR(핫리로딩)으로 동작하므로 `dev_runner` 스테이지에서 모든 의존성을 받아서, 설정을 종료 하게 된다.(docker-compose.yml 을 통해)
- prod 의 경우 `builder` 를 통해 빌드가 이루어지는데, 이때 빌드 하면서 개발환경의 노드 모듈들을 포함해야 하는데, 그렇기에 실제 프로덕션 환경에서 필요한 노드 모듈만 받아오지 못하게 되어 있다. 
- 그렇기에 `prod_modules_setter`는 다시 `base` 기반에서 --prod 옵션을 통해 프로덕션에서 필요한 것들만을 받아 놓는 역할만을 수행한다. 
- 최종적으로 `runner`는 빌드된 파일, 순수한 production 기반의 모듈들만을 받아서, 깔끔하게 실행된다.