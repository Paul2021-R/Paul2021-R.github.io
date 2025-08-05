# 프로젝트 구조 개요 (Project Structure Overview)

이 문서는 `github.io-jekyll` 프로젝트 내의 주요 디렉토리와 그 목적을 설명합니다. 이 구조를 이해하는 것은 향후 유지보수 및 개선에 중요합니다.

## 최상위 파일 (Top-Level Files)

*   `_config.yml`: Jekyll의 주요 설정 파일 (main configuration file).
*   `.editorconfig`: 일관된 코딩 스타일을 위한 에디터 설정 (editor configuration).
*   `.gitignore`: Git에서 추적하지 않을 파일을 지정합니다.
*   `404.html`, `about.html`, `archives.html`, `categories.html`, `index.html`, `tags.html`: 웹사이트의 핵심 정적 페이지 (core static pages).
*   `docker-compose.yml`, `Dockerfile`: 개발 환경을 위한 Docker 관련 설정 (Docker related configuration).
*   `Gemfile`, `jekyll-theme-yat.gemspec`: 의존성 관리를 위한 RubyGems 및 Jekyll 테마 관련 파일 (dependency management).
*   `LICENSE.txt`: 프로젝트 라이선스 (project license).
*   `README.md`: 프로젝트 README 파일.

## 디렉토리 (Directories)

### `_data/`
기본 설정 (`defaults.yml`) 및 번역 언어 (`translate_langs.yml`)와 같은 사이트 전체 데이터를 위한 YAML 파일을 포함합니다.

### `_includes/`
레이아웃 및 게시물에 포함될 수 있는 재사용 가능한 HTML 스니펫을 저장합니다.
*   `custom-head.html`, `functions.html`, `head.html`: 페이지 헤더 및 유틸리티 함수를 위한 일반적인 포함 파일 (general includes).
*   `extensions/`: `click-to-top.html`, `code-highlight.html`, `google-analytics.html`, `theme-toggle.html` 및 댓글 시스템 (`comments/`)과 같은 다양한 확장 기능을 포함합니다.
*   `functions/`: `get_article_excerpt.html`, `get_banner.html`, `get_categories.html` 등과 같은 특정 유틸리티 함수를 포함합니다.
*   `sidebar/`: `archive-list.html`, `category-list.html`, `tag-list.html`과 같은 사이드바 구성 요소를 포함합니다.
*   `views/`: `article.html`, `footer.html`, `header.html`, `pagination.html`, `post-item.html`과 같은 더 큰 뷰 구성 요소를 포함합니다.

### `_layouts/`
다양한 유형의 페이지에 대한 템플릿을 정의합니다.
*   `default.html`, `framework.html`: 기본 레이아웃 (base layouts).
*   `home.html`, `post.html`, `articles.html`: 홈페이지, 개별 게시물 및 아티클 목록을 위한 레이아웃 (layouts).
*   `404.html`, `about.html`, `archives.html`, `categories.html`, `tags.html`: 특정 정적 페이지를 위한 레이아웃.

### `_posts/`
연도 및 월별로 정리된 모든 블로그 게시물을 포함합니다. 각 게시물은 마크다운 (Markdown) 파일입니다.
*   `YYYY/MM/YYYY-MM-DD-post-title.md`: 게시물에 대한 표준 명명 규칙 (standard naming convention).
*   `image.png`: 게시물 디렉토리 내에 직접 있는 이미지의 예시.

### `_sass/`
웹사이트 스타일링을 위한 Sass (SCSS) 파일을 포함합니다.
*   `_custom.scss`, `yat.scss`: 주요 스타일 파일 (main style files).
*   `misc/`: 기타 구성 요소 및 확장 기능을 위한 스타일.
*   `yat/`: 기본, 다크 모드 및 레이아웃별 스타일을 포함한 핵심 테마 스타일 (core theme styles).

### `_site/`
이 디렉토리는 Jekyll에 의해 생성되며 컴파일된 정적 웹사이트를 포함합니다. 수동으로 편집해서는 안 됩니다.

### `.git/`
Git 저장소 메타데이터 (repository metadata).

### `.jekyll-cache/`
더 빠른 빌드 시간을 위한 Jekyll의 캐시 디렉토리 (cache directory).

### `assets/`
CSS, JavaScript 및 이미지와 같은 정적 자산 (static assets)을 저장합니다.
*   `css/`: 컴파일된 CSS 파일 (예: `main.scss`).
*   `images/`: 기본 이미지, 파비콘, 섹션별로 정리된 이미지 (`about/`, `banners/`, `posts/`)를 포함하여 사이트에서 사용되는 모든 이미지.
*   `js/`: JavaScript 파일 (예: `main.js`).

### `temp/`
테스트 또는 초안용으로 보이는 다양한 마크다운 파일을 포함하는 임시 디렉토리 (temporary directory).
