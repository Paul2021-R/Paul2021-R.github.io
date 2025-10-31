---
layout: post 
title: TIL - NextJS 데모 페이지 구축 (001)
subtitle: nextjs 기반 앱을 무중단 배포 구성하기
categories: 학습
tags: 학습 NextJS DevOps Jenkins Docker
thumb: /assets/images/assets/nextjs.png
custom-excerpt: 2025년 10월 29일 개발 내용 요약 및 학습 정리
banner:
  # video: https://vjs.zencdn.net/v/oceans.mp4
  loop: true
  volume: 0.8
  muted: true                 # For mobile device background music play 
  start_at: 8.5
  image: /assets/images/assets/nextjs.png
  opacity: 0.318
  background: "#000"
  height: "100vh"
  min_height: "38vh"
  heading_style: "font-size: 4.25em; font-weight: bold; text-decoration: underline"
  subheading_style: "color: gold"
---

## 2025-10-29 : Next.js 프론트엔드 핵심 개념들 

오늘은 Next.js와 React를 사용한 프론트엔드 개발을 진행하고 몇 가지 핵심 개념을 살펴보았다. 백엔드 개발자에게 생소할 수 있는 개념들을 위주로 더 자세히 정리하고 코드 예시를 포함했다.

---

## 💡 백엔드 개발자가 알아두면 좋은 프론트엔드 개념

### 1. 컴포넌트 렌더링: 서버 컴포넌트 vs 클라이언트 컴포넌트 🖥️ vs 💻

Next.js는 컴포넌트를 **서버**에서 그릴지(HTML 완성) **클라이언트(브라우저)** 에서 그릴지(JavaScript 사용) 결정할수 있다. 이는 백엔드의 서버 사이드 렌더링(SSR) vs 프론트엔드의 클라이언트 사이드 렌더링(CSR) 개념과 유사합니다.
- **컴포넌트** : 
	- **개념** : 사용자 인터페이스에서 재사용, 독립적인 조각으로 나누어 개발하는 방식으로 생성되는 대상. 
		- Next.js 는 React를 기반으로 하여, React의 컴포넌트 개념을 그대로 따라간다. 
	- **종류** :
		- **함수 컴포넌트** : 
			- 일반적인 형태
			- `useState`, `useEffect`와 같은 React 훅을 사용하여 상태와 생명주기 기능을 활용 가능 
		- **클래스 컴포넌트**
			- ES6클래스로 작성됨. 
			- 최신 React 개발에선 함수형을 권장함 . 
	- **Next.js에서 컴포넌트를 사용하는 이유**
		- 코드 구조화 및 관리 용이성 
		- 개발 생산성 향상 
		- 성능 최적화 
		- 모듈화 
- **서버 컴포넌트 (Server Component, RSC - 기본값):**
    - **개념:** 컴포넌트 코드가 서버에서 실행되어 최종 HTML로 변환된 후 브라우저로 전송된다. NestJS에서 `EJS`나 `Handlebars` 같은 템플릿 엔진을 사용해 HTML을 완성해서 보내는 것과 비슷하다.
    - **장점:**
        - **초기 로딩 속도:** 브라우저는 완성된 HTML을 바로 보여줄 수 있어 초기 로딩이 빠르다.
        - **SEO:** 검색 엔진 봇이 완성된 HTML 컨텐츠를 쉽게 수집할 수 있다.
        - **서버 자원 접근:** DB 조회, 파일 시스템 접근 등 서버에서만 가능한 작업을 직접 수행할 수 있다.
        - **번들 크기 감소:** 서버에서만 실행되므로 브라우저로 보내는 JavaScript 양이 줄어든다.
    - **제한:** 사용자와의 상호작용(클릭, 입력 등)이나 브라우저 상태(예: `window` 객체)에 구조적으로 접근할 수 없다. 즉, `useState`, `useEffect`, `onClick` 등을 사용할 수 없다.
        
- **클라이언트 컴포넌트 (Client Component):**
    - **개념:** 파일 맨 위에 `"use client";` 지시어를 추가하여 명시하면 사용이 가능해짐. 이 컴포넌트의 JavaScript 코드는 브라우저로 다운로드되고 실행된다. 우리가 흔히 아는 React 컴포넌트.
    - **장점:**
        - **상호작용:** `useState` (상태 관리), `useEffect` (라이프사이클 관리), `onClick` (이벤트 핸들링) 등을 사용하여 동적인 사용자 인터페이스를 만들 수 있다.
        - **브라우저 API 접근:** `localStorage`, `window` 객체 등 브라우저 환경에서만 사용 가능한 API를 활용할 수 있다.
    - **단점:**
        - **초기 로딩:** 브라우저가 JavaScript 파일을 다운로드하고 실행해야 컴포넌트가 그려지므로, 서버 컴포넌트보다 초기 로딩이 느릴 수 있다(Hydration 과정 필요).
        - **번들 크기 증가:** 브라우저로 보내는 JavaScript 양이 늘어나고 이는 트래픽이다.
    
    ```TypeScript
    // page.tsx 맨 위에 추가하여 클라이언트 컴포넌트임을 명시
    "use client";
    
    import { useState } from 'react';
    
    export default function MyInteractiveComponent() {
      const [count, setCount] = useState(0);
    
      return (
        <button onClick={() => setCount(count + 1)}> // 버튼 이벤트 
                  Count: {count}
        </button>
      );
    }
    ```
    

### 2. 상태(State) 관리와 리렌더링: `useState` 훅 🔄

React 컴포넌트는 UI에 영향을 미치는 **상태(State)** 를 가질 수 있다. `useState`는 함수 컴포넌트에서 상태를 추가하고 관리하기 위한 **훅(Hook)** 이다.
- **훅(Hook):** 함수 컴포넌트에서 React의 기능(상태 관리, 라이프사이클 등)을 "연결(hook into)"할 수 있게 해주는 특별한 함수들이다. `useState`, `useEffect`, `useContext` 등이 있다.
- **`useState` 사용법:**
    - `const [stateVariable, setStateFunction] = useState(initialState);`
    - `stateVariable`: 현재 상태 값을 저장하는 변수 (읽기 전용).
    - `setStateFunction`: 이 상태 값을 **업데이트하는 함수**. 이 함수를 호출해야만 React가 컴포넌트를 **리렌더링(Re-render)** 하여 변경된 상태를 화면에 반영한다.
    - `initialState`: 상태의 초기값. 컴포넌트가 처음 렌더링될 때 사용하다.
         
- **백엔드와의 비교:**
    - 상태는 DB에 저장되는 영구 데이터와는 다르게 컴포넌트 인스턴스가 살아있는 동안만 유지되는 **메모리상의 임시 데이터**이다 (NestJS 서비스의 멤버 변수와 유사)
    - 가장 큰 차이점은 React는 `setStateFunction` 호출을 통해 상태 변경을 감지하고, **선언적으로(declaratively)** UI를 업데이트한다는 점이다 . 개발자는 "상태를 이렇게 바꿔줘"라고만 명령하면, React가 알아서 DOM을 효율적으로 조작하여 화면을 변경한다.
    
    ```TypeScript
    // page.tsx
    "use client";
    
    import { useState } from 'react';
    
    // ... (projects 배열 정의)
    
    export default function Home() {
      // isProjectsOpen: 현재 프로젝트 목록이 열려있는지 여부 (true/false)
      // setIsProjectsOpen: isProjectsOpen 값을 변경하는 함수
      // useState(false): 초기값은 false (닫힌 상태)
      const [isProjectsOpen, setIsProjectsOpen] = useState(false);
    
      // 버튼 클릭 시 호출될 함수
      const toggleProjects = () => {
        // 현재 isProjectsOpen 값의 반대값으로 상태를 업데이트 (일종의 업데이트 )
        setIsProjectsOpen(!isProjectsOpen);
      };
    
      return (
        // ... (생략)
        <button
          onClick={toggleProjects} // 버튼 클릭 시 toggleProjects 함수 실행
          aria-expanded={isProjectsOpen}
        >
          {/* ... SVG 아이콘 ... */}
        </button>
        // ...
        {isProjectsOpen && ( // isProjectsOpen이 true일 때만 하위 목록 렌더링
          <ul>
            {/* ... 프로젝트 링크 목록 ... */}
          </ul>
        )}
        // ...
      );
    }
    
    ```
    

### 3. 스타일링: Tailwind CSS 유틸리티 우선 접근법 🎨

Tailwind CSS는 미리 정의된 수많은 **유틸리티 클래스**를 제공한다. 개발자는 이러한 클래스들을 HTML 요소의 `className` 속성에 직접 조합하여 스타일을 적용 할 수 있다.

- **유틸리티 우선(Utility-First):** `button-primary` 같은 **의미론적(semantic)** 클래스 대신, `bg-blue-600`, `py-3`, `font-semibold` 같이 **시각적 기능**에 집중된 작은 클래스들을 조합한다.
- **작동 방식:**
    1. 개발자가 `className="text-center font-bold"`라고 작성한다 
    2. 빌드 시 Tailwind CSS가 프로젝트 내의 모든 `className`을 스캔한다.
    3. 사용된 유틸리티(`text-center`, `font-bold`)에 해당하는 CSS 규칙(`.text-center { text-align: center; }`, `.font-bold { font-weight: 700; }`)을 생성해준다.
    4. 이 생성된 CSS를 `globals.css` 파일에 주입한다.
    5. 브라우저는 HTML의 `class` 속성과 CSS 파일의 규칙을 매칭하여 스타일을 적용한다.
- **`tailwind.config.ts`:** 테마(색상, 글꼴 크기 등) 커스터마이징, 플러그인 추가, `darkMode` 전략 설정 등을 위한 설정 파일이다.
- **`globals.css`:** Tailwind의 기본 스타일(`@tailwind base;`), 컴포넌트 스타일(`@tailwind components;`), 유틸리티 스타일(`@tailwind utilities;`)을 주입하는 역할과, 직접 작성한 커스텀 CSS 클래스를 추가하는 역할을 한다.
    
    ```TypeScript
    // login/page.tsx 예시
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      {/* flex: display: flex;
        min-h-screen: min-height: 100vh;
        items-center: align-items: center;
        justify-center: justify-content: center;
        bg-gray-100: 배경색 지정
      */}
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        {/*
          w-full: width: 100%;
          max-w-md: max-width: 28rem;
          rounded-lg: border-radius: 0.5rem;
          bg-white: background-color: white;
          p-8: padding: 2rem;
          shadow-md: box-shadow 적용
        */}
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">
          로그인
          {/*
            mb-6: margin-bottom: 1.5rem;
            text-center: text-align: center;
            text-3xl: font-size: 1.875rem; line-height: 2.25rem;
            font-bold: font-weight: 700;
            text-gray-800: 글자색 지정
          */}
        </h1>
        {/* ... */}
      </div>
    </div>
    ```

### 4. Next.js 특화 컴포넌트: `<Link>`와 `<Image>` ✨

성능 향상을 위해 Next.js는 표준 HTML 태그의 기능을 확장한 자체 컴포넌트를 제공한다. 따라서 표준 HTML 태그가 아닌 태그들을 써야 하는 경우가 있다.
- **`<Link>` 컴포넌트:**
    - **역할:** 페이지 간 이동을 처리한다. 내부적으로 `<a>` 태그를 렌더링하지만, 동작 방식이 다르다.
    - **핵심 기능 (클라이언트 사이드 라우팅):**
        - 클릭 시 브라우저가 페이지 전체를 새로고침하지 않는다.
        - 대신, JavaScript를 사용하여 URL을 변경하고 필요한 페이지만 동적으로 로드하여 교체한다 (SPA처럼 동작).(레이아웃 기반으로 최초 접근 위치에서 자식만 교체 한다던가...)
        - 결과로서 매우 빠르고 부드러운 페이지 전환 경험을 제공한다.
    - **프리페칭(Prefetching):** 기본적으로 `<Link>`가 화면에 보이면, 해당 링크가 가리키는 페이지의 코드를 백그라운드에서 미리 다운로드한다. 사용자가 클릭했을 때 거의 즉시 페이지가 로드된다.
    - **사용법:** `href` 속성으로 이동할 경로를 지정한다.
    
    ```TypeScript
    // page.tsx 예시
    import Link from 'next/link';
    
    <Link href="/login" className="text-blue-600 hover:underline">
      Login Page
    </Link>
    ```
    
- **`<Image>` 컴포넌트:**
    - **역할:** 이미지를 표시합니다. 내부적으로 `<img>` 태그를 렌더링하지만, 강력한 최적화 기능을 추가한다.
    - **핵심 기능 (자동 이미지 최적화):**
        - **사이즈 최적화:** 다양한 화면 크기(데스크탑, 모바일 등)에 맞는 이미지 크기를 자동으로 생성하고 제공한다.
        - **포맷 최적화:** 브라우저가 지원하는 경우, 이미지를 WebP나 AVIF 같은 최신 포맷으로 자동 변환하여 용량을 최적화 시킨다.
        - **지연 로딩 (Lazy Loading):** 기본적으로 이미지가 사용자의 뷰포트(화면 영역)에 들어올 때까지 로딩을 지연시켜 초기 페이지 로딩 속도를 향상시킵니다. (`priority` 속성으로 비활성화 가능, 필요한 경우 즉시 로딩을 요청할 수 있다.)
        - **CLS(Cumulative Layout Shift) 방지:** `width`와 `height` 속성을 필수로 요구하여, 이미지가 로드되기 전에 해당 공간을 미리 확보함으로써 레이아웃이 갑자기 변경되는 현상을 방지한다.
    - **사용법:** `src`, `width`, `height`, `alt` 속성이 필수(이걸 몰라서 왜 에러가 뜨지? 하고 한참 해맸다.). `src`는 `public` 폴더 기준의 절대 경로 또는 외부 URL을 사용한다. 
    
    ```TypeScript
    // page.tsx 예시
    import Image from 'next/image';
    
    <Image
      src="/main.png" // public 폴더의 main.png
      alt="메인 비주얼"
      width={800}    // 이미지 원본 너비
      height={800}   // 이미지 원본 높이
      priority       // 이 이미지는 중요하므로 먼저 로드
    />
    ```

---

## ❓ 질문 목록 (Q&A)

### Q1: 맨 위에 `"use client"`의 역할은?

**A:** 해당 파일(모듈)이 **클라이언트 컴포넌트**임을 명시하는 지시어다. `"use client"`가 선언된 파일과 그 파일에서 import하는 모든 모듈은 클라이언트 번들에 포함되어 브라우저에서 실행된다. 이는 `useState`, `useEffect` 같은 React 훅이나 `onClick` 같은 브라우저 이벤트를 사용하기 위해 필수적이다. 반대로, 이 지시어가 없으면 기본적으로 **서버 컴포넌트**로 간주되므로 클라이언트 사이드의 이벤트에 대해서 인식이 불가능하다.

### Q2: `useState(false)`는 기본값을 선정하는 건가? `isProjectsOpen`과 `setIsProjectsOpen` 두 가지의 역할과 차이는?

**A:**
- `useState()`의 인자로 전달된 값(`false` 등)은 해당 상태 변수의 **초기값(initial state)**. 컴포넌트가 처음 마운트될 때 이 값으로 상태가 초기화된다.(해당 코드에선 접혀있는 상태로 시작해야 하므로 false를 넣고, 대신 statetFunction에서 not 처리를 해준다.)
    
- `isProjectsOpen`: **현재 상태 값**을 담고 있는 변수. JSX 내에서 이 값을 읽어 UI를 조건부로 렌더링하거나 표시할 수 있다. 이 변수는 직접 수정할 수 없다 (예: `isProjectsOpen = true;` 불가).
    
- `setIsProjectsOpen`: `isProjectsOpen` 상태를 **업데이트하는 함수**다. 이 함수에 새로운 상태 값을 전달하여 호출하면 (`setIsProjectsOpen(true);` 또는 `setIsProjectsOpen(prev => !prev);`), React는 상태 변경을 감지하고 컴포넌트를 리렌더링하여 UI를 갱신한다. 이것이 전형적인 React에서 상태를 변경하는 방법이다.

### Q3: `const toggle~`로 화살표 함수는 `useState`에 사용하기 위해 설정해주는 일종의 변수형 메서드인 건가?

**A:** "일종의 변수형 메서드" 또는 더 정확히는 **이벤트 핸들러 함수**라고 볼 수 있다. `useState` 자체에 필요한 것은 아니다. 단, 상태를 변경하는 로직(예: `setIsProjectsOpen(!isProjectsOpen)`)을 `<button>`의 `onClick` 속성에 직접 넣는 대신, 별도의 함수(`toggleProjects`)로 분리하여 정의한 것이다. 이렇게 하면 코드가 더 깔끔해지고, 로직이 복잡해질 경우 관리하기 용이하며, 필요하다면 다른 곳에서 재사용할 수도 있다.

```TypeScript
// 이벤트 핸들러 함수 정의
const toggleProjects = () => {
  setIsProjectsOpen(prevState => !prevState); // 이전 상태를 기반으로 토글
};

// JSX에서 이벤트 핸들러로 함수 연결
<button onClick={toggleProjects}>...</button>
```

### Q4: Next.js에서 주로 사용한다는 HTML이 아닌 자체 태그들(`Link`라던가)이 있는데, 왜 이걸 써야 하고, 안 쓰면 안 되는 이유가 있는지?

**A:** **성능 최적화와 향상된 사용자 경험**을 위해서 Next.js의 자체 컴포넌트 사용이 강력히 권장한다. 안 쓴다고 해서 앱이 작동하지 않는 것은 아니지만, Next.js를 사용하는 핵심 이점들을 놓치게 된다.

- **`<Link>` vs `<a>`:** `<Link>`는 **클라이언트 사이드 라우팅**을 구현하여 페이지 전환 시 전체 새로고침 없이 변경된 부분만 업데이트한다. 이는 훨씬 빠르고 부드러운 사용자 경험(SPA와 유사)을 제공합니다. 또한, **프리페칭** 기능으로 미리 다음 페이지를 로드하여 전환 속도를 더욱 높인다. 일반 `<a>` 태그는 전통적인 서버 방식의 페이지 이동(전체 새로고침)을 만들고, 당연히 동작은 하나 전체를 새로 그려야 한다.
    
- **`<Image>` vs `<img>`:** `<Image>`는 **자동으로 이미지를 최적화**한다(사이즈 조절, WebP 변환, 지연 로딩 등). 이는 페이지 로딩 속도를 크게 개선하고 대역폭 사용량을 줄여준다. 또한 `width`, `height`를 강제하여 레이아웃 쉬프트(CLS) 문제를 예방한다. 일반 `<img>` 태그는 이러한 최적화 기능을 제공하지 않고 직접 처리해야 한다.

### Q5: `button` 컴포넌트의 `svg` 태그에서 `${}` 안에 넣으면 일종의 함수로 동작하는 건지? 그리고 `fill`, `stroke`와 같은 `className`에 안 들어간 별도의 요소들은 그냥 `svg` 태그의 요소들인 건지?

**A:**

- `${...}`: 이것은 함수 호출이 아니라, JavaScript의 **템플릿 리터럴(Template Literal)** 내에서 **표현식 삽입(Expression Interpolation)** 을 사용하는 문법이다. 백틱(`` ` ``)으로 감싸진 문자열 안에서 `${}`를 사용하면, 중괄호 안의 JavaScript 코드가 평가되고 그 결과값이 문자열의 해당 위치에 삽입한다. 예시 코드에서는 `isProjectsOpen` 상태에 따라 `rotate-180` 클래스를 조건부로 추가하여 아이콘의 회전 상태를 제어한다.
    
    ```JavaScript
    // className 속성에 템플릿 리터럴 사용
    <svg
      className={`h-5 w-5 transition-transform ${ // 백틱(`)으로 시작
        isProjectsOpen ? 'rotate-180' : '' // ${} 안에 삼항 연산자 표현식
      }`} // 백틱(`)으로 끝
      // ... (SVG 속성들)
    >
      {/* ... */}
    </svg>
    ```
    
- `fill`, `stroke`, `viewBox`, `xmlns`, `d`, `strokeLinecap`, `strokeLinejoin`, `strokeWidth`:  이 속성들은 `className`과는 별개로 **SVG(Scalable Vector Graphics) 표준 명세에 정의된 고유한 속성(attributes)** 이다. 벡터 그래픽의 모양, 색상, 선 스타일 등을 정의하는 데 사용됩니다. Tailwind CSS 클래스와는 직접적인 관련이 없다.