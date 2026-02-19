---
layout: post 
title: Protostar review note - 08 NestJS Middlewares & Guards & Interceptors & Pipes
subtitle: Protostar 구성 요소들에 대한 복습 + 심도 있는 확장을 정리한다 
categories: 문제해결
tags: Backend 개발 Protostar Project Review NestJS AI 
thumb: https://paul2021-r.github.io/assets/images/assets/protostar-icon.png
custom-excerpt: Protostar 구성 요소들에 대한 복습 + 심도 있는 확장을 정리한다 
banner:
  # video: https://vjs.zencdn.net/v/oceans.mp4
  loop: true
  volume: 0.8
  muted: true                 # For mobile device background music play 
  start_at: 8.5
  image: /assets/images/posts/2026-01/20260109-010.png
  opacity: 0.318
  background: "#000"
  height: "100vh"
  min_height: "38vh"
  heading_style: "font-size: 4.25em; font-weight: bold; text-decoration: underline"
  subheading_style: "color: gold"
---

# NestJS 파이프라인 구성요소 분석
## Middleware → Guards → Interceptors → Pipes

> 이 파일은 요청이 컨트롤러에 도달하기 전까지의 처리 계층을 **실행 순서**대로 분석한다.
> 프로젝트에 존재하는 구성 파일 목록:
>
> | 분류 | 파일 | 등록 방식 |
> |---|---|---|
> | Middleware | _(별도 클래스 없음, Express 직접 사용)_ | `app.use()` in main.ts |
> | Guard | `origin.guard.ts` | `useGlobalGuards()` in main.ts |
> | Guard | `jwt-auth.guard.ts` | `APP_GUARD` in AppModule |
> | Guard | `ai-circuit.guard.ts` | `@UseGuards()` in Controller |
> | Interceptor | `logging.interceptor.ts` | `useGlobalInterceptors()` in main.ts |
> | Interceptor | `knowledge-upload-busy-check.interceptor.ts` | `@UseInterceptors()` in Controller |
> | Pipe | `ValidationPipe` | `useGlobalPipes()` in main.ts |
> | Pipe | `ClassSerializerInterceptor` | `useGlobalInterceptors()` in main.ts |

---

# 1. 주요 개념

## Middleware

NestJS의 Middleware는 **Express/Fastify 레벨**에서 동작한다. 라우터보다 먼저 실행되며, 요청·응답 객체에 직접 접근할 수 있다.

```
[Request] → Middleware → Guard → Interceptor → Pipe → Controller
```

**이 프로젝트에서의 선택**: 별도의 NestJS Middleware 클래스 없이 `app.use()`로 Express 미들웨어를 직접 등록.

```typescript
// main.ts
app.use(json({ limit: '50mb' }));
app.use(urlencoded({ extended: true, limit: '50mb' }));
```

→ bodyParser만 미들웨어 레이어에서 처리하고, 인증·Origin 검사 등은 Guard 레이어로 위임한 설계로 구성되어있다.

## Guards

| 가드               | 등록 방식               | 적용 범위                  | 역할                           |
| ---------------- | ------------------- | ---------------------- | ---------------------------- |
| `OriginGuard`    | `useGlobalGuards()` | 전체 요청                  | HTTP Origin 화이트리스트 검사        |
| `ThrottlerGuard` | `APP_GUARD`         | 전체 요청                  | Rate Limit (burst/sustained) |
| `JwtAuthGuard`   | `APP_GUARD`         | 전체 요청 (`@Public()` 제외) | JWT 토큰 인증                    |
| `AiCircuitGuard` | `@UseGuards()`      | 채팅·지식 엔드포인트            | AI 서비스 생존 여부 확인              |

NestJS Guard의 핵심: `canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>`
→ `false` 또는 예외를 던지면 요청을 차단, `true`를 반환해야 다음 단계 진행이 된다. 

## Interceptors

| 인터셉터                                  | 등록 방식                     | 적용 범위     | 역할                            |
| ------------------------------------- | ------------------------- | --------- | ----------------------------- |
| `LoggingInterceptor`                  | `useGlobalInterceptors()` | 전체 요청     | HTTP 트래픽 구조화 로깅               |
| `ClassSerializerInterceptor`          | `useGlobalInterceptors()` | 전체 응답     | `@Exclude()/@Expose()` 직렬화 적용 |
| `KnowledgeUploadBusyCheckInterceptor` | `@UseInterceptors()`      | 업로드 엔드포인트 | 큐 포화 상태 사전 차단                 |

NestJS Interceptor의 핵심: `intercept(context, next: CallHandler): Observable<any>`
→ `next.handle()` 호출 전: 요청 전처리 / 호출 후 `pipe()`: 응답 후처리.

## Pipes

| 파이프 | 등록 방식 | 역할 |
|---|---|---|
| `ValidationPipe` | `useGlobalPipes()` | DTO 필드 검증 + 타입 변환 |
| _(ClassSerializerInterceptor)_ | `useGlobalInterceptors()` | 응답 직렬화 (Pipe는 아니지만 유사 역할) |

파이프는 Guards·Interceptors 이후, Controller 직전에 실행된다. 인증된 요청의 데이터만 검증하는 것이 목적으로 존재한다.

---

# 2. 핵심 로직 흐름

## 전체 요청 처리 흐름 (실행 순서)

```
[HTTP Request]
      │
      ▼
 app.use(json/urlencoded)          ← Express Middleware (bodyParser)
      │
      ▼
 OriginGuard                       ← 전역 가드 1 (main.ts useGlobalGuards)
  - origin 헤더 없음 → 통과
  - 화이트리스트 포함 → 통과
  - 그 외 → ForbiddenException
      │
      ▼
 ThrottlerGuard                    ← 전역 가드 2 (APP_GUARD, AppModule)
  - burst: 초당 2000 req
  - sustained: 분당 60000 req
  - Redis에 카운터 저장
      │
      ▼
 JwtAuthGuard                      ← 전역 가드 3 (APP_GUARD, AppModule)
  - @Public() → 바이패스
  - Reflector로 메타데이터 확인
  - JWT 유효 → request.user 세팅
  - JWT 무효 → UnauthorizedException
      │
      ▼
 [AiCircuitGuard]                  ← 라우트 가드 (@UseGuards, 해당 엔드포인트만)
  - Redis heartbeat 확인
  - AI ONLINE → 통과
  - AI OFFLINE → ServiceUnavailableException
      │
      ▼
 LoggingInterceptor                ← 전역 인터셉터 (요청 시각 기록)
      │
      ▼
 [KnowledgeUploadBusyCheckInterceptor] ← 라우트 인터셉터 (업로드 엔드포인트만)
  - QueueService.isBusy() 확인
  - 큐 여유 → 통과
  - 큐 포화 → ServiceUnavailableException
      │
      ▼
 ValidationPipe                    ← 전역 파이프
  - DTO 인스턴스로 변환 (transform: true)
  - 미선언 필드 제거 (whitelist: true)
  - 검증 실패 → BadRequestException
      │
      ▼
 Controller → Service              ← 비즈니스 로직
      │
      ▼
 LoggingInterceptor (tap)          ← 응답 후처리 (응답 시간 측정·로깅)
 ClassSerializerInterceptor        ← @Exclude/@Expose 직렬화
      │
      ▼
 GlobalExceptionFilter             ← 예외 발생 시 일괄 처리
      │
      ▼
 [HTTP Response]
```

## OriginGuard 흐름

```typescript
canActivate(context: ExecutionContext): boolean {
  const origin = request.headers.origin;

  if (!origin) return true;          // Server-to-Server, Postman 등 → 통과
  if (whitelist.includes(origin)) return true;
  throw new ForbiddenException();    // 미등록 브라우저 origin → 403
}
```

> [!note] `origin` 헤더가 없는 경우 무조건 통과하는 이유
> `origin` 헤더는 **브라우저가 보내는 CORS 헤더**다.
> 서버 간 통신(FastAPI 워커 웹훅), Postman, curl 등에는 origin이 없다.
> 이 엔드포인트들을 차단하지 않으려면 `!origin` 일 때 통과가 맞다.
> 단, 이 경우 웹훅 엔드포인트는 별도의 시크릿 키 검증으로 보완하고 있다.

## JwtAuthGuard 흐름

```typescript
canActivate(context: ExecutionContext) {
  const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
    context.getHandler(),   // 메서드 레벨 메타데이터 우선
    context.getClass(),     // 클래스 레벨 메타데이터 차선
  ]);
  if (isPublic) return true;

  return super.canActivate(context);  // Passport jwt 전략 실행
  // → JwtStrategy.validate() → request.user 세팅
}
```

## LoggingInterceptor 흐름

```typescript
intercept(context, next: CallHandler): Observable<any> {
  const now = Date.now();                // 요청 진입 시각 기록

  return next.handle().pipe(
    tap(() => {                          // 응답 완료 후 실행
      const duration = Date.now() - now;
      // 4xx 이상은 로깅 안 함 (GlobalExceptionFilter에서 처리)
      if (statusCode < 400) this.logger.log({ type: 'http_traffic_protostar', duration_ms, ... });
    })
  );
}
```

## KnowledgeUploadBusyCheckInterceptor 흐름

```typescript
intercept(context, next: CallHandler): Observable<any> {
  if (this.queueService.isBusy()) {
    // 큐가 꽉 찼으면 next.handle() 자체를 호출하지 않음
    throw new ServiceUnavailableException({ data: this.queueService.getStatus() });
  }
  return next.handle();   // 큐 여유 있으면 그냥 통과
}
```

## ValidationPipe 흐름

```typescript
// main.ts
new ValidationPipe({
  transform: true,    // JSON string → DTO 클래스 인스턴스
  whitelist: true,    // DTO에 없는 필드 자동 제거
})

// 예시 DTO
class CreateChatDto {
  @IsString() @IsNotEmpty()
  content: string;

  @IsString()
  sessionId: string;

  @IsOptional()
  context?: string;
}
// content, sessionId, context 외 필드는 자동 제거
// content가 없으면 BadRequestException
```

---

# 3. 구조적 취약점 / 개선 방향

## [OriginGuard] `origin` 없는 요청을 무조건 통과

서버 내부 통신, curl, Postman을 허용하기 위한 의도적 설계이지만, **서버가 인터넷에 직접 노출된 경우** `origin` 헤더를 생략한 악의적 요청도 통과될 수 있게 되어 있다. 

**현재 보완책**: 웹훅 엔드포인트는 `x-webhook-secret` 헤더로 추가 검증을 통해 막아내고 있고, API 사용시 이를 추가하도록 해둠. 
**추가 보완 방향**: 보다 섬세한 방어를 위해선 IP 화이트리스트 또는 네트워크 레벨 격리 (Docker network 분리).

## [JwtAuthGuard] `useGlobalGuards` vs `APP_GUARD` 혼용

```typescript
// main.ts: DI 컨테이너 밖
app.useGlobalGuards(new OriginGuard());

// AppModule: DI 컨테이너 안
{ provide: APP_GUARD, useClass: JwtAuthGuard }
```

**문제**: 두 방식이 혼용되어 전역 가드 목록을 한 곳에서 파악하기 어렵다.
- `main.ts`의 `OriginGuard`는 생성자 주입이 없어서 두 방식 다 가능하지만, `APP_GUARD`로 통일하면 가드 관리 포인트가 `AppModule` 하나로 집중된다. 추후 개선이 필요한 영역

## [KnowledgeUploadBusyCheckInterceptor] 큐 상태를 에러 응답으로 노출

```typescript
throw new ServiceUnavailableException({
  data: this.queueService.getStatus(),  // active, pending, concurrency, maxPending 노출
});
```

`getStatus()`가 반환하는 내부 처리량 정보(동시 실행 수, 대기열 크기)가 외부에 그대로 노출되도록 해두었던것을 발견. 해당 지표는 내부 운영 지표로 모니터링 시스템에서 보고(logging, loki), 외부 응답에서는 단순 재시도 안내만 해주는 것으로 해두는 것이 좋아 보인다.

---

# 4. 핵심 메서드 및 라이브러리 함수 설명

## `ExecutionContext`

가드·인터셉터·필터에서 현재 실행 컨텍스트에 접근하는 객체. HTTP 외에도 WebSocket, RPC를 지원하기 때문에 **프로토콜에 맞는 캐스팅**이 필요하다.

```typescript
context.switchToHttp().getRequest()   // HTTP Request 객체
context.switchToHttp().getResponse()  // HTTP Response 객체
context.getHandler()   // 현재 라우트 핸들러 메서드 참조
context.getClass()     // 현재 컨트롤러 클래스 참조
```

## `Reflector.getAllAndOverride(key, [handler, class])`

메타데이터를 읽는 NestJS 유틸리티. `getAllAndOverride`는 **먼저 나열된 대상에서 값을 찾으면 거기서 반환**한다 (오버라이드 우선순위 적용).

```typescript
// 메서드에 @Public()이 있으면 그 값 사용
// 없으면 클래스에 @Public()이 있는지 확인
this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
  context.getHandler(),  // 1순위: 메서드 레벨
  context.getClass(),    // 2순위: 클래스 레벨
]);
```

## `AuthGuard('jwt')` (Passport)

`@nestjs/passport`가 제공하는 추상 가드. 내부적으로 `PassportStrategy`를 실행하고, 성공 시 `request.user`에 `validate()` 반환값을 세팅한다.

```typescript
// 상속 구조
JwtAuthGuard extends AuthGuard('jwt')
  → Passport가 jwt 전략을 찾아 실행
  → JwtStrategy.validate(payload) 호출
  → 반환값 → request.user
```

## `createParamDecorator` (`@ValidateUser()`)

컨트롤러 파라미터에서 값을 추출하는 커스텀 데코레이터 생성 함수. 인가된 유저에 대하여 토큰 속에 포함된 데이터를 기반으로 접근하여 빠른 이용자 확인, 유저 정보 이용이 가능하다.

```typescript
export const ValidateUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;   // JwtStrategy.validate()가 세팅한 값
  },
);

// 사용
async uploadDocs(@ValidateUser() user: User) { ... }
```

## `next.handle()` / `CallHandler`

인터셉터에서 다음 단계(컨트롤러 또는 다음 인터셉터)를 실행하는 메서드. **호출하지 않으면 컨트롤러 실행 자체가 막힌다**. `KnowledgeUploadBusyCheckInterceptor`는 큐가 꽉 찼을 때 `next.handle()`을 호출하지 않고 예외를 던져 흐름을 차단한다.

```typescript
// 요청 전처리만 (응답 후처리 없음)
return next.handle();

// 요청 전처리 + 응답 후처리
return next.handle().pipe(
  tap(data => console.log(data)),      // 사이드 이펙트
  map(data => transform(data)),        // 응답 변환
  catchError(err => ...)               // 에러 처리
);
```

## `SetMetadata(key, value)`

클래스 또는 메서드에 메타데이터를 첨부하는 NestJS 유틸리티.

```typescript
// @Public() 데코레이터 구현
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

Reflect API(`Reflect.defineMetadata`)를 래핑한 것으로, `Reflector`로 런타임에 조회할 수 있다.

## `@SkipThrottle()` (ChatController SSE)

`@nestjs/throttler`가 제공하는 데코레이터. 특정 라우트에서 Rate Limit을 우회한다. 지정된 RateLimit 과 관계가 없는 장기 연결에서 자칫 RateLimit 이 발생하지 않기 위한 처리이다. 

```typescript
@Sse('stream/:sessionId')
@SkipThrottle()   // SSE는 장기 연결이므로 요청 카운트 제외
stream(...) {}
```

---

# 5. 대체 가능한 라이브러리 및 트레이드오프

## Guards 대안

### `passport-jwt` vs 직접 구현 JWT 검증

| 방법 | 장점 | 단점 |
|---|---|---|
| **passport-jwt** (현재) | NestJS 공식 통합, 전략 패턴으로 확장 용이 | 추상화가 많아 흐름 파악이 어려움 |
| **jose / jsonwebtoken 직접** | 흐름이 투명, 의존성 최소 | 검증 로직 직접 구현 필요 |
| **@fastify/jwt** | Fastify 어댑터 사용 시 성능 우위 | Express 어댑터와 혼용 불가 |

> Passport는 전략(Strategy) 패턴을 사용해 OAuth, Local, JWT 등 인증 방식을 교체하기 쉽다는 장점이 있다. 단일 JWT만 쓴다면 `jsonwebtoken` 직접 사용이 더 투명하다.

### OriginGuard의 CORS 처리 위치

| 방법 | 장점 | 단점 |
|---|---|---|
| **OriginGuard** (현재) | NestJS 파이프라인 내 처리, DI 활용 가능 | Guard에서 CORS를 처리하면 역할이 애매해짐 |
| **enableCors() 단독** | CORS 표준 방식, 브라우저 프리플라이트 처리 | 비브라우저 요청에 대한 서버 측 검증 없음 |
| **Nginx 레벨** | 앱 레이어 도달 전 차단, 성능 우수 | 동적 도메인 관리 어려움 |

## Interceptors 대안

### `tap()` vs `map()` vs `switchMap()`

| 연산자 | 용도 | 특징 |
|---|---|---|
| **`tap()`** (현재 로깅) | 사이드 이펙트 (로깅, 캐싱 등) | 스트림 값을 변경하지 않음 |
| **`map()`** | 응답 데이터 변환 | 값을 변환해서 반환 |
| **`switchMap()`** | 비동기 변환 (DB 조회 등) | 내부 Observable을 교체 |
| **`catchError()`** | 에러 처리 | 에러를 잡아 대체 Observable 반환 |

### 로깅 인터셉터 대안

| 방법 | 장점 | 단점 |
|---|---|---|
| **LoggingInterceptor** (현재) | NestJS 파이프라인 내 통합 | Guard 이전 로그 불가 |
| **Express Middleware** | Guard 이전 포함 전체 요청 로깅 | NestJS 추상화 우회 |
| **APM 도구 (Datadog, New Relic)** | 자동 계측, 분산 추적 | 비용, 벤더 잠금 |

> `LoggingInterceptor`는 Guard에서 차단된 요청(401, 403)은 로깅하지 않는다는 한계가 있다. 차단된 요청도 추적하려면 `GlobalExceptionFilter`에서 보완하거나 Express 미들웨어 레이어에서 처리해야 한다.

## ValidationPipe 대안

| 방법 | 장점 | 단점 |
|---|---|---|
| **class-validator** (현재) | NestJS 공식, 데코레이터 기반, 직관적 | 런타임 반영(reflect-metadata) 필요 |
| **zod + ZodPipe** | 타입 추론 강력, TS 친화적 | NestJS 기본 통합 아님 |
| **Joi + JoiPipe** | 성숙한 생태계 | class-decorator 방식과 혼용 불편 |
| **수동 검증** | 의존성 없음 | 반복 코드, 유지보수 어려움 |

> **zod**는 최근 TypeScript 생태계에서 강세. 스키마 정의와 타입 추론이 동시에 되어 `z.infer<typeof schema>`로 별도 DTO 클래스 없이 타입을 뽑을 수 있다. 단, `class-validator`와 달리 데코레이터 방식이 아니라 파이프 코드를 직접 작성해야 한다.

---

# 6. 개발자로서 알아야 할 영역

## A. 각 레이어의 책임 경계 이해

파이프라인 각 단계가 **왜 그 위치에 있는지** 설명할 수 있어야 한다.

```
Middleware  → HTTP 레벨 처리. NestJS 추상화 없이 요청·응답 객체 직접 조작.
              인증이나 로직보다는 rawBody 파싱, 압축, 요청 변환에 적합.

Guard       → "이 요청이 들어올 자격이 있는가?" 를 판단.
              인증(Authentication), 인가(Authorization), 서비스 가용성 확인.
              boolean을 반환하므로 로직이 단순해야 한다.

Interceptor → "요청/응답 주변에 무엇을 할 것인가?" 를 처리.
              로깅, 캐싱, 응답 변환, 타임아웃, 큐 체크 등.
              Observable을 반환하므로 RxJS 연산자 활용 가능.

Pipe        → "데이터가 올바른 형태인가?" 를 검증·변환.
              타입 변환, 유효성 검사. 인증 이후에만 실행.
```

## B. `canActivate`가 `false`를 반환하는 것과 예외를 던지는 것의 차이

```typescript
// false 반환 → NestJS가 기본 UnauthorizedException 생성
canActivate() { return false; }

// 예외 직접 throw → 원하는 상태코드·메시지 제어 가능
canActivate() { throw new ForbiddenException('Not allowed origin'); }
```

`false`를 반환하면 NestJS가 자동으로 `401 Unauthorized`를 응답한다. 하지만 이 프로젝트처럼 이유가 다를 때(Origin 차단은 `403 Forbidden`, AI 서비스 불가는 `503 Service Unavailable`)는 **예외를 직접 던져야 원하는 상태코드**를 줄 수 있다.

## C. 전역 등록 vs 라우트 등록의 설계 원칙

| 구분 | 전역 등록 | 라우트 등록 |
|---|---|---|
| **기준** | 모든 요청에 적용해야 하는가 | 특정 도메인·엔드포인트에만 필요한가 |
| **가드 예시** | JwtAuthGuard, ThrottlerGuard | AiCircuitGuard |
| **인터셉터 예시** | LoggingInterceptor | KnowledgeUploadBusyCheckInterceptor |
| **장점** | 누락 위험 없음 | 불필요한 실행 없음, 명시적 의도 |

> 이 프로젝트의 `JwtAuthGuard`는 전역으로 걸되 `@Public()`으로 예외를 허용하는 방식 → **"기본 잠금, 필요 시 열기"** 패턴. 
> `AiCircuitGuard`는 AI 관련 라우트에만 명시적으로 적용 → **"필요한 곳에만 잠금"** 패턴. 
> 두 패턴을 기능적 특성, 상황에 맞게 선택할 수 있어야 한다.

## D. Interceptor에서 RxJS를 사용하는 이유

NestJS Interceptor가 `Observable`을 반환하는 이유는 **SSE·WebSocket·스트리밍 응답을 일관된 방식으로 처리**하기 위해서다. 일반 HTTP 응답도 내부적으로 Observable로 래핑된다.

```typescript
// 응답 완료 후 로직 (tap)
next.handle().pipe(tap(() => { /* 로깅 */ }))

// 응답 변환 (map)
next.handle().pipe(map(data => ({ success: true, data })))

// 에러 → 정상 응답으로 변환 (catchError)
next.handle().pipe(catchError(err => of({ success: false, error: err.message })))

// 타임아웃 처리
next.handle().pipe(timeout(5000), catchError(err => ...))
```

## E. `@Public()` 패턴의 보안 함의

```typescript
@Public()
@Post('webhook')
handleWebhook(@Headers('x-webhook-secret') secret: string) {
  if (secret !== INTERNAL_SECRET) throw new UnauthorizedException();
}
```

`@Public()`으로 JWT 인증을 우회한 엔드포인트는 **반드시 다른 인증 수단**으로 보완해야 한다. 
이 프로젝트의 웹훅은 `x-webhook-secret` 헤더 검증으로 보완하고 있다. 
`@Public()` 붙이고 아무 검증도 없는 엔드포인트는 의도치 않은 공개 API가 된다.

## F. 파이프라인 디버깅 방법

요청이 어느 단계에서 막히는지 확인하는 실용적 방법:

```typescript
// Guard에서 로그 추가
canActivate(context) {
  console.log('[Guard] 실행됨');
  // ...
}

// Interceptor에서 로그 추가
intercept(context, next) {
  console.log('[Interceptor] before');
  return next.handle().pipe(
    tap(() => console.log('[Interceptor] after'))
  );
}
```

또는 NestJS의 `Logger`를 활용해 각 단계 진입 로그를 남겨두면 운영 중에도 Loki에서 요청 흐름 추적이 가능하다.

---

# 핵심 요약 카드

> [!abstract] Guard 3종 역할 구분
> - `OriginGuard` → **출처(Origin) 검사** : 브라우저 기반 요청의 도메인 화이트리스트
> - `JwtAuthGuard` → **신원(Authentication)** : 토큰 유효성 확인 + request.user 세팅
> - `AiCircuitGuard` → **서비스 가용성** : AI 워커 생존 여부에 따른 서킷브레이커

> [!abstract] Interceptor 3종 역할 구분
> - `LoggingInterceptor` → 요청 전/응답 후 구조화 로그 수집
> - `KnowledgeUploadBusyCheckInterceptor` → 컨트롤러 도달 전 큐 포화 차단
> - `ClassSerializerInterceptor` → 응답 객체의 민감 필드 직렬화 제어

> [!question] 설명할 수 있어야 하는 것
> 1. Middleware가 Guard보다 먼저 실행되는 이유
> 2. `OriginGuard`에서 `origin`이 없을 때 통과시키는 이유와 보완책
> 3. `next.handle()`을 호출하지 않으면 어떻게 되는가
> 4. `getAllAndOverride` vs `getAllAndMerge`의 차이
> 5. 인터셉터가 `Observable`을 반환해야 하는 이유
> 6. `ValidationPipe`의 `whitelist`와 `forbidNonWhitelisted`의 차이
