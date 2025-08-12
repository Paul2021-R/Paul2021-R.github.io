# 유튜브 썸네일 다운로더 Jekyll 블로그 통합 방법 (Youtube Thumbnail Downloader Jekyll Blog Integration Method)

이 문서는 Jekyll 기반의 정적 웹사이트에 별도의 JavaScript (Vite) 프로젝트인 '유튜브 썸네일 다운로더'를 통합하는 과정을 설명합니다.

## 1. 통합 목표 및 Jekyll의 특성 이해 (Understanding Integration Goal and Jekyll's Characteristics)

*   **목표:** 독립적인 JavaScript 웹 애플리케이션을 Jekyll 블로그 내 특정 페이지에서 구동되도록 합니다.
*   **Jekyll의 특성:** Jekyll은 마크다운 파일과 Liquid 템플릿을 사용하여 정적인 HTML, CSS, JavaScript 파일을 생성하는 '정적 사이트 생성기(Static Site Generator)'입니다. 동적인 서버 환경이나 JavaScript 런타임을 직접 제공하지 않습니다. 따라서, 복잡한 JavaScript 애플리케이션을 마크다운 파일 내에서 직접 '구동'하는 것은 불가능합니다.

## 2. `<iframe>`을 사용한 통합 방식 (Integration Method using `<iframe>`)

Jekyll의 특성상, 외부 JavaScript 애플리케이션을 통합하는 가장 효과적인 방법은 애플리케이션을 별도로 빌드하여 정적 파일로 만든 후, Jekyll 페이지에서 `<iframe>` 태그를 사용하여 해당 애플리케이션을 임베드(embed)하는 것입니다.

## 3. 단계별 통합 과정 (Step-by-Step Integration Process)

### 3.1. 외부 프로젝트 클론 (Clone External Project)

먼저, 통합하려는 '유튜브 썸네일 다운로더' 프로젝트를 로컬 환경에 복제합니다.

```bash
git clone https://github.com/marshallku/Youtube-Thumbnail-Downloader.git ./temp/tools/youtube-downloader
```
*   **경로:** `/Users/hansolr/workspace/github.io-jekyll/temp/tools/youtube-downloader`

### 3.2. 외부 프로젝트 빌드 (Build External Project)

복제된 프로젝트는 Node.js 기반이므로, Jekyll에 통합하기 전에 프로덕션용 정적 파일로 빌드해야 합니다.

```bash
cd /Users/hansolr/workspace/github.io-jekyll/temp/tools/youtube-downloader
npm install
npm run build
```
*   이 명령어를 실행하면 프로젝트의 의존성이 설치되고, `dist` 디렉토리(기본값)에 빌드된 정적 파일들(HTML, CSS, JavaScript)이 생성됩니다.

### 3.3. 빌드 결과물 Jekyll `assets` 디렉토리로 복사 (Copy Build Results to Jekyll `assets` Directory)

생성된 `dist` 디렉토리의 내용을 Jekyll이 웹사이트로 서빙할 수 있는 `assets` 디렉토리 아래의 특정 경로로 복사합니다.

```bash
mkdir -p /Users/hansolr/workspace/github.io-jekyll/assets/tools/youtube-downloader
cp -R /Users/hansolr/workspace/github.io-jekyll/temp/tools/youtube-downloader/dist/* /Users/hansolr/workspace/github.io-jekyll/assets/tools/youtube-thumbnail-downloader/
```
*   **복사 경로:** `/Users/hansolr/workspace/github.io-jekyll/assets/tools/youtube-downloader/`

### 3.4. Jekyll 페이지 생성 및 `<iframe>` 삽입 (Create Jekyll Page and Embed `<iframe>`)

새로운 Jekyll 페이지를 생성하고, 이 페이지에서 복사된 애플리케이션의 `index.html` 파일을 `<iframe>` 태그를 통해 로드하도록 설정합니다.

*   **파일 경로:** `/Users/hansolr/workspace/github.io-jekyll/youtube-thumbnail-downloader.html`
*   **파일 내용:**
    ```html
    ---
    layout: default
    title: 유튜브 썸네일 추출기
    permalink: /youtube-thumbnail-downloader/
    ---

    <iframe src="/assets/tools/youtube-downloader/index.html" style="width:100%; height:800px; border:none;"></iframe>
    ```
*   `permalink`를 설정하여 `/youtube-thumbnail-downloader/` 경로로 접근할 수 있도록 합니다.
*   `<iframe>`의 `src`는 3.3단계에서 복사한 `index.html`의 웹 접근 경로를 정확히 가리켜야 합니다.

### 3.5. 핵심 문제 해결: Vite `base` 경로 설정 (Crucial Fix: Vite `base` Path Configuration)

`<iframe>` 내의 애플리케이션이 정상적으로 구동되지 않는다면, 이는 `index.html` 내부에서 참조하는 JavaScript, CSS, 이미지 등의 상대 경로가 잘못되었기 때문일 수 있습니다. Vite는 기본적으로 루트 경로를 기준으로 자산을 참조하므로, Jekyll의 서브 디렉토리에서 서빙될 때는 경로 문제가 발생합니다.

이 문제를 해결하기 위해, '유튜브 썸네일 다운로더' 프로젝트의 `vite.config.ts` 파일에 `base` 옵션을 추가하여 빌드 시 모든 정적 자산의 경로가 올바르게 생성되도록 합니다.

*   **파일 경로:** `/Users/hansolr/workspace/github.io-jekyll/temp/tools/youtube-downloader/vite.config.ts`
*   **파일 내용 수정:**
    ```typescript
    import { defineConfig } from "vite";

    // https://vitejs.dev/config/
    export default defineConfig({
      base: '/assets/tools/youtube-downloader/' // 이 줄을 추가
    });
    ```
*   `base` 경로는 Jekyll이 해당 애플리케이션을 서빙할 최종 경로와 일치해야 합니다.

### 3.6. 프로젝트 재빌드 및 복사 (Rebuild and Recopy Project)

`vite.config.ts`를 수정한 후에는 프로젝트를 다시 빌드하고, 새로 빌드된 `dist` 내용을 Jekyll `assets` 디렉토리로 다시 복사해야 합니다.

```bash
cd /Users/hansolr/workspace/github.io-jekyll/temp/tools/youtube-downloader
npm install # 변경된 설정이 있다면 다시 설치
npm run build
cp -R dist/* /Users/hansolr/workspace/github.io-jekyll/assets/tools/youtube-downloader/
```

### 3.7. `<iframe>` 수직 길이 및 JavaScript 구동 문제 해결 (Fixing `<iframe>` Vertical Length and JavaScript Loading Issues)

`<iframe>`의 `height` 속성을 명시했음에도 불구하고 내부 콘텐츠가 충분히 길게 표시되지 않거나 JavaScript가 구동되지 않는 문제는 주로 다음 두 가지 원인 때문입니다.

1.  **JavaScript 파일 로드 실패:** `<iframe>` 내부의 `index.html`이 참조하는 JavaScript 파일의 경로가 잘못되어 로드되지 않는 경우입니다. 이는 3.5단계의 Vite `base` 경로 설정으로 해결됩니다.
2.  **내부 콘텐츠의 높이 설정 부족:** `<iframe>` 자체의 높이가 충분하더라도, 그 안에 로드되는 애플리케이션의 `html`, `body`, 또는 최상위 컨테이너 (`#app`) 요소의 CSS `height` 또는 `min-height` 속성이 제대로 설정되어 있지 않으면, 콘텐츠가 `<iframe>`의 전체 높이를 채우지 못하고 짧게 보일 수 있습니다.

이 문제를 해결하기 위해, '유튜브 썸네일 다운로더' 프로젝트의 CSS 파일에 `html`, `body`, `#app` 요소의 높이 관련 스타일을 추가해야 합니다.

*   **파일 경로:** `/Users/hansolr/workspace/github.io-jekyll/temp/tools/youtube-downloader/src/css/style.css`
*   **파일 내용 수정:**
    `body` 태그에 대한 기존 스타일 위에 다음 내용을 추가합니다.
    ```css
    html, body {
        height: 100%;
    }

    body {
        /* 기존 body 스타일 유지 */
        background-color: var(--background-color);
        color: var(--font-color);
        padding: 30px;
    }

    #app {
        min-height: 100%;
        display: flex; /* flexbox를 사용하여 내부 콘텐츠가 공간을 채우도록 */
        flex-direction: column; /* 세로 방향으로 정렬 */
        justify-content: center; /* 수직 중앙 정렬 (필요시) */
        align-items: center; /* 수평 중앙 정렬 (필요시) */
    }
    ```
*   **수정 후 재빌드 및 복사:**
    CSS 파일을 수정한 후에는 3.6단계와 동일하게 프로젝트를 다시 빌드하고, 새로 빌드된 `dist` 내용을 Jekyll `assets` 디렉토리로 다시 복사해야 합니다.

    ```bash
    cd /Users/hansolr/workspace/github.io-jekyll/temp/tools/youtube-downloader
    npm run build
    cp -R dist/* /Users/hansolr/workspace/github.io-jekyll/assets/tools/youtube-downloader/
    ```

## 5. Jekyll 서버 재시작 및 확인 (Restart Jekyll Server and Verify)

모든 변경사항을 적용한 후, Jekyll 서버를 재시작하여 웹사이트에서 변경된 내용을 확인합니다.

```bash
bundle exec jekyll serve
```

이 과정을 통해 외부 JavaScript 애플리케이션을 Jekyll 블로그에 성공적으로 통합하고, `<iframe>`의 높이 및 JavaScript 구동 문제를 해결할 수 있습니다.