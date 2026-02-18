---
layout: post 
title: Protostar review note - 07 NestJS main.ts & app.module.ts
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

# NestJS `main.ts` / `app.module.ts` 분석

> 두 파일은 NestJS 앱의 **조립 지점**이다.
> - `app.module.ts`: 무엇을 연결할지 선언 (정적 구조)
> - `main.ts`: 어떻게 실행할지 설정 (동적 부트스트랩)

---

# 1. 주요 개념

## `main.ts`에 등장하는 핵심 개념

| 개념                    | 사용처                            | 한 줄 설명                                                                                   |
| --------------------- | ------------------------------ | ---------------------------------------------------------------------------------------- |
| **Bootstrap 함수**      | `NestFactory.create()`         | NestJS 앱 인스턴스를 생성하는 진입점                                                                  |
| **글로벌 파이프라인**         | `useGlobal*` 메서드들              | 모든 요청에 공통 적용되는 필터/인터셉터/가드/파이프                                                            |
| **CORS**              | `enableCors()`                 | 교차 출처 요청 허용 범위 설정. 특히 메인 프론트엔드 서비스 포인트와, AI 챗봇의 엔드포인트 등에서 차이가 있다보니 신중한 개념 이해 및 적용이 필요하다. |
| **Graceful Shutdown** | `enableShutdownHooks()`        | OS 종료 신호(SIGTERM) 수신 시 연결 정리 후 종료. 고가용성을 위한 기본 중에 기본 개념. 컨테이너화 하기 전, 반드시 필요한 처리였다.       |
| **Winston 로거**        | `WinstonModule.createLogger()` | NestJS 기본 로거를 Winston으로 교체 및 Loki 대응으로 변경.                                               |
| **bodyParser 직접 설정**  | `json({ limit: '50mb' })`      | 파일 업로드 대응을 위한 요청 바디 크기 제한 확장(기본값으로 부족함 대비)                                               |

## `app.module.ts`에 등장하는 핵심 개념

| 개념                     | 사용처                                        | 한 줄 설명                                |
| ---------------------- | ------------------------------------------ | ------------------------------------- |
| **루트 모듈**              | `AppModule`                                | 모든 기능 모듈을 조립하는 최상위 모듈                 |
| **isGlobal**           | `ConfigModule.forRoot({ isGlobal: true })` | 다른 모듈에서 import 없이 ConfigService 사용 가능 |
| **forRootAsync**       | `ThrottlerModule.forRootAsync()`           | 비동기로 다른 모듈(Redis)을 주입받아 설정            |
| **APP_GUARD 토큰**       | `{ provide: APP_GUARD, useClass: ... }`    | DI 컨테이너를 통해 전역 가드를 등록하는 NestJS 특수 토큰  |
| **Rate Limiting**      | `ThrottlerModule`                          | burst/sustained 두 레벨의 요청 수 제한         |
| **Redis 기반 Throttler** | `ThrottlerStorageRedisService`             | 다중 인스턴스 환경에서 Rate Limit 상태를 Redis로 공유 |

---

# 2. 핵심 로직 흐름

## `main.ts` - 부트스트랩 순서

```
NestFactory.create(AppModule, { logger: Winston, bodyParser: false })
  │
  ├─ CORS 설정 (Origin 화이트리스트 검사 콜백)
  │
  ├─ app.use(json({ limit: '50mb' }))        ← bodyParser 수동 설정
  ├─ app.use(urlencoded({ extended: true, limit: '50mb' }))
  │
  ├─ useGlobalFilters(GlobalExceptionFilter)   ← 예외 후처리
  ├─ useGlobalInterceptors(LoggingInterceptor) ← 요청/응답 로깅
  │
  ├─ enableShutdownHooks()                     ← SIGTERM 처리
  │
  ├─ useGlobalGuards(OriginGuard)              ← Origin 재검사
  ├─ useGlobalPipes(ValidationPipe)            ← DTO 검증/변환
  ├─ useGlobalInterceptors(ClassSerializerInterceptor) ← 직렬화
  │
  └─ app.listen(PORT, '0.0.0.0')
```

> [!warning] 등록 순서가 실행 순서를 결정하지 않는다
> `useGlobal*` 호출 순서는 파이프라인 실행 순서와 무관하다.
> NestJS는 Lifecycle에 따라 **Guard → Interceptor → Pipe → Controller → Interceptor → Filter** 순서를 고정으로 실행한다.
> `main.ts`의 등록 순서는 가독성을 위한 선언일 뿐이다.
> 하지만 그렇기 때문에 명시적으로 순서를 이해하고, 선언해둠은 요청이 어떻게 응답으로 나가는지를 유기적으로 이해할 수 있다.

## `app.module.ts` - 모듈 조립 구조

```
AppModule
  │
  ├── imports
  │     ├── ConfigModule (isGlobal: true)      ─ 환경변수 전역 공급
  │     ├── RedisModule                        ─ Redis 클라이언트 공급
  │     ├── ChatModule                         ─ SSE 채팅 도메인
  │     ├── ThrottlerModule.forRootAsync()     ─ Redis로 상태 공유하는 Rate Limit
  │     │     └── inject: [REDIS_CLIENT]       ─ RedisModule에서 공급된 인스턴스 주입
  │     ├── ObjectStorageModule                ─ MinIO 연동
  │     ├── AuthModule                         ─ JWT 인증
  │     ├── PrismaModule                       ─ DB ORM
  │     └── KnowledgeModule                   ─ 문서 업로드/RAG 도메인
  │
  └── providers
        ├── AppService
        ├── APP_GUARD → ThrottlerGuard         ─ 전역 Rate Limit (1순위)
        └── APP_GUARD → JwtAuthGuard           ─ 전역 JWT 인증 (2순위)
```

## Rate Limit 설정 상세

```typescript
throttlers: [
  { name: 'burst',     ttl: seconds(1),  limit: 2000  },  // 초당 2000 req
  { name: 'sustained', ttl: seconds(60), limit: 60000 },  // 분당 60000 req
]
```

- **burst**: 순간적인 트래픽 스파이크 허용 (초당 2000)
- **sustained**: 지속적 과부하 방지 (분당 60000 = 초당 평균 1000)
- 두 조건 모두 통과해야 요청이 허용됨
- 상태를 `ThrottlerStorageRedisService`로 Redis에 저장 방식을 적용 → **수평 확장(Scale-out) 시에도 공유 가능** Redis 이용 면에서 심도있게 다룰 예정

---

# 3. 구조적 취약점 / 개선 방향

## [main.ts] CORS 화이트리스트의 하드코딩

```typescript
const staticWhitelist = [
  'https://paul2021-r.github.io',
  'https://service-protostar.ddns.net',
  'http://localhost:4000',
  ...
];
```

**문제**: 허용 도메인이 코드에 박혀 있어 도메인 추가/변경 시 재배포 필요. 개발 시 가장 이상적인 형태는 'dynamic'한 관리가 맞다고 판단했었음. 하지만 일정 및 기획 축소로 하드코딩 방식으로 진행함.

**개선**: 환경변수로 분리. 이후 DB 형태로 관리가 fine 한 관리가 필요.

```typescript
const whitelist = process.env.CORS_ORIGINS?.split(',') ?? [];
```

## [main.ts] 전역 OriginGuard와 CORS의 중복 검사

- `enableCors()` 에서 한 번, `OriginGuard` 에서 한 번 더 Origin을 검사하고 있다.
- Origin 검사 로직을 한 곳으로 통합하거나, 역할을 명확히 분리(CORS = 브라우저 사전 검사, Guard = 서버 최종 검사)하는 것이 의도를 더 명확하게 만든다.

## [app.module.ts] APP_GUARD 등록 순서 의존성

```typescript
providers: [
  { provide: APP_GUARD, useClass: ThrottlerGuard },  // 1번
  { provide: APP_GUARD, useClass: JwtAuthGuard },    // 2번
]
```

- NestJS는 `APP_GUARD`를 등록 순서대로 실행한다.
- 현재 Rate Limit을 먼저 검사하는 것은 합리적이지만, **문서화가 없으면 순서 변경 시 버그 발생** 가능성이 있다고 함. 
- 이에 대해 AI와 답변, Best Practice 를 확인해본 결과 다음과 같은 방향성으로 해결 가능하다. 
	1.  주석을 남겨 설명을 명료하게 만들어 둔다.
	2. 하나의 단일한 가드 형태로 가드를 통합화 시켜서 적용시켜둠으로써, 맥락을 유지시킨다.

## [app.module.ts] RedisModule 직접 의존

- 지적 부분 : `ThrottlerModule`이 `RedisModule`을 직접 `inject`로 받는 구조는, `RedisModule`의 토큰(`REDIS_CLIENT`)이 바뀌거나 모듈이 분리되면 `AppModule`도 수정해야 한다. 
- 개선 제안 : Throttler 전용 Redis 설정을 `ThrottlerModule` 내부로 캡슐화하는 방법도 고려할 수 있다.

## [main.ts] bodyParser 비활성화 후 수동 설정의 맥락 누락

```typescript
NestFactory.create(AppModule, { bodyParser: false })
// ...
app.use(json({ limit: '50mb' }));
```

- 기본 bodyParser를 끄고 수동으로 다는 이유가 코드에 설명되어 있지 않다.
- 실제 이유: **파일 업로드 처리(Multer)와 충돌 방지 + 50MB 제한 확장**. 주석이 없으면 다음 개발자가 이유를 모르고 제거할 위험이 있다. 
	- 이 부분은 개선이 필요하였으나, 개발 일정 고려 하드코딩으로 마무리 되었었음. 향후 개선이 필요하고, 특히나 이부분은 요청에 따라 다른 적용 내지는, 파일 확장자 별로도 고려할 사항들이 다소 존재한다. 

---

# 4. 핵심 메서드 및 라이브러리 함수 설명

## `NestFactory.create(module, options)`

NestJS 앱 인스턴스를 생성하는 팩토리 메서드.

| 옵션             | 타입                       | 설명                                      |
| -------------- | ------------------------ | --------------------------------------- |
| `logger`       | `LoggerService`          | 기본 로거를 교체                               |
| `bodyParser`   | `boolean`                | Express bodyParser 자동 탑재 여부 (기본 `true`) |
| `cors`         | `boolean \| CorsOptions` | CORS 설정 (create 시점에 옵션으로도 가능)           |
| `httpsOptions` | `HttpsOptions`           | HTTPS 인증서 설정                            |

## `ConfigModule.forRoot({ isGlobal: true })`

- `isGlobal: true`: 이 모듈을 **글로벌 모듈**로 등록. 다른 모듈에서 `imports`에 추가 없이 `ConfigService`를 바로 주입받을 수 있다.
- 내부적으로 `process.env`를 래핑해서 타입 안전하게 환경변수를 조회하는 `ConfigService`를 제공.

## `ThrottlerModule.forRootAsync({ useFactory })`

- `forRoot()`: 정적 설정 (값이 고정)
- `forRootAsync()`: 비동기 설정 팩토리. 다른 Provider(여기서는 Redis 클라이언트)를 **주입받아** 설정값을 만들 때 사용.
- `inject` 배열에 넣은 토큰들이 `useFactory` 함수의 인자로 순서대로 들어온다.

## `APP_GUARD` / `APP_FILTER` / `APP_INTERCEPTOR` / `APP_PIPE`

NestJS가 전역 파이프라인 요소를 DI 컨테이너를 통해 등록하기 위한 **특수 토큰들**.

```typescript
// 두 방식의 차이
// 방식 A: DI 컨테이너 밖 (다른 서비스 주입 불가)
app.useGlobalGuards(new OriginGuard());

// 방식 B: DI 컨테이너 안 (다른 서비스 주입 가능)
{ provide: APP_GUARD, useClass: JwtAuthGuard }
```

- `OriginGuard`는 생성자에 주입받을 게 없어서 방식 A로도 괜찮다.
- `JwtAuthGuard`는 `Reflector`를 주입받아야 하므로 **반드시 방식 B**여야 한다.

## `app.enableShutdownHooks()`

- OS 프로세스 종료 신호(`SIGTERM`, `SIGINT`)를 NestJS가 감지하도록 활성화.
- 신호 수신 시 `OnApplicationShutdown` 인터페이스를 구현한 서비스의 `onApplicationShutdown()` 메서드를 호출.
- Docker/Kubernetes 환경에서 컨테이너가 내려갈 때 **진행 중인 요청을 마저 처리하고 종료**하는 Graceful Shutdown에 필수.

## `ClassSerializerInterceptor` + `Reflector`

```typescript
app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
```

- `class-transformer`의 `@Exclude()`, `@Expose()`, `@Transform()` 데코레이터를 응답 직렬화에 자동 적용.
- `app.get(Reflector)`: DI 컨테이너 밖에서 `Reflector` 인스턴스를 직접 꺼내는 방법.

```typescript
// 사용 예
class UserResponseDto {
  email: string;

  @Exclude()
  password: string;  // 응답에서 자동 제거됨
}
```

## `ValidationPipe({ transform: true, whitelist: true })`

| 옵션 | 효과 |
|---|---|
| `transform: true` | 요청 데이터를 DTO 클래스 인스턴스로 변환 (타입 캐스팅 포함) |
| `whitelist: true` | DTO에 선언되지 않은 필드를 자동 제거 |
| `forbidNonWhitelisted: true` | (미사용) 선언 외 필드가 있으면 400 에러 |
| `disableErrorMessages: true` | (미사용) 에러 메시지 숨기기 (프로덕션 권장) |

---

# 5. 대체 가능한 라이브러리 및 트레이드오프

## Winston 로거 vs 대안

| 라이브러리            | 장점                                         | 단점                |
| ---------------- | ------------------------------------------ | ----------------- |
| **Winston** (현재) | 성숙한 생태계, 다양한 Transport(파일/HTTP/Loki)       | 설정이 장황, 번들 크기 큼   |
| **Pino**         | 성능이 가장 빠름(JSON 직렬화 최적화), `nest-pino` 공식 지원 | 커스터마이징이 상대적으로 제한적 |
| **Bunyan**       | 구조화 로깅 특화                                  | 유지보수 저조, 생태계 축소   |

> Loki + Promtail 스택을 쓰는 경우 **Pino**가 JSON 출력이 더 깔끔하고 성능도 우수해 선호되는 추세.

## ThrottlerModule vs 대안

| 방법                                 | 장점                              | 단점                      |
| ---------------------------------- | ------------------------------- | ----------------------- |
| **@nestjs/throttler + Redis** (현재) | NestJS 네이티브, 데코레이터로 라우트별 커스텀 가능 | Redis 의존성 추가            |
| **Nginx Rate Limit**               | 앱 레이어 밖에서 처리, 성능 우수             | 세밀한 비즈니스 로직 적용 어려움      |
| **express-rate-limit**             | 설정 간단                           | 다중 인스턴스 환경에서 메모리 공유 어려움 |
| **API Gateway (Kong 등)**           | 중앙 집중 관리                        | 인프라 복잡도 증가              |

> 이미 Nginx Traffic Dam이 앞단에 있으므로, NestJS 레이어의 Throttler는 **내부 서비스 보호(2차 방어선)** 역할임을 고려하고, 이 역할 수준을 벗어나지 않도록 맥락이 유지되어야함.

## ConfigModule vs 대안

| 방법                       | 장점                               | 단점                |
| ------------------------ | -------------------------------- | ----------------- |
| **@nestjs/config** (현재)  | NestJS 통합, `ConfigService` DI 가능 | 런타임 타입 검증 없음      |
| **@nestjs/config + Joi** | 앱 시작 시 환경변수 스키마 검증               | Joi 라이브러리 추가      |
| **zod + env 파싱**         | 타입 추론이 강력, TS 친화적                | 수동 연동 필요          |
| **dotenv 직접**            | 의존성 최소화                          | NestJS DI와 통합 어려움 |

> [!tip] `configService.get<string>('KEY')`는 타입 단언이지 검증이 아니다
> 환경변수가 없거나 잘못된 값이 들어와도 런타임에 `undefined`가 반환될 수 있다.
> **Joi 또는 zod로 시작 시점에 검증**하는 것이 프로덕션 수준의 접근이라고 한다. 다음 프로젝트에서는 반드시 적용하면서 진행하면 좋으리라 본다. 

## bodyParser 50MB 제한 vs 대안

| 접근                               | 장점               | 단점                   |
| -------------------------------- | ---------------- | -------------------- |
| **express json/urlencoded** (현재) | 익숙한 방식, 세밀한 제어   | 파일 업로드는 별도 Multer 필요 |
| **Multer 전용**                    | 파일 업로드에 최적화      | 일반 JSON 바디와 혼용 복잡    |
| **파일을 Object Storage에서 직접 수신**   | NestJS에 파일 부하 없음 | 아키텍처 복잡도 증가          |

---

# 6. 개발자로서 알아야 할 영역

## A. NestJS IoC 컨테이너와 DI 범위

`APP_GUARD` 패턴을 이해하려면 NestJS의 DI가 어떻게 동작하는지 알아야 한다.

- **Singleton scope** (기본): 모듈 당 인스턴스 하나. 앱 전체에서 공유.
- **Request scope**: 요청마다 새 인스턴스 생성. 성능 비용 있음.
- **Transient scope**: 주입받을 때마다 새 인스턴스 생성.

`APP_GUARD`로 등록된 `JwtAuthGuard`는 Singleton이다. `Reflector`도 Singleton으로 공유되므로, `app.get(Reflector)` 또는 생성자 주입 중 어느 방식이든 같은 인스턴스를 받는다.

## B. 글로벌 등록 두 가지 방식의 차이

```typescript
// 방식 1: main.ts에서 useGlobal* (DI 컨테이너 외부)
app.useGlobalGuards(new OriginGuard());

// 방식 2: AppModule에서 APP_* 토큰 (DI 컨테이너 내부)
{ provide: APP_GUARD, useClass: JwtAuthGuard }
```

**결정 기준**: 해당 클래스가 다른 Provider를 주입받을 필요가 있는가?
- 주입이 필요 없다 → 방식 1 (단순)
- 주입이 필요하다 → 반드시 방식 2

## C. `forRoot` vs `forRootAsync` 패턴

NestJS 동적 모듈의 표준 패턴. 라이브러리를 직접 만들거나 커스텀 모듈을 설계할 때 필수로 이해해야 한다.

```typescript
// 동기: 정적 값
ThrottlerModule.forRoot({ ttl: 60, limit: 100 })

// 비동기: 다른 Provider에서 값을 받아야 할 때
ThrottlerModule.forRootAsync({
  imports: [RedisModule],    // 필요한 모듈 등록
  inject: [REDIS_CLIENT],    // 팩토리 인자로 주입할 토큰
  useFactory: (redis) => ({ ... })  // 실제 설정 반환
})
```

## D. Graceful Shutdown과 컨테이너 오케스트레이션

Docker/K8s 환경에서 배포 시 `SIGTERM` 신호가 날아온다. `enableShutdownHooks()`를 활성화하지 않으면:
- 진행 중인 HTTP 요청이 강제 종료됨
- Redis 구독 연결이 비정상 종료됨
- DB 커넥션 풀이 정리되지 않음

`OnModuleDestroy`를 구현해 각 서비스가 자신의 리소스를 정리하는 패턴은 **마이크로서비스 안정성의 기본**이다.

## E. Rate Limiting 계층 설계

Rate Limit은 하나의 계층에서만 하는 것이 아니라 **계층별로 역할이 다르다**:

```
[클라이언트]
    │
[Nginx] ── Traffic Dam (토큰 버킷, Heavy/Light Zone 구분)
    │
[NestJS ThrottlerGuard] ── 서비스 레벨 보호 (burst/sustained 2단계)
    │
[내부 QueueService] ── 개별 작업 동시성 제어
    │
[FastAPI 워커] ── AI 연산 보호
```

각 계층이 왜 필요한지, 어느 계층에서 무엇을 막는지 설명할 수 있어야 한다.

## F. 환경변수 관리의 프로덕션 수준

현재 코드의 `configService.get<string>('JWT_SECRET')`는 **타입 단언**이다. 이부분은 AI 의 지적이 뼈아픈데, 프로덕션에서는:

1. **시작 시 검증**: Joi 스키마로 필수 환경변수가 빠지면 앱이 시작조차 안 되게
2. **시크릿 관리**: .env 파일 대신 AWS Secrets Manager, HashiCorp Vault, K8s Secret 사용
3. **런타임 재로드**: 일부 설정은 재배포 없이 변경 가능하도록 설계

라는 조건이 필요함을 강조했다. 알긴 하는데 바쁘다고 안했지만 뼈아프긴 하다(...) 

## G. 구조화 로깅과 옵저버빌리티

`main.ts`에서 Winston을 JSON 포맷으로 설정한 이유는 **Promtail이 파싱하기 위해서**다. 로그를 단순 텍스트로 출력하면 Loki에서 필터링이 어렵다.

개발자가 알아야 할 로깅 설계 원칙:
- 구조화된 JSON 로그 출력 (key-value로 파싱 가능하게)
- 로그 레벨 분리 (`error` / `warn` / `info` / `debug`)
- 요청 추적을 위한 Trace ID / Correlation ID 포함
- 민감 정보(비밀번호, 토큰) 로그 미노출

## H. CORS와 보안 헤더

```typescript
app.enableCors({
  origin: (requestOrigin, callback) => { ... },
  methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
  credentials: true,  // 쿠키/인증 헤더 허용
});
```

`credentials: true`를 쓸 때는 `origin: '*'` 가 불가능하다. 명시적 화이트리스트가 필요하다는 점, 그리고 `OPTIONS` 프리플라이트 요청까지 포함해야 한다는 점을 이해해야 한다.

추가로 알아야 할 보안 헤더: `helmet` 라이브러리로 `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security` 등 설정 가능. 현재 코드에는 미적용되어 있다.

---

# 핵심 요약 카드

> [!abstract] main.ts의 역할
> - **어떻게 실행할지** 결정하는 부트스트랩 파일
> - 글로벌 파이프라인 구성 (필터, 인터셉터, 가드, 파이프)
> - 런타임 설정 (CORS, bodyParser, 로거, 포트)
> - `useGlobal*` 순서 ≠ 실행 순서 (Lifecycle이 고정)

> [!abstract] app.module.ts의 역할
> - **무엇을 연결할지** 선언하는 조립 파일
> - 모든 도메인 모듈의 집합점
> - DI 컨테이너를 통한 전역 가드 등록 (`APP_GUARD`)
> - `forRootAsync` 패턴으로 동적 모듈 구성

> [!question] 면접/리뷰에서 설명할 수 있어야 하는 것
> 1. `useGlobalGuards` vs `APP_GUARD` 토큰 방식의 차이와 선택 기준
> 2. `ThrottlerModule`이 Redis를 쓰는 이유 (단일 인스턴스 vs 다중 인스턴스)
> 3. `enableShutdownHooks()`를 켜야 하는 이유와 연결되는 인터페이스
> 4. `ValidationPipe whitelist: true`가 보안에 미치는 영향
> 5. `ClassSerializerInterceptor`와 `@Exclude()`의 관계
