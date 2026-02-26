---
layout: post 
title: Protostar review note - 11 - NestJS Chat Domain (SSE + Redis PubSub)
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


# NestJS Chat 도메인 분석
## SSE + Redis Pub/Sub + RxJS

> 이 파일은 실시간 AI 채팅 스트리밍을 담당하는 Chat 도메인을 다룬다.
>
> | 파일 | 역할 |
> |---|---|
> | `chat.controller.ts` | SSE 스트림 엔드포인트, 메시지 디스패치 |
> | `chat.service.ts` | Redis Pub/Sub, RxJS Subject, 연결 관리 |
> | `chat.module.ts` | MonitoringModule 의존, 모듈 조립 |
> | `dto/create-chat.dto.ts` | 채팅 메시지 요청 검증 (조건부 검증 포함) |
> | `interface/ChatMessage.ts` | SSE 스트림 메시지 타입 계약 |

---

# 1. 주요 개념

## 왜 WebSocket이 아닌 SSE인가

| 구분 | SSE (현재) | WebSocket |
|---|---|---|
| **방향** | 서버 → 클라이언트 단방향 | 양방향 |
| **프로토콜** | HTTP/1.1 위에서 동작 | 별도 WS 프로토콜 |
| **Nginx 설정** | `X-Accel-Buffering: no` 만 추가 | Upgrade 헤더 프록시 설정 필요 |
| **재연결** | 브라우저가 자동 재연결 | 클라이언트가 직접 구현 |
| **적합한 경우** | AI 스트리밍, 알림, 로그 | 실시간 채팅, 게임, 협업 도구 |

AI 응답은 **서버 → 클라이언트 단방향**이므로 SSE가 구조적으로 더 적합하다. WebSocket의 양방향성은 이 서비스에서 불필요한 복잡도다.

## 두 단계 채팅 흐름

이 프로젝트의 채팅은 **연결(SSE)과 요청(POST)이 분리**된 비동기 구조다.

```
Step 1: GET /api/v1/chat/stream/:sessionId  → SSE 연결 수립 (롱 커넥션)
Step 2: POST /api/v1/chat/message           → 메시지 전송 (일반 HTTP)
Step 3: FastAPI 워커가 처리 후 Redis Publish
Step 4: NestJS가 수신 → SSE로 클라이언트에게 스트리밍
```

POST와 SSE가 분리된 이유: SSE는 서버가 일방적으로 데이터를 밀어내는 구조라 클라이언트가 요청 본문을 SSE 연결로 보낼 수 없다.

## RxJS Subject + Observable 패턴

```
streamMap: Map<string, Subject<ChatMessage>>
  ↑ 유저 연결 시 Subject 생성·저장
  ↓ Redis에서 메시지 수신 시 Subject.next() 호출
  → Subject.asObservable() → SSE 스트림으로 전송
```

`Subject`는 Observable이면서 동시에 Observer다. 외부에서 `.next()`로 데이터를 밀어 넣으면 구독자(SSE 연결)에게 즉시 전달된다.

## Redis Pub/Sub - 구독자 커넥션 분리

```typescript
constructor(@Inject(REDIS_CLIENT) private readonly redisPublisher: Redis) {
  this.redisSubscriber = redisPublisher.duplicate();  // 별도 커넥션
}
```

Redis 규칙: **Pub/Sub 모드에 진입한 커넥션은 SUBSCRIBE 명령어만 수신 가능**하다. 일반 GET/SET 명령을 함께 쓰려면 반드시 커넥션을 분리해야 한다. `duplicate()`는 동일 설정으로 새 커넥션을 생성한다.

---

# 2. 핵심 로직 흐름

## 전체 흐름 시퀀스

```
[Client]
  │
  ├─ GET /stream/:sessionId?uuid={uuid}
  │    │
  │    ├─ AiCircuitGuard: AI 서비스 가용 여부 확인
  │    ├─ ChatService.isOkayToConnect(): 최대 연결 수 확인
  │    ├─ ChatService.addClient(uuid, sessionId)
  │    │    └─ streamMap.set(`${uuid}-${sessionId}`, new Subject())
  │    │
  │    └─ Observable 반환 (merge)
  │         ├─ initEvent:      { type: 'init', uuid, sessionId }   즉시 1회
  │         ├─ heartbeatEvent: { type: 'heartbeat' }               매 N초
  │         └─ messageStream:  Subject.asObservable()              Redis 메시지 수신 시
  │
  ├─ POST /message  { uuid, sessionId, mode, content, context }
  │    │
  │    ├─ AiCircuitGuard: AI 가용 여부 확인
  │    ├─ ChatService.dispatchJob(dto)
  │    │    ├─ 1. hasActiveStream(): uuid-sessionId 가 streamMap에 있는지 확인
  │    │    ├─ 2. mode=page_context → sanitize(context)   XSS 제거
  │    │    ├─ 3. jobId = uuidv4()
  │    │    └─ 4. Redis pipeline
  │    │          ├─ SET  chat:task:{jobId}  payload  EX 300
  │    │          └─ RPUSH chat:job:queue    jobId
  │    │
  │    └─ return { success, status: 'queued', jobId }
  │
[FastAPI 워커]
  │  chat:job:queue 소비 → LLM 처리 → 토큰 스트리밍
  │  → PUBLISH chat:stream:{uuid}-{sessionId}  메시지
  │
[ChatService - Redis Subscriber]
  │  pmessage 이벤트 수신
  │  → routeMessageToUser(channel, message)
  │      └─ streamMap.get(sessionId).next(payload)
  │
[Client SSE]
     Subject.next() → Observable → SSE Event 전송
```

## SSE 엔드포인트 상세

```typescript
@Public()
@Get('stream/:sessionId')
@Sse('stream/:sessionId')            // NestJS SSE 데코레이터
@UseGuards(AiCircuitGuard)
@SkipThrottle()                      // 장기 연결 - Rate Limit 카운트 제외
@Header('X-Accel-Buffering', 'no')  // Nginx 버퍼링 비활성화 (실시간 전송)
@Header('Cache-Control', 'no-cache')
@Header('Connection', 'keep-alive')
stream(@Param('sessionId') sessionId: string, @Query('uuid') earlyUUID?: string) {

  const targetUuid = earlyUUID || uuidv4();  // 클라이언트가 UUID를 미리 알고 싶을 때

  const userStreamSubject = this.chatService.addClient(targetUuid, sessionId);

  const initEvent = from([{ data: { type: 'init', uuid: targetUuid } }]);

  const heartbeatEvent = interval(SSE_HEARTBEAT_INTERVAL).pipe(
    map(() => ({ data: { type: 'heartbeat', timestamp: new Date().toISOString() } }))
  );

  const messageStream = userStreamSubject.asObservable().pipe(
    map(payload => ({ data: payload }))
  );

  return merge(initEvent, heartbeatEvent, messageStream).pipe(
    finalize(() => {
      this.chatService.removeClient(targetUuid, sessionId);
      // TODO: Redis Unsubscribe Logic
    })
  );
}
```

## `dispatchJob` 내부 처리

```typescript
async dispatchJob(dto: CreateChatDto) {
  // 1. UUID-sessionId 쌍이 실제 연결 중인지 확인 (보안)
  if (!this.hasActiveStream(dto.uuid, dto.sessionId)) {
    throw new Error('Unauthorized');  // SSE 없이 POST만 보내는 시도 차단
  }

  // 2. page_context 모드일 때만 context XSS 제거
  let cleanContext: string | null = null;
  if (dto.mode === 'page_context' && dto.context) {
    cleanContext = sanitize(dto.context, {
      allowedTags: [],          // 모든 HTML 태그 제거
      allowedAttributes: {},    // 모든 속성 제거
      disallowedTagsMode: 'discard',
    });
    cleanContext = cleanContext.trim();
  }

  // 3. Redis pipeline으로 원자적 2-step 저장
  const jobId = uuidv4();
  const pipeline = this.redisPublisher.pipeline();
  pipeline.set(`chat:task:${jobId}`, JSON.stringify(payload), 'EX', 300);
  pipeline.rpush('chat:job:queue', jobId);
  await pipeline.exec();

  return jobId;
}
```

## Redis 패턴 구독 (`psubscribe`)

```typescript
await this.redisSubscriber.psubscribe('chat:stream:*');
// 패턴 매칭: chat:stream:uuid-sessionId 형태의 모든 채널 구독

this.redisSubscriber.on('pmessage', (pattern, channel, message) => {
  // pattern: 'chat:stream:*'
  // channel: 'chat:stream:abc123-session456'
  // message: JSON 문자열
  this.routeMessageToUser(channel, message);
});
```

`subscribe`는 정확한 채널명, `psubscribe`는 **글로브 패턴**으로 구독한다. 유저별로 동적 채널이 생성되는 구조에서는 `psubscribe`가 필수다.

## 연결 수 제어 (`static activeConnections`)

```typescript
private static activeConnections = 0;  // 클래스 레벨 공유 변수

public incrementActiveConnections(): boolean {
  if (ChatService.activeConnections >= CHAT_MAX_CONNECTIONS) return false;
  ChatService.activeConnections++;
  return true;
}
```

`static` 변수를 사용하는 이유: NestJS에서 서비스는 기본 Singleton이므로 인스턴스 변수(`this.activeConnections`)로도 충분하다. 다만 `static`으로 선언하면 클래스 레벨에서 절대적으로 공유됨을 명시적으로 표현한다.

---

# 3. 구조적 취약점 / 개선 방향

## [ChatController] TODO: Redis Unsubscribe 미구현

```typescript
return merge(initEvent, heartbeatEvent, messageStream).pipe(
  finalize(() => {
    this.chatService.removeClient(targetUuid, sessionId);
    //TODO: Implement Redis Unsubscribe Logic
  })
);
```

현재 SSE 연결이 끊겨도 `chat:stream:*` 패턴 구독 자체는 유지된다. 연결된 유저가 없는 채널로 메시지가 들어오면 `routeMessageToUser`에서 `streamMap`에 해당 키가 없어 무시되므로 기능상 문제는 없다. 하지만 연결 수가 많아지면 불필요한 Redis 메시지를 수신해 CPU를 소모한다.

**개선 방향**: 유저별 채널 구독(`subscribe`)으로 전환하고, 연결 종료 시 해당 채널 `unsubscribe`.

## [ChatService] streamMap 키 충돌 가능성

```typescript
this.streamMap.set(`${uuid}-${sessionId}`, subject);
```

UUID + sessionId를 `-`로 단순 연결한다. 두 값 모두 클라이언트가 임의로 전송할 수 있으므로, 키 충돌이 발생하면 기존 Subject가 덮어씌워진다. 분리자를 더 안전하게 구성하거나 UUID 형식을 서버에서 강제하면 위험을 줄일 수 있다.

## [ChatService] `routeMessageToUser` 채널 파싱 취약성

```typescript
private routeMessageToUser(channel: string, messageString: string) {
  const sessionId = channel.split(':').pop();  // 마지막 세그먼트
  // channel: "chat:stream:uuid-sessionId"
  // → split(':') → ['chat', 'stream', 'uuid-sessionId']
  // → pop() → 'uuid-sessionId'
}
```

`channel.split(':').pop()`으로 `uuid-sessionId` 전체를 꺼내서 streamMap 키로 사용하고 있다. 그런데 `streamMap`에는 `${uuid}-${sessionId}` 형태로 저장하므로 FastAPI 워커가 채널명을 정확히 `chat:stream:{uuid}-{sessionId}` 형태로 발행해야 한다. 이 **채널 이름 형식이 암묵적 계약**이 되어 있어, 한쪽이 변경되면 전체가 깨진다.

## [CreateChatDto] `mode`를 Prisma enum이 아닌 리터럴 유니온으로 선언

```typescript
@IsEnum(['general', 'page_context', 'test'])
mode: 'general' | 'page_context' | 'test';
```

배열 리터럴로 enum을 직접 정의하고 있다. `'test'` 모드가 프로덕션에 그대로 노출되어 있다. 내부 테스트용 모드는 프로덕션 빌드에서 제거하거나 별도 가드로 막아야 한다.

## [ChatService] 정적 연결 수와 streamMap 크기의 불일치 가능성

```typescript
public getStreamMapSize() { return this.streamMap.size; }
public getActiveConnections() { return ChatService.activeConnections; }
```

두 값이 항상 일치해야 하지만, 예외 상황(예: `addClient` 이후 `incrementActiveConnections` 실패 경로 등)에서 불일치가 발생할 수 있다. 두 상태를 `streamMap.size`로 단일화하면 불일치 자체를 없앨 수 있다.

## [dispatchJob] `hasActiveStream` 인가 우회 가능성

```typescript
if (!this.hasActiveStream(dto.uuid, dto.sessionId)) {
  throw new Error('Unauthorized');
}
```

uuid와 sessionId가 모두 클라이언트 제공값이다. 공격자가 타인의 uuid-sessionId를 알면 그 유저의 SSE 스트림에 메시지를 삽입할 수 있다. 현재는 uuid가 서버에서 발급되거나 클라이언트가 생성하는 임의값이어서 예측이 어렵지만, JWT 기반 유저 식별과 연동하면 더 안전해진다.

---

# 4. 핵심 메서드 및 라이브러리 함수 설명

## `@Sse()` 데코레이터

NestJS에서 SSE 엔드포인트를 선언하는 데코레이터. 반환값이 반드시 `Observable<MessageEvent>`이어야 한다.

```typescript
// MessageEvent 형식
{ data: any }  // SSE의 data: 필드에 직렬화되어 전송
```

브라우저는 `EventSource` API로 SSE를 소비하고, 연결이 끊기면 자동으로 재연결을 시도한다.

## RxJS `merge()`

여러 Observable을 하나로 합치는 연산자. 각 소스에서 값이 발행될 때마다 즉시 다운스트림으로 전달한다.

```typescript
return merge(initEvent, heartbeatEvent, messageStream)
// initEvent: 즉시 1회 발행 후 완료
// heartbeatEvent: N초마다 계속 발행
// messageStream: Redis 메시지 수신 시 발행
// → 세 스트림을 하나의 SSE 스트림으로 병합
```

## RxJS `finalize()`

Observable이 **완료되거나 에러로 종료될 때** 반드시 실행되는 콜백. `try/finally`의 Observable 버전.

```typescript
.pipe(
  finalize(() => {
    this.chatService.removeClient(uuid, sessionId);
    // SSE 연결 종료(정상/비정상 모두)될 때 Subject 정리 + 연결 수 감소
  })
)
```

## RxJS `Subject`

```typescript
const subject = new Subject<ChatMessage>();
this.streamMap.set(`${uuid}-${sessionId}`, subject);

// 외부에서 데이터 밀어 넣기
subject.next(payload);         // Redis 메시지 수신 시

// SSE에 연결
subject.asObservable()         // 읽기 전용 Observable로 노출
  .pipe(map(payload => ({ data: payload })))

// 연결 종료 시
subject.complete();            // 스트림 종료 신호 → SSE 연결 끊김
```

`Subject`를 직접 외부에 노출하지 않고 `asObservable()`로 래핑하는 이유: 외부에서 `.next()`를 호출하지 못하도록 **쓰기 권한을 제한**하기 위해서다.

## RxJS `interval(ms)`

```typescript
const heartbeatEvent = interval(SSE_HEARTBEAT_INTERVAL).pipe(
  map(() => ({ data: { type: 'heartbeat', ... } }))
);
```

지정된 밀리초마다 숫자(0, 1, 2, ...)를 발행하는 Observable. `map`으로 heartbeat 페이로드로 변환한다. Heartbeat 목적: 프록시(Nginx)나 브라우저가 유휴 연결을 끊지 않도록 유지시키는 keepalive 신호.

## `sanitize-html`

```typescript
cleanContext = sanitize(dto.context, {
  allowedTags: [],
  allowedAttributes: {},
  disallowedTagsMode: 'discard',
});
```

HTML 문자열에서 허용되지 않은 태그와 속성을 제거한다. `allowedTags: []`는 **모든 HTML 태그를 제거**한다는 의미. `page_context` 모드에서 페이지 본문 텍스트를 그대로 LLM에 전달하는데, 악의적인 `<script>` 태그나 이벤트 핸들러가 프롬프트 인젝션으로 악용될 수 있어 세탁이 필요하다.

## Redis `pipeline()`

```typescript
const pipeline = this.redisPublisher.pipeline();
pipeline.set(taskKey, taskPayload, 'EX', 300);
pipeline.rpush('chat:job:queue', jobId);
await pipeline.exec();
```

여러 Redis 명령을 하나의 네트워크 왕복으로 묶어 전송하는 최적화. 각각 `await`하면 RTT(Round-Trip Time)가 명령 수만큼 발생하지만, pipeline은 한 번에 전송하고 한 번에 응답을 받는다. 단, 트랜잭션(MULTI/EXEC)은 아니므로 개별 명령 실패 시 rollback은 없다.

## `@ValidateIf` 조건부 검증

```typescript
@ValidateIf((o) => o.mode === 'page_context')  // mode가 page_context일 때만 검증
@IsString()
@IsNotEmpty()
context?: string | null;
```

`mode`가 `'page_context'`일 때만 `context` 필드를 필수로 검증한다. 다른 모드에서는 `context`가 없어도 통과한다. 복잡한 조건부 유효성 검증을 선언적으로 표현하는 class-validator 패턴이다.

## `from([])` - 단발성 Observable

```typescript
const initEvent = from([
  { data: { type: 'init', uuid: targetUuid } }
]);
```

배열에서 Observable을 생성한다. 배열의 모든 요소를 순서대로 발행하고 즉시 완료된다. `merge`에 포함되면 연결 즉시 init 이벤트를 한 번 보내고 그 소스는 종료되지만, 다른 소스(heartbeat, messageStream)가 계속 살아있으므로 전체 Observable은 유지된다.

---

# 5. 대체 가능한 라이브러리 및 트레이드오프

## SSE vs WebSocket vs Long Polling

| 방법 | 방향 | 복잡도 | 적합한 경우 |
|---|---|---|---|
| **SSE** (현재) | 단방향(서버→클라이언트) | 낮음 | AI 스트리밍, 알림, 피드 |
| **WebSocket** | 양방향 | 높음 | 실시간 채팅, 게임, 협업 |
| **Long Polling** | 단방향(흉내) | 중간 | SSE 미지원 환경, 레거시 브라우저 |

> SSE는 HTTP/2 위에서 멀티플렉싱되어 성능이 더 좋다. HTTP/1.1에서는 브라우저당 동일 도메인 연결 수 제한(6개)이 있어 탭이 많으면 문제가 될 수 있다.

## Redis Pub/Sub vs 대안

| 방법 | 장점 | 단점 |
|---|---|---|
| **Redis Pub/Sub** (현재) | 구현 단순, 기존 Redis 재사용 | 메시지 영속성 없음, 미연결 시 소실 |
| **Redis Streams** | 메시지 영속성, Consumer Group | 구현 복잡도 증가 |
| **Kafka** | 대용량, 재처리 가능, 내구성 | 별도 인프라, 운영 복잡도 |
| **BullMQ** | NestJS 통합 용이, 재시도 내장 | Pub/Sub보다 큐 개념에 가까움 |

> 현재 구조에서 FastAPI 워커가 응답을 Publish할 때 NestJS가 연결되어 있지 않으면 메시지가 소실된다. **Redis Streams**로 전환하면 재처리가 가능하지만 구현 복잡도가 높아진다. 서비스 규모를 고려할 때 현재 방식이 합리적인 선택이다.

## RxJS `Subject` vs 대안

| 방법 | 장점 | 단점 |
|---|---|---|
| **Subject** (현재) | 간결, RxJS 생태계 통합 | Cold/Hot Observable 개념 이해 필요 |
| **EventEmitter** | Node.js 내장, 친숙 | RxJS 파이프라인과 통합 어려움 |
| **BehaviorSubject** | 최신 값 캐싱 가능 | AI 스트리밍에는 불필요 |
| **ReplaySubject** | 이전 값 재전송 가능 | 메모리 사용 증가 |

> AI 스트리밍은 실시간 토큰 전달이 목적이므로 이전 값 캐싱이 필요 없다. `Subject`가 가장 적합하다.

## `sanitize-html` vs 대안

| 라이브러리 | 장점 | 단점 |
|---|---|---|
| **sanitize-html** (현재) | 설정 유연, 태그·속성 화이트리스트 | 번들 크기 다소 큼 |
| **DOMPurify** | 브라우저 표준 DOM 파서 사용, 가장 강력 | 서버사이드(Node.js)에서 jsdom 필요 |
| **xss** | 경량, 빠름 | 세밀한 설정 제한적 |

---

# 6. 개발자로서 알아야 할 영역

## A. SSE 프로토콜 이해

SSE는 HTTP 응답을 끊지 않고 지속적으로 데이터를 보내는 방식이다.

```
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

data: {"type":"init","uuid":"..."}

data: {"type":"heartbeat"}

data: {"type":"message","content":"AI 응답..."}
```

- `data:` 접두사가 붙은 줄이 이벤트 데이터
- 빈 줄(`\n\n`)이 이벤트 구분자
- `@Sse()` 데코레이터가 `Content-Type: text/event-stream` 헤더를 자동 설정

## B. `X-Accel-Buffering: no`가 필요한 이유

```typescript
@Header('X-Accel-Buffering', 'no')
```

Nginx는 기본적으로 업스트림(NestJS) 응답을 **버퍼링**했다가 클라이언트에게 보낸다. SSE는 실시간 전송이 목적이므로 버퍼링이 쌓이면 데이터가 지연된다. `X-Accel-Buffering: no`는 Nginx에게 "이 응답은 버퍼링하지 말고 즉시 전달하라"고 지시한다.

## C. 비동기 채팅 아키텍처의 설계 이유

일반적인 채팅은 `요청 → 응답`의 동기 HTTP 구조다. 이 프로젝트가 **SSE 연결 + POST 분리** 구조를 택한 이유:

1. **AI 처리 시간이 불확실**: LLM 추론은 수초~수십 초 소요. HTTP 타임아웃 위험.
2. **토큰 스트리밍**: AI가 토큰을 생성하는 즉시 사용자에게 보내야 UX가 좋다.
3. **워커 분리**: NestJS가 AI 추론을 직접 하지 않고 FastAPI 워커에 위임. NestJS는 트래픽 관리에 집중.

```
동기 방식의 문제:
  POST /chat → [30초 대기] → 응답  (타임아웃 위험, 스트리밍 불가)

현재 비동기 방식:
  POST /chat → { jobId: '...' }     (즉시 응답)
  SSE 연결 → 토큰 하나씩 실시간 수신  (스트리밍 가능)
```

## D. Hot Observable vs Cold Observable

RxJS에서 Subject는 **Hot Observable**이다.

```
Cold Observable: 구독할 때마다 처음부터 실행 (HTTP 요청, 타이머 등)
Hot Observable:  이미 실행 중인 스트림을 공유 (Subject, 이벤트 등)
```

`Subject`에 구독 전 발행된 값은 받지 못한다. 이 프로젝트에서 SSE 연결 전에 FastAPI 워커가 응답을 Publish하면 **해당 메시지는 유실**된다. init 이벤트와 heartbeat으로 "연결됨"을 클라이언트에게 알리고, 그 이후 POST로 메시지를 보내도록 유도하는 이유가 여기 있다.

## E. Redis Pub/Sub에서 Subscriber가 별도 커넥션이어야 하는 이유

```typescript
this.redisSubscriber = redisPublisher.duplicate();
```

Redis 공식 문서: "Once the client enters the subscribed state it is not supposed to issue any other commands, except for additional SUBSCRIBE, PSUBSCRIBE, UNSUBSCRIBE, PUNSUBSCRIBE, PING, RESET and QUIT commands."

구독 모드에 진입한 커넥션은 **일반 Redis 명령(GET, SET, RPUSH 등)을 실행할 수 없다**. `duplicate()`로 분리하지 않으면 Pub/Sub과 일반 명령을 같은 커넥션에서 쓰다가 에러가 발생한다.

## F. 프롬프트 인젝션과 sanitize의 한계

```typescript
cleanContext = sanitize(dto.context, { allowedTags: [], ... });
```

`sanitize-html`은 **HTML 기반 XSS를 방어**한다. 하지만 LLM에 대한 **프롬프트 인젝션**(예: "이전 지시를 무시하고...")은 HTML이 아닌 자연어 공격이므로 sanitize로는 막을 수 없다. 프롬프트 인젝션 방어는 시스템 프롬프트 설계 레벨에서 다뤄야 하는 별도 영역이다.

---

# 핵심 요약 카드

> [!abstract] Chat 도메인 핵심 구조
> - **SSE** : 서버 → 클라이언트 단방향 실시간 스트리밍
> - **Subject** : Redis 메시지를 SSE 스트림으로 라우팅하는 브리지
> - **Redis Pub/Sub** : NestJS ↔ FastAPI 워커 간 실시간 메시지 전달
> - **두 단계 분리** : POST(메시지 전송) + SSE(응답 수신) 비동기 구조

> [!abstract] 핵심 보안 설계
> - `hasActiveStream` 확인 → SSE 없이 POST만 보내는 시도 차단
> - `sanitize-html` → page_context의 HTML 태그 제거
> - `@ValidateIf` → 모드에 따른 조건부 필드 필수화
> - `CHAT_MAX_CONNECTIONS` → 서버 연결 수 상한 제어

> [!question] 설명할 수 있어야 하는 것
> 1. WebSocket 대신 SSE를 선택한 이유
> 2. Redis Subscriber가 Publisher와 **반드시** 별도 커넥션이어야 하는 이유
> 3. `Subject`와 `BehaviorSubject`의 차이와 이 프로젝트에서 Subject를 선택한 이유
> 4. `merge(initEvent, heartbeat, messageStream)`에서 initEvent가 완료돼도 전체 스트림이 유지되는 이유
> 5. `X-Accel-Buffering: no`가 없으면 어떤 문제가 발생하는가
> 6. `pipeline()`이 트랜잭션(MULTI/EXEC)과 다른 점
