---
layout: post 
title: TIL - Antigravity 기반으로 챗봇 데모 구성해보기
subtitle: Antigravity 캬.. 훌륭하다
categories: 개발
tags: 개발 VibeCoding Antigravity Frontend
thumb: /assets/images/posts/2025-12/20251205-009.png
custom-excerpt: Antigravity 기반으로 챗봇 FE 구현 후기 
banner:
  # video: https://vjs.zencdn.net/v/oceans.mp4
  loop: true
  volume: 0.8
  muted: true                 # For mobile device background music play 
  start_at: 8.5
  image: /assets/images/posts/2025-12/20251205-009.png
  opacity: 0.318
  background: "#000"
  height: "100vh"
  min_height: "38vh"
  heading_style: "font-size: 4.25em; font-weight: bold; text-decoration: underline"
  subheading_style: "color: gold"
---

# Protostar Chatbot Demo Report

![](/assets/images/project-protostar/protostar_icon.png)

## 1. 개요 (Overview)

본 리포트는 블로그 내 'Protostar' 챗봇 위젯의 개발 과정과 기술적 구현 사항을 정리한 것이다. Antigravity 를 기반으로 좀더 빠르게 구성 가능한지? 에 대한 질문과 Google 제시한 Implementation Plan - progress - walkthrough 의 라이프사이클에 따른 개발 방식을 제대로 이해하기 위한 실험적인 미니 프로젝트이다.

이 프로젝트는 단순한 정적 페이지용 위젯을 넘어, 향후 **SSR(Server-Side Rendering) 서버 환경에서 호출될 컴포넌트**임을 고려한 선행 기술 검증(PoC) 및 데모 작성 실험이며, AI 까지 붙일 생각을 했으나, 정적 사이트 및 AI 적용 시 생길 수 있는 이슈들로 인해 단순 채팅 기능의 FE 개발만을 진행해 보았다.

## 2. 기술적 구현 (Technical Implementation)

본 챗봇은 외부 라이브러리 의존성 없이 **Vanilla JavaScript (ES6+)** 만으로 구현되었으며, 이식성과 독립성을 최우선으로 설계되었다. 이러한 설계를 하게된 핵심은 아래를 고려했기 때문이다.

1. 향후 제작할 Agentic AI 기반 챗봇이 어디든 연동되기 위해선 가장 중요한 키워드는 '호환성'이다.
2. 핵심 코어를 제외하곤 외부로 노출되어야 하기 때문에, 이를 고려한 설계가 가능해야하고, 그러기위핸 당장 종속성을 제거한 순수한 기술로 구현 가능한지 검증이 필요하다.

그리하여 결론적으로 다음 성과를 달성했다.

![](/assets/images/posts/2025-12/20251205-012.png)

* **독립적 실행 환경 (`assets/js/protostar.js`)**:
  * HTML, CSS, Logic이 하나의 JS 파일에 캡슐화함.
  * `document.createElement`와 `appendChild`를 통해 DOM을 동적으로 생성함으로써, 어떤 페이지에도 `<script>` 태그 한 줄로 이식 가능함.
  * CSS는 JS 내부에서 주입되어 스타일 충돌을 방지함.
* **상태 관리 (State Management)**:
  * 브라우저의 `localStorage`를 미니 데이터베이스처럼 활용하여 세션 지속성을 1차적으로 구현함.
  * `protostar_sessions` 키를 통해 대화 히스토리, 생성 시간, URL 정보를 구조적으로 저장함.

## 3. 주요 기능 (Key Features)

1. **세션 관리 (Session Management)**:
    * 다중 세션 지원 (단, 현재 계획중인 프로젝트의 유저 사용 제한을 고려하여 일일 3회 생성 제한).
    * 생성된 지 7일이 지난 데이터 자동 삭제.
    * 세션 리스트 UI 및 슬라이드 애니메이션 적용.
2. **동적 컨텍스트 (Dynamic Context)**:
    * 사용자가 보고 있는 페이지의 URL을 기반으로 채팅방 제목이 동적으로 변경된다.
    * `+` 버튼을 통해 현재 페이지의 제목과 내용을 문맥(Context)으로 첨부할 수 있다.(특정 페이지에 대한 요약이나, 준비된 사항이 있다면 AI가 답변해주기 위하여)
3. **사용자 경험 (UX)**:
    * 커스텀 오버레이를 통한 직관적인 알림 (회원가입 유도 등).
    * 반응형 아이콘 리사이징 (PC/Tablet/Mobile 최적화).
    * 라인 아트 스타일의 유저 프로필 아이콘 및 직관적인 인터페이스.

## 4. 향후 계획: SSR 및 서버 연동 (Future Integration)

현재는 클라이언트 사이드에서 모든 로직이 돌고 있지만, 최종 목표는 **Next.js/React 기반의 SSR 서버**로 이관하고, protostar 페이지에서 관리 될 예정이다. 단 한줄의 스크립트 호출 요청으로 어떤 블로그든 자신만의 기술블로그 및 커리어를 위한 AI 챗봇이 구축될 가능성을 확신하였다.

이번 데모를 통해 클라이언트단에서 필요한 이벤트 처리와 데이터 구조를 확립하였으며, 향후 다음과 같이 발전될 예정이다:

* **Iframe/Script Injection**: 외부 서버(Protostar 서비스)에서 위젯을 호스팅하고, 블로그는 이를 호출하는 구조.
* **실제 DB 연동**: `localStorage` 대신 서버 DB(PostgreSQL 등)에 대화 내용을 저장.
* **AI 모델 연동**: 현재의 목업(Mock) 응답 대신 실제 LLM API와 통신.

## 5. 결론 그리고 Antigravity

![](/assets/images/posts/2025-12/20251205-010.png)
> Antigravity 의 Implementation Plan

![](/assets/images/posts/2025-12/20251205-011.png)
> Antigravity 의 Walkthrough

사실 여기서 더 소개를 하진 않겠지만 Antigravity 가 왜 괜찮은가? 라고 생각해볼때, 확실히 'UX'가 AI를 어떻게 이용할 것인가 라는 지점에서 완성도가 상당하다고 느껴지기 때문이라고 답할 수 있을 것 같다. 물론 workspace 도 대단하다고 느꼈지만, 순서를 구체화하고 AI 와의 협업, AI를 어떤 식으로 사람이 관리하도록 만들었는가? 차원에서 본다면 대단한 진보가 아닐 수 없었다.

업무의 성격에 따라, 구현의 목표치가 복잡하면 이에 맞춰 구현 플랜을 짜고, 다른 작업을 하고 있는 상황에서 AI의 이해 상황을 확인한다. 그리곤 수정을 할 게 있다면 수정을 진행하고, 그에 맞춰 진행 요청, 그리곤 결과물을 보게되는데, 이때 역시 테스트를 무엇을 얼마나 해야할지를 사람이 판단 가능하게 제시. 여기서 더 나아가면 subagent 기능으로 QA 까지 해보면 될것 같다. 진짜 DevOps 영역은 아직 한계가 명확하지만 웹 개발 영역은... 미친게 분명하단 생각이 든다.

또한 간단하게 순수 바닐라로 DOM 수정까지 포함하고 핵심 기능 전체를 구현하는데 AI 의 도움, 내 확인, 심지어 글 하나 별도로 작성 중이던 시점에서 1천줄의 코드를 작성하는데 약 1시간 반.... 엄청난 생산성 차이라는 건 명백해 보인다. 그러나 한 가지 확실히 알 수 있는 점은

1. 개발 용어에 친숙하고 정확한 지침이 될 수록 기능 완성도는 명확하다.
2. 우선순위, 원칙을 명확하게 하지 않으면 AI 는 '과한 최선'을 다해 다소 꼬일 수 있다.
3. 반드시 AI 의 구현 작업 목록을 통해 AI의 확률적 판단이 '오해' 인지 아닌지를 검토가 가히 필수이다.

라는 점은 더욱 명확해지는 것 같다. 코더는 사라져도 찐 실력자들은 그대로 살아있을거란게 확실히 느껴진다.

더불어, 구현해보고 나니 Protostar 의 프로젝트가 생각 이상 편리할 것이란 생각. 그리고 이를 디테일하게 해주면 최소한 '뭘 원하는가' 라는 차원에서 구직자 구인자 사이의 꽤나 괜찮은 접근이 되지 않을까? 라는 생각은 명료해진 것같다. 물론, 시장의 파워나 크기를 생각해보면 의미 없어 보이긴 하지만...음
