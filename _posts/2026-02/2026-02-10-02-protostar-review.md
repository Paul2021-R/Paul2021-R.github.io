---
layout: post 
title: Protostar review note - 00 - FastAPI intro 
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

# FastAPI 개념 정리
- 현대적, 성능이 뛰어난 웹 프레임워크 서버
- RESTFul API 를 구축하는데 최적화, 3.14의 멀티코어 병렬 처리와 uv 같은 고속 툴 체인을 결합하여 백엔드 개발의 표준 방식으로 자리 잡게됨. 
## 핵시 철학 및 특징
- 고성능: 웹엔진(Starlette), 데이터 검증(Pydantic)
- 빠른 개발 속도: 파이썬의 `Type Hints`를 활용해 코딩 시간을 획기적으로 줄임.
- 자동 문서화: 별도 작업 없이 Swagger UI 와 ReDoc을 통해 대화형 API 문서를 생성함. 
- 데이터 검증 및 직렬화: JSON 데이터를 파이썬 객체로 자동 변환, 타입에러를 통한 안정성 확보

## 기술 근간 
|**구성 요소**|**역할**|
|---|---|
|**Starlette**|가볍고 빠른 ASGI 프레임워크로, 라우팅, 웹소켓, 미들웨어 등 핵심 웹 기능을 담당합니다.|
|**Pydantic**|파이썬 타입 힌트를 기반으로 데이터 검증(Validation)과 설정 관리(Serialization)를 수행합니다.|
|**Uvicorn / uv**|비동기 서버(ASGI)로, FastAPI 애플리케이션을 실행하는 엔진 역할을 합니다.|
- ASGI(Asynchronous Server Gateway Interface): Python 비동기 웹 표준. WSGI(Sync)와 달리 async/await 지원으로 고성능 웹앱 가능
	- 라우팅 / 미들웨어 / 요청, 응답 처리 / 라이프 사이클 관리 역할을 함
- pydantic: 타입힌트를 기반 검증, 파싱 라이브러리 
	- python dataclass 확장, Json -> python 객체 자동 변환 + 검증 역할 
	- FastAPI 연계될 때는 
		- Path/Query/Form 모델: 함수 인자로 사용, 자동 파싱 / 검증 
		- Response 모델: 출력 스키마를 정의 하며 자동 생성해줌
		- Validator / Field 커스텀: 각종 데코레이터, Field 로 입력을 수신해줌. 

## 주요 개념 및 동작 로직
1. 비동기 처리(Async / Await)
2. 의존성 주입: 함수를 할당해두고 Annotated와 Depends 를 활용해, 이를 추적해서 사용하도록 함으로써 코드 재사용성을 극대화함. 
3. 타입 힌트 기반 검증
4. 애플리케이션 구조: 2026년 현재 도메인 주도 설계 적용, 비즈니스 로직의 서비스 레이어와 Router 레이어(HTTP 통신 수신)을 분리하는 방식이 권장 됨. 

## 프레임 워크 

|**구분**|**Django**|**Flask**|**FastAPI**|
|:---:|:---|:---|:---|
|**성격**|Batteries-included (모든 기능 포함)|Micro-framework (최소 기능)|Modern API-first (현대적 API 특화)|
|**성능**|상대적으로 무거움|보통 (동기 위주)|**매우 빠름 (비동기)**|
|**주요 용도**|대규모 웹 서비스, 관리자 페이지|소규모 프로토타입|**마이크로서비스, AI 모델 서빙**|
|**데이터 검증**|Forms / Serializers 사용|수동 설정 필요|**자동 (Pydantic)**|

----
# 의존성 주입 세부적으로 알아보기 

### 함수 의존성 예시 코드 

```python
  from typing import Annotated
  from fastapi import Depends, FastAPI

  app = FastAPI()

  # 1. 의존성(Dependable) 함수 정의
  # 공통적으로 사용할 로직을 일반 함수(또는 async 함수)로 만듭니다.
  async def common_parameters(q: str | None = None, skip: int = 0, limit: int = 100):
      return {"q": q, "skip": skip, "limit": limit}

  # 2. 경로 함수(Path Operation)에 주입
  # Annotated를 사용하여 반환 타입(dict)과 의존성 선언(Depends)을 결합합니다.
  @app.get("/items/")
  async def read_items(commons: Annotated[dict, Depends(common_parameters)]):
      return {"message": "Items list", "params": commons}

  @app.get("/users/")
  async def read_users(commons: Annotated[dict, Depends(common_parameters)]):
      return {"message": "Users list", "params": commons}
```

### 리소스 관리를 위한 의존성 예시 코드 

```python 
  from typing import Annotated
  from fastapi import Depends, FastAPI

  app = FastAPI()

  # 데이터베이스 세션을 시뮬레이션하는 의존성
  async def get_db_session():
      db = "Database Connection Created"
      try:
          print("연결 생성")
          yield db  # 엔드포인트 함수에 db 객체 전달
      finally:
          # 엔드포인트 작업이 끝나면(성공/실패 상관없이) 실행됩니다.
          print("연결 종료 및 정리 로직 실행")

  @app.get("/db-task")
  async def perform_db_task(db: Annotated[str, Depends(get_db_session)]):
      return {"status": "success", "data": db}
```

### 결론 
- FastAPI 의 의존성 부여는, NestJS나 Spring 에서 지향하듯 시스템에서 의존성을 관리해주는 형태는 아니다. 
- 오히려 특정 함수가 있고, 찾아서 쓰라는 식의 Raw 한 접근에 가깝다. 
- **Request Lifecycle**: 기본적으로 FastAPI는 **하나의 HTTP 요청** 안에서 같은 의존성이 여러 번 호출되면, 함수를 매번 실행하지 않고 **처음 계산된 결과를 캐싱**해서 돌려준다.(캐싱이 내장)
	- **재사용성**: 예를 들어 `get_current_user`라는 의존성을 여러 함수가 참조해도, 실제 유저를 DB에서 찾는 로직은 한 요청당 딱 한 번만 실행된다.

---

# Protostar FastAPI (AI Worker)

![Python](https://img.shields.io/badge/Python-3.13+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.122+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Job_Queue-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**Project Protostar**의 두뇌 역할을 담당하는 AI Worker 서비스다. 
비동기 작업 큐(Redis Queue)를 기반으로 고성능 AI 추론, RAG(Retrieval-Augmented Generation) 파이프라인, 그리고 데이터 요약 작업을 병렬로 처리하도록 구조화 되어있다. 

## 🏗 시스템 아키텍처 (System Architecture)

본 프로젝트는 서비스의 안정성과 확장성을 위해 **멀티 워커(Multi-Worker) 구조**를 채택하고 있다.

![](/assets/images/posts/2026-02/017.png)

### 🛠 핵심 구성 요소 (Core Components)

1.  **채팅 워커 (Chat Worker)**: 
    - `chat:job:queue`를 구독(Consume)하여 실시간 대화를 처리한다.
    - RAG를 통한 지식 검색 및 스트리밍 응답(Streaming Response)을 지원한다.
    - 해당 워커를 통해 사용자의 질문에 대한 답변을 생성하고, 이를 사용자에게 스트리밍으로 전달한다.
2.  **지식 워커 (Knowledge Worker)**: 
    - `ai:job:queue`를 구독하여 문서 벡터화 작업을 수행한다.
    - MinIO에서 파일을 가져와 텍스트 추출 -> 청킹(Chunking) -> 임베딩 -> DB 저장을 담당한다.
    - 해당 워커를 통해 문서의 내용을 벡터화하여 저장하고, 이를 통해 RAG를 구현한다.
3.  **요약 워커 (Summary Worker)**: 
    - `chat:summary:queue`를 구독하여 대화 내용을 배경에서 요약한다.
    - 다음 대화 시 컨텍스트(Context)를 효율적으로 관리할 수 있도록 돕는다.
    - 해당 워커를 통해 세션 당 기억력을 확보하고, 장기기 기억 시의 토큰 소비량을 약 73% 까지 압축하는 결과를 만들었다.

---

## 📂 프로젝트 구조 (Project Structure)

```text
  app/
  ├── core/               # 핵심 비즈니스 로직
  │   ├── ai.py           # LLM 인터페이스 및 스트리밍 처리
  │   ├── worker.py       # 메인 채팅 워커 (Chat Worker)
  │   ├── worker_knowledge.py # RAG 전처리 워커 (Knowledge Worker)
  │   ├── worker_summary.py   # 대화 요약 워커 (Summary Worker)
  │   ├── rag_service.py  # 벡터 검색 및 RAG 로직
  │   ├── minio_client.py # MinIO 연동 클라이언트
  │   └── database.py     # SQLAlchemy & DB 설정
  ├── prompts/            # 시스템 프롬프트 관리
  ├── main.py             # FastAPI 진입점 및 인스턴스 관리
  └── pyproject.toml      # 의존성 및 패키지 관리 (uv)
```
