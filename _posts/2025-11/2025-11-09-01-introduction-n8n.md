---
layout: post 
title: n8n 개념 정리하기
subtitle: n8n 자동화에 대해 배워보자
categories: 학습
tags: 학습 Automation AI Google n8n
thumb: /assets/images/assets/n8n-automation-thumbnail.png
custom-excerpt: n8n 자동화에 대해 배워보자
banner:
  # video: https://vjs.zencdn.net/v/oceans.mp4
  loop: true
  volume: 0.8
  muted: true                 # For mobile device background music play 
  start_at: 8.5
  image: /assets/images/assets/n8n-automation.png
  opacity: 0.318
  background: "#000"
  height: "100vh"
  min_height: "38vh"
  heading_style: "font-size: 4.25em; font-weight: bold; text-decoration: underline"
  subheading_style: "color: gold"
---

## n8n 자동화 도구 소개

이 글은 n8n이라는 자동화 도구에 대한 기본적인 개념을 정리한 내용이다. '심심풀이' 프로젝트를 진행하며 n8n을 처음 접하는 개발자들에게 이 도구가 무엇이며, 어떤 핵심 개념을 가지고 있는지 명확히 전달하는 것이 목적이다.

n8n(Nodemation)은 워크플로우 자동화 도구로, Zapier나 Make와 유사한 기능을 제공하지만 몇 가지 차별점을 가진다. 가장 주목할 만한 특징은 **셀프 호스팅(Self-hosting)**이 가능하다는 점이다. 이는 Docker 등을 활용하여 직접 서버에 설치함으로써 비용을 절감하고 데이터 통제권을 확보할 수 있다는 점에서, 특히 개인 프로젝트나 민감한 데이터를 다루는 환경에서 큰 이점을 제공한다.

n8n의 핵심적인 작동 방식은 **노드 기반 시각화(Node-based visualization)**에 있다. 모든 자동화 과정은 '노드(Node)'라는 블록으로 표현되며, 이 노드들을 시각적으로 연결하여 전체 자동화 흐름, 즉 **워크플로우(Workflow)**를 구성한다. 워크플로우는 자동화 작업의 전체 단위이며, PRD에서 정의한 콘텐츠 수집부터 기록까지의 선형적인 과정을 하나의 워크플로우로 구현할 수 있다.

n8n은 **개발자 친화적(Developer-friendly)**이라는 점도 강점이다. 기본 제공되는 다양한 노드만으로도 복잡한 자동화를 구현할 수 있지만, 필요에 따라 `Code` 노드를 통해 Node.js 기반의 JavaScript로 직접 로직을 작성하거나 외부 라이브러리를 연동하는 것이 가능하다. 이는 기존 도구에서 제공하지 않는 특정 기능을 구현해야 할 때 유용하다.

n8n을 이해하기 위한 네 가지 핵심 구성 요소는 다음과 같다.

### 1. 워크플로우 (Workflow)
자동화 작업의 전체적인 단위이자, 노드들이 배치되는 '캔버스' 역할을 한다.

### 2. 노드 (Node)
워크플로우를 구성하는 최소 작업 단위이다.
*   **트리거 노드 (Trigger Nodes):** 워크플로우를 시작시키는 역할을 한다. `Schedule` (예약 실행), `Webhook` (외부 시스템 호출), `Manual` (수동 실행) 등이 대표적이다.
*   **일반 노드 (Regular Nodes):** 실제 작업을 수행하는 노드들이다. 데이터를 가져오거나, 가공하거나, 전송하는 등의 역할을 담당하며, `HTTP Request`, `Google AI`, `Discord`, `Git`, `Code` 등이 이에 해당한다.

### 3. 데이터 흐름 (Data Flow & JSON)
n8n의 가장 핵심적인 개념으로, 모든 데이터는 노드 간에 **JSON 배열(Array of JSON objects)** 형태로 전달된다. 앞선 노드의 출력이 다음 노드의 입력이 되는 방식으로, 데이터 구조는 보통 `[ { "data": "value" } ]` 형태를 가진다.

### 4. 표현식 (Expressions)
이전 노드의 데이터를 현재 노드에서 참조하는 방식이다. n8n은 `{{ ... }}` 형태의 표현식을 사용하며, `$node["Node Name"].json.data` 와 같이 특정 노드의 출력 데이터를 참조하는 것이 일반적이다.

### 5. 자격 증명 (Credentials)
Google AI API 키, GitHub PAT, Discord Webhook URL 등 민감한 정보를 n8n에 안전하게 저장하고 관리하는 기능이다. 노드 설정 시 실제 키 값 대신 등록된 자격 증명을 선택하여 보안을 유지한다.

이러한 n8n의 특징과 구성 요소를 이해하는 것은 자동화 프로젝트를 성공적으로 수행하는 데 필수적이다.

## 왜 쓰는가?
이제 AI 를 Agent 처럼 구축할 필요가 있다..!
그런데 프레임워크 기반의 서버로 구축하긴 너무 오래 걸리는데, 이때 n8n 은 아주 완벽한 PoC 용 툴이다. 