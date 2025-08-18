---
layout: post 
title: memo - blog utterance setting 차이 정리
subtitle: utterance 가 게시글 별로 보이지 않아..?
categories: tools
tags: 생각정리 학습 blog
thumb: /assets/images/posts/2025-08/2025-08-18-001.png
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

## 댓글 이상하다... 뭐지?

댓글이 달렸다. 기술 블로그 운영할 때 정말 가뭄에 콩나듯, 아직 댓글이 많지는 않지만, 와주시는 것만으로도 감사한데... 

문제는 이상하다..

알고보니 모든 댓글이 모든 글에 보인다..!

이상하여 분석하고 정리한 내용이다.

---

## Utterances 댓글 통합 문제 해결

### 원인 분석

원인은 Jekyll 설정 파일(`_config.yml`)의 Utterances `issue_term` 설정에 있었다.

기존 설정은 `issue_term: "blog-comment:"`로 되어 있었는데, 이는 모든 페이지가 'blog-comment:'라는 단 하나의 GitHub Issue를 공유하도록 만든다. 따라서 어떤 글에서 댓글을 달아도 모두 같은 Issue에 저장되어 모든 글에 동일하게 표시되는 것이고 이렇게 되면 어느 글에 댓글을 단 건지 확실히 알기 어렵다 ㅠ..

![](/assets/images/posts/2025-08/2025-08-18-002.png)
> 설마 다른 글로 공유가 될 줄은 몰랐다.

### 해결 방안

이 문제를 해결하기 위해 알아본 결과... gemini 왈 + 검색 결과, 해당 설정의 `issue_term` 값을 각 페이지의 고유한 URL 경로를 사용하도록 변경해야 한다.

-   **기존 설정:** `issue_term: "blog-comment:"`
-   **변경할 설정:** `issue_term: "pathname"`

`pathname`으로 설정하면, Utterances는 각 게시물의 고유 URL 경로(예: `/2025/08/18/post-A.html`)를 제목으로 하는 별도의 GitHub Issue를 생성하고 연결한다.

![](/assets/images/posts/2025-08/2025-08-18-003.png)
> 깔끔하게 해결 완료

### 나름 블로그 jekyll 공부 하고 했다는건데..

아직 부족한게 넘 많다... 화려한 스펙이라고 할만하려면 더 능통해야하는데, 막상 다른 사람들 사이에서 보면 뭐 이리 모르는게 많은지! 🤣