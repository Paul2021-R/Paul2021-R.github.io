---
layout: post 
title: Protostar review note - 03 - FastAPI DBs
subtitle: Protostar 구성 요소들에 대한 복습 + 심도 있는 확장을 정리한다 
categories: 문제해결
tags: Backend 개발 Protostar Project Review FastAPI
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

## core/minio_client.py

이 모듈은 MinIO 오브젝트 스토리지와의 연결을 관리하고 파일을 다운로드하는 래퍼(Wrapper) 클래스를 정의하고 있다.

### 1. 코드 분석 및 개념

* `__init__`: 설정값(endpoint, access_key 등)을 가져와 동기식 `Minio` 클라이언트 객체를 초기화한다.
* `check_connection`: 서버 시작 시 버킷이 존재하는지 확인하여 연결 상태를 로깅한다. 동기 함수인 `bucket_exists`를 `asyncio.to_thread`로 감싸서 실행한다.
* `get_file_content`: 지정된 버킷에서 객체를 읽어 바이트 배열로 반환한다. 이 역시 I/O 블로킹을 막기 위해 `asyncio.to_thread`를 사용하여 별도의 스레드에서 `get_object`와 `read()`를 수행한다.
* **개념 (비동기 오프로딩):** 파이썬의 `asyncio` 환경에서 동기 라이브러리(MinIO SDK)가 메인 이벤트 루프를 블로킹하는 것을 방지하기 위해 `asyncio.to_thread`를 사용한다. 이는 무거운 I/O 작업을 백그라운드 스레드 풀로 넘겨 비동기적으로 결과를 기다리는 기법이다.

### 2. 대체 가능한 라이브러리 및 메서드

동기식 `minio` 라이브러리를 스레드로 래핑하는 대신, 처음부터 비동기를 지원하는 **`aioboto3`** 라이브러리를 사용할 수 있다. AWS S3 호환 스토리지를 비동기로 다루는 표준적인 방법이다.

### 3. 트레이드오프 (Trade-off)

* **현재 방식 (`minio` + `asyncio.to_thread`):** 공식 MinIO 라이브러리를 사용하므로 API 문서 참고와 구현이 매우 직관적이고 쉽다. 하지만 요청이 많아질 경우 스레드 컨텍스트 스위칭 오버헤드가 발생하며, 진정한 의미의 Non-blocking I/O 성능을 100% 발휘하지 못한다.
	* Why: 
		* 공식 MinIO 라이브러리를 사용한 이유가 여기에 있다. 기본적으로 원본 데이터는 최초 다운로드 받는 정도이며, 모든 비즈니스 로직은 NestJS 가 이를 대응함. 
		* 결과적으로 이후엔 RAG 기반으로 변환한 데이터를 pgVector 기반으로 대응하므로, 현재의 방식으로 하더라도 스레드 컨텍스트 스위칭 오버헤드가 발생하더라도 큰 문제가 없음.
* **대체 방식 (`aioboto3`):** 완전한 비동기 I/O를 지원하므로 대규모 동시성 처리에 매우 효율적이다. 하지만 Boto3 기반이므로 MinIO에 특화된 기능 접근이 까다로울 수 있고, 러닝 커브가 존재한다. 따라서 구체적으로 더 다양한 작업들이 이어진다면 해당 기능을 활용해야 하며 특히 S3 등을 쓴다면 더욱 그러하다.

### 4. 구조적 취약점 및 개선 방향

* **취약점:** `get_file_content` 내에서 `response.read()`를 호출하여 파일 전체를 한 번에 메모리에 올린다. 대용량 파일을 요청할 경우 서버 I/O 병목 및 메모리 고갈(OOM, Out Of Memory)이 발생할 위험이 크다.
	* 현 상황에서 사용하는 파일 자료가 md 텍스트 파일로 제한되어 있기 때문에 넘어갔음.
* **개선 방향:** 대용량 파일 처리, 파일 종류에 따라 OOM 방지를 위해 전체 데이터를 메모리에 올리지 않고 **청크(Chunk) 단위의 스트리밍 반환 구조**로 개선해야 한다. (자세한 내용 요청 시 응답 가능)

---

## core/database.py

PostgreSQL 데이터베이스와의 비동기 연결 및 ORM 세션을 설정하는 모듈이다.

### 1. 코드 분석

* `engine` 및 `AsyncSessionLocal`: 비동기 처리용 `create_async_engine`을 활용하여 커넥션 풀(pool_size=10, max_overflow=20)을 구성하고 세션 팩토리를 만든다.
* `init_db()`: 애플리케이션 시작 시 호출되어 모델을 임포트하고, `create_all`을 통해 데이블을 강제 생성한다. 에러 발생 시 `sys.exit(1)`로 서버를 종료한다.
* `get_db()`: FastAPI의 의존성 주입(Dependency Injection)에 사용될 제너레이터(Generator)로, 세션을 열고 안전하게 닫거나 롤백하는 라이프사이클을 관리한다.

### 2. 대체 가능한 라이브러리 및 메서드

현재 **`SQLAlchemy`** ORM을 사용 중인데, 대체제로 **`Prisma Client Python`** 또는 ORM을 배제한 순수 비동기 드라이버인 **`asyncpg`**를 직접 사용할 수 있다.

### 3. 트레이드오프 (Trade-off)

* **SQLAlchemy ORM:** 매우 강력하고 파이썬 생태계의 표준 격이라 호환성이 좋으나, 매핑 오버헤드로 인해 순수 드라이버보다 속도가 다소 느리다. DB의 중요성, 트랜잭션 퍼포먼스의 우선도가 떨어지는 일반적인 서비스의 경우 사용이 편리함.
* **asyncpg:** 파이썬 DB 드라이버 중 압도적으로 빠르지만, 모든 쿼리를 날(Raw) SQL 스트링으로 관리해야 하므로 생산성과 유지보수성이 급격히 떨어진다. DB가 특성적으로 매우 중요한 서비스라면 이렇게 가고 Raw SQL 을 이용하는게 좋을 수 있다. 

### 4. 구조적 취약점 및 개선 방향

* **취약점:** `init_db`에서 `Base.metadata.create_all`을 사용하고 있으며 연결 실패 시 `sys.exit(1)`로 서버를 다운시킨다. 프로덕션 환경에서는 테이블 변경 이력 관리가 안 되며, 일시적인 네트워크 장애에도 컨테이너가 죽어버리는 결함이 발생할 수 있다. 
* **개선 방향:** 
	* 프로덕션 스키마 관리를 위해 `create_all` 대신 **Alembic 마이그레이션 툴**을 도입하는게 유효할 수 있다. 
	* `init_db`에 데이터베이스 연결 **재시도(Backoff Retry) 로직**을 추가해야 한다. 

---

## core/redis.py

인메모리 데이터 저장소인 Redis와의 비동기 연결 풀을 구성하고 클라이언트 객체를 제공하는 모듈이다.

### 1. 코드 분석 및 개념

* `pool`: `redis.ConnectionPool.from_url`을 사용해 최대 1000개의 연결을 유지할 수 있는 비동기 커넥션 풀을 생성한다.
* `get_redis_client()`: 생성된 풀을 기반으로 `Redis` 인스턴스를 반환한다.
* `init_test_redis()`: 서버 시작 단계에서 `ping()`을 날려 상태를 체크하고, 실패하면 자원 해제 후 `sys.exit(1)`로 프로세스를 종료한다.
* **개념 (In-memory DB):** 모든 데이터를 디스크가 아닌 메모리에 저장하여 압도적인 읽기/쓰기 속도를 자랑한다. 세션 관리, 캐싱, 큐(Queue) 등 일시적이고 빠른 접근이 필요한 데이터 처리에 주로 쓰인다.

### 2. 대체 가능한 라이브러리 및 메서드

현재 사용 중인 `redis.asyncio`는 과거 `aioredis`가 병합된 공식 표준 라이브러리이므로 파이썬 생태계에서는 가장 최적의 선택이다. 저장소 수준에서 대체를 고려한다면 **`Memcached`**를 사용할 수 있지만, Redis 의 본래의 제공 기능을 위하여 최대한 공식 표준 라이브러리를 사용했다. 

### 3. 트레이드오프 (Trade-off)

* **Redis:** 문자열, 리스트, 해시, 셋 등 다양한 자료구조를 지원하고 디스크 영속성(Persistence)을 부분 지원하나, 구조가 복잡해지면 메모리 파편화나 관리 비용이 증가한다.
* **Memcached:** 단순한 키-값(Key-Value) 캐싱에는 오버헤드가 적어 아주 미세하게 더 빠르고 메모리 관리가 단순하지만, 다양한 자료구조를 활용할 수 없고 시스템 재시작 시 데이터가 100% 날아간다.

### 4. 구조적 취약점 및 개선 방향

* **취약점:** `database.py`와 마찬가지로 `init_test_redis`에서 연결 예외 발생 시 `sys.exit(1)`로 강제 종료를 발생시킨다. Redis는 주로 캐싱 용도이므로 서버 전체가 죽어야 할 만큼의 치명적 장애가 아닐 수 있다 (Graceful degradation 부재).
* **개선 방향:** Redis 연결 장애 시 애플리케이션을 강제 종료하는 대신, 기능을 우회(Fallback)하거나 **지수 백오프(Exponential Backoff)를 활용한 재시도 구조**로 안정성을 높여야 한다.

앞서 작성된 `## core/redis.py` 문서의 후속 내용으로, 프로젝트 전체 아키텍처 관점에서 Redis가 어떻게 활용되고 있는지 분석한 5번 항목을 추가해 드립니다.

### 5. Protostar 프로젝트 전체에서의 Redis 활용 부분 정리

현재 프로젝트의 `core/redis.py`에서 생성된 비동기 Redis 클라이언트는 FastAPI 애플리케이션 전반에서 다음과 같은 핵심적인 역할을 수행한다.

* **백그라운드 비동기 작업 큐 (Task Queue 및 Message Broker):** FastAPI 웹 서버는 클라이언트의 요청에 대해 최대한 빠르게 응답해야 하므로, 실행 시간이 오래 걸리는 무거운 I/O 작업(예: LLM 기반의 AI 요약, RAG 문서 벡터화 연산 등)을 메인 이벤트 루프에서 직접 처리해서는 안 된다. 메인 API 서버(생산자)는 클라이언트 요청을 받으면 **Redis 큐에 작업 명세(Task)를 밀어 넣고(Push) 즉시 응답을 반환(Fire and Forget)**한다. 이후 `worker_knowledge.py`, `worker_summary.py` 등의 독립된 백그라운드 워커(소비자)들이 Redis에서 작업을 꺼내어(Pop) 비동기적으로 안전하게 처리하는 **메시지 브로커(Message Broker)** 역할을 수행한다.
* **분산 컴포넌트 간의 상태 공유 (State Management):** API 서버(FastAPI)와 여러 워커 프로세스(AI/요약/지식 처리 등)가 서로 독립적인 컨테이너로 분리되어 동작하는 분산 환경에서, 각 작업의 진행 상태(예: 대기 중, 처리 중, 완료, 실패)나 임시 결과물 데이터를 실시간으로 빠르고 안전하게 주고받기 위한 **중앙 인메모리 상태 저장소**로 기능한다. 데이터베이스(PostgreSQL)에 매번 접근하는 것에 비해 압도적으로 빠른 속도를 보장한다.
* **데이터 캐싱 (Caching) 및 부하 분산:** AI 모델이 생성한 요약 결과나 동일한 문서에 대한 반복적인 질의응답 처리 결과를 메모리에 일시적으로 저장(TTL 설정)해 두는 캐싱 용도로도 활용된다. 이를 통해 불필요한 연산과 데이터베이스 I/O를 줄여 전반적인 응답 속도를 극대화하고, 트래픽이 몰리는 상황(Spike)에서 시스템 후단 시스템의 부하를 효과적으로 경감시킨다.

---

## asyncio 및 코루틴(Coroutine) 추가 정리

### 1. 비동기 논블로킹과 코루틴의 개념

비동기 프로그래밍을 명확히 이해하기 위해서는 패러다임과 이를 구현하는 도구를 구분해야 한다.

* **비동기 논블로킹 (Async Non-blocking):** I/O 작업(네트워크 요청, 파일 읽기 등) 시 결과를 마냥 기다리지 않고(Non-blocking), 제어권을 넘겨 다른 작업을 수행하다가 완료되면 다시 돌아와 처리하는(Async) **프로그래밍 패러다임**이다.
* **코루틴 (Coroutine):** 파이썬에서 비동기 논블로킹 패러다임을 실제로 구현하기 위해 사용하는 **특수한 함수 구조(도구)** 이다. 일반 함수(Subroutine)와 달리 실행 도중 일시 정지(Pause/Yield)하고, 나중에 멈춘 지점부터 다시 재개(Resume)할 수 있는 특징을 가진다.

### 2. 코루틴 객체와 `await`의 동작 원리

`async def`로 정의된 함수를 호출하거나 비동기 래퍼 함수를 실행하면 즉시 작업이 실행되지 않는다.

* **코루틴 객체 반환:** 함수 호출 시 실제 결과값이 아닌, "나중에 실행될 작업 명세서(대기표)" 역할을 하는 **코루틴(Coroutine) 객체**가 반환된다.
* **`await` 키워드:** 코루틴 객체 앞에 `await`를 붙여야만 이벤트 루프에 의해 실제 작업이 스케줄링 및 실행되며, 작업이 완료된 후 최종 결과값을 반환받을 수 있다.

### 3. `asyncio.to_thread`를 활용한 동기 I/O 오프로딩

FastAPI와 같은 비동기 프레임워크 환경에서 외부 라이브러리(예: MinIO SDK)의 동기식 블로킹 함수를 그대로 호출하면 메인 이벤트 루프가 멈추는 병목 현상이 발생함. 이를 해결하기 위해 `asyncio.to_thread`를 사용한다.

* **역할:** 무거운 동기 함수 호출을 백그라운드 스레드 풀(Thread Pool)로 넘겨서 실행하고, 메인 스레드는 블로킹 없이 다른 코루틴을 처리할 수 있게 한다.
* **반환 타입의 변화:**
1. `asyncio.to_thread(...)` 호출 직후: `<class 'coroutine'>` 타입을 반환한다.
2. `await asyncio.to_thread(...)` 실행 완료 후: 원본 동기 함수가 뱉어내는 **본래의 데이터 타입**(예: `bool`, `bytes`)을 그대로 반환한다.

### 4. IDE 타입 추론 한계 극복 (Type Annotation)

외부 라이브러리(Boto3, MinIO 등)의 동기 함수를 `asyncio.to_thread`로 감쌀 때, 원본 라이브러리에 최신 파이썬 타입 힌트가 누락되어 있다면 IDE(VS Code 등)는 최종 반환 타입을 `unknown`이나 `Any`로 인식하여 자동완성을 지원하지 못한다.

* **해결 방안:** 개발자가 직접 반환 타입을 명시(Type Annotation)하여 가독성과 유지보수성을 높여야 한다.

```python
# 명시적 타입 힌팅 적용 예시
found: bool = await asyncio.to_thread(self.client.bucket_exists, self.bucket_name)
content: bytes = await asyncio.to_thread(response.read)
```

### 5. NestJS (Node.js)와 Python `asyncio`의 비동기 동작 방식 차이

비동기 함수를 다룰 때 파이썬과 Node.js(NestJS) 생태계는 근본적인 동작 방식에 큰 차이가 있다. 가장 핵심적인 차이는 비동기 함수를 호출했을 때 반환되는 객체의 실행 상태(Hot vs Cold)이다.

* **NestJS (Node.js) 방식: "Hot Promise" 🔥**
	* **동작 원리:** Node.js 환경에서는 비동기 함수(`async function`)를 호출하는 그 즉시 내부 로직이 동기적으로 실행되기 시작한다 (함수 내부에서 첫 번째 `await`를 만날 때까지).
	* **특징:** 반환되는 `Promise` 객체는 이미 실행 중인(Hot) 상태이다. 따라서 `await` 키워드를 생략하고 함수를 호출만 해두어도(던져 놓기만 해도), 이벤트 루프가 이를 이미 인지하고 백그라운드에서 남은 작업을 알아서 처리한다.

* **Python (`asyncio`) 방식: "Cold Coroutine" ❄️**
	* **동작 원리:** 파이썬에서는 비동기 함수(`async def`)를 호출하면, 실제 코드는 단 1%도 실행되지 않고 오직 "나중에 이 작업을 실행하겠다"는 작업 명세서인 **코루틴(Coroutine) 객체**만 반환한다.
	* **특징:** 반환된 코루틴은 아직 전혀 실행되지 않은(Cold) 상태이다. 파이썬의 이벤트 루프는 개발자가 명시적으로 큐에 등록해주기 전까지 이 코루틴 객체를 쳐다보지도 않는다.
	* **주의점:** `await` 없이 비동기 함수만 호출하고 방치하면 작업 자체가 아예 실행되지 않으며, 파이썬은 프로그램 종료 시 `RuntimeWarning: coroutine was never awaited`라는 경고 에러를 발생시킨다.

* **핵심 요약 (Fire and Forget 패턴의 구현):**
	* NestJS에서는 단순히 비동기 함수를 `await` 없이 호출하는 것만으로 백그라운드 실행(Fire and Forget)이 성립된다.
	* 하지만 파이썬에서 결과를 기다리지 않고 백그라운드에서 알아서 실행되게 하려면, 함수를 덩그러니 던져놓는 것이 아니라 반드시 **`asyncio.create_task(my_async_function())`**를 사용하여 이벤트 루프의 스케줄러에 명시적으로 밀어 넣어주어야 한다.

## SQLAlchemy 라이브러리의 개념 및 주요 특징

본 문서는 파이썬 생태계에서 가장 널리 사용되는 데이터베이스 툴킷이자 ORM(Object-Relational Mapping) 라이브러리인 **SQLAlchemy**의 핵심 개념과 특징을 정리한 것이다. Protostar 프로젝트의 데이터베이스 연동(`core/database.py`)에도 핵심적으로 사용되었다.

### 1. SQLAlchemy란?

SQLAlchemy는 파이썬 프로그램과 관계형 데이터베이스(RDBMS) 간의 소통을 돕는 강력한 SQL 툴킷이자 ORM 라이브러리이다. 

### 2. 핵심 개념

* **ORM (Object-Relational Mapping):** 데이터베이스의 '테이블'을 파이썬의 '클래스(Class)'로, 테이블의 '로우(Row/Record)'를 파이썬의 '인스턴스(Instance)'로 매핑하는 기술이다. 이를 통해 데이터베이스를 철저히 객체 지향적인 관점에서 다룰 수 있음. 편리함. 
* **Engine (엔진):** SQLAlchemy 애플리케이션의 심장부로, 데이터베이스와의 통신을 담당하는 기본 인터페이스. 내부적으로 커넥션 풀(Connection Pool)과 Dialect(데이터베이스 방언 해석기)를 관리하여, DB 연결을 효율적으로 재사용하고 각기 다른 DB(PostgreSQL, MySQL 등)의 문법 차이를 추상화한다.
* **Session (세션):** ORM 객체들의 '작업 공간(Workspace)'이다. 데이터베이스 트랜잭션(Transaction)을 캡슐화하며, 세션 내에서 변경된 객체 상태를 추적하다가 `commit()`이 호출될 때 비로소 실제 DB에 반영(Flush)한다.
* **Declarative Base:** 클래스 정의와 동시에 테이블 메타데이터를 생성해 주는 기본 클래스이다. 클래스 변수로 컬럼의 타입과 제약조건을 정의하면, SQLAlchemy가 이를 데이터베이스 스키마로 변환한다.

### 3. 주요 특징 및 장단점 (Trade-off)

**장점:**
* **데이터베이스 독립성 (DB Agnostic):** 엔진의 URL만 변경하면 코드 수정 없이 PostgreSQL, MySQL, SQLite 등 다른 데이터베이스로 쉽게 마이그레이션이 가능하다.
* **보안 (SQL Injection 방지):** 내부적으로 쿼리를 파라미터화하여 실행하므로 SQL 인젝션 공격으로부터 매우 안전하다.
* **비동기(Asyncio) 지원:** `sqlalchemy.ext.asyncio` 모듈을 통해 파이썬의 비동기 I/O 패러다임을 완벽히 지원한다. FastAPI와 같은 비동기 웹 프레임워크와 결합 시 훌륭한 시너지를 낸다.

**단점 (트레이드오프):**
* **학습 곡선(Learning Curve):** 기능이 방대하고 구조가 복잡하여(Core와 ORM 계층의 분리 등) 초기 진입 장벽이 다소 높은 편이다.
* **성능 오버헤드:** 파이썬 객체를 SQL로 번역하고, 결과를 다시 객체로 변환하는 매핑 과정이 존재하므로 순수 SQL 드라이버(예: `asyncpg`)나 가벼운 쿼리 빌더를 사용할 때보다 미세하게 속도가 느리고 메모리 사용량이 많다.



