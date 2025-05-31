---
layout: post 
title: AI에게 답을 찾는 새로운 방법 'Slow Think'
subtitle: 프롬프팅이 인문학적 사고가 필요해지는 이유
categories: AI
tags: etc AI prompting
thumb: /assets/images/banners/AI_2025-05-31-0001.jpg
custom-excerpt: 새롭게 등장한 AI 의 프롬프팅 방식이 나타났다. 해당 내용을 정리해본다.
banner:
  image: /assets/images/banners/AI_2025-05-31-0001.jpg
---

## AI 에게도 생각할 시간이 필요하다 : Slow Thinking
LLM 과 관련하여 AI를 사용하다보면 답을 정확하게 준다고 생각이 들긴 하지만, 그럼에도 여전히 할루시에이션(hallucination)이 발생하는 경우를 느끼거나, 데이터가 오염되었다고 느끼는 경우가 발생한다. 그러는 와중에 이런 영상을 발견하게 되었다. 

[![GPT/클로드/...](https://i.ytimg.com/vi/mN6FXDeSfAc/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLA44jSpAlGNEUistYs9DJaIgH4gXQ)](https://www.youtube.com/watch?v=mN6FXDeSfAc&t=3s)

프롬프팅에 대한 내용은 AI에 익숙한 사람들이라면 이미 충분히 알고 있을 만한 단어일 것이며, 그렇지 않다고 하더라도 '명령'이 왜 내가 하면 제대로 답을 못하는지를 한 번이라도 생각해봤다면 '어떤 식으로 명령을 내리면 '더 잘 답을 한다'' 라는 이야기를 들어 봤을 것이다. 

### AI 는 확률의 문제다. 

LLM 모델의 구조가 방대한 양의 3차원 축으로 데이터의 '연관성의 맵'을 구성하고, 거기서 어떤 질문이 들어올 때 그 '답'이라는 것은 소위 '연관성' 이라는 것과 연결되는 것이다. 

그렇기에 질문을 할 때, '연관성'을 잘 살려내는가 아닌가가 매우 중요해진다. 하지만 **컴퓨터의 연산은 이 확률 계산에서 항상 동일한 값을 얻어내지 못한다** 그리고 이러한 부분은 놀랍게도 마치 사람처럼, 같은 내용의 요청에 같은 답을 너무나 쉽게 내뱉던 기계가, 같은 내용의 답을 '매번 다를 수 있게' 만드는 매우 신비로운 특성을 만들어냈고, 이러한 결과는 매우 훌륭한 도구임에도 치명적인 단점을 만들어낸다. 

> 서비스는 일관성이 있어야한다. 

무형에서 유형까지, 우리가, 사회가 약속하고 있는 많은 것들이 있는데, 그런 것들 중 하나의 가치는 당연히 '재화를 제공한 서비스는 그 재화 만큼이라고 '느낄 수 있는' 동일한 서비스를 재화를 들인 모두에게 제공해야 한다' 라는 특성이다. 

이러한 일관성이란 특성은 산업마다 그 편차는 있겠지만, 결국 상품이라는 근본적 성격에는 존재해야 한다는 게 우리의 문화속에, 가치 속의 근본적 성질이다.

빙 돌아왔지만, 다시 AI에 대해 돌아오면, 이러한 특성을 고려하게 될 때 매우 치명적인 단점을 AI 로부터 얻을 수 있다. 즉, 1만원을 내고도 어떤 사람의 AI는 유능해 보이지만, 어떤 사람의 AI는 그렇게 보이지 않게 될 수 밖에 없고, 이러한 편차가 존재 하기에 AI 프롬프팅 엔지니어링에 대한 이야기가 나올 수 밖에 없는 것이다. (물론 예전보단 지금은 덜 필요시 되긴 한다.) 

서론이 길었지만, 어쨌든, 결론적으로 AI 는 그렇기에 '정답'에 가깝게 끌어낼 줄 아는가, 일관된 결과를 정확히 도출할 수 있는가? 는 매우 중요한 AI의 성능 지표가 된 것이다. 

### 새로운 프롬프팅 'Slow Thinking'

기존에는 Chain of Thought 라는 방식이 굉장한 파장을 가져왔고, 많은 대형 모델들이 차례차례 방식을 기본값으로 넣으면서, 그 강화된 형태들을 통해 성능의 극대화를 끌어왔다. 'Let's Think Step by Step(단계별로 생각해보자)' 라는 아주 기초적인 프롬프팅 문구일 텐데, 그럼에도 이러한 방식은 유효했다. 

하지만 'slow thinking' 이라는 프롬프팅 문구 

'Take a deep breath and work through this carefully. 

This is a complex strategic decision that requires examining our assumptions...'

라는 문구를 넣으면서 다음 수준의 성능 향상이 있었다고 한다. 

- GPT Slow thinking 적용 시 Chain of Thought 보다 최소 4 ~ 10% 더 정확한 결과를 제공한다. 
- 클로드는 100점 만점 기준 4점의 성과
- 제미나이 역시 8점 높은 결과를 제공함 

해당 내용을 찾아보면, 이러한 결과가 나온 이유는 '관점의 전환' 이라는 차원으로 설명을 했다. 속도보다 정확성을 우선하고, 체계적인 접근을 유도하고, 복잡성의 인식 및 가정 검증을 이야기 하여 사실과 주장을 분해하며, 다층적 분석 유도의 키워드가 포함되어 단순히 단계별로 이미 '결정된 듯' 한 사고 패턴에서 벗어날 수 있었기 때문이다. 

## AI에게 프롬프팅의 의미하는 바는 뭘까? 
프롬프팅을 보면 볼 수록, AI가 언제 잘 이해하는가? AI는 언제 자신의 포텐셜을 100% 활용하는가? 그것은 사람이 어떤 문제, 어떤 상황, 어떤 조건을 어떻게 온전하게 이해하고 있는가?를 '외재화' 시킨 형태와 유사하다는 생각이 든다. 

좀 어렵게 표현 되었는데... 말 그대로 객관적으로 한 사람이 어떤 것들에 대해 온전히 '이해했다' 는 상태를 외부적으로 나타낼 때의 특성이 고려 된게 아닐까? 하는 생각이 드는 것이다. 

사람이 무언가를 이해할 때는, 단계적으로 이해할 때도 있고, 어떨 때는 인과관계를 기반으로 이해할 때도 있으며, 복합적인 다층 관계로 지식 자체도 일종의 구조화를 달성하여 이해하기도 한다. 이러한 뇌내의 정렬 상태는 외부적으로는 '이해했다' 라고 표현할 수 있는 상태가 되고, 이를 기반으로 지식을 설명하거나 공유가 가능하다.

그런데 이러한 언어와 사고의 구조를 설명하는 표현을 LLM의 프롬프터로 넣어줌으로써 그 형태를 AI에게 요구하고, 그러한 구조적 형태가 잡히니 확률의 싸움인 LLM에게 보다 명확한 결과를 도출하는 보정의 작용을 하는게 아닐까?  

그렇다면 앞으로의 AI를 다루는 사람, 혹은 AI를 다루는 도구의 방식은 더더욱 사람, 인류가 쌓아올린 지적 재산, 지적 철학과 방법론을 누가 더 세밀하게 적용하냐, 보정을 정밀하게 해내냐의 싸움이 아닐까? 라는 생각을 하게 된다. 

## 프롬프팅 가이드
부록 느낌이다. 공유해주신 분의 내용에서 발췌했다... 

### 프롬프팅 적용 방법 

| 분류 | 문구 (Phrase) | 효과 (Effect) | 사용 시점 (When to Use) |
|------|---------------|---------------|---------------------------|
|1.단계적 사고 (CoT 기반) | "Let’s think step by step." | 복잡한 문제를 단계별로 명확하게 사고하게 함 (CoT의 기본) | 수학 문제, 로직 설명, 계획 및 전략 설계, 복잡한 지시 이해 |
| 1.단계적 사고 (CoT 기반) | "Show all your reasoning before you answer." | 사고 과정을 투명하게 드러내어 논리적 오류를 줄이고, 사용자가 검토 용이하게 함 | 중간 과정의 논리가 중요한 문제<br>(예: 과학적 추론, 법률적 판단 근거, 디버깅) |
|2.신중함 및 정확성 강조 | "Take a deep breath and work on this carefully." | AI가 서두르지 않고 신중하게 정보를 처리하고 답변하도록 유도 | 오류가 잦거나 민감한 정보를 다룰 때,<br>정밀한 판단이나 높은 정확도가 요구될 때 |
| 2.신중함 및 정확성 강조  | "Let’s take it slow and go through this logically, ensuring each step is sound." | 논리적 흐름을 따라 차분히 문제를 해결하도록 유도하며, 각 단계의 타당성을 강조 | 논증 구성, 토론 준비, 복잡한 시스템 분석,<br>의사결정 로직 수립 시 |
| 2.신중함 및 정확성 강조  | "Take a deep breath and let's work this out in a step-by-step way to be sure we have the right answer." (결합형) | 신중함과 단계적 분석을 동시에 강조하여, 복잡하고 중요한 문제에 대한 답변의 정확성과 신뢰도를 극대화 | 매우 복잡하거나 결과의 파급효과가 큰 중요한 판단 문제, 여러 조건이 얽힌 문제 |
|3.전문가 관점 및 역할 부여 | "Think through this like a top expert in [분야] would. Consider all relevant factors and methodologies they would use." | 특정 분야 최고 전문가의 심층적이고 체계적인 사고방식과 지식 체계를 적용하도록 유도 | 고난이도 전문분야 질문, 특정 역할<br>(예: 의사, 변호사, 과학자)의 관점에서 문제 해결 필요 시 |
|4.불확실성 관리 및 정직성 | "If you are unsure about any part of your answer, please state your uncertainty clearly and explain the reasons for it." | AI가 자신의 지식 한계를 인지하고, 불확실한 정보에 대해 솔직하게 표현하며 그 근거를 제시하도록 유도 | 최신 정보가 반영되지 않았을 가능성이 있거나, 정보의 모호성이 존재할 때, AI가 환각(hallucination)을 일으킬 가능성이 우려될 때 |
|5.심층 분석 및 다각적 고려 | "Let's analyze this issue from multiple perspectives (e.g., economic, social, ethical). What are the pros and cons from each viewpoint?" | 단일 관점에서 벗어나 여러 각도에서 문제를 종합적으로 분석하고 평가하도록 유도 | 사회적 이슈 분석, 정책 결정, 복잡한 딜레마 상황, 전략 수립 시 다양한 이해관계 고려 |
| 5.심층 분석 및 다각적 고려 | "Before proposing a solution, let's first identify the root causes of this problem and any underlying assumptions." | 피상적인 해결책이 아닌, 문제의 근본 원인을 파악하고 숨겨진 가정을 점검하여 더 본질적인 해결책을 찾도록 유도 | 문제 해결 시나리오, 원인 분석이 중요한 과제,<br>장기적인 해결책 모색 |
|6.Step-Back Prompting | "Before answering [구체적 질문 X], let's first consider the general principles or concepts related to [더 넓은 주제 Y]." | 구체적인 문제에 매몰되기 전에, 관련된 일반 원칙이나 배경 지식을 먼저 활성화하여 문제 해결의 맥락과 깊이를 더함 | 특정 사례에 대한 판단, 역사적 사건 분석, 새로운 개념 이해, 복잡한 이론 적용 시 |
|7.자기 비판 및 개선 | "Draft an initial response. Then, critically review your own response for any potential biases, inaccuracies, or areas for improvement. Finally, provide a revised and improved response." | AI가 스스로 생성한 답변을 비판적으로 검토하고 개선하는 과정을 통해 답변의 질을 높임 (자기 교정 능력 향상) | 보고서 초안 작성, 주장 개발, 창의적 글쓰기, 코드 생성 후 디버깅 등 완성도 높은 결과물이 필요할 때 |
|8.문제 분해 및 구조화 | "This is a complex problem. Let's break it down into [3-5] smaller, manageable sub-problems. Address each sub-problem systematically." | 큰 문제를 작고 다루기 쉬운 부분으로 나누어 체계적으로 접근함으로써 해결 가능성을 높임 | 프로젝트 계획, 대규모 시스템 설계, 복잡한 연구 질문 해결, 장문의 글 구성 |

### ⚡️ 효과성 등급표

| 등급 | 기법 | 정확도 향상 | 사용 난이도 |
|------|------|-------------|--------------|
| S급  | 2번 (결합형), 7번 | 매우 높음    | 중간         |
| A급  | 1번, 3번, 8번     | 높음         | 낮음         |
| B급  | 5번, 6번          | 중간-높음    | 중간-높음    |
| C급  | 4번               | 중간         | 낮음         |

### 🎯 상황별 권장 기법

| 상황               | 권장 기법           | 설명                                                              |
|--------------------|----------------------|-------------------------------------------------------------------|
| 📊 수학/계산 문제    | 1번 → 2번            | "Let's think step by step" → "Take a deep breath and work carefully" |
| 🔬 전문적 분석       | 3번 + 5번 + 4번      | 전문가 관점 + 다각적 고려 + 불확실성 관리                         |
| 💼 복잡한 의사결정   | 2번(결합) + 6번 + 7번 | 신중함 강조 + Step-Back + 자기 비판                              |
| 🏗️ 대규모 프로젝트   | 8번 + 5번 + 1번      | 문제 분해 + 근본 원인 분석 + 단계적 사고                         |
