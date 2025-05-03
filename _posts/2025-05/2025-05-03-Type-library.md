---
layout: post 
title: "@type/~ 의존성을 설치하면 얻는 것"
subtitle: Backend 심화학습
categories: Backend
tags: 학습 TypeScript Backend 
thumb: /assets/images/posts/2025-05-04-0001.png
custom-excerpt: 클린 코드를 위한~ 이라고 쓰고 팀 개발을 위한 클린 코드 원칙을 정리해 보았다. 
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

## Intro

요 최근 MSA 서버 구현 공부를 다시 하고 있다. 영어 강의고, 상당히 난감한 번역의 자막이라 열은 받지만... 그럼에도 구조적 설계를 배울 수 있어서 좋다. 

그러는 와중에 여전히 모르는게 많은 응애 개발자 답게, 모르는 라이브러리의 설치에 대한 내용이 남아 이렇게 적어본다. 

## @type/bcrypt 가 뭐시여..?
MSA auth 구현을 하던 도중, 강사가 개발환경에서 좋다고 하여 설치를 했고, 그러나 개발환경..? 굳이 구분이 필요한가 라고 생각을 했었는데... 그게 아니었다. 

> `@types/` 라이브러리들은 TypeScript 개발 환경에서 매우 중요한 역할을 합니다. 이 라이브러리들은 주로 `-D` 플래그(또는 `--save-dev`)를 사용하여 개발 의존성으로 설치됩니다. *- Claude 3.7* 

해당 패키지들이 괜히 구분된게 아니라고, 실질적으로 나름의 역할하는 거였구나. 새삼 깨닫게 되었다. 😅

### @types/ 라이브러리의 역할은

1. **타입 정의 제공**: JavaScript로 작성된 라이브러리에 대한 TypeScript 타입 정의를 제공한다. JavaScript는 원래 타입이 없는 언어이기 때문에, TypeScript에서 이러한 라이브러리를 사용할 때 타입 정보가 필요하고 없을 경우 당연히 TypeConflict 로 고생할 수 있다. 

2. **개발 시 코드 자동완성과 IntelliSense**: 개발 도구(VS Code 등)에서 코드 자동완성, 파라미터 힌트, 메서드 시그니처 등의 도움말을 제공한다. 따라서 편의성 향상에 매우 도움이 된다. 

3. **타입 체크**: TypeScript 컴파일러가 코드의 타입 오류를 찾아내는 데 사용된다. 이는 런타임 전에 많은 버그를 발견하는 데 도움이 되어 안정성에 도움이 된다. 

4. **문서화**: 라이브러리의 API가 어떻게 사용되어야 하는지에 대한 문서 역할도 한다. 타입 정의를 통해 함수의 매개변수, 반환 값 등의 정보를 확인할 수 있다.

### 예시

예를 들어, Express.js를 TypeScript 프로젝트에서 사용하려면:

```bash
npm install express          # 실제 라이브러리 설치
npm install -D @types/express # TypeScript 타입 정의 설치
```

이렇게 하면 다음과 같은 TypeScript 코드를 작성할 수 있습니다:

```typescript
import express from 'express';

const app = express();
app.get('/', (req, res) => {
  res.send('Hello World!');
});
```

여기서 `@types/express`는 `req`와 `res` 객체의 타입, 그리고 `express()` 함수의 반환 타입 등을 제공한다.

## 알아둬야 하는 핵심 포인트

1. **개발 의존성으로 설치할 것**: `-D` 플래그를 사용하여 개발 의존성으로 설치하는 이유는 이 타입 정의가 런타임에 필요하지 않고 개발 및 컴파일 시에만 필요하기 때문.

2. **라이브러리 버전 일치**: `@types/` 패키지의 버전은 가능한 한 실제 라이브러리 버전과 일치해야 한다. 

3. **DefinitelyTyped**: 대부분의 `@types/` 패키지는 [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) 프로젝트에서 관리됩니다. 이는 커뮤니티가 관리하는 타입 정의 저장소다.

4. **내장 타입**: 일부 라이브러리는 자체적으로 타입 정의를 포함하고 있어서 별도의 `@types/` 패키지가 필요하지 않기도 하다. 예를 들어, React 16.8 이후 버전은 자체 타입 정의를 포함하고 있다. 

## Yarn으로 @types/ 패키지 설치하기
학습 시에는 pnpm 을 사용하였으나, 현재 회사의 의존성으로 yarn 을 사용 중이다. yarn 에선 다음과 같이 사용해서 type 을 다운받으면 된다. 

```bash
# 기본 라이브러리 설치
yarn add express

# 타입 정의를 개발 의존성으로 설치
yarn add --dev @types/express
```

```bash
# 단축 
yarn add -D @types/express
```

## Yarn에서 package.json 의존성 구분

npm과 마찬가지로 Yarn도 `package.json` 파일에서 의존성을 다음과 같이 구분합니다:

```json
{
  "dependencies": {
    "express": "^4.17.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.13"
  }
}
```

## 타입 지원 여부 확인 방법

이렇듯 유용하기도 하고, 있는지 확인해 보면 좋은 `@type/~`는 각 라이브러리 마다 존재하는지 확인해서 필요시 설치하면 되고, 있는지 여부는 아래와 같은 방법을 활용하자. 

1. 패키지 설치 후 직접 확인

```typescript
// 간단한 테스트 파일 작성
import * as package from 'package-name';
```

이 코드를 작성했을 때:
- 타입 오류가 없다면, 라이브러리가 이미 타입을 내장하고 있습니다.
- "Could not find a declaration file for module 'package-name'" 오류가 발생한다면, 타입 정의가 없다고 보면 됨

2. 패키지 문서 확인

대부분의 패키지는 README나 공식 문서에 TypeScript 지원 여부를 명시하니 확인 할 것
- "Written in TypeScript" 또는 "TypeScript support included"와 같은 문구
- 설치 안내에 `@types/package-name` 설치 지침이 포함되어 있는지 확인

3. 패키지 소스 확인

패키지의 `package.json` 파일을 확인합니다:

```json
{
  "name": "package-name",
  "types": "index.d.ts",       // 또는
  "typings": "index.d.ts",     // 또는
  "typescript": {
    "definition": "index.d.ts"
  }
}
```

4. NPM 페이지 확인

NPM 웹사이트에서 패키지 페이지를 확인하세요. 패키지 파일 목록에 `.d.ts` 파일이 있으면 타입을 제공한다.

5. DefinitelyTyped 검색

[DefinitelyTyped GitHub 저장소](https://github.com/DefinitelyTyped/DefinitelyTyped) 또는 [TypeSearch](https://microsoft.github.io/TypeSearch/)에서 `@types/package-name`이 있는지 확인한다.

6. 자동화된 도구 사용

#### TypeScript-Auto-Importer 확장 프로그램

VS Code의 `TypeScript-Auto-Importer`와 같은 확장 프로그램은 사용 가능한 타입 정의를 자동으로 감지한다.

#### `npx typescript-check-esm` 사용

이 도구는 프로젝트 의존성의 TypeScript 호환성을 검사한다.

#### `typed-npm-registry` 사용

이 웹사이트에서 패키지 이름을 검색하여 타입 지원 여부를 확인 가능: https://www.typedregistry.com/

### 실용적인 워크플로우

1. 먼저 기본 패키지만 설치 함: `yarn add package-name`
2. 코드에서 임포트해보고 오류가 발생하는지 확인
3. 오류가 발생하면 `@types` 패키지 존재 여부를 확인:
   ```bash
   yarn info @types/package-name
   # 또는
   npm view @types/package-name
   ```
4. `@types` 패키지가 존재하면 설치: `yarn add -D @types/package-name`

## 마치며 
확실히 사용해보니, 없을 때 보다 공식 설명이 더 풍부한 경우가 많고, 객체, 타입에 대한 설명이 상세 해지는 걸 보니, 개발 시 무언가 추가 시 신경 써서 넣어두거나, 기본적으로 갖춰 둔 템플릿을 활용하면 좋을 것 같다. 

이런 거 보면 아직 짬이 덜 찬 느낌이 든다. 🫥

개발의 길은 멀고, 아주 멀고, 아주 멀다. 😖