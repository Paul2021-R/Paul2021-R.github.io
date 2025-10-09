---
layout: post 
title: AI 자동화 툴, Opal 맛보기
subtitle: Google 서비스 국내 출시! 한 번 맛을 보자
categories: tools
tags: AI Google Opal Automation
thumb: /assets/images/posts/2025-10/2025-10-09-019.jpg
custom-excerpt: Google 서비스 국내 출시! 한 번 맛을 보자
banner:
  # video: https://vjs.zencdn.net/v/oceans.mp4
  video: https://storage.googleapis.com/gweb-developer-goog-blog-assets/images/Banner_1600_x_476_px_Version_1_Purple_bg.original.png
  loop: true
  volume: 0.8
  muted: true                 # For mobile device background music play 
  start_at: 8.5
  image: https://storage.googleapis.com/gweb-developer-goog-blog-assets/images/Banner_1600_x_476_px_Version_1_Purple_bg.original.png
  opacity: 0.618
  background: "#000"
  height: "100vh"
  min_height: "38vh"
  heading_style: "font-size: 4.25em; font-weight: bold; text-decoration: underline"
  subheading_style: "color: gold"
---

![](/assets/images/posts/2025-10/2025-10-09-018.png)

## AI 워크플로우의 새로운 가능성, Google Opal

드디어 AI가 단발성 대화를 넘어 연속적인 작업 흐름을 처리할 수 있게 됐다. Google Labs에서 공개한 Opal은 **프롬프트, AI 모델, 도구를 연결해 다단계 워크플로우를 만들 수 있는 노코드 플랫폼**이다. 지금까지 AI가 부족했던 '시퀀스' 개념을 드디어 제대로 구현한 셈이다.

### 그동안 AI에게 없었던 것: 단계별 사고

ChatGPT든 Gemini든, 대부분의 AI 서비스는 기본적으로 "질문 → 답변" 구조다. 물론 멀티턴 대화가 가능하긴 하지만, 복잡한 작업을 여러 단계로 나눠서 자동으로 처리하기엔 한계가 있었다. 예를 들어 "특정 주제로 블로그 초안 작성 → 이미지 생성 → SEO 최적화 → 최종 정리" 같은 워크플로우를 만들려면 결국 사람이 중간중간 개입해야 했다.

Opal은 바로 이 지점을 공략했다. 공식 블로그에 따르면, **"프롬프트, AI 모델 호출 및 기타 도구를 연결하여 강력한 다단계 앱을 제작할 수 있도록 지원"**한다고 명시되어 있다[^1]. 실제로 User Input(사용자 입력) → Generate(AI 생성) → Output(결과 출력) 단계를 조합하고, 각 단계의 결과를 다음 단계에서 참조할 수 있다. 이를 "단계 연결(Step Chaining)"이라고 부르는데, 드래그 앤 드롭이나 @ 기호로 간단히 구현 가능하다[^2].

더 인상적인 건 두 가지 편집 모드를 제공한다는 점이다. 자연어로 "이런 앱 만들어줘" 하면 Opal이 알아서 워크플로우를 구성해주고, 세부 조정은 비주얼 편집기에서 할 수 있다. 코드를 전혀 볼 필요가 없다[^3]. 2024년 10월 업데이트에서는 **단계별 디버깅 기능**과 **병렬 실행 기능**까지 추가되어, 복잡한 워크플로우도 실시간으로 테스트하고 개선할 수 있게 됐다[^4].

### 노코드의 장점이자 한계

![](/assets/images/posts/2025-10/2025-10-09-020.png)

Opal의 가장 큰 장점은 진입장벽이 낮다는 것이다. 자연어만 사용할 줄 알면 누구나 AI 앱을 만들 수 있고, Google이 호스팅까지 해주니 링크 하나로 바로 공유할 수 있다. 갤러리에서 다른 사람이 만든 앱을 리믹스해서 내 것으로 만들 수도 있다.

![](/assets/images/posts/2025-10/2025-10-09-021.png)
> 현재는 아주 심플한 동작들만을 지원하고 있다

하지만 여기서 아쉬운 점이 드러난다. **외부 서비스 연동이 제한적**이다. 현재 기본 제공되는 도구는 웹 검색, 지도 검색, 날씨 정보 정도이고, Google Drive 정도만 직접 연동된다[^5]. Notion, Slack, Trello 같은 다른 서비스와의 자동화는 아직 지원되지 않는다. Zapier나 Make.com처럼 수백 개의 서비스를 연결할 수 있는 수준엔 한참 못 미친다.

더 치명적인 건 **코드 내보내기가 불가능**하다는 점이다. Opal에서 만든 앱은 Google 생태계 안에 갇혀 있다. API를 만들 수도 없고, 데이터베이스를 붙일 수도 없으며, 실제 배포 가능한 코드를 얻을 수도 없다[^6]. 결국 프로토타이핑이나 간단한 사내 도구 정도로만 활용 가능하다는 얘기다. 프로덕션용으로 쓰기엔 아직 갈 길이 멀다.

### Obsidian에서 했던 것들을 자동화할 수 있을까?

개인적으로 흥미로웠던 건, 이전에 Obsidian + 코파일럿 플러그인으로 시도했던 것들이 떠올랐다는 점이다([참고 링크](https://paul2021-r.github.io/%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8/2025/10/09/01-obsidian-ai-copilot.html)). 당시엔 노트 글감을 준비하고, 특정 패턴 명령어를 적용하고, 글감을 나의 문체에 맞는 글감으로 만들어주는 워크플로우를 만들려고 했다. 하지만 결과적으로 수동으로 트리거를 해야 했고, 여러 단계를 거치려면 계속 개입해야 했다.

Opal의 시퀀스 기능을 보니, 이런 것들을 완전히 자동화할 수 있겠다는 생각이 들었다. 예를 들어 "웹에서 특정 주제 검색 → 요약 생성 → 이미지 생성 → 마크다운 포맷으로 정리 → Google Drive에 저장" 같은 흐름을 하나의 앱으로 만들 수 있을 것 같다. 물론 Obsidian과 직접 연동되진 않지만, Google Drive를 중간 저장소로 쓰면 충분히 가능할 것 같다.

문제는 앞서 말한 외부 서비스 연동의 한계다. 만약 Opal이 Notion API, Obsidian Local REST API, 혹은 더 나아가 커스텀 웹훅 정도만 지원해준다면, 정말 강력한 자동화 허브가 될 수 있을 텐데 말이다. 지금은 Google 생태계 안에서만 놀 수 있다는 점이 가장 아쉽다.(물론 그게 목적이겠지만 말이다.)

### 결론: 가능성은 보였지만, 아직은 반쪽짜리

Opal은 분명히 AI의 새로운 방향을 제시했다. **시퀀스, 워크플로우, 단계별 자동화**—이것들은 AI가 단순한 챗봇을 넘어 진짜 생산성 도구가 되기 위해 반드시 필요한 요소들이다. 노코드로 이런 걸 구현했다는 점에서 Opal은 충분히 혁신적이다.

하지만 현실적으로 프로덕션 환경에서 쓰기엔 한계가 명확하다. 외부 서비스 연동이 제한적이고, 코드를 내보낼 수도 없으며, 아직은 실험적 도구라는 꼬리표를 떼지 못했다. Google Labs 프로젝트가 언제 접힐지 모른다는 불안감도 있다.

그럼에도 불구하고, Opal이 보여준 방향성은 분명하다. AI는 이제 단발성 대화를 넘어 연속적인 워크플로우를 이해하고 실행해야 한다. 그리고 누구나 코딩 없이 그런 자동화를 만들 수 있어야 한다. Opal이 완벽하진 않지만, 그 미래를 먼저 보여준 건 확실하다.

만약 Google이 이 프로젝트를 제대로 밀어붙여서 외부 API 연동과 코드 내보내기 기능까지 추가한다면? 그때는 정말 게임 체인저가 될 수 있을 것 같다.

---

[^1]: [Google 개발자 블로그 (한국어) - Opal 소개](https://developers.googleblog.com/ko/introducing-opal/): "프롬프트, AI 모델 호출 및 기타 도구를 연결하여 강력한 다단계 앱을 제작할 수 있도록 지원합니다."

[^2]: [Google Opal 공식 문서 - Overview](https://developers.google.com/opal/overview): "Referencing the results of one step in the prompt for another step is the primary way to build your app logic inside of Opal."

[^3]: [Google 개발자 블로그 (영어) - Introducing Opal](https://developers.googleblog.com/en/introducing-opal/): "Opal translates your instructions into a visual workflow, giving you fine-grained control without ever needing to see a line of code."

[^4]: [Google Labs Blog - Opal Expansion](https://blog.google/technology/google-labs/opal-expansion/): "We've fundamentally improved the debugging program... You can now run your workflow step-by-step in the visual editor"

[^5]: Google 개발자 블로그 및 공식 문서에서 확인된 빌트인 도구 목록: 웹 검색, 지도 검색, 날씨 정보, Google Drive 연동

[^6]: 커뮤니티 피드백 및 공식 문서 기반: Opal 앱은 Google 생태계 내에 제한되며, 코드 내보내기, API 생성, 데이터베이스 통합 등이 불가능함