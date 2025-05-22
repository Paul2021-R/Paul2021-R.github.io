# Paul의 기술 블로그

이 저장소는 Jekyll을 기반으로 한 개인 기술 블로그입니다. [Jekyll Theme YAT](https://github.com/jeffreytse/jekyll-theme-yat)를 사용하여 구축되었으며, 개발 경험과 기술적 통찰을 공유하기 위한 공간입니다.

## 블로그 구조

### 기본 정보
- **블로그 유형**: Jekyll 기반 정적 사이트 생성기
- **테마**: jekyll-theme-yat (Yet Another Theme) - 플랫 디자인과 다크 모드를 지원하는 현대적인 테마
- **언어 지원**: 한국어 기본, 다국어 지원 (영어, 중국어, 일본어 등)

### 디렉토리 구조
```
/
├── _config.yml                   # Jekyll 설정 파일
├── _data/                        # 사이트에서 사용하는 데이터 파일
│   ├── defaults.yml              # 기본 설정값 (홈페이지 헤딩 등)
│   └── translate_langs.yml       # 번역 언어 설정
├── _includes/                    # 재사용 가능한 HTML 컴포넌트
├── _layouts/                     # 페이지 레이아웃 템플릿
│   ├── default.html              # 기본 레이아웃
│   ├── home.html                 # 홈페이지 레이아웃
│   ├── post.html                 # 포스트 레이아웃
│   └── ...                       # 기타 레이아웃
├── _posts/                       # 블로그 포스트 디렉토리
│   ├── YYYY-MM/                  # 연도-월 기준 포스트 정리
│   │   └── YYYY-MM-DD-title.md   # 포스트 파일
├── _sass/                        # SCSS 스타일 파일
├── assets/                       # 정적 자원 (이미지, JS, CSS 등)
├── index.html                    # 메인 페이지
└── ...                           # 기타 페이지 (about.html, archives.html 등)
```

### 주요 기능
- **다크 모드**: 자동/수동 다크 모드 전환 기능
- **배너 시스템**: 비디오 또는 이미지를 배너로 사용 가능
- **댓글 시스템**: Utterances를 사용한 GitHub 기반 댓글 기능
- **카테고리 및 태그**: 포스트를 카테고리와 태그로 분류
- **아카이브**: 시간순으로 정렬된 포스트 아카이브
- **반응형 디자인**: 모바일 친화적인 디자인

### 플러그인
- **jekyll-feed**: RSS 피드 생성
- **jekyll-seo-tag**: SEO 최적화
- **jekyll-sitemap**: 사이트맵 생성
- **jekyll-paginate**: 페이지네이션
- **jekyll-spaceship**: 마크다운 확장 기능 제공

## 포스트 작성 방법

새 포스트는 `_posts/YYYY-MM/YYYY-MM-DD-title.md` 형식으로 생성합니다. 각 포스트는 다음과 같은 front matter를 포함해야 합니다:

```yaml
---
layout: post 
title: 포스트 제목
subtitle: 부제목 (선택사항)
categories: 카테고리
tags: 태그1 태그2 태그3
thumb: 썸네일_이미지_URL (선택사항)
custom-excerpt: 사용자 정의 요약 (선택사항)
banner:
  image: 배너_이미지_URL (선택사항)
  opacity: 0.618
  background: "#000"
  height: "100vh"
---

포스트 내용...
```

## 향후 작업 계획

### 1. 콘텐츠 검색 기능 추가

블로그 내 콘텐츠를 쉽게 검색할 수 있는 기능을 추가할 예정입니다:

- **Jekyll Simple Search** 또는 **Algolia** 통합
- 검색 인터페이스 구현
- 검색 결과 하이라이팅
- 관련 검색어 제안

구현 방식:
```yaml
# _config.yml에 추가 예정
simple_search:
  enabled: true
  collections:
    - posts
  json_output_path: "/search.json"
```

### 2. SEO 성능 향상을 위한 PWA 지원

Progressive Web App(PWA) 기능을 추가하여 오프라인 액세스, 향상된 성능 및 모바일 기기에 설치 가능한 기능을 제공할 예정입니다:

- **오프라인 접근성**: 인터넷 연결 없이도 이전에 방문한 페이지 접근 가능
- **모바일 설치 가능**: 홈 화면에 앱처럼 추가 가능
- **향상된 로딩 속도**: 서비스 워커를 통한 콘텐츠 캐싱
- **푸시 알림**: 새 콘텐츠 업데이트 시 알림 기능 (선택적)

구현 방식:
```yaml
# _config.yml에 추가 예정
plugins:
  - jekyll-pwa

pwa:
  enabled: true
  sw_src_filepath: service-worker.js
  sw_dest_filename: service-worker.js
  precache_recent_posts_num: 5
  manifest:
    name: Paul의 기록 보관소
    short_name: Paul's Archives
    theme_color: "#ffffff"
    background_color: "#ffffff"
    display: standalone
    start_url: "/"
```

## 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.