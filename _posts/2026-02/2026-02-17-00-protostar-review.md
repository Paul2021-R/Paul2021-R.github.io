---
layout: post 
title: Protostar review note - 05 FastAPI RAG
subtitle: Protostar 구성 요소들에 대한 복습 + 심도 있는 확장을 정리한다 
categories: 문제해결
tags: Backend 개발 Protostar Project Review FastAPI AI 
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

## core/rag_service.py

### 1. 주요 개념

* **RAG (Retrieval-Augmented Generation)**: 외부 지식 베이스(데이터베이스)에서 질문과 관련된 정보를 검색(Retrieval)하고, 그 정보를 대규모 언어 모델(LLM)에 전달하여 답변을 생성(Generation)하게 함으로써 모델의 내부 지식 한계를 극복하는 기법이다.
* **Vector Embedding (벡터 임베딩)**: 텍스트 데이터를 고차원의 수치 벡터로 변환하는 과정이며, 이를 통해 단어나 문장 간의 의미적 유사도를 계산할 수 있게 한다.
* **Cosine Similarity (코사인 유사도)**: 두 벡터 사이의 각도를 측정하여 유사성을 판단하는 방식이며, 본 코드에서는 `cosine_distance` 연산자를 활용해 질문과 가장 가까운 문서를 추출한다.

### 2. 핵심 로직 흐름

* **질문 벡터화**: 사용자의 쿼리를 `get_embeddings` 함수를 통해 수치 벡터로 변환하며, 실패 시 경고 로그를 남기고 빈 리스트를 반환한다.
* **유사 문서 검색**: SQLAlchemy를 사용하여 `VectorizedDoc` 테이블에서 질문 벡터와 코사인 거리가 가장 짧은 상위 `top_k`개의 데이터를 조회한다.
	* default top_k = 3: 검색 문서가 너무 과해지면 프롬프트가 길어지며, 모델 응답 속도가 느려짐. 이에 주요 정보들까지 검색을 위하여 top_k 의 값을 표준적인 사이즈로 설정함.
		* 1 ~ 2 : 응답속도 빨라지며, 비용 저렴해지나 상대적으로 복합 질문 답변 어려움 
		* 중간 값 
		* 5 ~ 10 : 폭 넓은 맥락 제공 가능, 단, 관련 없는 정보가 다소 포함되여 엉뚱한 답으로 변화될 가능성 있슴
		* 현재는 고정값으로 설정되어 구현하였으나, 필요시 다양한 방식으로 동적 혹은 상대적 정밀도로 구성 변경도 가능함. 
* **컨텍스트 구조화**: 검색된 문서 객체들에서 키워드, 요약문, 본문을 추출하여 LLM이 이해하기 쉬운 `[Document #n]` 형태의 텍스트 블록으로 포맷팅한다.

### 3. 구조적 취약점 및 개선 방향

* **취약점**: 대규모 데이터 처리 시 검색 성능 저하 우려가 있다. 현재의 DB 기반 정렬 방식은 인덱스가 적절히 구성되지 않을 경우 검색 속도가 선형적으로 느려질 수 있다. 
* **개선 방향**: 전문 벡터 데이터베이스(ChromaDB, Pinecone 등)를 도입하거나, PostgreSQL의 `pgvector`를 쓰고 있으니 HNSW 인덱스를 적용하여 검색 속도를 최적화를 도입해봐도 된다.

### 4. 핵심 메서드 및 라이브러리 함수

* **`search_similar_docs(query, top_k)`**: 입력된 문자열 질문을 벡터로 변환하고 DB에서 가장 유사한 문서를 찾는 핵심 비동기 함수이다.
* **`format_rag_context(docs)`**: 검색 결과 리스트를 LLM 프롬프트에 주입하기 적합한 단일 문자열로 변환하는 유틸리티 함수이다.
* **`VectorizedDoc.embedding.cosine_distance()`**: 데이터베이스 수준에서 벡터 간 유사도를 계산하는 SQLAlchemy 익스텐션 메서드이다.

### 5. 대체 가능한 라이브러리 및 메서드(트레이드 오프)

* **SQLAlchemy vs LangChain (VectorStore)**
* **차이**: 현재는 SQLAlchemy로 직접 쿼리를 작성하지만, LangChain은 다양한 벡터 DB를 동일한 인터페이스로 다루는 추상화 레이어를 제공한다.
* **트레이드 오프**: 직접 구현 시 의존성이 적고 최적화가 자유롭지만, 기능 확장 시(필터링, 하이브리드 검색 등) 모든 로직을 수동으로 개발해야 하는 공수가 발생한다. 보다 다양한 포멧의 다양한 벡터화된 문서들이 도입시 이에 따라서 보다 복잡하고 세밀한 접근이 필요해진다.

* **Cosine Distance vs L2 Distance (유클리드 거리)**
* **차이**: 코사인 거리는 벡터의 방향(의미)에 집중하고, L2 거리는 벡터의 절대적인 위치(크기 포함)에 집중한다.
* **트레이드 오프**: 텍스트 분석에서는 문장 길이에 덜 민감한 코사인 유사도가 일반적으로 유리하지만, 특정 임베딩 모델에 따라 L2 거리가 더 높은 정확도를 보이기도 한다.

* **pgvector vs Specialized Vector DB (Milvus, Qdrant)**
* **차이**: pgvector는 기존 RDBMS 내부에서 관리하지만, 전용 DB는 벡터 연산에 최적화된 엔진을 별도로 가진다.
* **트레이드 오프**: pgvector는 관리가 편하고 데이터 정관계를 유지하기 좋으나, 초고대규모 데이터셋에서는 전용 DB의 인덱싱 성능과 분산 처리 능력이 앞선다. 결과적으로 고가용성 서버를 위한 별도 데이터DB의 구축은 AI 서비스 트래픽을 위해 고려 대상이 될 수 있다. 
