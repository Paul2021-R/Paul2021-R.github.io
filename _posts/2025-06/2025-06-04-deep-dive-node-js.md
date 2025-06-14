---
layout: post 
title: NestJS 를 위한 NodeJS Deep Dive 
subtitle: Node 를 이해해야 NestJS 를 더 깊게 볼 수 있다.
categories: Backend
tags: Backend Node NestJS JavaScript TypeScript Programming
thumb: /assets/images/posts/2025-06/2025-06-04-0002.png
custom-excerpt: NestJS 를 위해 Node를 이해하기 위하여 정리한 글. 핵심들을 정리해보자
banner:
  # video: https://vjs.zencdn.net/v/oceans.mp4
  loop: true
  volume: 0.8
  muted: true                 # For mobile device background music play 
  start_at: 8.5
  image: /assets/images/posts/2025-06/2025-06-04-0001.png
  opacity: 0.618
  background: "#000"
  height: "100vh"
  min_height: "38vh"
  heading_style: "font-size: 4.25em; font-weight: bold; text-decoration: underline"
  subheading_style: "color: gold"
---

## 0. 들어가면서 
본 글은 어디까지나 NestJS 개발자로써 Node 기본기를 다지기 위해 원하는 식의 재구성이 포함됩니다. 혹시나 내용적으로 오류가 있으면 알려주시면 감사하겠습니다 😎

## 1. Why Node And then NestJS 
Node.js 의 이해도는 NestJS 개발자로 하여금 여러 이점을 갖춘다. 

- **디버깅 및 성능 튜닝**: 이벤트 루프, V8 엔진, 메모리 관리와 같은 Node.js 내부 구조를 깊이 이해하면 NestJS 추상화를 통해서는 즉시 명확하지 않을 수 있는 성능 병목 현상, 메모리 누수 및 비동기 동작을 보다 효과적으로 디버깅할 수 있다.
- **Node.js 기능 직접 활용**: NestJS는 많은 유틸리티를 제공하지만, 복잡한 파일 작업에는 fs 모듈, 특정 암호화 요구에는 crypto 모듈, CPU 집약적 작업에는 worker_threads 모듈과 같이 Node.js 핵심 모듈을 직접 사용해야 하거나 더 효율적인 시나리오가 있다.
- **정보에 입각한 아키텍처 결정**: Node.js의 단일 스레드 특성, 논블로킹 I/O 및 모듈 시스템에 대한 지식은 특히 확장성 및 마이크로서비스 설계와 관련하여 NestJS 애플리케이션 내에서 더 나은 아키텍처 선택을 하는 데 도움이 된다.
- **향상된 보안 이해**: 일반적인 Node.js 취약점을 이해하면 NestJS의 보안 기능(예: 입력 유효성 검사 파이프가 주입 공격을 방지하는 방법 이해)을 이해하고 올바르게 구현하는 데 도움이 된다.

생각해보면 NestJS 는 그 철학의 근간이 되는 Angular 와 MVC 패턴의 유사성을 보여주는 Spring 프레임워크의 그것을 잘 버무려놓은 도구이다. 그 덕에 네트워크를 통한 서버 애플리케이션의 라이프사이클을 추상화하고, 그 순서에 대한 이해도가 없는 상태에서도 Node.js 기반으로 동작하며 기본 HTTP 요청을, 그 이해도가 낮음에도 구동하게 해주는 아주 훌륭한 도구일 것이다. 

하지만 그러한 초반의 구조적인 도움은 빠른 개발, 유연한 대응이 가능하게 해주긴 하지만, 그 이상의 최적화, 그 이상의 개선이 필요할 때, Node.js 에 대한 이해도가 없다면 이는 좀더 고급의 기능들, 알수 없는 버그나 오버헤드의 최적화 차원에서의 성능이 뛰어난 코드, 안정성의 제고 등이 불가능하다. 

## 2. Node.js 의 Runtime
### 2-1. V8 엔진
![](/assets/images/posts/2025-06/2025-06-05-0002.png)
> 처음 JS 를 배울 때가 생각난다.. 

JavaScript는 그 이름처럼 Java의 명성을 따라, 웹 브라우저의 스크립팅 언어로 그 태초를 시작하였다. 하지만 그 사용성이나 웹의 가치가 증대됨에 따라, 해당 스크립트의 발전도 이루어져 갔으며, 그 과정에서 특히나 가속을 이룰 수 있던 것이 Google 의 Chromium의 V8 엔진을 사용하게 된 이후에서였다. 단순 인터프리팅 방식으로의 해석 및 동작 실행을 넘어서서, 기계 코드로의 컴파일을 겸하게 되고 고성능을 이룩하면서, JavaScript는 단순한 웹 스크립트 언어 그 이상의 가치를 갖게 된다. 

특히, 그 와중에 나온 것이 바로 V8을 기반이며 웹 상이 아닌, 호스트 컴퓨터 기반에서도 구동이 가능한 런타임으로 Node가 등장하게 된 것이다. 

#### 2-1-1. JIT(Just-In-Time) 컴파일 및 성능
![](/assets/images/posts/2025-06/2025-06-05-0003.png)

Node 는 v8 엔진 기반의 런타임이고 기본 인터프리팅 방식으로 JS 코드들을 수행한다. Ingnition 인터프리터에 의해 해석될 수 있고, 그런데 이 과정에서 반복적으로 동작이 필요한 코드들이 발생한다. 이러한 '핫 함수'(자주 실행되는 코드) 영역에 대해서는 TurboFan 컴파일러에 의해 기계코드로 컴파일이 이루어진다. 

CS의 아주 기초적인 상식이지만, 사람의 언어에 가깝게 구성된 언어일 수록 컴퓨터는 이를 이해하는데 상당한 리소스를 쓸 수 밖에 없다. 이와 반대로 바이너리(기계코드)로 이루어진 코드가 되면, 이는 CPU 가 사용하는 이해 방식 그대로이니 그만큼 쉽게, 빠르게 처리될 것이다. 즉, 기존의 JS 코드들은 느리거나, 그 태생의 한계를 가지고 있다고 평가 되었지만 JIT 컴파일러의 등장은 Node.js 가 충분히 속도를 확보할 수 있는 비결이 되었으며, 따라서 JS 코드나 TS 코드를 작성시, 보다 깔끔하고 예측 가능한 코드를 작성시 V8이 더 효과적으로 최적화할 수 있다.

#### 2-1-2. 가비지 컬렉션 
V8은 GC 를 사용하여 메모리를 자동 관리해주고, 그렇기에 개발자가 이를 관리할 필요를 없애주었다. 여기에는 시간의 서순에 따라 관리되는 접근 방식을 갖춘다. 

- New Space (Young Generation): 새 객체가 할당되는 곳. 여기서는 수집이 빈번하고 빠르며, New Space를 두 개의 세미 스페이스로 나누는 "Scavenge" 알고리즘(복사 수집기)을 사용함. 대부분의 객체가 "젊을 때 죽기" 때문에 효율적이다.
- Old Space (Old Generation): 몇 번의 Scavenge 주기를 거친 객체는 Old Space로 승격되어 관리된다. 여기서는 수집 빈도가 낮지만 시간이 더 많이 소요되며, "Mark & Sweep"(도달 가능한 객체를 표시하고 가비지를 제거) 및 "Mark & Compact"(추가로 라이브 객체를 이동하여 조각화 줄임) 알고리즘을 사용하여 관리된다.

특히나 NestJS 기준으로 설명하면 서비스, 전역 프로바이더는 오래 지속되는 객체로 Old Space에 남게 되는데, 문제는 잘못 관리되는 객체 수명 주기나 대규모 객체 할당이 발생하면 GC 일시중지를 증가시켜 애플리케이션의 응답 성능에 문제를 일으킬 수 있다. 

#### 2-1-3. V8의 최적화 기술과 JavaScript 기반 언어 사용시 중요한 포인트
- Hidden Class(Shapes): V8엔진은 JS 언어의 특징이라고도 볼 수 있는 객체 속성 접근을 최적화 하기위한 메모리 관리 기법으로 동일한 구조(동일한 순서로 동일한 속성)를 가진 객체는 히든 클래스를 공유한다. 

  따라서 인스턴스 화 후에 속성이 추가되거나, 변경되는 코드가 작성되게 되면, 히든 클래스의 전환도 발생하게 되고, 상당한 성능 저하를 일으 킬 수 있다. 

  이러한 구조는 JS, TS 언어의 프로토타입과도 밀접한 관련이 있을 수 있는데, 이러한 공유 공간을 통해, 유사한 속성들의 무질서한 메모리 할당에서 자유로울 수 있다. 

- Inline Caching(ICs): 해당 기능은 속성 조회 결과를 캐싱해두는 역할에 대해서를 표현한다. V8 엔진이 히든 클랫, 속성의 오프셋을 기록하고, 동일한 기능 작업이 수행되면 V8은 캐시된 정보를 재 사용하여 접근 속도를 높일 수 있다. 

  이러한 점에서 보면 다형성이나 거대 형성(너무 과도한 히든 클래스) IC 는 당연히 캐싱이 많이 되는 만큼 느리게 된다. 이러한 점에서 보면 NestJS 에서 요청 핸들러나, 서비스에서 객체의 모양을 일관되게 사용하면, 단형성 IC를 유지할 수 있고 성능에서 조금이라도 이득을 볼 수 있다.

이러한 V8의 최적화 기술, 언어적 특성을 볼 때, NestJS 사용자 역시 V8 친화적 코딩 패턴(일관된 객체 모양, 생성자 속성 초기화 원칙, 내부 속성의 변동 최소화 등)을 사용하는 것이 매우 중요하다.

### 2-2. 이벤트 루프: Node.js의 동시성 모델 
![](/assets/images/posts/2025-06/2025-06-05-0004.png)

Node.js 는 단일 스레드 이벤트 루프라는 개념으로 Non-blocking I/O 작업을 수행한다. 이를 통해 각 요청에 대하여 여러 스레드를 관리하는 오버헤드가 없이 많은 동시 연결을 효율적으로 처리할 수 있다.

#### 2-2-1. 이벤트 루프의 단계 
각 단계는 그 목적이 존재하며, 해당 단계에 들어서면 해당 단계에 처리해야할 것들에 대해서만 처리하고 넘어가는 구조를 통해 지속적으로 쌓여지는 여러 일들을 단계적 처리가 가능하게 구현되어 있다. 
- Timers: setTimeout() 및 setInterval()에 의해 스케줄된 콜백을 실행
- Pending Callbacks(또는 I/O Callbacks): 다음 루프 반복으로 지연된 I/O 콜백(예: 일부 시스템 오류)을 실행
- Idle, Prepare: 대기, 내부 전용 단계
- Poll: 새 I/O 이벤트를 검색하고 I/O 관련 콜백(닫기 콜백, 타이머 및 setImmediate()를 제외한 거의 모든 콜백)을 실행, setImmediate()에 의해 스케줄된 스크립트가 있거나 타이머가 준비되지 않은 경우 폴 큐가 비어 있으면 차단
- Check: setImmediate() 콜백을 실행
- Close Callbacks: 닫기 이벤트 콜백(예: socket.on('close',...) )을 실행

#### 2-2-2. process.nextTick(), setImmediate() 및 실행 순서
- process.nextTick(): 콜백은 이벤트 루프 자체의 일부는 아니지만 현재 작업이 완료된 직후, 이벤트 루프가 다음 단계로 진행되기 전에 실행, setImmediate()보다 우선 순위가 높음
- setImmediate(): 현재 폴 단계가 완료되고 다음 반복의 타이머 전에 스크립트를 실행하도록 스케줄링. 콜백은 "check" 단계에 배치된다.
- setTImeout(fn, O): 최소 0ms의 임계값이 경과한 후 스크립트를 실행하도록 스케줄링함. I/O 주기 외부에서 호출될 경우 setImmediate()에 대한 실행 순서는 예측할 수 없지만 I/O 주기 내에서는 일반적으로 setImmediate()가 더 빠릅니다.

#### 2-2-3. NestJS 의 비동기 작업과 Node.js 의 관계 
NestJS 는 Node의 비동기 작업의 구조와 시스템을 그대로 컨트롤러, 서비스에 적용하고 의존하고 있다. 그렇기에 이벤트 루프 개념의 이해, NestJS 의 큐 개념에 대한 이해 등을 기반으로 더 강력한 비동기적 처리 구조를 구현할 수도 있다. async/await, Promise의 올바른 사용법과 setImediate또는 nextTick을 언제 쓰면 될지를 이해하는 가는 작업 스케쥴링 최적화를 가능케 한다. 

NestJS 는 기본 철학에서부터 비동기 작업을 권장한다. 단, 서비스 내에서 CPU 바운드 블로킹 코드를 작성하는 것도 가능한데, 이러한 형태의 가장 큰 단점은, 연산량이 많아지면 단일 스레드를 독점하고 이벤트 루프가 다른 보류중인 이벤트 처리를 못하게 되어, 요청에 대한 응답이 밀리게 된다는 점이다. 

이러한 경우 워커 스레드와 같은 기술을 사용하여 오프로드해야 하는 등으로 일에 대한 선택적 스케쥴링도 필요할 수 있다. IO 에 대해서도 aync/await 정도만으로도 충분히 병목을 제어할 수 없는 경우도 있다. 따라서 NestJS 기술 스택을 사용하는 개발자는 단순히 I/O 바운드의 비동기성과 함께 CPU 바운드 작업에 대한 주의 역시 이해하고 워커 스레드와 같은 전략을 사용할 필요가 있다.

![](/assets/images/posts/2025-06/2025-06-05-0005.png)

### 2-3. 논블로킹 IO 및 비동기 프로그래밍
Node.js의 표준 라이브러리에서 비동기 IO 를 기본 제공하며, JS 코드가 차단되는, 동기식 동작을 방지한다. IO 작업의 수행 시 스레드를 차단하기 대신에 응답이 돌아오면 하던 작업을 재게하는 식을 통해 수천개의 동시 연결을 단일 스레드에서 처리하는 것이 가능해진다. 

#### 2-3-1. 콜백 지옥과 Promise로의 진화
- 초기 Node.js는 비동기 작업을 위해 콜백에 의존하고 있었다. 이러한 구조는 깊이 중첩되고 관리하기 어려운 코드들을 발생하였고, 따라서 개발의 생산성(가독성, 유지보수성)이 매우 제한적이었다. ES6이후 Promise의 도입은 매우 큰 변화를 가져왔다.

#### 2-3-2. 깔끔한 비동기 코드를 위한 async/await 
- 콜백 방식은 try/catch 불가능, 에러 전파가 불명확했으나, Promise 이후 .catch() 로 에러흐름을 명확히 분리했으며, async/await 로 더 자연스러운 동기식 표현이 가능하면서도 비동기로 동작이 구현 될 수 있게 되었다.

#### 2-3-3. NestJS 가 비동기 패턴을 적용하는 방법
- JS 와 의 발전으로 Node.js 기반인 상태에서 NestJS 는 async/await 을 완전히 수용 한 단계 더 나아간 추상화를 통해 컨트롤러, 서비스, 프로바이더, 그리고 그 하부의 메서드나 핸들러들 모두 async 함수가 될 수 있고 Promise 를 반환한다. 이를 통해 응답을 받기전까지 언제든지 멈추고 다른 작업이 가능하도록 NestJS 는 구현된다.
- 수명주기 이벤트: onModuleInit을 포함 각종 후크도 이벤트들로 지정되어 있고 async를 활용하여 비동기적으로 로직의 초기화를 수행할 수있고 이러한 점은 NestJS 개발자들에게 개발적 구성을 더욱 풍부하고 쉽게 할수 있도록 돕게 된다.

#### 결론
- NestJS 는 컨트롤러, 서비스, 가드, 인터셉터 및 파이프에서 async, await 을 광범위하게 사용이 가능하며, 이러한 구성요소는 Promise 를 반환한다. 매우 편리하고, 구성의 효율성이 발생하긴 하지만, 문제는 모든 비동기 부분에서 오류 처리를 부지런히 해야 한다. 이는 전역 필터 외에도 로컬에서의 오류 처리를 잘 해야 하고, 이러한 구성이 되어야 전역으로만 의존시 어디 위치에서 특정 오류가 발생하는지를 정확히 개발자가 취급하지 못할 수 있다는 위험을 인지해야 한다. 
- `canActivate` 메서드의 경우 `Promise<boolean>` 을 반환할 수 있는데, 이는 해당 메소드나 로직 안에서 거부가 로컬로 처리 되지 않으면 콜백으로 전파 되며, 오류를 포착하도록 설계하는 것이 가능하다. 이러한 점에서 `Promise`의 체인 특성을 이해까지 한다면 비동기 오류의 적절한 처리가 가능해 질 것이다. 
// TODO: 
## 3. Node.js의 모듈, 데이터 처리 및 IO
- 전통적으로 Node 진영에서는 CommonJS 라는 기반 모듈을 사용했으나 ECMAScript 모듈을 지원한다. TypeScript 기반인 NestJS 프로젝트는 일반적으로 소스 코드에서 ESM 구문을 사용하고, 이는 tsconfig.json 설정 및 Node.js 버전에 따라 CJS 로 트랜스파일이 되는 구조를 가진다.

- 주요 차이점 요약 

| 특징 | CommonJS(CJS) | ECMAScript(ESM) |
|:---:|:---|:---|
|로드 시점|동기적, requre() 호출 시점에 파일을 즉시 불러오고 실행|비동기적, 모듈 로딩이 비동기적으로 처리되어 성능에 유리|
|구문|`require()` / `module.exports`|`import` / `export`|
|`this`의 스코프|전역 객체 (`global`)|`undefined`|
|실행 환경| 주로 Node.js 환경|브라우저와 Node.js 환경 모두 지원|
|정적 분석| 불가능, 코드를 실행해야 의존성 파악이 가능|가능, 코드 실행 전 `import` / `export` 구문 분석으로 의존성 파악 가능|

### 3.1 모듈 시스템: CommonJS 대 ECMAScript 모듈(ESM) 
#### 3.1.1 구문 및 로딩 메커니즘
CommonJS (CJS): 동기 모듈 로딩을 위해 require()를 사용하고 내보내기를 위해 module.exports 또는 exports를 사용한다.

ECMAScript 모듈 (ESM): import 및 export 문을 사용한다. ESM 로딩은 비동기적이며 정적 분석(트리 셰이킹)을 가능하게 만든다.    

#### 3.1.2 주요 차이점 
- 로딩: 동기식과 비동기식
- `__dirname`, `__filename` 지원 여부: CJS 에서 사용 가능하지만, ESM 에서는 직접 사용은 안된다. (단 `import.meta.url`, `path.dirname(fileURLToPath(import.meta.url))`를 사용, Node.js v20.11.0+에서 제공한다.)
- 최상위 await: ESM 에서만 사용 가능
- JSON 모듈 가져오기: CJS 는 직접 require 활용하여 허용. ESM은 import 사용
- 파일 확장자: CJS 는 종종 .js 를 생략 가능. 단, ESM 은 명시적 파일 확장자 사용.

#### 3.1.3 NestJS 프로젝트의 고려사항 
- NestJS 에서 핵심은 TS 로 작성되고 ESM 구문을 사용하지만, 기본적으로 두 모듈 시스템이 탑재 되어 있으니, tsconfig.json 을 통해 어떤 식으로 트랜스파일링 되어 출력 모듈을 결정 지을 수 있다. (반대로 따라서 __dirname 과 같은 것들의 동작 방식은 트랜스파일링과 tsconfig.json의 관계를 모르면 혼란의 원인이 될 수 있다.)
- 결과적으로 tsc를 통해 JS로 트랜스파일이 되고, 여기서도 `module` 옵션에 따라 형식이 결정된다는 점을 알면 된다. 
- 현재는 이러한 트랜스파일을 통해 기존의 레거시와의 호환이 유지 되고 있지만, ESM 전용 패키지 또는 최상위 await 과 같은 기능을 사용시 문제에 직면할 수 있고, ESM 으로의 적극적인 전환 도중에 있기 때문에 NestJS 사용에서 ESM을 사용하는 것, 그 구조를 이해하는 것이 중요하다.

### 3.2 스트림: 효율적인 데이터 처리
- Node.js에서 특히 대용량 IO 의 효율적 처리를 위한 기본 수단. 데이터를 한번에 메모리에 모두 로드하지 않고, 청크 단위를 사용하여 처리한다. 

#### 3.2.1 스트림 유형
- Readable: 데이터 읽기용 (예: fs.createReadStream()).
- Writable: 데이터 쓰기용 (예: fs.createWriteStream(), http.ServerResponse).
- Duplex: 읽기 및 쓰기 모두 가능 (예: 네트워크 소켓).
- Transform: 출력이 입력에서 계산되는 Duplex 스트림 유형 (예: 압축, 암호화).

#### 3.2.2 `pipe()` 메서드 및 역압(Backpressure)
- `readable.pipe(writable)`은 읽기 가능한 스트림을 쓰기 가능한 스트림에 연결하는 일반적인 패턴으로, 데이터 흐름을 자동화하고 역압을 처리한다.
- `역압`은 쓰기 가능한 스트림이 데이터를 충분히 빠르게 처리할 수 없는 경우 읽기 가능한 스트림에 일시 중지를 신호하는 메커니즘으로, 메모리 과부하를 방지용이다. 쓰기 가능한 스트림이 다시 준비되면(비워지면) 읽기 가능한 스트림이 다시 시작된다. 

#### 3.2.3 NestJS에서의 사용사례: 대용량 파일 업로드/ 다운로드, 실시간 데이터 처리
- 파일 업로드: NestJS에서 파일 업로드를 처리할 때(예: `@nestjs/platform-express`와 `Multer` 사용 또는 사용자 지정 솔루션), 들어오는 파일 데이터는 스트림이다. 이 스트림을 직접 처리하면(예: 클라우드 저장소 또는 파일 시스템으로 파이핑) 전체 파일을 버퍼링하는 것보다 메모리 효율적이다.    
- 파일 다운로드: 대용량 파일을 제공하기 위해 NestJS 컨트롤러는 `StreamableFile`을 반환하거나 읽기 가능한 스트림(예: `fs.createReadStream`()에서)을 HTTP 응답 객체(쓰기 가능한 스트림)로 직접 파이핑할 수 있다. 
- 실시간 데이터: 웹 소켓 또는 메시지 큐와 같은 소스에서 실시간 데이터를 처리하는 데 스트림이 포함될 수 있다.

#### 3.2.4 NestJS 유틸리티: `StreamableFile
- `StreamableFile` :   
 `@nestjs/common`에서 제공하는 클래스로, 파일을 응답으로 스트리밍하는 것을 단순화한다. Buffer 또는 Readable 스트림을 사용할 수 있다. NestJS는 이를 응답으로 파이핑하는 것을 처리한다.

    예: return new StreamableFile(buffer); 또는 return new StreamableFile(fs.createReadStream('path/to/file'));    

- 서버 전송 이벤트 (SSE) :  
 NestJS는 클라이언트에 실시간 업데이트를 푸시하기 위한 SSE를 지원한다.  SSE 핸들러는 RxJS `Observable을` 반환하며, NestJS는 이를 이벤트 스트림으로 조정한다. 이는 이 특정 사용 사례에 대한 원시 스트림 처리보다 높은 수준의 추상화다.

### 3.3 버퍼: 바이너리 데이터 처리
### 3.4 fs 모듈(파일 시스템 모듈):  

## 4. 성능, 확장과 최적화
### 4.1 Node.js의 메모리 관리 
### 4.2 CPU 집약적 작업을 위한 워커 스레드
### 4.3NestJS 특징 성능 최적화

## 5. 오류 처리 및 디버깅 전략 
### 5.1 Node.js 의 강력한 오류 처리
### 5.2 NestJS 예외 필터 
### 5.3 Node.js 및 NestJS 애플리케이션 디버깅 

## 6. Node.js 보안 고려 사항 
### 6.1 일반적인 Node.js 보안 취약점 (OWASP 관점)
### 6.2 NestJS 보안 기능 및 모범 사례 

## 7. 배포 및 프로세스 관리
### 7-1. Node.js 애플리케이션 배포의 기본
- 프로덕션 빌드: NestJS 애플리케이션은 일반적으로 TS 파일로 작성된다. 그렇기에 실제 프로덕션 환경에서 배포되기 전에는 JS 파일로 컴파일(트랜스파일) 되어야 하며, 이때 개발 환경의 내용이 배제된 내용들이 dist 디렉터리에 컴파일된 파일들이 생성된다. 이러한 파일들은 node main.js 로 구동 시작점에서 부트스트래핑 된다.
- 애플리케이션 실행(node dist/main.js): 완성된 빌드는 진입점을 통해 애플리케이션이 시작될 수 있다. 
- 환경변수(NODE_ENV=production): 프로덕션 환경에서 애플리케이션을 실행하면, 구동되는 OS 는 환경변수 설정이 되어 있어야 합니다. 이는 단순 구분 목적이 아닌 일부 라이브러리등에서는 이 변수를 기반으로 성능, 기능 등의 차이가 있어 다른 동작이 발생할 수 있습니다(로깅, 최적화 등의 수준에서). 

### 7-2. NestJS 애플리케이션을 위한 프로세스 관리자 PM2
![](/assets/images/posts/2025-06/2025-06-05-0001.png)
- PM2: Node를 사용하는 서비스, 혹은 그렇지 않은 서비스들도 활용할 수 있는 정말 만능의 툴. 프로세스 관리, 모니터링, 로깅, 자동 재시작 등 서비스 사용에 있어 관리가 필요하면, 일단 써보면 되는 툴(~~무안단물~~)
- PM2의 역할: 애플리케이션의 예기치 않은 충돌에 자동 재시작으로 다운 타임을 최소화, CPU 및 메모리 사용량 등을 관리하여 모니터링 해주는 UI 등을 제공해준다. 
- 다중 CPU 코어 활용을 위한 '클러스터 모드': Node.js 는 원리상 단일 스레드 구조지만, PM2의 클러스터 모드(기본 fork 모드라고 부름)를 활성화 하면 다중 코어를 활용할 수 있고, 코드의 특별한 수정 없이 애플리케이션의 성능, 안정성을 크게 향상 시키는게 가능하다. exec_mode:"cluster" 및 "instances": "max"(혹은 특정 수)로 ecosystem.config.js 파일에 설정하여 활성화 해주면 된다. 
- Graceful Shutdown: 프로덕션 환경에서는 애플리케이션의 종료 전에 나머지 쿼리를 처리하는 등으로 데이터 소실을 일으키지 않을 수 있는가가 매우 중요하다(데이터베이스, 메시지 큐 등). 서버 자체에서도 SIGNAL 에 대한 처리를 통해 시스템의 문제에 대응하여 갑작스러운 종료를 대비할 수 있긴 하지만, 이에 대해 PM2를 활용하면 해당 구성을 구현하지 않아도, 기본적으로 SIGNAL 에 대한 보호 및 Graceful 한 종료를 만들어 준다. 
- ecosystem.config.js 의 예시 : 
  ```javascript
  // ecosystem.config.js [124, 125, 127, 129]
  module.exports = {
    apps :
  };
  ```
  ecosystem.config.js 를 활용함으로써 서버 하드웨어의 재부팅이나, 각종 에러가 발생하더라도 해당 config를 기반으로 production 환경의 node 애플리케이션을 자동으로 복구, 이 역시 다운타임을 최소화하거나, 설정 최적화를 자동으로 적용하는 역할을 한다. 
- 그러나 단점들: 
  - 클러스터 모드 사용은 단순한 CPU 활용률 증대를 넘어서 Node 프로세스를 여러개 복제하여 사용하는 구조지만, stateless 하지 못한 저장 구조를 갖추는 서비스의 경우 클러스터 모드 시 에러를 유발할 수 있다는 점에서 클러스터 모드 적용에 매우 신중이 생각해야 한다. 
  - 뿐만 아니라 외부 서비스 등을 사용한다거나, PM2 클러스터 모드로 고가용성을 노린다면 애플리케이션의 상태관리 전략을 고려해봐야 한다. 
  - 또한 Production 수준의 서비스를 위해 기껏 dist 폴더만을 서버 인스턴스에 설치한다고할 때, PM2는 이를 감싸는 구조이므로 자체 모니터링, 로깅 기능들이 포함되어 오버헤드를 야기한다. 
  - 다른 CICD 를 위한 도구들에 비해선 복잡한 서비스 의존성 처리 등이 어렵다는 점에서 단점이 될 수 있음.
  - 특히나 리눅스 환경에서의 이용성은 나쁘지 않음. 그러나 윈도우 기반에선 어려움이 있고, docker 나 kubernetes 와 중복되는 기능들로 DevOps 환경에서 크게 쓸모가 없고, 그 편의성에 비해 요 최근에 주목을 받지 못하고 있다. 
  - 결과적으로 간단한 서비스 서버 애플리케이션을 위해 거창한 docker나 kubernetes 가 필요없으면 써봄직한 프로그램이지만, 대용량 처리를 비롯 다양한 바운더리가 존재할 경우 사용이 오히려 제약을 느릴 수 있다. 

### 7-3. Docker 를 사용한 컨테이너화 
- Docker: 리눅스의 컨테이너 기반으로 구성된 프로그램으로 호스톼 상관 없이 Docker는 에플레키션 으로 감싸서, 호스트 컴퓨터에서의 애플리케이션의 종속성을 패키징, 개발, 테스트 및 프로덕션 환경 전반을 걸친 일관성을 제공해준다. 
- 기본 Dockerfile 구조 예시 
  ```Dockerfile
  # 1단계: 애플리케이션 빌드
  FROM node:18-alpine AS builder
  WORKDIR /usr/src/app
  COPY package*.json./
  RUN npm install
  COPY..
  RUN npm run build

  # 2단계: 프로덕션 이미지 생성
  FROM node:18-alpine
  WORKDIR /usr/src/app
  COPY --from=builder /usr/src/app/dist./dist
  COPY --from=builder /usr/src/app/node_modules./node_modules
  COPY --from=builder /usr/src/app/package*.json./
  EXPOSE 3000
  CMD ["node", "dist/main.js"]
  ```
- Docker는 이러한 기본적인 빌드 레퍼런스에서 시작하여 Docker compose, 이러한 이미지를 활용하는 kubernetes 까지 뻗어 나갈 수 있으며, 특히나 이 구조에 대한 이해도를 알게 된다면 CICD 의 핵심인 CD 파이프라이닝에 대해 적용도 가능해진다.(Jenkins, GitHub Actions 등)

## 8. 마치며
Node.js 에 대한 깊이 있는 이해는 단순하게 이론적 지식 증대의 의미를 가지진 않는다. Nestjs 프레임워크의 추상화 계층의 아래 단계의 실제 상황을 파악하는 구체적인 이미지를 보여준다. 애플리케이션의 성능을 미세 조정하고, 복잡한 문제를 효과적으로 개선, 보안의 강화나 정보에 입각한 구체적인 아키텍쳐 결정이 가능한데 Node.js 의 이해도는 NestJS 개발의 그 다음을 위해 반드시 필요한 학습의 과정이라고 볼 수 있다. 

V8 엔진의 내부 작동 방식, 이벤트 루프의 미묘한 동작, 비동기 프로그래밍에 대한 숙달과 다양한 모듈의 이해. 스트림이나 버퍼를 활용한 효율적인 데이터 처리 및 메모리 관리 기술, 워커 스레드를 활용한 연산 처리 등 NestJS 애플리케이션의 고난도 기능 구현을 위해 필수적인 요소들의 근간에는 Node.js가 있음을 다시 한번 강조할 수 있다. 

Node.js 의 오류 처리 메커니즘의 이해, NestJS의 예외 필터의 결합 방법, 다양한 디버깅 도구 및 기술의 효과적인 접목, 보안에 대한 모범 살졔 적용등은 프로덕션 환경에서의 안정적이고 안전한 애플리케이션을 보장하는데 매우 중요한 부분이라 평할 수 있겠다. 간단한 배포에 대한 기본 내용들인 PM2, 도커의 활용은 기본적인 빌드 프로세스의 이해도와, 개발의 라이프사이클의 기초를 다질 수 있는 포인트라고 볼 수 있겠다.(당연히 현실 라이브 서비스는 이보다 더 복잡하다는 점은 당연하게도 알아야 할 것이다.)

## 00. 참고문헌 : AI 학습 및 정보 출처 확인용
<details>
<summary>여기를 클릭하면 참고문헌 리스트가 열립니다</summary>

<ol>
<li><a href="https://docs.nestjs.com/v5/">Documentation - NestJS - A progressive Node.js web framework</a></li>
<li><a href="https://jelvix.com/blog/nestjs-vs-express">Comparing NestJS & Express.js: Which Framework is the Best - Jelvix</a></li>
<li><a href="https://www.pullrequest.com/blog/nestjs-vs-express-a-comparative-analysis-for-secure-and-efficient-web-development/">NestJS vs Express: A Comparative Analysis for Secure and Efficient Web Development</a></li>
<li><a href="https://nodejs.org/en/learn/getting-started/introduction-to-nodejs">Node.js — Introduction to Node.js</a></li>
<li><a href="https://slashdev.io/nl/-guide-to-building-secure-backends-in-nestjs-in-2024">Guide To Building Secure Backends In NestJS In 2024 - Slashdev</a></li>
<li><a href="https://www.packtpub.com/en-in/product/scalable-application-development-with-nestjs-9781835468609/chapter/chapter-1-overview-of-nestjs-2/section/the-ecosystem-of-nestjs-ch02lvl1sec07">The ecosystem of NestJS - Packt+ - Advance your knowledge in tech</a></li>
<li><a href="https://dev.to/rayenmabrouk/why-nestjs-is-the-new-gold-standard-for-node-backend-development-lm">Why NestJS Is The New Gold Standard For Node Backend ...</a></li>
<li><a href="https://www.presidio.com/getting-started-with-nestjs/">Getting started with NestJS - Presidio</a></li>
<li><a href="https://dev.to/leolanese/nestjs-performance-2kcb">NestJS Performance - DEV Community</a></li>
<li><a href="https://dev.to/geampiere/how-to-profile-a-nestjs-application-483n">How to Profile a NestJS Application - DEV Community</a></li>
<li><a href="https://dev.to/geampiere/what-is-the-stream-api-in-nodejs-and-how-can-we-use-it-in-nestjs-4n70">What Is the Stream API in Node.js and How Can We Use It in NestJS? - DEV Community</a></li>
<li><a href="https://last9.io/blog/understanding-worker-threads-in-node-js/">Node.js Worker Threads Explained (Without the Headache) - Last9</a></li>
<li><a href="https://www.geeksforgeeks.org/how-to-handle-cpu-intensive-loads-in-node-js/">How to Handle CPU Intensive Loads In Node JS ? - GeeksforGeeks</a></li>
<li><a href="https://betterstack.com/community/guides/scaling-nodejs/nodejs-streams/">Understanding Node.js Streams: A Comprehensive Guide - Better Stack Community</a></li>
<li><a href="https://www.dennisokeeffe.com/blog/2024-07-04-nodejs-buffers-explained">Node.js Buffers Explained - Dennis O'Keeffe</a></li>
<li><a href="https://www.geeksforgeeks.org/node-js-fs-createreadstream-method/">Node.js fs.createReadStream() Method - GeeksforGeeks</a></li>
<li><a href="https://www.geeksforgeeks.org/node-js-fs-createwritestream-method/">Node.js fs.createWriteStream() Method - GeeksforGeeks</a></li>
<li><a href="https://node-js.tistory.com/27">Node.js란? Node.js 특징 정리(이벤트 기반, 논 블로킹 I/O 모델)</a></li>
<li><a href="https://dev.to/leapcell/inside-the-nodejs-event-loop-a-deep-dive-152d">Inside the Node.js Event Loop: A Deep Dive - DEV Community</a></li>
<li><a href="https://www.nodejs-security.com/blog/owasp-nodejs-best-practices-guide">OWASP Node.js Best Practices Guide - Node.js Secure Coding</a></li>
<li><a href="https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html">Nodejs Security - OWASP Cheat Sheet Series</a></li>
<li><a href="https://snyk.io/articles/nodejs-security-best-practice/">Top 10 Node.js Security Best Practices for 2023 - Risks & Prevention ...</a></li>
<li><a href="https://www.devcentrehouse.eu/blogs/nestjs-dtos-pipes-scalable-backend-apps/">Using DTOs and Validation Pipes in NestJS - Dev Centre House ...</a></li>
<li><a href="https://docs.nestjs.com/controllers">Controllers - NestJS - A progressive Node.js framework</a></li>
<li><a href="https://docs.nestjs.com/middleware">Middleware - NestJS - A progressive Node.js framework</a></li>
<li><a href="https://docs.nestjs.com/pipes">Pipes - NestJS - A progressive Node.js framework</a></li>
<li><a href="https://www.geeksforgeeks.org/explain-v8-engine-in-node-js/">Explain V8 engine in Node.js - GeeksforGeeks</a></li>
<li><a href="https://rahulvijayvergiya.hashnode.dev/under-the-hood-of-nodejs-exploring-the-v8-javascript-engine">Under the Hood of Node.js: Exploring the V8 JavaScript Engine</a></li>
<li><a href="https://nodejs.org/en/learn/getting-started/the-v8-javascript-engine">The V8 JavaScript Engine - Node.js</a></li>
<li><a href="https://dev.to/omriluz1/v8-engine-optimization-techniques-1bcd">V8 Engine Optimization Techniques - DEV Community</a></li>
<li><a href="https://blog.platformatic.dev/optimizing-nodejs-performance-v8-memory-management-and-gc-tuning">Boost Node.js with V8 GC Optimization - Platformatic Blog</a></li>
<li><a href="https://digitalerena.com/node-js-topic31/">Understanding Memory Management in Node.js - DigitalErena</a></li>
<li><a href="https://www.ness.com/understand-how-to-reduce-memory-usage-of-promises-in-node-js/">Understand how to reduce memory usage of Promises in Node.js ...</a></li>
<li><a href="https://dev.to/omriluz1/hidden-classes-and-inline-caches-in-v8-43dd">Hidden Classes and Inline Caches in V8 - DEV Community</a></li>
<li><a href="https://www.digitalocean.com/community/tutorials/js-v8-engine">The V8 Engine and JavaScript Optimization Tips - DigitalOcean</a></li>
<li><a href="https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick">Node.js — The Node.js Event Loop</a></li>
<li><a href="https://nodejs.org/en/learn/asynchronous-work/overview-of-blocking-vs-non-blocking">Node.js — Overview of Blocking vs Non-Blocking</a></li>
<li><a href="https://docs.nestjs.com/fundamentals/async-providers">Documentation - NestJS - A progressive Node.js framework</a></li>
<li><a href="https://blog.postman.com/understanding-async-await-in-node-js/">Understanding Async/Await in Node.js - Postman Blog</a></li>
<li><a href="https://docs.nestjs.com/fundamentals/lifecycle-events">Lifecycle events - NestJS - A progressive Node.js framework</a></li>
<li><a href="https://docs.nestjs.com/microservices/basics">Microservices - NestJS - A progressive Node.js framework</a></li>
<li><a href="https://packmind.com/simplify-promises-async-await/">Simplify your promises with async/await: four examples - Packmind</a></li>
<li><a href="https://sematext.com/blog/node-js-error-handling/">Node.js Error Handling Best Practices: Hands-on Experience Tips</a></li>
<li><a href="https://dev.to/ngtrthvu3007/nestjs-request-lifecycle-2jhe">NestJS: Request Lifecycle - DEV Community</a></li>
<li><a href="https://betterstack.com/community/guides/scaling-nodejs/error-handling-nestjs/">NestJS Error Handling Patterns - Better Stack Community</a></li>
<li><a href="https://docs.nestjs.com/faq/request-lifecycle">Request lifecycle - FAQ - NestJS - A progressive Node.js framework</a></li>
<li><a href="https://codesignal.com/learn/courses/securing-and-testing-your-mvc-nestjs-app/lessons/session-based-authentication-with-passportjs-in-nestjs">Session-Based Authentication with Passport.js in NestJS - CodeSignal Learn</a></li>
<li><a href="https://www.geeksforgeeks.org/exception-filters-in-nestjs-handling-exceptions-gracefully/">Exception Filters in NestJS: Handling exceptions gracefully ...</a></li>
<li><a href="https://codesignal.com/learn/courses/adding-enterprise-features-to-your-mvc-nestjs-app/lessons/error-handling-in-nestjs">Error Handling in NestJS - CodeSignal Learn</a></li>
<li><a href="https://docs.nestjs.com/exception-filters">Exception filters - NestJS - A progressive Node.js framework</a></li>
<li><a href="https://betterstack.com/community/guides/scaling-nodejs/commonjs-vs-esm/">CommonJS vs. ES Modules - Better Stack Community</a></li>
<li><a href="https://blog.appsignal.com/2024/12/11/a-deep-dive-into-commonjs-and-es-modules-in-nodejs.html">A Deep Dive Into CommonJS and ES Modules in Node.js ...</a></li>
<li><a href="https://docs.nestjs.com/cli/scripts">Scripts - CLI - NestJS - A progressive Node.js framework</a></li>
<li><a href="https://dev.to/zenstok/how-to-create-and-download-files-of-unlimited-size-in-nodejsnestjs-48al">How to Create and Download Files of Unlimited Size in node.js ...</a></li>
<li><a href="https://moldstud.com/articles/p-nodejs-streams-and-buffers-the-ultimate-guide-for-developers">Mastering Node.js Streams and Buffers for Developers - MoldStud</a></li>
<li><a href="https://nodejs.org/en/learn/modules/how-to-use-streams">Node.js — How to use Streams</a></li>
<li><a href="https://docs.sheetjs.com/docs/demos/net/server/nestjs">Sheets in NestJS - SheetJS Community Edition</a></li>
<li><a href="https://github.com/nestjs/nest/blob/master/packages/common/file-stream/streamable-file.ts">nest/packages/common/file-stream/streamable-file.ts at master · nestjs/nest - GitHub</a></li>
<li><a href="https://docs.nestjs.com/techniques/server-sent-events">Server-Sent Events - NestJS - A progressive Node.js framework</a></li>
<li><a href="https://indicoder.tkssharma.com/blog/understand-nodejs-stream-and-buffers">Understand Node JS Stream and Buffers - Tarun Sharma - @indiTechCoder</a></li>
<li><a href="https://dev.to/sfundomhlungu/buffers-in-nodejs-what-they-do-why-you-should-care-46p1">Buffers in Node.js: What They Do & Why You Should Care - DEV Community</a></li>
<li><a href="https://www.geeksforgeeks.org/what-are-buffers-in-node-js/">What are Buffers in Node.js - GeeksforGeeks</a></li>
<li><a href="https://indicoder.tkssharma.com/blog/understand-nodejs-stream-and-buffers">Understand Node JS Stream and Buffers - Tarun Sharma - @indiTechCoder</a> </li>
<li><a href="https://gist.github.com/jonilsonds9/efc228e34a298fa461d378f48ef67836">Uploading binary file (buffer) using NestJS - Discover gists GitHub Gist</a></li>
<li><a href="https://www.geeksforgeeks.org/node-js-file-system/">Node.js File System - GeeksforGeeks</a></li>
<li><a href="https://accuweb.cloud/resource/articles/how-to-work-with-files-using-the-fs-module-in-node-js">How To Work with Files using the fs Module in Node.js? - AccuWeb.Cloud</a></li>
<li><a href="https://docs.nestjs.com/techniques/configuration">Configuration - NestJS - A progressive Node.js framework</a></li>
<li><a href="https://matcha.fyi/how-to-fix-memory-leaks-in-javascript-with-examples/">How to Fix Memory Leaks in JavaScript (With Examples) - matcha.fyi</a></li>
<li><a href="https://sematext.com/blog/nodejs-memory-leaks/">Debugging Node.js Memory Leaks: How to Detect, Solve or Avoid Them in Applications</a></li>
<li><a href="https://dev.to/geampiere/how-to-manage-memory-and-avoid-leaks-in-nestjs-applications-3geh">How to Manage Memory and Avoid Leaks in NestJS Applications - DEV Community</a></li>
<li><a href="https://www.netguru.com/blog/node-js-memory-leaks">Nodejs Memory Leak: How to Debug And Avoid Them? - Netguru</a></li>
<li><a href="https://www.hashstudioz.com/blog/unmasking-the-silent-killer-of-node-js-performance-mastering-the-art-of-memory-leak-debugging/">Unmasking the Silent Killer of Node.js Performance: Mastering the Art of Memory Leak Debugging - HashStudioz Technologies</a></li>
<li><a href="https://docs.nestjs.com/recipes/async-local-storage">Async Local Storage - NestJS - A progressive Node.js framework</a></li>
<li><a href="https://docs.nestjs.com/modules">Modules - NestJS - A progressive Node.js framework</a></li>
<li><a href="https://www.nicholasadamou.com/notes/worker-threads-in-nodejs">Worker Threads in Node.js: The Secret to High Performance Backends - Nicholas Adamou</a></li>
<li><a href="https://nodejs.org/download/release/v13.1.0/docs/api/worker_threads.html">Worker Threads - Node.js v13.1.0 Documentation</a></li>
<li><a href="https://github.com/chjj/bthreads">chjj/bthreads: worker threads for javascript - GitHub</a></li>
<li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer">SharedArrayBuffer - JavaScript - MDN</a></li>
<li><a href="https://www.nicholasadamou.com/notes/worker-threads-in-nodejs">Worker Threads in Node.js: The Secret to High Performance Backends - Nicholas Adamou</a></li>
<li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics">Atomics - JavaScript - MDN</a></li>
<li><a href="https://www.brilworks.com/blog/optimize-your-nest-js-app-performance/">Optimize Your Nest.js App Performance with These Practices - Brilworks</a></li>
<li><a href="https://www.growthaccelerationpartners.com/blog/lab-notes-looking-at-nestjs-framework-for-web-apps-overview-performance-thoughts">Insights- Growth Acceleration Partners</a></li>
<li><a href="https://docs.nestjs.com/techniques/validation">Validation - NestJS - A progressive Node.js framework</a></li>
<li><a href="https://www.tritondatacenter.com/node-js/production/design/errors">Error Handling in Node.js - Triton DataCenter</a></li>
<li><a href="https://dev.to/ruben_alapont/error-handling-in-nodejs-streams-best-practices-dhb">Error Handling in Node.js Streams: Best Practices - DEV Community</a></li>
<li><a href="https://nodejs.org/api/events.html">Events - Node.js v24.1.0 Documentation</a></li>
<li><a href="https://dev.to/hanzla-baig/debugging-javascript-like-a-pro-mastering-browser-devtools-nodejs-85g">Debugging JavaScript Like a Pro: Mastering Browser DevTools ...</a></li>
<li><a href="https://nodejs.org/en/learn/getting-started/debugging">Node.js — Debugging Node.js</a></li>
<li><a href="https://docs.nestjs.com/devtools/overview">Devtools - Overview - NestJS - A progressive Node.js framework</a></li>
<li><a href="https://www.youtube.com/watch?v=bV-DHjmwuZ0">Debug Node.js apps with Chrome DevTools (and TypeScript) - YouTube</a></li>
<li><a href="https://nodejs.org/api/debugger.html">Debugger - Node.js v24.1.0 Documentation</a></li>
<li><a href="https://stackoverflow.com/questions/49504765/debugging-nest-js-application-with-vscode">typescript - Debugging nest.js application with vscode - Stack Overflow</a></li>
<li><a href="https://moldstud.com/articles/p-creating-effective-logging-interceptors-in-nestjs-to-track-request-lifecycles">Creating Logging Interceptors in NestJS for Request Tracking ...</a></li>
<li><a href="https://www.hyperdx.io/blog/node-js-logging-best-practices">Node.js Logging Best Practices - HyperDX Blog</a></li>
<li><a href="https://betterstack.com/community/guides/logging/how-to-install-setup-and-use-pino-to-log-node-js-applications/">A Complete Guide to Pino Logging in Node.js - Better Stack Community</a></li>
<li><a href="https://dev.to/saint_vandora/cross-site-scripting-xss-attacks-in-nodejs-understanding-preventing-and-mitigating-risks-4b2p">Cross-Site Scripting (XSS) Attacks in Node.js: Understanding ...</a></li>
<li><a href="https://www.contrastsecurity.com/glossary/insecure-deserialization">What is Insecure Deserialization? - Contrast Security</a></li>
<li><a href="https://docs.cobalt.io/bestpractices/insecure-deserialization/">Insecure Deserialization – - Cobalt</a></li>
<li><a href="https://docs.nestjs.com/techniques/serialization">Serialization - NestJS - A progressive Node.js framework</a></li>
<li><a href="https://www.contrastsecurity.com/glossary/npm">What is npm? - Best Practices and How to Fix Security Vulnerabilities</a></li>
<li><a href="https://moldstud.com/articles/p-top-nestjs-security-best-practices-comprehensive-faq-for-developers">Best Practices for Securing NestJS Applications - MoldStud</a></li>
<li><a href="https://codesignal.com/learn/courses/securing-your-nestjs-app/lessons/securing-endpoints-with-jwt-guards">Securing Endpoints with JWT Guards - CodeSignal Learn</a></li>
<li><a href="https://www.digitalocean.com/community/tutorials/understanding-guards-in-nestjs">Understanding Guards in NestJS - DigitalOcean</a></li>
<li><a href="https://www.passportjs.org/packages/passport-nest/">passport-nest</a></li>
<li><a href="https://www.youtube.com/watch?v=S8Cjx5ua2JU&pp=0gcJCdgAo7VqN5tD">NestJS Authentication + Refresh Token With Passport.js - YouTube</a></li>
<li><a href="https://www.youtube.com/watch?v=BfDHPOiHlqU">NestJS JWT Authentication – Secure Your API Like a Pro! - YouTube</a></li>
<li><a href="https://docs.nestjs.com/security/authentication">Documentation - NestJS - A progressive Node.js framework</a></li>
<li><a href="https://codesignal.com/learn/courses/securing-your-nestjs-app/lessons/session-based-authentication-with-passportjs-in-nestjs">Session-Based Authentication with Passport.js in NestJS - CodeSignal Learn</a></li>
<li><a href="https://www.npmjs.com/package/%40tekuconcept%2Fnestjs-csrf">@tekuconcept/nestjs-csrf - npm</a></li>
<li><a href="https://snyk.io/blog/how-to-protect-node-js-apps-from-csrf-attacks/">How to protect Node.js apps from CSRF attacks - Snyk</a></li>
<li><a href="https://docs.nestjs.com/security/csrf">CSRF - NestJS - A progressive Node.js framework</a></li>
<li><a href="https://ru-nestjs-docs.netlify.app/techniques/security">Security - Documentation - NestJS - A progressive Node.js framework - Netlify</a></li>
<li><a href="https://docs.nestjs.com/security/helmet">Helmet - NestJS - A progressive Node.js framework</a></li>
<li><a href="https://github.com/gasangw/NestJS-Interview-Questions-And-Answers">gasangw/NestJS-Interview-Questions-And-Answers - GitHub</a></li>
<li><a href="https://docs.nestjs.com/security/best-practices">docs.nestjs.com</a></li>
<li><a href="https://moldstud.com/articles/p-effective-strategies-to-shield-your-nestjs-application-from-sql-injection-vulnerabilities">How to Protect Your NestJS Application from SQL Injection Attacks ...</a></li>
<li><a href="https://zerothreat.ai/blog/securing-nodejs-web-app-from-sql-injection-attacks">How to Stop SQL Injection Attacks in Node JS Web App? - ZeroThreat</a></li>
<li><a href="https://dev.to/ubaydah/managing-dependencies-in-nodejs-an-overview-of-npm-and-yarn-2g9n">Managing Dependencies in Node.js: An Overview of NPM and Yarn - DEV Community</a></li>
<li><a href="https://github.com/brocoders/nestjs-boilerplate/pull/1836">Switch from npm to Yarn for Better Dependency Management by ...</a></li>
<li><a href="https://docs.nestjs.com/cli/overview">Overview - CLI - NestJS - A progressive Node.js framework</a></li>
<li><a href="https://www.npmjs.com/package/%40jescrich%2Fnestjs-workflow">@jescrich/nestjs-workflow - NPM</a></li>
<li><a href="https://www.imaginarycloud.com/blog/npm-vs-yarn-which-is-better">Yarn vs NPM: Which package manager should I use? - Imaginary Cloud</a></li>
<li><a href="https://docs.nestjs.com/deployment">Deployment - NestJS - A progressive Node.js framework</a></li>
<li><a href="https://dev.to/mochafreddo/managing-nextjs-and-nestjs-applications-in-production-with-pm2-3j25">Managing Next.js and NestJS Applications in Production with PM2 ...</a></li>
<li><a href="https://www.npmjs.com/package/%40nestjs-mod%2Fpm2">@nestjs-mod/pm2 - npm</a></li>
<li><a href="https://github.com/vishalm/node-pm2-cluster-example">vishalm/node-pm2-cluster-example: This repository ... - GitHub</a></li>
<li><a href="https://pm2.keymetrics.io/docs/usage/application-declaration/">Ecosystem File - PM2</a></li>
<li><a href="https://pm2.keymetrics.io/docs/usage/cluster-mode/">Cluster Mode - PM2</a></li>
<li><a href="https://pm2.io/docs/runtime/best-practices/graceful-shutdown/">Graceful Shutdown - Best Practices - PM2 Documentation - PM2</a></li>
<li><a href="https://blog.logrocket.com/node-js-24-new/">Node.js 24 is here: What's new and what to expect - LogRocket Blog</a></li>
<li><a href="https://nodesource.com/blog/Node.js-version-24">Node.js 24 Is Here: What You Need to Know - NodeSource</a></li>
<li><a href="https://nodejs.org/en/blog/release/v24.0.0">Node.js — Node v24.0.0 (Current)</a></li>
<li><a href="https://www.bacancytechnology.com/blog/nodejs-24">Node.js 24: Latest Enhancements and Updates - Bacancy Technology</a></li>
<li><a href="https://dev.to/tak089/a-roadmap-to-evolve-from-beginner-to-expert-in-nestjs-and-nextjs-development-15ml">A Roadmap to Evolve from Beginner to Expert in NestJS and Next.js ...</a></li>
<li><a href="https://www.ccbp.in/blog/articles/node-js-roadmap">Node.js Roadmap for 2025: A Complete Guide - NxtWave</a></li>
<li><a href="https://community.nasscom.in/communities/mobile-web-development/nodejs-development-powering-future-real-time-applications">NodeJS Development: Powering the Future of Real-Time Applications - nasscom</a></li>
<li><a href="https://www.google.com/search?q=https://dev.to/dharmvachhani/the-future-of-nodejs-development-trends-challenges-and-opportunities-42oh%23:~:text%3DThe%2520NodeJS%2520ecosystem%2520will%2520continue,development%2520more%2520efficient%2520and%2520robust.">dev.to</a></li>
<li><a href="https://dev.to/dharmvachhani/the-future-of-nodejs-development-trends-challenges-and-opportunities-42oh">The Future of NodeJS Development: Trends, Challenges, and ...</a></li>
<li><a href="https://nodejs.org/en/blog/vulnerability/may-2025-security-releases">Node.js — Wednesday, May 14, 2025 Security Releases</a></li>
<li><a href="https://seclists.org/oss-sec/2025/q2/112">oss-sec: Re: Fwd: Node.js security updates for all active release lines, May 2025</a></li>
</ol>

</details>
