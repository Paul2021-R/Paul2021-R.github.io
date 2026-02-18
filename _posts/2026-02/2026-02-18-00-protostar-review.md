---
layout: post 
title: Protostar review note - 06 NestJS Intro
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

# NestJS 개념 정리
본 정리 내용은, 프레임워크에 대한 이해도를 복기 하면서도 짜게 되었던 구성요소들을 더 심화시켜 바라보고 풀스택을 하다보니 놓치거나 좀더 좋은 코드를 만들기 위해 필요한 개념 복습, 코드 구성에 대한 고민을 위한 추가 복습이다. 

개괄적인 전체 내용을 복습한 이후, 특정 파일 구성요소 중심으로 복습을 기록할 예정이다. 

- Node.js 위에서 동작하는 **구조화된 백엔드 프레임워크**
- TypeScript 네이티브 지원, Angular에서 영감을 받은 **모듈/DI 기반 아키텍처**
- Express(기본) 또는 Fastify를 HTTP 어댑터로 사용
- 데코레이터(`@Module`, `@Controller`, `@Injectable` 등)로 메타데이터를 선언하고, IoC 컨테이너가 의존성을 관리함

## 핵심 철학 및 특징
- **모듈성(Modularity)**: 기능 단위로 모듈을 나누고, 각 모듈이 자신의 책임 범위를 캡슐화
- **의존성 주입(DI)**: NestJS IoC 컨테이너가 Provider 인스턴스를 생성·관리하며, 생성자에서 자동 주입
- **데코레이터 기반**: 클래스와 메서드에 데코레이터를 붙여 역할을 선언적으로 표현
- **레이어드 파이프라인**: 요청이 들어오면 정해진 순서(Lifecycle)대로 처리 계층을 통과

## FastAPI와의 비교

| 구분        | NestJS                            | FastAPI               |
| --------- | --------------------------------- | --------------------- |
| **언어**    | TypeScript                        | Python                |
| **DI 방식** | IoC 컨테이너(자동 관리)                   | 함수 기반 Depends(명시적 추적) |
| **구조화**   | 강제적(Module/Controller/Service 분리) | 자유로움(도메인 설계는 개발자 몫)   |
| **비동기**   | Promise / RxJS Observable         | async/await (ASGI 기반) |
| **주요 용도** | 복잡한 비즈니스 로직, 엔터프라이즈               | AI 서빙, 경량 마이크로서비스     |

---

# 요청 생명주기 (Request Lifecycle)

> `main.ts` 주석에 직접 남겨둔 순서. NestJS의 파이프라인은 **절대적으로 지켜지는 순서**이므로 설계 시 이 흐름을 먼저 이해해야 한다.

```
1. 요청 진입 (HTTP Request)
2. Middleware     ─ 요청 자체가 이상하면 미리 컷
3. Guards        ─ 인증/인가 (검증 실패 시 Pipe 불필요)
4. Interceptors  ─ 요청 전처리 (로깅, 변환 등)
5. Pipes         ─ 인증된 사용자만 데이터 검사·변환
6. Controller & Service ─ 실제 비즈니스 로직
7. Interceptors  ─ 응답 후처리 (직렬화, 포맷 등)
8. Exception Filters ─ 에러 일괄 처리
9. Response
```

> [!tip] 핵심 포인트
> Guards 다음에 Pipe가 오는 이유: **인증이 안 된 요청의 데이터를 굳이 검증할 필요가 없기 때문**. 순서에 논리적 이유가 있다.

---

# 프로젝트 구조 (Protostar NestJS)

```
src/
├── app.module.ts          # 루트 모듈 (전체 조립)
├── app.controller.ts      # 루트 컨트롤러 (헬스체크 등)
├── app.service.ts
├── main.ts                # 진입점 (글로벌 파이프라인 설정)
│
├── common/                # 공통 인프라 레이어
│   ├── constants.ts       # 전역 상수
│   ├── decorators/        # 커스텀 데코레이터
│   │   ├── public.decorator.ts        # @Public() - JWT 인증 우회
│   │   └── validate-user.decorator.ts # @ValidateUser() - 유저 추출
│   ├── filters/
│   │   └── http-exception.filter.ts   # 전역 예외 필터
│   ├── guards/
│   │   ├── jwt-auth.guard.ts          # 전역 JWT 인증 가드
│   │   ├── ai-circuit.guard.ts        # AI 서비스 상태 서킷브레이커
│   │   └── origin.guard.ts            # Origin 화이트리스트 검사
│   ├── interceptors/
│   │   ├── logging.interceptor.ts            # HTTP 트래픽 로깅
│   │   └── knowledge-upload-busy-check.interceptor.ts
│   ├── monitoring/
│   │   ├── ai-status-monitoring.service.ts   # AI 상태 폴링 (1초 크론)
│   │   └── system-monitoring.service.ts
│   ├── objectStorage/     # MinIO 연동
│   ├── prisma/            # Prisma ORM 모듈
│   ├── queue/
│   │   └── queue.service.ts           # 인메모리 동시성 제어 큐
│   ├── redis/
│   │   └── redis.module.ts            # Redis 클라이언트 모듈
│   └── strategy/
│       └── jwt.strategy.ts            # Passport JWT 전략
│
└── features/              # 기능 도메인 레이어
    ├── auth/              # 인증 (로그인, 회원가입, JWT 발급)
    ├── chat/              # SSE 스트림 + Redis Pub/Sub
    └── knowledge/         # 파일 업로드 + RAG 웹훅
```

> [!info] 구조 설계 원칙
> - `common/` : 어떤 도메인에도 종속되지 않는 인프라성 코드 (가드, 인터셉터, 필터, 공유 서비스)
> - `features/` : 실제 비즈니스 도메인 단위 (각 도메인이 자신의 module/controller/service/dto를 포함)

---

# 모듈 시스템

NestJS의 모든 구성 요소는 **모듈로 조립**된다. `@Module` 데코레이터의 4가지 필드를 이해하면 전체 구조가 보인다.

```typescript
@Module({
  imports: [],      // 다른 모듈에서 가져올 것들
  controllers: [],  // 이 모듈의 HTTP 엔드포인트
  providers: [],    // 이 모듈에서 DI로 관리할 서비스/가드 등
  exports: [],      // 외부 모듈에서 사용할 수 있도록 공개
})
```

### AppModule 분석 (`app.module.ts`)

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),   // 환경변수 전역 등록
    RedisModule,
    ChatModule,
    ThrottlerModule.forRootAsync({ ... }),       // Redis 기반 Rate Limit
    ObjectStorageModule,
    AuthModule,
    PrismaModule,
    KnowledgeModule,
  ],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },  // 전역 Rate Limit 가드
    { provide: APP_GUARD, useClass: JwtAuthGuard },    // 전역 JWT 인증 가드
  ],
})
export class AppModule {}
```

> [!note] APP_GUARD 토큰
> `APP_GUARD` 는 NestJS가 전역 가드를 등록하는 특수 토큰. 모든 요청에 자동 적용된다.
> `ThrottlerGuard`와 `JwtAuthGuard` 두 개를 등록하면 **모든 요청이 두 가드를 순서대로 통과**한다.

---

# Guards (가드)

요청을 **허용할지 차단할지 결정**하는 계층. `canActivate()` 가 `true`를 반환해야 다음 단계로 진행된다.

## JwtAuthGuard - 전역 JWT 인증

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) { super(); }

  canActivate(context: ExecutionContext) {
    // Reflector로 메타데이터 확인
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),  // 메서드 레벨 메타데이터
      context.getClass(),    // 클래스 레벨 메타데이터
    ]);

    if (isPublic) return true;  // @Public() 이면 통과
    return super.canActivate(context);  // 아니면 JWT 검증
  }
}
```

**핵심 패턴**: 전역으로 JWT 인증을 걸되, `@Public()` 데코레이터로 특정 엔드포인트만 우회.
→ 기본값이 "인증 필요"이므로 **새 엔드포인트 추가 시 인증을 까먹을 위험이 없다**.

## AiCircuitGuard - 서킷 브레이커

```typescript
@Injectable()
export class AiCircuitGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const isAvailable = this.aiStatusMonitoringService.isAvailable();
    if (!isAvailable) throw new ServiceUnavailableException('AI Service Unavailable.');
    return true;
  }
}
```

- AI 서비스(FastAPI 워커)가 살아있는지 확인 후 요청 차단
- 서킷브레이커 패턴을 Guard 레이어에서 구현
- `@UseGuards(AiCircuitGuard)` 로 채팅/지식 엔드포인트에만 적용

---

# Interceptors (인터셉터)

요청/응답 **전후를 모두 가로채는** 계층. RxJS `Observable`을 반환해야 한다.

## LoggingInterceptor - HTTP 트래픽 로깅

```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        // 응답이 나간 후 실행 (afterResponse)
        const responseTime = Date.now() - now;
        // Promtail/Loki 수집용 구조화 로그 출력
        this.logger.log({ type: 'http_traffic_protostar', duration_ms: responseTime, ... });
      }),
    );
  }
}
```

> [!tip] `next.handle().pipe(tap(...))`
> - `next.handle()` : 다음 핸들러(컨트롤러)를 실행하는 Observable
> - `tap()` : 스트림을 변환하지 않고 **사이드 이펙트만** 실행 (로깅에 적합)
> - 요청 전 로직은 `next.handle()` 호출 **전**, 응답 후 로직은 `pipe()` 안에 작성

---

# Exception Filters (예외 필터)

파이프라인의 **마지막 방어선**. 처리되지 않은 예외를 잡아 일관된 에러 응답으로 변환한다.

## GlobalExceptionFilter

```typescript
@Catch()  // 인자 없으면 모든 예외 캐치
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // 5xx: logger.error / 4xx: logger.warn 으로 Loki 레벨 분리
    if (status >= 500) this.logger.error(JSON.stringify(logData));
    else this.logger.warn(JSON.stringify(logData));

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: ...,
      path: request.url,
      message: ...,
    });
  }
}
```

**설계 포인트**:
- 모든 에러의 응답 형태를 `{ success: false, statusCode, timestamp, path, message }` 로 통일
- 5xx / 4xx를 로그 레벨로 분리해 Loki(로그 시스템)에서 알람 기준을 다르게 설정

---

# 커스텀 데코레이터

NestJS에서 메타데이터를 활용한 커스텀 데코레이터를 만드는 두 가지 패턴.

## @Public() - 메타데이터 태깅

```typescript
// 정의
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// 사용
@Public()
@Get('stream/:sessionId')
stream(...) {}
```

- `SetMetadata(key, value)` : 클래스/메서드에 메타데이터를 심는다
- `Reflector.getAllAndOverride(key, [handler, class])` : 메서드 → 클래스 순서로 메타데이터를 읽는다
- Guard에서 이 값을 읽어 분기처리

## @ValidateUser() - 파라미터 데코레이터

요청 컨텍스트에서 JWT 검증 후 주입된 유저 객체를 꺼내는 파라미터 데코레이터.

```typescript
// 사용
@Post()
async uploadDocs(@ValidateUser() user: User, ...) { ... }
```

---

# JWT 인증 흐름

## JwtStrategy - Passport 전략

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Authorization: Bearer ...
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<Partial<User>> {
    // stateless: DB 조회 없이 토큰 payload만으로 유저 정보 반환
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
```

## AuthModule - 비동기 설정 패턴

```typescript
JwtModule.registerAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService): Promise<JwtModuleOptions> => ({
    secret: configService.get<string>('JWT_SECRET'),
    signOptions: { expiresIn: Number(configService.get('JWT_EXPIRATION')) },
  }),
})
```

> [!warning] 타입 단언 주의
> `configService.get<string>('KEY')` 의 제네릭은 **형변환이 아닌 타입 단언**이다.
> 실제로 `string`이 아닌 값이 들어와도 런타임 에러가 발생하지 않는다.
> 확실한 검증이 필요하면 **Joi** 로 환경변수 스키마를 검증해야 한다.

---

# SSE (Server-Sent Events) + RxJS

채팅 스트림은 `@Sse` 데코레이터와 RxJS `Observable`로 구현되어 있다.

## ChatController - SSE 엔드포인트

```typescript
@Sse('stream/:sessionId')
@SkipThrottle()            // Rate Limit 우회 (스트리밍은 장기 연결)
@Header('X-Accel-Buffering', 'no')  // Nginx 버퍼링 비활성화
stream(@Param('sessionId') sessionId: string): Observable<MessageEvent<any>> {

  const userStreamSubject = this.chatService.addClient(uuid, sessionId);

  const initEvent = from([{ data: { type: 'init', uuid, ... } }]);      // 연결 즉시 전송
  const heartbeatEvent = interval(5000).pipe(map(() => ({ data: { type: 'heartbeat' } })));
  const messageStream = userStreamSubject.asObservable().pipe(map(payload => ({ data: payload })));

  return merge(initEvent, heartbeatEvent, messageStream).pipe(
    finalize(() => this.chatService.removeClient(uuid, sessionId))  // 연결 종료 시 정리
  );
}
```

## ChatService - Redis Pub/Sub 연동

```typescript
// Redis 구독자와 발행자는 별도 커넥션을 사용해야 함
constructor(@Inject(REDIS_CLIENT) private readonly redisPublisher: Redis) {
  this.redisSubscriber = redisPublisher.duplicate();  // 커넥션 복제
}

async onModuleInit() {
  await this.redisSubscriber.psubscribe('chat:stream:*');  // 패턴 구독
  this.redisSubscriber.on('pmessage', (pattern, channel, message) => {
    this.routeMessageToUser(channel, message);  // 해당 유저의 Subject에 push
  });
}
```

**전체 흐름**:
```
Client SSE연결 → Subject 생성 → Redis 구독
→ POST /message → Redis에 Job 적재
→ FastAPI 워커가 처리 후 Redis Publish
→ NestJS가 수신 → Subject.next() → SSE 전송
```

---

# AI 서비스 상태 모니터링 (서킷 브레이커)

```typescript
@Injectable()
export class AiStatusMonitoringService implements OnModuleInit {
  private isAiAvailable: boolean = false;

  @Cron('*/1 * * * * *')   // 1초마다 실행
  async syncStatus() {
    const threshold = Date.now() / 1000 - 5;  // 5초 이내 heartbeat만 유효

    await this.redis.zremrangebyscore('cluster:heartbeats', '-inf', threshold);  // 좀비 제거
    const count = await this.redis.zcard('cluster:heartbeats');   // 생존 서버 수 확인
    this.isAiAvailable = count > 0;
  }
}
```

> [!warning] Redis Timeout 설정 필요
> ioredis 기본 설정은 명령어 타임아웃이 `undefined`. Redis가 죽으면 `await` 이하에서 영구 대기.
> 크론 작업에서 이가 반복되면 **Promise 스택 누적 → 힙 메모리 고갈 → 이벤트 루프 고갈**로 이어진다.
> `redis.module.ts`에서 `commandTimeout` 옵션으로 해결함.

---

# ValidationPipe & DTO

요청 바디를 자동으로 검증하고 변환하는 파이프라인.

```typescript
// main.ts
app.useGlobalPipes(new ValidationPipe({
  transform: true,    // 요청 데이터를 DTO 클래스 인스턴스로 자동 변환
  whitelist: true,    // DTO에 없는 필드는 자동 제거 (보안)
}));
```

- `class-validator` 데코레이터 (`@IsString()`, `@IsEmail()` 등)로 DTO에서 검증 선언
- `class-transformer`가 JSON → 클래스 인스턴스 변환
- `whitelist: true` 로 DTO에 정의되지 않은 필드를 자동으로 제거 → **의도치 않은 필드 주입 방지**

---

# Lifecycle Hooks

모듈/서비스의 초기화·종료 시점을 후킹하는 인터페이스.

```typescript
@Injectable()
export class ChatService implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    // NestJS 앱 완전 시작 직후 실행
    await this.redisSubscriber.psubscribe('chat:stream:*');
  }

  onModuleDestroy() {
    // 앱 종료 직전 실행 (Graceful Shutdown)
    this.redisSubscriber.quit();
  }
}
```

`main.ts`의 `app.enableShutdownHooks()` 와 함께 사용하면 **Docker 종료 시 연결된 소켓이 안전하게 닫힌다**.

---

# 인메모리 동시성 제어 큐 (QueueService)

지식 업로드 같은 무거운 작업의 동시 처리 수를 제한하는 **직접 구현 큐** 했다. 이러한 설계는 AI 를 위한 RAG 의 실시간 처리에서 과포화 상태를 만들거나 하여 서비스 안정성을 해치는 것을 막기 위해서다.

```typescript
@Injectable()
export class QueueService {
  private readonly concurrency = CONSTANTS.CONCURRENCY;   // 최대 동시 실행 수
  private readonly maxPending = CONSTANTS.MAX_PENDING;    // 최대 대기 수
  private readonly queue: Task[] = [];
  private activeCount = 0;

  public add<T>(task: Task<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      if (this.queue.length >= this.maxPending) {
        return reject(new Error('System queue is full'));  // 큐가 꽉 찼으면 즉시 거절
      }

      const wrappedTask = async () => {
        this.activeCount++;
        try { resolve(await task()); }
        catch (error) { reject(error); }
        finally { this.activeCount--; this.next(); }  // 작업 완료 후 다음 큐 실행
      };

      this.queue.push(wrappedTask);
      if (this.activeCount < this.concurrency) this.next();
    });
  }
}
```

**동작 원리**:
- `concurrency`: 동시에 실행 중인 작업 수 상한
- `maxPending`: 대기열 최대 크기, 초과 시 즉시 거절(Back Pressure)
- Redis Throttler와는 다른 계층 - 이건 **서버 내부 처리 리소스 보호**가 목적

---

# main.ts 글로벌 설정 요약

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(...),  // Winston으로 로거 교체
    bodyParser: false,                         // express json/urlencoded 직접 설정 (50mb 제한)
  });

  app.enableCors({ origin: staticWhitelist, credentials: true });

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.enableShutdownHooks();
  app.useGlobalGuards(new OriginGuard());
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
```

> [!note] `ClassSerializerInterceptor`
> `class-transformer`의 `@Exclude()`, `@Expose()` 같은 데코레이터를 응답 직렬화 시 자동 적용.
> 예: 비밀번호 필드를 DTO에서 `@Exclude()` 하면 응답에서 자동으로 제거됨.
