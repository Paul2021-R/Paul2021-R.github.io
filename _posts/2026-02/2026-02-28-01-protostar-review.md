---
layout: post 
title: Protostar review note - 13 - NestJS Common Services
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


# Protostar Review - 13 - NestJS Common Services

> [!info] 분석 대상 파일
> - `src/common/objectStorage/objectStorage.service.ts`
> - `src/common/objectStorage/objectStorage.module.ts`
> - `src/common/queue/queue.service.ts`
> - `src/common/monitoring/ai-status-monitoring.service.ts`
> - `src/common/monitoring/system-monitoring.service.ts`
> - `src/common/monitoring/monitoring.module.ts`
> - `src/common/constants.ts`

---

## 1. 주요 개념

### 1-1. 전역 상수 모듈 패턴 (constants.ts)

```typescript
export const CHAT_MAX_CONNECTIONS = 600;
export const SSE_HEARTBEAT_INTERVAL = 30000;  // 30s
export const SSE_RETRY_SECONDS = 10;
export const CONCURRENCY = 3;
export const MAX_PENDING = 10;
export const PERSONAL_MAX_UPLOADS = 10;
```

서비스 전반에 걸쳐 사용되는 매직 넘버를 단일 파일에 중앙화한다. 변경 시 한 곳만 수정하면 된다.

- `CHAT_MAX_CONNECTIONS = 600`: SSE 동시 연결 최대값 (Nginx 등 상위 계층에서도 동일하게 설정되어야 의미가 있다)
- `CONCURRENCY = 3`: QueueService의 동시 처리 작업 수
- `MAX_PENDING = 10`: QueueService의 대기 큐 크기

### 1-2. MinIO ↔ S3 호환성 (ObjectStorageService)

MinIO는 AWS S3 API와 호환된다. 따라서 AWS SDK v3 (`@aws-sdk/client-s3`)를 그대로 사용할 수 있다.

핵심 설정:
- `forcePathStyle: true` — MinIO는 Virtual-hosted style(`bucket.endpoint`)이 아닌 Path style(`endpoint/bucket`)을 사용하므로 필수
- `endpoint: MINIO_ENDPOINT` — AWS 기본 엔드포인트 대신 MinIO 서버 URL 지정
- `region: MINIO_REGION` — MinIO는 region 의미가 없지만 SDK 필수값이므로 임의 설정

### 1-3. QueueService - 인메모리 동시성 제어

Node.js는 싱글 스레드이지만 비동기 I/O로 인해 동시성이 발생한다. CPU-bound 작업 또는 외부 리소스 보호를 위해 동시 실행 수를 제한하는 큐가 필요하다.

```
activeCount ≤ CONCURRENCY(3): 즉시 실행
activeCount > CONCURRENCY(3), pendingQueue.length < MAX_PENDING(10): 대기 큐 추가
pendingQueue.length ≥ MAX_PENDING(10): 즉시 거부 (ServiceUnavailableException)
```

`isBusy()` 메서드는 `KnowledgeUploadBusyCheckInterceptor`에서 사전 차단 용도로 사용된다.

### 1-4. 이중 모니터링 구조 (MonitoringModule)

| 서비스 | 감시 대상 | 주기 | 저장소 |
|---|---|---|---|
| `AiStatusMonitoringService` | FastAPI AI Worker 헬스 | @Cron 1초 | Redis ZSet |
| `SystemMonitoringService` | Node.js 프로세스 메모리 | setInterval 5초 | Logger(Winston) |

두 서비스가 하나의 `MonitoringModule`로 묶여 있으며, `AiCircuitGuard`도 함께 exports되어 다른 모듈에서 임포트하면 자동으로 사용 가능하다.

### 1-5. ObjectStorageService 라이프사이클

`OnModuleInit` / `OnModuleDestroy`를 구현하여 애플리케이션 시작 시 연결을 검증하고 종료 시 리소스를 해제한다.

```
onModuleInit():
  HeadBucketCommand → 버킷 존재 확인
    ├─ 성공: "✅ Connected & Bucket Found"
    ├─ 404 NotFound: createBucket() → 버킷 자동 생성
    └─ 기타 에러: throw → 앱 부트스트랩 실패 (의도적)

onModuleDestroy():
  s3Client.destroy() → SDK 내부 연결 풀 해제
```

---

## 2. 핵심 로직 흐름

### 2-1. ObjectStorageService 파일 업로드/삭제

```typescript
// 업로드
async uploadFile(buffer, fileName, mimeType, specificBucketName?)
  → PutObjectCommand({ Bucket, Key: fileName, Body: buffer, ContentType, ACL: 'public-read' })
  → return fileName  // storageKey 반환

// 삭제
async deleteFile(fileName, specificBucketName?)
  → DeleteObjectCommand({ Bucket, Key: fileName })
```

`specificBucketName`이 제공되면 기본 버킷 대신 해당 버킷을 사용한다. `null`도 허용하는 `null coalescing` 패턴을 사용한다.

### 2-2. QueueService 흐름

```
enqueue(task: () => Promise<T>): Promise<T>
  ├─ activeCount < CONCURRENCY → execute(task) 즉시 실행
  └─ pendingQueue.length < MAX_PENDING → Promise를 대기열에 추가
       └─ 실행 중인 작업 완료 시 → next() 호출로 다음 작업 실행
  └─ 대기열 포화 → ServiceUnavailableException 즉시 throw

execute(task):
  activeCount++
  try { return await task() }
  finally { activeCount--; next() }  // 항상 다음 작업 실행 시도

isBusy(): pendingQueue.length >= MAX_PENDING
```

### 2-3. AiStatusMonitoringService 흐름

```
@Cron('* * * * * *')  // 1초마다
checkAiWorkerStatus():
  → redis.zremrangebyscore('ai:worker:heartbeat', 0, now-10000)  // 10초 지난 heartbeat 제거
  → redis.zcard('ai:worker:heartbeat')  // 현재 살아있는 워커 수
  → count > 0 → isAvailable = true
  → count === 0 → isAvailable = false

isAvailable(): boolean  // AiCircuitGuard에서 호출
```

FastAPI 워커는 주기적으로 `zadd ai:worker:heartbeat SCORE(timestamp) MEMBER(workerId)`를 호출한다. 10초 이상 heartbeat이 없으면 오프라인으로 판단한다.

### 2-4. SystemMonitoringService 흐름

```
onModuleInit():
  process.env.NODE_ENV === 'production' 이면만 시작
    → setInterval(logSystemMetrics, 5000)

logSystemMetrics():
  → process.memoryUsage()
  → logger.log({ type, rss, heapTotal, heapUsed, external, arrayBuffers, timestamp })
```

Winston logger가 구조화된 JSON 로그를 출력하며, 외부 로그 수집기(Loki, Elasticsearch 등)에서 메트릭 기반 알림 설정에 활용된다.

---

## 3. 구조적 취약점 / 개선 방향

### 3-1. ObjectStorageService - ACL 'public-read' 하드코딩

```typescript
// ❌ 현재: 모든 파일이 공개 접근 가능
ACL: 'public-read'

// ✅ 개선안: Pre-signed URL 패턴
const url = await getSignedUrl(s3Client, new GetObjectCommand({ Bucket, Key }), { expiresIn: 3600 });
```

현재 MinIO에 업로드된 지식 문서가 public-read이므로 URL을 알면 누구나 접근 가능하다. 민감한 문서의 경우 private ACL + Pre-signed URL이 적합하다.

### 3-2. QueueService - 수평 확장 불가

인메모리 큐이므로 **단일 인스턴스에서만 동작**한다. NestJS 인스턴스가 2개 이상 실행되면:
- 각 인스턴스가 독립적인 큐를 갖게 됨
- 전체 동시 처리 수가 인스턴스 수 × CONCURRENCY로 늘어남
- FastAPI AI Worker 부하 계산이 복잡해짐

```
✅ 개선안: BullMQ (Redis 기반 분산 큐)
- 여러 인스턴스가 하나의 Redis 큐를 공유
- Worker 수, 동시성, 재시도 모두 중앙 관리 가능
```

### 3-3. SystemMonitoringService - setInterval vs @Cron

현재 `setInterval`을 사용하지만 NestJS에서는 `@Cron`이 더 적합하다.

| 항목 | setInterval (현재) | @Cron |
|---|---|---|
| NestJS 라이프사이클 통합 | 수동 clearInterval 필요 | 자동 정리 |
| 테스트 용이성 | 낮음 | 높음 (TestingModule에서 제어) |
| 동적 비활성화 | 어려움 | SchedulerRegistry로 가능 |
| 코드 일관성 | 낮음 (AiStatus는 @Cron) | 높음 |

### 3-4. CHAT_MAX_CONNECTIONS 미사용

`constants.ts`에 `CHAT_MAX_CONNECTIONS = 600`이 정의되어 있지만, 현재 코드에서 실제로 이 값을 검사하는 로직이 없다. Nginx의 upstream 설정이나 SSE 연결 수 제한과 연계되어야 의미가 있다.

---

## 4. 핵심 메서드 및 라이브러리 함수

### ObjectStorageService (AWS SDK v3)

| 커맨드 | 역할 |
|---|---|
| `HeadBucketCommand` | 버킷 존재 여부만 확인 (내용 조회 없이 메타데이터만) |
| `CreateBucketCommand` | 새 버킷 생성 |
| `PutObjectCommand` | 파일 업로드 (Body: Buffer) |
| `DeleteObjectCommand` | 파일 삭제 |
| `s3Client.send(command)` | 커맨드 실행 (Command Pattern) |
| `s3Client.destroy()` | 내부 HTTP 연결 풀 종료 |

### process.memoryUsage() 반환값

```typescript
{
  rss: number,        // Resident Set Size - OS가 프로세스에 할당한 총 메모리
  heapTotal: number,  // V8 힙 총 할당량
  heapUsed: number,   // V8 힙 실제 사용량
  external: number,   // V8 외부 C++ 객체 메모리 (Buffer 등)
  arrayBuffers: number // ArrayBuffer/SharedArrayBuffer 메모리
}
```

`heapUsed / heapTotal`로 힙 사용률을 계산하며, `rss`가 지속적으로 증가하면 메모리 누수를 의심한다.

### MonitoringModule 구조

```typescript
@Module({
  imports: [
    ScheduleModule.forRoot(),  // @Cron 사용을 위한 스케줄러 초기화
    RedisModule,               // AiStatusMonitoringService가 Redis 사용
  ],
  providers: [AiStatusMonitoringService, SystemMonitoringService, AiCircuitGuard],
  exports:   [AiStatusMonitoringService, SystemMonitoringService, AiCircuitGuard],
})
```

`AiCircuitGuard`를 providers와 exports 양쪽에 등록함으로써, MonitoringModule을 import하는 모듈에서 별도 선언 없이 DI 가능하다.

---

## 5. 대체 가능한 라이브러리 및 트레이드오프

### 5-1. MinIO SDK vs AWS SDK v3

| 항목 | AWS SDK v3 (현재) | MinIO JS SDK |
|---|---|---|
| S3 호환성 | 완전 호환 | MinIO 특화 기능 제공 |
| AWS 전환 용이성 | ✅ 설정만 변경 | ❌ SDK 교체 필요 |
| presigned URL | GetSignedUrl 사용 | presignedGetObject |
| 번들 크기 | 트리셰이킹 지원 | 상대적으로 무거움 |
| **결론** | 이식성 우선 시 권장 | MinIO 전용 기능 필요 시 |

AWS SDK v3는 AWS → MinIO 또는 MinIO → S3 전환 시 endpoint 설정만 바꾸면 된다는 장점이 크다.

### 5-2. 메모리 모니터링: Winston 로그 vs prom-client

| 항목 | Winston 로그 (현재) | prom-client |
|---|---|---|
| Prometheus 연동 | 별도 파싱 필요 | 직접 /metrics 노출 |
| Grafana 연동 | Loki → 쿼리 복잡 | Prometheus → 직접 연동 |
| 구현 복잡도 | 낮음 | 중간 |
| 실시간 알림 | 로그 기반 지연 | AlertManager 즉시 |
| **결론** | 단순 로깅에 적합 | 프로덕션 모니터링에 권장 |

### 5-3. 인메모리 QueueService vs BullMQ

| 항목 | QueueService (현재) | BullMQ |
|---|---|---|
| 수평 확장 | 불가 | Redis 기반 공유 큐 |
| 재시도 | 없음 | 내장 (backoff) |
| 모니터링 UI | 없음 | Bull Board |
| 영속성 | 없음 (재시작 시 유실) | Redis에 영속 |
| 구현 복잡도 | 낮음 | 중간 |

---

## 6. 개발자로서 알아야 할 영역

### 6-1. S3 호환 스토리지 개념

AWS S3의 핵심 개념:

```
Bucket: 최상위 컨테이너 (폴더와 유사)
Object Key: 버킷 내 고유 식별자 (경로 포함: "knowledge/userId/uuid-filename.md")
ACL: 접근 제어 (private, public-read, public-read-write)
Pre-signed URL: 임시 서명된 접근 URL (만료 시간 설정 가능)
```

`forcePathStyle`은 MinIO, LocalStack 등 자체 호스팅 S3 호환 서비스에 반드시 필요하다.

### 6-2. Node.js 단일 스레드와 동시성

```
Node.js Event Loop
  ├─ 단일 스레드: JS 코드 실행 (CPU-bound 작업 블로킹)
  └─ libuv thread pool: I/O, DNS, 암호화 등 비동기 처리

동시성이 발생하는 상황:
  - await 키워드 사용 시 이벤트 루프가 다음 콜백 처리
  - 여러 async 함수가 await 없이 실행되면 동시 진행
```

QueueService는 이 동시성으로 인해 외부 API(AI Worker, MinIO) 호출이 동시에 여러 개 진행될 수 있는 상황을 제어한다.

### 6-3. @Global() 모듈 패턴

```typescript
@Global()
@Module({
  providers: [ObjectStorageService],
  exports: [ObjectStorageService],
})
export class ObjectStorageModule {}
```

`@Global()` 모듈은 `AppModule`에서 한 번만 등록하면, 다른 모든 모듈에서 imports 없이 DI 가능하다.

```
AppModule
  └─ imports: [ObjectStorageModule]  ← 한 번만 등록

KnowledgeModule
  └─ providers: [KnowledgeService]

KnowledgeService
  └─ constructor(private readonly objectStorage: ObjectStorageService)  ← imports 없어도 주입됨
```

과용하면 결합도가 높아지므로, 진정으로 전역적인 유틸리티(DB, Cache, Storage 등)에만 적용한다.

### 6-4. NestJS 라이프사이클 훅 활용

| 훅 | 타이밍 | 용도 |
|---|---|---|
| `OnModuleInit` | 모듈 초기화 완료 후 | DB 연결, 버킷 확인, 초기 데이터 로드 |
| `OnModuleDestroy` | 앱 종료 신호 수신 시 | 커넥션 해제, 인터벌 정리, 플러시 |
| `OnApplicationShutdown` | SIGTERM 등 수신 시 | 진행 중인 작업 완료 대기 |

Graceful Shutdown을 위해 `app.enableShutdownHooks()`를 main.ts에 추가하면 `OnModuleDestroy`가 종료 신호에 반응한다.

---

## 핵심 요약 카드

> [!summary] Common Services 3줄 요약
> 1. **ObjectStorageService**: AWS SDK v3로 MinIO를 S3 호환 방식으로 연결, onModuleInit에서 버킷 자동 생성
> 2. **QueueService**: 인메모리 동시성 큐(CONCURRENCY=3, MAX_PENDING=10), 단일 인스턴스 한정
> 3. **MonitoringModule**: AI Worker 헬스(Redis ZSet @Cron 1s) + Node.js 메모리(setInterval 5s) 이중 감시

> [!tip] MinIO-S3 호환의 핵심 설정
> ```typescript
> new S3Client({
>   endpoint: 'http://minio:9000',  // MinIO 서버 URL
>   forcePathStyle: true,           // ← 이게 없으면 연결 실패
>   region: 'us-east-1',           // 임의값이지만 SDK 필수
> })
> ```

> [!warning] QueueService 수평 확장 불가
> `activeCount`와 `pendingQueue`는 인메모리 변수다.
> 인스턴스가 2개 실행되면 각자 독립적인 큐를 가지며, 전체 동시 처리 수가 2배로 늘어난다.
> 분산 환경에서는 **BullMQ + Redis** 로 대체해야 한다.

> [!example] process.memoryUsage() 핵심 지표
> - `heapUsed / heapTotal` → 힙 사용률 (70% 이상이면 경고)
> - `rss` 지속 증가 → 메모리 누수 의심
> - `external` 증가 → Buffer/Stream 누수 의심

> [!abstract] @Global() 사용 기준
> DB, Cache, Storage처럼 앱 전반에서 쓰이는 인프라 레이어에만 적용.
> 도메인 서비스에 @Global() 남용 시 모듈 의존성 그래프가 불명확해진다.
