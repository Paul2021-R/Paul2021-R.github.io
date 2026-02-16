---
layout: post 
title: Protostar review note - 04 - AI
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

## core/ai.py
이 파일은 OpenAI 호환 API(OpenRouter)를 사용하여 AI 비서(Protostar)의 응답을 생성하고, RAG(Retrieval-Augmented Generation) 구성을 위한 파일 청킹(Chunking) 및 프롬프트 구성을 담당하는 핵심 모듈이다.

### 1. 주요 개념

* **RAG (Retrieval-Augmented Generation)**: 언어 모델(LLM)이 답변을 생성하기 전에, 외부의 신뢰할 수 있는 데이터베이스(이력서, 블로그 글 등)에서 관련 문서를 검색하여 컨텍스트로 제공하는 기술이다. 이를 통해 할루시네이션(환각)을 줄이고 최신/개인화된 정보를 바탕으로 답변할 수 있다.
* **Chunking (청킹)**: 긴 문서를 LLM의 컨텍스트 윈도우(Context Window)에 맞게, 그리고 검색 효율성을 높이기 위해 의미 있는 작은 조각으로 나누는 과정이다.
* **Streaming (스트리밍)**: 전체 답변이 생성될 때까지 기다리지 않고, 토큰 단위로 생성되는 즉시 클라이언트에게 전송하여 체감 대기 시간을 줄이는 기술이다.

### 2. 핵심 로직 흐름

* **문서 적재 및 청킹 (`load_and_chunk_files`)**: 
	1. 로컬 디렉토리의 Markdown(`.md`) 파일들을 읽어 들인다.
	2. 빈 줄(`\n\n`)을 기준으로 분리한다.
	3. 문단 단위의 청크(Chunk)로 나눈다. 
	4. 길이가 너무 짧은 문자열은 버리고, 파일명과 문단 번호를 메타데이터처럼 문자열에 포함시켜 리스트에 저장한다.
* **응답 스트리밍 생성 (`generate_response_stream`)**: 
	1. 외부(Worker)에서 전달받은 RAG 검색 결과(`context`)와 대화 이력(`history`), 사용자 질문(`prompt`)을 조립한다.
	2. LLM에 전달할 메시지 배열을 구성한다. 시스템 프롬프트에는 페르소나 및 엄격한 규칙(한국어 사용, 3문단 이내 등)이 정의된다. 
	3. 생성된 응답은 `async for` 문을 통해 토큰(Token)이 생성될 때마다 비동기 제너레이터(`yield`)로 즉시 반환한다.
* **응답 요약 (`generate_summary`)**: 
	1. 대화를 저장한다.
	2. 별도의 작업으로 Redis 를 통해 다시 '수주'를 맡긴다.
	3. 수주를 받으면 새로운 Worker 가 해당 수주를 챙겨서, DB 상의 대화 원문을 읽는다. 
	4. 다음 컨텍스트 활용을 위해, 생성된 긴 응답 텍스트를 다시 LLM에 통과시켜 3문장 이내의 간결한 한 문단으로 요약을 요청한다. 
	5. 저장한다. 
	6. (이후) 동일 세션에서의 대화 시 이 내용이DB 상에 발견되면, 요약본과 함께 전달된다. (요약 없을 시 원본 대화 그대로 들어감)

### 3. 대체 가능한 라이브러리 및 메서드 (트레이드오프)

* **텍스트 청킹(Text Chunking) 로직**
	* **현재 방식**: `content.split("\n\n")`을 사용하여 빈 줄(문단) 기준으로 문자열을 단순 분리한다.
	* **대체 라이브러리**: `LangChain`의 `RecursiveCharacterTextSplitter` 또는 `LlamaIndex`의 문장 분리 도구.
	* **트레이드오프**: 현재의 단순 분리 방식은 외부 의존성이 없고 실행 속도가 매우 빠르다는 장점(Lightweight)이 있다. 단락 내의 길이가 너무 길어질 경우 LLM의 토큰 제한을 초과할 수 있고, 문맥이 끊기는 가장자리 데이터의 손실이 발생할 수 있다. 반면 LangChain 등을 사용하면 오버랩(Overlap) 기능을 통해 문맥 단절을 방지하고 정확한 토큰 수 기반으로 분리할 수 있지만, 라이브러리 의존성이 추가되고 메모리 및 연산 오버헤드가 증가한다.

### 4. 구조적 취약점 및 개선 방향

* **취약점**: 전반적으로 파일 및 토큰의 섬세한 관리적 차원에서의 한계가 존재한다. 
	1. 파일 로딩 시 `read()`로 전체 텍스트를 메모리에 한 번에 올리고 단순 문자열로 자르기 때문에, 파일 크기가 커지거나 구조가 복잡해지면 OOM(Out of Memory) 위험이 있다. 
	2. LLM으로 전달되는 토큰 한도에 대한 예외 처리가 부재하다.
* **개선 방향**: 텍스트 분할 시 토큰 카운터 기반의 청크 분할 기법(예: Tiktoken 결합)을 도입하고 Chunk 간 Overlap을 두어 문맥 손실을 방지해야 한다. 

### 5. 핵심 메서드 및 라이브러리 함수

* **`AsyncOpenAI` (openai 라이브러리)**: 비동기(Asynchronous) 환경에서 OpenAI API(또는 호환되는 OpenRouter API)와 통신하기 위한 클라이언트 객체이다. FastAPI와 같은 비동기 프레임워크에서 I/O 블로킹 없이 LLM 요청을 처리하기 위해 필수적이다.
	* 현재 사용 중인 OpenRouter 에서는 API 호환이 되서 SDK 를 OpenAI 를 사용하였다. 하지만 OpenRouter 에서 현재 OpenRouter SDK Beta가 나온 상태이고 이거에 대응할 필요가 있다.
* **`client.chat.completions.create(..., stream=True)`**: LLM의 응답을 한 번에 기다리지 않고, 텍스트가 생성되는 즉시 스트리밍 형태로 받아오기 위한 핵심 메서드이다. 실시간 챗봇 체감 속도를 높이는 데 기여한다.
* **`textwrap.dedent` (내장 모듈)**: Python 코드 내에서 멀티라인 문자열(Multi-line string)로 시스템 프롬프트를 작성할 때, 코드 가독성을 위해 추가된 들여쓰기 공백을 텍스트에서 깔끔하게 제거해주는 함수이다. 불필요한 공백 토큰을 줄여 LLM의 인식을 돕는다.

## core/worker.py

이 파일은 Redis를 백엔드로 사용하는 비동기 작업 워커(Worker) 시스템이다. 클라이언트의 채팅 요청을 큐에서 꺼내어 처리하고, RAG 문서를 검색하여 AI 모듈에 전달한 뒤, 생성된 응답 조각을 Redis Pub/Sub을 통해 다시 전송하는 역할을 수행한다. 기본적으로 AI 를 기반으로 하는 모든 작업은 해당의 로직을 따라 진행된다. 

### 1. 주요 개념

* **Message Queue (메시지 큐)**: 요청을 즉시 처리하지 않고 큐(`chat:job:queue`)에 담아두었다가, 워커가 자신의 처리 능력(Capacity)에 맞게 순차적으로 꺼내어 처리하는 비동기 처리 패턴을 취하여, 요청하는 대상(Nestjs)과 처리자(FastAPI)를 구분하여 시스템 안정성을 향상 시키고, 수평적 스케일 아웃 호환성을 유지시킨다.
* **Pub/Sub (발행/구독 모델)**: 워커가 AI 모델로부터 스트리밍으로 전달받은 토큰(조각)을 특정 채널(`chat:stream:{uuid}-{session_id}`)에 발행(Publish)하면, 이를 구독(Subscribe)하고 있는 웹서버(NestJS 등)가 클라이언트에게 즉시 전달하는 실시간 메시징 패턴이다.
* **Semaphore (세마포어)**: `asyncio.Semaphore(MAX_CONCURRENT_JOBS)`를 활용하여 동시에 처리할 수 있는 최대 코루틴(작업)의 수를 제한하는 동시성 제어 기법이다. 이를 통해 시스템의 과도한 작업이 올라감으로써 생길 문제들을 제어한다.

### 2. 핵심 로직 흐름

* **작업 리스닝 루프 (`run_worker`)**: 
	1. 무한 루프(`while True`)를 돌며 Redis의 특정 큐(`chat:job:queue`)에서 대기 중인 작업을 감시한다.
	2. 세마포어(Semaphore)를 획득하여 동시 처리량을 조절한다.
	3. 큐에 작업이 들어오면 백그라운드 태스크로 분리하여 실행을 요청한다.
* **단일 작업 처리 (`process_chat_job`)**: 
	1. JSON 형태의 작업 데이터를 파싱한 후
	2. `general` 모드일 경우 RAG 문서 검색을 수행하여 컨텍스트를 구성한다. (그렇지 않은 경우는 블로그의 글을 요약하는 등의 특수 목적이므로, 이에 따른 로직에 들어간다.)
	3. DB에 사용자 질문을 기록하고 과거 대화 이력을 조회한다. 
		- 별도의 워커가 대화를 요약해서 저장해둔다. 요약한 내용이 있을 시 이를 가져가고, 요약이 없다면 원본 대화 내용 일부를 전달한다.
	4. `generate_response_stream`을 호출한다.
* **실시간 스트리밍 및 후처리**: 
	1. AI가 생성한 응답 조각(Token)을 하나씩 받을 때마다, 즉시 Redis의 Pub/Sub 채널(`chat:stream:{uuid}-{sessionId}`)로 발행(`publish`)하여 클라이언트(NestJS 등)로 데이터를 전송한다. 
	2. 완료 시 `done` 신호를 전송하고, 최종 조립된 전체 텍스트를 DB에 저장한 후 요약 작업을 위한 큐로 메시지 ID를 밀어 넣는다(`rpush`). (새롭게 만든 답변에 대한 요약)


### 3. 대체 가능한 라이브러리 및 메서드 (트레이드오프)

* **작업 큐 및 워커 루프**
	* **현재 방식**: Redis의 `brpop` 명령어를 무한 루프(`while True`)로 직접 폴링(Polling)하며 `asyncio.create_task`로 작업을 실행한다.
	* **대체 라이브러리**: `Celery`, `ARQ` (Asyncio Redis Queue), `RQ` 등 전문 Task Queue 프레임워크.
	* **트레이드오프**: 현재의 커스텀 루프 방식은 설정이 직관적이고 코드가 가벼워 추가적인 데몬이나 프레임워크 학습이 필요 없다는 장점이 있다. 그러나, 워커 프로세스가 갑자기 종료될 경우 현재 처리 중이던 데이터를 복구할 수 있는 기능(Message ACK)이 기본적으로 없으며, 재시도(Retry) 로직이나 스케줄링을 직접 구현해야 하는 단점이 있다. Celery나 ARQ를 사용하면 이러한 안정성(Reliability) 기능이 보장되지만, 아키텍처가 무거워지고 설정이 복잡해진다.

### 4. 구조적 취약점 및 개선 방향

* **취약점**: `brpop`으로 큐에서 데이터를 꺼낸 직후(Pop) 워커가 크래시(다운)되면, 해당 작업은 완료되지 않은 상태로 영구적으로 유실(Data Loss)되며, Redis Pub/Sub 특성상 발행 시점에 구독자가 없으면 스트리밍 데이터 역시 유실된다.
* **개선 방향**: 작업 유실 방지를 위해 단순 List 기반의 큐 대신 Redis Streams 기반의 큐 연산(XREADGROUP)을 도입하거나 비동기 큐 전문 라이브러리(ARQ 등)로 마이그레이션 해야 한다. (자세한 내용이 필요하면 요청 바람)

### 5. 핵심 메서드 및 라이브러리 함수

* **`redis_client.brpop("chat:job:queue", timeout=5)`**: 지정된 큐(List 자료구조)에 데이터가 들어올 때까지 대기(Block)하다가, 데이터가 들어오면 꺼내오는(Pop) Redis 명령어이다. CPU를 점유하는 무한 폴링(Polling) 방식보다 시스템 자원을 효율적으로 사용한다.
* **`redis_client.publish(channel, message)`**: Redis의 Pub/Sub 메커니즘을 사용하여 지정된 채널을 구독 중인 모든 클라이언트에게 비동기적으로 메시지를 전송한다. 이를 통해 스트리밍 데이터 조각을 타 서비스로 즉각 브로드캐스트할 수 있다.
* **`asyncio.Semaphore`**: 동시에 실행될 수 있는 코루틴(작업)의 최대 개수(예: `MAX_CONCURRENT_JOBS = 100`)를 제한하는 동기화 객체이다. 외부 API Rate Limit이나 DB 커넥션 풀의 한도를 초과하지 않도록 보호하는 역할을 한다.
* **`asyncio.create_task`**: 이벤트 루프에 코루틴 실행을 예약하여 블로킹 없이 백그라운드에서 비동기 작업을 병행(Concurrent) 처리하게 하는 내장 함수이다. `run_worker` 루프가 각 Job을 넘기고 즉시 다음 Job을 대기할 수 있게 만든다.
