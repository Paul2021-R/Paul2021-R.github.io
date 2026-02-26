---
layout: post 
title: Protostar review note - 12 - NestJS Knowledge Domain
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

# Protostar Review - 12 - NestJS Knowledge Domain

> [!info] 분석 대상 파일
> - `src/features/knowledge/knowledge.controller.ts`
> - `src/features/knowledge/knowledge.service.ts`
> - `src/features/knowledge/ai-task.service.ts`
> - `src/features/knowledge/dto/rag-webhook.dto.ts`
> - `src/features/knowledge/dto/update-knowledge.ts`
> - `src/features/knowledge/knowledge.module.ts`

---

## 1. 주요 개념

### 1-1. Knowledge Document 라이프사이클

Knowledge Domain은 사용자가 업로드한 마크다운 문서를 AI가 처리하여 RAG(Retrieval-Augmented Generation)에 활용하는 전체 흐름을 담당한다.

```
[사용자 업로드]
      │
      ▼
 KnowledgeDoc 생성 (status: UPLOADED)
      │
      ▼
 AiTaskService @Cron (EVERY_MINUTE)
      │  → DB에서 UPLOADED 문서 조회 (take: 10)
      │  → Redis List에 job 발행 (rpush ai:job:queue)
      │  → DB status → PROCESSING
      ▼
 FastAPI AI Worker
      │  → 벡터화 처리
      │  → Webhook 콜백 (POST /knowledge/webhook)
      ▼
 RagWebhookDto 수신
      │  → status: COMPLETED / FAILED
      │  → resultMeta: chunkCount, embeddingModel, vectorStoreKey
      ▼
 KnowledgeDoc status 업데이트
```

### 1-2. 파일 중복 방지 - SHA-256 해시

동일한 파일의 중복 업로드를 방지하기 위해 **파일 버퍼의 SHA-256 해시**를 DB에 저장한다.

```typescript
const hash = createHash('sha256').update(file.buffer).digest('hex');
// DB에서 동일 hash 존재 여부 확인 → 중복이면 ConflictException
```

- 파일명이 달라도 내용이 같으면 중복으로 간주
- 사용자별로 scoped (userId + hash 조합으로 검사)

### 1-3. 업로드 제한 - PERSONAL_MAX_UPLOADS

`constants.ts`에 정의된 `PERSONAL_MAX_UPLOADS = 10`을 통해 사용자당 최대 문서 수를 제한한다.

```typescript
const count = await this.prisma.knowledgeDoc.count({ where: { userId } });
if (count >= PERSONAL_MAX_UPLOADS) throw new ForbiddenException(...)
```

### 1-4. Webhook 패턴 - 비동기 처리 결과 수신

AI Worker(FastAPI)가 벡터화를 완료하면 NestJS의 Webhook 엔드포인트를 호출한다.

- 인증: 요청 헤더의 `x-webhook-secret`과 환경변수 `WEBHOOK_SECRET` 비교
- `@IsEnum(['COMPLETED', 'FAILED'])` — Prisma `DocStatus` 타입에서 두 값만 허용
- 중첩 객체 검증: `@ValidateNested()` + `@Type(() => RagResultMeataDto)`

### 1-5. MulterModule 파일 제한

`KnowledgeModule`에서 `MulterModule.registerAsync`로 파일 업로드 규칙을 정의한다.

- 파일 크기 제한: **50MB**
- 파일 형식 제한: `.md` (마크다운) 파일만 허용
- `fileFilter` 콜백: 허용되지 않는 파일은 `callback(new Error(...), false)` 반환

### 1-6. replaceFile - 버전 관리

기존 파일 교체 시 단순 덮어쓰기가 아니라 **version 필드를 increment** 한다.

```typescript
await this.prisma.knowledgeDoc.update({
  data: {
    storageKey: newStorageKey,
    hash: newHash,
    status: 'UPLOADED',
    version: { increment: 1 },
  }
})
```

MinIO의 기존 오브젝트를 삭제하고 새 파일을 업로드한다.

---

## 2. 핵심 로직 흐름

### 2-1. 단일 파일 업로드 (POST /knowledge/upload)

```
Request (multipart/form-data: file)
  → @UseInterceptors(FileInterceptor('file'))
  → @UseInterceptors(KnowledgeUploadBusyCheckInterceptor)  ← 큐 포화 차단
  → Controller: uploadKnowledge(user, file, dto)
  → KnowledgeService.uploadKnowledge(userId, file)
      ├─ PERSONAL_MAX_UPLOADS 체크
      ├─ SHA-256 해시 생성
      ├─ 중복 해시 검사 → ConflictException
      ├─ storageKey = `knowledge/${userId}/${uuid}-${originalname}`
      ├─ ObjectStorageService.uploadFile(buffer, storageKey, mimetype)
      └─ prisma.knowledgeDoc.create({ status: UPLOADED, hash, storageKey })
```

### 2-2. 복수 파일 업로드 (POST /knowledge/uploads)

```
Request (multipart/form-data: files[])
  → @UseInterceptors(FilesInterceptor('files', 10))  ← 최대 10개
  → KnowledgeService.uploadKnowledges(userId, files[])
      └─ Promise.allSettled(files.map(f => uploadKnowledge(userId, f)))
         → 일부 실패해도 나머지 처리 계속
```

`Promise.allSettled` 사용으로 부분 성공/실패 처리 가능.

### 2-3. AiTaskService 크론 작업

```
@Cron(CronExpression.EVERY_MINUTE)
dispatchAiJobs()
  → prisma.knowledgeDoc.findMany({ where: { status: 'UPLOADED' }, take: 10 })
  → for each doc:
      ├─ redis.rpush('ai:job:queue', JSON.stringify({ docId, storageKey, userId }))
      └─ prisma.knowledgeDoc.update({ status: 'PROCESSING' })
```

> [!warning] Race Condition
> `findMany` → `rpush` → `update` 가 트랜잭션이 아니므로 다중 인스턴스 환경에서 동일 문서가 중복 발행될 수 있다. PostgreSQL의 `SELECT ... FOR UPDATE SKIP LOCKED` 또는 Redis 분산 락으로 해결 필요.

### 2-4. Webhook 수신 (POST /knowledge/webhook)

```
Request (JSON: RagWebhookDto)
  → Guard: x-webhook-secret 검증
  → ValidationPipe: RagWebhookDto 검증 (@ValidateNested로 resultMeta까지)
  → KnowledgeService.handleWebhook(dto)
      ├─ status === 'COMPLETED': update(chunkCount, embeddingModel, vectorStoreKey)
      └─ status === 'FAILED': update(errorMessage, status: FAILED)
```

---

## 3. 구조적 취약점 / 개선 방향

### 3-1. AiTaskService Race Condition (Critical)

```typescript
// ❌ 현재: findMany 후 개별 update (비원자적)
const docs = await prisma.knowledgeDoc.findMany({ where: { status: 'UPLOADED' }, take: 10 });
for (const doc of docs) {
  await redis.rpush('ai:job:queue', ...);
  await prisma.knowledgeDoc.update({ where: { id: doc.id }, data: { status: 'PROCESSING' } });
}

// ✅ 개선안 1: PostgreSQL FOR UPDATE SKIP LOCKED
const docs = await prisma.$queryRaw`
  SELECT * FROM knowledge_docs
  WHERE status = 'UPLOADED'
  LIMIT 10
  FOR UPDATE SKIP LOCKED
`;

// ✅ 개선안 2: BullMQ 사용 (Redis 기반 분산 작업 큐)
await this.queue.add('ai-task', { docId, storageKey });
```

### 3-2. PERSONAL_MAX_UPLOADS 카운트 방식

현재 `count()` 호출 후 UPLOADED/PROCESSING 상태의 문서까지 포함하여 카운트한다. FAILED 상태 문서가 슬롯을 차지하는 문제가 있다. 상태별 카운트 분리 또는 소프트 삭제 패턴 도입이 필요하다.

### 3-3. replaceFile의 MinIO 삭제 후 업로드 패턴

```
deleteFile → uploadFile (순차)
```

`deleteFile` 성공 후 `uploadFile` 실패 시 파일이 유실된다. 두 작업을 원자적으로 처리하려면 업로드 선행 후 삭제하는 방식이 더 안전하다.

### 3-4. 단일/복수 파일 엔드포인트 분리

`/upload`(단건)와 `/uploads`(다건)가 별도 엔드포인트로 분리되어 있다. RESTful 관점에서는 `/upload`로 통일하고 Content-Type 기반으로 처리하는 것이 일반적이지만, NestJS Multer 인터셉터 선택의 단순성을 위해 분리한 것으로 보인다.

---

## 4. 핵심 메서드 및 라이브러리 함수

| 메서드/데코레이터 | 위치 | 역할 |
|---|---|---|
| `@UseInterceptors(FilesInterceptor('files', 10))` | controller | multipart 복수 파일 파싱 (최대 10개) |
| `@UseInterceptors(FileInterceptor('file'))` | controller | multipart 단일 파일 파싱 |
| `createHash('sha256').update(buf).digest('hex')` | service | 파일 버퍼 SHA-256 해시 |
| `@Cron(CronExpression.EVERY_MINUTE)` | ai-task | 1분 주기 크론 실행 |
| `redis.rpush(key, value)` | ai-task | Redis List에 우측 삽입 (FIFO 큐) |
| `Promise.allSettled(promises)` | service | 부분 실패 허용 병렬 처리 |
| `@ValidateNested()` | DTO | 중첩 객체까지 class-validator 적용 |
| `@Type(() => TargetClass)` | DTO | class-transformer 형변환 (필수 짝꿍) |
| `MulterModule.registerAsync` | module | 비동기 설정 기반 Multer 구성 |

### @ValidateNested + @Type() 중첩 검증

```typescript
export class RagWebhookDto {
  @IsOptional()
  @ValidateNested()          // 중첩 객체 검증 활성화
  @Type(() => RagResultMeataDto)  // plain object → 클래스 인스턴스 변환
  resultMeta?: RagResultMeataDto;
}
```

`@ValidateNested()`만 사용하면 plain object에 적용되지 않는다. 반드시 `@Type()`으로 인스턴스 변환이 선행되어야 한다.

---

## 5. 대체 가능한 라이브러리 및 트레이드오프

### 5-1. 작업 큐: Redis raw rpush vs BullMQ

| 항목 | Redis raw rpush (현재) | BullMQ |
|---|---|---|
| 구현 복잡도 | 낮음 | 중간 |
| 재시도 | 수동 구현 필요 | 내장 (backoff 설정) |
| 우선순위 큐 | 수동 ZSet 구현 필요 | 내장 |
| 지연 작업 | 수동 | 내장 |
| 분산 환경 Race Condition | 발생 가능 | Worker 원자성 보장 |
| 모니터링 | 별도 구현 | Bull Board 등 UI 제공 |

MVP 수준에서는 raw rpush가 간단하지만, 프로덕션 확장 시 BullMQ 전환이 권장된다.

### 5-2. 분산 크론: @Cron vs 분산 락

현재 `@Cron`은 각 인스턴스마다 독립 실행된다. 수평 확장 시 중복 실행이 발생한다.

| 방법 | 설명 |
|---|---|
| Redis SETNX 락 | 크론 실행 전 Redis 락 획득, 1분 TTL |
| PostgreSQL SELECT FOR UPDATE SKIP LOCKED | DB 레벨에서 중복 방지 |
| BullMQ Scheduler | 단일 스케줄러 추상화 |
| Kafka/RabbitMQ | 메시지 브로커로 단일 컨슈머 보장 |

### 5-3. 파일 해시: SHA-256 vs 파일명 기반

| 항목 | SHA-256 해시 (현재) | 파일명 기반 |
|---|---|---|
| 중복 탐지 정확도 | 높음 (내용 기반) | 낮음 (이름 변경 시 통과) |
| 성능 | 버퍼 전체 해시 (50MB 최대) | O(1) |
| 사용 목적에 적합성 | 지식 베이스 문서 중복 방지에 적합 | 부적합 |

---

## 6. 개발자로서 알아야 할 영역

### 6-1. Multer와 NestJS 통합

NestJS는 Express의 `multer` 미들웨어를 `@nestjs/platform-express`를 통해 래핑한다.

```typescript
// 메모리 스토리지 (기본) - file.buffer 사용 가능
// 디스크 스토리지 - 대용량 처리에 적합

// 파일 접근
@UploadedFile() file: Express.Multer.File
// file.buffer, file.originalname, file.mimetype, file.size
```

`fileFilter`에서 `callback(null, false)`를 반환하면 파일이 필드에 첨부되지 않고 `undefined`가 되므로, 컨트롤러에서 file 존재 여부를 별도로 검증해야 한다.

### 6-2. Webhook 보안 패턴

내부 서비스 간 Webhook 인증 방법:

```
1. Shared Secret (현재): Header x-webhook-secret 검증
2. HMAC-SHA256: payload + secret → 서명 검증
3. mTLS: 클라이언트 인증서 검증
4. API Key + IP 화이트리스트
```

현재 방식은 단순하지만, secret이 평문으로 헤더에 전송된다. HMAC 서명 방식이 더 안전하다.

### 6-3. DB 상태 머신 패턴

```
UPLOADED → PROCESSING → COMPLETED
                      → FAILED
```

상태 전이를 명확히 정의하면:
- 잘못된 상태에서 작업 방지 가능 (`findMany({ status: 'UPLOADED' })`)
- 모니터링이 용이 (`count({ where: { status: 'FAILED' } })`)
- 재처리 로직 구현 단순화 (`update({ status: 'UPLOADED' })` 로 재큐잉)

### 6-4. class-validator 중첩 검증 필수 지식

```typescript
// ValidationPipe 설정 (main.ts)
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

// DTO에서 중첩 객체 검증 시 필수 패턴
@ValidateNested()
@Type(() => ChildDto)  // class-transformer 없으면 검증 무시됨
childObject?: ChildDto;
```

`transform: true` 설정과 `@Type()` 데코레이터가 함께 작동해야 중첩 검증이 동작한다.

---

## 핵심 요약 카드

> [!summary] Knowledge Domain 3줄 요약
> 1. **파일 업로드** → SHA-256 중복 검사 → MinIO 저장 → DB(UPLOADED) 기록
> 2. **크론 디스패치** → UPLOADED 문서 조회 → Redis Queue push → DB(PROCESSING) 갱신 (Race Condition 존재)
> 3. **Webhook 수신** → FastAPI 결과 콜백 → DB(COMPLETED/FAILED) 최종 반영

> [!danger] Race Condition 핵심 포인트
> `AiTaskService`의 `findMany → rpush → update` 패턴은 다중 인스턴스 환경에서 동일 문서가 중복 발행될 수 있다.
> 해결책: **PostgreSQL `FOR UPDATE SKIP LOCKED`** 또는 **BullMQ** 도입.

> [!tip] @ValidateNested 함정
> `@ValidateNested()`는 반드시 `@Type(() => TargetClass)`와 함께 써야 동작한다.
> `@Type()` 없이 `@ValidateNested()`만 쓰면 plain object는 클래스 인스턴스로 변환되지 않아 내부 검증이 무시된다.

> [!example] 상태 머신 이해
> `DocStatus`: `UPLOADED` → `PROCESSING` → `COMPLETED` | `FAILED`
> 실패한 문서는 `status = UPLOADED`로 재설정하면 다음 크론에서 재처리된다.
