---
layout: post 
title: NestJS Deep Dive
subtitle: NestJS 를 정리해보자
categories: Backend
tags: 학습 Backend NestJS TypeScript Node
thumb: https://miro.medium.com/v2/resize:fit:3840/1*LsHTe083IpvKL5anH7b_NA.png
custom-excerpt: Gemini와 함께 NestJS의 핵심을 정리해 보았다.
banner:
  # video: https://vjs.zencdn.net/v/oceans.mp4
  video: https://miro.medium.com/v2/resize:fit:3840/1*LsHTe083IpvKL5anH7b_NA.png
  loop: true
  volume: 0.8
  muted: true                 # For mobile device background music play 
  start_at: 8.5
  image: https://miro.medium.com/v2/resize:fit:3840/1*LsHTe083IpvKL5anH7b_NA.png
  opacity: 0.618
  background: "#000"
  height: "100vh"
  min_height: "38vh"
  heading_style: "font-size: 4.25em; font-weight: bold; text-decoration: underline"
  subheading_style: "color: gold"
---

## 1. 서론: NestJS, 왜 선택해야 할까?
NestJS는 Node.js 환경에서 효율적이고 확장 가능한 서버 사이드 애플리케이션을 구축하기 위한 진보적인 프레임워크다. 이 프레임워크는 Angular의 아키텍처에서 영감을 받아 개발되었으며, TypeScript를 기본 언어로 적극 지원한다는 특징을 가집니다. TypeScript의 강력한 타입 시스템은 개발 과정에서 발생할 수 있는 잠재적인 오류를 미연에 방지하고, 코드의 가독성과 안정성을 크게 향상시킨다.   

백엔드 개발에서 NestJS의 강점은 여러 면에서 확인할 수 있다.

- 첫째, 모듈식 아키텍처를 채택하여 유연한 확장성을 제공하며, 다른 라이브러리와의 통합이 용이하다. 이는 대규모 프로젝트에서 코드의 재사용성을 높이고, 개발 과정을 체계적으로 관리할 수 있게 한다.

- 둘째, 객체 지향 프로그래밍(OOP)의 캡슐화 특성을 적극 활용하여 유사한 기능을 하는 컨트롤러와 서비스 등을 모듈 단위로 묶어 관리함으로써 코드의 응집도를 높이고 유지보수를 용이하게 한다. 

- 셋째, 의존성 주입(DI) 시스템을 내장하여 컴포넌트 간의 결합도를 낮추고 테스트 용이성을 극대화한다. 

이러한 특성들은 NestJS가 국내외, 특히나 빠른 대응이 필요한 스타트업에서 기존 Node 나 Express 기반의 프로젝트 대비 빠르게 인기를 얻으며 다양한 회사에서 프로젝트에 적용되는 주요 원인이 되고 있다.

전체 내용을 한 번 정리해가 된 이유는 다음과 같다.

1. NestJS 를 기반으로 하는 현재의 라이브 서비스를 보다 레퍼런스 철학에 맞는 형태로 유지하기 위하여, NestJS 개발 철학을 체득화하고 싶다. 

2. 라이프 사이클에 대해 좀더 고심하여 기존의 비즈니스 로직, 라우팅 과정 등에서 비즈니스 로직과 전 후처리에 대한 결합도를 낮추고 싶다. 

3. 위의 목표들을 위하여 심도있는 학습 전 빠르게 NestJS 에 대한 기초를 복습하고 싶다. 

이러한 이유로 정리해본다.

## 2. NestJS 핵심 구조 및 설계 원리
NestJS는 모듈(Module), 컨트롤러(Controller), 프로바이더(Provider)의 세 가지 핵심 구성 요소를 기반으로 애플리케이션을 구조화한다. 이들은 각각의 명확한 역할을 가지며 유기적으로 상호작용하여 견고하고 유지보수 가능한 백엔드 시스템을 구축할 수 있도록 돕는다.

### 2.1 모듈: 애플리케이션의 빌딩 블록
모듈은 NestJS 애플리케이션을 구성하는 빌딩 블록이자 기능들을 조합하여 작성한 응집체이다. 각 모듈은 관련된 컨트롤러, 서비스 등을 하나의 단위로 묶어 애플리케이션의 구조를 모듈화한다. 예를 들어, 사용자 관리 기능을 담은 모듈은 UserModule로, 게시판 기능은 BoardModule로 구성할 수 있다.

모듈의 주요 역할은 애플리케이션의 기능을 그룹화, 코드의 재사용성 및 유지보수성을 높이는 것이다. `@Module()` 데코레이터는 NestJS가 애플리케이션 구조를 구축하는 데 사용하는 메타데이터를 제공한다. 이 메타데이터에는 다음과 같은 핵심 속성들이 포함된다:

- `imports`: 현재 모듈에서 사용할 다른 모듈들의 목록이다. 이를 통해 모듈 간의 의존성을 명시적으로 관리할 수 있다.
- `controllers`: 이 모듈에서 사용하는 컨트롤러들의 목록이다.
- `providers`: 이 모듈에서 사용하는 서비스나 프로바이더들의 목록이다.
- `exports`: 이 모듈에서 제공하며, 이 모듈을 가져오는 다른 모듈에서 사용할 수 있도록 공개할 프로바이더들의 목록이다.

NestJS 애플리케이션은 반드시 하나의 루트 모듈(AppModule)을 가지며, 이 루트 모듈은 다른 기능별 모듈들을 포함하여 애플리케이션을 실행하는 데 필요한 모든 요소를 구성한다. 모듈 구성 전략으로는 도메인 주도 설계(DDD) 기반의 접근법이 권장된다. 이는 비즈니스 도메인을 먼저 모델링한 후, 해당 도메인에 따라 모듈을 분리하는 방식이다. 예를 들어, blog, user, auth와 같은 다른 도메인 이름을 가진 폴더를 생성하고 각 폴더 내에 해당 모듈 파일을 생성하는 방식이다.또한, DB 연결이나 Swagger API 생성과 같이 개발자 도메인에만 속하는 공통 기능은 common 폴더를 생성하여 모듈로 관리할 수 있다.

모듈 시스템의 장점은 명확하다. 1) 어떤 모듈이든 가져와 다른 곳에서 재사용할 수 있어 코드 중복을 방지하고 모듈성을 향상시킨다. 2) 강력한 의존성 주입(DI) 시스템을 제공하여 컴포넌트 간의 결합도를 낮춘다. 3) 기능에 문제가 있을 때 작업해야 하는 코드를 빠르게 찾을 수 있어 디버깅 및 유지보수가 용이하다. 4) 마지막으로, NestJS의 모듈 시스템은 개발자를 서비스 지향적 사고의 방향으로 이끌어 주어, 각 기능의 책임을 명확히 분리하고 응집도를 높이는 데 기여한다.

### 2.2 컨트롤러 (Controllers): 요청 처리의 관문
컨트롤러는 클라이언트로부터 들어오는 요청을 처리하고 적절한 응답을 반환하는 역할을 한다. Express 프레임워크의 라우터(Router)와 유사하게, 컨트롤러는 라우팅 메커니즘을 이용하여 특정 URL 엔드포인트에 대한 요청을 구분하고 매칭한다.

컨트롤러 클래스는 `@Controller()` 데코레이터를 사용하여 정의된다. 이 데코레이터는 클래스를 필요한 메타데이터와 연결하고 라우터 기능을 활성화한다. @Controller() 데코레이터 내부에 인자값을 넣어 경로를 설정할 수 있으며, @Get(), @Post(), @Put(), @Delete()와 같은 HTTP 메서드 데코레이터를 사용하여 특정 HTTP 요청에 대한 핸들러 메서드를 정의한다.

컨트롤러는 직접적으로 복잡한 비즈니스 로직을 처리하지 않는다. 대신, 요청을 받아 서비스 계층으로 위임하고, 서비스에서 처리된 결과를 받아 클라이언트에 응답을 반환하는 역할을 수행한다. 이러한 역할 분리는 단일 책임 원칙(SRP)을 준수하며, 코드의 가독성과 유지보수성을 높이는 데 기여한다.

### 2.3 프로바이더 (Providers) & 서비스 (Services): 비즈니스 로직의 심장
프로바이더는 NestJS의 근본적인 개념으로, `서비스(Service)`, `리포지토리(Repository)`, `팩토리(Factory)`, `헬퍼(Helper)` 등 NestJS의 많은 기본 클래스들이 프로바이더로 취급된다. 프로바이더의 핵심 아이디어는 의존성 주입(DI)을 통해 다른 컴포넌트에 주입될 수 있다는 것이다. NestJS 프레임워크는 내부적으로 IoC(Inversion of Control) 컨테이너를 만들어 이 프로바이더들을 관리한다.

`서비스`는 프로바이더의 가장 흔한 형태로, 애플리케이션의 핵심 비즈니스 로직을 처리하는 역할을 한다. 데이터 생성, 조회, 변경, 삭제와 같은 데이터 가공 작업이 서비스 계층의 책임이다. 여러 컨트롤러에서 재사용되는 로직은 서비스로 분리하여 코드 중복을 피하고 유지보수성을 높일 수 있다.

서비스 클래스는 `@Injectable()` 데코레이터를 사용하여 정의된다. 이 데코레이터는 해당 클래스가 NestJS IoC 컨테이너에 의해 관리될 수 있는 주입 대상임을 NestJS에 알린다. @Injectable() 데코레이터가 붙은 서비스는 모듈의 providers 배열에 '등록'되어야 컨트롤러에서 의존성 주입을 통해 사용할 수 있게 된다.

프로바이더와 서비스, 그리고 컨트롤러의 관계는 공급자-제품-소비자 비유로 쉽게 이해할 수 있다. 서비스가 '제품'이라면, 프로바이더는 이 제품을 '공급'하는 역할을 하며, 컨트롤러는 이 제품을 '소비'하는 주체이다. 공급자가 제품을 제공해야 소비자가 사용할 수 있듯이, 프로바이더에 서비스가 등록되어야 컨트롤러에서 주입받아 사용이 가능하다. 이러한 구조는 비즈니스 로직과 통신 계층의 관심사를 명확하게 분리하여 유연하고 지속 가능한 아키텍처를 제공한다.

### 2.4 의존성 주입 (Dependency Injection, DI): 제어의 역전
의존성 주입(DI)은 NestJS의 핵심 개념 중 하나이자 제어의 역전(IoC) 기술의 구체적인 구현체이다. 제어의 역전이란 개발자가 직접 제어해야 할 영역을 프레임워크에 위임하는 것을 의미하며, DI는 개발자가 필요한 외부 자원(클래스, 함수 등)을 직접 생성하는 대신 프레임워크로부터 제공받을 수 있도록 하는 방식이다.

![](/assets/images/posts/2025-05/2025-05-26-0001.png)

예를 들어, 아이가 냉장고에서 스스로 물건을 꺼내는 대신 부모님에게 필요한 것을 말하면 부모님이 대신 가져다주는 상황과 유사하다. 이는 아이(소비자)가 냉장고 문을 열고 물건을 찾는 복잡한 과정(의존성 생성 및 관리)을 직접 처리하는 대신, 부모님(프레임워크)에게 그 일을 위임하여 필요한 것을 공급받는 것과 같다. NestJS에서는 이처럼 프레임워크가 주체가 되어 필요한 클래스 인스턴스들을 대신 관리하고 주입해준다.

NestJS에서 의존성 주입은 주로 생성자 주입(Constructor Injection) 방식을 통해 이루어진다. 컨트롤러 클래스의 생성자 매개변수로 필요한 서비스 인스턴스를 선언하면, NestJS는 해당 서비스의 타입을 인지하고 자동으로 인스턴스를 주입한다. 이 덕분에 별도의 import 작업 없이도 주입된 서비스의 메서드를 호출할 수 있다. 필드 위에 @Inject() 데코레이터를 사용하는 프로퍼티 스타일 주입도 가능하지만, NestJS 공식 문서에서는 생성자 주입을 권장한다.

**DI의 이점은 다음과 같다:**

- **결합도 감소**: 컴포넌트들이 서로의 구체적인 구현에 직접 의존하지 않고 추상화(인터페이스)에 의존하게 되어, 컴포넌트 간의 결합도가 낮아진다. 이는 코드 변경 시 다른 부분에 미치는 영향을 최소화한다. 각 영역에 대해 필요한 변화나, 개선이 필요시 각기 규역이 맞는다는 전제하에 변화가 용이하다.

- **테스트 용이성**: 의존성을 외부에서 주입받으므로, 단위 테스트 시 실제 의존성 대신 모의(Mock) 객체를 쉽게 주입하여 테스트 환경을 고립시킬 수 있다.

- **코드 단순화 및 재사용성**: 필요한 자원을 프레임워크가 관리해주므로 개발자는 비즈니스 로직에 더 집중할 수 있으며, 동일한 객체를 여러 곳에서 재사용하기 용이해진다.

- **유연성 및 확장성 향상**: 의존성 관계가 명확해지고 느슨해지므로, 새로운 기능을 추가하거나 기존 기능을 변경할 때 유연하게 대처할 수 있다.

### 2.5 데코레이터 (Decorators): NestJS의 마법 지팡이
데코레이터는 NestJS에서 매우 중요한 개념이다. 클래스, 속성, 메서드, 매개변수에 추가 기능을 쉽게 적용할 수 있도록 돕는 문법이다. C#의 어트리뷰트와 유사하며, JavaScript에서는 @ 기호를 앞에 붙여 사용한다. NestJS는 데코레이터를 통해 클래스나 메서드에 메타데이터를 추가하거나 특정 동작을 부여할 수 있다.

NestJS에서 자주 사용되는 주요 내장 데코레이터는 다음과 같다:

`@Controller()`: 클래스를 컨트롤러로 정의하고 라우팅 기능을 부여한다.

`@Injectable()`: 클래스를 의존성 주입의 대상으로 선언하고 IoC 컨테이너가 관리할 수 있도록 한다.

`@Get(), @Post(), @Put(), @Delete()`: HTTP 요청 메서드에 해당하는 라우트 핸들러를 정의한다.

`@Body()`: HTTP 요청 본문(body)에서 데이터를 추출하여 매개변수에 할당한다.

`@Param()`: URL 경로 매개변수에서 값을 추출한다 (예: /users/:id에서 id 값).

`@Query()`: URL 쿼리 파라미터에서 값을 추출한다 (예: /users?name=Alice에서 name 값).

NestJS는 개발자가 직접 커스텀 데코레이터를 만들 수 있는 기능도 제공한다. `createParamDecorator` 함수를 사용하여 사용자 정의 데코레이터를 생성할 수 있으며, 이는 특정 요청에서 사용자 객체를 가져오거나, 특정 메타데이터를 설정하는 등 반복적인 로직을 추상화하여 코드의 재사용성과 가독성을 높이는 데 유용하다.

## 3. NestJS 애플리케이션 라이프사이클 심층 분석
NestJS 애플리케이션은 시작부터 종료, 그리고 요청 처리 과정에 이르기까지 명확한 라이프사이클을 가진다. 이 흐름을 이해하는 것은 애플리케이션의 동작 방식을 파악하고 문제를 해결하는 데 필수적이다.

### 3.1 애플리케이션 부트스트랩(Bootstrap) 과정 
NestJS 애플리케이션의 진입점은 일반적으로 main.ts 파일이다. 이 파일에서 NestFactory.create() 메서드를 사용하여 NestJS 애플리케이션 인스턴스를 생성하고 초기화한다. 이후 app.listen() 메서드를 호출하여 애플리케이션이 들어오는 HTTP 요청을 수신 대기하도록 한다.

```TypeScript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT?? 3000);
}
bootstrap();
```
이 부트스트랩 과정은 애플리케이션의 모든 모듈과 프로바이더가 초기화되고 의존성이 해결되는 중요한 단계이다. NestFactory.createApplicationContext()를 사용하여 애플리케이션 컨텍스트를 생성하고 ConfigService와 같은 구성 서비스를 통해 환경 변수에 접근하는 것도 가능하다. 이는 애플리케이션이 시작되기 전에 필요한 설정을 로드하는 데 활용될 수 있다.

### 3.2 라이프사이클 후크(Lifecycle Hooks): 생명의 주기
NestJS는 애플리케이션의 주요 생명 주기 이벤트에 대한 가시성을 제공하는 다양한 라이프사이클 후크를 제공한다. 이 후크들은 특정 시점에 로직을 실행할 수 있도록 하여 모듈 및 서비스의 적절한 초기화, 활성 연결 관리, 그리고 정상적인 종료 처리를 가능하게 한다.

| 후크 메서드 | 호출 시점 | 주요 역할 |
| --------- | -------- | -------- |
| onModuleInit() | 호스트 모듈의 종속성이 해결되면 호출 | 동기 또는 비동기 초기화 작업 (예: 데이터베이스에서 데이터 가져오기) | 
| onApplicationBootstrap() | 모든 모듈이 초기화된 후 연결을 수신 대기하기 전에 호출 | 애플리케이션이 요청을 받기 전 최종 초기화 작업 |
| onModuleDestroy() | 종료 신호(예: SIGTERM)가 수신된 후 호출 | 모듈 내부의 자원 정리 (예: DB 연결 해제) |
| beforeApplicationShutdown() | 모든 onModuleDestroy() 처리기가 완료된 후 호출 | 모든 기존 연결이 닫히기 전 최종 정리 작업 (Promise 해결 또는 거부 완료 시) |
| onApplicationShutdown() | 연결 종료 후 호출 (app.close() 해결) | 애플리케이션 종료 후 최종 작업 (예: 로그 기록) |

`onModuleInit()`과 같은 비동기 라이프사이클 후크의 경우, 모듈은 위상 순서(topological order)로 순차적으로 초기화되지만, 동일 모듈 내 프로바이더의 onModuleInit() 호출 순서는 보장되지 않을 수 있다. 이는 때때로 프로바이더 간의 비동기 의존성 문제로 이어질 수 있으며, 이를 완화하기 위해 각 비동기 후크를 가진 프로바이더를 별도의 모듈에 배치하는 방법이 제안되기도 한다.

`onModuleDestroy()`, `beforeApplicationShutdown()`, `onApplicationShutdown()`와 같은 종료 후크들은 `enableShutdownHooks()` 메서드를 명시적으로 호출해야 활성화된다. 이는 Kubernetes와 같은 환경에서 애플리케이션이 종료 신호를 받았을 때 정상적인 종료(Graceful Shutdown)를 처리하는 데 중요한다. 이러한 후크를 사용하여 애플리케이션의 생명 주기를 섬세하게 제어하고, 자원 누수를 방지하며 안정적인 운영을 보장할 수 있다.

### 3.3 요청-응답 라이프사이클 (Request-Response Lifecycle): 데이터의 여정
NestJS 애플리케이션에서 클라이언트의 요청이 들어와 응답이 반환되기까지는 일련의 정해진 흐름을 따른다. 이 흐름은 미들웨어, 가드, 인터셉터, 파이프, 컨트롤러, 서비스, 그리고 예외 필터와 같은 다양한 구성 요소들이 순차적으로 또는 조건부로 개입하며 요청을 처리하고 응답을 생성한다.

`들어오는 요청` -> `전역 미들웨어` -> `모듈 미들웨어` -> `전역 가드` -> `컨트롤러 가드` -> `라우트 가드` -> `전역 인터셉터 (pre-controller)` -> `컨트롤러 인터셉터 (pre-controller)` -> `라우트 인터셉터 (pre-controller)` -> `전역 파이프` -> `컨트롤러 파이프` -> `라우트 파이프` -> `라우트 파라미터 파이프` -> `컨트롤러 (메서드 핸들러)` -> `서비스 (비즈니스 로직)` -> `라우트 인터셉터 (post-request)` -> `컨트롤러 인터셉터 (post-request)` -> `전역 인터셉터 (post-request)` -> `예외 필터 (라우트, 컨트롤러, 전역 순)` -> `서버 응답`

| 단계 | 순서 | 역할 | 주요 특징
|---|---|---|---|
| 미들웨어 (Middleware) | 1 | 요청 및 응답 객체 변경, 로깅, 인증 등 공통 작업 처리 | 요청-응답 주기의 첫 관문, next() 호출로 다음 미들웨어로 제어 전달 |
| 가드 (Guards) | 2 | 런타임에 요청이 라우트 핸들러에 의해 처리될지 여부 결정 (인증/인가) | 미들웨어와 달리 ExecutionContext에 접근 가능, 모든 미들웨어 실행 후 인터셉터/파이프 이전에 실행 |
| 인터셉터 (Interceptors) | 3 | 요청이 핸들러에 도달하기 전/응답이 클라이언트에 전송되기 전 가로채기 | 로깅, 데이터 변환, 에러 처리 등에 사용. Pre-processing 및 Post-processing 단계 존재 |
| 파이프 (Pipes) | 4 | 클라이언트로부터 전송되거나 수신되는 데이터의 유효성 검사, 변환, 필터링  | @nestjs/common의 ValidationPipe와 class-validator 라이브러리 활용 |
| 컨트롤러 (Controller) | 5 | 클라이언트의 요청을 받아 처리하고 응답을 반환하는 역할 | 라우팅 메커니즘을 통해 요청을 서비스로 위임 |
| 서비스 (Service) | 6  | 비즈니스 로직을 처리하는 역할 | 컨트롤러에서 위임받은 작업을 수행 (데이터 처리, 외부 API 호출 등) |
| 예외 필터 (Exception Filters) | 7 | NestJS 요청 라이프사이클의 모든 단계에서 발생하는 예외/에러 처리 | 에러 메시지 커스터마이징, 로깅 등. 포착되지 않은 예외 발생 시에만 작동 |

각 단계의 역할은 다음과 같다.

- **미들웨어 (Middleware)**: 요청이 서버에 도달했을 때 가장 먼저 실행되는 부분이다. 요청 및 응답 객체에 접근하여 `로깅`, `인증`, `CORS` 설정 등 공통 작업을 처리하는 데 사용된다. 미들웨어는 next() 함수를 호출하여 다음 미들웨어 또는 라우트 핸들러로 제어를 전달한다. 글로벌 미들웨어와 모듈에 바인딩된 미들웨어가 순차적으로 실행된다.
- **가드 (Guards)**: 모든 미들웨어 실행 후, 인터셉터나 파이프 이전에 실행된다. 가드의 주된 목적은 런타임에 요청이 라우트 핸들러에 의해 처리될지 여부를 결정하는 것으로, 주로 인증 및 인가 처리에 사용된다. 미들웨어와 달리 `ExecutionContext` 인스턴스에 접근하여 다음에 실행될 핸들러에 대한 정보를 알 수 있다는 차이점이 있다. 가드는 글로벌, 컨트롤러, 라우트 레벨로 바인딩될 수 있으며, 바인딩된 순서대로 실행된다.
- **인터셉터 (Interceptors)**: 요청이 핸들러에 도달하기 전(pre-processing) 또는 응답이 클라이언트에 전송되기 전(post-processing)에 요청/응답을 가로챌 수 있다. 로깅, 데이터 변환(예: 응답 데이터를 data 키 안에 캡슐화), 에러 처리 등에 활용된다. 인터셉터는 RxJS Observable을 반환하며, 응답 경로에서는 'First In Last Out' 방식으로 역순으로 해결된다.
- **파이프 (Pipes)**: 클라이언트로부터 전송되거나 수신되는 데이터의 유효성 검사, 변환, 필터링을 담당한다. 예를 들어, 요청 본문의 데이터 형식을 원하는 형식으로 변환하거나, 데이터가 올바른지 검증하는 데 사용된다. `class-validator` 및 `class-transformer` 라이브러리와 함께 `ValidationPipe`를 사용하여 데코레이터 기반의 강력한 유효성 검사를 구현할 수 있다. 파이프는 예외 영역(exception zone) 내에서 실행되므로, 파이프에서 발생하는 예외는 `예외 필터`에서 처리된다.
- **컨트롤러 (Controller) 및 서비스 (Service)**: 이 단계에서 컨트롤러는 요청을 받아 서비스로 비즈니스 로직 처리를 위임하고, 서비스는 실제 데이터 처리 및 로직을 수행한다. 서비스에서 처리된 결과는 다시 컨트롤러로 반환되어 최종 응답이 구성된다.
- **예외 필터 (Exception Filters)**: NestJS 요청 라이프사이클의 모든 단계(미들웨어, 가드, 인터셉터, 파이프, 컨트롤러, 서비스 등)에서 포착되지 않은 예외/에러가 발생했을 때 호출된다. 예외 필터는 에러 메시지를 원하는 형태로 가공하여 응답하거나, 에러 로깅 등의 작업을 수행할 수 있다. NestJS는 내장된 전역 예외 필터를 제공하며, 개발자는 필요에 따라 커스텀 예외 필터를 작성하여 특정 예외를 섬세하게 처리할 수 있다. 예외가 발생하면 나머지 라이프사이클은 무시되고 즉시 예외 필터로 제어가 넘어간다.

## 4. 백엔드 서버 관점에서의 NestJS 활용
NestJS는 백엔드 서버 개발에 필요한 다양한 기능을 효율적으로 구현하고 관리할 수 있도록 지원한다.

### 4.1 인증 및 인가 (Authentication & Authorization)
백엔드 서버에서 사용자 인증(Authentication)과 인가(Authorization)는 필수적인 기능이다. 인증은 사용자의 신원을 증명하는 행위이며, 인가는 증명된 사용자에게 특정 자원에 대한 접근 권한을 부여하거나 거부하는 행위이다.

NestJS는 JWT(JSON Web Token)와 Session 기반 인증 방식을 모두 지원하며, 특히 Passport.js 라이브러리와의 통합을 통해 인증 및 인가 과정을 간소화한다. Passport.js는 다양한 인증 전략(예: JWT, 로컬, OAuth)을 플러그인 형태로 제공하여 유연한 구현을 가능하게 한다.

- `JWT 인증`: 사용자가 아이디와 비밀번호를 서버로 보내면, 서버는 JWT를 발급하여 클라이언트(브라우저)로 넘겨준다. 이후 클라이언트는 로그인 권한이 필요한 페이지를 요청할 때마다 HTTP Authorization 헤더에 `Bearer <JWT>` 형태로 토큰을 함께 보내 신분증처럼 사용하며, 서버는 이 토큰을 검증하여 접근을 허용한다. NestJS에서는 passport-jwt 패키지를 설치하고 PassportStrategy를 구현하여 JWT 토큰 검증 로직을 작성한다. secretOrKey를 통해 토큰 생성 시 사용한 비밀키를 설정하고, validate 메서드에서 토큰 검증 성공 시 사용자 객체를 Request.user에 저장하여 이후 로직에서 활용할 수 있도록 한다.
- `Session 인증`: 클라이언트의 상태 정보를 서버에 저장하여 다루는 기술이다. 사용자가 로그인하면 서버는 SessionID를 발급하여 서버의 세션 목록에 추가하고, 이 SessionID를 사용자의 브라우저 쿠키에 저장하여 통행증처럼 사용한다. 이후 요청 시 클라이언트가 SessionID를 보내면 서버는 이를 세션 목록에서 확인하여 접근을 허용한다. JWT와 달리 민감한 정보가 서버에 저장되어 비교적 안전하지만, 요청마다 서버에서 확인하는 작업이 필요하여 부하가 걸릴 수 있다. 추가로 이러한 지속적인 상태 정보 저장은 stateful 한 특성으로 통상적인 서버에 비해 보다 많은 자원이 필요시 될 수 있다.

가드(Guard)는 NestJS에서 인가 처리에 핵심적인 역할을 수행하며, @UseGuards() 데코레이터를 사용하여 특정 라우트나 컨트롤러에 적용할 수 있다.

### 4.2 데이터베이스 연동
NestJS는 TypeORM, Prisma와 같은 다양한 ORM(Object-Relational Mapping) 도구와의 통합을 강력하게 지원하여 데이터베이스와의 상호작용을 간소화한다. ORM은 JavaScript 객체를 사용하여 관계형 데이터베이스의 테이블에 접근할 수 있게 해주어, SQL 쿼리 없이도 데이터를 다룰 수 있게 한다.

- TypeORM: 다양한 데이터베이스 시스템을 지원하며, 코드의 일관성을 유지하면서 유연하게 데이터베이스를 다룰 수 있도록 돕는다. TypeOrmModule.forRoot()를 사용하여 데이터베이스 연결 설정을 초기화하고 엔티티 클래스를 지정한다. Prisma 에 비하면 비교적 고전적인 형태지만, 그만큼 다양한 서버 연결구조나 데이터베이스 시스템의 다양한 활용성을 보장하는 편에서 비교적 사용이 용이할 수 있다.
- Prisma: 현대적인 ORM 도구로, 높은 수준의 타입 안정성을 보장하면서 효율적인 데이터베이스 작업을 가능하게 한다. Rust로 작성된 쿼리 엔진을 사용하며, schema.prisma 파일을 통해 데이터 모델과 관계를 쉽게 정의할 수 있다. PrismaService를 생성하여 NestJS 모듈 시스템에서 Prisma Client를 초기화하고 데이터베이스에 연결할 수 있다. NoSQL 을 포함하여 다양하고 현대적인 연결을 제공하지만, 한 편으로 TypeORM 에 비하면 데이터베이스의 다양한 시스템에 대응되는 수준 까진 아닌 경우가 있어, 데이터베이스의 복잡한 사용에 대응하기 어려울 수 있다는 점은 감안해야한다.

### 4.3 데이터베이스 쿼리 최적화:
성능이 중요한 백엔드 애플리케이션에서 데이터베이스 쿼리 최적화는 필수적이다.

- 인덱스 사용: 자주 쿼리되거나 WHERE 절에 사용되는 컬럼에 `인덱스를 추가하여 데이터베이스가 필요한 데이터를 빠르게 찾을 수 있도록` 한다.
- SELECT * 지양: 모든 컬럼을 선택하는 대신, `필요한 특정 컬럼만` 선택하여 반환되는 데이터의 양을 줄이고 쿼리 속도를 높인다.
- Eager Loading 활용: 연관된 엔티티를 자주 로드하는 경우, `Eager Loading`을 사용하여 여러 쿼리를 실행하는 대신 한 번에 모든 관련 데이터를 가져와 쿼리 수를 줄인다.

### 4.4 테스트 전략
NestJS는 효과적인 테스트를 포함한 개발 모범 사례를 장려하며, Jest를 기본 테스트 프레임워크로 권장한다. NestJS 프로젝트를 생성할 때 Jest가 함께 주입되어 단위 테스트 및 E2E 테스트를 위한 기본 도구를 제공한다. 테스트 환경에서 Nest의 의존성 주입 시스템을 활용하여 컴포넌트를 쉽게 모킹(Mocking)할 수 있다.

테스트는 범위에 따라 크게 세 가지 유형으로 나뉜다:

1. **단위 테스트 (Unit Test)**: 애플리케이션을 구성하는 가장 작은 단위 기능(예: 단일 함수, 클래스 메서드)에 대한 테스트이다. NestJS에서는 서비스와 같은 단위 기능에 대한 테스트를 Jest를 사용하여 작성한다.

2. **통합 테스트 (Integration Test)**: 애플리케이션을 구성하는 여러 모듈 간의 상호작용에 대한 테스트이다. 개발자의 관점에서 모듈 간의 연동이 의도대로 동작하는지 확인하는 데 초점을 둔다. NestJS는 @nestjs/testing 패키지의 Test 클래스를 사용하여 테스트 모듈을 생성하고 특정 인스턴스를 검색하여 통합 테스트를 용이하게 한다.

3. **E2E 테스트 (End-to-End Test)**: 최종 사용자의 관점에서 애플리케이션이 시나리오대로 전체적으로 작동하는지 확인하는 테스트이다. 외부로부터의 요청부터 응답까지 기능이 잘 동작하는지에 대한 테스트이며, 실제 사용자 경험을 시뮬레이션한다. test 디렉토리에 위치하는 것이 일반적이다.

테스트 코드를 작성하는 것은 개발 안정성, 유지보수의 용이성, 그리고 디버깅 시간 단축에 크게 기여한다.

### 4.5 성능 최적화
NestJS 애플리케이션의 성능을 최적화하기 위한 다양한 기법들이 있다.

- **캐싱 (Caching)**: 자주 접근하는 데이터를 메모리에 임시로 저장하여 애플리케이션의 속도를 높이는 기법이다. NestJS는 cache-manager 라이브러리를 통해 캐싱 구현을 지원한다. 캐싱 시에는 적절한 만료 시간을 설정하고, 데이터 업데이트 시 캐시를 무효화하며, 여러 서버에서 실행되는 경우 분산 캐시를 사용하는 것이 중요하다.
- **압축 (Compression)**: 애플리케이션과 클라이언트 간에 전송되는 데이터 양을 줄여 성능을 향상시키는 기법이다. NestJS에서는 compression 미들웨어를 사용하여 응답 데이터를 압축할 수 있다. 압축 수준을 적절히 설정하고, 모든 응답을 압축하며, CPU 집약적인 압축 작업을 캐싱하는 것을 고려해야 한다.
- **Fastify 런타임 활용**: NestJS는 기본적으로 Express를 런타임으로 사용하지만, Fastify 프레임워크를 래핑하여 동작할 수도 있다. Fastify는 Express보다 훨씬 높은 성능을 제공하며, 특히 API 중심의 애플리케이션과 마이크로서비스에 적합하다. 벤치마크 테스트에 따르면, Fastify는 Express보다 초당 요청 처리량에서 5배 이상 빠른 성능을 보였다. 이는 Fastify가 효율성과 낮은 오버헤드에 중점을 둔 설계와 이벤트 기반 아키텍처, 스키마 기반 유효성 검증을 사용하기 때문이다. 고성능이 요구되는 백엔드 애플리케이션에서는 Fastify를 런타임으로 선택하는 것이 유리할 수 있다.

| 특징 | Express | Fastify |
| ---- | ------- | ------- |
| 요청 처리 속도 (RPS) | 약 20,000 | 약 114,000 (5.6배 이상 빠름) |
| 메모리 사용량 (1만 동시 연결 시) | 약 150MB | 약 100MB |
| 내장 유효성 검증 | 없음 (외부 라이브러리 필요) | 스키마 기반 내장 (Ajv 사용) |
| 내장 로깅 | 없음 (외부 라이브러리 필요) | 내장 (Pino 사용) |
| TypeScript 지원 | 커뮤니티 유지보수 `@types/express` | 네이티브 지원 |
| HTTP/2 지원 | 없음 (외부 라이브러리 필요) | 네이티브 지원 |
| 주요 특징 | 단순성, 유연성, 광범위한 생태계 |효율성, 낮은 오버헤드, 내장 유효성 검증, 구조화된 플러그인 |

- **Docker 최적화**: NestJS 애플리케이션을 Docker 컨테이너로 배포할 때, Dockerfile 및 .dockerignore 파일 최적화를 통해 빌드 시간과 이미지 크기를 크게 줄일 수 있다. `.dockerignore` 파일을 사용하여 node_modules/, dist/, .git 등 빌드에 불필요한 파일과 디렉토리를 제외한다. 또한, 멀티스테이지 빌드를 사용하여 빌드 단계와 프로덕션 단계를 분리함으로써, `최종 이미지에는 필요한 파일과 설정만 포함되도록 하여` 이미지 크기를 대폭 감소시킬 수 있다. 이는 `CI/CD 파이프라인에서 빌드 및 배포 효율성`을 높이는 데 기여한다.

### 4.6 고급 활용 패턴 (간략 소개)
NestJS는 견고하고 확장 가능한 애플리케이션을 구축하기 위한 다양한 고급 아키텍처 패턴과 모범 사례를 적용할 수 있도록 지원한다.

- **순환 의존성 해결 (forwardRef())**: 두 개 이상의 모듈이 서로를 참조하는 순환 종속성(Circular Dependency)은 애플리케이션 초기화 실패, 무한 루프 등의 문제를 야기할 수 있다. NestJS에서는 @nestjs/common 패키지에서 제공하는 forwardRef() 기능을 사용하여 클래스에 중첩을 허용함으로써 이러한 순환 종속성 문제를 해결할 수 있다. 그 외에도 Shared Module 전략 등을 통해 의존성을 해결해줄 수 있다. 
- **클린 아키텍처 (Clean Architecture) 및 DDD**: NestJS는 모듈 기반 아키텍처와 의존성 주입을 통해 클린 아키텍처(Clean Architecture) 또는 헥사고날 아키텍처(Hexagonal Architecture)와 같은 계층형 아키텍처 패턴을 쉽게 적용할 수 있다. 클린 아키텍처는 애플리케이션을 동심원 계층으로 구성하여 내부 계층이 외부 계층에 의존하지 않도록 하며, 비즈니스 로직(도메인 레이어)을 외부 기술(인프라 레이어)로부터 분리하여 유연성과 유지보수성을 극대화한다. 도메인 주도 설계(DDD)는 비즈니스 도메인에 초점을 맞춰 소프트웨어 엔티티와 도메인 개념을 일치시키는 접근법으로, NestJS의 모듈 시스템이 이를 쉽게 구현하도록 돕는다.
- **CQRS (Command Query Responsibility Separation)**: CQRS 패턴은 명령(Command, 쓰기 작업)과 조회(Query, 읽기 작업)를 분리하여 성능, 확장성, 보안성을 높이는 아키텍처 패턴이다. 복잡한 도메인 모델에서 읽기 모델과 쓰기 모델을 다르게 가져갈 수 있어, 읽기 작업이 많은 애플리케이션에서 특히 유용하다. NestJS는 @nestjs/cqrs 패키지를 통해 CommandBus, EventBus, QueryBus를 제공하여 CQRS 패턴을 쉽게 구현할 수 있도록 지원한다.
- **이벤트 소싱 (Event Sourcing)**: 이벤트 소싱은 애플리케이션 상태의 모든 변경 사항을 불변의 이벤트 시퀀스로 저장하는 아키텍처 패턴이다. 현재 상태만 저장하는 대신, 상태를 변경하는 모든 동작을 이벤트로 기록한다. @event-nest/core와 같은 라이브러리는 NestJS 애플리케이션에서 이벤트, 애그리거트(Aggregate), 도메인 구독을 관리하는 도구를 제공하여 이벤트 소싱 구현을 간소화한다. 이는 CQRS 및 DDD와 함께 사용될 때 강력한 시너지를 발휘한다.

## 5. 결론 및 향후 학습 방향
스프링부트의 그것과 유사한, 그러나 동시에 Node 라는 특성을 갖고 있는 언어적 기반 덕에 비동기 처리 서버로 아주 사용하기 편리한 NestJS에 대해 알아보았다. 

정리해봄으로써 각 구성 요소들의 의미나 의도, 그리고 제일 중요한 라이프사이클에 대한 부분은 다시 봐도 개발에 반드시 필요한 요소라는 사실을, 그리고 조금 만 더 이해도를 높이면 단순히 서버를 만든다를 넘어서 어떤 파이프라인을 타고, 어떤 구조로 CICD 까지 이룰 수 있을지 이해의 길이 좀더 열릴 것 같다는 생각이다. 확실히 이제는 단위 단위의 정리도 좋지만, 전체를 아우르는 한번에 내용을 읽고 정리하는 작업도 상당히 도움이 된다는 것을 새삼 느끼게 된다.

제미니가 제시해주는 1년차 개발자의 추가 학습 방향도 참고할 것이지만, 좀더 고난이도 개발자가 되기위해 노력해야할 필요성은 보이는 것 같다. 제미니를 통해 향후 작성하고 세부적으로 알아볼 생각이지만, 한 12개 정도 나온다고 하니, 한 주에 하나는 꾸준히 써야 할 것이리라 생각된다(...)

주말도 바쁜게 끝이 없다 😅

## 참조 문헌
1. [NestJS 설치부터 기본 개념 알아보자 - 느린 개발자](https://stack94.tistory.com/entry/NestJS-NestJS-%EC%84%A4%EC%B9%98%EB%B6%80%ED%84%B0-%EA%B8%B0%EB%B3%B8-%EA%B0%9C%EB%85%90-%EC%95%8C%EC%95%84%EB%B3%B4%EC%9E%90)
2. [NestJS를 활용한 효율적인 백엔드 구조 설계 - F-Lab](https://f-lab.kr/insight/efficient-backend-architecture-with-nestjs)
3. [NestJS-Design Pattern - velog](https://velog.io/@zvoniti/NestJS-Design-Pattern)
4. [NestJS가 각광받고 있는 이유? / 파일 트리 구조 / 실제코드](https://deemmun.tistory.com/35)
5. [NestJS & Project Structure - velog](https://velog.io/@kimhalin/NestJS-Project-Structure)
6. [\[초보자의 눈으로 보는 NestJS\] 3. 모듈, 컨트롤러, 그리고 프로바이더](https://ts01.tistory.com/15)
7. [NestJS 모듈이란? - velog](https://velog.io/@dev_0livia/%EA%B2%8C%EC%8B%9C%ED%8C%90-%EB%A7%8C%EB%93%A4%EA%B8%B0-01)
8. [\[NestJs\] 모듈 설계 - velog](https://velog.io/@naljajm/NestJs-%EB%AA%A8%EB%93%88-%EC%84%A4%EA%B3%84)
9. [\[NestJs\] 데코레이터,컨트롤러,서비스,모듈](https://dev-junwoo.tistory.com/m/162)
10. [\[Nest Js\] Nest Js 공식 문서 파헤치기 - 시작하기](https://tristy.tistory.com/38)
11. [Nest.js의 Modules, Controllers, Providers 알아보기](https://www.rldnd.net/nestjs-modules-controllers-providers)
12. [Nest.js와 모듈식 아키텍처: 원칙과 모범 사례 - 푸딩캠프](https://puddingcamp.com/topics/nestjs-modular-architecture-principles)
13. [\[Nest.js\] 공식문서 정리 (Overview) - velog](https://velog.io/@zunzero/Nest.js-%EA%B3%B5%EC%8B%9D%EB%AC%B8%EC%84%9C-%EC%A0%95%EB%A6%AC)
14. [\[NestJS\] 데코레이터 개념과 예시 - velog](https://velog.io/@cocorig/NestJS-%EB%8D%B0%EC%BD%94%EB%A0%88%EC%9D%B4%ED%84%B0-%EA%B0%9C%EB%85%90%EA%B3%BC-%EC%98%88%EC%8B%9C-Services-NotFoundException)
15. [NestJS로 REST API 만들기 - velog](https://velog.io/@jujube0/NestJS%EB%A1%9C-REST-API-%EB%A7%8C%EB%93%A4%EA%B8%B0)
16. [NestJS에서의 의존성 주입(Dependency Injection) - velog](https://velog.io/@hyein0112/NestJS%EC%97%90%EC%84%9C%EC%9D%98-%EC%9D%98%EC%A1%B4%EC%84%B1-%EC%A3%BC%EC%9E%85Dependency-Injection)
17. [NestJS - 의존성 주입 - 두루미의 개발기록](https://choidr.tistory.com/entry/NestJS-%EC%9D%98%EC%A1%B4%EC%84%B1-%EC%A3%BC%EC%9E%85)
18. [NestJS DI 따라해보기 - velog](https://velog.io/@tlsdntjd95/NestJS-DI-%EB%94%B0%EB%9D%BC%ED%95%B4%EB%B3%B4%EA%B8%B0)
19. [\[NestJS- Docs\] Testing 알아보기 - 티스토리](https://cdragon.tistory.com/entry/NestJS-Docs-Testing-%EC%95%8C%EC%95%84%EB%B3%B4%EA%B8%B0)
20. [NestJs Custom decorator에 대해 알아보자 - 티스토리](https://develop-const.tistory.com/11)
21. [\[NestJS - Docs\] Custom Decorators 알아보기 - 티스토리](https://cdragon.tistory.com/entry/NestJS-Custom-Decorators-%EC%95%8C%EC%95%84%EB%B3%B4%EA%B8%B0-%EC%BB%A4%EC%8A%A4%ED%85%80-%EB%8D%B0%EC%BD%94%EB%A0%88%EC%9D%B4%ED%84%B0)
22. [Hot reload - NestJS 공식 문서](https://docs.nestjs.com/recipes/hot-reload)
23. [ConfigService를 bootstrap에서 사용하는 방법](https://artosalminen.github.io/posts/how-to-use-config-service-in-nestjs-bootstrap/)
24. [Nest.js의 LifeCycle(생명 주기)는 어떻게 되지?](https://www.rldnd.net/nestjs-lifecycle-)
25. [Provider Dependencies 관련 NestJS GitHub 이슈](https://github.com/nestjs/nest/issues/14773)
26. [NestJS Fundamentals Overview 공식문서](https://docs.nestjs.com/fundamentals/overview)
27. [Request lifecycle - Netlify](https://ru-nestjs-docs.netlify.app/faq/request-lifecycle)
28. [NestJS: Request Lifecycle - DEV.to](https://dev.to/ngtrthvu3007/nestjs-request-lifecycle-2jhe)
29. [NestJS - 유효성 검사 class-Validator - velog](https://velog.io/@ldhbenecia/NestJS-%EC%9C%A0%ED%9A%A8%EC%84%B1-%EA%B2%80%EC%82%AC-class-Validator)
30. [\[Nest.js\] exception filter 파헤치기 - velog](https://velog.io/@wlduq0150/Nest.js-exception-filter-%ED%8C%8C%ED%97%A4%EC%B9%98)
31. [\[NestJS\] 예외처리, Exception Filter - 티스토리](https://mag1c.tistory.com/476)
32. [NestJS - 대충 서비스 만들어보기 (14)](https://grepper.tistory.com/178)
33. [\[NestJS\] JWT(1) 기본 개념, 구현 - 티스토리](https://choi-records.tistory.com/entry/NestJS-JWT1-%EA%B8%B0%EB%B3%B8-%EA%B0%9C%EB%85%90-%EA%B5%AC%ED%98%84)
34. [로그인의 원리와 Guard(1) - 개념편](https://suloth.tistory.com/77)
35. [\[NestJS\] JWT 토큰 인가 - PassportStrategy/Guard 사용과 토큰 재발급](https://sjh9708.tistory.com/48)
36. [NestJs 데이터베이스 연동하기 (mysql, typeorm) - 티스토리](https://develop-const.tistory.com/19)
37. [제로부터 시작하는 Prisma와 Nest.js - 티스토리](https://custom-li.tistory.com/209)
38. [Boost Your Nest.js Project with Prisma - OneClick](https://www.oneclickitsolution.com/centerofexcellence/nodejs/nestjs-prisma-integration-guide)
39. [NestJS Performance Optimization: Expert Tips - Delving Developer](https://delvingdeveloper.com/posts/nestjs-performance-optimization-tips)
40. [Jest를 이용한 Unit/E2E 테스트 - 티스토리](https://coldpresso.tistory.com/13)
41. [NESTJS를 배워보자(20) - Testing - velog](https://velog.io/@cxzaqq/NESTJS%EB%A5%BC-%EB%B0%B0%EC%9B%8C%EB%B3%B4%EC%9E%9020-Testing)
42. [NestJS 공식문서 Testing - velog](https://velog.io/@hing/NestJS-%EA%B3%B5%EC%8B%9D%EB%AC%B8%EC%84%9C-Testing)
43. [Optimize Your Nest.js App Performance - Brilworks](https://www.brilworks.com/blog/optimize-your-nest-js-app-performance/)
44. [Express.js vs Fastify - Better Stack](https://betterstack.com/community/guides/scaling-nodejs/fastify-express/)
45. [Express vs. Fastify - CBT Nuggets](https://www.cbtnuggets.com/blog/technology/programming/express-vs-fastify)
46. [Nestjs CI CD 프로젝트에서 Docker 최적화 회고 - velog](https://velog.io/@carrykim/Nestjs-CI-CD-%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8%EC%97%90%EC%84%9C-Docker-%EC%B5%9C%EC%A0%81%ED%99%94-%ED%9A%8C%EA%B3%A0)
47. [\[NestJs\] 순환 종속성 문제 - 티스토리](https://developer-gyakya.tistory.com/22)
48. [클린 아키텍처(헥사고날 아키텍처) 알아보기 with NestJS](https://junho2343.github.io/posts/clean-architecture-hexagonal-architecture-with-nestjs)
49. [nestjs-clean-example - GitHub](https://github.com/0xTheProDev/nestjs-clean-example)
50. [NestJS - 클린 아키텍처 · ASSU BLOG.](https://assu10.github.io/dev/2023/04/29/nest-clean-architecture/)
51. [\[NestJs\] CQRS 관심사 분리 - velog](https://velog.io/@naljajm/NestJs-CQRS-%EA%B4%80%EC%8B%AC%EC%82%AC-%EB%B6%84%EB%A6%AC)
52. [NestJS - CQRS · ASSU BLOG.](https://assu10.github.io/dev/2023/04/16/nest-cqrs/)
53. [@event-nest/core - npm](https://www.npmjs.com/package/@event-nest/core)
