---
layout: post 
title: AI Breakfast Ep 2 생각정리
subtitle: AI Trend와 GoogleAI 최신 업데이트
categories: AI
tags: AI DevOps Google 생각정리
thumb: https://i.ytimg.com/vi/GEUFX_OzceA/hq720.jpg
custom-excerpt: AI DevOps 전문가가 되기 위한 배경지식 쌓기 노력 중...! 
banner:
  # video: https://vjs.zencdn.net/v/oceans.mp4
  video: https://cdn.pixabay.com/video/2019/10/04/27539-364430966_large.mp4
  loop: true
  volume: 0.8
  muted: true                 # For mobile device background music play 
  start_at: 8.5
  image: https://wallpapers.com/images/featured-full/running-wl9pg3zeygysq0ps.jpg
  opacity: 0.618
  background: "#000"
  height: "100vh"
  min_height: "38vh"
  heading_style: "font-size: 4.25em; font-weight: bold; text-decoration: underline"
  subheading_style: "color: gold"
---

## 영상 보기
[![비디오 제목](https://i.ytimg.com/vi/GEUFX_OzceA/hq720.jpg)](https://www.youtube.com/watch?v=GEUFX_OzceA)

## 요약
"AI Breakfast | Episode 2"는 구글 AI의 차별점과 개발 원칙, AI의 미래 전망, 그리고 구글 클라우드 넥스트(Google Cloud Next) 행사의 주요 발표 내용을 다루고 있다.

*   **구글 AI의 본질적 차별점은 '풀 스택(Full-Stack) 프로바이더'라는 점**이다. 구글은 AI 특화 프로세서인 **TPU와 같은 인프라를 직접 구축하고**, 개발자들이 모델을 활용하고 에이전트를 구축할 수 있는 **버텍스 AI(Vertex AI) 플랫폼을 제공하며**, 워크스페이스(Workspace)와 같은 최종 사용자를 위한 **SaaS 서비스까지 전체 스택을 모두 제공한다**. 이는 AI의 근본부터 최종 서비스까지 모든 것을 직접 제공하는 독자적인 강점이다.

*   **구글 AI 개발의 세 가지 원칙은 2018년 구글 I/O에서 수립된 바 있다**.
    1.  **대담한 혁신**: 끊임없이 새로운 기술을 탐구하고 개발한다.
    2.  **책임감 있는 개발 및 배포**: 기술 개발 속도보다는 **'모두에게 도움이 될 것인가'를 우선시한다**. 이를 위해 철저한 내부 테스트를 거치며, AI로 생성된 이미지나 영상에 **신스아이디(SynthID)와 같은 워터마크를 넣어 AI 생성물임을 명확히 한다**. 이는 투명성을 확보하고 사용자 혼란을 방지하기 위함이다.
    3.  **협력적 발전**: 개발된 AI 기술을 구글의 이익 추구에만 사용하지 않고, **사회 공동의 선(善)과 이익을 위해 공유한다**. 젬마(Gemma)와 같은 오픈소스 모델 배포, 산불 확산 예측 모델, 유방암 진단 보조 등 의료 및 공공 분야 기술 제공이 그 예이다.
    **구글은 2016년 'AI 퍼스트(AI First)' 회사를 선언하며 '모두에게 유용한 AI를 만든다(AI for everyone)'는 사명을 가지고 있다**.

*   **구글은 AI의 감각 확장을 통해 물리적인 세계와 상호작용하는 것을 다음 단계로 바라본다**. **제미나이 로보틱스(Gemini Robotics)를 통해 제미나이 2.0 기반의 로봇 팔을 개발하여, 사람의 음성이나 키보드 명령을 수행하고 실시간으로 상황 변화를 인지하며 목표를 달성할 수 있도록 한다**. 이는 VLA(Vision, Language, Action) 기술을 통해 AI가 인간의 동반자로서 진정으로 도움을 줄 수 있도록 하는 방향이다.

*   **구글 클라우드 넥스트(Google Cloud Next) 행사에서는 다음과 같은 주요 발표가 있었다**.
    *   라스베이거스의 스피어(The Sphere)에서 특별 행사를 진행했으며, **Veo2(텍스트-투-비디오 AI)와 이매진(Imagen)을 활용하여 "오즈의 마법사"를 스피어의 360도 스크린에 상영할 수 있도록 업스케일링 및 영상 생성 프로젝트를 공개했다**. 이는 구글의 방대한 연산 자원과 혁신적인 AI 기술력을 보여주는 사례이다.
    *   **7세대 TPU가 도입되었으며, 단일 연산 성능으로 42.5 엑사플롭스(exaFLOPS)를 달성했다**. 이는 기존 슈퍼컴퓨터의 10배 이상 성능이며, 구글의 모든 AI 모델은 TPU 위에서 생성되고 서비스된다.
    *   **제미나이 2.5 프로(Gemini 2.5 Pro)는 100만 토큰의 이해력을 지원하여 장편 소설 여러 편에 해당하는 방대한 양의 정보를 한 번에 처리하고 깊이 있는 추론을 할 수 있다**. 또한, **플래시(Flash) 모델은 지연 시간을 극단적으로 줄여 빠른 응답을 요하는 서비스에 최적화되었다**.
    *   **진화한 버텍스 AI(Vertex AI)는 기업이 구글 AI를 활용하는 올인원 솔루션이다**. 모델 가든, 에이전트 빌더, 모델 빌더의 세 가지 핵심 구성 요소를 제공한다. 특히, **유튜브 영상의 URL만으로 전체 영상을 분석하고 요약하는 기능이 추가되어, 특정 장면을 검색하는 것도 가능해졌다**. 이는 구글의 유튜브 생태계를 활용한 강력한 기능이다.
    *   **구글은 기업 내 생산성 향상을 위한 '에이전틱 AI(Agentic AI)'에 집중하고 있다**. **A2A(Agent-to-Agent) 프로토콜을 통해 서로 다른 기술로 만든 에이전트 간의 교신을 가능하게 하며**, 기업 내 누구나 에이전트를 활용할 수 있는 새로운 SaaS 제품인 **'에이전트 스페이스(Agent Space)'를 출시했다**.

결론적으로 구글 클라우드 넥스트에서는 **구글이 AI 인프라(7세대 TPU)부터 모델(제미나이 2.5), 에이전트, 기업형 플랫폼(버텍스 AI)까지 모든 것을 제공하는 '풀 스택' 기업임을 명확히 보여주며, 기업들에게 '버텍스 AI만 쓰면 된다'는 메시지를 전달했다**.

## 내 생각 정리
진짜 배울게 많다... 써보고 싶은 기능은 많은데 시간은 그걸 허락을 안하니... 이걸 어쩌면 좋으리... 
~~복권을 사는 것 말곤 답이 없을 지도~~ 

확실히 AI 관련 인프라를 비롯해, API 로 활용하기 좋음, 성능을 고려하면 최고는 구글이라고 생각이 든다. 최대한 적용을 해볼 수 있어야 할텐데 싶다. 마음이 급해진다. 🤔