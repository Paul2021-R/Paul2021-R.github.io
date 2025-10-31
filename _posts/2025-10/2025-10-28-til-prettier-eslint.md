---
layout: post 
title: TIL - Prettier & ESLint 적용
subtitle: nextjs 기반 앱을 무중단 배포 구성하기
categories: 학습
tags: 학습 NextJS DevOps Jenkins Docker
thumb: /assets/images/assets/251031-003-prettier-eslint.png
custom-excerpt: 2025년 10월 28일 개발 내용 요약 및 학습 정리
banner:
  # video: https://vjs.zencdn.net/v/oceans.mp4
  loop: true
  volume: 0.8
  muted: true                 # For mobile device background music play 
  start_at: 8.5
  image: /assets/images/assets/251031-002-prettier-eslint.png
  opacity: 0.318
  background: "#000"
  height: "100vh"
  min_height: "38vh"
  heading_style: "font-size: 4.25em; font-weight: bold; text-decoration: underline"
  subheading_style: "color: gold"
---

## 2025-10-28 : Prettier & ESLint 설정 in Next.js Project

오늘은 Next.js 프로젝트 (`project-mini-frontend/app`)에 코드 포매터인 **Prettier**와 린터인 **ESLint**를 설정하고, 두 도구가 충돌 없이 협력하도록 연동을 적용하고 개념에 대해 학습했다. 

---

### 1. Prettier 설정 💅

코드 스타일의 일관성을 자동으로 유지하기 위해 Prettier를 도입했다.

- **설치:** `pnpm`을 사용하여 `prettier`와 ESLint와의 충돌 방지용 `eslint-config-prettier`를 개발 의존성으로 설치했다.
    ```Bash
    cd app
    pnpm add -D prettier eslint-config-prettier
    ```
	![](/assets/images/til/25-10/251031-001.png)
> 프로젝트 구조 때문에 app 에 들어가서 해야 하는게 귀찮다... 
    
- **설정 파일 (`.prettierrc.json`):** 프로젝트 루트(`app/`)에 설정 파일을 생성하여 팀의 코드 포매팅 규칙(세미콜론, 따옴표, 줄 바꿈 등)을 정의했다. 우선은 가장 추천하는 설정값을 그대로 적용시켰다.
    ```JSON
    // .prettierrc.json
    {
      "semi": true, // 끝에 세미 콜론으로 종료 표시 
      "trailingComma": "all", // 객체, 배열의 여러줄로 나열 시 마지막 항목 뒤에도 쉼표 붙이기 
      "singleQuote": true,// 자스에서 문자열은 무조건 작은따옴표로 통일 
      "printWidth": 80, // 코드 한줄의 최대 길이를 80자로 제어 
      "tabWidth": 2, // 들여쓰기는 스페이스 2칸 
      "endOfLine": "auto" // 줄바꿈 스타일을 OS에 맞춰 자동화 
    }
    ```
	![](/assets/images/til/25-10/251031-004.png)

- **무시 파일 (`.prettierignore`):** `node_modules`, `.next` 등 포매팅 대상에서 제외할 파일 및 폴더를 지정하는 파일을 생성했다. 설정을 안하니 빌드된 결과물까지도 판단하기에 특히 dist, build 폴더 등은 반드시 해둬야 한다. 
    ```
	    # .prettierignore
	    node_modules
	    .next
	    .pnpm-store
	    dist
	    build
	    public
    ```
	![](/assets/images/til/25-10/251031-005.png)
	![](/assets/images/til/25-10/251031-006.png)

- **`package.json` 스크립트 추가:** 코드 포매팅을 실행(`format`)하거나 검사(`format:check`)하는 스크립트를 추가했다. CI에서는 주로 `format:check`를 사용한다. 특히 `format:check`의 추가는 Jenkins 기반의 무중단 배포 전 테스트를 위한 용도이다. 
    ```JSON
    // package.json scripts
    "scripts": {
      // ...
      "format": "prettier --write .",
      "format:check": "prettier --check ."
    },
    ```
    ![](/assets/images/til/25-10/251031-007.png)
	![](/assets/images/til/25-10/251031-008.png)
	> 깔끔하게 에러 체킹이 되는것 까지 확인하였고, Jenkins 무중단 배포에서 해당 검사 기능을 추가하였다.

---

### 2. ESLint와 Prettier 연동 🤝

ESLint(코드 품질)와 Prettier(코드 스타일)는 일부 규칙(예: 줄 길이, 따옴표)이 겹쳐 충돌할 수 있다. 이를 해결하기 위해 `eslint-config-prettier`를 사용하여 ESLint의 스타일 관련 규칙을 비활성화하고, 스타일링은 전적으로 Prettier에게 맡기는 걸로 수정하였다.

- **`eslint.config.mjs` 설정:** ESLint 설정 파일(`app/eslint.config.mjs`)에서 `eslint-config-prettier`를 `import`하고, 설정 배열의 **맨 마지막**에 추가하여 Prettier와 충돌하는 ESLint 규칙을 껐다.
    ```JavaScript
    // eslint.config.mjs
    import prettierConfig from 'eslint-config-prettier';
    
    export default [
      // ... (기존 ESLint 설정들)
    
      // 맨 마지막에 추가하여 스타일 규칙 충돌 방지
      prettierConfig, 
    ];
    ```
    
- **역할 분담:** 자꾸 헷갈리는 부분이기에 정리해보면...
    - **ESLint:** 코드의 논리적 오류, 잠재적 버그, 안티 패턴 등 **코드 품질**에 집중.
    - **Prettier:** 들여쓰기, 줄 바꿈, 따옴표 등 오직 **코드 스타일**만 관리.
        

---

### 3. ESLint 검사 범위 설정 (Ignoring Files) 🚫

ESLint가 불필요한 파일(예: 빌드 결과물)을 검사하지 않도록 설정했다.

- **문제:** 기본 설정에서는 `pnpm lint` 실행 시 Next.js의 빌드 폴더인 `.next/` 내부까지 검사하는 문제가 있다.
    
- **해결 (`eslint.config.mjs`):** ESLint의 최신 설정 방식(Flat Config)에서는 `.eslintignore` 파일 대신, `eslint.config.mjs` 파일 내부에 `ignores` 속성을 사용하여 무시할 경로를 직접 지정 가능하다. 설정 배열의 **앞부분**에 추가하여 전역적으로 적용했다.
    
    ```JavaScript
    // eslint.config.mjs
    import prettierConfig from 'eslint-config-prettier';
    
    export default [
      // ignores 설정을 배열 앞부분에 추가
      {
        ignores: [
          'node_modules/**', // node_modules 폴더
          '.next/**',        // Next.js 빌드 폴더
          'public/**',       // public 폴더 (선택 사항)
        ],
      },
    
      // ... (기존 설정들)
      prettierConfig,
    ];
    
    ```

---

## 질문 정리 
### ESLint와 Prettier의 관계 및 연동할 필요가 있을까?  

ESLint와 Prettier는 현대 웹 개발 환경에서 코드의 일관성과 품질을 유지하기 위해 사용되는 핵심 도구이다. 두 도구는 목적이 다르지만, 일부 기능 영역이 겹쳐 충돌이 발생할 수 있다고 한다. 따라서 이 둘을 올바르게 연동하여 각자의 역할을 명확히 분리하는 것이 중요하고 그래서 차이를 이해해야 한다.

---

#### 각 도구의 핵심 역할

##### ESLint (린터, Linter)

ESLint는 코드의 **품질(Quality)** 을 검사하는 도구다. 주요 목적은 잠재적인 버그나 안티 패턴을 찾아내어 코드의 논리적 오류를 방지하는 것이다.
- **주요 기능**:
    - 문법 오류 검사
    - 사용되지 않는 변수 탐지
    - `React Hooks`의 잘못된 사용 등 프레임워크 규칙 검사
    - 논리적 안티 패턴 식별

##### Prettier (코드 포매터, Code Formatter)

Prettier는 코드의 **스타일(Style)** 을 통일하는 도구이다. 코드가 어떻게 "보이는지"에만 집중하며, 매우 '독단적인(Opinionated)' 규칙을 적용하여 모든 개발자가 동일한 코드 서식을 갖도록 강제한다.

- **주요 기능**:
    - 들여쓰기 (예: 2칸 공백)
    - 문자열 따옴표 통일 (예: 작은따옴표)
    - 줄 바꿈 (예: 80자 초과 시)
    - 세미콜론(;) 자동 추가 또는 제거

---

#### 연동의 필요성: 규칙의 충돌

문제는 ESLint의 규칙 중에도 코드 스타일을 다루는 부분이 있다는 것이다. (예: `max-len` (최대 줄 길이), `semi` (세미콜론 사용 여부), `quotes` (따옴표 종류) 등)

만약 두 도구를 별다른 설정 없이 함께 사용하면, 동일한 코드 스타일에 대해 서로 다른 규칙을 강요하며 충돌하게 된다.

- **충돌 예시**:
    - **ESLint 규칙**: "한 줄은 최대 100자까지 허용한다."
    - **Prettier 규칙**: "한 줄은 80자가 넘으면 무조건 줄 바꿈한다."
    - **결과**: 개발자가 90자 코드를 작성하면, Prettier는 강제로 줄을 바꾸고, ESLint는 이 변경이 불필요하다고 판단하거나 그 반대의 상황이 발생하여, 저장 시마다 코드가 계속 변경되거나 에러가 발생한다.

---

#### 해결 방안: `eslint-config-prettier`

이 충돌을 해결하기 위해 `eslint-config-prettier` 패키지를 사용한다.

이 패키지의 유일한 역할은 **ESLint의 규칙 중 Prettier와 겹치는 모든 스타일 관련 규칙을 비활성화(off)** 하는 것이다.

이를 통해 코드 스타일에 대한 제어권은 100% Prettier에게 위임하고, ESLint는 오직 코드 품질 검사에만 집중하도록 역할을 명확히 분리할 수 있다.

---

#### 최종 역할 분담

올바르게 연동된 환경에서의 최종 역할은 다음과 같다.

- **ESLint**: 코드의 **논리적 품질**만 검사한다.
    - (예: "이 변수는 사용되지 않았습니다.", "React Hook의 의존성 배열이 잘못되었습니다.")
- **Prettier**: 코드의 **시각적 스타일**만 관리한다.
    - (예: "들여쓰기는 2칸입니다.", "문자열은 작은따옴표로 통일합니다.")

#### 그렇게 좋은데... 기본 설정이 아닌 이유는 ?

1. **목적의 차이**: ESLint(품질)는 버그 방지를 위해 필수적이지만, Prettier(스타일)는 팀의 '선택' 사항이다.
2. **도구의 독립성**: 두 도구는 서로 다른 목적을 위해 별개로 개발된 독립적인 프로젝트이다.
3. **스타일의 주관성**: Prettier는 매우 '독단적인' 스타일을 강제한다. 모든 개발팀이 이 스타일에 동의하는 것은 아니며, 다른 포매터(dprint 등)를 선택할 수도 있다. 따라서 프레임워크가 특정 스타일을 기본으로 강제하지 않는다.