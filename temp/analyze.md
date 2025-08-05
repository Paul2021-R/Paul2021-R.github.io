# 프로젝트 기술 스택 분석 (Project Technology Stack Analysis)

이 프로젝트는 Jekyll 기반의 블로그이며, 다음과 같은 기술 스택을 사용하고 있습니다.

## 1. 핵심 기술 (Core Technologies)

*   **Jekyll**: 정적 사이트 생성기 (Static Site Generator)로 블로그의 핵심 엔진입니다.
    *   버전: `> 3.5`, `< 5.0`
*   **Ruby**: Jekyll이 Ruby 기반이므로, Ruby 언어가 사용됩니다.
    *   버전: `3.1` (Dockerfile 기준)
*   **jekyll-theme-yat**: 프로젝트에 적용된 테마입니다.

## 2. Jekyll 플러그인 및 의존성 (Jekyll Plugins & Dependencies)

`_config.yml` 및 `jekyll-theme-yat.gemspec` 파일을 통해 다음과 같은 Jekyll 플러그인 및 Ruby Gem들이 사용됨을 확인했습니다.

*   **jekyll-feed**: RSS 피드 생성을 위한 플러그인
*   **jekyll-seo-tag**: SEO 최적화를 위한 플러그인
*   **jekyll-sitemap**: 사이트맵 생성을 위한 플러그인
*   **jekyll-paginate**: 페이지네이션 기능을 위한 플러그인
*   **jekyll-spaceship**: 마크다운 확장 및 기타 유틸리티를 제공하는 플러그인
*   **kramdown**: 마크다운 (Markdown) 렌더링 엔진
*   **Bundler**: Ruby Gem 의존성 관리를 위한 도구
*   **Rake**: Ruby 빌드 자동화 도구 (개발 의존성)

## 3. 외부 서비스 및 통합 (External Services & Integrations)

*   **Google Analytics (GA4)**: 웹사이트 트래픽 및 사용자 행동 분석을 위한 서비스
*   **Google Translate**: 다국어 번역 기능을 위한 서비스
*   **Utterances**: GitHub Issues를 기반으로 하는 댓글 시스템 (활성화됨)
    *   Disqus, Gitment도 설정 파일에 언급되어 있으나, 현재 Utterances가 사용 중입니다.

## 4. 개발 및 배포 환경 (Development & Deployment Environment)

*   **Docker**: `Dockerfile`을 통해 컨테이너 기반의 개발 및 배포 환경을 구성합니다.
    *   `ruby:3.1` 이미지를 기반으로 합니다.
    *   `apt-get`을 사용하여 `build-essential`과 같은 기본 패키지를 설치합니다.
*   **Bash**: Docker 컨테이너 내에서 명령 실행을 위해 사용됩니다.

## 5. 콘텐츠 주제 (Content Topics)

`_posts` 디렉토리의 파일명들을 분석한 결과, 주로 다음과 같은 주제의 글들이 작성되고 있음을 알 수 있습니다.

*   **AI (인공지능)**: Google AI 트렌드, Transformer, GPT, DeepSeek, Naver Boost AI, Gemini CLI 등 AI 관련 심층 분석 및 소개 글이 다수입니다.
*   **백엔드 개발 (Backend Development)**: NestJS, Node.js, Groovy, Jenkins 등 백엔드 프레임워크 및 기술에 대한 내용이 포함됩니다.
*   **클라우드 (Cloud)**: EKS, Lambda, CloudWatch 등 클라우드 서비스 및 아키텍처에 대한 내용이 포함됩니다.
*   **프로그래밍 일반 (General Programming)**: 프로그래밍 원칙, 컴파일러 비교 등 일반적인 프로그래밍 주제도 다룹니다.

## 결론 (Conclusion)

이 `github.io-jekyll` 프로젝트는 Jekyll을 기반으로 한 기술 블로그로, Ruby와 다양한 Jekyll 플러그인을 활용하여 기능을 확장하고 있습니다. Google Analytics, Google Translate, Utterances와 같은 외부 서비스를 통합하여 사용자 경험을 향상시키고 있으며, Docker를 통해 개발 및 배포 환경을 효율적으로 관리합니다. 블로그 콘텐츠는 주로 AI, 백엔드 개발, 클라우드 컴퓨팅 등 최신 기술 트렌드에 초점을 맞추고 있습니다.