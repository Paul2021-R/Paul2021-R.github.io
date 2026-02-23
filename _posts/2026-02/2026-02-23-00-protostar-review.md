---
layout: post 
title: Protostar review note - 09 - NestJS DB Layer (Prisma, PostgreSQL, pgvector, Redis)
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

# NestJS DB Layer 분석
## Prisma + PostgreSQL(pgvector) + Redis

> 이 파일은 데이터 저장·조회에 관여하는 모든 파일을 대상으로 한다.
>
> | 분류 | 파일 | 역할 |
> |---|---|---|
> | ORM 설정 | `prisma/schema.prisma` | 스키마 선언, 모델 정의 |
> | ORM 설정 | `prisma/migrations/` | DDL 변경 이력 |
> | ORM 서비스 | `common/prisma/prisma.module.ts` | 전역 모듈 등록 |
> | ORM 서비스 | `common/prisma/prisma.service.ts` | 커넥션 풀 + 생명주기 관리 |
> | Redis | `common/redis/redis.module.ts` | Redis 클라이언트 전역 공급 |
> | 도메인 | `features/auth/auth.service.ts` | User CRUD + 인증 |
> | 도메인 | `features/knowledge/knowledge.service.ts` | KnowledgeDoc CRUD |
> | 도메인 | `features/knowledge/ai-task.service.ts` | DB 폴링 → Redis 큐 디스패치 |
> | 응답 제어 | `features/auth/dto/user.dto.ts` | DB 모델 → 응답 DTO 변환 |

---

# 1. 주요 개념

## 데이터 저장소 구성

이 프로젝트는 두 개의 데이터 저장소를 역할에 따라 분리한다.

```
PostgreSQL (영구 저장소)
  ├── users          - 사용자 계정, 인증 정보
  ├── knowledge_docs - 업로드된 원본 문서 메타데이터
  └── vectorized_docs - 문서 청크 + 임베딩 벡터 (pgvector)

Redis (휘발성 / 중간 계층)
  ├── chat:job:queue       - 채팅 작업 큐 (List)
  ├── chat:task:{jobId}    - 작업 페이로드 (String, TTL 300s)
  ├── chat:stream:{uuid}   - SSE 채널 (Pub/Sub)
  ├── ai:job:queue         - 문서 벡터화 큐 (List)
  ├── cluster:heartbeats   - AI 워커 생존 신호 (ZSet)
  └── throttler:*          - Rate Limit 카운터
```

## Prisma ORM

- TypeScript 네이티브 ORM. `schema.prisma`에서 모델을 선언하면 자동으로 타입 안전한 클라이언트를 생성함.
- **Prisma Migrate**: 스키마 변경 → SQL 마이그레이션 파일 자동 생성 → `prisma migrate deploy`로 적용
- **Prisma Client**: 생성된 타입을 기반으로 `prisma.user.findUnique()` 같은 타입 안전 쿼리 제공

## pgvector 확장

PostgreSQL에 벡터 연산을 추가하는 확장. 별도 벡터 DB(Pinecone, Qdrant) 없이 **RDBMS 안에서 임베딩 저장·유사도 검색**이 가능하다.

```sql
CREATE EXTENSION IF NOT EXISTS "vector";
-- 1536차원 벡터 컬럼 (OpenAI text-embedding-3-small 출력 차원)
"embedding" vector(1536)
-- HNSW 인덱스: 근사 최근접 이웃(ANN) 검색
USING hnsw ("embedding" vector_cosine_ops);
```

## 스키마 모델 구조

```
User (1) ─────────────── (N) KnowledgeDoc
  │                              │
  │                              │ (1 to N, Cascade Delete)
  └── (1) ──────────── (N) VectorizedDoc
```

| 모델 | PK 타입 | 주요 특징 |
|---|---|---|
| `User` | UUID (String) | email unique, role enum(ADMIN/STARGAZER/PROTOSTAR) |
| `KnowledgeDoc` | UUID (String) | status 상태머신, contentHash(SHA-256), version 증가 |
| `VectorizedDoc` | UUID (String) | `vector(1536)` 타입, chunkIndex, tokenCount |

## Redis 모듈 (`redis.module.ts`)

```typescript
@Global()   // 전역 모듈 - 모든 모듈에서 import 없이 주입 가능
@Module({
  providers: [{
    provide: REDIS_CLIENT,       // 커스텀 토큰
    useFactory: async (config) => new Redis({
      commandTimeout: 5000,      // 크론 작업 무한 대기 방지 핵심 설정
    }),
  }],
  exports: [REDIS_CLIENT],
})
```

---

# 2. 핵심 로직 흐름

## PrismaService 생명주기

```typescript
class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // pg Pool 생성 → PrismaPg 어댑터 → PrismaClient에 주입
    const pool = new Pool({ connectionString: DATABASE_URL });
    const adapter = new PrismaPg(pool);
    super({ adapter });   // PrismaClient에 커넥션 풀 위임
  }

  async onModuleInit() {
    // 1. URL에서 비밀번호 마스킹 (로그 보안)
    // 2. $connect() → SELECT 1 (헬스체크)
    // 3. 성공/실패 로그
  }

  async onModuleDestroy() {
    await this.$disconnect();  // Prisma 연결 종료
    await this.pool.end();     // pg Pool 종료 (pool.end 누락 시 프로세스 행 발생)
  }
}
```

> [!note] 왜 `PrismaPg` 어댑터를 쓰는가?
> Prisma 기본 모드는 자체 바이너리 엔진을 사용한다. `@prisma/adapter-pg`는 이를 **Node.js pg 드라이버로 대체**한다.
> 장점: 서버리스/엣지 환경 대응, 커넥션 풀(`pg.Pool`) 직접 제어 가능.
> 이 프로젝트에서는 pgvector 연동 안정성과 커넥션 풀 직접 관리를 위해 선택.

## 문서 업로드 → 벡터화 전체 흐름

```
[Client]
  │
  ├─ POST /api/v1/upload/knowledge-docs
  │     │
  │     ├─ KnowledgeUploadBusyCheckInterceptor (큐 포화 확인)
  │     ├─ FilesInterceptor (Multer 파싱)
  │     └─ KnowledgeService.uploadFiles()
  │           ├─ 업로드 한도 확인 (prisma.knowledgeDoc.count)
  │           ├─ QueueService.add() → processSingleFileUpload()
  │           │     ├─ SHA-256 contentHash 계산
  │           │     ├─ MinIO에 파일 업로드
  │           │     └─ prisma.knowledgeDoc.create (status: UPLOADED)
  │           └─ 응답 반환
  │
[AiTaskService] @Cron (매 1분)
  │  prisma.knowledgeDoc.findMany({ status: UPLOADED, take: 10 })
  │  → redis.rpush('ai:job:queue', payload)
  │  → prisma.knowledgeDoc.update({ status: PROCESSING })
  │
[FastAPI 워커]
  │  ai:job:queue 소비 → 임베딩 생성 → VectorizedDoc INSERT
  │  → POST /api/v1/upload/knowledge-docs/webhook (완료 알림)
  │
[KnowledgeService.updateDocStatusViaWebhook()]
     prisma.knowledgeDoc.update({ status: COMPLETED, metaData: {...} })
```

## Auth 흐름에서의 DB 사용

```typescript
// signup
prisma.user.findUnique({ where: { email } })  // 중복 체크
prisma.user.create({ data: { email, password: bcrypt.hash(...), role } })

// signin
prisma.user.findUnique({ where: { email } })  // 유저 조회
bcrypt.compare(password, user.password)        // 해시 비교
jwtService.sign({ sub: user.id, email, role }) // JWT 발급
```

## DocStatus 상태머신

```
UPLOADED → PROCESSING → COMPLETED
                    └──→ FAILED
```

| 상태 | 전환 주체 | 시점 |
|---|---|---|
| `UPLOADED` | `KnowledgeService` | 파일 업로드 완료 직후 |
| `PROCESSING` | `AiTaskService` (크론) | Redis 큐에 디스패치 시 |
| `COMPLETED` | 웹훅 (`updateDocStatusViaWebhook`) | FastAPI 워커 처리 완료 |
| `FAILED` | 웹훅 (`updateDocStatusViaWebhook`) | FastAPI 워커 처리 실패 |

> [!note] 마이그레이션과 스키마의 상태 불일치
> `migration.sql`에 `DocStatus` 에 `QUEUED`가 있지만, 현재 `schema.prisma`에는 없다.
> 이후 마이그레이션에서 제거한 것으로 보이며, `AiTaskService`가 크론으로 `UPLOADED`를 직접 폴링하는 방식으로 QUEUED 상태를 대체한 설계.

## UserDto - DB 모델 → 응답 변환

```typescript
export class UserDto {
  @Expose() id: string;
  @Expose() email: string;
  @Exclude() password: string;   // 절대 외부 노출 금지
  @Expose() role: Role;

  constructor(dto: User) {
    this.password = dto.password;  // 할당은 하되, @Exclude로 직렬화 시 제거
  }
}
```

`ClassSerializerInterceptor`가 응답을 직렬화할 때 `@Exclude()` 필드를 자동으로 제거한다. `password`를 생성자에서 할당하는 이유는 TypeScript 컴파일러의 strict 체크를 통과하기 위함이며, 실제 응답에는 포함되지 않는다.

---

# 3. 구조적 취약점 / 개선 방향

## [AiTaskService] Race Condition - 직접 코드에 TODO로 명시

```typescript
/**
 * TODO: 현재 상태는 데이터의 상태에 따라 race condition 발생 여지가 있음.
 * 동시성을 고려한 설계로 개선될 필요 있음.
 */
@Cron(CronExpression.EVERY_MINUTE)
async dispatchPendingTasks() {
  const targets = await this.prisma.knowledgeDoc.findMany({
    where: { status: DocStatus.UPLOADED },  // 1. 조회
    take: 10,
  });
  // ... 처리 후
  await this.prisma.knowledgeDoc.update({
    data: { status: DocStatus.PROCESSING },  // 2. 상태 변경
  });
}
```

**문제**: `findMany` 이후 `update` 전 사이에 다른 인스턴스(수평 확장 시)가 동일 문서를 가져갈 수 있다. 결과: **같은 문서가 중복 처리**됨.

**개선 방향**:
```sql
-- PostgreSQL의 SELECT FOR UPDATE SKIP LOCKED 사용
-- Prisma에서는 $queryRaw로 직접 실행
SELECT id FROM knowledge_docs
WHERE status = 'UPLOADED'
ORDER BY created_at ASC
LIMIT 10
FOR UPDATE SKIP LOCKED;
```
또는 Redis 분산 락(Redlock 패턴)으로 크론 실행 자체를 단일화.

## [AiTaskService] UPLOADED → PROCESSING 전환 실패 처리 부재

```typescript
for (const doc of targets) {
  try {
    await redis.rpush('ai:job:queue', payload);          // Redis 성공
    await prisma.knowledgeDoc.update({ status: PROCESSING }); // DB 실패?
  } catch (error) {
    this.logger.error(...);  // 로그만 남기고 계속 진행
  }
}
```

Redis에 푸시는 됐지만 DB 상태 업데이트가 실패하면 → 다음 크론 실행 때 같은 문서가 **다시 UPLOADED로 조회되어 중복 디스패치**된다. 트랜잭션 또는 보상 로직이 필요하다.

## [KnowledgeService] 파일 삭제와 DB 삭제의 원자성 부재

```typescript
async deleteFile(user, id) {
  await this.objectStorageService.deleteFile(doc.minioKey);  // MinIO 삭제
  // ↑ 여기서 실패하면? 아래 DB 삭제가 안 됨
  await this.prisma.knowledgeDoc.delete({ where: { id } });  // DB 삭제
}
```

MinIO 삭제 성공 + DB 삭제 실패 → **MinIO에는 없는데 DB에는 있는 좀비 레코드** 발생 가능.
MinIO 삭제 실패 → `try/catch`로 무시하고 DB 삭제 진행 → **DB는 삭제됐는데 MinIO에는 파일이 남는** 고아 파일 발생.

현재 코드는 MinIO 삭제 실패를 `logger.error`로만 처리하고 DB 삭제는 계속 진행한다. 영구 저장소 기준으로 **DB가 Source of Truth**이므로 현재 방향은 맞지만, MinIO 고아 파일 정리 배치가 없다.

## [schema.prisma] HNSW 인덱스 주석 처리

```prisma
// @@index([embedding], type: Hnsw) // pgvector indexing
```

`migration.sql`에서 HNSW 인덱스를 생성했다가 두 번째 마이그레이션에서 DROP했다. 스키마에도 주석으로만 남아있다.

**영향**: HNSW 인덱스 없이 코사인 유사도 검색 시 **순차 스캔(Seq Scan)** 발생 → 벡터 수가 많아질수록 성능 저하.

**이유 추정**: HNSW 인덱스는 삽입 시 인덱스를 유지해야 하므로 쓰기 성능이 낮아진다. 데모 수준의 데이터량에서는 오버헤드가 더 클 수 있어 일시 제거한 것으로 보임. 프로덕션 데이터 증가 시 재활성화 필요.

## [KnowledgeService] 콘텐츠 중복 업로드 미검증

```typescript
async processSingleFileUpload(user, file) {
  const hash = this.calculateHash(file.buffer);  // SHA-256 계산
  // ... 해시를 DB에 저장하지만 중복 체크 쿼리가 없음
  return this.prisma.knowledgeDoc.create({ data: { contentHash: hash, ... } });
}
```

`contentHash`를 저장하지만 업로드 전 **같은 해시가 이미 있는지 확인하지 않는다**. 동일 파일을 여러 번 업로드해도 모두 저장된다.

## [웹훅] 실패 시 재시도 정책 부재 (TODO 명시)

```typescript
await this.prisma.knowledgeDoc.update({
  data: {
    status,   // TODO: 실패 시 재요청 해야 하지 않을까?
  }
});
```

`FAILED` 상태가 된 문서를 어떻게 재처리할지 정책이 없다. 수동 재업로드 외에 자동 재시도 메커니즘(Dead Letter Queue, 재처리 크론)이 없다.

---

# 4. 핵심 메서드 및 라이브러리 함수 설명

## Prisma Client 주요 메서드

| 메서드 | 설명 | 예시 |
|---|---|---|
| `findUnique` | PK 또는 unique 필드로 단건 조회. 없으면 `null` | `prisma.user.findUnique({ where: { email } })` |
| `findMany` | 조건에 맞는 다수 조회. `take`, `orderBy`, `where` 활용 | `prisma.knowledgeDoc.findMany({ take: 10, orderBy: { createdAt: 'asc' } })` |
| `create` | 레코드 생성 | `prisma.knowledgeDoc.create({ data: { ... } })` |
| `update` | 조건에 맞는 레코드 수정. `{ increment: 1 }` 원자적 증가 가능 | `prisma.knowledgeDoc.update({ where: { id }, data: { version: { increment: 1 } } })` |
| `delete` | 단건 삭제 | `prisma.knowledgeDoc.delete({ where: { id } })` |
| `count` | 조건에 맞는 수 반환 | `prisma.knowledgeDoc.count({ where: { uploaderId } })` |
| `$connect` | 명시적 DB 연결 | `await this.$connect()` |
| `$disconnect` | 명시적 DB 연결 종료 | `await this.$disconnect()` |
| `$queryRaw` | 원시 SQL 실행 | `await this.$queryRaw\`SELECT 1\`` |

## `@prisma/adapter-pg` + `pg.Pool`

```typescript
const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
super({ adapter });
```

- `pg.Pool`: Node.js PostgreSQL 드라이버의 커넥션 풀. 최대 동시 연결 수 관리.
- `PrismaPg`: Prisma가 자체 엔진 대신 `pg` 드라이버를 사용하도록 하는 어댑터.
- `onModuleDestroy`에서 **`pool.end()`를 별도로 호출**해야 한다. `$disconnect()`만으로는 `pg.Pool`이 닫히지 않아 프로세스가 정상 종료되지 않는다.

## `bcrypt`

```typescript
// 회원가입: 비밀번호 해싱
const hashedPassword = await bcrypt.hash(password, 10);  // saltRounds: 10

// 로그인: 해시 비교
await bcrypt.compare(password, user.password)  // boolean 반환
```

- `saltRounds: 10`: 해싱 비용. 2^10 = 1024번 반복. 높을수록 안전하지만 느림.
- `bcrypt.compare`는 **상수 시간 비교**를 수행해 타이밍 공격을 방지한다. 일반 `===` 비교를 쓰면 안 된다.

## `crypto.createHash('sha256')`

```typescript
private calculateHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}
```

파일 내용의 SHA-256 해시를 `contentHash`로 저장. 향후 중복 파일 감지, 무결성 검증에 활용 가능하도록 설계된 필드.

## `pgvector` 관련 SQL

```sql
-- 확장 활성화
CREATE EXTENSION IF NOT EXISTS "vector";

-- 벡터 컬럼 정의
"embedding" vector(1536)

-- HNSW 인덱스 (코사인 유사도 기준)
CREATE INDEX USING hnsw ("embedding" vector_cosine_ops);

-- 유사도 검색 (FastAPI 워커 측에서 실행)
SELECT * FROM vectorized_docs
ORDER BY embedding <=> '[0.1, 0.2, ...]'  -- cosine distance
LIMIT 5;
```

## `Unsupported("vector(1536)")` in Prisma Schema

```prisma
embedding Unsupported("vector(1536)")?
```

Prisma가 공식적으로 `vector` 타입을 지원하지 않아 `Unsupported` 타입으로 선언. 이 필드는 Prisma Client에서 직접 쓰기/읽기가 불가능하고, `$queryRaw`나 별도 클라이언트(FastAPI + psycopg2)를 통해서만 접근 가능하다.

## `version: { increment: 1 }` - 원자적 증가

```typescript
prisma.knowledgeDoc.update({
  data: {
    version: { increment: 1 },  // Prisma 원자적 연산
  }
})
```

Prisma의 원자적 연산 문법. `version = version + 1`을 SQL 레벨에서 실행하므로 **애플리케이션에서 현재 값을 읽어 +1 하는 방식보다 안전**하다 (read-modify-write race 방지).

---

# 5. 대체 가능한 라이브러리 및 트레이드오프

## ORM: Prisma vs 대안

| 라이브러리 | 장점 | 단점 |
|---|---|---|
| **Prisma** (현재) | 타입 자동 생성, 스키마 중심 개발, 마이그레이션 자동화 | 복잡한 쿼리 표현력 제한, `Unsupported` 타입 문제 |
| **TypeORM** | NestJS와 오랜 통합 역사, 데코레이터 기반 | 타입 안전성이 Prisma보다 약함, 설정 복잡 |
| **Drizzle ORM** | 최신 TS 친화적, SQL에 가까운 표현, 경량 | 상대적으로 생태계 미성숙 |
| **Knex.js** | SQL 쿼리 빌더, 유연성 최대 | 타입 추론 없음, 보일러플레이트 많음 |
| **Raw SQL (pg)** | 최대 유연성, 최고 성능 | 타입 안전성 없음, 마이그레이션 수동 관리 |

> pgvector처럼 Prisma가 공식 지원하지 않는 타입을 많이 사용한다면 **Drizzle ORM** 또는 **TypeORM + @Column({ type: 'vector' })** 커스텀이 더 자연스럽다.

## 비밀번호 해싱: bcrypt vs 대안

| 라이브러리 | 장점 | 단점 |
|---|---|---|
| **bcrypt** (현재) | 가장 검증된 방식, 광범위한 채택 | CPU 바운드, Node.js에서 비동기 처리 필요 |
| **Argon2** | OWASP 권장, 메모리 하드 함수 (GPU 공격 저항) | 상대적으로 낮은 범용 채택률 |
| **scrypt** | Node.js 내장 crypto 지원 | 설정 복잡 |
| **PBKDF2** | FIPS 인증, Node.js 내장 | bcrypt보다 GPU 공격에 취약 |

> 2024년 이후 OWASP는 **Argon2id**를 1순위로 권장한다. 신규 프로젝트라면 `argon2` 패키지 사용이 더 현대적.

## 벡터 저장소: pgvector vs 전용 벡터 DB

| 방법 | 장점 | 단점 |
|---|---|---|
| **pgvector** (현재) | 별도 인프라 없음, RDBMS와 동일 트랜잭션 | 대규모에서 전용 DB 대비 성능 제한 |
| **Pinecone** | 완전 관리형, 대규모 ANN 검색 최적화 | 비용, 외부 API 의존, 벤더 잠금 |
| **Qdrant** | 오픈소스, 고성능, 다양한 인덱스 타입 | 별도 인프라 운영 필요 |
| **Weaviate** | 멀티모달 지원, GraphQL API | 복잡한 설정 |
| **Chroma** | 로컬 개발 친화적, Python 네이티브 | 프로덕션 안정성 아직 검증 중 |

> 이 프로젝트 규모(1인 서비스, 수백~수천 개 벡터)에서는 **pgvector**가 적절한 선택. 문서 수만~수백만이 되면 Qdrant나 Pinecone 전환을 고려해야 한다.

## Redis 클라이언트: ioredis vs 대안

| 라이브러리 | 장점 | 단점 |
|---|---|---|
| **ioredis** (현재) | Sentinel/Cluster 지원, Pub/Sub, 파이프라인 | 설정이 다소 복잡 |
| **node-redis** | Node.js 공식 Redis 클라이언트, Promise 네이티브 | ioredis보다 생태계 좁음 |
| **@nestjs/bull (BullMQ)** | NestJS 전용 Redis 큐, 재시도/DLQ 내장 | 큐 기능만 사용 시 과도한 추상화 |

> 이 프로젝트는 Redis를 큐 + Pub/Sub + Rate Limit Storage + 헬스체크 모두에 사용한다. **BullMQ**를 도입하면 큐 재시도, Dead Letter Queue 등을 프레임워크 수준에서 지원받을 수 있다.

---

# 6. 개발자로서 알아야 할 영역

## A. 커넥션 풀 (Connection Pool) 이해

```typescript
const pool = new Pool({ connectionString: databaseUrl });
// 기본값: max 10개 커넥션
```

- 커넥션 풀 없이 요청마다 DB 연결을 새로 맺으면 **TCP 핸드셰이크 + DB 인증 오버헤드**가 누적됨
- 풀 크기를 너무 크게 설정하면 PostgreSQL 서버의 max_connections를 초과해 연결 거부 발생
- `onModuleDestroy`에서 **`pool.end()`까지 호출해야 프로세스가 깨끗하게 종료**된다. 누락 시 Node.js 이벤트 루프가 열린 소켓 때문에 종료되지 않는다.

## B. 마이그레이션 전략

Prisma Migrate의 워크플로:

```bash
# 개발 환경: 스키마 변경 후 마이그레이션 파일 생성
prisma migrate dev --name "add_chunk_index"

# 프로덕션 환경: 생성된 마이그레이션 적용만
prisma migrate deploy

# 현재 DB 상태 확인
prisma migrate status
```

**이 프로젝트에서 확인된 마이그레이션 이력**:
1. `20260113083301_init_schema`: 초기 스키마 + HNSW 인덱스 생성
2. `20260113083332`: HNSW 인덱스 DROP (성능/쓰기 트레이드오프 재검토)

→ 마이그레이션은 **순방향만** 지원. DROP INDEX도 새 마이그레이션 파일로 이력을 남기는 것이 Prisma의 방식.

## C. 상태머신 설계와 데이터 일관성

`DocStatus` enum은 **상태머신**이다. 상태 전환에는 아래 원칙이 필요하다:

```
1. 허용된 전환만 가능해야 한다
   COMPLETED → PROCESSING 같은 역행은 불가

2. 전환 실패 시 보상 트랜잭션이 있어야 한다
   Redis push 성공 + DB update 실패 → 중복 처리 위험

3. 터미널 상태(COMPLETED, FAILED)에서의 처리 정책
   FAILED → 재시도 정책이 있어야 한다
```

현재 코드에서 2, 3번이 TODO로 남아있다. 프로덕션 수준에서는 **Outbox 패턴** 또는 **Two-Phase Commit** 고려가 필요하다.

## D. N+1 쿼리 문제 이해

Prisma에서 쉽게 발생하는 안티패턴:

```typescript
// ❌ N+1: 문서 10개를 가져온 후 각각 uploader를 조회
const docs = await prisma.knowledgeDoc.findMany({ take: 10 });
for (const doc of docs) {
  const user = await prisma.user.findUnique({ where: { id: doc.uploaderId } });
}

// ✅ include로 한 번에 JOIN
const docs = await prisma.knowledgeDoc.findMany({
  take: 10,
  include: { uploader: true },   // LEFT JOIN users
});
```

이 프로젝트의 `findAll`, `uploadFiles` 등에서는 현재 단순 조회만 하고 있어 N+1 위험이 낮지만, 관계 데이터를 함께 조회할 경우 반드시 `include` 또는 `select`로 JOIN을 명시해야 한다.

## E. `$Global()` 모듈 설계 원칙

```typescript
@Global()  // PrismaModule, RedisModule 모두 Global 등록
@Module({ exports: [PrismaService] })
export class PrismaModule {}
```

- `@Global()`로 등록하면 다른 모듈에서 `imports: [PrismaModule]` 없이 `PrismaService`를 주입받을 수 있다.
- **남용 금지**: 모든 모듈을 Global로 만들면 의존성 그래프가 불투명해진다.
- **적절한 사용**: `PrismaService`, `RedisModule`처럼 앱 전체에서 필수로 사용하는 인프라성 모듈에만 적용.

## F. 소프트 삭제(Soft Delete) vs 하드 삭제(Hard Delete)

현재 코드는 `prisma.knowledgeDoc.delete()`로 **하드 삭제**를 한다.

```typescript
// 현재: 하드 삭제
await this.prisma.knowledgeDoc.delete({ where: { id } });
```

프로덕션에서 고려할 소프트 삭제 패턴:

```prisma
// schema.prisma에 삭제 시각 추가
model KnowledgeDoc {
  deletedAt DateTime? @map("deleted_at")
}
```

```typescript
// 소프트 삭제
await this.prisma.knowledgeDoc.update({
  where: { id },
  data: { deletedAt: new Date() },
});

// 조회 시 필터
prisma.knowledgeDoc.findMany({ where: { deletedAt: null } });
```

**VectorizedDoc**은 `onDelete: Cascade`이므로 `KnowledgeDoc` 삭제 시 자동 연쇄 삭제된다. 소프트 삭제 도입 시 벡터 데이터 정리 정책도 함께 설계해야 한다.

## G. 비밀번호 처리의 응용 레이어 통제

```typescript
// UserDto
@Exclude()
password: string;   // 응답 직렬화 시 ClassSerializerInterceptor가 제거

constructor(dto: User) {
  this.password = dto.password;  // 내부적으로는 할당 (TS strict 통과용)
}
```

DB에서 조회한 Prisma 모델(`User`)에는 `password`가 포함된다. 이를 응답에 포함시키지 않으려면:
1. `select` 쿼리에서 제외: `prisma.user.findUnique({ select: { password: false } })`
2. DTO + `@Exclude()`: 현재 방식. 쿼리는 가져오되 직렬화 시 제거.

방식 1이 DB 레벨에서 원천 차단이지만, 방식 2는 응용 레이어에서 통제하는 NestJS 표준 패턴이다.

---

# 핵심 요약 카드

> [!abstract] 데이터 저장소 역할 분리
> - **PostgreSQL**: 영구 데이터 (유저, 문서 메타데이터, 벡터)
> - **Redis**: 임시·중간 계층 (작업 큐, SSE 채널, Rate Limit 카운터, AI 생존 신호)
> - **MinIO**: 원본 파일 바이너리 (오브젝트 스토리지)

> [!abstract] 핵심 설계 패턴
> - `PrismaService` → `extends PrismaClient` + `OnModuleInit/Destroy` → 커넥션 생명주기 관리
> - `DocStatus` 상태머신 → 크론 폴링 + 웹훅 콜백으로 분산 처리 상태 동기화
> - `@Global()` 모듈 → 인프라 서비스의 전역 공급
> - `UserDto` + `@Exclude()` → 응용 레이어에서 민감 데이터 통제

> [!question] 설명할 수 있어야 하는 것
> 1. `PrismaPg` 어댑터를 쓰는 이유와 `pool.end()`를 별도 호출해야 하는 이유
> 2. `AiTaskService`에 Race Condition이 발생할 수 있는 시나리오와 해결책
> 3. HNSW 인덱스가 없을 때 벡터 검색 성능에 어떤 영향이 있는가
> 4. `bcrypt.compare`가 일반 `===` 비교보다 안전한 이유
> 5. `version: { increment: 1 }`을 read-modify-write 대신 쓰는 이유
> 6. `@Exclude()` 필드가 생성자에서 할당되지만 응답에 노출되지 않는 원리
