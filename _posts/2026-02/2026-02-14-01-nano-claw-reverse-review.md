---
layout: post 
title: NanoClaw review note - 01 - NanoClaw Init
subtitle: Nano Claw 구성 요소들에 리버스 Study 를 하고, 구조를 파악한다.
categories: 문제해결
tags: AI Study Review NanoClaw
thumb: /assets/images/posts/2026-02/018.png
custom-excerpt: Protostar 구성 요소들에 리버스 Study 를 하고, 구조를 파악한다.
banner:
  # video: https://vjs.zencdn.net/v/oceans.mp4
  loop: true
  volume: 0.8
  muted: true                 # For mobile device background music play 
  start_at: 8.5
  image: /assets/images/posts/2026-01/20260109-010.png
  opacity: 0.318
  background: "#000"
  height: "100vh"
  min_height: "38vh"
  heading_style: "font-size: 4.25em; font-weight: bold; text-decoration: underline"
  subheading_style: "color: gold"
---

## 0. Why this Project?
- 본 프로젝트는 AI 응용 어플리케이션 구축에서 필요한 내용, agentic AI 구축을 위하여 필요한 것들에 대한 이해도를 높이고, 현재 진행중인 Nexus 프로젝트 이후 AI 기반의 서비스 구축 능력을 갖추기 위한 첫 도전이다. 
- 당장 무언가를 만들기보단, 잘 만들어진 예시를 기반으로 RAG 이상의 기능 구현을 어떤 식으로 접근하면 좋을지 사전 학습 겸 하여 진행하게 되었다.
- [코드 레포지터리](https://github.com/Paul2021-R/nanoclaw-for-study)

---

## 1. 루트 디렉토리 전체 구조

```
nanoclaw/
├── src/                   # 핵심 소스 코드
├── container/             # 컨테이너 빌드 & 에이전트 런너
├── docs/                  # 아키텍처 문서
├── groups/                # 그룹별 격리 메모리
├── config-examples/       # 설정 예시 파일
├── launchd/               # macOS 서비스 데몬 설정
├── assets/                # 로고, 아이콘 등 정적 자산
├── .github/               # GitHub Actions & PR 템플릿
├── package.json           # 프로젝트 의존성 & 스크립트
├── tsconfig.json          # TypeScript 컴파일 설정
├── vitest.config.ts       # 테스트 프레임워크 설정
├── CLAUDE.md              # Claude AI에게 주는 프로젝트 맥락
├── README.md / README_zh.md  # 프로젝트 문서 (영어/중국어)
├── CONTRIBUTING.md        # 기여 가이드
└── LICENSE                # 라이선스 (MIT)
```

###  `src/` — 핵심 애플리케이션 코드

프로젝트의 심장부이다. 모든 비즈니스 로직이 여기에 모여 있다.

| 파일                    | 역할                                                             |
| --------------------- | -------------------------------------------------------------- |
| `index.ts`            | **오케스트레이터(Orchestrator)** — 상태 관리, 메시지 루프, 에이전트 호출을 총괄하는 진입점이다 |
| `config.ts`           | 트리거 패턴, 경로, 인터벌, 타임아웃 등 **전역 설정값**을 관리한다                       |
| `router.ts`           | 메시지 포맷팅 및 **아웃바운드 라우팅**을 담당한다                                  |
| `container-runner.ts` | Agent 컨테이너를 **스폰(Spawn)하고 마운트를 설정**하는 핵심 모듈이다                  |
| `ipc.ts`              | 호스트↔컨테이너 간 **IPC(프로세스 간 통신)** 감시 및 태스크 처리를 담당한다                |
| `db.ts`               | **SQLite** 기반의 데이터 관리 (대화 기록, 스케줄 등)를 수행한다                     |
| `task-scheduler.ts`   | **cron/interval/once** 기반의 예약 작업 관리를 담당한다                      |
| `group-queue.ts`      | 그룹별 메시지 **큐(Queue)** 관리를 처리한다                                  |
| `mount-security.ts`   | 컨테이너에 마운트할 경로의 **보안 검증** (allowlist/blocklist)을 수행한다           |
| `types.ts`            | 프로젝트 전체에서 사용되는 **타입 정의** (Channel, Message, Task 등)를 담고 있다     |
| `logger.ts`           | `pino` 기반의 **구조화된 로깅** 설정이다                                    |
| `whatsapp-auth.ts`    | WhatsApp **QR 인증** 전용 스크립트이다                                   |

#### `src/channels/` — 채널 추상화 계층

```
channels/
├── whatsapp.ts        # WhatsApp 연결, 인증, 송/수신 구현체
└── whatsapp.test.ts   # WhatsApp 채널 테스트
```

`Channel` 인터페이스를 통해 메시징 플랫폼을 추상화한 구조이다. 현재는 WhatsApp만 구현되어 있지만, 이 패턴 덕분에 Telegram 등 다른 채널도 쉽게 추가할 수 있는 확장 가능한 설계이다.

### `container/` — 에이전트 컨테이너 환경

Claude Agent가 실제로 **실행되는 격리된 환경**을 구성하는 폴더이다.

```
container/
├── Dockerfile         # 에이전트 실행 환경 이미지 빌드 정의
├── build.sh           # 컨테이너 빌드 스크립트
├── agent-runner/      # 컨테이너 내부에서 실행되는 별도 Node.js 패키지
│   ├── package.json   # agent-runner 전용 의존성
│   ├── tsconfig.json
│   └── src/           # IPC MCP stdio 등 내부 통신 로직
└── skills/            # 에이전트에게 주입되는 스킬
    └── agent-browser/ # 브라우저 자동화 도구
```

핵심 포인트는 **호스트 프로세스(src/)와 에이전트 런타임(container/agent-runner/)이 완전히 분리**되어 있다는 것이다. 에이전트는 Apple Container(Linux VM) 안에서 돌아가기 때문에, 설령 AI가 위험한 명령을 실행하더라도 호스트 시스템에는 영향을 줄 수 없는 **샌드박스(Sandbox)** 구조이다. (AI의 자유와 시스템의 안전을 동시에 챙기는 아주 영리한 설계이다!)

### `groups/` — 그룹별 격리 메모리

```
groups/
├── global/
│   └── CLAUDE.md      # 모든 그룹에 공통 적용되는 Claude 메모리
└── main/
    └── CLAUDE.md      # main 그룹 전용 Claude 메모리
```

각 WhatsApp 그룹(또는 개인 대화)은 고유한 폴더를 가지며, 해당 폴더의 `CLAUDE.md`가 **그 그룹만의 개인화된 AI 메모리** 역할을 한다. `global/`은 모든 그룹에 공통으로 적용되는 설정이고, `main/`은 메인(개인) 대화 전용이다. 그룹마다 파일시스템과 메모리가 **완전히 격리**되는 구조인 것이다.

### `docs/` — 프로젝트 문서

```
docs/
├── SPEC.md                         # 전체 프로젝트 사양서 (가장 중요!)
├── REQUIREMENTS.md                 # 아키텍처 의사결정 기록
├── SDK_DEEP_DIVE.md                # Claude Agent SDK 심층 분석
├── SECURITY.md                     # 보안 모델 문서
├── DEBUG_CHECKLIST.md              # 디버깅 체크리스트
└── APPLE-CONTAINER-NETWORKING.md   # Apple Container 네트워킹 가이드
```

단순한 README를 넘어서 **아키텍처 결정 근거(ADR)**, **보안 모델**, **SDK 분석** 등이 체계적으로 정리되어 있다. 특히 `SPEC.md`와 `REQUIREMENTS.md`는 프로젝트를 이해하는 데 가장 중요한 문서이다.

### `config-examples/` — 설정 예시

```
config-examples/
└── mount-allowlist.json   # 컨테이너 마운트 허용 경로 설정 예시
```

컨테이너에 어떤 호스트 디렉토리를 마운트할 수 있는지 제어하는 **보안 설정의 예시 파일**이다. 실제 설정은 `~/.config/nanoclaw/mount-allowlist.json`에 위치하며, 의도적으로 프로젝트 루트 **바깥**에 두어 에이전트가 임의로 수정할 수 없도록 설계했다. (파일 하나에 보안 철학이 담겨 있는 셈이다!)

### `launchd/` — macOS 서비스 데몬

```
launchd/
└── com.nanoclaw.plist     # macOS LaunchAgent 설정
```

nanoclaw을 macOS의 **백그라운드 서비스**로 등록하기 위한 plist 파일이다. `launchctl load`/`unload` 명령으로 시스템 시작 시 자동 실행되도록 구성할 수 있다. 

### 루트 설정 파일들

| 파일 | 역할 |
|------|------|
| `package.json` | 프로젝트 의존성, 스크립트, 엔진 버전 정의 |
| `tsconfig.json` | TypeScript 컴파일러 설정 |
| `vitest.config.ts` | Vitest 테스트 프레임워크 설정 |
| `.prettierrc` | 코드 포맷팅 규칙 |
| `.gitignore` | Git 추적 제외 파일 목록 |
| `.mcp.json` | MCP(Model Context Protocol) 설정 |
| `CLAUDE.md` | Claude AI에게 프로젝트 구조와 명령을 알려주는 컨텍스트 파일 |

---
nanoclaw은 **"메시징 인터페이스 → 메시지 라우팅 → 격리된 컨테이너에서 AI 실행 → 결과 반환"** 이라는 깔끔한 파이프라인 구조를 가진 프로젝트이다. 호스트와 에이전트의 완전한 분리, 그룹별 메모리 격리, 마운트 보안까지 — AI 백엔드 아키텍처의 정석을 잘 보여주고 있다.

---

## 향후 학습 방향성 

### 🥇 1단계: 전체 흐름 파악 (Big Picture)

| 순서  | 파일        | 이유                                                                    |
| --- | --------- | --------------------------------------------------------------------- |
| ①   | SPEC.md   | 코드를 보기 전에 전체 사양서를 먼저 읽으면, 각 모듈이 **왜** 그렇게 설계됐는지 맥락확인하기                |
| ②   | types.ts  | Channel, NewMessage, ScheduledTask 등 핵심 타입들이 정의되어 있어서 전체 데이터 흐름의 파악하기 |
| ③   | config.ts | 트리거 패턴, 타임아웃, 동시 컨테이너 수 등 시스템 동작을 결정하는 **설정값**들 역으로 분석하기              |

### 🥈 2단계: 핵심 파이프라인 (메시지 → AI 실행 → 응답)

| 순서  | 파일                  | 이유                                                                                                               |
| --- | ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| ④   | index.ts            | **오케스트레이터** — 메시지가 들어오면 어떻게 처리되는지, AI 에이전트를 언제 호출하는지 전체 흐름의 중심                                                   |
| ⑤   | container-runner.ts | **가장 중요한 파일** Claude Agent를 Apple Container 안에서 어떻게 스폰하고, 마운트를 설정하고, 결과를 받아오는지가 다 여기 있어요. AI 실행 아키텍처의 핵심. 파악해둘 것 |
| ⑥   | ipc.ts              | 호스트↔컨테이너 간의 **IPC 통신 메커니즘** — AI 에이전트가 결과를 어떻게 전달하는지 파악하기                                                        |

### 🥉 3단계: 보조 시스템

| 순서  | 파일                | 이유                                                                         |
| --- | ----------------- | -------------------------------------------------------------------------- |
| ⑦   | mount-security.ts | AI에게 파일 접근을 주되, **어디까지 허용할 것인가**의 보안 로직. 실무에서 AI 서비스를 운영할 때 반드시 고려해야 할 부분. |
| ⑧   | task-scheduler.ts | AI에게 **예약 작업**을 시킬 수 있는 스케줄러. cron/interval/once 패턴이 깔끔하게 구현되어 있으므로 알아둘 것  |
| ⑨   | db.ts             | 대화 기록, 태스크 로그 등을 SQLite로 어떻게 관리하는지 볼 수 있음                                  |

### 🔍 4단계: 컨테이너 내부 (에이전트 시점)

| 순서  | 파일                      | 이유                                                                      |
| --- | ----------------------- | ----------------------------------------------------------------------- |
| ⑩   | container/agent-runner/ | 컨테이너 **안에서** 돌아가는 에이전트의 런타임 코드. 호스트 코드와 어떻게 IPC로 대화하는지를 에이전트 시점에서 확인할 것 |
| ⑪   | SDK_DEEP_DIVE.md        | Claude Agent SDK를 깊게 파헤친 문서. SDK 활용법을 체계적으로 이해할 수 있음.                   |

