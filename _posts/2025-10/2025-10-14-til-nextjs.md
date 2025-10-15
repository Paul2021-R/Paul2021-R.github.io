---
layout: post 
title: TIL - Next.js
subtitle: nextjs 를 간단하게 테스트 해보자
categories: 학습
tags: 학습 NextJS Front-End
thumb: /assets/images/posts/2025-10/2025-10-15-024.png
custom-excerpt: 2025년 10월 14일 개발 내용 요약 및 학습 정리
banner:
  # video: https://vjs.zencdn.net/v/oceans.mp4
  loop: true
  volume: 0.8
  muted: true                 # For mobile device background music play 
  start_at: 8.5
  image: /assets/images/posts/2025-10/2025-10-15-024.png
  opacity: 0.318
  background: "#000"
  height: "100vh"
  min_height: "38vh"
  heading_style: "font-size: 4.25em; font-weight: bold; text-decoration: underline"
  subheading_style: "color: gold"
---

## 2025년 10월 14일 개발 내용 요약 및 학습 정리

### 1. 개발 내용 요약

2025년 10월 14일, Next.js 프로젝트의 개발 환경 설정을 Docker 기반으로 고도화하는 작업이 완료되었다. 주요 내용은 다음과 같다.

*   **Next.js 프로젝트 설정:** `create-next.js-app`을 사용하여 TypeScript 기반의 Next.js 프로젝트를 생성하고, `pnpm`을 최신 버전으로 업데이트하며 Next.js 15 버전으로 시작했다. Turbopack 사용 여부에 대한 검토 후, 현재 안정화된 webpack 기반으로 진행했다.
*   **Docker 환경 구축:**
    *   **프로덕션(운영) Dockerfile 작성:** 멀티 스테이지 빌드(Multi-stage builds)를 활용하여 `builder` 스테이지와 `runner` 스테이지로 나누어 효율적인 Docker 이미지를 생성했다. `builder` 스테이지에서는 의존성 설치 및 빌드를 수행하고, `runner` 스테이지에서는 빌드된 결과물만을 복사하여 가볍고 최적화된 운영 이미지를 구성했다. `.dockerignore` 파일을 통해 불필요한 파일이 이미지에 포함되지 않도록 설정했다.
    *   **Docker Compose를 활용한 개발 환경 구축:** `docker-compose.yml` 파일을 작성하여 개발 환경(`dev` 서비스)을 설정했다. `Dockerfile`의 `builder` 스테이지를 사용하고, `npm run dev` 명령어를 오버라이드하여 HMR(Hot Module Replacement)을 지원하며, 로컬 소스코드와 컨테이너를 볼륨으로 마운트하여 실시간 코드 변경이 반영되도록 했다.
    *   **Docker Compose를 활용한 프로덕션 환경 추가 및 분리:** 동일한 `docker-compose.yml` 파일 내에 프로덕션 환경(`prod` 서비스)을 추가했다. `prod` 서비스는 `Dockerfile` 전체를 빌드하되, 볼륨 마운트 없이 빌드된 이미지를 그대로 사용하고 `npm start` 명령어로 운영 서버를 실행하도록 설정했다.
*   **`package.json` 스크립트 연동:** 개발 편의성을 극대화하기 위해 `package.json`에 `pnpm start:dev`, `pnpm start:prod`, `pnpm set:dev`, `pnpm set:prod`, `pnpm unset:dev`, `pnpm unset:prod` 등의 Docker Compose 관련 스크립트를 추가하여 개발 경험(DX)을 효율화했다.

### 2. 학습 내용 정리

이번 개발 환경 설정을 통해 다음과 같은 내용을 학습하고 정리했다.

*   **Next.js 프로젝트 생성 및 기본 설정:** `create-next-app` 사용법, TypeScript 및 `pnpm` 활용, Turbopack과 webpack의 차이점 및 선택 기준을 이해했다.
*   **Docker Multi-stage Builds:** 빌드 환경과 실행 환경을 분리하여 최종 이미지 크기를 최적화하고 보안을 강화하는 방법을 익혔다. 특히 `builder`와 `runner` 스테이지의 역할 분담을 명확히 이해했다.
*   **Dockerfile 명령어 심층 이해:** `RUN` vs `CMD`의 차이점, `COPY` 명령어의 역할과 캐싱 메커니즘, `alpine` 리눅스 이미지를 사용하는 이유(작은 크기, 보안) 등을 구체적으로 파악했다.
*   **Docker Compose 활용:** `docker-compose.yml`을 통해 개발(`dev`) 및 운영(`prod`) 환경을 분리하고 관리하는 방법을 배웠다. 특히 개발 환경에서의 볼륨 마운트를 통한 HMR 구현과 프로덕션 환경에서의 최적화된 이미지 사용 방식을 이해했다.
*   **개발 경험(DX) 최적화:** `package.json` 스크립트를 활용하여 복잡한 Docker Compose 명령어를 단순화하고, 개발 워크플로우를 간소화하는 방법을 적용했다.

### 3. 다음 단계: 레포지토리 및 AI 리뷰 기능 연동 

이번 Docker 기반 개발 환경 설정을 성공적으로 마무리함에 따라, 다음 단계로는 이 환경을 기반으로 코드의 버전 관리 및 AI 기반 코드 리뷰 기능을 연동하는 작업을 진행할 예정이다.
