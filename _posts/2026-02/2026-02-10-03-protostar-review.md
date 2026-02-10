---
layout: post 
title: Protostar review note - 02 - FastAPI main.py
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

## main.py

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from core.redis import init_test_redis  
from core.database import init_db
from core.ai import generate_response_stream
# from core.ai import init_ai_context
from core.worker import run_worker
from core.worker_summary import run_summary_worker
from core.silence_health_checker import report_health_status_to_redis
from core.redis import get_redis_client
from core.minio_client import minio_client
from core.config import settings
from core.worker_knowledge import run_knowledge_worker 

import asyncio
import uuid
import logging

INSTANCE_ID = f"fastapi:{str(uuid.uuid4())[:8]}"
logger = logging.getLogger('uvicorn')
logger.setLevel(settings.LOG_LEVEL)

logger.info(f'uvicorn log level: {settings.LOG_LEVEL}')

@asynccontextmanager
async def main_lifespan(app: FastAPI): # context manager 패턴
    # 영역 1 - on module init
    # 시작 시 Redis 연결 테스트
    await init_test_redis()
    await init_db()
    
    # await init_ai_context()

    worker_task = asyncio.create_task(run_worker())
    summary_task = asyncio.create_task(run_summary_worker())
    health_task = asyncio.create_task(report_health_status_to_redis(INSTANCE_ID))
    rag_task = asyncio.create_task(run_knowledge_worker())
    await minio_client.check_connection()
    
    logger.info(f"🚀 Protostar FastAPI Instance {INSTANCE_ID} Started & Reporting Health...")
    
    yield # 기준점
    # 영역 2 - on module destroy 
    worker_task.cancel()
    summary_task.cancel()
    health_task.cancel()
    rag_task.cancel()

    # Graceful Shutdown - 종료 시 출석부에서 즉시 제거
    # 스코프 문제를 위하여 redis_client를 None으로 초기화
    redis_client = None

    try:
        redis_client = get_redis_client()
        await redis_client.zrem("cluster:heartbeats", INSTANCE_ID)
    except Exception as e: # error handling 패스 안하기
        logger.error(f"Failed to remove instance from Redis during shutdown: {e}")
    finally:
        if redis_client: # 클라이언트 존재 할 때만 닫기
            await redis_client.close()

    try:
        await worker_task
        await health_task
        await summary_task
        await rag_task
    except asyncio.CancelledError:
        pass

app = FastAPI(lifespan=main_lifespan)
```
### 개념: Lifespan State Management(생명주기 상태 관리)
- `asynccontextmanager` 데코레이터를 기반으로 `main_lifespan`을 정의하고, 이 함수를 기반으로 `yield`키워드 기준으로 전(setup), 후(teardown)를 하나의 함수에서 관리함.
- 과거 버전 FastAPI(Starlette)에서는 `on_event("startup")`, `on_event("shutdown")` 등 핸들링을 분리하였으나, 이에 대한 복잡함을 개선한 구조. 
### 작동 원리
1. 앱 시작시 `yield` 윗 부분 실행(DB 연결, 워커 생성 등) 
2. `yield` 에서 대기하며, API 요청을 처리한다. 
3. 앱 종료 시 시그널 수신이 됨과 함꼐 `yield` 하단 부분 실행(테스크 취소, 리소스 정리 등) 
할당과 해제가 한곳에서 명시적으로 관리되어서 에러 핸들링 등 전체 생명주기의 핸들링을 명확히 한다. 

### 현재 구조의 이점과 트레이드 오프
- 장점
	- 배포가 매우 쉽다(컨테이너 하나에서 알아서 비동기 처리가 이루어짐)
	- 인프라 복잡도 낮으며, 코드 구현이 직관적
- 단점
	- 리소스 경쟁: 만약 자체적인 무거운 AI 연산이 들어간다면(RAGGING, Summary 등이 로컬로 구동 시), 이 작업들이 CPU 를 점유하면서 API 응답 속도가 같이 느려질 수 있다. 
	- 안정성: 비동기 구조일 뿐이기에 워커가 에러가 나면서 프로세스가 죽으면 API 서버 역시 죽을 수 있다. 
	- 확장성: 트래픽이 늘어 API 서버로서 스케일아웃 하면, 워커도 늘어난다고 보면 됨. 
	- **그러나 결론적으로 로컬 LLM 서빙과 같은 경우가 되어 CPU 연산이 늘어나면 모를까, 현재의 아키텍처는 외부 API로 실질 역할을 하기 때문에 Risk 가 될 순 없다.**
	- 단! 주의사항은, 문서 파싱 영역으로, 자료의 제약이나 이런게 없다면 자원의 사용량이 기하적으로 늘수 있음. 따라서 이를 위해선 
		1. 파일과 파싱의 제약을 두는 것
		2. `asyncio.to_thread()` 로 감싸서 별도 스레드로 분리 하는 것이 필요시 될 수 있다.

### asyncio 주요 메서드들 
`main.py`에서 사용된 `asyncio.create_task`는 "백그라운드 실행(Fire and Forget)"을 위한 가장 기초적인 도구다.

하지만 실무(Production) 레벨의 **견고한 비동기 시스템**을 위해서는 다음 4가지 핵심 메서드를 반드시 알아야 한다. 이들은 "제어(Control)"와 "안정성(Safety)"을 담당한다.

---

#### 1. `asyncio.gather(*aws, return_exceptions=False)`

##### 1. 개념 (Concept)

* **"동시성 집합 실행 및 결과 취합"**
* 여러 개의 비동기 함수(Coroutine)를 동시에 실행시키고, **모든 결과가 다 나올 때까지 기다렸다가(Await)** 리스트 형태로 한 번에 반환한다.

##### 2. 대안 및 차이 (Alternatives)
* **vs `create_task` loop:** `create_task`를 for문으로 돌리고 나중에 `await`하는 것보다 코드가 훨씬 간결한 구조 가능.
* **vs `asyncio.TaskGroup` (Python 3.11+):** 최신 버전에서는 `TaskGroup`이 `gather`보다 권장됨. (예외 처리가 더 안전함)

##### 3. 트레이드오프 (Trade-offs)
* **장점:** 여러 API 호출(예: LLM 요청 3개 동시 발송)을 병렬로 처리하여 전체 대기 시간을 획기적으로 줄이기 가능
* **단점:** `return_exceptions=False`(기본값)일 경우, **하나만 에러가 나도 전체가 즉시 터짐.** 나머지 성공한 작업의 결과도 잃을 수 있다. 또한 효과적이게 보이지만, 너무 과하게 동시 실행하면 시스템 전체 문제 생김. 이럴 때 `Semaphore` 활용하면 효과적.

##### 4. 취약점 및 개선 (Vulnerabilities)
* **취약점:** 외부 API(OpenRouter 등) 호출 시 하나가 실패했다고 전체 프로세스가 중단되면 곤란할 수 있음.
* **개선:** `return_exceptions=True` 옵션을 켜서, 에러가 발생하더라도 성공한 결과는 건지도록 하는 방법도 가능. 

---

#### 2. `asyncio.wait_for(aw, timeout)`

##### 1. 개념 (Concept)

* **"시간 제한(Timeout) 걸기"**
* 특정 비동기 작업이 지정된 시간(`timeout` 초) 내에 끝나지 않으면 **강제로 취소(`CancelledError`)** 시키고 에러를 발생시킴. 

##### 2. 대안 및 차이 (Alternatives)
* **vs `requests`의 timeout:** 라이브러리 자체(timeout 파라미터) 기능은 동기 방식인 경우가 많으나, `wait_for`는 언어 차원에서 비동기 작업의 실행 시간을 강제로 끊어버린다.

##### 3. 트레이드오프 (Trade-offs)
* **장점:** 무한 대기(Hang) 상태를 방지하여 시스템 리소스를 보호하는 역할을 함. (예: OpenRouter 에서 답변 토큰의 전달에서 응답이 없을 때 30초 뒤에 끊어버림)
* **단점:** 타임아웃 발생 시 작업이 **즉시 취소**되므로, DB 트랜잭션 도중이라면 데이터 무결성이 깨질 수 있다.

##### 4. 취약점 및 개선 (Vulnerabilities)
* **취약점:** `main.py`의 `test-ai` 같은 엔드포인트에 타임아웃이 없으면, LLM이 멈췄을 때 클라이언트도 영원히 기다리게 될수 있다는 점을 개선해준다.
* **개선:** 외부 통신 로직에는 반드시 `wait_for`를 씌우는 것이 원칙이다.

---

#### 3. `asyncio.to_thread(func, /, *args, **kwargs)`

##### 1. 개념 (Concept)

* **"블로킹 함수 격리 실행"** 
* 동기(Sync) 방식의 무거운 함수(파일 I/O, PDF 파싱, 암호화 연산)를 **별도의 스레드**로 보내서, 메인 루프(Event Loop)가 멈추지 않게 한다.

##### 2. 대안 및 차이 (Alternatives)
* **vs `run_in_executor`:** 과거(Python 3.9 미만)에 쓰던 방식. `to_thread`가 훨씬 사용하기 쉽고 직관적(kwargs 지원 등)이므로 굳이 쓸 이유는 없다.

##### 3. 트레이드오프 (Trade-offs)
* **장점:** `async` 코드를 전면 수정하지 않고도 기존 동기 라이브러리(`pypdf`, `pandas` 등)를 비동기 환경에서 안전하게 쓸 수 있다.
* **단점:** 스레드 생성 비용(오버헤드)이 발생하므로, 너무 가벼운 작업(단순 덧셈 등)에 쓰면 오히려 느려질 수 있음. 

---

#### 4. `asyncio.shield(aw)`

##### 1. 개념 (Concept)
* **"취소 방지 방패"**
* 사용자가 API 요청을 취소하거나 브라우저를 닫아도, **"이 작업만큼은 절대 중단되지 말고 끝까지 실행하라"**고 보호하는 기능이다.

##### 2. 대안 및 차이 (Alternatives)
* **vs `BackgroundTasks` (FastAPI):** FastAPI의 `BackgroundTasks`는 응답을 보낸 *후*에 실행되지만, `shield`는 응답 *중*에 실행되면서도 취소만 막아준다.

##### 3. 트레이드오프 (Trade-offs)
* **장점:** 결제 처리, DB 저장, 로그 기록 등 **중단되면 데이터 꼬임이 발생하는 작업**에 필수로 해놓을 수 있다.
* **단점:** 남용하면 좀비 프로세스(끝나지 않는 작업)가 서버 리소스를 점유할 수 있다.

##### 4. 취약점 및 개선 (Vulnerabilities)
* **개선 포인트:** `main.py`의 `main_lifespan` 종료 시점 외에도, 중요한 DB 기록 로직은 `asyncio.shield()`로 감싸는 것을 고려해야 한다.

---

#### [요약] Protostar 프로젝트 적용 제안

| 메서드           | 적용 포인트                       | 한 줄 코드 예시                                        |
| ------------- | ---------------------------- | ------------------------------------------------ |
| **gather**    | 여러 문서를 동시에 요약할 때             | `await asyncio.gather(doc1_task, doc2_task)`     |
| **wait_for**  | LLM API 호출 시 무한 대기 방지        | `await asyncio.wait_for(llm_call(), timeout=30)` |
| **to_thread** | **PDF 파싱 등 CPU 작업 격리 (최우선)** | `await asyncio.to_thread(parse_pdf, file)`       |
| **shield**    | 핵심 데이터 DB 저장 보호              | `await asyncio.shield(save_to_db_task)`          |
